"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles, GraduationCap, Briefcase, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { NavigationButton } from "@/components/shared";
import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('landingPage');
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            {/* Headline with enhanced styling */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-red-50 to-brand-gold-50 dark:from-brand-red-950/30 dark:to-brand-gold-950/30 rounded-full border border-brand-red-200/50 dark:border-brand-red-800/50 shadow-lg"
              >
                <Sparkles className="w-5 h-5 text-brand-gold-500" />
                <span className="text-sm font-semibold bg-gradient-to-r from-brand-red-600 to-brand-gold-600 bg-clip-text text-transparent">
                  Your Gateway to Germany
                </span>
              </motion.div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] tracking-tight">
                <span className="block mb-3 bg-gradient-to-r from-brand-red-600 via-brand-red-500 to-brand-gold-500 bg-clip-text text-transparent">
                  {t('mainHeading')}
                </span>
                <span className="block text-slate-900 dark:text-white">
                  {t('subHeading')}
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl md:text-3xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
                {t('description')}
              </p>
            </div>

            {/* Enhanced CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <NavigationButton
                href="/courses"
                size="lg"
                className="group relative w-full sm:w-auto h-16 px-10 text-lg font-bold bg-gradient-to-r from-brand-red-600 via-brand-red-500 to-brand-red-600 hover:from-brand-red-700 hover:via-brand-red-600 hover:to-brand-red-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden rounded-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('startJourney')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </NavigationButton>
              
              <NavigationButton
                href="/courses"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-16 px-10 text-lg font-bold border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-300 rounded-xl"
              >
                {t('explorePathways')}
              </NavigationButton>
            </motion.div>

            {/* Enhanced Trust Indicators - Card Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto pt-8"
            >
              {[
                { 
                  icon: CheckCircle2, 
                  text: t('visaApproval'),
                  gradient: "from-green-500 to-emerald-500"
                },
                { 
                  icon: GraduationCap, 
                  text: t('expertInstructors'),
                  gradient: "from-blue-500 to-cyan-500"
                },
                { 
                  icon: Briefcase, 
                  text: t('jobPlacement'),
                  gradient: "from-purple-500 to-pink-500"
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                      {item.text}
                    </span>
                  </div>
                  {/* Hover effect glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
                </motion.div>
              ))}
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
