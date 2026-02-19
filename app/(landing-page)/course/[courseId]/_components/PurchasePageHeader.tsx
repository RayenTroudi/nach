"use client";
import { Container, ShowMoreLess, Spinner, Star } from "@/components/shared";
import Preview from "@/components/shared/editor/Preview";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateCourseRating, formatNumber } from "@/lib/utils";
import { TCourse } from "@/types/models.types";
import Link from "next/link";
import React from "react";
import { useTranslations } from 'next-intl';

interface Props {
  course: TCourse;
}

const PurchasePageHeader = ({ course }: Props) => {
  const { courseRating, ratingFrom } = calculateCourseRating(course);
  const t = useTranslations('course.header');

  // Early return if course data is not fully loaded
  if (!course || !course._id) {
    return (
      <div className="relative w-full py-12 lg:py-16 flex items-center justify-center">
        <Spinner size={50} />
      </div>
    );
  }

  return (
    <div className="relative w-full py-12 lg:py-16">
      <Container className="relative z-10">
        <div className="flex flex-col gap-y-6 w-full max-w-4xl">
          {/* Breadcrumb & Category */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-brand-red-500 hover:bg-brand-red-600 rounded-full px-4 py-2 text-white font-semibold shadow-lg">
              {course.category?.name ? course.category.name : <Spinner />}
            </Badge>
            {course.level && (
              <span className="text-sm text-slate-300 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                {course.level}
              </span>
            )}
          </div>

          {/* Course Title */}
          <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
            {course.title}
          </h1>

          {/* Course Description */}
          {course.description ? (
            <div className="text-slate-200 text-lg max-w-3xl">
              <Preview data={course?.description ?? ""} />
            </div>
          ) : (
            <Spinner />
          )}

          {/* Keywords */}
          {course.keywords && course.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {course.keywords?.map((keyword, key) => (
                <span
                  key={key}
                  className="px-4 py-1.5 text-sm font-medium bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-6 text-white">
            {/* Rating */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="font-bold text-xl text-yellow-400">{courseRating}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, key) => (
                  <Star
                    key={key}
                    index={key}
                    stars={courseRating}
                    filled={Boolean(courseRating > key)}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-300">({ratingFrom} {t('ratings')})</span>
            </div>

            {/* Students */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 text-brand-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="font-semibold">{formatNumber(course?.students?.length ?? 0)} {t('students')}</span>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <Link
                href={`/user/${course.instructor._id}`}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 group"
              >
                <AnimatedTooltip items={[course.instructor]} />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-300">{t('createdBy')}</span>
                  <span className="font-semibold group-hover:text-brand-red-300 transition-colors">
                    {course.instructor.username}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PurchasePageHeader;
