"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Download,
  FolderOpen,
  Package,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Container } from "@/components/shared";
import Loader from "@/components/shared/Loader";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface Purchase {
  _id: string;
  itemType: "document" | "bundle";
  amount: number;
  currency: string;
  paymentStatus: "pending" | "completed" | "rejected";
  paymentMethod: string;
  createdAt: string;
  itemId: {
    _id: string;
    title: string;
    description: string;
    category: string;
    // Document fields
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    // Bundle fields
    documents?: Array<{
      _id: string;
      title: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
    }>;
    uploadedBy: {
      firstName: string;
      lastName: string;
      picture?: string;
    };
  };
}

export default function MyDocumentsPage() {
  const searchParams = useSearchParams();
  const t = useTranslations("myDocuments");
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Auto-expand bundle from URL param
  useEffect(() => {
    const bundleId = searchParams.get("bundle");
    if (bundleId) {
      setExpandedBundles(new Set([bundleId]));
      setTimeout(() => {
        document.getElementById(`bundle-${bundleId}`)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [searchParams]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/document-purchases");
      if (!response.ok) throw new Error("Failed to fetch purchases");

      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t("downloadStarted"));
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error(t("downloadFailed"));
    }
  };

  const handleDownloadAll = async (documents: Purchase["itemId"]["documents"]) => {
    if (!documents) return;
    
    toast.info(t("downloadingAll"));
    for (const doc of documents) {
      await handleDownload(doc.fileUrl, doc.fileName);
      // Add delay to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handlePreview = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const toggleBundle = (bundleId: string) => {
    const newExpanded = new Set(expandedBundles);
    if (newExpanded.has(bundleId)) {
      newExpanded.delete(bundleId);
    } else {
      newExpanded.add(bundleId);
    }
    setExpandedBundles(newExpanded);
  };

  const formatPrice = (amount: number, currency: string) => {
    const symbol = currency === "usd" ? "$" : currency === "tnd" ? "TND" : currency;
    return `${symbol}${amount}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusBadge = (status: Purchase["paymentStatus"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t("statusCompleted")}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            {t("statusPending")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            {t("statusRejected")}
          </Badge>
        );
    }
  };

  const filterPurchases = (status?: Purchase["paymentStatus"]) => {
    if (!status) return purchases;
    return purchases.filter((p) => p.paymentStatus === status);
  };

  const completedPurchases = filterPurchases("completed");
  const pendingPurchases = filterPurchases("pending");

  const renderPurchaseCard = (purchase: Purchase) => {
    const { itemType, itemId, paymentStatus } = purchase;
    const isBundle = itemType === "bundle";
    const isExpanded = expandedBundles.has(itemId._id);
    const canAccess = paymentStatus === "completed";

    return (
      <Card
        key={purchase._id}
        id={isBundle ? `bundle-${itemId._id}` : undefined}
        className="hover:shadow-lg transition-shadow"
      >
        <CardHeader>
          <div className="flex items-start gap-3">
            <div
              className={`p-3 rounded-lg ${
                isBundle
                  ? "bg-purple-50 dark:bg-purple-900/20"
                  : "bg-brand-red-50 dark:bg-brand-red-900/20"
              }`}
            >
              {isBundle ? (
                <FolderOpen className="w-6 h-6 text-purple-500" />
              ) : (
                <FileText className="w-6 h-6 text-brand-red-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {isBundle && (
                  <Badge variant="secondary" className="text-xs">
                    <Package className="w-3 h-3 mr-1" />
                    {t("bundle")}
                  </Badge>
                )}
                {getStatusBadge(paymentStatus)}
              </div>
              <CardTitle className="text-lg">{itemId.title}</CardTitle>
              <CardDescription className="mt-1">
                {itemId.description || t("noDescription")}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">{t("paid")}</p>
              <p className="text-lg font-bold text-brand-red-500">
                {formatPrice(purchase.amount, purchase.currency)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b text-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-400">{t("purchaseDate")}</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(purchase.createdAt), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">
                {isBundle ? t("documentsIncluded") : t("fileSize")}
              </p>
              <p className="font-medium">
                {isBundle
                  ? `${itemId.documents?.length || 0} ${t("files")}`
                  : formatFileSize(itemId.fileSize || 0)}
              </p>
            </div>
          </div>

          {/* Single Document Actions */}
          {!isBundle && itemId.fileUrl && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(itemId.fileUrl!)}
                disabled={!canAccess}
              >
                <Eye className="w-4 h-4 mr-1" />
                {t("preview")}
              </Button>
              <Button
                size="sm"
                onClick={() => handleDownload(itemId.fileUrl!, itemId.fileName!)}
                disabled={!canAccess}
                className="bg-brand-red-500 hover:bg-brand-red-600"
              >
                <Download className="w-4 h-4 mr-1" />
                {t("download")}
              </Button>
            </div>
          )}

          {/* Bundle Actions */}
          {isBundle && itemId.documents && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBundle(itemId._id)}
                  disabled={!canAccess}
                  className="flex-1"
                >
                  {isExpanded ? t("hideDocuments") : t("showDocuments")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownloadAll(itemId.documents)}
                  disabled={!canAccess}
                  className="flex-1 bg-brand-red-500 hover:bg-brand-red-600"
                >
                  <Download className="w-4 h-4 mr-1" />
                  {t("downloadAll")}
                </Button>
              </div>

              {/* Bundle Documents List */}
              {isExpanded && canAccess && (
                <div className="space-y-2 pt-3 border-t">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("documentsInBundle")}:
                  </p>
                  {itemId.documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {doc.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(doc.fileUrl)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc.fileUrl, doc.fileName)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Access Denied Message */}
          {!canAccess && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {paymentStatus === "pending"
                  ? t("accessPending")
                  : t("accessDenied")}
              </p>
            </div>
          )}

          {/* Uploaded By */}
          <div className="mt-4 pt-4 border-t text-xs text-slate-500 dark:text-slate-400">
            {t("uploadedBy")}: {`${itemId.uploadedBy.firstName} ${itemId.uploadedBy.lastName}`}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-12">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            {t("title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                {t("tabAll")} ({purchases.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t("tabCompleted")} ({completedPurchases.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                {t("tabPending")} ({pendingPurchases.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {purchases.length === 0 ? (
                <Card>
                  <CardContent className="py-20 text-center">
                    <Package className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                      {t("noPurchases")}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {t("noPurchasesDescription")}
                    </p>
                    <Button
                      onClick={() => (window.location.href = "/storefront")}
                      className="bg-brand-red-500 hover:bg-brand-red-600"
                    >
                      {t("browseDocuments")}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                purchases.map(renderPurchaseCard)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              {completedPurchases.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400">
                      {t("noCompletedPurchases")}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                completedPurchases.map(renderPurchaseCard)
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-6">
              {pendingPurchases.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400">
                      {t("noPendingPurchases")}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingPurchases.map(renderPurchaseCard)
              )}
            </TabsContent>
          </Tabs>
        )}
      </Container>
    </div>
  );
}
