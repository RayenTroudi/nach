"use server";
import {
  Container,
} from "@/components/shared";
import { getAllCategories } from "@/lib/actions";
import { getAllPublishedCourses } from "@/lib/actions/course.action";

import Courses from "./_components/Courses";
import HeroSection from "./_components/HeroSection";
import CoursesSection from "./_components/CoursesSection";
import DocumentsSection from "./_components/DocumentsSection";
import FrequentQuestionsSection from "./_components/FrequentQuestionsSection";
import AusbildungSection from "./_components/AusbildungSection";
import ReachForMeSection from "./_components/ReachForMeSection";
import { TCategory, TCourse, TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs";
import DocumentModel from "@/lib/models/document.model";
import DocumentBundle from "@/lib/models/document-bundle.model";
import { connectToDatabase } from "@/lib/mongoose";
import { CourseTypeEnum } from "@/lib/enums";

const LandingPage = async () => {
  const { userId } = auth();

  // Fetch data
  let categories: TCategory[] = [];
  let courses: TCourse[] = [];
  let regularCourses: TCourse[] = [];
  let items: any[] = [];
  
  try {
    categories = await getAllCategories();
    courses = await getAllPublishedCourses();
    
    // Filter for regular courses only
    regularCourses = courses.filter(
      (course) => course.courseType === CourseTypeEnum.Regular
    );
    
    // Fetch documents and bundles using storefront logic
    await connectToDatabase();
    
    // Fetch published bundles first - only root level bundles (not inside folders)
    const bundles = await DocumentBundle.find({ 
      isPublished: true,
      parentFolder: null // Only show root-level items on homepage
    })
      .populate("uploadedBy", "firstName lastName")
      .populate("documents", "title fileName")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    // Add folder metadata for folders
    const bundlesWithMetadata = await Promise.all(bundles.map(async (bundle: any) => {
      // Check if this is a folder
      if (bundle.isFolder || !bundle.documents || bundle.documents.length === 0) {
        try {
          // Count child bundles
          const childBundleCount = await DocumentBundle.countDocuments({
            parentFolder: bundle._id,
            isPublished: true
          });
          
          // Get preview of child bundles (first 5) with documents
          const childBundles = await DocumentBundle.find({
            parentFolder: bundle._id,
            isPublished: true
          })
            .select('title documents')
            .populate('documents', 'title fileName')
            .limit(5)
            .lean();
          
          // Format child bundle preview with document details
          const childBundlePreview = childBundles.map((cb: any) => ({
            _id: cb._id.toString(),
            title: cb.title,
            fileCount: (cb.documents && Array.isArray(cb.documents)) ? cb.documents.length : 0,
            documents: cb.documents && Array.isArray(cb.documents) 
              ? cb.documents.map((doc: any) => ({
                  _id: doc._id.toString(),
                  title: doc.title,
                  fileName: doc.fileName
                }))
              : []
          }));
          
          // Calculate total file count across all child bundles
          const totalFileCount = childBundlePreview.reduce((sum, cb) => sum + cb.fileCount, 0);
          
          return {
            ...bundle,
            childBundleCount,
            childBundles: childBundlePreview,
            totalFileCount
          };
        } catch (error) {
          console.error("Error fetching folder metadata:", error);
          return bundle;
        }
      }
      return bundle;
    }));
    
    // Get all document IDs that are part of bundles
    const bundledDocumentIds = bundlesWithMetadata
      .filter(bundle => bundle.documents && Array.isArray(bundle.documents))
      .flatMap(bundle => 
        bundle.documents.map((doc: any) => doc._id.toString())
      );
    
    // Fetch all public documents (both free and for sale) that are NOT part of any bundle
    const docQuery: any = { isPublic: true };
    
    // Only add $nin filter if there are bundled documents
    if (bundledDocumentIds.length > 0) {
      docQuery._id = { $nin: bundledDocumentIds };
    }
    
    const docs = await DocumentModel.find(docQuery)
      .populate("uploadedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    // Combine and add itemType
    const allItems: Array<any & { itemType: string; createdAt: string | Date }> = [
      ...docs.map((doc) => ({ ...doc, itemType: "document" })),
      ...bundlesWithMetadata.map((bundle) => ({ ...bundle, itemType: "bundle" }))
    ];
    
    // Sort by createdAt and limit to 6 total items
    items = allItems
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
    
    items = JSON.parse(JSON.stringify(items));
  } catch (error: any) {
    console.error("Error fetching data:", error);
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section - "Nach Deutschland" */}
      <HeroSection />
      
      {/* Regular Courses Section */}
      <CoursesSection courses={regularCourses} />

      {/* Documents Section - Replaces "Featured Courses" */}
      <DocumentsSection documents={items} />

      {/* Frequent Questions Section with Related Courses - Replaces "Your German Pathway" */}
      <FrequentQuestionsSection courses={courses} />
      
      {/* Ausbildung Opportunities Section - Replaces "How It Works" */}
      <AusbildungSection />

      {/* Reach For Me Section - Replaces "Success Stories" */}
      <ReachForMeSection />
    </div>
  );
};

export default LandingPage;
