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

interface DocumentsClientProps {
  isSignedIn: boolean;
}

export default function DocumentsClient({ isSignedIn }: DocumentsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('documentsPage');
  const tStorefront = useTranslations('storefront');

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

  // Check for purchase intent after sign-in
  useEffect(() => {
    const purchaseItemId = searchParams.get('purchase');
    if (purchaseItemId && isSignedIn && items.length > 0) {
      const item = items.find((i) => i._id === purchaseItemId);
      if (item) {
        console.log('[Documents] Restoring purchase intent after sign-in:', item.title);
        setSelectedItem(item);
        setIsDialogOpen(true);
        // Remove the purchase param from URL
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('purchase');
        router.replace(`/documents?${newParams.toString()}`, { scroll: false });
      }
    }
  }, [searchParams, isSignedIn, items, router]);

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
  const handlePurchase = (item: DocumentItem, event?: React.MouseEvent) => {
    // Prevent any event propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!isSignedIn) {
      console.log('[Documents] User not signed in, redirecting');
      toast.error(tStorefront("signInRequired"));
      // Redirect to sign-in with return URL containing purchase intent
      const returnUrl = `/documents?purchase=${item._id}`;
      router.push(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
      return;
    }
    
    console.log('[Documents] Opening payment dialog for:', item.title);
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

        {/* Search and Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm sm:text-base"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[200px] text-sm sm:text-base">
                  <SelectValue placeholder={t('sortOptions.newest')} />
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
          <div className="flex justify-center items-center py-12 sm:py-20">
            <Loader size={60} />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <CardContent className="space-y-4">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-300 dark:text-slate-700" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {t('noDocumentsFound')}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
                  {t('tryAdjustingFilters')}
                </p>
              </div>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
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
                          {item.price !== undefined && item.price !== null 
                            ? `${item.price} ${item.currency?.toUpperCase() || 'EUR'}`
                            : `${item.childBundleCount || 0} ${tStorefront("bundlesCount")}`}
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
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePurchase(item, e);
                          }}
                          className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          <span dir="auto" className="truncate">{tStorefront("buyNow")}</span>
                        </Button>
                      </div>
                    ) : item.isForSale ? (
                      // Document for sale - show only purchase button
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePurchase(item, e);
                        }}
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
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">{t('previous')}</span>
                </Button>

                <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-xs sm:text-sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <span className="hidden sm:inline mr-1">{t('next')}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Results Info */}
            <div className="text-center mt-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t('showing', { count: items.length, total: total })}
            </div>
          </>
        )}

        {/* Bundle Preview Dialog */}
        {previewBundle && (
          <Dialog open={isBundlePreviewOpen} onOpenChange={setIsBundlePreviewOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] p-4 sm:p-6 gap-4">
              <DialogHeader dir="auto" className="space-y-2">
                <DialogTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                  <Package className="w-5 h-5 flex-shrink-0 text-brand-red-500" />
                  <span className="break-words">{previewBundle.title}</span>
                </DialogTitle>
                <DialogDescription dir="auto" className="break-words whitespace-normal text-xs sm:text-sm">
                  {previewBundle.description || t('noDescription')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium">{tStorefront("price")}</p>
                    <p className="text-lg sm:text-2xl font-bold text-brand-red-500">
                      {formatPrice(previewBundle.price || 0, previewBundle.currency || 'EUR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {previewBundle.documents?.length || 0} {tStorefront("documents")}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">{tStorefront("bundlePreviewDescription")}</h4>
                  {previewBundle.documents && previewBundle.documents.length > 0 ? (
                    previewBundle.documents.map((doc, idx) => (
                      <div
                        key={doc._id}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span dir="auto" className="text-xs sm:text-sm flex-1 break-words">{doc.title}</span>
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
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
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsBundlePreviewOpen(false);
                    handlePurchase(previewBundle, e);
                  }}
                  className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-xs sm:text-sm h-9 sm:h-10"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span dir="auto" className="truncate">{tStorefront("buyNow")} - {formatPrice(previewBundle.price || 0, previewBundle.currency || 'EUR')}</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      
        {/* Folder Preview Dialog */}
        {previewFolder && (
          <Dialog open={isFolderPreviewOpen} onOpenChange={setIsFolderPreviewOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] p-4 sm:p-6 gap-4">
              <DialogHeader dir="auto" className="space-y-2">
                <DialogTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                  <Folder className="w-5 h-5 flex-shrink-0 text-blue-500" />
                  <span className="break-words">{previewFolder.title}</span>
                </DialogTitle>
                <DialogDescription dir="auto" className="break-words whitespace-normal text-xs sm:text-sm">
                  {previewFolder.description || t('noDescription')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex-wrap gap-2">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium">{tStorefront("price")}</p>
                    <p className="text-lg sm:text-2xl font-bold text-brand-red-500">
                      {formatPrice(previewFolder.price || 0, previewFolder.currency || 'EUR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {previewFolder.childBundleCount || 0} {tStorefront("bundlesCount")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {previewFolder.totalFileCount || 0} {tStorefront("totalFiles")}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    {tStorefront("folderContents")}
                  </h4>
                  {previewFolder.childBundles && previewFolder.childBundles.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {previewFolder.childBundles.map((bundle) => (
                        <div
                          key={bundle._id}
                          className="p-3 sm:p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <p dir="auto" className="font-medium text-xs sm:text-sm break-words flex-1">{bundle.title}</p>
                                <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
                                  {bundle.fileCount} {tStorefront("documents")}
                                </Badge>
                              </div>
                              {bundle.documents && bundle.documents.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{tStorefront("filesIncluded")}:</p>
                                  <ul className="space-y-0.5 sm:space-y-1 pl-3 sm:pl-4">
                                    {bundle.documents.slice(0, 3).map((doc) => (
                                      <li key={doc._id} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                                        <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                        <span dir="auto" className="truncate">{doc.fileName}</span>
                                      </li>
                                    ))}
                                    {bundle.documents.length > 3 && (
                                      <li className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 pl-4 sm:pl-5">
                                        +{bundle.documents.length - 3} {tStorefront("moreFiles")}
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p dir="auto" className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center py-3 sm:py-4">
                      {tStorefront("noBundlesInFolder")}
                    </p>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg sticky bottom-0">
                <p dir="auto" className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 mb-2 sm:mb-3 break-words">
                  {tStorefront("folderPurchasePrompt")}
                </p>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsFolderPreviewOpen(false);
                    handlePurchase(previewFolder, e);
                  }}
                  className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-xs sm:text-sm h-9 sm:h-10"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span dir="auto" className="truncate">{tStorefront("buyNow")} - {formatPrice(previewFolder.price || 0, previewFolder.currency || 'EUR')}</span>
                </Button>
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
      </Container>
    </div>
  );
}
