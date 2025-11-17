"use client";
import { Course } from "@/components/shared";

import { Input } from "@/components/ui/input";
import { TCategory, TCourse } from "@/types/models.types";
import { Search, X, BookOpen } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  enrolledCourses: TCourse[];
  enrolledCoursesCategories: TCategory[];
}

const Courses = ({ enrolledCourses, enrolledCoursesCategories }: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(
    null
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

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  return (
    <div className="flex flex-col gap-y-6 w-full">
      {/* Search Bar */}
      <div className="w-full relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
        <Input
          placeholder="Search your enrolled courses..."
          className="w-full pl-12 pr-12 h-14 text-base text-slate-950 dark:text-slate-200 font-medium bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:border-brand-red-500 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Filter by Category
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-brand-red-500 hover:text-brand-red-600 hover:bg-brand-red-50 dark:hover:bg-brand-red-950/30"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* All Categories Button */}
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className={`${
              !selectedCategory
                ? "bg-brand-red-500 hover:bg-brand-red-600 text-white shadow-md"
                : "border-2 border-slate-200 dark:border-slate-800 hover:border-brand-red-500 dark:hover:border-brand-red-500 bg-white dark:bg-slate-900"
            } transition-all duration-200`}
          >
            All Courses
            <Badge 
              className={`ml-2 ${
                !selectedCategory 
                  ? "bg-white/20 text-white hover:bg-white/30" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {enrolledCourses.length}
            </Badge>
          </Button>

          {/* Category Buttons */}
          {enrolledCoursesCategories.map((category: TCategory) => {
            const isActive = selectedCategory?._id === category._id;
            const categoryCount = enrolledCourses.filter(
              (course) => course.category._id === category._id
            ).length;

            return (
              <Button
                key={category._id}
                variant={isActive ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  isActive
                    ? "bg-brand-red-500 hover:bg-brand-red-600 text-white shadow-md"
                    : "border-2 border-slate-200 dark:border-slate-800 hover:border-brand-red-500 dark:hover:border-brand-red-500 bg-white dark:bg-slate-900"
                } transition-all duration-200`}
              >
                {category.name}
                <Badge 
                  className={`ml-2 ${
                    isActive 
                      ? "bg-white/20 text-white hover:bg-white/30" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {categoryCount}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium">
            Showing {filteredCourses.length} of {enrolledCourses.length} courses
          </span>
          {selectedCategory && (
            <Badge className="bg-brand-red-100 dark:bg-brand-red-900/30 text-brand-red-700 dark:text-brand-red-400 border-0">
              {selectedCategory.name}
            </Badge>
          )}
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course: TCourse) => (
            <Link key={course._id} href={`/my-learning/${course._id}`}>
              <Course course={course} showWishlistHeart={false} />
            </Link>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No courses found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Try adjusting your filters or search query
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-2 hover:border-brand-red-500"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
