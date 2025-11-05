"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Briefcase, Home, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const pathways = [
  {
    icon: BookOpen,
    title: "Study Path",
    subtitle: "From Application to Acceptance",
    description: "Master the German university system, ace your language tests, and secure your student visa—all in one structured pathway.",
    features: [
      "University Selection Guide",
      "Visa Application Process",
      "German Language B2/C1",
      "Application Documents",
    ],
    color: "brand-blue",
    link: "/courses?category=study",
  },
  {
    icon: Briefcase,
    title: "Work Path",
    subtitle: "Launch Your Career in Germany",
    description: "Land your dream job with Germany's top employers. Learn job search strategies, CV optimization, and interview skills from industry experts.",
    features: [
      "Job Search Strategies",
      "German CV & Cover Letter",
      "Interview Preparation",
      "Skilled Worker Visa",
    ],
    color: "brand-red",
    link: "/courses?category=work",
  },
  {
    icon: Home,
    title: "Live Path",
    subtitle: "Make Germany Your Home",
    description: "Integrate seamlessly into German life. From finding housing to understanding culture, we'll guide you every step of the way.",
    features: [
      "Housing & Accommodation",
      "Cultural Integration",
      "Daily Life Essentials",
      "Permanent Residency",
    ],
    color: "brand-green",
    link: "/courses?category=living",
  },
];

export default function PathwaysSection() {
  return (
    <section className="py-24 bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:to-slate-900">
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
            <span className="text-slate-900 dark:text-white">Choose Your </span>
            <span className="bg-gradient-to-r from-brand-red-600 to-brand-gold-500 bg-clip-text text-transparent">
              German Pathway
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Whether you're pursuing education, career opportunities, or a new life in Germany, we have a tailored pathway for your journey.
          </p>
        </motion.div>

        {/* Pathways Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pathways.map((pathway, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group h-full border-2 border-slate-200 dark:border-brand-red-500/30 hover:border-brand-red-300 dark:hover:border-brand-red-500 transition-all duration-300 hover:shadow-card-hover overflow-hidden dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50 dark:backdrop-blur-sm">
                <CardContent className="p-8 space-y-6">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-xl bg-${pathway.color}-50 dark:bg-${pathway.color}-900/20 group-hover:scale-110 transition-transform duration-300`}>
                    <pathway.icon className={`h-8 w-8 text-${pathway.color}-600 dark:text-${pathway.color}-400`} />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {pathway.title}
                    </h3>
                    <p className="text-sm font-semibold text-brand-red-600 dark:text-brand-red-400">
                      {pathway.subtitle}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {pathway.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {pathway.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <svg className="h-5 w-5 text-brand-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href={pathway.link}>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-brand-red-600 group-hover:text-white group-hover:border-brand-red-600 transition-all duration-300"
                    >
                      Explore Path
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Not sure which path is right for you?
          </p>
          <Link href="/interests">
            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-gold-500 to-brand-gold-600 hover:from-brand-gold-600 hover:to-brand-gold-700 text-slate-900 font-semibold shadow-lg"
            >
              Take Our 3-Minute Assessment
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
