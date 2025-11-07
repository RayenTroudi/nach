"use client";

import { Container } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Clock, CheckCircle2, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BookCallPage() {
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
                    What's Included
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

            {/* Calendly Embed */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardContent className="p-0">
                  <div className="aspect-[9/16] lg:aspect-auto lg:h-[700px] w-full">
                    {/* Replace with your Calendly link */}
                    <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div className="text-center p-8">
                        <Calendar className="w-16 h-16 mx-auto text-brand-red-500 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                          Calendly Integration
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                          To enable booking, add your Calendly embed code below.
                          Replace this placeholder with your Calendly widget.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-left">
                          <code className="text-xs text-slate-700 dark:text-slate-300">
                            {`<!-- Calendly inline widget begin -->
<div class="calendly-inline-widget" 
     data-url="https://calendly.com/your-link/30min" 
     style="min-width:320px;height:700px;">
</div>
<script type="text/javascript" 
        src="https://assets.calendly.com/assets/external/widget.js" 
        async>
</script>
<!-- Calendly inline widget end -->`}
                          </code>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                          Or contact us directly at{" "}
                          <a
                            href="mailto:contact@nachdeutschland.com"
                            className="text-brand-red-500 hover:underline"
                          >
                            contact@nachdeutschland.com
                          </a>
                        </p>
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
                  time through the confirmation email you'll receive.
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
      </Container>
    </div>
  );
}
