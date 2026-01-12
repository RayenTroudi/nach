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
import FinalCTASection from "./_components/FinalCTASection";
import { TCategory, TCourse, TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs";
import DocumentModel from "@/lib/models/document.model";
import { connectToDatabase } from "@/lib/mongoose";
import { CourseTypeEnum } from "@/lib/enums";

const LandingPage = async () => {
  const { userId } = auth();

  // Fetch data
  let categories: TCategory[] = [];
  let courses: TCourse[] = [];
  let regularCourses: TCourse[] = [];
  let documents: any[] = [];
  
  try {
    categories = await getAllCategories();
    courses = await getAllPublishedCourses();
    
    // Filter for regular courses only
    regularCourses = courses.filter(
      (course) => course.courseType === CourseTypeEnum.Regular
    );
    
    // Fetch documents
    await connectToDatabase();
    const docs = await DocumentModel.find({ isPublic: true })
      .populate("uploadedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    documents = JSON.parse(JSON.stringify(docs));
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
      <DocumentsSection documents={documents} />

      {/* Frequent Questions Section with Related Courses - Replaces "Your German Pathway" */}
      <FrequentQuestionsSection courses={courses} />
      
      {/* Ausbildung Opportunities Section - Replaces "How It Works" */}
      <AusbildungSection />

      {/* Reach For Me Section - Replaces "Success Stories" */}
      <ReachForMeSection />

      {/* Final CTA */}
      <FinalCTASection />
    </div>
  );
};

export default LandingPage;
