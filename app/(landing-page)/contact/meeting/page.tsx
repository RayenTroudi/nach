"use client";

import { Container } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Clock, CheckCircle2, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BookMeetingPage() {
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
                      60 minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      Availability
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Monday - Saturday
                      <br />
                      10:00 AM - 8:00 PM CET
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      Format
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Video call via Zoom/Google Meet
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
     data-url="https://calendly.com/your-link/60min" 
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
                  You'll receive a pre-meeting questionnaire to help us understand
                  your background, goals, and current situation. This ensures we
                  make the most of our time together.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  During the Meeting
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We'll review your situation, discuss your options for studying or
                  working in Germany, create a timeline, and address any specific
                  concerns or questions you have.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                  After the Meeting
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You'll receive a detailed action plan, recommended resources,
                  document checklists, and ongoing support via email for follow-up
                  questions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
