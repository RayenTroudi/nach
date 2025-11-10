"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { NavigationButton } from "@/components/shared";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] bg-[size:20px_20px]" />
      
      {/* German Flag Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-brand-red-500 to-brand-gold-500" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red-50 dark:bg-brand-red-900/20 text-brand-red-700 dark:text-brand-red-300 rounded-full text-sm font-medium border border-brand-red-200 dark:border-brand-red-800"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red-600"></span>
              </span>
              2,500+ Students Successfully in Germany
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-brand-red-600 via-brand-red-500 to-brand-gold-500 bg-clip-text text-transparent">
                  Nach Deutschland
                </span>
                <br />
                <span className="text-slate-900 dark:text-white">
                  Your Pathway to Germany
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl">
                Transform your dream of <span className="font-semibold text-slate-900 dark:text-white">studying</span>, <span className="font-semibold text-slate-900 dark:text-white">working</span>, or <span className="font-semibold text-slate-900 dark:text-white">living</span> in Germany into reality with expert-led courses and personalized guidance.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <NavigationButton
                href="/courses"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-gradient-to-r from-brand-red-600 to-brand-red-500 hover:from-brand-red-700 hover:to-brand-red-600 text-white shadow-button hover:shadow-button-hover transition-all duration-300 group"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </NavigationButton>
              <NavigationButton
                href="/courses"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-lg font-semibold border-2 border-brand-red-500 text-brand-red-600 dark:text-brand-red-400 hover:bg-brand-red-50 dark:hover:bg-brand-red-950/50"
              >
                Explore Pathways
              </NavigationButton>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              {[
                { icon: CheckCircle2, text: "98% Visa Approval Rate" },
                { icon: CheckCircle2, text: "Expert Instructors" },
                { icon: CheckCircle2, text: "Job Placement Support" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <item.icon className="h-5 w-5 text-brand-green-500" />
                  <span className="text-sm font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              {/* Placeholder for German cityscape image */}
              <div className="absolute inset-0 bg-brand-red-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="text-8xl font-bold mb-4">🇩🇪</div>
                  <p className="text-2xl font-semibold">Brandenburg Gate</p>
                  <p className="text-lg opacity-90">Your Future Awaits</p>
                </div>
              </div>
              
              {/* Floating Stats Cards */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute top-8 right-8 bg-white dark:bg-gradient-to-br dark:from-brand-red-500/20 dark:to-brand-red-600/30 rounded-xl shadow-lg p-4 backdrop-blur-sm bg-opacity-95 dark:border dark:border-brand-red-500/30"
              >
                <div className="text-3xl font-bold text-brand-red-600 dark:text-brand-red-300">2,500+</div>
                <div className="text-sm text-slate-600 dark:text-slate-100">Students Taught</div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute bottom-8 left-8 bg-white dark:bg-slate-900/90 rounded-xl shadow-lg p-4 backdrop-blur-sm bg-opacity-95 dark:border-2 dark:border-brand-green-400"
              >
                <div className="text-3xl font-bold text-brand-green-500 dark:text-brand-green-300">500+</div>
                <div className="text-sm text-slate-600 dark:text-slate-100">Visas Approved</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24" viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" fill="currentColor" className="text-white dark:text-slate-900" />
        </svg>
      </div>
    </section>
  );
}
