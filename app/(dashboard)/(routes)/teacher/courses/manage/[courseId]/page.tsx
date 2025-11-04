import { Banner, CourseStepHeader, StatusAlert } from "@/components/shared";
import { getCourseById } from "@/lib/actions/course.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import {
  DescriptionForm,
  TitleForm,
  ThumbnailForm,
  CategoryForm,
  MessageForm,
  PricingForm,
  SubmitForReviewButton,
  ExamForm,
  PublishCourseButton,
} from "./_components";
import { CircleDollarSign, File, ListChecks } from "lucide-react";
import { CourseStatusEnum } from "@/lib/models/course.model";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionForm from "./_components/SectionForm";
import { TCourse, TSection, TVideo } from "@/types/models.types";

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

  const requiredFields = [
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
        section?.videos?.some((video: TVideo) => video?.isPublished)
    ).length >= 3,
    course?.exam,
  ];

  const completedFields = requiredFields.filter(Boolean).length;

  console.log("SECTIONS", requiredFields.filter(Boolean));

  return (
    <>
      {course.isPublished ? (
        <Banner
          variant="success"
          label="Your course now is published and available for all students.  Thank you for your contribution."
        />
      ) : (
        <StatusAlert status={course.status!} />
      )}

      <div className="p-6">
        <div className="w-full flex flex-col gap-y-2 items-start md:flex-row md:justify-between md:items-center p-4 border-b border-input">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-200">
              Manage your{" "}
              <span className="text-[#FF782D]">{course?.title}</span> course
            </h2>
            <p className="text-slate-400">
              Completed fields (
              <span className="text-sm font-bold text-[#FF782D]">
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
          {completedFields === requiredFields.length &&
          course?.status !== CourseStatusEnum.Pending &&
          course?.status !== CourseStatusEnum.Approved ? (
            <SubmitForReviewButton course={course} />
          ) : null}
          {completedFields === requiredFields.length &&
          course?.status === CourseStatusEnum.Approved &&
          !course?.isPublished ? (
            <PublishCourseButton course={course} />
          ) : null}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-6 mt-16">
          {/* Customize your course */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <CourseStepHeader
                icon="/icons/customize.svg"
                alt="customize"
                bgColor="bg-[#FF782D]/30"
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
                bgColor="bg-[#FF782D]/30"
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
                icon={<ListChecks color="#FF782D" />}
                alt="message"
                bgColor="bg-[#FF782D]/30"
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
                icon={<CircleDollarSign color="#FF782D" />}
                alt="pricing"
                bgColor="bg-[#FF782D]/30"
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
                icon={<File color="#FF782D" />}
                alt="Certificate's Exam"
                bgColor="bg-[#FF782D]/30"
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
      </div>
    </>
  );
};

export default CourseIdPage;
