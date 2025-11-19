"use client";

import { useState } from "react";
import { Container } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Clock, CheckCircle2, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import BookingCalendar from "@/components/shared/BookingCalendar";

export default function BookCallPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
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
              <Phone className="w-8 h-8 text-brand-red-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Book a Quick Call
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get instant answers to your questions about studying, working, or
              living in Germany
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info Card */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-red-500" />
                    Call Details
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
                      9:00 AM - 6:00 PM CET
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      Response Time
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Same day booking available
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
                      "Quick Q&A session",
                      "Personalized advice",
                      "Resource recommendations",
                      "Next steps guidance",
                      "Follow-up email summary",
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
                    Select Your Call Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                      <Phone className="w-12 h-12 mx-auto text-brand-red-500 mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                        Book Your Quick Call
                      </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
                      Choose a convenient 30-minute time slot for a quick consultation.
                    </p>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-brand-red-500">
                        49 TND <span className="text-sm text-slate-600">(€15)</span>
                      </p>
                      <p className="text-xs text-slate-500">Quick 30-minute call</p>
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
                            Immediate email with call details and link
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            Email Reminders
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Never miss your call with automated reminders
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            Browser-Based
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            No apps needed - join from any browser
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm mb-1">
                            Flexible Scheduling
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Cancel or reschedule up to 24 hours before
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
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  What should I prepare before the call?
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Have your questions ready and any relevant documents (academic
                  transcripts, work experience, etc.) that might help us provide
                  better guidance.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  Can I reschedule my call?
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Yes, you can reschedule up to 24 hours before your scheduled
                  time through the confirmation email you&apos;ll receive.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  What if I need more time?
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  If you need more in-depth consultation, we can schedule a
                  60-minute meeting or provide additional resources after the call.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Modal */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book Your Quick Call</DialogTitle>
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
