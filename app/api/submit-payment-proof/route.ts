import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import PaymentProof from "@/lib/models/payment-proof.model";
import User from "@/lib/models/user.model";

export async function POST(request: Request) {
  console.log("🔵 Submit payment proof API called");
  
  try {
    const { userId: clerkId } = auth();
    console.log("🔵 Clerk ID:", clerkId);

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get user from database
    let user = await User.findOne({ clerkId });
    console.log("🔵 User found in DB:", user ? "✅" : "❌");
    
    // If user doesn't exist in MongoDB, sync from Clerk
    if (!user) {
      console.log("🔵 User not in DB, syncing from Clerk...");
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return NextResponse.json(
          { success: false, error: "Could not fetch user from Clerk" },
          { status: 404 }
        );
      }

      // Create user in MongoDB
      const mongoUser = {
        clerkId: clerkUser.id,
        firstName: clerkUser.firstName || clerkUser.username || "User",
        lastName: clerkUser.lastName || "User", // Provide default if empty
        username: clerkUser.username || `${clerkUser.firstName || "User"}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ""}`,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        picture: clerkUser.imageUrl || "",
      };

      user = await User.create(mongoUser);
      console.log("🔵 User synced to DB: ✅");
    }

    const body = await request.json();
    console.log("🔵 Request body:", body);
    
    const { proofUrl, courseIds, amount, notes } = body;

    // Validate required fields
    if (!proofUrl || !courseIds || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate courseIds is an array
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid course IDs" },
        { status: 400 }
      );
    }

    // Determine file type from URL
    const fileExtension = proofUrl.split('.').pop()?.toLowerCase() || '';
    let fileType = 'application/octet-stream';
    
    if (['jpg', 'jpeg'].includes(fileExtension)) {
      fileType = 'image/jpeg';
    } else if (fileExtension === 'png') {
      fileType = 'image/png';
    } else if (fileExtension === 'webp') {
      fileType = 'image/webp';
    } else if (fileExtension === 'pdf') {
      fileType = 'application/pdf';
    }

    // Create database record
    const paymentProof = await PaymentProof.create({
      userId: user._id,
      courseIds: courseIds,
      amount: Number(amount),
      proofUrl: proofUrl,
      fileName: proofUrl.split('/').pop() || 'payment-proof',
      fileType: fileType,
      fileSize: 0, // UploadThing doesn't provide size in callback
      status: "pending",
      notes: notes || "",
      uploadedAt: new Date(),
    });

    console.log("🔵 Payment proof created successfully:", paymentProof._id);

    return NextResponse.json({
      success: true,
      data: {
        proofId: paymentProof._id,
        status: paymentProof.status,
        uploadedAt: paymentProof.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error("🔴 Error submitting payment proof:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit payment proof",
      },
      { status: 500 }
    );
  }
}
