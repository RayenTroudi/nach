import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentModel from "@/lib/models/document.model";
import UserModel from "@/lib/models/user.model";

// GET /api/documents/[id] - Get single document
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const document = await DocumentModel.findById(params.id)
      .populate("uploadedBy", "firstName lastName email")
      .lean();

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Update document (owner or admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const document = await DocumentModel.findById(params.id);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get current user
    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is owner or admin
    const clerkUser = await currentUser();
    const isAdmin = clerkUser?.publicMetadata?.isAdmin === true;
    const isOwner = document.uploadedBy.toString() === user._id.toString();

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to update this document" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, tags, isPublic, isForSale, price, currency } = body;

    // Update document
    const updatedDocument = await DocumentModel.findByIdAndUpdate(
      params.id,
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(tags && { tags }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isForSale !== undefined && { isForSale }),
        ...(price !== undefined && { price }),
        ...(currency && { currency }),
      },
      { new: true }
    )
      .populate("uploadedBy", "firstName lastName")
      .lean();

    return NextResponse.json({
      message: "Document updated successfully",
      document: updatedDocument,
    });
  } catch (error: any) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete document (owner or admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const document = await DocumentModel.findById(params.id);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get current user
    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is owner or admin
    const clerkUser = await currentUser();
    const isAdmin = clerkUser?.publicMetadata?.isAdmin === true;
    const isOwner = document.uploadedBy.toString() === user._id.toString();

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to delete this document" },
        { status: 403 }
      );
    }

    await DocumentModel.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: "Document deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
