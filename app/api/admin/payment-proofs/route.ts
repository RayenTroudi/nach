import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import PaymentProof from "@/lib/models/payment-proof.model";
import User from "@/lib/models/user.model";
import Course from "@/lib/models/course.model";
import { getUserByClerkId } from "@/lib/actions/user.action";
import { sendEmail } from "@/lib/actions/email.action";

// GET: List all payment proofs with filters
export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const admin = await getUserByClerkId({ clerkId: userId });
    
    // Check if user is admin
    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status !== "all") {
      query.status = status;
    }

    // Get proofs with user and course details
    const proofs = await PaymentProof.find(query)
      .populate("userId", "firstName lastName email username picture")
      .populate("reviewedBy", "firstName lastName email")
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await PaymentProof.countDocuments(query);

    // Get course details for each proof
    const proofsWithCourses = await Promise.all(
      proofs.map(async (proof) => {
        const courses = await Course.find({
          _id: { $in: proof.courseIds },
        }).select("title thumbnail price");

        return {
          ...proof.toObject(),
          courses,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        proofs: proofsWithCourses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching payment proofs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment proofs" },
      { status: 500 }
    );
  }
}

// POST: Update proof status (approve/reject)
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const admin = await getUserByClerkId({ clerkId: userId });
    
    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { proofId, status, adminNotes } = body;

    // Validate input
    if (!proofId || !status) {
      return NextResponse.json(
        { error: "Proof ID and status are required" },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // Find the proof
    const proof = await PaymentProof.findById(proofId).populate("userId");
    if (!proof) {
      return NextResponse.json(
        { error: "Payment proof not found" },
        { status: 404 }
      );
    }

    // Update proof status
    proof.status = status;
    proof.adminNotes = adminNotes || "";
    proof.reviewedBy = admin._id;
    proof.reviewedAt = new Date();
    await proof.save();

    console.log(`✅ Payment proof ${status}:`, {
      proofId,
      userId: proof.userId._id,
      courseIds: proof.courseIds,
      reviewedBy: admin._id,
    });

    // If approved, enroll user in courses
    if (status === "approved") {
      try {
        const user = await User.findById(proof.userId._id);
        
        // Add courses to user's enrolled courses
        for (const courseId of proof.courseIds) {
          if (!user.enrolledCourses) {
            user.enrolledCourses = [];
          }
          
          if (!user.enrolledCourses.includes(courseId)) {
            user.enrolledCourses.push(courseId);
          }

          // Add user to course's students
          const course = await Course.findById(courseId);
          if (course) {
            if (!course.students) {
              course.students = [];
            }
            if (!course.students.includes(user._id)) {
              course.students.push(user._id);
              await course.save();
            }
          }
        }
        
        await user.save();

        console.log("✅ User enrolled in courses:", {
          userId: user._id,
          courseIds: proof.courseIds,
        });

        // Send approval email
        if (process.env.RESEND_API_KEY) {
          await sendEmail({
            to: user.email,
            subject: "Payment Approved - Course Access Granted",
            html: `
              <h2>Payment Approved!</h2>
              <p>Hi ${user.firstName},</p>
              <p>Your payment has been verified and approved. You now have access to your course(s)!</p>
              <p>Amount: ${proof.amount} TND</p>
              <p>You can start learning now at: <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/my-learning">My Learning</a></p>
              ${adminNotes ? `<p><strong>Note from admin:</strong> ${adminNotes}</p>` : ""}
              <p>Best regards,<br/>The Team</p>
            `,
          });
        }
      } catch (enrollError) {
        console.error("❌ Error enrolling user:", enrollError);
        // Continue even if enrollment fails - admin can manually fix
      }
    }

    // If rejected, send notification email
    if (status === "rejected" && process.env.RESEND_API_KEY) {
      try {
        const user = await User.findById(proof.userId._id);
        await sendEmail({
          to: user.email,
          subject: "Payment Verification Issue",
          html: `
            <h2>Payment Verification Required</h2>
            <p>Hi ${user.firstName},</p>
            <p>We've reviewed your payment proof, but we need additional information or clarification.</p>
            <p>Amount: ${proof.amount} TND</p>
            ${adminNotes ? `<p><strong>Reason:</strong> ${adminNotes}</p>` : ""}
            <p>Please upload a new proof or contact support for assistance.</p>
            <p>Best regards,<br/>The Team</p>
          `,
        });
      } catch (emailError) {
        console.error("❌ Error sending rejection email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment proof ${status} successfully`,
      data: {
        proofId: proof._id,
        status: proof.status,
        reviewedAt: proof.reviewedAt,
      },
    });

  } catch (error: any) {
    console.error("❌ Error updating payment proof:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update payment proof" },
      { status: 500 }
    );
  }
}
