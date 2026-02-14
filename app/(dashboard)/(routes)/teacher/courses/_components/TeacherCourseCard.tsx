"use client";
import { Badge, Star } from "@/components/shared";
import { CourseStatusEnum } from "@/lib/enums";
import { calculateCourseRating, formatNumber } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { deleteCourseById, updateCourse } from "@/lib/actions";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Ban, Radio } from "lucide-react";
import { TCourse } from "@/types/models.types";
import { usePageLoader } from "@/contexts/PageLoaderProvider";

interface Props {
  instructorId: string;
  course: TCourse;
  refresh: () => void;
  onToggleDeleteCourseHandler: (state: boolean) => void;
  isDeleting: boolean;
}
const TeacherCourseCard = ({
  instructorId,
  course,
  refresh,
  onToggleDeleteCourseHandler,
  isDeleting,
}: Props) => {
  const { setIsLoading } = usePageLoader();

  const { scnToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const { courseRating, ratingFrom } = calculateCourseRating(course);

  const unpublishCourseHandler = async () => {
    try {
      setIsLoading(true);
      await updateCourse({
        courseId: course._id,
        instructorId,
        data: {
          isPublished: false,
        },
        path: pathname,
      });

      refresh();
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
      toast.error("Failed to unpublish course");
    } finally {
      setTimeout(
        () => {
          setIsLoading(false);
          scnToast({
            variant: "success",
            title: "Congrats !",
            description: "Your Course has been unpublished successfully.",
          });
        },

        1500
      );
    }
  };

  const deleteCourseHandler = async () => {
    try {
      setIsLoading(true);
      onToggleDeleteCourseHandler(true);
      await deleteCourseById({ courseId: course._id, path: pathname });

      refresh();
    } catch (error: any) {
      onToggleDeleteCourseHandler(false);
      scnToast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      onToggleDeleteCourseHandler(false);
      setTimeout(
        () => {
          setIsLoading(false);
          scnToast({
            variant: "success",
            title: "Congrats !",
            description: "Your Course has been deleted successfully.",
          });
        },

        1500
      );
    }
  };

  return (
    <>
      <div
        className={`w-full md:w-[350px] lg:w-full h-[350px] lg:h-full shadow-md lg:shadow-none rounded-md relative ${
          isDeleting ? "opacity-5" : ""
        }`}
      >
        <Link
          href={`/teacher/courses/manage/${course?._id}`}
          className="group relative w-full h-full rounded-md flex gap-4 flex-col lg:flex-row hover:bg-input/50 transition ease-in-out duration-300 cursor-pointer"
        >
          <p className="absolute top-1/3 left-1/2 -translate-x-1/2 hidden lg:group-hover:block font-bold text-[22px] text-brand-red-500 transition ease-in-out duration-300 pointer-events-none z-10">
            Edit / Manage Course
          </p>
          <div className="w-full h-[200px] lg:w-[400px] lg:h-full relative border border-input pointer-events-none">
            <Badge text={course.category?.name} />

            <Image
              loading="lazy"
              src={
                course.thumbnail
                  ? course.thumbnail
                  : "/images/default-course-thumbnail.jpg"
              }
              alt="course"
              width={300}
              height={200}
              className=" h-[200px] lg:h-full w-full lg:w-[300px] object-cover  "
            />
          </div>
          <div className="hidden w-full py-3 lg:grid grid-cols-3 gap-2 group-hover:opacity-5 transition ease-in-out duration-300 pointer-events-none">
            <div className="flex flex-col justify-between gap-3 items-start">
              <h2 className="font-bold">{course.title}</h2>
              <p className="font-semibold text-[14px]">
                {`${course.level![0].toUpperCase()}${course.level!.slice(1)}`}{" "}
                Level
              </p>
              <p className="text-[13px]">
                {course.isPublished ? (
                  <div className="flex items-center gap-x-2 text-[#16a34a]">
                    <Radio size={18} className="animate-pulse" />
                    <p>Live Now</p>
                  </div>
                ) : course.status === CourseStatusEnum.Rejected ? (
                  <div className="flex items-center gap-x-2 text-[#b91c1c]">
                    <Ban size={18} className="animate-pulse" />
                    <p>Rejected</p>
                  </div>
                ) : (
                  <span className="text-slate-400">
                    Private ·{" "}
                    {`${course.status![0].toUpperCase()}${course.status!.slice(
                      1
                    )}`}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center w-full h-full">
              <p className="flex flex-col gap-2 items-center">
                <span className="font-bold text-[16px]">
                  {course.price && course.students?.length
                    ? "$" +
                      Math.abs(
                        +(course.price - course.price * 0.1).toFixed(2)
                      ) *
                        course.students.length
                    : "$" + 0.0}
                </span>
                <span className="text-[13px]">Total Earned</span>
              </p>
              <p className="flex flex-col gap-2 items-center">
                <span className="font-bold text-[16px] text-center">
                  {course.students?.length
                    ? formatNumber(course.students?.length)
                    : "No Student Enrolled "}
                </span>
                {course.students?.length ? (
                  <span className="text-[13px] text-center">
                    Total Enrollment(s)
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              {!course.students?.length ? (
                <span className="font-bold text-[16px] text-center">
                  No Student Enrolled
                </span>
              ) : (
                <div className="flex items-center">
                  <p className="font-bold mr-2">{courseRating}</p>

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
              )}
              <span className="text-[13px]">Course Rating</span>
            </div>
          </div>

          <div className="flex md:flex-col lg:hidden p-4 pointer-events-none">
            <div className="w-full flex flex-col justify-between gap-3 items-start">
              <div className="w-full flex justify-between items-center">
                <h2 className="font-bold">{course.title}</h2>
                <div className="flex items-center gap-1">
                  <p className="font-bold mr-2">{courseRating}</p>

                  <Image
                    loading="lazy"
                    src="/icons/star-solid.svg"
                    fill={false}
                    alt="filled"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
              <p className="font-semibold text-[14px]">
                {`${course.level![0].toUpperCase()}${course.level!.slice(1)}`}{" "}
                Level
              </p>
              <p className="text-slate-400 dark:text-slate-400 text-[13px]">
                {course.isPublished ? (
                  <div className="flex items-center gap-x-2 text-[#16a34a]">
                    <Radio size={18} className="animate-pulse" />
                    <p>Live Now</p>
                  </div>
                ) : course.status === CourseStatusEnum.Rejected ? (
                  <div className="flex items-center gap-x-2 text-[#b91c1c]">
                    <Ban size={18} className="animate-pulse" />
                    <p>Rejected</p>
                  </div>
                ) : (
                  <span>
                    Private ·{" "}
                    {`${course.status![0].toUpperCase()}${course.status!.slice(
                      1
                    )}`}
                  </span>
                )}
              </p>
            </div>
          </div>
        </Link>
        {course.isPublished || !course.students?.length ? (
          <div className="absolute top-0 right-0 z-20" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  className="w-[35px] h-[35px] rounded-full bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-100 dark:hover:bg-slate-200/50  ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0  focus-visible:ring-offset-0"
                  onClick={(e) => e.preventDefault()}
                >
                  <Image
                    loading="lazy"
                    src="/icons/3-dots.svg"
                    alt="dots"
                    width={20}
                    height={20}
                    className=" object-cover"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 absolute right-0">
                <DropdownMenuGroup>
                  {course.isPublished ? (
                    <div className="w-full  border-sm duration-300 ease-in-out gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger className="w-full">
                          <Button
                            size="sm"
                            className="w-full hover:bg-slate-100 dark:hover:bg-slate-900 bg-transparent hover:bg-transparent flex items-center justify-start text-slate-950 dark:text-slate-200 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0  focus-visible:ring-offset-0"
                          >
                            Unpublish
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to unpublish this course?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={unpublishCourseHandler}
                              className="bg-brand-red-500 opacity-95 text-slate-200 hover:bg-brand-red-600 hover:opacity-100 duration-300 ease-in-out"
                            >
                              Yes
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {course.feedbacks.length > 0 ? (
                        <Button
                          size="sm"
                          className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-start text-slate-950 dark:text-slate-200 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0  focus-visible:ring-offset-0"
                          onClick={() =>
                            router.push(`courses/reviews/${course._id}`)
                          }
                        >
                          Course reviews
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                  {!course.students?.length ? (
                    <>
                      <DropdownMenuSeparator />
                      <div className="w-full hover:bg-slate-100 dark:hover:bg-slate-900 border-sm duration-300 ease-in-out">
                        <AlertDialog>
                          <AlertDialogTrigger
                            className="w-full"
                            disabled={course.students?.length! > 0}
                          >
                            <Button
                              disabled={course.students?.length! > 0}
                              size="sm"
                              className="w-full bg-transparent hover:bg-transparent flex items-center justify-start text-slate-950 dark:text-slate-200 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0  focus-visible:ring-offset-0"
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this course?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={deleteCourseHandler}
                                className="bg-brand-red-500 opacity-95 text-slate-200 hover:bg-brand-red-600 hover:opacity-100 duration-300 ease-in-out"
                              >
                                Yes
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  ) : null}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>
      <DropdownMenuSeparator className="bg-input/50" />
    </>
  );
};

export default TeacherCourseCard;
