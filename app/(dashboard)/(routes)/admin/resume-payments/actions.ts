"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongoose";
import ResumeRequestModel from "@/lib/models/resumeRequest.model";
import User from "@/lib/models/user.model";
import Course from "@/lib/models/course.model";
import { createPrivateChatRoom } from "@/lib/actions/private-chat-room.action";
import { sendEmail } from "@/lib/actions/email.action";
import { 
  getPaymentApprovedToUserEmail, 
  getPaymentRejectedToUserEmail 
} from "@/lib/utils/email-templates";

export async function getResumeRequests() {
  try {
    let userId = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      console.error("[getResumeRequests] Auth error:", authError);
    }

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const requests = await ResumeRequestModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Convert MongoDB _id to string and dates to ISO strings
    const serializedRequests = requests.map(request => ({
      ...request,
      _id: request._id.toString(),
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt ? request.updatedAt.toISOString() : null,
    }));

    return { success: true, data: serializedRequests };
  } catch (error: any) {
    console.error("Error fetching resume requests:", error);
    return { success: false, error: error.message || "Failed to fetch requests" };
  }
}

export async function approvePayment(requestId: string, adminNotes: string) {
  try {
    let userId = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      console.error("[approvePayment] Auth error:", authError);
    }

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const updatedRequest = await ResumeRequestModel.findByIdAndUpdate(
      requestId,
      {
        paymentStatus: "paid",
        status: "in_progress",
        adminNotes,
        approvedAt: new Date(),
        approvedBy: userId,
      },
      { new: true }
    ).lean();

    if (!updatedRequest) {
      return { success: false, error: "Resume request not found" };
    }

    // Create private chat room and send approval email
    try {
      console.log(`\n${"=".repeat(80)}`);
      console.log(`💼 RESUME PAYMENT APPROVED - CREATING PRIVATE CHAT`);
      console.log(`   Resume Request ID: ${requestId}`);
      console.log(`   Student Email: ${updatedRequest.email}`);
      
      // Find the student user by userId or email
      let studentUser;
      if (updatedRequest.userId) {
        studentUser = await User.findById(updatedRequest.userId);
        console.log(`   ✅ Found student by userId: ${studentUser?._id}`);
      } else {
        // Try to find by email if userId is not set
        studentUser = await User.findOne({ email: updatedRequest.email });
        console.log(`   ${studentUser ? '✅' : '❌'} Searched by email, found: ${!!studentUser}`);
        
        // If found, update the resume request with userId
        if (studentUser) {
          await ResumeRequestModel.findByIdAndUpdate(requestId, {
            userId: studentUser._id
          });
          console.log(`   ✅ Updated resume request with userId`);
        }
      }
      
      if (!studentUser) {
        console.error(`\n❌ CRITICAL: Student user not found!`);
        console.error(`   Email: ${updatedRequest.email}`);
        console.error(`   UserId: ${updatedRequest.userId}`);
        console.log(`${"=".repeat(80)}\n`);
        
        // Still return success but with a warning
        return { 
          success: true,
          warning: "Payment approved, but chat room could not be created. Student needs to sign in.",
          data: {
            ...updatedRequest,
            _id: updatedRequest._id.toString(),
            createdAt: updatedRequest.createdAt.toISOString(),
            updatedAt: updatedRequest.updatedAt ? updatedRequest.updatedAt.toISOString() : null,
          }
        };
      }

      console.log(`\n👤 Student found: ${studentUser.username || studentUser.email}`);
      
      // Find Talel (the main instructor) for resume service private chats
      const TALEL_CLERK_ID = "user_35hV3NV1RA4gd4NJQTWg7bSzYCJ";
      const talelUser = await User.findOne({ clerkId: TALEL_CLERK_ID });
      
      const instructorUser = talelUser || await User.findOne({ isAdmin: true }).sort({ createdAt: 1 });
      
      if (!instructorUser) {
        throw new Error("No admin/instructor user found in database");
      }
      
      console.log(`\n📚 Instructor for chat: ${instructorUser.username || instructorUser.email}`);
      
      // Find or create a "Resume Service" course to associate with the private chat
      let resumeServiceCourse = await Course.findOne({ 
        title: "Resume Service",
        instructor: instructorUser._id 
      });
      
      if (!resumeServiceCourse) {
        console.log(`\n📝 Creating "Resume Service" course for private chats...`);
        const Category = (await import("@/lib/models/category.model")).default;
        const defaultCategory = await Category.findOne();
        
        resumeServiceCourse = await Course.create({
          title: "Resume Service",
          description: "Professional resume creation service - Private chat for resume requests",
          instructor: instructorUser._id,
          category: defaultCategory?._id || null,
          courseType: "regular",
          price: 0,
          isPublished: false,
        });
        console.log(`   ✅ Resume Service course created`);
      }
      
      // Create private chat room
      console.log(`\n💬 Creating private chat room...`);
      const privateChatRoom = await createPrivateChatRoom({
        courseId: resumeServiceCourse._id.toString(),
        studentId: studentUser._id.toString(),
        instructorId: instructorUser._id.toString(),
      });
      
      console.log(`✅ Private chat room created/verified: ${privateChatRoom._id}`);

      // Send approval email to user
      try {
        console.log(`\n📧 Sending approval email...`);
        const accessUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/chat-rooms`;

        const emailHtml = getPaymentApprovedToUserEmail({
          userName: studentUser.firstName || studentUser.username || updatedRequest.name,
          itemType: "resume",
          itemNames: ["Professional Resume Service"],
          amount: updatedRequest.price || 100,
          accessUrl,
          adminNotes,
        });

        await sendEmail({
          to: updatedRequest.email || studentUser.email,
          subject: "✅ Payment Approved - Resume Service Activated",
          html: emailHtml,
        });

        console.log(`✅ Approval email sent to: ${updatedRequest.email || studentUser.email}`);
      } catch (emailError: any) {
        console.error(`❌ Error sending approval email:`, emailError.message);
      }
      
      console.log(`\n✅✅✅ RESUME CHAT SETUP COMPLETE ✅✅✅`);
      console.log(`${"=".repeat(80)}\n`);
      
    } catch (chatError: any) {
      console.error(`\n❌❌❌ FAILED TO CREATE RESUME CHAT ❌❌❌`);
      console.error(`Error:`, chatError.message);
      console.log(`${"=".repeat(80)}\n`);
      // Don't fail the whole request if chat creation fails
    }

    return { 
      success: true, 
      data: {
        ...updatedRequest,
        _id: updatedRequest._id.toString(),
        createdAt: updatedRequest.createdAt.toISOString(),
        updatedAt: updatedRequest.updatedAt ? updatedRequest.updatedAt.toISOString() : null,
      }
    };
  } catch (error: any) {
    console.error("Error approving payment:", error);
    return { success: false, error: error.message || "Failed to approve payment" };
  }
}

export async function rejectPayment(requestId: string, adminNotes: string) {
  try {
    let userId = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      console.error("[rejectPayment] Auth error:", authError);
    }

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!adminNotes.trim()) {
      return { success: false, error: "Please provide a reason for rejection" };
    }

    await connectToDatabase();

    const updatedRequest = await ResumeRequestModel.findByIdAndUpdate(
      requestId,
      {
        paymentStatus: "rejected",
        status: "rejected",
        adminNotes,
        rejectedAt: new Date(),
        rejectedBy: userId,
      },
      { new: true }
    ).lean();

    if (!updatedRequest) {
      return { success: false, error: "Resume request not found" };
    }

    // Send rejection email to user
    let emailSent = false;
    try {
      console.log(`\n📧 Sending rejection email to: ${updatedRequest.email}`);
      const resubmitUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/contact/resume`;

      const emailHtml = getPaymentRejectedToUserEmail({
        userName: updatedRequest.name || "User",
        itemType: "resume",
        itemNames: ["Professional Resume Service"],
        amount: updatedRequest.price || 100,
        adminNotes,
        resubmitUrl,
      });

      const emailResult = await sendEmail({
        to: updatedRequest.email,
        subject: "⚠️ Payment Review Required - Action Needed",
        html: emailHtml,
      });

      if (emailResult.success) {
        console.log("✅ Rejection email sent to user:", updatedRequest.email);
        emailSent = true;
      } else {
        console.error("❌ Error sending rejection email:", emailResult.error);
      }
    } catch (emailError: any) {
      console.error("❌ Exception sending rejection email:", emailError.message);
    }

    return { 
      success: true,
      emailSent,
      message: emailSent 
        ? "Payment rejected and user notified via email" 
        : "Payment rejected but email notification failed. Please contact the user manually.",
      data: {
        ...updatedRequest,
        _id: updatedRequest._id.toString(),
        createdAt: updatedRequest.createdAt.toISOString(),
        updatedAt: updatedRequest.updatedAt ? updatedRequest.updatedAt.toISOString() : null,
      }
    };
  } catch (error: any) {
    console.error("Error rejecting payment:", error);
    return { success: false, error: error.message || "Failed to reject payment" };
  }
}
