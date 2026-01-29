import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentBundle from "@/lib/models/document-bundle.model";
import UserModel from "@/lib/models/user.model";

/**
 * GET /api/document-bundles
 * Get all document bundles (optionally filtered by instructor)
 */
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get("instructorId");
    const isPublished = searchParams.get("isPublished");

    const query: any = {};
    if (instructorId) {
      query.uploadedBy = instructorId;
    }
    if (isPublished) {
      query.isPublished = isPublished === "true";
    }

    const bundles = await DocumentBundle.find(query)
      .populate("uploadedBy", "firstName lastName picture")
      .populate("documents")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bundles });
  } catch (error: any) {
    console.error("Error fetching document bundles:", error);
    return NextResponse.json(
      { error: "Failed to fetch document bundles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/document-bundles
 * Create a new document bundle
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create user in database
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

    // Check if user is admin/instructor
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "Only instructors can create document bundles" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      currency,
      category,
      tags,
      thumbnail,
      documentIds,
      isPublished,
    } = body;

    // Validation
    if (!title || !category || !documentIds || documentIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create bundle
    const bundle = await DocumentBundle.create({
      title,
      description,
      price: price || 0,
      currency: currency || "usd",
      category,
      tags: tags || [],
      thumbnail,
      documents: documentIds,
      uploadedBy: user._id,
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    const populatedBundle = await DocumentBundle.findById(bundle._id)
      .populate("uploadedBy", "firstName lastName picture")
      .populate("documents")
      .lean();

    return NextResponse.json({
      message: "Document bundle created successfully",
      bundle: populatedBundle,
    });
  } catch (error: any) {
    console.error("Error creating document bundle:", error);
    return NextResponse.json(
      { error: "Failed to create document bundle" },
      { status: 500 }
    );
  }
}
