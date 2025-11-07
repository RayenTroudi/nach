import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DocumentModel from "@/lib/models/document.model";
import UserModel from "@/lib/models/user.model";

// GET /api/documents - List all documents (with filtering)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "newest"; // newest, downloads, title

    await connectToDatabase();

    // Build query
    const query: any = { isPublic: true };
    
    if (category && category !== "All") {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case "downloads":
        sortQuery = { downloads: -1 };
        break;
      case "title":
        sortQuery = { title: 1 };
        break;
      case "newest":
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .populate("uploadedBy", "firstName lastName")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      DocumentModel.countDocuments(query),
    ]);

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create new document (instructors only)
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get or create user in database
    let user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      user = await UserModel.create({
        clerkId: clerkUser.id,
        firstName: clerkUser.firstName || "User",
        lastName: clerkUser.lastName || "User",
        email: clerkUser.emailAddresses[0]?.emailAddress,
        username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress,
        photo: clerkUser.imageUrl,
      });
    }

    // Check if user is admin/instructor
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "Only instructors can upload documents" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      category,
      tags,
      isPublic = true,
    } = body;

    // Validation
    if (!title || !fileUrl || !fileName || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, fileUrl, fileName, category" },
        { status: 400 }
      );
    }

    // Validate file type is PDF
    if (fileType && !fileType.includes("pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file extension is .pdf
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "File must have .pdf extension" },
        { status: 400 }
      );
    }

    // Create document
    const document = await DocumentModel.create({
      title,
      description,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      category,
      tags: tags || [],
      uploadedBy: user._id,
      isPublic,
      downloads: 0,
    });

    const populatedDocument = await DocumentModel.findById(document._id)
      .populate("uploadedBy", "firstName lastName")
      .lean();

    return NextResponse.json({
      message: "Document created successfully",
      document: populatedDocument,
    });
  } catch (error: any) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
