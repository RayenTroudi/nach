"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { TCourse } from "@/types/models.types";
import Image from "next/image";
import Link from "next/link";

interface FrequentQuestionsProps {
  courses: TCourse[];
}

export default function FrequentQuestionsSection({ courses }: FrequentQuestionsProps) {
  const faqs = [
    {
      question: "What are the requirements to study in Germany?",
      answer:
        "To study in Germany, you typically need a recognized school-leaving certificate, proof of German language proficiency (TestDaF or DSH), financial proof (blocked account with €11,208/year), health insurance, and a valid passport. Our courses guide you through each requirement step-by-step.",
    },
    {
      question: "How long does the visa process take?",
      answer:
        "The German student visa process typically takes 6-12 weeks after submitting your application. We recommend applying 3-4 months before your intended travel date. Our visa preparation courses help you avoid common delays.",
    },
    {
      question: "Do I need to know German before arriving?",
      answer:
        "It depends on your program. Most undergraduate programs require German (B2-C1 level), while many Master's programs are offered in English. However, knowing basic German (A1-A2) is essential for daily life. Check our German language courses.",
    },
    {
      question: "What are the costs of living in Germany?",
      answer:
        "Students typically need €850-1,200 per month for living expenses, including accommodation (€300-500), food (€200-250), health insurance (€110), and transportation (€80-100). Our courses include detailed budgeting guides.",
    },
    {
      question: "Can I work while studying in Germany?",
      answer:
        "Yes! International students can work 120 full days or 240 half days per year without special permission. During semester breaks, you can work full-time. Our courses cover work permit regulations and job search strategies.",
    },
    {
      question: "What is an Ausbildung and how does it differ from university?",
      answer:
        "Ausbildung is Germany's dual vocational training system combining practical work (3-4 days/week) with classroom education. You earn a salary while learning. Unlike university, it's more hands-on and leads directly to professional qualifications.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-red-100 dark:bg-brand-red-900/30 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-brand-red-600 dark:text-brand-red-400" />
                </div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
                  Most Frequent <span className="text-brand-red-500">Questions</span>
                </h2>
              </div>

              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Get answers to common questions about moving to Germany. Can't find what you're looking for? Explore our courses below.
              </p>

              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <AccordionItem
                      value={`item-${idx}`}
                      className="border-2 border-slate-200 dark:border-slate-700 rounded-lg px-6 hover:border-brand-red-300 dark:hover:border-brand-red-700 transition-colors"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-semibold text-slate-900 dark:text-slate-50">
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 dark:text-slate-400 pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>

              <div className="mt-8">
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-brand-red-500 text-brand-red-600 dark:text-brand-red-400 hover:bg-brand-red-50 dark:hover:bg-brand-red-950/50"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Ask a Question
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Related Courses */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Learn More in Our Courses
                </h3>
              </div>

              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Deep-dive into these topics with expert-led courses
              </p>

              <div className="space-y-4">
                {courses.slice(0, 4).map((course, idx) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link href={`/course/${course._id}`}>
                      <Card className="p-4 hover:shadow-lg transition-all duration-300 border-2 hover:border-brand-red-200 dark:hover:border-brand-red-800 cursor-pointer group">
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={course.thumbnail || "/images/placeholder-course.jpg"}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-50 line-clamp-2 mb-2 group-hover:text-brand-red-600 dark:group-hover:text-brand-red-400 transition-colors">
                              {course.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
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
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                  >
                    View All Courses
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
