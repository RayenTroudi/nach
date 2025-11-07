"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HelpCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { TCourse } from "@/types/models.types";
import Image from "next/image";
import Link from "next/link";
import { CourseTypeEnum } from "@/lib/enums";

interface FrequentQuestionsProps {
  courses: TCourse[];
}

export default function FrequentQuestionsSection({ courses }: FrequentQuestionsProps) {
  // Filter courses to show only "Most Frequent Questions" type courses
  const faqCourses = courses.filter(
    (course) => course.courseType === CourseTypeEnum.Most_Frequent_Questions
  );

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="p-3 bg-brand-red-100 dark:bg-brand-red-900/30 rounded-lg">
              <HelpCircle className="w-6 h-6 text-brand-red-600 dark:text-brand-red-400" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
              Most Frequent <span className="text-brand-red-500">Questions</span>
            </h2>
          </div>

          <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 text-center max-w-3xl mx-auto">
            Get answers to common questions about moving to Germany. Can't find what you're looking for? Explore our courses below.
          </p>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faqCourses.length > 0 ? (
              faqCourses.map((course, idx) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/course/${course._id}`}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-brand-red-200 dark:hover:border-brand-red-800 cursor-pointer group overflow-hidden">
                      <div className="relative w-full h-48">
                        <Image
                          src={course.thumbnail || "/images/placeholder-course.jpg"}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <h4 className="font-semibold text-lg text-slate-900 dark:text-slate-50 line-clamp-2 mb-2 group-hover:text-brand-red-600 dark:group-hover:text-brand-red-400 transition-colors">
                          {course.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {course.instructor?.firstName} {course.instructor?.lastName}
                          </span>
                          <span className="font-bold text-brand-red-600 dark:text-brand-red-400">
                            €{course.price}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  No FAQ courses available yet. Check back soon!
                </p>
              </div>
            )}
          </div>

          {faqCourses.length > 0 && (
            <div className="mt-12 text-center">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-brand-red-500 hover:bg-brand-red-600"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  View All Courses
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
