"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface Document {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  category: string;
  downloads: number;
  createdAt: string;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
}

interface DocumentsSectionProps {
  documents: Document[];
}

export default function DocumentsSection({ documents }: DocumentsSectionProps) {
  const t = useTranslations('documentsSection');
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Avoid hydration mismatch by only rendering dates on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { name: "All", label: t('categoryAll'), color: "bg-slate-500" },
    { name: "Visa", label: t('categoryVisa'), color: "bg-blue-500" },
    { name: "Application", label: t('categoryApplication'), color: "bg-green-500" },
    { name: "Language", label: t('categoryLanguage'), color: "bg-purple-500" },
    { name: "Certificate", label: t('categoryCertificate'), color: "bg-orange-500" },
    { name: "Guide", label: t('categoryGuide'), color: "bg-pink-500" },
  ];

  // Filter documents based on selected category
  const filteredDocuments = selectedCategory === "All" 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  const formatDate = (dateString: string) => {
    if (!mounted) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownload = async (doc: Document) => {
    try {
      // Track download
      await fetch(`/api/documents/${doc._id}/download`, {
        method: "POST",
      });

      // Download file
      const response = await fetch(doc.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              {t('title')} <span className="text-brand-red-500">{t('titleHighlight')}</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Button
                variant={selectedCategory === cat.name ? "default" : "outline"}
                className={`rounded-full ${
                  selectedCategory === cat.name 
                    ? "bg-brand-red-500 hover:bg-brand-red-600 text-white" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                <span className={`w-2 h-2 rounded-full ${cat.color} mr-2`} />
                {cat.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
              {t('noDocuments')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('noDocumentsDesc', { category: selectedCategory })}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.slice(0, 6).map((doc, idx) => (
            <motion.div
              key={doc._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-brand-red-200 dark:hover:border-brand-red-800 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-brand-red-50 dark:bg-brand-red-900/20 rounded-lg group-hover:bg-brand-red-100 dark:group-hover:bg-brand-red-900/40 transition-colors">
                    <FileText className="w-6 h-6 text-brand-red-600 dark:text-brand-red-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {doc.category}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2 line-clamp-2">
                  {doc.title}
                </h3>

                {doc.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{doc.downloads}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span suppressHydrationWarning>
                      {formatDate(doc.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-brand-red-500 hover:bg-brand-red-600"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('download')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(doc.fileUrl, "_blank")}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/documents">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-brand-red-500 text-brand-red-600 dark:text-brand-red-400 hover:bg-brand-red-50 dark:hover:bg-brand-red-950/50"
            >
              {t('viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
