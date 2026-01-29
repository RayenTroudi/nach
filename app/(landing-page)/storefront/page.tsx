"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  FolderOpen,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/shared";
import Loader from "@/components/shared/Loader";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { scnToast } from "@/components/ui/use-toast";
import BankTransferUpload from "../course/[courseId]/_components/BankTransferUpload";

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

interface StorefrontItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  thumbnail?: string;
  itemType: "document" | "bundle";
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    picture?: string;
  };
  // Document specific
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  downloads?: number;
  // Bundle specific
  documents?: Array<{
    _id: string;
    title: string;
    fileName: string;
  }>;
  createdAt: string;
}

export default function StorefrontPage() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const t = useTranslations("storefront");

  const [items, setItems] = useState<StorefrontItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all"); // all, document, bundle
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());
  
  // Purchase dialog state
  const [selectedItem, setSelectedItem] = useState<StorefrontItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Bundle preview dialog state
  const [previewBundle, setPreviewBundle] = useState<StorefrontItem | null>(null);
  const [isBundlePreviewOpen, setIsBundlePreviewOpen] = useState(false);

  const ITEMS_PER_PAGE = 12;

  const SORT_OPTIONS = [
    { value: "newest", label: t("sortOptions.newest") },
    { value: "price-low", label: t("sortOptions.priceLow") },
    { value: "price-high", label: t("sortOptions.priceHigh") },
    { value: "title", label: t("sortOptions.title") },
  ];

  const TYPE_OPTIONS = [
    { value: "all", label: t("typeOptions.all") },
    { value: "document", label: t("typeOptions.documents") },
    { value: "bundle", label: t("typeOptions.bundles") },
  ];

  // Fetch storefront items
  const fetchItems = async () => {
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

      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/storefront?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      setItems(data.items);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's purchased items
  const fetchPurchasedItems = async () => {
    if (!isSignedIn) return;
    
    try {
      const response = await fetch("/api/document-purchases");
      if (!response.ok) return;
      
      const data = await response.json();
      const purchased = new Set<string>();
      data.purchases?.forEach((purchase: any) => {
        purchased.add(purchase.itemId._id);
      });
      setPurchasedItems(purchased);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, categoryFilter, typeFilter, sortBy]);

  useEffect(() => {
    fetchPurchasedItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchItems();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Handle download (for free or purchased items)
  const handleDownload = async (item: StorefrontItem) => {
    if (!isSignedIn) {
      toast.error(t("signInRequired"));
      router.push("/sign-in");
      return;
    }

    if (item.price > 0 && !purchasedItems.has(item._id)) {
      toast.error(t("purchaseRequired"));
      return;
    }

    if (item.itemType === "document" && item.fileUrl) {
      try {
        const response = await fetch(item.fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.fileName || "document.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(t("downloadStarted"));
      } catch (error) {
        console.error("Error downloading:", error);
        toast.error(t("downloadFailed"));
      }
    } else if (item.itemType === "bundle") {
      router.push(`/my-documents?bundle=${item._id}`);
    }
  };

  // Handle preview
  const handlePreview = (item: StorefrontItem) => {
    if (item.itemType === "document" && item.fileUrl) {
      window.open(item.fileUrl, "_blank");
    } else if (item.itemType === "bundle") {
      // Open bundle details modal or page
      toast.info(t("bundlePreviewInfo"));
    }
  };

  // Handle purchase
  const handlePurchase = (item: StorefrontItem) => {
    if (!isSignedIn) {
      toast.error(t("signInRequired"));
      router.push("/sign-in");
      return;
    }
    setSelectedItem(item);
    setIsDialogOpen(true);
  };
  
  // Handle bundle preview
  const handleBundlePreview = (item: StorefrontItem) => {
    setPreviewBundle(item);
    setIsBundlePreviewOpen(true);
  };

  // Format price
  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return t("free");
    const symbol = currency === "usd" ? "$" : currency === "tnd" ? "TND" : currency;
    return `${symbol}${price}`;
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

  const isPurchased = (itemId: string) => purchasedItems.has(itemId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-12">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t("searchPlaceholder")}
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
                      {cat === "All" ? t("allCategories") : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort and Results */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("showing", { count: items.length, total })}
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
              <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                {t("noItemsFound")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm || categoryFilter !== "All"
                  ? t("tryAdjustingFilters")
                  : t("checkBackSoon")}
              </p>
              {(searchTerm || categoryFilter !== "All") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("All");
                    setTypeFilter("all");
                  }}
                >
                  {t("clearFilters")}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {items.map((item) => {
                const purchased = isPurchased(item._id);
                const isFree = item.price === 0;
                
                return (
                  <Card
                    key={item._id}
                    className="hover:shadow-lg transition-shadow group relative"
                  >
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
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={getCategoryColor(item.category)}
                            >
                              {item.category}
                            </Badge>
                            {item.itemType === "bundle" && (
                              <Badge variant="secondary" className="text-xs">
                                {t("bundle")}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg line-clamp-2">
                            {item.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3 mb-4">
                        {item.description || t("noDescription")}
                      </CardDescription>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-4 pb-4 border-b">
                        {item.itemType === "document" ? (
                          <>
                            <div className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {item.downloads || 0} {t("downloads")}
                            </div>
                            <span>{formatFileSize(item.fileSize || 0)}</span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {item.documents?.length || 0} {t("documents")}
                            </div>
                            <span>{t("documentBundle")}</span>
                          </>
                        )}
                      </div>

                      {/* Price */}
                      <div className="mb-4 pb-4 border-b">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {t("price")}:
                          </span>
                          <span className="text-xl font-bold text-brand-red-500">
                            {formatPrice(item.price, item.currency)}
                          </span>
                        </div>
                        {purchased && (
                          <Badge
                            variant="secondary"
                            className="w-full justify-center mt-2 bg-green-100 text-green-700 border-green-200"
                          >
                            {t("purchased")}
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      {isFree || purchased ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(item)}
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {t("preview")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(item)}
                            className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            {item.itemType === "bundle" ? t("view") : t("download")}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {item.itemType === "bundle" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBundlePreview(item)}
                              className="w-full"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {t("previewContents")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handlePurchase(item)}
                            className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {t("buyNow")}
                          </Button>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t text-xs text-slate-500 dark:text-slate-400">
                        {t("uploadedBy")}:{" "}
                        {`${item.uploadedBy.firstName} ${item.uploadedBy.lastName}`}
                      </div>
                    </CardContent>

                    {/* Lock Icon for Paid Items */}
                    {!isFree && !purchased && (
                      <div className="absolute top-4 right-4 bg-slate-900/80 p-2 rounded-full">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </Card>
                );
              })}
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
                  {t("previous")}
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
                  {t("next")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </Container>

      {/* Purchase Dialog */}
      {selectedItem && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("purchaseTitle")}</DialogTitle>
            </DialogHeader>
            <BankTransferUpload
              courseIds={[selectedItem._id]}
              amount={selectedItem.price || 0}
              itemType={selectedItem.itemType as "document" | "bundle"}
              itemId={selectedItem._id}
              onSuccess={() => {
                scnToast({
                  variant: "success",
                  title: t("uploadSuccessful"),
                  description: t("uploadSuccessfulDesc"),
                });
                setIsDialogOpen(false);
                fetchPurchasedItems();
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      
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
                {t("bundlePreviewDescription")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Bundle Info */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("totalDocuments")}:
                  </span>
                  <span className="text-lg font-bold text-brand-red-500">
                    {previewBundle.documents?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("price")}:
                  </span>
                  <span className="text-lg font-bold text-brand-red-500">
                    {formatPrice(previewBundle.price, previewBundle.currency)}
                  </span>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  {t("documentsInBundle")}:
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {previewBundle.documents && previewBundle.documents.length > 0 ? (
                    previewBundle.documents.map((doc, index) => (
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
                          {doc.fileName && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {doc.fileName}
                            </p>
                          )}
                        </div>
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      {t("noDocumentsInBundle")}
                    </p>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100 mb-3">
                  {t("bundlePurchasePrompt")}
                </p>
                <Button
                  onClick={() => {
                    setIsBundlePreviewOpen(false);
                    handlePurchase(previewBundle);
                  }}
                  className="w-full bg-brand-red-500 hover:bg-brand-red-600"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t("buyNow")} - {formatPrice(previewBundle.price, previewBundle.currency)}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
