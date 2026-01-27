"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles, GraduationCap, Briefcase, MapPin, FileText } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { NavigationButton } from "@/components/shared";
import { useTranslations, useLocale } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('landingPage');
  const locale = useLocale();
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Floating Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-96 h-96 bg-brand-red-500/20 dark:bg-brand-red-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-20 w-80 h-80 bg-brand-gold-500/20 dark:bg-brand-gold-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* German Flag Accent - Enhanced */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-black via-brand-red-500 to-brand-gold-500 shadow-lg" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 sm:pb-36 md:pb-40 lg:pb-44">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center -mb-20 relative z-0"
            >
              <Image
                src="/images/nobgLogo.png"
                alt="Talel Deutschland Services"
                width={1400}
                height={420}
                className="w-auto h-64 sm:h-80 md:h-[28rem] lg:h-[32rem] object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>

            {/* Hero Content Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-6 relative z-10"
            >
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                <span className="block bg-gradient-to-r from-brand-red-600 via-brand-red-500 to-brand-gold-600 bg-clip-text text-transparent drop-shadow-sm">
                  {t('heroHeadline')}
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-4">
                {t('heroDescription')}
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-2"
            >
              <NavigationButton
                href="/courses"
                size="lg"
                className="group relative w-full sm:w-auto h-16 px-12 text-lg font-semibold bg-gradient-to-r from-brand-red-600 via-brand-red-500 to-brand-red-600 hover:from-brand-red-700 hover:via-brand-red-600 hover:to-brand-red-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden rounded-xl"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t('exploreOurCourses')}
                  <ArrowRight className={`w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 ${locale === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </NavigationButton>
              
              <NavigationButton
                href="/contact/resume"
                size="lg"
                variant="outline"
                className="group w-full sm:w-auto h-16 px-12 text-lg font-semibold border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-brand-red-500 dark:hover:border-brand-red-500 hover:scale-105 transition-all duration-300 rounded-xl"
              >
                <span className="flex items-center gap-2">
                  {t('requestProfessionalResume')}
                  <FileText className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </span>
              </NavigationButton>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-32" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,64 Q240,20 480,64 T960,64 T1440,64 L1440,120 L0,120 Z" fill="currentColor" className="text-white dark:text-slate-900" opacity="0.5" />
          <path d="M0,80 Q360,40 720,80 T1440,80 L1440,120 L0,120 Z" fill="currentColor" className="text-white dark:text-slate-900" />
        </svg>
      </div>
    </section>
  );
}
