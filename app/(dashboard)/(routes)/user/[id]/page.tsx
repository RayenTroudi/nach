"use server";
import React from "react";
import Image from "next/image";
import { Container, Course } from "@/components/shared";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getUserByMongoDbId } from "@/lib/actions";
import { TCourse } from "@/types/models.types";
import { User } from "lucide-react";

interface PageProps {
  params: {
    id: string;
  };
}

const Statistic = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="space-y-1">
    <p className="text-sm text-slate-900 dark:text-slate-300">{label}</p>
    <p className="text-lg text-slate-950 dark:text-slate-200 font-semibold">
      {value}
    </p>
  </div>
);

const SocialButton = ({
  children,
  icon,
  url,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  url: string;
}) => (
  <Link
    className="inline-flex items-center justify-center w-full bg-slate-100 dark:bg-slate-900 text-brand-red-500 border border-brand-red-500 py-2 px-4 rounded-sm uppercase font-bold text-sm hover:bg-slate-200/50 dark:hover:bg-slate-950 transition duration-300 ease-in-out"
    href={url || ""}
  >
    {icon}
    <span className="ml-2">{children}</span>
  </Link>
);

export default async function Page({ params }: PageProps) {
  const user = await getUserByMongoDbId(params.id);
  console.log("the user is", user);

  const publishedCourses: TCourse[] = user.createdCourses.filter(
    (course: TCourse) => course.isPublished
  );
  const instructorPicture = user.picture || "/images/default_profile.avif";
  const instructorUsername = user.username;

  const studentIds = new Set();
  publishedCourses.forEach((course) => {
    if (course.students) {
      course.students.forEach((studentId) => studentIds.add(studentId));
    }
  });
  const totalStudents = studentIds.size;

  return (
    <Container>
      <div className="flex flex-col gap-12 md:flex-row justify-center items-start lg:items-center lg:space-x-12 space-y-8 lg:space-y-0 divide-y divide-transparent">
        <div className="w-full md:w-fit flex flex-col items-center justify-center space-y-2">
          <Image
            src={instructorPicture}
            alt={instructorUsername}
            width={288}
            height={288}
            className="rounded-full mb-4 md:mb-0"
          />
        </div>
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl font-bold text-slate-950 dark:text-slate-200">
            {instructorUsername}
          </h1>
          <div className="space-y-4">
            <span className="inline-block p-2 bg-blue-100 text-blue-800 text-xs font-semibold rounded dark:bg-blue-200 dark:text-blue-800">
              GermanPath Instructor Partner
            </span>
            <div className="flex flex-wrap gap-2">
              {user.interests.map(
                (interest: string, index: React.Key | null | undefined) => (
                  <Badge
                    className="p-2 bg-slate-200 text-slate-950 text-xs font-semibold rounded dark:bg-slate-500 dark:text-slate-200"
                    key={index}
                  >
                    {interest}
                  </Badge>
                )
              )}
            </div>
          </div>
          <div className="space-y-6">
            <Statistic label="Total students" value={totalStudents} />
            {user.aboutMe ? (
              <div>
                <h3 className="text-lg text-slate-900 dark:text-slate-300">
                  About me
                </h3>
                <p className="md:text-base text-slate-950 dark:text-slate-200 text-wrap line-clamp-3">
                  {user.aboutMe}
                </p>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>

      <div className="pt-10"></div>
      <div className="space-y-10">
        <h2 className="text-3xl font-semibold">
          My Courses ({publishedCourses.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:grid-cols-1">
          {publishedCourses.map((course) => (
            <Link
              href={`/course/${course._id}`}
              key={course._id}
              className="w-80"
            >
              <Course course={course} />
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
