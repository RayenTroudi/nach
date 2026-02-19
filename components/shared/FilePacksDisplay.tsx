"use client";
import React, { useState } from "react";
import { Package, ShoppingCart, Check, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scnToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/shared";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface ParentFolder {
  _id: string;
  title: string;
  price: number;
  currency: string;
  isFolder: boolean;
}

interface DocumentBundle {
  _id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  thumbnail?: string;
  isPublished: boolean;
  parentFolder?: ParentFolder;
}

interface Props {
  filePacks: DocumentBundle[];
  userId?: string;
  purchasedBundleIds?: string[];
}

const FilePacksDisplay = ({ filePacks, userId, purchasedBundleIds = [] }: Props) => {
  const router = useRouter();
  const t = useTranslations("video");
  const tStorefront = useTranslations("storefront");
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  if (!filePacks || filePacks.length === 0) {
    return null;
  }

  const handlePurchase = async (bundle: DocumentBundle) => {
    if (!userId) {
      scnToast({
        variant: "warning",
        title: tStorefront("signInRequiredTitle"),
        description: tStorefront("signInRequired"),
      });
      router.push("/sign-in");
      return;
    }

    setPurchasingId(bundle._id);

    try {
      // Check if bundle requires folder purchase
      if (bundle.parentFolder && bundle.parentFolder.price > 0) {
        const parentFolderId = bundle.parentFolder._id;
        
        // Check if user already purchased the parent folder
        if (!purchasedBundleIds.includes(parentFolderId)) {
          // Redirect to folder purchase page
          router.push(`/storefront?folder=${parentFolderId}`);
          setPurchasingId(null);
          return;
        }
      }

      // Navigate to the documents page
      router.push(`/documents`);
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process purchase",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  const handleViewPurchased = (bundleId: string) => {
    router.push(`/student/my-documents?bundle=${bundleId}`);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-red-100 dark:bg-brand-red-900/30 rounded-lg">
            <Package className="w-6 h-6 text-brand-red-600 dark:text-brand-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t("filePacksTitle")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("filePacksSubtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filePacks.map((bundle) => {
            const isPurchased = purchasedBundleIds.includes(bundle._id);
            
            // Check if bundle is locked behind a paid folder
            const isLockedInFolder = bundle.parentFolder && 
                                     bundle.parentFolder.price > 0 && 
                                     !purchasedBundleIds.includes(bundle.parentFolder._id);
            
            return (
              <div
                key={bundle._id}
                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Thumbnail */}
                {bundle.thumbnail ? (
                  <div className="relative w-full h-40 bg-slate-200 dark:bg-slate-800">
                    <Image
                      src={bundle.thumbnail}
                      alt={bundle.title}
                      fill
                      className="object-cover"
                    />
                    {isPurchased && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Check size={12} />
                        {t("owned")}
                      </div>
                    )}
                    {isLockedInFolder && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Lock size={12} />
                        Locked
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-40 bg-gradient-to-br from-brand-red-500 to-brand-red-600 flex items-center justify-center">
                    <Package className="w-16 h-16 text-white opacity-50" />
                    {isPurchased && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Check size={12} />
                        {t("owned")}
                      </div>
                    )}
                    {isLockedInFolder && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Lock size={12} />
                        Locked
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-brand-red-600 dark:group-hover:text-brand-red-400 transition-colors">
                    {bundle.title}
                  </h4>
                  
                  {bundle.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {bundle.description}
                    </p>
                  )}

                  {isLockedInFolder && (
                    <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        🔒 Part of <strong>{bundle.parentFolder!.title}</strong> folder
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Purchase folder ({bundle.parentFolder!.price} {bundle.parentFolder!.currency.toUpperCase()}) to access
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    {isPurchased ? (
                      <Button
                        onClick={() => handleViewPurchased(bundle._id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ExternalLink size={14} className="mr-1" />
                        {t("viewFiles")}
                      </Button>
                    ) : isLockedInFolder ? (
                      <Button
                        onClick={() => handlePurchase(bundle)}
                        disabled={purchasingId === bundle._id}
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        {purchasingId === bundle._id ? (
                          <Spinner size={14} className="text-white mr-1" />
                        ) : (
                          <Lock size={14} className="mr-1" />
                        )}
                        Buy Folder
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePurchase(bundle)}
                        disabled={purchasingId === bundle._id}
                        size="sm"
                        className="bg-brand-red-500 hover:bg-brand-red-600 text-white"
                      >
                        {purchasingId === bundle._id ? (
                          <Spinner size={14} className="text-white mr-1" />
                        ) : (
                          <ShoppingCart size={14} className="mr-1" />
                        )}
                        {t("buyNow")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {t("filePacksTip")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FilePacksDisplay;
