import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentPurchase from "@/lib/models/document-purchase.model";
import DocumentBundle from "@/lib/models/document-bundle.model";
import DocumentModel from "@/lib/models/document.model";
import UserModel from "@/lib/models/user.model";

/**
 * GET /api/document-purchases
 * Get user's purchased documents and bundles
 */
export async function GET(request: Request) {
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

    // Get all purchases (pending, completed, rejected) so student can see status
    const purchases = await DocumentPurchase.find({
      userId: user._id,
    })
      .populate({
        path: "itemId",
        populate: {
          path: "documents uploadedBy",
          select: "firstName lastName picture title fileUrl fileName category",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ purchases });
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
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
