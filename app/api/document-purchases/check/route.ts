import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentPurchase from "@/lib/models/document-purchase.model";
import UserModel from "@/lib/models/user.model";

/**
 * GET /api/document-purchases/check?itemType=bundle&itemId=xxx
 * Check if user has purchased an item
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

    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get("itemType");
    const itemId = searchParams.get("itemId");

    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: "Missing itemType or itemId" },
        { status: 400 }
      );
    }

    const purchase = await DocumentPurchase.findOne({
      userId: user._id,
      itemType,
      itemId,
      paymentStatus: "completed",
    });

    return NextResponse.json({ hasPurchased: !!purchase, purchase });
  } catch (error: any) {
    console.error("Error checking purchase:", error);
    return NextResponse.json(
      { error: "Failed to check purchase" },
      { status: 500 }
    );
  }
}
