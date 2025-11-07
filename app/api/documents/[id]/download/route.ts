import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentModel from "@/lib/models/document.model";

// POST /api/documents/[id]/download - Increment download counter
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const document = await DocumentModel.findByIdAndUpdate(
      params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Download counted",
      downloads: document.downloads,
    });
  } catch (error: any) {
    console.error("Error tracking download:", error);
    return NextResponse.json(
      { error: "Failed to track download" },
      { status: 500 }
    );
  }
}
