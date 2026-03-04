"use server";

import { connectToDatabase } from "../mongoose";
import DocumentPurchase from "../models/document-purchase.model";
import DocumentBundle from "../models/document-bundle.model";
import DocumentModel from "../models/document.model";
import { getUserByClerkId } from "./user.action";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Create a document purchase record
 * If purchasing a folder, also grants access to all child bundles
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
      itemModelName: params.itemType === "bundle" ? "DocumentBundle" : "Document",
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
      
      // Check if this is a folder purchase
      const bundle = await DocumentBundle.findById(params.itemId).lean();
      if (bundle && bundle.isFolder) {
        console.log(`[Purchase] Folder purchased: ${bundle.title}, granting access to child bundles...`);
        
        // Find all child bundles in this folder
        const childBundles = await DocumentBundle.find({
          parentFolder: params.itemId,
          isPublished: true
        }).lean();
        
        console.log(`[Purchase] Found ${childBundles.length} child bundles to grant access`);
        
        // Create purchase records for each child bundle
        for (const childBundle of childBundles) {
          try {
            // Check if already purchased
            const existingChildPurchase = await DocumentPurchase.findOne({
              userId: user._id,
              itemType: "bundle",
              itemId: childBundle._id,
            });
            
            if (!existingChildPurchase) {
              const childPurchase = await DocumentPurchase.create({
                userId: user._id,
                itemType: "bundle",
                itemModelName: "DocumentBundle",
                itemId: childBundle._id,
                amount: 0, // Child bundles are granted, not purchased directly
                currency: params.currency,
                paymentMethod: params.paymentMethod || "bank_transfer",
                paymentStatus: "completed",
                notes: `Granted via folder purchase: ${bundle.title}`,
              });
              
              await DocumentBundle.findByIdAndUpdate(childBundle._id, {
                $push: { purchases: childPurchase._id },
              });
              
              console.log(`[Purchase] Granted access to child bundle: ${childBundle.title}`);
            }
          } catch (childError: any) {
            console.error(`[Purchase] Error granting access to child bundle ${childBundle.title}:`, childError.message);
            // Continue with other bundles even if one fails
          }
        }
        
        console.log(`[Purchase] Completed granting access to all child bundles`);
      }
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
 * For bundles inside folders, also checks if parent folder was purchased
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

    // Check direct purchase
    const purchase = await DocumentPurchase.findOne({
      userId: user._id,
      itemType: params.itemType,
      itemId: params.itemId,
      paymentStatus: "completed",
    });

    if (purchase) return true;

    // If checking a bundle, also check if parent folder was purchased
    if (params.itemType === "bundle") {
      const bundle = await DocumentBundle.findById(params.itemId).lean();
      
      if (bundle && bundle.parentFolder) {
        // Check if parent folder was purchased
        const folderPurchase = await DocumentPurchase.findOne({
          userId: user._id,
          itemType: "bundle",
          itemId: bundle.parentFolder,
          paymentStatus: "completed",
        });
        
        if (folderPurchase) return true;
      }
    }

    return false;
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

/**
 * Get all accessible bundle IDs for a user
 * Includes bundles purchased directly and bundles granted via folder purchases
 */
export async function getUserAccessibleBundleIds(): Promise<string[]> {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) return [];

    const user = await getUserByClerkId({ clerkId: userId });

    // Get all bundle purchases (including those granted via folder purchase)
    const purchases = await DocumentPurchase.find({
      userId: user._id,
      itemType: "bundle",
      paymentStatus: "completed",
    }).lean();

    const accessibleBundleIds = new Set(
      purchases.map(p => p.itemId.toString())
    );

    return Array.from(accessibleBundleIds);
  } catch (error: any) {
    console.error("Get accessible bundle IDs error:", error);
    return [];
  }
}
