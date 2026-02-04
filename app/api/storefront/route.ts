import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentModel from "@/lib/models/document.model";
import DocumentBundle from "@/lib/models/document-bundle.model";
import DocumentPurchase from "@/lib/models/document-purchase.model";
import UserModel from "@/lib/models/user.model";
import { auth } from "@clerk/nextjs";
import "@/lib/models/user.model"; // Import to register User model for populate

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
    const parentFolder = searchParams.get("parentFolder"); // 'null' for root, folder ID for inside folder

    console.log("[Storefront API] Starting request with params:", { category, search, page, limit, sort, type, parentFolder });

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
    let allBundles: any[] = [];
    try {
      allBundles = await DocumentBundle.find({ isPublished: true })
        .select('documents')
        .lean();
      console.log("[Storefront API] Found bundles:", allBundles.length);
    } catch (bundleError: any) {
      console.error("[Storefront API] Error fetching bundles:", bundleError.message);
      // Continue without bundle filtering if bundles fail
      allBundles = [];
    }
    
    const bundledDocumentIds = allBundles
      .filter(bundle => bundle.documents && Array.isArray(bundle.documents))
      .flatMap(bundle => 
        bundle.documents.map((doc: any) => {
          try {
            return doc?.toString?.() || doc;
          } catch (e) {
            return null;
          }
        })
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
      
      // Filter by parent folder
      if (parentFolder === "null" || parentFolder === null) {
        bundleQuery.parentFolder = null; // Root level items
      } else if (parentFolder) {
        bundleQuery.parentFolder = parentFolder; // Items inside specific folder
      }
      
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
          .select("+isFolder +parentFolder +isAccessible +requiresFolderPurchase +parentFolderPrice")
          .sort({ isFolder: -1, ...sortQuery }) // Folders first
          .lean(),
        DocumentBundle.countDocuments(bundleQuery),
      ]);

      console.log("[Storefront API] Found bundles:", bdls.length);
      
      // Apply access control logic for students
      const { userId } = auth();
      let currentDbUser = null;
      let isInstructor = false;
      let purchasedBundleIds = new Set<string>();
      
      if (userId) {
        currentDbUser = await UserModel.findOne({ clerkId: userId }).lean();
        isInstructor = currentDbUser?.isAdmin === true;
        
        // For students, get their purchases
        if (!isInstructor && currentDbUser) {
          const userPurchases = await DocumentPurchase.find({
            userId: currentDbUser._id,
            itemType: "bundle",
            paymentStatus: "completed"
          }).lean();
          
          purchasedBundleIds = new Set(
            userPurchases.map(p => p.itemId.toString())
          );
        }
      }
      
      // Get parent folder data for access control
      const parentFolderIds = bdls
        .filter(b => b.parentFolder)
        .map(b => typeof b.parentFolder === 'string' ? b.parentFolder : (b.parentFolder as any).toString());
      
      const parentFolders = await DocumentBundle.find({
        _id: { $in: parentFolderIds }
      }).lean();
      
      const parentFolderMap = new Map(
        parentFolders.map(pf => [(pf._id as any).toString(), pf])
      );
      
      // Mark bundles with access control info
      bundles = bdls.map((bundle) => {
        let isAccessible = true;
        let requiresFolderPurchase = false;
        let parentFolderPrice = 0;
        
        // For students: Check if bundle is inside a paid folder
        if (!isInstructor && bundle.parentFolder && !bundle.isFolder) {
          const parentFolderId = typeof bundle.parentFolder === 'string' 
            ? bundle.parentFolder 
            : (bundle.parentFolder as any).toString();
          
          const parentFolder = parentFolderMap.get(parentFolderId);
          
          if (parentFolder && (parentFolder as any).price > 0) {
            // Parent folder is paid
            requiresFolderPurchase = true;
            parentFolderPrice = (parentFolder as any).price;
            // Only accessible if parent folder is purchased
            isAccessible = purchasedBundleIds.has(parentFolderId);
          }
        }
        
        return {
          ...bundle,
          itemType: "bundle",
          isPurchased: purchasedBundleIds.has((bundle._id as any).toString()),
          isAccessible,
          requiresFolderPurchase,
          parentFolderPrice,
        };
      });
      
      bundlesTotal = bdlsCount;
    }
    
    // Add folder metadata (child bundle count and preview)
    for (let i = 0; i < bundles.length; i++) {
      const bundle = bundles[i];
      // Check if this is a folder (has isFolder=true OR has no documents)
      if (bundle.isFolder || !bundle.documents || bundle.documents.length === 0) {
        try {
          // Count child bundles
          const childBundleCount = await DocumentBundle.countDocuments({
            parentFolder: bundle._id,
            isPublished: true
          });
          
          // Get preview of child bundles (first 5)
          const childBundles = await DocumentBundle.find({
            parentFolder: bundle._id,
            isPublished: true
          })
            .select('title documents')
            .limit(5)
            .lean();
          
          // Format child bundle preview
          const childBundlePreview = childBundles.map(cb => ({
            _id: (cb._id as any).toString(),
            title: cb.title,
            fileCount: (cb.documents && Array.isArray(cb.documents)) ? cb.documents.length : 0
          }));
          
          bundles[i] = {
            ...bundle,
            childBundleCount,
            childBundles: childBundlePreview
          };
        } catch (folderError) {
          console.error("[Storefront API] Error fetching folder metadata:", folderError);
          // Continue without folder metadata
          bundles[i] = {
            ...bundle,
            childBundleCount: 0,
            childBundles: []
          };
        }
      }
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
