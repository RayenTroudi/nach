import { Container, ShowMoreLess, Spinner, Star } from "@/components/shared";
import Preview from "@/components/shared/editor/Preview";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateCourseRating, formatNumber } from "@/lib/utils";
import { TCourse } from "@/types/models.types";
import Link from "next/link";
import React from "react";

interface Props {
  course: TCourse;
}

const PurchasePageHeader = ({ course }: Props) => {
  const { courseRating, ratingFrom } = calculateCourseRating(course);

  return (
    <div className="w-full bg-slate-200/30 dark:bg-slate-900/30 ">
      <Container className=" w-full ">
        <div className="flex flex-col gap-y-4 w-full lg:w-[950px]">
          <div className="w-full flex flex-col gap-y-1 ">
            <Badge className="bg-black hover:bg-dark/80 rounded-full w-fit px-4 py-2 text-slate-50">
              {course.category?.name ? course.category.name : <Spinner />}
            </Badge>
            <h1 className="w-full text-slate-950 dark:text-slate-200 text-xl lg:text-4xl font-bold">
              {course.title}
            </h1>
            {course.description ? (
              <div className="w-full lg:w-[800px] text-wrap">
                <Preview data={course?.description ?? ""} />
              </div>
            ) : (
              <Spinner />
            )}
          </div>

          <div className="w-fit rounded-md flex flex-wrap items-center gap-x-4  bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-2">
            {course.keywords?.map((keyword, key) => (
              <div
                key={key}
                className="relative mt-2 md:mt-0 text-sm w-fit px-6 py-1 flex items-center justify-center bg-gradient-to-r from-slate-100 to-teal-100
                                rounded-md text-brand-red-500  uppercase
                              "
              >
                {keyword}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-start md:flex-row md:items-center gap-x-2">
            <div className="flex items-center gap-x-2">
              <p className="font-bold text-xl">{courseRating}</p>
              {Array.from({ length: 5 }).map((_, key) => (
                <Star
                  key={key}
                  index={key}
                  stars={courseRating}
                  filled={Boolean(courseRating > key)}
                />
              ))}

              <p className="text-slate-500 text-sm">({ratingFrom} votes)</p>
            </div>

            <Separator
              className="h-[20px] hidden md:block"
              orientation="vertical"
            />
            <p className="text-slate-800 dark:text-slate-300 font-semibold">
              {" "}
              {formatNumber(course?.students?.length ?? 0)} student(s){" "}
            </p>
          </div>
          {course.instructor && (
            <Link
              href={`/user/${course.instructor._id}`}
              className="flex flex-row items-center gap-x-2 group w-full"
            >
              <AnimatedTooltip items={[course.instructor]} />
              <p className="font-semibold group-hover:text-brand-red-500 transition-all duration-300 ease-in-out">
                {" "}
                {course.instructor.username}{" "}
              </p>
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
};

export default PurchasePageHeader;
