"use client";
import { Course } from "@/components/shared";

import { Input } from "@/components/ui/input";
import { TCategory, TCourse } from "@/types/models.types";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

interface Props {
  enrolledCourses: TCourse[];
  enrolledCoursesCategories: TCategory[];
}

const Courses = ({ enrolledCourses, enrolledCoursesCategories }: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(
    enrolledCoursesCategories.length ? enrolledCoursesCategories[0] : null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = enrolledCourses.filter((course) => {
    const matchesCategory = selectedCategory
      ? course.category._id === selectedCategory._id
      : true;
    const matchesSearchQuery = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearchQuery;
  });

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="w-full relative">
        <Input
          placeholder="Search for your learnings"
          className="w-full pl-[50px] h-[50px] text-slate-950 dark:text-slate-200 font-semibold bg-slate-100 dark:bg-slate-900 border-none outline-none rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Image
          src="/icons/search.svg"
          alt="search"
          width={20}
          height={20}
          className="absolute top-1/2 transform -translate-y-1/2 left-4"
        />
      </div>
      <div className="flex flex-col gap-y-2 items-center justify-center sm:flex-row sm:justify-start sm:gap-x-2">
        {enrolledCoursesCategories.map((category: TCategory) => (
          <div
            onClick={() => setSelectedCategory(category)}
            key={category._id}
            className={`
              w-full sm:w-[120px] h-[30px] px-2 flex items-center justify-center text-slate-950 dark:text-slate-50 font-semibold text-sm rounded-md border border-input bg-transparent cursor-pointer
              duration-300 ease-in-out transition-all hover:bg-brand-red-500 dark:hover:bg-brand-red-500 hover:text-slate-50
              ${
                selectedCategory?._id === category._id
                  ? "bg-brand-red-500 dark:bg-brand-red-500 text-slate-50"
                  : ""
              }
            `}
          >
            {category.name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
        {filteredCourses.map((course: TCourse) => (
          <Link key={course._id} href={`/my-learning/${course._id}`}>
            <Course course={course} showWishlistHeart={false} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Courses;
