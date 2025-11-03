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
import { TCategory, TCourse, TUser } from "@/types/models.types";
import { getAllUsers } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const LandingPage = async () => {
  const { userId } = auth();

  if (!userId) return redirect("/sign-in");
  let categories: TCategory[] = [];
  let courses: TCourse[] = [];
  let users: TUser[] = [];
  try {
    categories = await getAllCategories();
    courses = await getAllPublishedCourses();
    users = await getAllUsers();
  } catch (error: any) {}
  return (
    <div
      className="flex flex-col gap-14 "
      style={{
        minHeight: "calc(100vh-330px)",
      }}
    >
      <Hero courses={courses} users={users} />
      <Container>
        <Info>
          <InfoHeader
            title="Explore by Topic"
            subTitle="Everything You Need to Move to Germany"
            buttonText="All"
            onClick={() => {}}
          />
          <Categories categories={categories} />
        </Info>
      </Container>

      <Container>
        <Info>
          <InfoHeader
            title="Popular Courses"
            subTitle="Start Your German Journey Today"
            buttonText="All"
            onClick={() => {}}
          />

          <Courses courses={courses} clerkId={userId} />
        </Info>
      </Container>

      <Container>
        <FramerMotion>
          <div className="flex flex-col gap-0 lg:flex-row lg:gap-12 items-start">
            <Image
              src="/images/skills.png"
              alt="skills"
              width={644}
              height={469}
            />
            <div className="mt-10 flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-center md:text-start text-[25px] font-bold text-slate-900 dark:text-slate-200">
                    Prepare for Success with Germany
                    <span className="primary-color text-[30px]">F</span>ormation
                  </h3>{" "}
                </div>
                <p className="text-slate-800 dark:text-slate-400 text-[15px]">
                  Whether you're pursuing education, career opportunities, or a new life in Germany, we provide comprehensive guidance every step of the way. From language mastery to cultural integration.
                </p>
              </div>
              <div className="flex flex-col gap-6">
                <Skill text="German Language Proficiency (A1-C2)" />
                <Skill text="Visa & Immigration Guidance" />
                <Skill text="Job Search & Career Support" />
                <Skill text="Cultural Integration Training" />
                <Skill text="Housing & Settlement Assistance" />
              </div>
            </div>
          </div>
        </FramerMotion>
      </Container>

      <div className="p-4 w-full flex flex-col items-start gap-2 md:items-center md:flex-row md:justify-between rounded-sm bg-gradient-to-r from-red-400/30 to-yellow-300/50">
        <div className="flex items-center justify-center w-full md:justify-start gap-x-2">
          <Image src={"/icons/logo.svg"} width={90} height={90} alt="logo" />
          <h1 className="text-5xl font-bold flex items-center gap-x-1">
            Germany <span className="text-[#FF782D] text-6xl font-bold">F</span> ormation
          </h1>
        </div>
        <div className="flex flex-col gap-y-2 w-full md:justify-end md:items-end md:gap-4 md:flex-row">
          <Button className="z-10 border border-[#FF782D] text-[#FF782D] bg-transparent rounded-sm hover:bg-transparent ">
            I'm Ready to Move
          </Button>
          <Button className="z-10 bg-[#FF782D] text-white rounded-sm hover:bg-[#FF782D]">
            Become a Guide
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
