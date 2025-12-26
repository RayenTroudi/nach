"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { NavigationButton } from "@/components/shared";
import { useTranslations } from 'next-intl';

export default function FinalCTASection() {
  const t = useTranslations('finalCTA');
  
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-brand-red-900 to-slate-900 dark:from-slate-950 dark:via-brand-red-950 dark:to-slate-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      {/* German Flag Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-black via-brand-red-500 to-brand-gold-500" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold-500/20 text-brand-gold-400 rounded-full text-sm font-medium border border-brand-gold-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold-500"></span>
            </span>
            {t('badge')}
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            {t('title')}
            <br />
            <span className="bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {t('description')}
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 py-6">
            {[
              t('benefit1'),
              t('benefit2'),
              t('benefit3'),
              t('benefit4'),
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-2 text-slate-200"
              >
                <CheckCircle2 className="h-5 w-5 text-brand-green-400" />
                <span className="font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <NavigationButton
              href="/courses"
              size="lg"
              className="w-full sm:w-auto h-14 px-10 text-lg font-semibold bg-gradient-to-r from-brand-gold-500 to-brand-gold-600 hover:from-brand-gold-600 hover:to-brand-gold-700 text-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {t('mainCTA')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </NavigationButton>
            <NavigationButton
              href="/courses"
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-10 text-lg font-semibold border-2 border-brand-red-500 text-brand-red-500 hover:bg-brand-red-500 hover:text-white"
            >
              {t('secondaryCTA')}
            </NavigationButton>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-slate-400 pt-6">
            {t('trustBadge')}
          </p>
        </motion.div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-black via-brand-red-500 to-brand-gold-500" />
    </section>
  );
}
