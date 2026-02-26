import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import ResumeRequestModel from "@/lib/models/resumeRequest.model";
import UserModel from "@/lib/models/user.model";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Safely get userId - don't fail if not authenticated
    let userId = null;
    try {
      const authResult = auth();
      userId = authResult.userId;
    } catch (authError) {
      console.log("No authentication found, proceeding without userId");
    }
    
    const body = await req.json();

    console.log("Received resume request data:", JSON.stringify(body, null, 2));

    const { 
      desiredTraining,
      lastName,
      firstName,
      email,
      birthDate,
      address,
      phone,
      driverLicense,
      germanLevel,
      frenchLevel,
      englishLevel,
      hasBac,
      bacObtainedDate,
      bacStudiedDate,
      bacSection,
      bacHighSchool,
      bacCity,
      postBacStudies,
      internships,
      trainings,
      professionalExperience,
      additionalInfo,
      documentUrl
    } = body;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "First name, last name, email, and phone are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Combine firstName and lastName for backward compatibility
    const name = `${firstName} ${lastName}`.trim();

    // Find or create the MongoDB user if logged in
    let mongoUserId = null;
    if (userId) {
      let user = await UserModel.findOne({ clerkId: userId });
      
      // If user doesn't exist in UserModel, create a minimal entry
      if (!user) {
        user = await UserModel.create({
          clerkId: userId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          username: email.split('@')[0],
          picture: '',
        });
      }
      
      mongoUserId = user._id;
    }

    const resumeRequest = await ResumeRequestModel.create({
      userId: mongoUserId,
      name,
      firstName,
      lastName,
      email,
      birthDate,
      address,
      phone,
      driverLicense,
      germanLevel,
      frenchLevel,
      englishLevel,
      hasBac,
      bacObtainedDate,
      bacStudiedDate,
      bacSection,
      bacHighSchool,
      bacCity,
      postBacStudies,
      internships,
      trainings,
      desiredTraining,
      professionalExperience,
      additionalInfo,
      documentUrl,
      price: 100,
      paymentStatus: "pending",
      status: "pending",
    });

    console.log("Created resume request:", JSON.stringify(resumeRequest, null, 2));

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

    console.log("Fetched resume requests count:", resumeRequests.length);
    if (resumeRequests.length > 0) {
      console.log("First resume request sample:", JSON.stringify(resumeRequests[0], null, 2));
    }

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
