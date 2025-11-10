"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Phone, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ReachForMeSection() {
  const contactOptions = [
    {
      icon: Phone,
      title: "Book a Call",
      description: "Schedule a free 30-minute consultation call with our experts",
      duration: "30 minutes",
      availability: "Mon-Fri, 9 AM - 6 PM CET",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      action: "Schedule Call",
      href: "/contact/call",
      features: [
        "Personalized guidance",
        "Visa process clarity",
        "University selection help",
      ],
    },
    {
      icon: Calendar,
      title: "Book a Meeting",
      description: "In-depth 60-minute session covering your complete German pathway",
      duration: "60 minutes",
      availability: "Mon-Sat, 10 AM - 8 PM CET",
      color: "from-brand-red-500 to-brand-red-600",
      bgColor: "bg-brand-red-50 dark:bg-brand-red-900/20",
      iconColor: "text-brand-red-600 dark:text-brand-red-400",
      action: "Book Meeting",
      href: "/contact/meeting",
      features: [
        "Document review",
        "Application strategy",
        "Interview preparation",
      ],
    },
    {
      icon: MessageSquare,
      title: "Send a Message",
      description: "Quick questions? Send us a message and get a response within 24 hours",
      duration: "Response in 24h",
      availability: "24/7 Available",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      action: "Send Message",
      href: "/contact/message",
      features: [
        "Email support",
        "General inquiries",
        "Course questions",
      ],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-400/[0.05] bg-[size:20px_20px]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-red-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6 border border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            We&apos;re Online & Ready to Help
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-brand-red-400 to-brand-gold-400 bg-clip-text text-transparent">
              Reach Out
            </span>{" "}
            to Us
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Choose how you&apos;d like to connect. Our team is here to support your journey to Germany.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {contactOptions.map((option, idx) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-8 h-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-brand-red-300 dark:hover:border-brand-red-700 group">
                  {/* Icon */}
                  <div className={`inline-flex p-4 ${option.bgColor} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${option.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">
                    {option.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {option.description}
                  </p>

                  {/* Meta Info */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{option.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{option.availability}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {option.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href={option.href} className="block">
                    <Button
                      className={`w-full bg-gradient-to-r ${option.color} hover:opacity-90 text-white font-semibold group`}
                      size="lg"
                    >
                      {option.action}
                      <Icon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-3">
            Prefer Email?
          </h3>
          <p className="text-slate-300 mb-6">
            Send us an email at{" "}
            <a
              href="mailto:support@nachdeutschland.de"
              className="text-brand-red-400 hover:text-brand-red-300 font-semibold underline"
            >
              support@nachdeutschland.de
            </a>
          </p>
          <p className="text-sm text-slate-400">
            Average response time: 12 hours
          </p>
        </motion.div>
      </div>
    </section>
  );
}
