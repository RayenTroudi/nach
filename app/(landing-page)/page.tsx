"use server";
import {
  Container,
  Hero,
  Info,
  InfoHeader,
  Skill,
  Statistic,
} from "@/components/shared";
import FramerMotion from "@/components/shared/FramerMotion";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/lib/actions";
import { getAllPublishedCourses } from "@/lib/actions/course.action";

import Image from "next/image";
import Courses from "./_components/Courses";
import Categories from "./_components/Categories";
import HeroSection from "./_components/HeroSection";
import PathwaysSection from "./_components/PathwaysSection";
import HowItWorksSection from "./_components/HowItWorksSection";
import SuccessStoriesSection from "./_components/SuccessStoriesSection";
import FinalCTASection from "./_components/FinalCTASection";
import { TCategory, TCourse, TUser } from "@/types/models.types";
import { getAllUsers } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const LandingPage = async () => {
  const { userId } = auth();

  // Allow browsing without sign-in
  let categories: TCategory[] = [];
  let courses: TCourse[] = [];
  let users: TUser[] = [];
  try {
    categories = await getAllCategories();
    courses = await getAllPublishedCourses();
    users = await getAllUsers();
  } catch (error: any) {}
  return (
    <div className="flex flex-col">
      {/* New German-themed sections */}
      <HeroSection />
      
      {/* Featured Courses Section - Product Focus */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Featured Courses
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Expertly designed courses to accelerate your German journey. Start learning today.
            </p>
          </div>
          <Courses courses={courses} clerkId={userId || undefined} />
        </Container>
      </section>

      <PathwaysSection />
      <HowItWorksSection />
      <SuccessStoriesSection />

      {/* Final CTA */}
      <FinalCTASection />
    </div>
  );
};

export default LandingPage;
