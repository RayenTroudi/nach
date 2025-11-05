"use client";
import { Card } from "@/components/ui/card";
import { CheckCircle2, BookOpen, FileCheck, Plane } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: CheckCircle2,
    title: "Assess Your Path",
    description: "Take our personalized assessment to identify the best pathway for your goals—whether it's studying, working, or living in Germany.",
    color: "brand-blue",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Learn & Prepare",
    description: "Follow our expert-led courses covering everything from German language to visa requirements and cultural integration.",
    color: "brand-red",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Apply with Confidence",
    description: "Get step-by-step guidance through the visa application process with document checklists and expert review.",
    color: "brand-gold",
  },
  {
    number: "04",
    icon: Plane,
    title: "Succeed in Germany",
    description: "Arrive prepared and confident. Join our community of successful students and professionals already living their German dream.",
    color: "brand-green",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-slate-900 dark:text-white">How </span>
            <span className="bg-gradient-to-r from-brand-red-600 to-brand-gold-500 bg-clip-text text-transparent">
              It Works
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Your journey to Germany in four simple steps
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Steps Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => {
              // Define color classes for each step
              const getColorClasses = (color: string) => {
                switch (color) {
                  case "brand-blue":
                    return {
                      badge: "bg-gradient-to-br from-brand-blue-500 to-brand-blue-600",
                      iconBg: "bg-brand-blue-50 dark:bg-brand-blue-500/20 dark:border-brand-blue-500/40",
                      iconColor: "text-brand-blue-600 dark:text-brand-blue-300",
                      dot: "dark:bg-brand-blue-500/30 dark:border-brand-blue-400",
                    };
                  case "brand-red":
                    return {
                      badge: "bg-gradient-to-br from-brand-red-500 to-brand-red-600",
                      iconBg: "bg-brand-red-50 dark:bg-brand-red-500/20 dark:border-brand-red-500/40",
                      iconColor: "text-brand-red-600 dark:text-brand-red-300",
                      dot: "dark:bg-brand-red-500/30 dark:border-brand-red-400",
                    };
                  case "brand-gold":
                    return {
                      badge: "bg-gradient-to-br from-brand-gold-500 to-brand-gold-600",
                      iconBg: "bg-brand-gold-50 dark:bg-brand-gold-500/20 dark:border-brand-gold-500/40",
                      iconColor: "text-brand-gold-600 dark:text-brand-gold-300",
                      dot: "dark:bg-brand-gold-500/30 dark:border-brand-gold-400",
                    };
                  case "brand-green":
                    return {
                      badge: "bg-gradient-to-br from-brand-green-500 to-brand-green-600",
                      iconBg: "bg-brand-green-50 dark:bg-brand-green-500/20 dark:border-brand-green-500/40",
                      iconColor: "text-brand-green-600 dark:text-brand-green-300",
                      dot: "dark:bg-brand-green-500/30 dark:border-brand-green-400",
                    };
                  default:
                    return {
                      badge: "bg-gradient-to-br from-brand-red-500 to-brand-red-600",
                      iconBg: "bg-brand-red-50 dark:bg-brand-red-500/20 dark:border-brand-red-500/40",
                      iconColor: "text-brand-red-600 dark:text-brand-red-300",
                      dot: "dark:bg-brand-red-500/30 dark:border-brand-red-400",
                    };
                }
              };

              const colors = getColorClasses(step.color);

              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <Card className="h-full border-2 border-slate-200 dark:border-brand-red-500/40 hover:border-brand-red-300 dark:hover:border-brand-red-400 hover:shadow-card-hover transition-all duration-300 bg-white dark:bg-slate-950/80 backdrop-blur-sm">
                  <div className="p-8 space-y-6">
                    {/* Icon Badge (replaces number) */}
                    <div className="relative flex justify-center">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${colors.badge} text-white shadow-lg relative z-10`}>
                        <step.icon className="h-10 w-10" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-200 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Mobile Connection Arrow */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <svg className="w-6 h-6 text-brand-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </motion.div>
            );
            })}
          </div>
        </div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-gradient-to-r from-brand-red-600 to-brand-red-500 rounded-2xl text-white"
        >
          {[
            { value: "2,500+", label: "Students Taught" },
            { value: "98%", label: "Visa Success Rate" },
            { value: "500+", label: "Visas Approved" },
            { value: "50+", label: "Partner Companies" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm md:text-base text-red-100">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
