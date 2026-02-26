"use server";

import { connectToDatabase } from "@/lib/mongoose";
import DocumentPurchase from "@/lib/models/document-purchase.model";

export async function getDocumentPurchases() {
  try {
    await connectToDatabase();

    const purchases = await DocumentPurchase.find({})
      .populate("userId", "firstName lastName email picture")
      .populate({
        path: "itemId",
        select: "title description category uploadedBy",
        populate: {
          path: "uploadedBy",
          select: "firstName lastName",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Convert MongoDB _id to string and dates to ISO strings
    const serializedPurchases = (purchases as any[]).map((purchase: any) => ({
      ...purchase,
      _id: purchase._id.toString(),
      userId: purchase.userId ? {
        ...purchase.userId,
        _id: purchase.userId._id.toString(),
      } : null,
      itemId: purchase.itemId ? {
        ...purchase.itemId,
        _id: purchase.itemId._id.toString(),
      } : null,
      createdAt: purchase.createdAt.toISOString(),
      updatedAt: purchase.updatedAt ? purchase.updatedAt.toISOString() : null,
    }));

    return { success: true, data: serializedPurchases };
  } catch (error: any) {
    console.error("Error fetching document purchases:", error);
    return { success: false, error: error.message || "Failed to fetch document purchases" };
  }
}

export async function approveDocumentPurchase(purchaseId: string) {
  try {
    await connectToDatabase();

    const updatedPurchase = await DocumentPurchase.findByIdAndUpdate(
      purchaseId,
      {
        paymentStatus: "completed",
        approvedAt: new Date(),
      },
      { new: true }
    ).lean() as any;

    if (!updatedPurchase) {
      return { success: false, error: "Purchase not found" };
    }

    return { 
      success: true, 
      data: {
        ...updatedPurchase,
        _id: updatedPurchase._id.toString(),
        createdAt: updatedPurchase.createdAt.toISOString(),
        updatedAt: updatedPurchase.updatedAt ? updatedPurchase.updatedAt.toISOString() : null,
      }
    };
  } catch (error: any) {
    console.error("Error approving purchase:", error);
    return { success: false, error: error.message || "Failed to approve purchase" };
  }
}

export async function rejectDocumentPurchase(purchaseId: string, adminNotes: string) {
  try {
    if (!adminNotes.trim()) {
      return { success: false, error: "Please provide a reason for rejection" };
    }

    await connectToDatabase();

    const updatedPurchase = await DocumentPurchase.findByIdAndUpdate(
      purchaseId,
      {
        paymentStatus: "rejected",
        adminNotes,
        rejectedAt: new Date(),
      },
      { new: true }
    ).lean() as any;

    if (!updatedPurchase) {
      return { success: false, error: "Purchase not found" };
    }

    return { 
      success: true, 
      data: {
        ...updatedPurchase,
        _id: updatedPurchase._id.toString(),
        createdAt: updatedPurchase.createdAt.toISOString(),
        updatedAt: updatedPurchase.updatedAt ? updatedPurchase.updatedAt.toISOString() : null,
      }
    };
  } catch (error: any) {
    console.error("Error rejecting purchase:", error);
    return { success: false, error: error.message || "Failed to reject purchase" };
  }
}
