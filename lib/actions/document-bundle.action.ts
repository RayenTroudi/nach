"use server";

import { connectToDatabase } from "../mongoose";
import DocumentBundle from "../models/document-bundle.model";
import DocumentModel from "../models/document.model";
import { getUserByClerkId } from "./user.action";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Create a new document bundle
 */
export async function createDocumentBundle(params: {
  title: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  tags?: string[];
  thumbnail?: string;
  documentIds: string[];
  path?: string;
}) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await getUserByClerkId({ clerkId: userId });
    if (!user.isAdmin) throw new Error("Only instructors can create bundles");

    const bundle = await DocumentBundle.create({
      ...params,
      documents: params.documentIds,
      uploadedBy: user._id,
      isPublished: false,
    });

    if (params.path) {
      revalidatePath(params.path);
    }

    return JSON.parse(JSON.stringify(bundle));
  } catch (error: any) {
    console.error("Create document bundle error:", error);
    throw new Error(error.message);
  }
}

/**
 * Get all document bundles (optionally filtered by instructor)
 */
export async function getDocumentBundles(params?: {
  instructorId?: string;
  isPublished?: boolean;
}) {
  try {
    await connectToDatabase();

    const query: any = {};
    if (params?.instructorId) {
      query.uploadedBy = params.instructorId;
    }
    if (params?.isPublished !== undefined) {
      query.isPublished = params.isPublished;
    }

    const bundles = await DocumentBundle.find(query)
      .populate("uploadedBy", "firstName lastName picture")
      .populate("documents")
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(bundles));
  } catch (error: any) {
    console.error("Get document bundles error:", error);
    throw new Error(error.message);
  }
}

/**
 * Get a single document bundle by ID
 */
export async function getDocumentBundleById(bundleId: string) {
  try {
    await connectToDatabase();

    const bundle = await DocumentBundle.findById(bundleId)
      .populate("uploadedBy", "firstName lastName picture email")
      .populate("documents")
      .lean();

    if (!bundle) throw new Error("Bundle not found");

    return JSON.parse(JSON.stringify(bundle));
  } catch (error: any) {
    console.error("Get document bundle error:", error);
    throw new Error(error.message);
  }
}

/**
 * Update a document bundle
 */
export async function updateDocumentBundle(params: {
  bundleId: string;
  updates: {
    title?: string;
    description?: string;
    price?: number;
    currency?: string;
    category?: string;
    tags?: string[];
    thumbnail?: string;
    documentIds?: string[];
    isPublished?: boolean;
  };
  path?: string;
}) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await getUserByClerkId({ clerkId: userId });
    const bundle = await DocumentBundle.findById(params.bundleId);

    if (!bundle) throw new Error("Bundle not found");

    // Check ownership
    if (bundle.uploadedBy.toString() !== user._id.toString() && !user.isAdmin) {
      throw new Error("Unauthorized");
    }

    const updateData: any = { ...params.updates };
    if (params.updates.documentIds) {
      updateData.documents = params.updates.documentIds;
      delete updateData.documentIds;
    }

    const updatedBundle = await DocumentBundle.findByIdAndUpdate(
      params.bundleId,
      updateData,
      { new: true }
    )
      .populate("uploadedBy", "firstName lastName picture")
      .populate("documents");

    if (params.path) {
      revalidatePath(params.path);
    }

    return JSON.parse(JSON.stringify(updatedBundle));
  } catch (error: any) {
    console.error("Update document bundle error:", error);
    throw new Error(error.message);
  }
}

/**
 * Delete a document bundle
 */
export async function deleteDocumentBundle(params: {
  bundleId: string;
  path?: string;
}) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await getUserByClerkId({ clerkId: userId });
    const bundle = await DocumentBundle.findById(params.bundleId);

    if (!bundle) throw new Error("Bundle not found");

    // Check ownership
    if (bundle.uploadedBy.toString() !== user._id.toString() && !user.isAdmin) {
      throw new Error("Unauthorized");
    }

    await DocumentBundle.findByIdAndDelete(params.bundleId);

    if (params.path) {
      revalidatePath(params.path);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Delete document bundle error:", error);
    throw new Error(error.message);
  }
}

/**
 * Get published bundles for homepage
 */
export async function getPublishedBundles() {
  try {
    await connectToDatabase();

    const bundles = await DocumentBundle.find({ isPublished: true })
      .populate("uploadedBy", "firstName lastName picture")
      .populate("documents")
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(bundles));
  } catch (error: any) {
    console.error("Get published bundles error:", error);
    throw new Error(error.message);
  }
}
