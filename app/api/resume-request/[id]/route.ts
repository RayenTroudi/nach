import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import ResumeRequestModel from "@/lib/models/resumeRequest.model";
import { auth } from "@clerk/nextjs";
import User from "@/lib/models/user.model";
import Course from "@/lib/models/course.model";
import { createPrivateChatRoom } from "@/lib/actions/private-chat-room.action";
import { sendEmail } from "@/lib/actions/email.action";
import { 
  getPaymentApprovedToUserEmail, 
  getPaymentRejectedToUserEmail 
} from "@/lib/utils/email-templates";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, paymentStatus, adminNotes, completedResumeUrl } = body;

    await connectToDatabase();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (completedResumeUrl !== undefined) updateData.completedResumeUrl = completedResumeUrl;

    const updatedRequest = await ResumeRequestModel.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { error: "Resume request not found" },
        { status: 404 }
      );
    }

    // If payment is approved (paid), create a private chat room with admin
    if (paymentStatus === "paid") {
      console.log(`\n${"=".repeat(80)}`);
      console.log(`💼 RESUME PAYMENT APPROVED - CREATING PRIVATE CHAT`);
      console.log(`   Resume Request ID: ${params.id}`);
      console.log(`   Student Email: ${updatedRequest.email}`);
      
      try {
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
            await ResumeRequestModel.findByIdAndUpdate(params.id, {
              userId: studentUser._id
            });
            updatedRequest.userId = studentUser._id;
            console.log(`   ✅ Updated resume request with userId`);
          }
        }
        
        if (!studentUser) {
          console.error(`\n❌ CRITICAL: Student user not found!`);
          console.error(`   Email: ${updatedRequest.email}`);
          console.error(`   UserId: ${updatedRequest.userId}`);
          console.error(`   Student must sign in and the resume request needs a userId`);
          console.log(`${"=".repeat(80)}\n`);
          
          // Still return success but log the issue
          return NextResponse.json({
            success: true,
            message: "Payment approved, but chat room could not be created. Student needs to sign in.",
            warning: "User not found in system"
          });
        }

        console.log(`\n👤 Student found: ${studentUser.username || studentUser.email}`);
        console.log(`   Student ID: ${studentUser._id}`);
        
        // Find Talel (the main instructor) for resume service private chats
        const TALEL_CLERK_ID = "user_35hV3NV1RA4gd4NJQTWg7bSzYCJ";
        const talelUser = await User.findOne({ clerkId: TALEL_CLERK_ID });
        
        if (!talelUser) {
          console.log(`⚠️ Talel not found with Clerk ID: ${TALEL_CLERK_ID}`);
          console.log(`   Falling back to first admin user...`);
        } else {
          console.log(`✅ Found Talel: ${talelUser.username || talelUser.email}`);
        }
        
        const instructorUser = talelUser || await User.findOne({ isAdmin: true }).sort({ createdAt: 1 });
        
        if (!instructorUser) {
          throw new Error("No admin/instructor user found in database");
        }
        
        console.log(`\n📚 Instructor for chat: ${instructorUser.username || instructorUser.email}`);
        console.log(`   Instructor ID: ${instructorUser._id}`);
        
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
            isPublished: false, // Hidden from public listing
          });
          console.log(`   ✅ Resume Service course created: ${resumeServiceCourse._id}`);
        } else {
          console.log(`   ✅ Using existing Resume Service course: ${resumeServiceCourse._id}`);
        }
        
        // Create private chat room (will check if already exists)
        console.log(`\n💬 Creating private chat room...`);
        const privateChatRoom = await createPrivateChatRoom({
          courseId: resumeServiceCourse._id.toString(),
          studentId: studentUser._id.toString(),
          instructorId: instructorUser._id.toString(),
        });
        
        console.log(`✅ Private chat room created/verified: ${privateChatRoom._id}`);
        console.log(`   👨‍🎓 Student: ${studentUser.username || studentUser.email}`);
        console.log(`   👨‍💼 Instructor: ${instructorUser.username || instructorUser.email}`);
        console.log(`   💬 They can now chat about resume requirements!`);

        // Send approval email to user
        try {
          console.log(`\n📧 Sending approval email...`);
          const accessUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/chat-rooms`;

          const emailHtml = getPaymentApprovedToUserEmail({
            userName: studentUser.firstName || studentUser.username || updatedRequest.name,
            itemType: "resume",
            itemNames: ["Professional Resume Service"],
            amount: updatedRequest.price || 49,
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
        console.error(`Stack:`, chatError.stack);
        console.log(`${"=".repeat(80)}\n`);
        // Don't fail the whole request if chat creation fails
      }
    }

    // If payment is rejected, send notification email
    if (paymentStatus === "rejected") {
      try {
        const resubmitUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/contact/resume`;

        const emailHtml = getPaymentRejectedToUserEmail({
          userName: updatedRequest.name || "User",
          itemType: "resume",
          itemNames: ["Professional Resume Service"],
          amount: updatedRequest.price || 0,
          adminNotes,
          resubmitUrl,
        });

        await sendEmail({
          to: updatedRequest.email,
          subject: "⚠️ Payment Review Required - Action Needed",
          html: emailHtml,
        });

        console.log("✅ Rejection email sent to user:", updatedRequest.email);
      } catch (emailError) {
        console.error("❌ Error sending rejection email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      resumeRequest: updatedRequest,
    });
  } catch (error: any) {
    console.error("Error updating resume request:", error);
    return NextResponse.json(
      { error: "Failed to update resume request" },
      { status: 500 }
    );
  }
}
