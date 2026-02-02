"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TeacherCourseCard from "./TeacherCourseCard";
import { CourseStatusEnum } from "@/lib/enums";
import { TCourse, TUser } from "@/types/models.types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Spinner } from "@/components/shared";

interface Props {
  instructor: TUser;
}

const TeacherCourses: React.FC<Props> = ({ instructor }) => {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [displayedCourses, setDisplayedCourses] = useState<TCourse[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [courseStatus, setCourseStatus] = useState<string>("all");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  const pathnameHasLocale = pathname.startsWith('/ar/') || pathname.startsWith('/en/') || pathname.startsWith('/de/');
  const manageHref = pathnameHasLocale ? `/${locale}/teacher/courses/manage` : '/teacher/courses/manage';

  const filterCourses = useCallback(() => {
    if (!instructor.createdCourses) return;

    setIsSearching(true);
    const filteredCourses: TCourse[] = instructor.createdCourses.filter(
      (course: TCourse) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (courseStatus === "all" ||
          (course.status ?? "").toLowerCase() === courseStatus.toLowerCase())
    );

    setDisplayedCourses(filteredCourses);
    setIsSearching(false);
  }, [instructor.createdCourses, searchTerm, courseStatus]);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (newStatus: string): void => {
    setCourseStatus(newStatus);
  };

  const onToggleDeleteCourseHandler = (state: boolean) => setIsDeleting(state);

  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <div className="flex items-center justify-between py-2 mb-5 border-b border-input w-full">
        <h1 className="text-xl md:text-3xl text-slate-950 dark:text-slate-200 font-bold">
          <span className="text-brand-red-500">{instructor.username}&apos;s</span>{" "}
          courses
        </h1>
        <Link href={manageHref}>
          <Button className="w-fit md:w-[200px] bg-brand-red-500 hover:bg-brand-red-600 opacity-80 hover:opacity-100 transition duration-300 ease-in-out">
            <PlusCircle size={22} className="md:hidden dark:text-slate-50" />
            <p className="hidden md:block dark:text-slate-50">New Course</p>
          </Button>
        </Link>
      </div>

      <div className="w-full flex flex-col gap-2 items-start md:items-center md:justify-between md:gap-4 md:flex-row">
        <div className="relative w-full md:flex-1 h-[43px] bg-transparent">
          <Input
            placeholder="Search For Your Courses By The Title ..."
            className="pl-[50px] w-full h-full text-slate-950 dark:text-slate-200 font-semibold bg-slate-100 dark:bg-slate-900 border-none outline-none rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Image
            src="/icons/search.svg"
            alt="search"
            width={20}
            height={20}
            className="absolute top-1/2 left-4 transform -translate-y-1/2"
          />
        </div>
        <Select onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ALL</SelectItem>
            {Object.values(CourseStatusEnum).map((status) => (
              <SelectItem key={status} value={status}>
                {status.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex md:flex-wrap md:justify-center lg:justify-start lg:flex-nowrap flex-col md:flex-row lg:flex-col gap-4 w-full relative">
        {displayedCourses.map((course) => (
          <TeacherCourseCard
            key={course._id}
            instructorId={instructor._id}
            course={course}
            refresh={router.refresh}
            onToggleDeleteCourseHandler={onToggleDeleteCourseHandler}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherCourses;
