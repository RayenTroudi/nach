"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Upload, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { UploadButton } from "@/lib/upload-thing";

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  itemType: "document" | "bundle";
  itemId: string;
  title: string;
  price: number;
  currency: string;
  onSuccess?: () => void;
}

export function PurchaseModal({
  open,
  onClose,
  itemType,
  itemId,
  title,
  price,
  currency,
  onSuccess,
}: PurchaseModalProps) {
  const t = useTranslations("purchaseModal");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "stripe">("bank_transfer");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === "usd" ? "$" : currency === "tnd" ? "TND" : currency;
    return `${symbol}${price}`;
  };

  const handleSubmit = async () => {
    if (paymentMethod === "bank_transfer" && !paymentProofUrl) {
      toast.error(t("uploadProofRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/document-purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType,
          itemId,
          paymentProofUrl: paymentMethod === "bank_transfer" ? paymentProofUrl : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Purchase failed");
      }

      toast.success(t("purchaseSubmitted"));
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || t("purchaseError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Item Details */}
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {itemType === "bundle" ? t("bundle") : t("document")}
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {title}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400">{t("total")}</p>
                <p className="text-2xl font-bold text-brand-red-500">
                  {formatPrice(price, currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>{t("paymentMethod")}</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">{t("bankTransfer")}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t("bankTransferDescription")}
                    </p>
                  </div>
                </Label>
              </div>
              
              {/* Stripe option (for future implementation) */}
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 opacity-50">
                <RadioGroupItem value="stripe" id="stripe" disabled />
                <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">{t("creditCard")}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t("comingSoon")}
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Bank Transfer Instructions */}
          {paymentMethod === "bank_transfer" && (
            <div className="space-y-4">
              {/* Bank Details */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  {t("bankDetails")}
                </p>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <p><strong>{t("bankName")}:</strong> Bank of Germany</p>
                  <p><strong>{t("accountNumber")}:</strong> 1234567890</p>
                  <p><strong>{t("routingNumber")}:</strong> 987654321</p>
                  <p><strong>{t("accountName")}:</strong> Germany Formation GmbH</p>
                  <p><strong>{t("reference")}:</strong> {itemId.slice(-8).toUpperCase()}</p>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 pt-2 border-t border-blue-200 dark:border-blue-800">
                  {t("includeReference")}
                </p>
              </div>

              {/* Upload Proof */}
              <div className="space-y-2">
                <Label htmlFor="payment-proof">{t("uploadPaymentProof")}</Label>
                {!paymentProofUrl ? (
                  <UploadButton
                    endpoint="paymentProof"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.url) {
                        setPaymentProofUrl(res[0].url);
                        toast.success(t("uploadSuccess"));
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(t("uploadError"));
                      console.error(error);
                    }}
                    appearance={{
                      button:
                        "w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
                      allowedContent: "text-slate-600 dark:text-slate-400 text-xs",
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-300 flex-1">
                      {t("proofUploaded")}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPaymentProofUrl("")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t("uploadInstructions")}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (paymentMethod === "bank_transfer" && !paymentProofUrl)}
              className="flex-1 bg-brand-red-500 hover:bg-brand-red-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                t("submitPurchase")
              )}
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center text-slate-600 dark:text-slate-400">
            {t("disclaimer")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
