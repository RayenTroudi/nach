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

    console.log("[Storefront API] Starting request with params:", { category, search, page, limit, sort, type });

    await connectToDatabase();
    console.log("[Storefront API] Database connected");

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

    // First, fetch bundles to get all document IDs that are part of bundles
    console.log("[Storefront API] Fetching bundles...");
    const allBundles = await DocumentBundle.find({ isPublished: true })
      .select('documents')
      .lean();
    
    console.log("[Storefront API] Found bundles:", allBundles.length);
    
    const bundledDocumentIds = allBundles
      .filter(bundle => bundle.documents && Array.isArray(bundle.documents))
      .flatMap(bundle => 
        bundle.documents.map((doc: any) => doc?.toString?.() || doc)
      )
      .filter(id => id); // Remove any null/undefined values
    
    console.log("[Storefront API] Bundled document IDs:", bundledDocumentIds.length);

    // Fetch documents if type is null or 'document'
    let documents: any[] = [];
    let documentsTotal = 0;
    if (!type || type === "document") {
      // Show all public documents (both free and for sale) that are NOT part of any bundle
      const docQuery: any = { 
        isPublic: true
      };
      
      // Only add $nin filter if there are bundled documents
      if (bundledDocumentIds.length > 0) {
        docQuery._id = { $nin: bundledDocumentIds };
      }
      
      console.log("[Storefront API] Document query:", JSON.stringify(docQuery));
      
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

      console.log("[Storefront API] Found documents:", docs.length);
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

      console.log("[Storefront API] Bundle query:", JSON.stringify(bundleQuery));
      const [bdls, bdlsCount] = await Promise.all([
        DocumentBundle.find(bundleQuery)
          .populate("uploadedBy", "firstName lastName picture")
          .populate("documents", "title fileName fileType")
          .sort(sortQuery)
          .lean(),
        DocumentBundle.countDocuments(bundleQuery),
      ]);

      console.log("[Storefront API] Found bundles:", bdls.length);
      bundles = bdls.map((bundle) => ({ ...bundle, itemType: "bundle" }));
      bundlesTotal = bdlsCount;
    }

    // Combine and sort
    let items = [...documents, ...bundles];
    console.log("[Storefront API] Total items before pagination:", items.length);
    
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

    console.log("[Storefront API] Returning:", { paginatedItems: paginatedItems.length, total, totalPages });
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
    console.error("[Storefront API] ERROR:", error);
    console.error("[Storefront API] ERROR Stack:", error.stack);
    console.error("[Storefront API] ERROR Message:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch storefront items", details: error.message },
      { status: 500 }
    );
  }
}
