"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongoose";
import ResumeRequestModel from "@/lib/models/resumeRequest.model";

export async function getResumeRequests() {
  try {
    const { userId } = await auth();

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
    const { userId } = await auth();

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
    const { userId } = await auth();

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
    console.error("Error rejecting payment:", error);
    return { success: false, error: error.message || "Failed to reject payment" };
  }
}
