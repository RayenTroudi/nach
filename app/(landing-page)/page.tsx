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
    
    // Fetch all public documents (both free and for sale)
    const docs = await DocumentModel.find({ isPublic: true })
      .populate("uploadedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    // Fetch published bundles
    const bundles = await DocumentBundle.find({ isPublished: true })
      .populate("uploadedBy", "firstName lastName")
      .populate("documents", "title fileName")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    // Combine and add itemType
    const allItems: Array<any & { itemType: string; createdAt: string | Date }> = [
      ...docs.map((doc) => ({ ...doc, itemType: "document" })),
      ...bundles.map((bundle) => ({ ...bundle, itemType: "bundle" }))
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
