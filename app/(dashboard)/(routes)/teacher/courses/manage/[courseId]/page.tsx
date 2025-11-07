import { Banner, CourseStepHeader } from "@/components/shared";
import { getCourseById } from "@/lib/actions/course.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import {
  DescriptionForm,
  TitleForm,
  ThumbnailForm,
  CategoryForm,
  CourseTypeForm,
  FAQVideoForm,
  MessageForm,
  PricingForm,
  ExamForm,
  PublishCourseButton,
} from "./_components";
import { CircleDollarSign, File, ListChecks } from "lucide-react";
import { CourseStatusEnum, CourseTypeEnum } from "@/lib/enums";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionForm from "./_components/SectionForm";
import { TCourse, TSection, TVideo } from "@/types/models.types";
import ConvertCourseTypeButton from "./_components/ConvertCourseTypeButton";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();
  const { courseId } = params;

  if (!userId) return redirect("/sign-in");

  let course: TCourse = {} as TCourse;
  try {
    course = await getCourseById({ courseId });
  } catch (error) {
    console.log(error);
    return redirect("/teacher/courses");
  }

  // Handle legacy courses without courseType (default to Regular)
  const courseType = course.courseType || CourseTypeEnum.Regular;
  const isFAQCourse = courseType === CourseTypeEnum.Most_Frequent_Questions;
  
  console.log("=== COURSE TYPE DEBUG ===");
  console.log("Raw course.courseType:", course.courseType);
  console.log("Computed courseType:", courseType);
  console.log("CourseTypeEnum.Most_Frequent_Questions:", CourseTypeEnum.Most_Frequent_Questions);
  console.log("Is FAQ Course:", isFAQCourse);
  console.log("========================");

  // Different required fields based on course type
  const requiredFields = isFAQCourse
    ? [
        course?.title,
        course?.category,
        course?.description,
        course?.thumbnail,
        course?.faqVideo,
      ]
    : [
        course?.title,
        course?.category,
        course?.description,
        course?.welcomeMessage,
        course?.congratsMessage,
        course?.price,
        course?.currency,
        course?.thumbnail,
        course?.level,
        course?.language,
        (course?.sections ?? []).filter(
          (section: TSection) =>
            section?.isPublished &&
            section?.videos &&
            section.videos.length > 0 &&
            section.videos.some((video: TVideo) => video?.isPublished)
        ).length >= 1,
        course?.exam,
      ];

  const completedFields = requiredFields.filter(Boolean).length;

  console.log("SECTIONS", requiredFields.filter(Boolean));

  return (
    <>
      {course.isPublished ? (
        <Banner
          variant="success"
          label={
            isFAQCourse
              ? "Your FAQ video is now published and featured on the homepage for all students."
              : "Your course is now published and available for all students. Thank you for your contribution."
          }
        />
      ) : (
        <Banner
          variant="warning"
          label={
            isFAQCourse
              ? "This FAQ video is in draft mode. Complete all required fields and click 'Publish Course' to feature it on the homepage."
              : "This course is in draft mode. Complete all required fields and click 'Publish Course' to make it available to students."
          }
        />
      )}

      <div className="p-6">
        {/* Debug Panel - Remove in production */}
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200">
              <strong>DEBUG INFO:</strong> courseType = "{courseType}" | isFAQCourse = {isFAQCourse ? "true" : "false"}
            </p>
            <ConvertCourseTypeButton 
              courseId={courseId}
              currentType={isFAQCourse ? "FAQ Reel" : "Regular Course"}
              targetType={isFAQCourse ? "Regular Course" : "FAQ Reel"}
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-y-2 items-start md:flex-row md:justify-between md:items-center p-4 border-b border-input">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-200">
              Manage your{" "}
              <span className="text-brand-red-500">{course?.title}</span>{" "}
              {isFAQCourse ? "FAQ Reel" : "course"}
            </h2>
            {isFAQCourse && (
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                📹 FAQ Reel Format - Simple & Free
              </p>
            )}
            <p className="text-slate-400">
              Completed fields (
              <span className="text-sm font-bold text-brand-red-500">
                {completedFields}
              </span>
              /
              <span className="text-sm font-bold">
                {" "}
                {requiredFields.length}{" "}
              </span>
              )
            </p>
          </div>
          {completedFields === requiredFields.length && !course?.isPublished ? (
            <PublishCourseButton course={course} />
          ) : null}
        </div>

        {/* FAQ Course Layout */}
        {isFAQCourse ? (
          <div className="max-w-4xl mx-auto mt-16">
            <div className="flex flex-col gap-6">
              <CourseStepHeader
                icon="/icons/customize.svg"
                alt="customize"
                bgColor="bg-brand-red-500/30"
                title="Customize your FAQ Video"
              />
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="item-1"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Video Title
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <TitleForm course={course} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-2"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Video Description
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <DescriptionForm course={course} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-3"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Category
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CategoryForm course={course} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-4"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Thumbnail
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ThumbnailForm course={course} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-5"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Upload Video
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <FAQVideoForm course={course} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>💡 FAQ Video Tips:</strong> Keep it short (30 seconds to 3 minutes), 
                  answer one specific question clearly, and make it engaging. This video will be 
                  featured on the homepage and is always free for students.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Regular Course Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-6 mt-16">
          {/* Customize your course */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <CourseStepHeader
                icon="/icons/customize.svg"
                alt="customize"
                bgColor="bg-brand-red-500/30"
                title="Customize your course"
              />
              <Accordion type="single" collapsible className="w-full ">
                <AccordionItem
                  value="item-1"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400 ">
                      Course Title
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <TitleForm course={course} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-2"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Course Description
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <DescriptionForm course={course} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-3"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Course Category
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CategoryForm course={course} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-3-5"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Course Type
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CourseTypeForm course={course} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-4"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Course Thumbnail
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ThumbnailForm course={course} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="flex flex-col gap-4">
              <CourseStepHeader
                icon="/icons/messages.svg"
                alt="message"
                bgColor="bg-brand-red-500/30"
                title="Customize your course Messages"
              />
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="item-5"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Welcome Message
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <MessageForm course={course} type="welcome" />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-6"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Congrats Message
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <MessageForm course={course} type="congrats" />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <CourseStepHeader
                icon={<ListChecks color="#DD0000" />}
                alt="message"
                bgColor="bg-brand-red-500/30"
                title="Customize your course Sections"
              />
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="item-7"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Sections
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <SectionForm course={course} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="flex flex-col gap-4">
              <CourseStepHeader
                icon={<CircleDollarSign color="#DD0000" />}
                alt="pricing"
                bgColor="bg-brand-red-500/30"
                title="Customize your course Pricing"
              />
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="item-7"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Price & Currency
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <PricingForm course={course} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="flex flex-col gap-4">
              <CourseStepHeader
                icon={<File color="#DD0000" />}
                alt="Certificate's Exam"
                bgColor="bg-brand-red-500/30"
                title="Certificate's Exam"
              />
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="item-9"
                  className="group hover:bg-slate-100 dark:hover:bg-slate-900 px-2 rounded-sm"
                >
                  <AccordionTrigger className="group-hover:no-underline">
                    <h2 className="font-bold text-slate-500 dark:text-slate-400">
                      Certificate&apos;s Exam
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ExamForm course={course} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
        )}
      </div>
    </>
  );
};

export default CourseIdPage;
