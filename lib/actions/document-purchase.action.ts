"use server";

import { connectToDatabase } from "../mongoose";
import DocumentPurchase from "../models/document-purchase.model";
import DocumentBundle from "../models/document-bundle.model";
import DocumentModel from "../models/document.model";
import { getUserByClerkId } from "./user.action";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

/**
 * Create a document purchase record
 */
export async function createDocumentPurchase(params: {
  itemType: "document" | "bundle";
  itemId: string;
  amount: number;
  currency: string;
  paymentMethod?: "stripe" | "bank_transfer";
  paymentStatus?: "pending" | "completed" | "rejected";
  paymentProofUrl?: string;
  path?: string;
}) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await getUserByClerkId({ clerkId: userId });

    // Check if already purchased
    const existing = await DocumentPurchase.findOne({
      userId: user._id,
      itemType: params.itemType,
      itemId: params.itemId,
    });

    if (existing) {
      throw new Error("Item already purchased");
    }

    const purchase = await DocumentPurchase.create({
      userId: user._id,
      itemType: params.itemType,
      itemId: params.itemId,
      amount: params.amount,
      currency: params.currency,
      paymentMethod: params.paymentMethod || "bank_transfer",
      paymentStatus: params.paymentStatus || "completed",
      paymentProofUrl: params.paymentProofUrl,
    });

    // Add purchase to the item's purchases array
    if (params.itemType === "bundle") {
      await DocumentBundle.findByIdAndUpdate(params.itemId, {
        $push: { purchases: purchase._id },
      });
    } else {
      await DocumentModel.findByIdAndUpdate(params.itemId, {
        $push: { purchases: purchase._id },
      });
    }

    if (params.path) {
      revalidatePath(params.path);
    }

    return JSON.parse(JSON.stringify(purchase));
  } catch (error: any) {
    console.error("Create document purchase error:", error);
    throw new Error(error.message);
  }
}

/**
 * Get user's purchased documents and bundles
 */
export async function getUserPurchasedDocuments() {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await getUserByClerkId({ clerkId: userId });

    const purchases = await DocumentPurchase.find({
      userId: user._id,
      paymentStatus: "completed",
    })
      .populate({
        path: "itemId",
        populate: {
          path: "documents uploadedBy",
          select: "firstName lastName picture title fileUrl fileName",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(purchases));
  } catch (error: any) {
    console.error("Get user purchased documents error:", error);
    throw new Error(error.message);
  }
}

/**
 * Check if user has purchased an item
 */
export async function hasUserPurchased(params: {
  itemType: "document" | "bundle";
  itemId: string;
}) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) return false;

    const user = await getUserByClerkId({ clerkId: userId });

    const purchase = await DocumentPurchase.findOne({
      userId: user._id,
      itemType: params.itemType,
      itemId: params.itemId,
      paymentStatus: "completed",
    });

    return !!purchase;
  } catch (error: any) {
    console.error("Check purchase error:", error);
    return false;
  }
}

/**
 * Get all purchases for admin/instructor
 */
export async function getDocumentPurchases(instructorId?: string) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await getUserByClerkId({ clerkId: userId });
    if (!user.isAdmin) throw new Error("Unauthorized");

    let query: any = {};
    
    if (instructorId) {
      // Get bundles/documents created by this instructor
      const bundles = await DocumentBundle.find({ uploadedBy: instructorId }).select("_id");
      const documents = await DocumentModel.find({ uploadedBy: instructorId, isForSale: true }).select("_id");
      
      const itemIds = [
        ...bundles.map(b => b._id.toString()),
        ...documents.map(d => d._id.toString()),
      ];

      query.itemId = { $in: itemIds };
    }

    const purchases = await DocumentPurchase.find(query)
      .populate("userId", "firstName lastName email picture")
      .populate({
        path: "itemId",
        populate: { path: "uploadedBy", select: "firstName lastName" },
      })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(purchases));
  } catch (error: any) {
    console.error("Get document purchases error:", error);
    throw new Error(error.message);
  }
}
