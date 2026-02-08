import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import PaymentProof from "@/lib/models/payment-proof.model";
import User from "@/lib/models/user.model";
import Course from "@/lib/models/course.model";
import DocumentModel from "@/lib/models/document.model";
import DocumentBundle from "@/lib/models/document-bundle.model";
import { sendEmail } from "@/lib/actions/email.action";
import { getPaymentRequestToAdminEmail } from "@/lib/utils/email-templates";

const ADMIN_EMAIL = "talel.jouini02@gmail.com";

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
    
    const { proofUrl, itemType = "course", itemIds, courseIds, amount, notes } = body;

    // Support both old courseIds and new itemIds for backward compatibility
    const finalItemIds = itemIds || courseIds;

    // Validate required fields
    if (!proofUrl || !finalItemIds || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate itemIds is an array
    if (!Array.isArray(finalItemIds) || finalItemIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid item IDs" },
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
      itemType: itemType,
      itemIds: finalItemIds,
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

    // Send notification email to admin
    try {
      // Get item names
      let items = [];
      if (itemType === "course") {
        items = await Course.find({ _id: { $in: finalItemIds } }).select("title");
      } else if (itemType === "document") {
        items = await DocumentModel.find({ _id: { $in: finalItemIds } }).select("title");
      } else if (itemType === "bundle") {
        items = await DocumentBundle.find({ _id: { $in: finalItemIds } }).select("title");
      }
      const itemNames = items.map((item: any) => item.title || "Unnamed Item");

      const emailHtml = getPaymentRequestToAdminEmail({
        userName: `${user.firstName} ${user.lastName}`.trim() || user.username,
        userEmail: user.email,
        itemType: itemType,
        itemNames,
        amount: Number(amount),
        paymentProofUrl: proofUrl,
        proofId: paymentProof._id.toString(),
        submittedAt: new Date(),
        userNotes: notes,
      });

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `🔔 New Payment Request - ${user.firstName} ${user.lastName}`,
        html: emailHtml,
      });

      console.log("✅ Admin notification email sent to:", ADMIN_EMAIL);
    } catch (emailError) {
      console.error("❌ Error sending admin notification email:", emailError);
      // Continue even if email fails - don't block the payment submission
    }

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
