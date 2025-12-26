"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Course } from "@/components/shared";
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
  Loader2,
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
    let filtered = courses.filter(
      (course) => course.courseType === CourseTypeEnum.Regular
    );

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
            <Loader2 className="w-16 h-16 animate-spin text-brand-red-500 mx-auto mb-4" />
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

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {[
                { icon: BookOpen, label: t('stats.courses'), value: courses.length },
                { icon: Users, label: t('stats.students'), value: "10,000+" },
                { icon: Star, label: t('stats.rating'), value: "4.8" },
                { icon: GraduationCap, label: t('stats.instructors'), value: "50+" },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-3 bg-brand-red-100 dark:bg-brand-red-900/30 rounded-lg">
                    <stat.icon className="w-6 h-6 text-brand-red-600 dark:text-brand-red-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

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

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${
                    isActive
                      ? "bg-brand-red-500 hover:bg-brand-red-600 text-white"
                      : "border-2 hover:border-brand-red-500"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-2 hover:border-brand-red-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('filters.moreFilters')}
              {hasActiveFilters && (
                <Badge className="ml-2 bg-brand-red-500 hover:bg-brand-red-600">
                  {[searchTerm, selectedCategory !== "all", selectedLevel].filter(Boolean).length}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-brand-red-600 dark:text-brand-red-400"
              >
                <X className="w-4 h-4 mr-2" />
                {t('filters.clearAll')}
              </Button>
            )}
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
              <Loader2 className="w-12 h-12 animate-spin text-brand-red-500 mb-4" />
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
