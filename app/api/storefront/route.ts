import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentModel from "@/lib/models/document.model";
import DocumentBundle from "@/lib/models/document-bundle.model";

/**
 * GET /api/storefront
 * Get all published documents and bundles for sale on the homepage/storefront
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sort = searchParams.get("sort") || "newest"; // newest, price-low, price-high, title
    const type = searchParams.get("type"); // 'document', 'bundle', or null for both

    await connectToDatabase();

    // Build sort query
    let sortQuery: any = {};
    switch (sort) {
      case "price-low":
        sortQuery = { price: 1, createdAt: -1 };
        break;
      case "price-high":
        sortQuery = { price: -1, createdAt: -1 };
        break;
      case "title":
        sortQuery = { title: 1 };
        break;
      case "newest":
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    // Fetch documents if type is null or 'document'
    let documents: any[] = [];
    let documentsTotal = 0;
    if (!type || type === "document") {
      const docQuery: any = { isPublic: true, isForSale: true };
      
      if (category && category !== "All") {
        docQuery.category = category;
      }
      
      if (search) {
        docQuery.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      const [docs, docsCount] = await Promise.all([
        DocumentModel.find(docQuery)
          .populate("uploadedBy", "firstName lastName picture")
          .sort(sortQuery)
          .lean(),
        DocumentModel.countDocuments(docQuery),
      ]);

      documents = docs.map((doc) => ({ ...doc, itemType: "document" }));
      documentsTotal = docsCount;
    }

    // Fetch bundles if type is null or 'bundle'
    let bundles: any[] = [];
    let bundlesTotal = 0;
    if (!type || type === "bundle") {
      const bundleQuery: any = { isPublished: true };
      
      if (category && category !== "All") {
        bundleQuery.category = category;
      }
      
      if (search) {
        bundleQuery.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      const [bdls, bdlsCount] = await Promise.all([
        DocumentBundle.find(bundleQuery)
          .populate("uploadedBy", "firstName lastName picture")
          .populate("documents", "title fileName fileType")
          .sort(sortQuery)
          .lean(),
        DocumentBundle.countDocuments(bundleQuery),
      ]);

      bundles = bdls.map((bundle) => ({ ...bundle, itemType: "bundle" }));
      bundlesTotal = bdlsCount;
    }

    // Combine and sort
    let items = [...documents, ...bundles];
    
    // Re-sort combined items
    switch (sort) {
      case "price-low":
        items.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        items.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "title":
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
      default:
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Apply pagination to combined results
    const total = documentsTotal + bundlesTotal;
    const totalPages = Math.ceil(total / limit);
    const paginatedItems = items.slice(skip, skip + limit);

    return NextResponse.json({
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        documentsCount: documentsTotal,
        bundlesCount: bundlesTotal,
      },
    });
  } catch (error: any) {
    console.error("Error fetching storefront items:", error);
    return NextResponse.json(
      { error: "Failed to fetch storefront items" },
      { status: 500 }
    );
  }
}
