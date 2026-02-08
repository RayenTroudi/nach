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
      try {
        console.log("💬 Resume payment approved - setting up private chat...");
        console.log("   Resume Request ID:", params.id);
        console.log("   Student Email:", updatedRequest.email);
        console.log("   Has userId:", !!updatedRequest.userId);
        
        // Find the student user by userId or email
        let studentUser;
        if (updatedRequest.userId) {
          studentUser = await User.findById(updatedRequest.userId);
        } else {
          // Try to find by email if userId is not set
          studentUser = await User.findOne({ email: updatedRequest.email });
          console.log("   Searched by email, found:", !!studentUser);
          
          // If found, update the resume request with userId
          if (studentUser) {
            updatedRequest.userId = studentUser._id;
            await ResumeRequestModel.findByIdAndUpdate(params.id, {
              userId: studentUser._id
            });
            console.log("   Updated resume request with userId");
          }
        }
        
        if (!studentUser) {
          console.log("⚠️ Cannot create chat room - student user not found");
          console.log("   Student should sign in and create a new resume request");
        } else {
          // Find an admin user to be the instructor for resume service
          const adminUser = await User.findOne({ isAdmin: true }).sort({ createdAt: 1 });
          
          if (!adminUser) {
            console.log("⚠️ No admin user found to create chat room");
          } else {
            console.log("   Admin/Instructor found:", adminUser.username || adminUser.email);
            
            // Find or create a "Resume Service" course to associate with the private chat
            let resumeServiceCourse = await Course.findOne({ 
              title: "Resume Service",
              instructor: adminUser._id 
            });
            
            if (!resumeServiceCourse) {
              console.log("📝 Creating Resume Service course for private chats...");
              // Create a placeholder course for resume service chats
              const Category = (await import("@/lib/models/category.model")).default;
              const defaultCategory = await Category.findOne();
              
              resumeServiceCourse = await Course.create({
                title: "Resume Service",
                description: "Professional resume creation service - Private chat for resume requests",
                instructor: adminUser._id,
                category: defaultCategory?._id || null,
                courseType: "regular",
                price: 0,
                isPublished: false, // Hidden from public listing
              });
              console.log("✅ Resume Service course created:", resumeServiceCourse._id);
            } else {
              console.log("   Using existing Resume Service course:", resumeServiceCourse._id);
            }
            
            // Create private chat room (will check if already exists)
            const privateChatRoom = await createPrivateChatRoom({
              courseId: resumeServiceCourse._id.toString(),
              studentId: studentUser._id.toString(),
              instructorId: adminUser._id.toString(),
            });
            
            console.log("✅ Private chat room created/verified for resume service");
            console.log("   Student:", studentUser.username || studentUser.email);
            console.log("   Instructor:", adminUser.username || adminUser.email);
            console.log("   They can now chat about the resume requirements!");

            // Send approval email to user
            try {
              const accessUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/student/chat`;

              const emailHtml = getPaymentApprovedToUserEmail({
                userName: studentUser.firstName || studentUser.username,
                itemType: "resume",
                itemNames: ["Professional Resume Service"],
                amount: updatedRequest.price || 0,
                accessUrl,
                adminNotes,
              });

              await sendEmail({
                to: updatedRequest.email || studentUser.email,
                subject: "✅ Payment Approved - Resume Service Activated",
                html: emailHtml,
              });

              console.log("✅ Approval email sent to user:", updatedRequest.email || studentUser.email);
            } catch (emailError) {
              console.error("❌ Error sending approval email:", emailError);
            }
          }
        }
      } catch (chatError: any) {
        console.error("❌ Failed to create private chat room:", chatError.message);
        console.error(chatError.stack);
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
