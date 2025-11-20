import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import ResumeRequestModel from "@/lib/models/resumeRequest.model";
import UserModel from "@/lib/models/user.model";
import { auth } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, email, phone, currentRole, targetRole, experience, education, skills, additionalInfo, documentUrl } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find or create the MongoDB user if logged in
    let mongoUserId = null;
    if (userId) {
      let user = await UserModel.findOne({ clerkId: userId });
      
      // If user doesn't exist in UserModel, create a minimal entry
      if (!user) {
        user = await UserModel.create({
          clerkId: userId,
          email: email,
          firstName: name.split(' ')[0] || name,
          lastName: name.split(' ').slice(1).join(' ') || '',
          username: email.split('@')[0],
          picture: '',
        });
      }
      
      mongoUserId = user._id;
    }

    const resumeRequest = await ResumeRequestModel.create({
      userId: mongoUserId,
      name,
      email,
      phone,
      currentRole,
      targetRole,
      experience,
      education,
      skills,
      additionalInfo,
      documentUrl,
      price: 49,
      paymentStatus: "pending",
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      resumeRequest,
    });
  } catch (error: any) {
    console.error("Error creating resume request:", error);
    return NextResponse.json(
      { error: "Failed to create resume request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const resumeRequests = await ResumeRequestModel.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ 
      success: true,
      resumeRequests 
    });
  } catch (error: any) {
    console.error("Error fetching resume requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume requests" },
      { status: 500 }
    );
  }
}
