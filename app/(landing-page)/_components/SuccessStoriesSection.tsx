"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, Play, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const successStories = [
  {
    name: "Sarah Ahmed",
    country: "Egypt",
    pathway: "Study Path",
    achievement: "Accepted to TU Berlin",
    image: "🎓",
    quote: "From Cairo to Berlin: How I got my student visa in just 3 months with Nach's guidance. The step-by-step courses made everything so clear!",
    timeframe: "3 months",
    bgColor: "bg-brand-blue-50 dark:bg-brand-blue-900/20",
  },
  {
    name: "Mohammed Hassan",
    country: "Pakistan",
    pathway: "Work Path",
    achievement: "Software Engineer at SAP",
    image: "💼",
    quote: "The job search strategies and CV optimization course helped me land my dream job at SAP Munich. Worth every minute!",
    timeframe: "5 months",
    bgColor: "bg-brand-red-50 dark:bg-brand-red-900/20",
  },
  {
    name: "Priya Patel",
    country: "India",
    pathway: "Study Path",
    achievement: "Master's at Heidelberg University",
    image: "🌟",
    quote: "The B2 German preparation and university application guidance were game-changers. Now I'm living my dream in Heidelberg!",
    timeframe: "4 months",
    bgColor: "bg-brand-green-50 dark:bg-brand-green-900/20",
  },
];

export default function SuccessStoriesSection() {
  return (
    <section className="py-24 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-slate-900 dark:text-white">Success </span>
            <span className="bg-gradient-to-r from-brand-red-600 to-brand-gold-500 bg-clip-text text-transparent">
              Stories
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Join thousands of students and professionals who&apos;ve successfully moved to Germany with our guidance
          </p>
        </motion.div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {successStories.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-2 border-slate-200 dark:border-brand-gold-500/30 hover:border-brand-red-300 dark:hover:border-brand-gold-500 hover:shadow-card-hover transition-all duration-300 overflow-hidden group dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50">
                <CardContent className="p-0">
                  {/* Image/Video Placeholder */}
                  <div className={`relative h-48 ${story.bgColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                    <div className="text-6xl">{story.image}</div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-8 w-8 text-brand-red-600 ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-slate-800/90 dark:backdrop-blur-sm rounded-full text-xs font-semibold text-brand-red-600 dark:text-brand-gold-300 dark:border dark:border-brand-gold-400/50 dark:shadow-lg">
                      {story.timeframe}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Quote Icon */}
                    <Quote className="h-8 w-8 text-brand-gold-500 opacity-50" />

                    {/* Quote Text */}
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      &quot;{story.quote}&quot;
                    </p>

                    {/* Author Info */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            {story.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            From {story.country}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-brand-red-600 dark:text-brand-red-400">
                            {story.pathway}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {story.achievement}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Video Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-brand-red-600 to-brand-red-500 rounded-2xl p-8 md:p-12 text-white text-center"
        >
          <h3 className="text-3xl font-bold mb-4">
            Watch More Success Stories
          </h3>
          <p className="text-red-100 mb-8 max-w-2xl mx-auto">
            Hear directly from students and professionals who transformed their lives with our Germany pathways
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-brand-red-600 hover:bg-red-50"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Video Testimonials
            </Button>
            <Link href="/courses">
              <Button
                size="lg"
                className="bg-white text-brand-red-600 transition-all duration-300"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
