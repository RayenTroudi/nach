import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentPurchase from "@/lib/models/document-purchase.model";
import UserModel from "@/lib/models/user.model";

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
    const isInstructor = user.role === "instructor";

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
    if (!user.isAdmin && user.role !== "instructor") {
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
