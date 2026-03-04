import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentPurchase from "@/lib/models/document-purchase.model";
import DocumentBundle from "@/lib/models/document-bundle.model";
import DocumentModel from "@/lib/models/document.model";
import UserModel from "@/lib/models/user.model";
import { sendEmail } from "@/lib/actions/email.action";
import { getPaymentRequestToAdminEmail } from "@/lib/utils/email-templates";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "talel.jouini02@gmail.com";

/**
 * GET /api/document-purchases
 * Get user's purchased documents and bundles
 */
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Try to get auth, but don't fail if not authenticated
    let userId;
    try {
      const authResult = auth();
      userId = authResult.userId;
    } catch (error) {
      console.log("Auth check failed, continuing without user");
    }

    if (!userId) {
      return NextResponse.json({ 
        error: "Authentication required. Please sign in to view your purchases." 
      }, { status: 401 });
    }

    // Get user from database, create if doesn't exist
    let user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      // Get user details from Clerk
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ 
          error: "Authentication required. Please sign in to view your purchases." 
        }, { status: 401 });
      }

      // Create user in database
      user = await UserModel.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        picture: clerkUser.imageUrl || "",
        username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] || "",
      });
    }

    // Get all purchases (pending, completed, rejected) so student can see status
    const purchases = await DocumentPurchase.find({
      userId: user._id,
    })
      .populate({
        path: "itemId",
        populate: [
          {
            path: "documents",
            select: "title fileUrl fileName fileSize category",
          },
          {
            path: "uploadedBy",
            select: "firstName lastName picture",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    // For folders, also get child bundles with their documents
    const enrichedPurchases = await Promise.all(
      purchases.map(async (purchase: any) => {
        if (purchase.itemId && purchase.itemId.isFolder) {
          // Get child bundles for this folder
          const childBundles = await DocumentBundle.find({
            parentFolder: purchase.itemId._id,
            isPublished: true,
          })
            .populate("documents", "title fileUrl fileName fileSize category")
            .populate("uploadedBy", "firstName lastName picture")
            .lean();

          return {
            ...purchase,
            itemId: {
              ...purchase.itemId,
              childBundles,
            },
          };
        }
        return purchase;
      })
    );

    return NextResponse.json({ purchases: enrichedPurchases });
  } catch (error: any) {
    console.error("Error fetching purchased documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchased documents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/document-purchases
 * Create a document purchase
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Try to get auth
    let userId;
    let clerkUser;
    try {
      const authResult = auth();
      userId = authResult.userId;
      if (userId) {
        clerkUser = await currentUser();
      }
    } catch (error) {
      console.log("Auth check failed:", error);
    }

    if (!userId || !clerkUser) {
      return NextResponse.json({ 
        error: "Authentication required. Please sign in to make a purchase.",
        authError: true 
      }, { status: 401 });
    }

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

    const body = await request.json();
    const { itemType, itemId, proofUrl, amount, notes } = body;

    // Validate
    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if already purchased
    const existing = await DocumentPurchase.findOne({
      userId: user._id,
      itemType,
      itemId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Item already purchased or pending approval" },
        { status: 400 }
      );
    }

    // Get item details to get price
    let item: any;
    if (itemType === "bundle") {
      item = await DocumentBundle.findById(itemId);
    } else {
      item = await DocumentModel.findById(itemId);
    }

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Create purchase record
    const purchase = await DocumentPurchase.create({
      userId: user._id,
      itemType,
      itemModelName: itemType === "bundle" ? "DocumentBundle" : "Document",
      itemId,
      amount: amount || item.price || 0,
      currency: item.currency || "usd",
      paymentMethod: "bank_transfer",
      paymentStatus: (amount || item.price) > 0 ? "pending" : "completed",
      paymentProofUrl: proofUrl,
      notes: notes || "",
    });

    // Add purchase to item
    if (itemType === "bundle") {
      await DocumentBundle.findByIdAndUpdate(itemId, {
        $push: { purchases: purchase._id },
      });
    } else {
      await DocumentModel.findByIdAndUpdate(itemId, {
        $push: { purchases: purchase._id },
      });
    }

    const populatedPurchase = await DocumentPurchase.findById(purchase._id)
      .populate({
        path: "itemId",
        populate: { path: "documents uploadedBy" },
      })
      .lean();

    // Send notification email to admin if payment is pending
    if (purchase.paymentStatus === "pending" && proofUrl) {
      try {
        const itemName = item.title || "Document";
        
        const emailHtml = getPaymentRequestToAdminEmail({
          userName: `${user.firstName} ${user.lastName}`.trim() || user.username,
          userEmail: user.email,
          itemType: itemType as "document" | "bundle",
          itemNames: [itemName],
          amount: Number(amount || item.price || 0),
          paymentProofUrl: proofUrl,
          proofId: purchase._id.toString(),
          submittedAt: new Date(),
          userNotes: notes,
        });

        await sendEmail({
          to: ADMIN_EMAIL,
          subject: `🔔 New Document Purchase Request - ${user.firstName} ${user.lastName}`,
          html: emailHtml,
        });

        console.log("✅ Admin notification email sent to:", ADMIN_EMAIL);
      } catch (emailError) {
        console.error("❌ Error sending admin notification email:", emailError);
        // Continue even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Purchase created successfully",
      purchase: populatedPurchase,
    });
  } catch (error: any) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}
