"use client";
import { TCourse } from "@/types/models.types";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import {
  calculateCourseRating,
  cn,
  formatNumber,
  getTimeInterval,
} from "@/lib/utils";
import Star from "./Star";
import CourseCardFooter from "./CourseCardFooter";
import Badge from "./Badge";
import { BorderBeam } from "@/components/magicui/border-beam";
import Link from "next/link";

const Vector = ({
  icon,
  alt,
  value,
}: {
  icon: string;
  alt: string;
  value: string;
}) => (
  <div className="flex items-center gap-1">
    <Image src={icon} alt={alt} width={16} height={16} />
    <span className="text-[12px] ">{value}</span>
  </div>
);

type Props = {
  course: TCourse;
  showWishlistHeart?: boolean;
  className?: string;
  children?: React.ReactNode;
  href?: string; // Optional custom href for the link
};

const ClientCourse = ({
  course,
  showWishlistHeart,
  className,
  children,
  href,
}: Props) => {
  const { courseRating, ratingFrom } = calculateCourseRating(course);

  const isFree = false;
  return (
    <Link href={href || `/course/${course._id}`} className="block">
      <div
        className={cn(
          "group relative flex flex-col gap-2 w-full md:w-[360px] h-[500px] border border-input  rounded-md shadow-sm hover:shadow-md  duration-300 ease-in-out  hover:z-100 hover:bg-slate-200/50 hover:dark:bg-slate-900/30",
          className
        )}
      >
      <BorderBeam size={250} duration={12} delay={9} />
      <div className="absolute top-0 left-0 w-full aspect-[6/1] bg-gradient-to-b from-black/50 to-transparent"></div>
      {course?.category?.name && <Badge text={course.category.name} />}

      <Image
        src={
          course?.thumbnail
            ? course?.thumbnail
            : "/images/default-course-thumbnail.jpg"
        }
        alt="course-thumbnail"
        width={380}
        height={250}
        className="transition duration-300 ease-in-out w-full rounded-tr-md rounded-tl-md h-[200px] object-cover"
        placeholder="blur"
        blurDataURL={
          course?.thumbnail
            ? course?.thumbnail
            : "/images/default-course-thumbnail.jpg"
        }
      />

      <div className="relative flex flex-col h-full gap-4 p-2">
        <div className="flex items-center gap-2">
          <Avatar className="w-[25px] h-[25px]">
            <AvatarImage
              src={
                course.instructor?.picture
                  ? course.instructor?.picture
                  : "/images/default_profile.avif"
              }
              alt="instructor-avatar"
            />

            <AvatarFallback className="">
              <Skeleton className="w-[25px] h-[25px]" />
            </AvatarFallback>
          </Avatar>
          <span className=" text-slate-800 dark:text-slate-400 text-[14px]">
            {course.instructor.username}
          </span>
        </div>

        {/* {course.keywords.length ? (
            <div className="w-full flex flex-wrap items-center gap-x-2">
              {course.keywords.map((keyword, key) => (
                <div
                  key={key}
                  className="relative mt-2 text-xs w-fit px-3 py-1 flex items-center justify-center bg-black rounded-md text-brand-red-500  uppercase"
                >
                  {keyword}
                </div>
              ))}
            </div>
          ) : null} */}
        <h3 className="line-clamp-4 group-hover:primary-color text-[18px] font-bold text-slate-950 dark:text-slate-200">
          {course.title}
        </h3>
        <div className="flex items-center gap-4">
          <Vector
            icon="/icons/graduate.svg"
            alt="graduate"
            value={`${formatNumber(course?.students?.length ?? 0)} Student(s)`}
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[16px] font-bold">{courseRating}</p>

          <div className="flex gap-1 items-center">
            {/* TODO : The Ratings Is Static */}
            {Array.from({ length: 5 }).map((_, key) => (
              <Star
                key={key}
                index={key}
                stars={courseRating}
                filled={courseRating > key}
              />
            ))}
            <span className="text-[11px] text-slate-400 dark:text-slate-400 ml-2">
              ({ratingFrom})
            </span>
          </div>
        </div>

        {children ? (
          children
        ) : (
          <CourseCardFooter
            priceOff={0}
            price={course.price ?? 0}
            isFree={isFree}
            currency={course.currency || "USD"}
          />
        )}
      </div>
    </div>
    </Link>
  );
};

export default ClientCourse;
