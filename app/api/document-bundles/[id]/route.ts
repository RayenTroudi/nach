import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentBundle from "@/lib/models/document-bundle.model";
import UserModel from "@/lib/models/user.model";

/**
 * GET /api/document-bundles/[id]
 * Get a single document bundle
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const bundle = await DocumentBundle.findById(params.id)
      .populate("uploadedBy", "firstName lastName email picture")
      .populate("documents")
      .lean();

    if (!bundle) {
      return NextResponse.json(
        { error: "Bundle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ bundle });
  } catch (error: any) {
    console.error("Error fetching document bundle:", error);
    return NextResponse.json(
      { error: "Failed to fetch document bundle" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/document-bundles/[id]
 * Update a document bundle
 */
export async function PUT(
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

    const bundle = await DocumentBundle.findById(params.id);
    if (!bundle) {
      return NextResponse.json(
        { error: "Bundle not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (bundle.uploadedBy.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const updates: any = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.price !== undefined) updates.price = body.price;
    if (body.currency !== undefined) updates.currency = body.currency;
    if (body.category !== undefined) updates.category = body.category;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.thumbnail !== undefined) updates.thumbnail = body.thumbnail;
    if (body.documentIds !== undefined) updates.documents = body.documentIds;
    if (body.isPublished !== undefined) updates.isPublished = body.isPublished;

    const updatedBundle = await DocumentBundle.findByIdAndUpdate(
      params.id,
      updates,
      { new: true }
    )
      .populate("uploadedBy", "firstName lastName picture")
      .populate("documents");

    return NextResponse.json({
      message: "Bundle updated successfully",
      bundle: updatedBundle,
    });
  } catch (error: any) {
    console.error("Error updating document bundle:", error);
    return NextResponse.json(
      { error: "Failed to update document bundle" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/document-bundles/[id]
 * Delete a document bundle
 */
export async function DELETE(
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

    const bundle = await DocumentBundle.findById(params.id);
    if (!bundle) {
      return NextResponse.json(
        { error: "Bundle not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (bundle.uploadedBy.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await DocumentBundle.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: "Bundle deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting document bundle:", error);
    return NextResponse.json(
      { error: "Failed to delete document bundle" },
      { status: 500 }
    );
  }
}
