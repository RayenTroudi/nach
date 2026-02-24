"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Package,
  ShoppingCart,
  Lock,
  Folder,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Container } from "@/components/shared";
import Loader from "@/components/shared/Loader";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { scnToast } from "@/components/ui/use-toast";
import BankTransferUpload from "../course/[courseId]/_components/BankTransferUpload";

interface DocumentItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  itemType?: "document" | "bundle";
  // Document fields
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
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
    _id: string;
    firstName: string;
    lastName: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('documentsPage');
  const tStorefront = useTranslations('storefront');
  const { user, isSignedIn } = useUser();

  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Bundle preview and purchase dialog states
  const [previewBundle, setPreviewBundle] = useState<DocumentItem | null>(null);
  const [isBundlePreviewOpen, setIsBundlePreviewOpen] = useState(false);
  
  // Folder preview dialog state
  const [previewFolder, setPreviewFolder] = useState<DocumentItem | null>(null);
  const [isFolderPreviewOpen, setIsFolderPreviewOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<DocumentItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const ITEMS_PER_PAGE = 12;
  
  const SORT_OPTIONS = [
    { value: "newest", label: t('sortOptions.newest') },
    { value: "downloads", label: t('sortOptions.downloads') },
    { value: "title", label: t('sortOptions.title') },
  ];

  // Fetch documents and bundles
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        sort: sortBy,
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      // Use storefront API to get both documents and bundles
      const response = await fetch(`/api/storefront?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      setItems(data.items || []);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, searchTerm]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchDocuments();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Handle download
  const handleDownload = async (doc: DocumentItem) => {
    try {
      if (!doc.fileUrl) {
        toast.error(t('downloadFailed'));
        return;
      }

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
      a.download = doc.fileName || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('downloadStarted'));
      fetchDocuments(); // Refresh to show updated download count
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error(t('downloadFailed'));
    }
  };

  // Handle preview
  const handlePreview = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };
  
  // Handle bundle preview
  const handleBundlePreview = (item: DocumentItem) => {
    // Check if this is a folder (has no documents but has child bundles)
    const isFolder = item.isFolder || ((!item.documents || item.documents.length === 0) && item.childBundleCount && item.childBundleCount > 0);
    
    console.log('Documents page handleBundlePreview:', {
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
  
  // Handle purchase
  const handlePurchase = (item: DocumentItem) => {
    if (!isSignedIn) {
      toast.error(tStorefront("signInRequired"));
      router.push("/sign-in");
      return;
    }
    setSelectedItem(item);
    setIsDialogOpen(true);
  };
  
  // Format price
  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return tStorefront("free");
    return `${price} ${currency.toUpperCase()}`;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Visa: "bg-blue-100 text-blue-700 border-blue-200",
      Application: "bg-green-100 text-green-700 border-green-200",
      Language: "bg-purple-100 text-purple-700 border-purple-200",
      Certificate: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Guide: "bg-brand-red-100 text-brand-red-700 border-brand-red-200",
      Template: "bg-pink-100 text-pink-700 border-pink-200",
      Other: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 pt-20 pb-12">
      <Container>
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 mt-4 sm:mt-8 px-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-3 sm:mb-4">
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Sort and Results */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {t('showing', { count: items.length, total })}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="py-20 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <FileText className="w-16 h-16 text-slate-400" />
                <FolderOpen className="w-16 h-16 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                {t('noDocumentsFound')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm
                  ? t('tryAdjustingFilters')
                  : t('checkBackSoon')}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                  }}
                >
                  {t('clearFilters')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Documents & Bundles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-8">
              {items.map((item) => (
                <Card
                  key={item._id}
                  className="hover:shadow-lg transition-shadow group h-full flex flex-col"
                >
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-2 sm:p-3 bg-brand-red-50 dark:bg-brand-red-900/20 rounded-lg group-hover:bg-brand-red-100 dark:group-hover:bg-brand-red-900/30 transition-colors flex-shrink-0">
                        {item.itemType === "bundle" ? (
                          <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-brand-red-500" />
                        ) : (
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-brand-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge
                          dir="auto"
                          variant="outline"
                          className={`mb-1.5 sm:mb-2 text-xs ${getCategoryColor(item.category)}`}
                        >
                          {item.category}
                        </Badge>
                        <CardTitle dir="auto" className="text-base sm:text-lg line-clamp-2">
                          {item.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 flex-1 flex flex-col">
                    <CardDescription dir="auto" className="sm:line-clamp-3 mb-3 sm:mb-4 text-xs sm:text-sm">
                      {item.description || t('noDescription')}
                    </CardDescription>

                    {/* Meta Info */}
                    {item.itemType === "bundle" ? (
                      <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b">
                        <div className="flex items-center gap-1 min-w-0">
                          <Package className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {(item.isFolder || ((!item.documents || item.documents.length === 0) && item.childBundleCount)) 
                              ? `${item.totalFileCount || 0} ${tStorefront("totalFiles")}`
                              : `${item.documents?.length || 0} ${t('documents')}`}
                          </span>
                        </div>
                        <span className="font-semibold text-brand-red-600 truncate text-right ml-2">
                          {(item.isFolder || ((!item.documents || item.documents.length === 0) && item.childBundleCount)) 
                            ? `${item.childBundleCount || 0} ${tStorefront("bundlesCount")}`
                            : `${item.price} ${item.currency?.toUpperCase() || 'EUR'}`}
                        </span>
                      </div>
                    ) : item.isForSale ? (
                      <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b">
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span className="truncate">{item.downloads || 0} {t('downloads')}</span>
                        </div>
                        <span className="font-semibold text-brand-red-600 truncate">
                          {item.price} {item.currency?.toUpperCase() || 'EUR'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b">
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span className="truncate">{item.downloads || 0} {t('downloads')}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                            {tStorefront("free")}
                          </Badge>
                          <span className="hidden sm:inline truncate">{formatFileSize(item.fileSize || 0)}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {item.itemType === "bundle" ? (
                      <div className="space-y-1.5 sm:space-y-2 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBundlePreview(item)}
                          className="w-full text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          <span dir="auto" className="truncate">{tStorefront("previewContents")}</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(item)}
                          className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          <span dir="auto" className="truncate">{tStorefront("buyNow")}</span>
                        </Button>
                      </div>
                    ) : item.isForSale ? (
                      // Document for sale - show only purchase button
                      <Button
                        size="sm"
                        onClick={() => handlePurchase(item)}
                        className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-xs sm:text-sm h-8 sm:h-9 mt-auto"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        <span dir="auto" className="truncate">{tStorefront("buyNow")}</span>
                      </Button>
                    ) : (
                      // Free document - show preview and download
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(item.fileUrl!)}
                          className="w-full text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                          <span dir="auto" className="truncate">{t('preview')}</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(item)}
                          className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                          <span dir="auto" className="truncate">{t('download')}</span>
                        </Button>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                      <span dir="auto">{t('uploadedBy')}: {typeof item.uploadedBy === 'string' 
                        ? item.uploadedBy 
                        : `${item.uploadedBy.firstName} ${item.uploadedBy.lastName}`}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="text-xs sm:text-sm h-8 sm:h-9"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">{t('previous')}</span>
                  <span className="sm:hidden">Prev</span>
                </Button>

                <div className="flex items-center gap-0.5 sm:gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-1 sm:px-2 text-slate-400 text-xs sm:text-sm">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm ${
                            currentPage === page
                              ? "bg-brand-red-500 hover:bg-brand-red-600"
                              : ""
                          }`}
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="text-xs sm:text-sm h-8 sm:h-9"
                >
                  <span className="hidden sm:inline">{t('next')}</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
      
      {/* Bundle Preview Dialog */}
      {previewBundle && (
        <Dialog open={isBundlePreviewOpen} onOpenChange={setIsBundlePreviewOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] p-4 sm:p-6 gap-4">
            <DialogHeader dir="auto" className="space-y-2">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-brand-red-500 flex-shrink-0" />
                <span dir="auto" className="break-words line-clamp-2">{previewBundle.title}</span>
              </DialogTitle>
              <DialogDescription dir="auto" className="break-words whitespace-normal text-xs sm:text-sm">
                {tStorefront("bundlePreviewDescription")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(90vh-180px)] -mx-4 sm:-mx-6 px-4 sm:px-6">
              {/* Bundle Info */}
              <div className="bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span dir="auto" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {tStorefront("totalDocuments")}:
                  </span>
                  <span className="text-base sm:text-lg font-bold text-brand-red-500 flex-shrink-0">
                    {previewBundle.documents?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span dir="auto" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {tStorefront("price")}:
                  </span>
                  <span className="text-base sm:text-lg font-bold text-brand-red-500 flex-shrink-0 break-words">
                    {formatPrice(previewBundle.price || 0, previewBundle.currency || 'EUR')}
                  </span>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-1.5 sm:space-y-2">
                <h4 dir="auto" className="font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {tStorefront("documentsInBundle")}:
                </h4>
                <div className="space-y-1.5 sm:space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto overflow-x-hidden -mr-2 pr-2">
                  {previewBundle.documents && previewBundle.documents.length > 0 ? (
                    previewBundle.documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-brand-red-100 dark:bg-brand-red-900/20 rounded flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p dir="auto" className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {doc.title}
                          </p>
                        </div>
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <p dir="auto" className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center py-3 sm:py-4">
                      {tStorefront("noDocumentsInBundle")}
                    </p>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg sticky bottom-0">
                <p dir="auto" className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 mb-2 sm:mb-3 break-words">
                  {tStorefront("bundlePurchasePrompt")}
                </p>
                <Button
                  onClick={() => {
                    setIsBundlePreviewOpen(false);
                    handlePurchase(previewBundle);
                  }}
                  className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-xs sm:text-sm h-9 sm:h-10"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span dir="auto" className="truncate">{tStorefront("buyNow")} - {formatPrice(previewBundle.price || 0, previewBundle.currency || 'EUR')}</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Folder Preview Dialog */}
      {previewFolder && isFolderPreviewOpen && (
        <Dialog open={isFolderPreviewOpen} onOpenChange={setIsFolderPreviewOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] p-4 sm:p-6 gap-4">
            <DialogHeader dir="auto" className="space-y-2">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 sm:w-5 sm:h-5 sm:w-6 sm:h-6 text-purple-500 flex-shrink-0" />
                <DialogTitle dir="auto" className="text-base sm:text-lg sm:text-2xl break-words line-clamp-2">{previewFolder.title}</DialogTitle>
              </div>
              <DialogDescription dir="auto" className="text-xs sm:text-sm sm:text-base break-words whitespace-normal">
                {previewFolder.description || tStorefront("noDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 sm:space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-200px)] -mx-4 sm:-mx-6 px-4 sm:px-6">
              {/* Folder Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="min-w-0">
                  <p dir="auto" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{tStorefront("category")}</p>
                  <Badge dir="auto" variant="outline" className="mt-1 text-xs">
                    {previewFolder.category}
                  </Badge>
                </div>
                <div className="min-w-0">
                  <p dir="auto" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{tStorefront("price")}</p>
                  <p className="text-base sm:text-lg font-bold text-brand-red-500 break-words">
                    {formatPrice(previewFolder.price || 0, previewFolder.currency || 'EUR')}
                  </p>
                </div>
              </div>

              {/* Bundles Inside */}
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
                  <h3 dir="auto" className="text-sm sm:text-base sm:text-lg font-semibold">{tStorefront("bundlesInside") || "Bundles Inside"}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {previewFolder.childBundleCount || 0} {previewFolder.childBundleCount === 1 ? 'bundle' : 'bundles'}
                  </Badge>
                </div>
                
                <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto overflow-x-hidden -mr-2 pr-1 sm:pr-2">
                  {previewFolder.childBundles && previewFolder.childBundles.length > 0 ? (
                    previewFolder.childBundles.map((bundle: any) => (
                      <div
                        key={bundle._id}
                        className="border rounded-lg overflow-hidden bg-white dark:bg-slate-800/50"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-50 dark:bg-slate-800">
                          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded flex items-center justify-center">
                            <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p dir="auto" className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {bundle.title}
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                              {bundle.fileCount} {bundle.fileCount === 1 ? 'document' : 'documents'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] sm:text-xs bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 flex-shrink-0">
                            {tStorefront("bundle")}
                          </Badge>
                        </div>
                        {bundle.documents && bundle.documents.length > 0 && (
                          <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
                            <p dir="auto" className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                              {tStorefront("filesPreview") || "Files Preview"} ({bundle.documents.length})
                            </p>
                            {bundle.documents.slice(0, 3).map((doc: any, idx: number) => (
                              <div
                                key={doc._id || idx}
                                className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                              >
                                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                                <span dir="auto" className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 truncate flex-1">
                                  {doc.title || doc.fileName}
                                </span>
                                <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                              </div>
                            ))}
                            {bundle.documents.length > 3 && (
                              <p dir="auto" className="text-xs text-slate-500 dark:text-slate-400 text-center pt-1">
                                +{bundle.documents.length - 3} {tStorefront("moreFiles") || "more files"}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p dir="auto" className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center py-3 sm:py-4">
                      {tStorefront("noBundlesInFolder") || "No bundles in this folder"}
                    </p>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg sticky bottom-0">
                <p dir="auto" className="text-xs sm:text-sm text-purple-900 dark:text-purple-100 mb-2 sm:mb-3 break-words">
                  {tStorefront("folderPurchasePrompt") || "Purchase this folder to access all bundles inside"}
                </p>
                <Button
                  onClick={() => {
                    setIsFolderPreviewOpen(false);
                    handlePurchase(previewFolder);
                  }}
                  className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-xs sm:text-sm h-9 sm:h-10"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span dir="auto" className="truncate">{tStorefront("buyNow")} - {formatPrice(previewFolder.price || 0, previewFolder.currency || 'EUR')}</span>
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
              itemType={selectedItem.itemType as "document" | "bundle"}
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
    </div>
  );
}
