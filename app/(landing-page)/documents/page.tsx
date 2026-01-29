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
import BankTransferUpload from "@/app/(landing-page)/course/[courseId]/_components/BankTransferUpload";

const CATEGORIES = [
  "All",
  "Visa",
  "Application",
  "Language",
  "Certificate",
  "Guide",
  "Template",
  "Other",
];

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
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Bundle preview and purchase dialog states
  const [previewBundle, setPreviewBundle] = useState<DocumentItem | null>(null);
  const [isBundlePreviewOpen, setIsBundlePreviewOpen] = useState(false);
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

      if (categoryFilter !== "All") {
        params.append("category", categoryFilter);
      }

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
  }, [currentPage, categoryFilter, sortBy, searchTerm]);

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
    setPreviewBundle(item);
    setIsBundlePreviewOpen(true);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-12">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "All" ? t('allCategories') : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort and Results */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('showing', { count: items.length, total })}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
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
                {searchTerm || categoryFilter !== "All"
                  ? t('tryAdjustingFilters')
                  : t('checkBackSoon')}
              </p>
              {(searchTerm || categoryFilter !== "All") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("All");
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {items.map((item) => (
                <Card
                  key={item._id}
                  className="hover:shadow-lg transition-shadow group"
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-brand-red-50 dark:bg-brand-red-900/20 rounded-lg group-hover:bg-brand-red-100 dark:group-hover:bg-brand-red-900/30 transition-colors">
                        {item.itemType === "bundle" ? (
                          <FolderOpen className="w-6 h-6 text-brand-red-500" />
                        ) : (
                          <FileText className="w-6 h-6 text-brand-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge
                          variant="outline"
                          className={`mb-2 ${getCategoryColor(item.category)}`}
                        >
                          {item.category}
                        </Badge>
                        <CardTitle className="text-lg line-clamp-2">
                          {item.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3 mb-4">
                      {item.description || t('noDescription')}
                    </CardDescription>

                    {/* Meta Info */}
                    {item.itemType === "bundle" ? (
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-4 pb-4 border-b">
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {item.documents?.length || 0} {t('documents')}
                        </div>
                        <span className="font-semibold text-brand-red-600">
                          {item.price} {item.currency?.toUpperCase() || 'EUR'}
                        </span>
                      </div>
                    ) : item.isForSale ? (
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-4 pb-4 border-b">
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {item.downloads || 0} {t('downloads')}
                        </div>
                        <span className="font-semibold text-brand-red-600">
                          {item.price} {item.currency?.toUpperCase() || 'EUR'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-4 pb-4 border-b">
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {item.downloads || 0} {t('downloads')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                            {tStorefront("free")}
                          </Badge>
                          <span>{formatFileSize(item.fileSize || 0)}</span>
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
                      // Document for sale - show only purchase button
                      <Button
                        size="sm"
                        onClick={() => handlePurchase(item)}
                        className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {tStorefront("buyNow")}
                      </Button>
                    ) : (
                      // Free document - show preview and download
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(item.fileUrl!)}
                          className="w-full"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('preview')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(item)}
                          className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          {t('download')}
                        </Button>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t text-xs text-slate-500 dark:text-slate-400">
                      {t('uploadedBy')}: {typeof item.uploadedBy === 'string' 
                        ? item.uploadedBy 
                        : `${item.uploadedBy.firstName} ${item.uploadedBy.lastName}`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {t('previous')}
                </Button>

                <div className="flex items-center gap-1">
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
                          <span className="px-2 text-slate-400">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page
                              ? "bg-brand-red-500 hover:bg-brand-red-600"
                              : ""
                          }
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
                >
                  {t('next')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
      
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
      
      {/* Purchase Dialog */}
      {selectedItem && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] md:max-w-[700px] p-6 bg-slate-100 dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{tStorefront("completePurchase")}</DialogTitle>
              <DialogDescription>{tStorefront("choosePaymentMethod")}</DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-y-4">
              {/* Item Details */}
              <div className="flex gap-x-3 p-4 bg-white dark:bg-slate-900 rounded-lg">
                <div className="w-[100px] h-[75px] bg-slate-200 dark:bg-slate-800 rounded-sm flex items-center justify-center">
                  {selectedItem.itemType === "bundle" ? (
                    <FolderOpen className="w-8 h-8 text-slate-400" />
                  ) : (
                    <FileText className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-y-1">
                  <h3 className="text-sm md:text-base font-semibold">
                    {selectedItem.title}
                  </h3>
                  <div className="flex items-center gap-x-2">
                    <Image
                      src={"/images/default_profile.avif"}
                      width={20}
                      height={20}
                      alt="instructor"
                      className="rounded-full object-cover"
                    />
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {typeof selectedItem.uploadedBy === 'string' 
                        ? selectedItem.uploadedBy 
                        : `${selectedItem.uploadedBy.firstName} ${selectedItem.uploadedBy.lastName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-x-2 mt-1">
                    <p className="text-xl font-bold text-brand-red-500">
                      {((selectedItem.price || 0) * 3.3).toFixed(2)} TND
                    </p>
                    <Image
                      src={"/icons/tunisia-flag.svg"}
                      width={24}
                      height={24}
                      alt="tunisia"
                      className="object-cover rounded-none"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <BankTransferUpload
                courseIds={[selectedItem._id]}
                amount={(selectedItem.price || 0) * 3.3}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  scnToast({
                    variant: "success",
                    title: tStorefront("uploadSuccessful"),
                    description: tStorefront("uploadSuccessfulDesc"),
                  });
                  router.refresh();
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
