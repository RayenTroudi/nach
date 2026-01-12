"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock, Star, GraduationCap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { TCourse } from "@/types/models.types";
import { Course } from "@/components/shared";

interface CoursesSectionProps {
  courses: TCourse[];
}

export default function CoursesSection({ courses }: CoursesSectionProps) {
  const t = useTranslations('coursesSection');
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Extract unique categories from courses
  const extractCategories = () => {
    const uniqueCategories = new Set(
      courses.map((course) => course.category?.name).filter(Boolean)
    );
    return Array.from(uniqueCategories);
  };

  const categories = [
    { name: "All", label: t('categoryAll'), color: "bg-slate-500" },
    ...extractCategories().map((cat, idx) => ({
      name: cat,
      label: cat,
      color: [
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-orange-500",
        "bg-pink-500",
        "bg-indigo-500",
      ][idx % 6],
    })),
  ];

  // Filter courses based on selected category
  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter(
          (course) => course.category?.name === selectedCategory
        );

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              {t('title')}{" "}
              <span className="text-brand-red-500">{t('titleHighlight')}</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Button
                variant={selectedCategory === cat.name ? "default" : "outline"}
                className={`rounded-full ${
                  selectedCategory === cat.name
                    ? "bg-brand-red-500 hover:bg-brand-red-600 text-white"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                <span className={`w-2 h-2 rounded-full ${cat.color} mr-2`} />
                {cat.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
              {t('noCourses')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('noCoursesDesc', { category: selectedCategory })}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredCourses.slice(0, 6).map((course, idx) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Course
                    course={course}
                    withFramerMotionAnimation={false}
                    showWishlistHeart={true}
                  />
                </motion.div>
              ))}
            </div>

            {/* View All Courses Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-brand-red-500 hover:bg-brand-red-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  {t('viewAllCourses')}
                </Button>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
