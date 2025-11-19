"use client";

import { useState } from "react";
import { Container } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, Clock, CheckCircle2, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import BookingCalendar from "@/components/shared/BookingCalendar";

export default function BookMeetingPage() {
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
            Back to Home
          </Button>
        </Link>

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-red-100 dark:bg-brand-red-900/20 rounded-full mb-4">
              <Video className="w-8 h-8 text-brand-red-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Book a Consultation Meeting
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              In-depth consultation to create your personalized roadmap to Germany
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info Card */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-red-500" />
                    Meeting Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      Duration
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      30 minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      Availability
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Monday - Friday
                      <br />
                      9:00 AM - 5:00 PM CET
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      Format
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Video call via Jitsi (in-platform)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-red-500" />
                    What&apos;s Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Comprehensive situation analysis",
                      "Personalized pathway planning",
                      "Document review & guidance",
                      "Timeline & budget planning",
                      "University/Ausbildung recommendations",
                      "Visa strategy discussion",
                      "Action plan with next steps",
                      "Follow-up resources & materials",
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
                    Select Your Meeting Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800 rounded-lg p-6 text-center">
                      <Video className="w-12 h-12 mx-auto text-brand-red-500 mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                        Book Your Consultation
                      </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
                      Choose a convenient time slot for your personalized consultation with our expert advisors.
                    </p>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-brand-red-500">
                        99 TND <span className="text-sm text-slate-600">(€30)</span>
                      </p>
                      <p className="text-xs text-slate-500">30-minute consultation</p>
                    </div>
                      <Button 
                        onClick={() => setIsBookingOpen(true)}
                        size="lg"
                        className="bg-brand-red-500 hover:bg-brand-red-600"
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        Select Date & Time
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            Instant Confirmation
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Receive immediate email confirmation with meeting details
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            Automated Reminders
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Get reminders 30 minutes before and at meeting time
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            In-Platform Video
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Join directly from your browser - no downloads needed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            Easy Rescheduling
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Cancel or reschedule up to 24 hours before
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                        Need help? Contact us at{" "}
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
              <CardTitle>What to Expect in Your Meeting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  Before the Meeting
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You&apos;ll receive a pre-meeting questionnaire to help us understand
                  your background, goals, and current situation. This ensures we
                  make the most of our time together.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  During the Meeting
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We&apos;ll review your situation, discuss your options for studying or
                  working in Germany, create a timeline, and address any specific
                  concerns or questions you have.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  After the Meeting
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You&apos;ll receive a detailed action plan, recommended resources,
                  document checklists, and ongoing support via email for follow-up
                  questions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Modal */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book Your Consultation Meeting</DialogTitle>
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
