"use server";

import { connectToDatabase } from "@/lib/mongoose";
import PaymentProof from "@/lib/models/payment-proof.model";
import User from "@/lib/models/user.model";
import Course from "@/lib/models/course.model";
import DocumentModel from "@/lib/models/document.model";
import DocumentBundle from "@/lib/models/document-bundle.model";
import { sendEmail } from "@/lib/actions/email.action";
import { createPrivateChatRoom } from "@/lib/actions/private-chat-room.action";
import { pushStudentToCourse } from "@/lib/actions/course.action";
import { CourseTypeEnum } from "@/lib/enums";
import { 
  getPaymentApprovedToUserEmail, 
  getPaymentRejectedToUserEmail 
} from "@/lib/utils/email-templates";

export async function getPaymentProofs(page: number = 1, limit: number = 100, status: string = "all") {
  try {
    await connectToDatabase();

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status !== "all") {
      query.status = status;
    }

    // Get proofs with user details
    const proofs = await PaymentProof.find(query)
      .populate("userId", "firstName lastName email username picture")
      .populate("reviewedBy", "firstName lastName email")
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await PaymentProof.countDocuments(query);

    // Get item details for each proof
    const proofsWithItems = await Promise.all(
      (proofs as any[]).map(async (proof: any) => {
        let items: any[] = [];
        
        // Handle different item types
        if (proof.itemType === "course") {
          items = await Course.find({
            _id: { $in: proof.itemIds || proof.courseIds },
          }).select("title thumbnail price").lean();
        } else if (proof.itemType === "document") {
          items = await DocumentModel.find({
            _id: { $in: proof.itemIds },
          }).select("title price").lean();
        } else if (proof.itemType === "bundle") {
          items = await DocumentBundle.find({
            _id: { $in: proof.itemIds },
          }).select("title price").lean();
        }

        return {
          ...proof,
          _id: proof._id.toString(),
          userId: proof.userId ? {
            ...proof.userId,
            _id: proof.userId._id.toString(),
          } : null,
          items: items.map((item: any) => ({
            ...item,
            _id: item._id.toString(),
          })),
          courses: proof.itemType === "course" ? items.map((item: any) => ({
            ...item,
            _id: item._id.toString(),
          })) : [],
          uploadedAt: proof.uploadedAt.toISOString(),
          reviewedAt: proof.reviewedAt ? proof.reviewedAt.toISOString() : null,
        };
      })
    );

    return {
      success: true,
      data: {
        proofs: proofsWithItems,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProofs: total,
          hasMore: page < Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    console.error("❌ Error fetching payment proofs:", error);
    return { success: false, error: error.message || "Failed to fetch payment proofs" };
  }
}

export async function updatePaymentProofStatus(proofId: string, status: "approved" | "rejected", adminNotes?: string) {
  try {
    await connectToDatabase();

    // Validate input
    if (!["approved", "rejected"].includes(status)) {
      return { success: false, error: "Status must be 'approved' or 'rejected'" };
    }

    // Find the proof
    const proof = await PaymentProof.findById(proofId).populate("userId");
    if (!proof) {
      return { success: false, error: "Payment proof not found" };
    }

    // Update proof status
    proof.status = status;
    proof.adminNotes = adminNotes || "";
    proof.reviewedAt = new Date();
    await proof.save();

    console.log(`✅ Payment proof ${status}:`, {
      proofId,
      userId: proof.userId._id,
      itemType: proof.itemType,
      itemIds: proof.itemIds || proof.courseIds,
    });

    // If approved, grant access based on item type
    if (status === "approved") {
      try {
        const user = await User.findById(proof.userId._id);
        
        if (!user) {
          return { success: false, error: "User not found" };
        }
        
        const itemIds = proof.itemIds || proof.courseIds;
        
        if (proof.itemType === "course") {
          // Add courses to user's enrolled courses
          for (const courseId of itemIds) {
            console.log(`\n🏦 Processing bank transfer approval for course: ${courseId}`);
            
            if (!user.enrolledCourses) {
              user.enrolledCourses = [];
            }
            
            if (!user.enrolledCourses.includes(courseId)) {
              user.enrolledCourses.push(courseId);
              console.log(`✅ Added course to user's enrolledCourses`);
            }

            // Use pushStudentToCourse to properly add student to course AND group chat
            try {
              await pushStudentToCourse({
                courseId: courseId.toString(),
                studentId: user._id.toString(),
              });
              console.log(`✅ pushStudentToCourse completed (includes group chat enrollment)`);
            } catch (courseError: any) {
              console.error(`❌ Failed to add student to course:`, courseError.message);
            }

            // Create private chat room with instructor for regular courses
            const course = await Course.findById(courseId).populate("instructor");
            if (course && course.courseType === CourseTypeEnum.Regular) {
              try {
                await createPrivateChatRoom({
                  courseId: courseId.toString(),
                  studentId: user._id.toString(),
                  instructorId: course.instructor._id?.toString() || course.instructor.toString(),
                });
                console.log("✅ Private chat room created for bank transfer course purchase");
              } catch (chatError: any) {
                console.error("❌ Failed to create private chat room:", chatError.message);
              }
            }
          }
        } else if (proof.itemType === "document") {
          // Add documents to user's purchased documents
          if (!user.purchasedDocuments) {
            user.purchasedDocuments = [];
          }
          
          for (const docId of itemIds) {
            if (!user.purchasedDocuments.includes(docId)) {
              user.purchasedDocuments.push(docId);
            }
          }
        } else if (proof.itemType === "bundle") {
          // Add bundles to user's purchased document bundles
          if (!user.purchasedDocumentBundles) {
            user.purchasedDocumentBundles = [];
          }
          
          for (const bundleId of itemIds) {
            if (!user.purchasedDocumentBundles.includes(bundleId)) {
              user.purchasedDocumentBundles.push(bundleId);
            }
          }
        }
        
        await user.save();

        console.log(`✅ User granted access to ${proof.itemType}(s)`, { userId: user._id, itemIds });

        // Send approval email to user
        try {
          let items = [];
          if (proof.itemType === "course") {
            items = await Course.find({ _id: { $in: itemIds } }).select("title");
          } else if (proof.itemType === "document") {
            items = await DocumentModel.find({ _id: { $in: itemIds } }).select("title");
          } else if (proof.itemType === "bundle") {
            items = await DocumentBundle.find({ _id: { $in: itemIds } }).select("title");
          }
          const itemNames = items.map((item: any) => item.title);

          const accessUrl = proof.itemType === "course" 
            ? `${process.env.NEXT_PUBLIC_SERVER_URL}/my-learning`
            : `${process.env.NEXT_PUBLIC_SERVER_URL}/student/my-documents`;

          const emailHtml = getPaymentApprovedToUserEmail({
            userName: user.firstName || user.username,
            itemType: proof.itemType,
            itemNames,
            amount: proof.amount,
            accessUrl,
            adminNotes,
          });

          await sendEmail({
            to: user.email,
            subject: `✅ Payment Approved - Access Granted`,
            html: emailHtml,
          });

          console.log("✅ Approval email sent to user:", user.email);
        } catch (emailError) {
          console.error("❌ Error sending approval email:", emailError);
        }
      } catch (enrollError) {
        console.error(`❌ Error granting access to ${proof.itemType}:`, enrollError);
      }
    }

    // If rejected, send notification email
    if (status === "rejected") {
      try {
        const user = await User.findById(proof.userId._id);
        
        if (user && user.email) {
          let items = [];
          const itemIds = proof.itemIds || proof.courseIds;
          if (proof.itemType === "course") {
            items = await Course.find({ _id: { $in: itemIds } }).select("title");
          } else if (proof.itemType === "document") {
            items = await DocumentModel.find({ _id: { $in: itemIds } }).select("title");
          } else if (proof.itemType === "bundle") {
            items = await DocumentBundle.find({ _id: { $in: itemIds } }).select("title");
          }
          const itemNames = items.map((item: any) => item.title);

          const resubmitUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/my-learning`;

          const emailHtml = getPaymentRejectedToUserEmail({
            userName: user.firstName || user.username,
            itemType: proof.itemType,
            itemNames,
            amount: proof.amount,
            adminNotes,
            resubmitUrl,
          });

          await sendEmail({
            to: user.email,
            subject: "⚠️ Payment Review Required - Action Needed",
            html: emailHtml,
          });

          console.log("✅ Rejection email sent to user:", user.email);
        }
      } catch (emailError) {
        console.error("❌ Error sending rejection email:", emailError);
      }
    }

    return {
      success: true,
      message: `Payment proof ${status} successfully`,
      data: {
        proofId: proof._id.toString(),
        status: proof.status,
        reviewedAt: proof.reviewedAt,
      },
    };

  } catch (error: any) {
    console.error("❌ Error updating payment proof:", error);
    return { success: false, error: error.message || "Failed to update payment proof" };
  }
}
