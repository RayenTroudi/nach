"use client";

import { useState } from "react";
import { Container } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, CheckCircle2, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import BookingCalendar from "@/components/shared/BookingCalendar";
import { useTranslations } from "next-intl";

export default function BookMeetingPage() {
  const t = useTranslations('bookConsultation');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // Replace with actual instructor/host MongoDB ID
  // You can fetch this from your database or environment variable
  const DEFAULT_HOST_ID = process.env.NEXT_PUBLIC_DEFAULT_HOST_ID || "675b6eb1a0d2a4e540c1d7f0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-12">
      <Container>
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8 mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Button>
        </Link>

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-red-100 dark:bg-brand-red-900/20 rounded-full mb-4">
              <Video className="w-8 h-8 text-brand-red-500" />
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
                    <CheckCircle2 className="w-5 h-5 text-brand-red-500" />
                    {t('whatsIncluded')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      t('included1'),
                      t('included2'),
                      t('included3'),
                      t('included4'),
                      t('included5'),
                      t('included6'),
                      t('included7'),
                      t('included8'),
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
                    {t('selectMeetingTime')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-brand-red-50 to-red-50 dark:from-slate-800 dark:to-slate-900 border border-brand-red-200 dark:border-brand-red-800 rounded-lg p-6 text-center">
                      <Video className="w-12 h-12 mx-auto text-brand-red-500 mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                        {t('bookYourConsultation')}
                      </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
                      {t('chooseTimeSlot')}
                    </p>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-brand-red-500">
                        {t('price')}
                      </p>
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('bookYourConsultationMeeting')}</DialogTitle>
            </DialogHeader>
            <BookingCalendar
              hostId={DEFAULT_HOST_ID}
              onBookingComplete={() => setIsBookingOpen(false)}
              price={99}
              requiresPayment={true}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </div>
  );
}
