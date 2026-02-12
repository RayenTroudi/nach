import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentBundle from "@/lib/models/document-bundle.model";
import UserModel from "@/lib/models/user.model";
import DocumentPurchase from "@/lib/models/document-purchase.model";

/**
 * GET /api/document-bundles
 * Get all document bundles (optionally filtered by instructor)
 * For students: Only show bundles they have access to based on purchases
 */
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get("instructorId");
    const isPublished = searchParams.get("isPublished");
    const parentFolder = searchParams.get("parentFolder"); // null for root, id for subfolder

    // Get current user to check if they're an instructor
    let currentDbUser = null;
    if (userId) {
      currentDbUser = await UserModel.findOne({ clerkId: userId }).lean();
    }
    const isInstructor = currentDbUser?.isAdmin === true;

    const query: any = {};
    if (instructorId) {
      query.uploadedBy = instructorId;
    }
    if (isPublished) {
      query.isPublished = isPublished === "true";
    }
    // Filter by parent folder (null for root items)
    if (parentFolder === "null" || parentFolder === null) {
      query.parentFolder = null;
    } else if (parentFolder) {
      query.parentFolder = parentFolder;
    }

    let bundles = await DocumentBundle.find(query)
      .populate("uploadedBy", "firstName lastName picture")
      .populate("documents")
      .populate({
        path: "parentFolder",
        select: "title price currency isFolder"
      })
      .select("+isFolder +parentFolder") // Explicitly select these fields
      .sort({ isFolder: -1, createdAt: -1 }) // Folders first, then by date
      .lean();

    // For students: Filter bundles based on purchases
    if (!isInstructor && userId && currentDbUser) {
      // Get all bundle purchases for this user
      const userPurchases = await DocumentPurchase.find({
        userId: currentDbUser._id,
        itemType: "bundle",
        paymentStatus: "completed"
      }).lean();

      const purchasedBundleIds = new Set(
        userPurchases.map(p => p.itemId.toString())
      );

      // Get parent folder data for all bundles that have parents
      const parentFolderIds = bundles
        .filter(b => b.parentFolder)
        .map(b => typeof b.parentFolder === 'string' ? b.parentFolder : b.parentFolder.toString());
      
      const parentFolders = await DocumentBundle.find({
        _id: { $in: parentFolderIds }
      }).lean();
      
      const parentFolderMap = new Map(
        parentFolders.map((pf: any) => [pf._id.toString(), pf])
      );

      // Filter bundles
      bundles = bundles.filter(bundle => {
        // For folders: Show free folders always, paid folders only if purchased
        if (bundle.isFolder) {
          if (bundle.price === 0) return true;
          return purchasedBundleIds.has((bundle._id as any).toString());
        }

        // For bundles (not folders):
        // Always show bundles so students can preview what's in the folder
        // But mark them as locked if parent folder is paid and not purchased
        return true;
      });

      // Mark bundles as purchased/locked for UI
      bundles = bundles.map(bundle => {
        const bundleId = (bundle._id as any).toString();
        let isAccessible = true;
        let requiresFolderPurchase = false;
        let parentFolderPrice = 0;

        // Check if bundle is inside a paid folder
        if (bundle.parentFolder && !bundle.isFolder) {
          const parentFolderId = typeof bundle.parentFolder === 'string' 
            ? bundle.parentFolder 
            : bundle.parentFolder.toString();
          
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
          isPurchased: purchasedBundleIds.has(bundleId),
          isAccessible, // Can the user access the files?
          requiresFolderPurchase, // Is this locked behind a folder purchase?
          parentFolderPrice, // Price of parent folder if locked
        };
      });
    }

    console.log('API returning bundles:', bundles.map(b => ({ 
      title: b.title, 
      isFolder: b.isFolder,
      parentFolder: b.parentFolder,
      price: b.price
    })));

    return NextResponse.json({ bundles });
  } catch (error: any) {
    console.error("Error fetching document bundles:", error);
    return NextResponse.json(
      { error: "Failed to fetch document bundles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/document-bundles
 * Create a new document bundle
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create user in database
    let user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      user = await UserModel.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress,
        photo: clerkUser.imageUrl,
      });
    }

    // Check if user is admin/instructor
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "Only instructors can create document bundles" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      currency,
      category,
      tags,
      thumbnail,
      documentIds,
      isPublished,
      parentFolder,
      isFolder,
    } = body;

    // Validation
    if (!title || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If it's not a folder, require documents
    if (!isFolder && (!documentIds || documentIds.length === 0)) {
      return NextResponse.json(
        { error: "Document bundles must contain at least one document" },
        { status: 400 }
      );
    }

    // Create bundle
    const bundle = await DocumentBundle.create({
      title,
      description,
      price: price || 0,
      currency: currency || "usd",
      category,
      tags: tags || [],
      thumbnail,
      documents: documentIds || [],
      uploadedBy: user._id,
      isPublished: isPublished !== undefined ? isPublished : true,
      parentFolder: parentFolder || null,
      isFolder: isFolder || false,
    });

    const populatedBundle = await DocumentBundle.findById(bundle._id)
      .populate("uploadedBy", "firstName lastName picture")
      .populate("documents")
      .lean();

    return NextResponse.json({
      message: "Document bundle created successfully",
      bundle: populatedBundle,
    });
  } catch (error: any) {
    console.error("Error creating document bundle:", error);
    return NextResponse.json(
      { error: "Failed to create document bundle" },
      { status: 500 }
    );
  }
}
