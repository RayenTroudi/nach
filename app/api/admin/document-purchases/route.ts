import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentPurchase from "@/lib/models/document-purchase.model";
import UserModel from "@/lib/models/user.model";
import "@/lib/models/document.model";
import "@/lib/models/document-bundle.model";

/**
 * GET /api/admin/document-purchases
 * Get all document purchases for admin review
 */
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserModel.findOne({ clerkId: userId });
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    // Get all purchases, sorted by most recent first
    const purchases = await DocumentPurchase.find({})
      .populate("userId", "firstName lastName email picture")
      .populate("reviewedBy", "firstName lastName email")
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

    return NextResponse.json({ purchases });
  } catch (error: any) {
    console.error("Error fetching document purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch document purchases" },
      { status: 500 }
    );
  }
}
