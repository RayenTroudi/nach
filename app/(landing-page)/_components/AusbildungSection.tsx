"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Clock, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface AusbildungJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  url: string;
}

export default function AusbildungSection() {
  const [jobs, setJobs] = useState<AusbildungJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch from API route
      const response = await fetch("/api/ausbildung?search=Pflegefachmann&location=Berlin");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      
      const data = await response.json();
      setJobs(data.opportunities || []);
      setError(null);
    } catch (err) {
      setError("Failed to load job opportunities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            <span className="text-brand-red-500">Ausbildung</span> Opportunities
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Live opportunities from <strong>ausbildung.de</strong> - Germany's leading vocational training platform
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Showing: Pflegefachmann/-frau | Berlin
            </span>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-brand-red-500 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading opportunities...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchJobs} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && !error && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {jobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 hover:border-brand-red-200 dark:hover:border-brand-red-800 group">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">
                        {job.type}
                      </Badge>
                      <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-brand-red-500 transition-colors" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2 line-clamp-2 group-hover:text-brand-red-600 dark:group-hover:text-brand-red-400 transition-colors">
                      {job.title}
                    </h3>

                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                      {job.company}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-grow">
                      {job.description}
                    </p>

                    <Button
                      className="w-full bg-brand-red-500 hover:bg-brand-red-600 group"
                      onClick={() => window.open(job.url, "_blank")}
                    >
                      View Details
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-brand-red-500 text-brand-red-600 dark:text-brand-red-400 hover:bg-brand-red-50 dark:hover:bg-brand-red-950/50"
                onClick={() =>
                  window.open(
                    "https://www.ausbildung.de/suche/?search=Pflegefachmann%2F-frau%7C10245+Berlin",
                    "_blank"
                  )
                }
              >
                View All Opportunities on ausbildung.de
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
