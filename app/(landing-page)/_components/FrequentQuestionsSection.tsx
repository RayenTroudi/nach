"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HelpCircle, BookOpen, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TCourse } from "@/types/models.types";
import Image from "next/image";
import Link from "next/link";
import { CourseTypeEnum } from "@/lib/enums";
import FAQVideoPlayer from "./FAQVideoPlayer";
import { useTranslations } from 'next-intl';

interface FrequentQuestionsProps {
  courses: TCourse[];
}

export default function FrequentQuestionsSection({ courses }: FrequentQuestionsProps) {
  const [selectedCourse, setSelectedCourse] = useState<TCourse | null>(null);
  const t = useTranslations('faq');

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
              <span className="text-brand-red-500">{t('title')}</span>
            </h2>
          </div>

          <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 text-center max-w-3xl mx-auto">
            {t('subtitle')}
          </p>

          {/* Video Player Modal */}
          <AnimatePresence>
            {selectedCourse && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedCourse(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-4xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FAQVideoPlayer
                    course={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                    autoPlay={true}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
                  <Card
                    className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-brand-red-200 dark:hover:border-brand-red-800 cursor-pointer group overflow-hidden"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="relative w-full aspect-[9/16]">
                      <Image
                        src={course.thumbnail || "/images/placeholder-course.jpg"}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-brand-red-500 rounded-full p-4">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
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
                        <Button
                          size="sm"
                          className="bg-brand-red-500 hover:bg-brand-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCourse(course);
                          }}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          {t('watchVideo')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  {t('noCoursesAvailable')}
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
                  {t('checkBackSoon')}
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
