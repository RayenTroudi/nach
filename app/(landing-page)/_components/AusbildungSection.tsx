"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Briefcase, Clock, ExternalLink, Loader2, Search, Filter, X, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AusbildungJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  url: string;
}

// Popular job types in Germany
const popularSearches = [
  "Pflegefachmann/-frau",
  "Kaufmann/-frau",
  "IT-Spezialist",
  "Mechatroniker",
  "Einzelhandelskaufmann/-frau",
  "Koch/Köchin"
];

// Popular cities
const popularCities = [
  "Berlin",
  "München",
  "Hamburg",
  "Frankfurt",
  "Köln",
  "Stuttgart",
  "Düsseldorf",
  "Leipzig"
];

export default function AusbildungSection() {
  const [jobs, setJobs] = useState<AusbildungJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("Pflegefachmann");
  const [location, setLocation] = useState("Berlin");
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(6);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (customSearch?: string, customLocation?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const search = customSearch || searchTerm;
      const loc = customLocation || location;
      
      const response = await fetch(`/api/ausbildung?search=${encodeURIComponent(search)}&location=${encodeURIComponent(loc)}`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      
      const data = await response.json();
      setJobs(data.opportunities || []);
      setDisplayCount(6); // Reset display count on new search
      setError(null);
    } catch (err) {
      setError("Failed to load job opportunities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleQuickSearch = (search: string, loc?: string) => {
    setSearchTerm(search);
    if (loc) setLocation(loc);
    fetchJobs(search, loc || location);
  };

  const displayedJobs = jobs.slice(0, displayCount);
  const hasMore = jobs.length > displayCount;

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            <span className="text-brand-red-500">Ausbildung</span> Opportunities
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6">
            Live opportunities from <strong>ausbildung.de</strong> - Germany's leading vocational training platform
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Job title or keyword (e.g., Pflegefachmann)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="City (e.g., Berlin)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="bg-brand-red-500 hover:bg-brand-red-600 h-12 px-8"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>

          {/* Quick Filters Toggle */}
          <div className="mt-4 flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-slate-600 dark:text-slate-400"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Quick Filters
              {showFilters ? <X className="w-4 h-4 ml-2" /> : null}
            </Button>
          </div>
        </motion.div>

        {/* Quick Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto mb-8 overflow-hidden"
            >
              <Card className="p-6">
                {/* Popular Job Types */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Popular Job Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <Badge
                        key={search}
                        variant="outline"
                        className="cursor-pointer hover:bg-brand-red-50 hover:border-brand-red-500 hover:text-brand-red-700 dark:hover:bg-brand-red-950/50 dark:hover:border-brand-red-500 transition-colors"
                        onClick={() => handleQuickSearch(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Popular Cities */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Popular Cities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularCities.map((city) => (
                      <Badge
                        key={city}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:border-blue-500 transition-colors"
                        onClick={() => handleQuickSearch(searchTerm, city)}
                      >
                        {city}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        {!loading && jobs.length > 0 && (
          <div className="text-center mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Found <strong className="text-brand-red-600 dark:text-brand-red-400">{jobs.length}</strong> opportunities
              {searchTerm && (
                <>
                  {" "}for <strong>{searchTerm}</strong>
                </>
              )}
              {location && (
                <>
                  {" "}in <strong>{location}</strong>
                </>
              )}
            </p>
          </div>
        )}

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
            <Button onClick={() => fetchJobs()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No opportunities found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Try adjusting your search terms or location
            </p>
            <Button onClick={() => handleQuickSearch("Pflegefachmann", "Berlin")} variant="outline">
              Reset to Default Search
            </Button>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && !error && displayedJobs.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedJobs.map((job, idx) => (
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

            {/* Load More / View All */}
            <div className="text-center space-y-4">
              {hasMore && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setDisplayCount(displayCount + 6)}
                  className="border-2 border-slate-300 dark:border-slate-600 hover:border-brand-red-500 hover:text-brand-red-600 dark:hover:border-brand-red-500"
                >
                  Load More ({jobs.length - displayCount} remaining)
                </Button>
              )}
              <div>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-brand-red-500 text-brand-red-600 dark:text-brand-red-400 hover:bg-brand-red-50 dark:hover:bg-brand-red-950/50"
                  onClick={() =>
                    window.open(
                      `https://www.ausbildung.de/suche/?search=${encodeURIComponent(searchTerm)}%7C${encodeURIComponent(location)}`,
                      "_blank"
                    )
                  }
                >
                  View All on ausbildung.de
                  <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
