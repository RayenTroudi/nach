"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Eye, Calendar, FolderOpen, Package, ShoppingCart, Lock, Folder, Info } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { scnToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import BankTransferUpload from "../course/[courseId]/_components/BankTransferUpload";

interface DocumentItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  createdAt: string;
  itemType?: "document" | "bundle";
  // Document fields
  fileUrl?: string;
  fileName?: string;
  downloads?: number;
  isForSale?: boolean;
  // Bundle fields
  price?: number;
  currency?: string;
  documents?: Array<{
    _id: string;
    title: string;
  }>;
  isFolder?: boolean;
  childBundleCount?: number;
  totalFileCount?: number;
  childBundles?: Array<{
    _id: string;
    title: string;
    fileCount: number;
    documents?: Array<{
      _id: string;
      title: string;
      fileName: string;
    }>;
  }>;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
}

interface DocumentsSectionProps {
  documents: DocumentItem[];
}

export default function DocumentsSection({ documents }: DocumentsSectionProps) {
  const t = useTranslations('documentsSection');
  const tStorefront = useTranslations('storefront');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [carouselRef, setCarouselRef] = useState<any>(null);
  
  // Bundle preview dialog state
  const [previewBundle, setPreviewBundle] = useState<DocumentItem | null>(null);
  const [isBundlePreviewOpen, setIsBundlePreviewOpen] = useState(false);
  
  // Folder preview dialog state
  const [previewFolder, setPreviewFolder] = useState<DocumentItem | null>(null);
  const [isFolderPreviewOpen, setIsFolderPreviewOpen] = useState(false);
  
  // Purchase dialog state
  const [selectedItem, setSelectedItem] = useState<DocumentItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleDownload = async (item: DocumentItem) => {
    // For documents, handle download
    if (item.itemType === "document") {
      if (!item.fileUrl || !item.fileName) return;
      
      try {
        // Track download
        await fetch(`/api/documents/${item._id}/download`, {
          method: "POST",
        });

        // Download file
        const response = await fetch(item.fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };
  
  const handleBundlePreview = (item: DocumentItem) => {
    // Check if this is a folder (has no documents but has child bundles)
    const isFolder = item.isFolder || ((!item.documents || item.documents.length === 0) && item.childBundleCount && item.childBundleCount > 0);
    
    console.log('DocumentsSection handleBundlePreview:', {
      title: item.title,
      isFolder: item.isFolder,
      documentsLength: item.documents?.length,
      childBundleCount: item.childBundleCount,
      childBundles: item.childBundles,
      detectedAsFolder: isFolder
    });
    
    if (isFolder) {
      console.log('Opening folder preview dialog');
      setPreviewFolder(item);
      setIsFolderPreviewOpen(true);
    } else {
      console.log('Opening bundle preview dialog');
      setPreviewBundle(item);
      setIsBundlePreviewOpen(true);
    }
  };
  
  const handlePurchase = (item: DocumentItem) => {
    if (!isSignedIn) {
      toast.error(tStorefront("signInRequired"));
      router.push("/sign-in");
      return;
    }
    setSelectedItem(item);
    setIsDialogOpen(true);
  };
  
  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return tStorefront("free");
    const symbol = currency === "usd" ? "$" : currency === "tnd" ? "TND" : currency;
    return `${symbol}${price}`;
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
                <span className={`w-2 h-2 rounded-full ${cat.color} ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {cat.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Documents Carousel */}
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
          <div className="relative">
            <Carousel
              ref={setCarouselRef}
              responsive={{
                superLargeDesktop: {
                  breakpoint: { max: 4000, min: 1536 },
                  items: 4,
                  slidesToSlide: 1,
                },
                desktop: {
                  breakpoint: { max: 1536, min: 1024 },
                  items: 3,
                  slidesToSlide: 1,
                },
                tablet: {
                  breakpoint: { max: 1024, min: 640 },
                  items: 2,
                  slidesToSlide: 1,
                },
                mobile: {
                  breakpoint: { max: 640, min: 0 },
                  items: 1,
                  slidesToSlide: 1,
                },
              }}
              autoPlay={false}
              infinite={false}
              customLeftArrow={
                <button
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-shadow ${isRTL ? 'left-auto right-0' : ''}`}
                  onClick={() => carouselRef?.previous?.()}
                  aria-label="Previous slide"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              }
              customRightArrow={
                <button
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-shadow ${isRTL ? 'right-auto left-0' : ''}`}
                  onClick={() => carouselRef?.next?.()}
                  aria-label="Next slide"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              }
              itemClass="px-3"
            >
              {filteredDocuments.map((item, idx) => {
                const isFree = !item.price || item.price === 0;
                const purchased = false; // On homepage, we don't track purchases
                
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow group relative">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-3 rounded-lg group-hover:brightness-110 transition-all ${
                              item.itemType === "bundle"
                                ? "bg-purple-50 dark:bg-purple-900/20"
                                : "bg-brand-red-50 dark:bg-brand-red-900/20"
                            }`}
                          >
                            {item.itemType === "bundle" ? (
                              <FolderOpen
                                className={`w-6 h-6 ${
                                  item.itemType === "bundle"
                                    ? "text-purple-500"
                                    : "text-brand-red-500"
                                }`}
                              />
                            ) : (
                              <FileText className="w-6 h-6 text-brand-red-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline">
                                {item.category}
                              </Badge>
                              {item.itemType === "bundle" && !(item.isFolder || ((!item.documents || item.documents.length === 0) && item.childBundleCount && item.childBundleCount > 0)) && (
                                <Badge variant="secondary" className="text-xs">
                                  Bundle
                                </Badge>
                              )}
                              {(item.isFolder || (item.itemType === "bundle" && (!item.documents || item.documents.length === 0))) && item.childBundleCount !== undefined && item.childBundleCount > 0 && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                                  📁 {item.childBundleCount} {item.childBundleCount === 1 ? 'bundle' : 'bundles'}
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold line-clamp-2">
                              {item.title}
                            </h3>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                  {item.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-4 pb-4 border-b">
                    {item.itemType === "document" ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {item.downloads || 0} {t("downloads")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span suppressHydrationWarning>
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {(item.isFolder || ((!item.documents || item.documents.length === 0) && item.childBundleCount)) 
                            ? `${item.totalFileCount || 0} ${tStorefront("totalFiles")}`
                            : `${item.documents?.length || 0} ${t("documents")}`}
                        </div>
                        <span>{(item.isFolder || ((!item.documents || item.documents.length === 0) && item.childBundleCount)) 
                          ? `${item.childBundleCount || 0} ${tStorefront("bundlesCount")}`
                          : "Bundle"}</span>
                      </>
                    )}
                  </div>

                  {/* Price */}
                  {item.itemType === "bundle" && (
                    <div className="mb-4 pb-4 border-b">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {tStorefront("price")}:
                        </span>
                        <span className="text-xl font-bold text-brand-red-500">
                          {isFree ? "Free" : `${item.price} ${item.currency?.toUpperCase() || 'EUR'}`}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {item.itemType === "document" && item.isForSale && (
                    <div className="mb-4 pb-4 border-b">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {tStorefront("price")}:
                        </span>
                        <span className="text-xl font-bold text-brand-red-500">
                          {`${item.price} ${item.currency?.toUpperCase() || 'EUR'}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {item.itemType === "bundle" ? (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBundlePreview(item)}
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {tStorefront("previewContents")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePurchase(item)}
                        className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {tStorefront("buyNow")}
                      </Button>
                    </div>
                  ) : item.isForSale ? (
                    <Button
                      size="sm"
                      className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                      onClick={() => handlePurchase(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {tStorefront("buyNow")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                      onClick={() => handleDownload(item)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t("download")}
                    </Button>
                  )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </Carousel>
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
      
      {/* Bundle Preview Dialog */}
      {previewBundle && (
        <Dialog open={isBundlePreviewOpen} onOpenChange={setIsBundlePreviewOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-brand-red-500" />
                {previewBundle.title}
              </DialogTitle>
              <DialogDescription>
                {tStorefront("bundlePreviewDescription")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Bundle Info */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {tStorefront("totalDocuments")}:
                  </span>
                  <span className="text-lg font-bold text-brand-red-500">
                    {previewBundle.documents?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {tStorefront("price")}:
                  </span>
                  <span className="text-lg font-bold text-brand-red-500">
                    {formatPrice(previewBundle.price || 0, previewBundle.currency || 'EUR')}
                  </span>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  {tStorefront("documentsInBundle")}:
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {previewBundle.documents && previewBundle.documents.length > 0 ? (
                    previewBundle.documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-brand-red-100 dark:bg-brand-red-900/20 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-brand-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {doc.title}
                          </p>
                        </div>
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      {tStorefront("noDocumentsInBundle")}
                    </p>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100 mb-3">
                  {tStorefront("bundlePurchasePrompt")}
                </p>
                <Button
                  onClick={() => {
                    setIsBundlePreviewOpen(false);
                    handlePurchase(previewBundle);
                  }}
                  className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {tStorefront("buyNow")} - {formatPrice(previewBundle.price || 0, previewBundle.currency || 'EUR')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Folder Preview Dialog */}
      {previewFolder && isFolderPreviewOpen && (
        <Dialog open={isFolderPreviewOpen} onOpenChange={setIsFolderPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Folder className="w-6 h-6 text-purple-500" />
                <DialogTitle className="text-2xl">{previewFolder.title}</DialogTitle>
              </div>
              <DialogDescription className="text-base mt-2">
                {previewFolder.description || tStorefront("noDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Folder Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{tStorefront("category")}</p>
                  <Badge variant="outline">
                    {previewFolder.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{tStorefront("price")}</p>
                  <p className="text-lg font-bold text-brand-red-500">
                    {formatPrice(previewFolder.price || 0, previewFolder.currency || 'EUR')}
                  </p>
                </div>
              </div>

              {/* Bundles Inside */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold">{tStorefront("bundlesInside") || "Bundles Inside"}</h3>
                  <Badge variant="secondary">
                    {previewFolder.childBundleCount || 0} {previewFolder.childBundleCount === 1 ? 'bundle' : 'bundles'}
                  </Badge>
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {previewFolder.childBundles && previewFolder.childBundles.length > 0 ? (
                    previewFolder.childBundles.map((bundle: any) => (
                      <div
                        key={bundle._id}
                        className="border rounded-lg overflow-hidden bg-white dark:bg-slate-800/50"
                      >
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800">
                          <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {bundle.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {bundle.fileCount} {bundle.fileCount === 1 ? 'document' : 'documents'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                            Bundle
                          </Badge>
                        </div>
                        {bundle.documents && bundle.documents.length > 0 && (
                          <div className="p-3 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                              {tStorefront("filesPreview") || "Files Preview"} ({bundle.documents.length})
                            </p>
                            {bundle.documents.slice(0, 3).map((doc: any, idx: number) => (
                              <div
                                key={doc._id || idx}
                                className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                              >
                                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <span className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1">
                                  {doc.title || doc.fileName}
                                </span>
                                <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                              </div>
                            ))}
                            {bundle.documents.length > 3 && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-1">
                                +{bundle.documents.length - 3} {tStorefront("moreFiles") || "more files"}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      {tStorefront("noBundlesInFolder") || "No bundles in this folder"}
                    </p>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-purple-900 dark:text-purple-100 mb-3">
                  {tStorefront("folderPurchasePrompt") || "Purchase this folder to access all bundles inside"}
                </p>
                <Button
                  onClick={() => {
                    setIsFolderPreviewOpen(false);
                    handlePurchase(previewFolder);
                  }}
                  className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {tStorefront("buyNow")} - {formatPrice(previewFolder.price || 0, previewFolder.currency || 'EUR')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Purchase Dialog */}
      {selectedItem && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{tStorefront("purchaseTitle")}</DialogTitle>
            </DialogHeader>
            <BankTransferUpload
              courseIds={[selectedItem._id]}
              amount={selectedItem.price || 0}
              itemType={(selectedItem.itemType || "document") as "document" | "bundle"}
              itemId={selectedItem._id}
              onSuccess={() => {
                scnToast({
                  variant: "success",
                  title: tStorefront("uploadSuccessful"),
                  description: tStorefront("uploadSuccessfulDesc"),
                });
                setIsDialogOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
