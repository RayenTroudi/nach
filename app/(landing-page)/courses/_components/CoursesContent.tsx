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

export default function CoursesContent() {
  const t = useTranslations('coursesPage');
  const [courses, setCourses] = useState<TCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<TCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
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

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses?type=regular");
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const filterCourses = () => {
    // Start with all courses (already filtered by API for type=regular)
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

  // Show full-screen loader on initial page load
  if (initialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Spinner size={64} className="text-brand-red-500 mx-auto mb-4" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-brand-red-200 dark:border-brand-red-900 rounded-full mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            {t('loading.title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {t('loading.subtitle')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-50 mb-6">
              {t('hero.title')} <span className="text-brand-red-500">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              {t('hero.subtitle')}
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-12 h-14 text-base shadow-lg border-2 focus:border-brand-red-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X className="w-5 h-5" />
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
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {loading ? t('results.loading') : t('results.coursesFound', { count: filteredCourses.length })}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {hasActiveFilters ? t('results.filtered') : t('results.all')}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size={48} className="text-brand-red-500 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">{t('results.loadingCourses')}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                <BookOpen className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                {t('empty.title')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {t('empty.subtitle')}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} className="bg-brand-red-500 hover:bg-brand-red-600">
                  {t('empty.clearFilters')}
                </Button>
              )}
            </motion.div>
          )}

          {/* Courses Grid */}
          {!loading && filteredCourses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
