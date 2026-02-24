"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Course, Spinner } from "@/components/shared";
import { TCourse } from "@/types/models.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  X,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Star,
  Users,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { CourseTypeEnum, CourseLevelEnum } from "@/lib/enums";
import { useTranslations } from "next-intl";

interface CoursesContentProps {
  initialCourses: TCourse[];
}

export default function CoursesContent({ initialCourses }: CoursesContentProps) {
  const t = useTranslations('coursesPage');
  const [courses, setCourses] = useState<TCourse[]>(initialCourses);
  const [filteredCourses, setFilteredCourses] = useState<TCourse[]>(initialCourses);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: "all", name: t('categories.all'), icon: BookOpen },
    { id: "language", name: t('categories.language'), icon: GraduationCap },
    { id: "career", name: t('categories.career'), icon: TrendingUp },
    { id: "integration", name: t('categories.integration'), icon: Users },
  ];

  const levels = [
    { value: CourseLevelEnum.Beginner, label: t('levels.beginner'), color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    { value: CourseLevelEnum.Intermediate, label: t('levels.intermediate'), color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { value: CourseLevelEnum.Advanced, label: t('levels.advanced'), color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  ];

  // Update courses when initialCourses prop changes
  useEffect(() => {
    setCourses(initialCourses);
    setFilteredCourses(initialCourses);
  }, [initialCourses]);

  useEffect(() => {
    filterCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  const filterCourses = () => {
    // Start with all courses (already filtered by server for type=regular)
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (course) => course.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Level filter
    if (selectedLevel) {
      filtered = filtered.filter((course) => course.level === selectedLevel);
    }

    setFilteredCourses(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLevel(null);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all" || selectedLevel;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-brand-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-50 mb-4 sm:mb-6 px-2">
              {t('hero.title')} <span className="text-brand-red-500">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              {t('hero.subtitle')}
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto px-2"
            >
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 text-sm sm:text-base shadow-lg border-2 focus:border-brand-red-500 w-full touch-manipulation"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 touch-manipulation"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                    {t('filters.filterByLevel')}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {levels.map((level) => (
                      <Badge
                        key={level.value}
                        variant="outline"
                        className={`cursor-pointer transition-all ${
                          selectedLevel === level.value
                            ? level.color + " border-2"
                            : "hover:border-brand-red-500"
                        }`}
                        onClick={() =>
                          setSelectedLevel(selectedLevel === level.value ? null : level.value)
                        }
                      >
                        {level.label}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                {loading ? t('results.loading') : t('results.coursesFound', { count: filteredCourses.length })}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {hasActiveFilters ? t('results.filtered') : t('results.all')}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <Spinner size={48} className="text-brand-red-500 mb-4" />
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{t('results.loadingCourses')}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 sm:py-20 px-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 sm:mb-6">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                {t('empty.title')}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                {t('empty.subtitle')}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} className="bg-brand-red-500 hover:bg-brand-red-600 touch-manipulation">
                  {t('empty.clearFilters')}
                </Button>
              )}
            </motion.div>
          )}

          {/* Courses Grid */}
          {!loading && filteredCourses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {filteredCourses.map((course, idx) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Course course={course} withFramerMotionAnimation={false} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
