"use client";

import { useState } from "react";
import { Container } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Clock, CheckCircle2, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import BookingCalendar from "@/components/shared/BookingCalendar";
import { useTranslations } from 'next-intl';

export default function BookCallPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const DEFAULT_HOST_ID = process.env.NEXT_PUBLIC_DEFAULT_HOST_ID || "675b6eb1a0d2a4e540c1d7f0";
  const t = useTranslations('contact.call');
  const tCommon = useTranslations('common');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 pt-20 pb-12">
      <Container>
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Button>
        </Link>

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-red-100 dark:bg-brand-red-900/20 rounded-full mb-4">
              <Phone className="w-8 h-8 text-brand-red-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info Card */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-red-500" />
                    {t('detailsTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      {t('duration')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('duration30min')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      {t('availability')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400" style={{ whiteSpace: 'pre-line' }}>
                      {t('availabilityWeekdays')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      {t('responseTime')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('sameDayBooking')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-red-500" />
                    {t('whatsIncluded')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      t('features.qanda'),
                      t('features.advice'),
                      t('features.resources'),
                      t('features.guidance'),
                      t('features.summary'),
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                      >
                        <CheckCircle2 className="w-4 h-4 text-brand-red-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Booking Interface */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-red-500" />
                    {t('selectTimeTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                      <Phone className="w-12 h-12 mx-auto text-brand-red-500 mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                        {t('bookCallTitle')}
                      </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
                      {t('bookCallDescription')}
                    </p>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-brand-red-500">
                        {t('priceLabel')} <span className="text-sm text-slate-600">(€15)</span>
                      </p>
                      <p className="text-xs text-slate-500">{t('priceNote')}</p>
                    </div>
                      <Button 
                        onClick={() => setIsBookingOpen(true)}
                        size="lg"
                        className="bg-brand-red-500 hover:bg-brand-red-600"
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        {t('selectDateTime')}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            {t('benefits.confirmation')}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {t('benefits.confirmationDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            {t('benefits.reminders')}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {t('benefits.remindersDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            {t('benefits.browserBased')}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {t('benefits.browserBasedDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            {t('benefits.flexible')}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {t('benefits.flexibleDesc')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t('faqTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  {t('faq1Question')}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('faq1Answer')}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  {t('faq2Question')}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('faq2Answer')}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  {t('faq3Question')}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('faq3Answer')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Modal */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('bookYourCall')}</DialogTitle>
            </DialogHeader>
            <BookingCalendar
              hostId={DEFAULT_HOST_ID}
              onBookingComplete={() => setIsBookingOpen(false)}
              price={49}
              requiresPayment={true}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </div>
  );
}
