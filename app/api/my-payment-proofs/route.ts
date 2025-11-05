import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import PaymentProof from "@/lib/models/payment-proof.model";
import User from "@/lib/models/user.model";
import Course from "@/lib/models/course.model";

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = auth();

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get user from database
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch all payment proofs for this user
    const proofs = await PaymentProof.find({ userId: user._id })
      .populate("reviewedBy", "firstName lastName")
      .sort({ uploadedAt: -1 });

    // Fetch course details for each proof
    const proofsWithCourses = await Promise.all(
      proofs.map(async (proof) => {
        const courses = await Course.find({
          _id: { $in: proof.courseIds },
        }).select("title thumbnail price");

        return {
          _id: proof._id,
          courseIds: proof.courseIds,
          amount: proof.amount,
          proofUrl: proof.proofUrl,
          fileName: proof.fileName,
          fileType: proof.fileType,
          status: proof.status,
          notes: proof.notes,
          adminNotes: proof.adminNotes,
          uploadedAt: proof.uploadedAt,
          reviewedAt: proof.reviewedAt,
          courses,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        proofs: proofsWithCourses,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user payment proofs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch payment proofs",
      },
      { status: 500 }
    );
  }
}
