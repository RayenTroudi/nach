"use client";

import { useState } from "react";
import { Container } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Clock, CheckCircle2, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const TOPICS = [
  "University Application",
  "Visa Process",
  "Language Learning",
  "Ausbildung Opportunities",
  "Job Search",
  "Housing & Relocation",
  "General Inquiry",
  "Other",
];

export default function SendMessagePage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast.success("Message sent successfully! We'll respond within 24 hours.");
      setFormData({ name: "", email: "", topic: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

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

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-red-100 dark:bg-brand-red-900/20 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-brand-red-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Send Us a Message
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Have a question or need guidance? Send us a message and we&apos;ll get
              back to you within 24 hours
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-red-500" />
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      Typical Response
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Within 24 hours
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      Availability
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      24/7 - We accept messages anytime
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      Follow-up
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Detailed email response with resources
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-red-500" />
                    Best For
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Detailed questions",
                      "Document review requests",
                      "Partnership inquiries",
                      "Course feedback",
                      "Technical support",
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

              <Card className="bg-brand-red-50 dark:bg-brand-red-900/20 border-brand-red-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    Need Immediate Help?
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    For urgent matters, consider booking a call instead.
                  </p>
                  <Link href="/contact/call">
                    <Button
                      variant="outline"
                      className="w-full border-brand-red-300 hover:bg-brand-red-100"
                    >
                      Book a Call
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Your Name *
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Topic *
                      </label>
                      <Select
                        value={formData.topic}
                        onValueChange={(value) =>
                          setFormData({ ...formData, topic: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {TOPICS.map((topic) => (
                            <SelectItem key={topic} value={topic}>
                              {topic}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Your Message *
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Tell us about your situation, questions, or what you need help with..."
                        rows={8}
                        required
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Please provide as much detail as possible to help us give
                        you the best response
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                      disabled={loading}
                    >
                      {loading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Alternative Contact */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Other Ways to Reach Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      Email
                    </p>
                    <a
                      href="mailto:contact@nachdeutschland.com"
                      className="text-sm text-brand-red-500 hover:underline"
                    >
                      contact@nachdeutschland.com
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                      Support Hours
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Monday - Friday: 9:00 AM - 6:00 PM CET
                      <br />
                      Saturday: 10:00 AM - 4:00 PM CET
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
