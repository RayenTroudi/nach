"use client";

import { useState } from "react";
import { Container } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, Clock, CheckCircle2, Calendar, ArrowLeft } from "lucide-react";
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
          <Button variant="ghost" className="mb-6">
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
                    <Clock className="w-5 h-5 text-brand-red-500" />
                    {t('meetingDetails')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      {t('duration')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('durationValue')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      {t('availability')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('availabilityValue')}
                      <br />
                      {t('availabilityTime')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      {t('format')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('formatValue')}
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
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('consultationDuration')}</p>
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
                            {t('instantConfirmation')}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {t('instantConfirmationDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            {t('automatedReminders')}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {t('automatedRemindersDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            {t('inPlatformVideo')}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {t('inPlatformVideoDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            {t('easyRescheduling')}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {t('easyReschedulingDesc')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                        {t('needHelp')}{" "}
                        <a
                          href="mailto:support@nachdeutschland.de"
                          className="text-brand-red-500 hover:underline"
                        >
                          support@nachdeutschland.de
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* What to Expect */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t('whatToExpect')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  {t('beforeMeeting')}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('beforeMeetingDesc')}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  {t('duringMeeting')}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('duringMeetingDesc')}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  {t('afterMeeting')}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('afterMeetingDesc')}
                </p>
              </div>
            </CardContent>
          </Card>
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
