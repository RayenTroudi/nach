"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  FolderOpen,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  Folder,
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
import { Container, LeftSideBar } from "@/components/shared";
import Loader from "@/components/shared/Loader";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import DocumentViewer from "./_components/DocumentViewer";

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
    isFolder?: boolean;
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
    // Folder fields
    childBundles?: Array<{
      _id: string;
      title: string;
      description?: string;
      category?: string;
      documents?: Array<{
        _id: string;
        title: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
      }>;
    }>;
    uploadedBy: {
      firstName: string;
      lastName: string;
      picture?: string;
    };
  } | null;
}

export default function MyDocumentsPage() {
  const searchParams = useSearchParams();
  const t = useTranslations("myDocuments");
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation state for folders and bundles
  const [currentView, setCurrentView] = useState<"root" | "folder" | "bundle">("root");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentBundleId, setCurrentBundleId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ level: "root" | "folder" | "bundle"; id: string | null; name: string }>>([
    { level: "root", id: null, name: "My Documents" }
  ]);
  
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    fileUrl: string;
    fileName: string;
    title: string;
  } | null>(null);

  const fetchPurchases = useCallback(async () => {
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
  }, [t]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  // Navigation functions
  const navigateToFolder = (purchase: Purchase) => {
    if (purchase.itemId && purchase.itemId.isFolder) {
      setCurrentView("folder");
      setCurrentFolderId(purchase.itemId._id);
      setBreadcrumbs([
        { level: "root", id: null, name: "My Documents" },
        { level: "folder", id: purchase.itemId._id, name: purchase.itemId.title }
      ]);
    }
  };

  const navigateToBundle = (bundleId: string, bundleName: string) => {
    setCurrentView("bundle");
    setCurrentBundleId(bundleId);
    setBreadcrumbs(prev => [...prev, { level: "bundle", id: bundleId, name: bundleName }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    const crumb = breadcrumbs[index];
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    
    if (crumb.level === "root") {
      setCurrentView("root");
      setCurrentFolderId(null);
      setCurrentBundleId(null);
    } else if (crumb.level === "folder") {
      setCurrentView("folder");
      setCurrentFolderId(crumb.id);
      setCurrentBundleId(null);
    } else if (crumb.level === "bundle") {
      setCurrentView("bundle");
      setCurrentBundleId(crumb.id);
    }
  };

  const goBack = () => {
    if (breadcrumbs.length > 1) {
      navigateToBreadcrumb(breadcrumbs.length - 2);
    }
  };

  // Auto-expand bundle from URL param - removed as we now use navigation
  useEffect(() => {
    const bundleId = searchParams.get("bundle");
    if (bundleId) {
      // Find the purchase with this bundle
      const purchase = purchases.find(p => p.itemId?._id === bundleId);
      if (purchase && purchase.itemId) {
        if (purchase.itemId.isFolder) {
          navigateToFolder(purchase);
        }
      }
    }
  }, [searchParams, purchases]);

  const handleOpenDocument = (fileUrl: string, fileName: string, title: string) => {
    setSelectedDocument({ fileUrl, fileName, title });
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedDocument(null);
  };

  // Get current items to display based on navigation
  const getCurrentItems = () => {
    if (currentView === "root") {
      // Show all purchased items at root level
      return purchases;
    } else if (currentView === "folder" && currentFolderId) {
      // Show child bundles of the current folder
      const folderPurchase = purchases.find(p => p.itemId?._id === currentFolderId);
      if (folderPurchase && folderPurchase.itemId?.childBundles) {
        return folderPurchase.itemId.childBundles.map(bundle => ({
          _id: `child-${bundle._id}`,
          itemType: "bundle" as const,
          amount: 0,
          currency: folderPurchase.currency,
          paymentStatus: folderPurchase.paymentStatus,
          paymentMethod: folderPurchase.paymentMethod,
          createdAt: folderPurchase.createdAt,
          itemId: {
            _id: bundle._id,
            title: bundle.title,
            description: bundle.description || "",
            category: bundle.category || "",
            isFolder: false,
            documents: bundle.documents,
            uploadedBy: folderPurchase.itemId!.uploadedBy,
          }
        }));
      }
      return [];
    } else if (currentView === "bundle" && currentBundleId) {
      // Show documents of the current bundle
      const folderPurchase = purchases.find(p => p.itemId?.isFolder);
      if (folderPurchase && folderPurchase.itemId?.childBundles) {
        const bundle = folderPurchase.itemId.childBundles.find(b => b._id === currentBundleId);
        if (bundle && bundle.documents) {
          return bundle.documents.map(doc => ({
            _id: `doc-${doc._id}`,
            itemType: "document" as const,
            amount: 0,
            currency: folderPurchase.currency,
            paymentStatus: folderPurchase.paymentStatus,
            paymentMethod: folderPurchase.paymentMethod,
            createdAt: folderPurchase.createdAt,
            itemId: {
              _id: doc._id,
              title: doc.title,
              description: "",
              category: "",
              fileUrl: doc.fileUrl,
              fileName: doc.fileName,
              fileSize: doc.fileSize,
              uploadedBy: folderPurchase.itemId!.uploadedBy,
            }
          }));
        }
      }
      return [];
    }
    return [];
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

  const renderPurchaseCard = (purchase: Purchase) => {
    const { itemType, itemId, paymentStatus } = purchase;
    
    // Handle deleted items
    if (!itemId) {
      return (
        <Card key={purchase._id} className="opacity-60">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <XCircle className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-slate-500">(Item deleted)</CardTitle>
                <CardDescription>
                  This {itemType} is no longer available
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {purchase.amount} {purchase.currency.toUpperCase()}
                  </Badge>
                  {paymentStatus === "completed" && (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Paid
                    </Badge>
                  )}
                  {paymentStatus === "pending" && (
                    <Badge className="bg-yellow-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {paymentStatus === "rejected" && (
                    <Badge className="bg-red-500">
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejected
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      );
    }
    
    const isBundle = itemType === "bundle";
    const isFolder = itemId.isFolder;
    const canAccess = paymentStatus === "completed";

    const handleCardDoubleClick = () => {
      if (!canAccess) return;
      
      if (currentView === "root" && isFolder) {
        navigateToFolder(purchase);
      } else if (currentView === "folder" && isBundle) {
        navigateToBundle(itemId._id, itemId.title);
      }
    };

    return (
      <Card
        key={purchase._id}
        id={isBundle ? `bundle-${itemId._id}` : undefined}
        className={`transition-all h-full flex flex-col ${(isFolder || (isBundle && currentView === "folder")) && canAccess ? 'cursor-pointer hover:shadow-xl hover:scale-105 hover:border-brand-red-300 dark:hover:border-brand-red-700' : 'hover:shadow-lg'}`}
        onDoubleClick={handleCardDoubleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex flex-col items-center text-center gap-3">
            <div
              className={`p-4 rounded-xl ${
                isBundle || isFolder
                  ? "bg-purple-50 dark:bg-purple-900/20"
                  : "bg-brand-red-50 dark:bg-brand-red-900/20"
              }`}
            >
              {isBundle || isFolder ? (
                <Folder className="w-10 h-10 text-purple-500" />
              ) : (
                <FileText className="w-10 h-10 text-brand-red-500" />
              )}
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {(isBundle || isFolder) && (
                  <Badge variant="secondary" className="text-xs">
                    <Package className="w-3 h-3 mr-1" />
                    {isFolder ? "Folder" : t("bundle")}
                  </Badge>
                )}
                {getStatusBadge(paymentStatus)}
              </div>
              <CardTitle className="text-lg line-clamp-2">{itemId.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-xs">
                {itemId.description || t("noDescription")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between pt-3">
          {/* Price and Date Info */}
          <div className="space-y-3 mb-3">
            <div className="flex items-center justify-between text-sm pb-3 border-b">
              <span className="text-slate-600 dark:text-slate-400">{t("paid")}</span>
              <span className="font-bold text-brand-red-500">
                {formatPrice(purchase.amount, purchase.currency)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              {format(new Date(purchase.createdAt), "MMM dd, yyyy")}
            </div>
          </div>

          {/* Single Document Actions */}
          {!isBundle && !isFolder && itemId.fileUrl && (
            <Button
              size="sm"
              onClick={() => handleOpenDocument(itemId.fileUrl!, itemId.fileName!, itemId.title)}
              disabled={!canAccess}
              className="w-full bg-brand-red-500 hover:bg-brand-red-600"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t("openDocument")}
            </Button>
          )}

          {/* Double-click hint for folders/bundles */}
          {((currentView === "root" && isFolder) || (currentView === "folder" && isBundle)) && canAccess && (
            <div className="text-center py-2 text-xs text-slate-500 dark:text-slate-400">
              💡 Double-click to open
            </div>
          )}

          {/* Documents in current bundle (when viewing a bundle) */}
          {currentView === "bundle" && itemId.documents && canAccess && (
            <div className="space-y-2 pt-3 border-t">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                {t("documentsInBundle")} ({itemId.documents.length})
              </p>
              {itemId.documents.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => handleOpenDocument(doc.fileUrl, doc.fileName, doc.title)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-brand-red-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-medium truncate group-hover:text-brand-red-500 transition-colors">
                        {doc.title}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-red-500 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Access Denied Message */}
          {!canAccess && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                {paymentStatus === "pending"
                  ? t("accessPending")
                  : t("accessDenied")}
              </p>
            </div>
          )}

          {/* Uploaded By */}
          <div className="pt-3 mt-auto border-t text-xs text-center text-slate-500 dark:text-slate-400">
            {itemId.uploadedBy.firstName} {itemId.uploadedBy.lastName}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen">
      <LeftSideBar />
      <div className="flex-1 min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-12">
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              {t("title")}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
          </div>

          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 1 && (
            <div className="mb-6 flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <button
                    onClick={() => navigateToBreadcrumb(index)}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      index === breadcrumbs.length - 1
                        ? "bg-brand-red-500 text-white font-medium"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>
          )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : (
          <>
            {/* Current View Content */}
            {getCurrentItems().length === 0 ? (
              <Card>
                <CardContent className="py-20 text-center">
                  <Package className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    {currentView === "root" ? t("noPurchases") : "No items here"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {currentView === "root" 
                      ? t("noPurchasesDescription")
                      : "This folder is empty"}
                  </p>
                  {currentView === "root" && (
                    <Button
                      onClick={() => (window.location.href = "/storefront")}
                      className="bg-brand-red-500 hover:bg-brand-red-600"
                    >
                      {t("browseDocuments")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCurrentItems().map(renderPurchaseCard)}
              </div>
            )}
          </>
        )}
      </Container>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          isOpen={viewerOpen}
          onClose={handleCloseViewer}
          fileUrl={selectedDocument.fileUrl}
          fileName={selectedDocument.fileName}
          title={selectedDocument.title}
        />
      )}
    </div>
  );
}
