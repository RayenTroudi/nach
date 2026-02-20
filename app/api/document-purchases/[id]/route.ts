import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentPurchase from "@/lib/models/document-purchase.model";
import UserModel from "@/lib/models/user.model";
import DocumentModel from "@/lib/models/document.model";
import DocumentBundle from "@/lib/models/document-bundle.model";
import { sendEmail } from "@/lib/actions/email.action";
import { 
  getPaymentApprovedToUserEmail, 
  getPaymentRejectedToUserEmail 
} from "@/lib/utils/email-templates";

export const dynamic = "force-dynamic";

/**
 * GET /api/document-purchases/[id]
 * Get a specific purchase by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const purchase = await DocumentPurchase.findById(params.id)
      .populate({
        path: "userId",
        select: "firstName lastName email picture",
      })
      .populate({
        path: "itemId",
        populate: {
          path: "documents uploadedBy",
          select: "firstName lastName picture title fileUrl fileName category",
        },
      })
      .lean() as any;

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    // Only the purchaser, instructor, or admin can view
    const purchaseUserId = typeof purchase.userId === 'object' && purchase.userId !== null 
      ? purchase.userId._id.toString() 
      : purchase.userId.toString();
    const isOwner = purchaseUserId === user._id.toString();
    const isAdmin = user.isAdmin;
    const isInstructor = user.createdCourses && user.createdCourses.length > 0;

    if (!isOwner && !isAdmin && !isInstructor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ purchase });
  } catch (error: any) {
    console.error("Error fetching purchase:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/document-purchases/[id]
 * Update purchase status (admin/instructor only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only admin or instructor can update status
    const isInstructor = user.createdCourses && user.createdCourses.length > 0;
    if (!user.isAdmin && !isInstructor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { paymentStatus, adminNotes } = body;

    if (!paymentStatus || !['completed', 'rejected'].includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Payment status must be 'completed' or 'rejected'" },
        { status: 400 }
      );
    }

    const purchase = await DocumentPurchase.findById(params.id);
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    // Update payment status and admin info
    purchase.paymentStatus = paymentStatus;
    purchase.adminNotes = adminNotes || "";
    purchase.reviewedBy = user._id;
    purchase.reviewedAt = new Date();
    await purchase.save();

    // If approved, grant access to the user
    if (paymentStatus === "completed") {
      const purchaseUser = await UserModel.findById(purchase.userId);
      if (purchaseUser) {
        if (purchase.itemType === "document") {
          if (!purchaseUser.purchasedDocuments) {
            purchaseUser.purchasedDocuments = [];
          }
          if (!purchaseUser.purchasedDocuments.includes(purchase.itemId)) {
            purchaseUser.purchasedDocuments.push(purchase.itemId);
          }
        } else if (purchase.itemType === "bundle") {
          if (!purchaseUser.purchasedDocumentBundles) {
            purchaseUser.purchasedDocumentBundles = [];
          }
          if (!purchaseUser.purchasedDocumentBundles.includes(purchase.itemId)) {
            purchaseUser.purchasedDocumentBundles.push(purchase.itemId);
          }
        }
        await purchaseUser.save();

        // Send approval email
        try {
          let itemName = "Document";
          if (purchase.itemType === "document") {
            const doc = await DocumentModel.findById(purchase.itemId).select("title");
            itemName = doc?.title || "Document";
          } else if (purchase.itemType === "bundle") {
            const bundle = await DocumentBundle.findById(purchase.itemId).select("title");
            itemName = bundle?.title || "Document Bundle";
          }

          const accessUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/student/my-documents`;

          const emailHtml = getPaymentApprovedToUserEmail({
            userName: purchaseUser.firstName || purchaseUser.username,
            itemType: purchase.itemType as "document" | "bundle",
            itemNames: [itemName],
            amount: purchase.amount || 0,
            accessUrl,
            adminNotes,
          });

          await sendEmail({
            to: purchaseUser.email,
            subject: "✅ Payment Approved - Document Access Granted",
            html: emailHtml,
          });

          console.log("✅ Approval email sent to user:", purchaseUser.email);
        } catch (emailError) {
          console.error("❌ Error sending approval email:", emailError);
        }
      }
    }

    // If rejected, send notification email
    if (paymentStatus === "rejected") {
      try {
        const purchaseUser = await UserModel.findById(purchase.userId);
        if (purchaseUser) {
          let itemName = "Document";
          if (purchase.itemType === "document") {
            const doc = await DocumentModel.findById(purchase.itemId).select("title");
            itemName = doc?.title || "Document";
          } else if (purchase.itemType === "bundle") {
            const bundle = await DocumentBundle.findById(purchase.itemId).select("title");
            itemName = bundle?.title || "Document Bundle";
          }

          const resubmitUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/documents`;

          const emailHtml = getPaymentRejectedToUserEmail({
            userName: purchaseUser.firstName || purchaseUser.username,
            itemType: purchase.itemType as "document" | "bundle",
            itemNames: [itemName],
            amount: purchase.amount || 0,
            adminNotes,
            resubmitUrl,
          });

          await sendEmail({
            to: purchaseUser.email,
            subject: "⚠️ Payment Review Required - Action Needed",
            html: emailHtml,
          });

          console.log("✅ Rejection email sent to user:", purchaseUser.email);
        }
      } catch (emailError) {
        console.error("❌ Error sending rejection email:", emailError);
      }
    }

    const updatedPurchase = await DocumentPurchase.findById(purchase._id)
      .populate({
        path: "userId",
        select: "firstName lastName email picture",
      })
      .populate({
        path: "reviewedBy",
        select: "firstName lastName email",
      })
      .populate({
        path: "itemId",
        populate: { path: "documents uploadedBy" },
      })
      .lean();

    return NextResponse.json({
      success: true,
      message: "Purchase updated successfully",
      purchase: updatedPurchase,
    });
  } catch (error: any) {
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { error: "Failed to update purchase" },
      { status: 500 }
    );
  }
}
