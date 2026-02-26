"use client";
import { useState } from "react";
import Image from "next/image";
import { Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scnToast } from "@/components/ui/use-toast";
import { Spinner, FileUpload } from "@/components/shared";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

interface MeetingPaymentProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
  apiEndpoint?: string; // Optional custom endpoint
}

export default function MeetingPayment({
  bookingId,
  amount,
  onSuccess,
  apiEndpoint = "/api/booking-payment",
}: MeetingPaymentProps) {
  const t = useTranslations('components.meetingPayment');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmitProof = async () => {
    
    // Prevent submission if upload is in progress
    if (isUploading) {
      scnToast({
        variant: "destructive",
        title: t('uploadInProgress') || "Upload in progress",
        description: t('waitForUpload') || "Please wait for the upload to complete.",
      });
      return;
    }
    
    // Validate URL exists and is not empty
    if (!uploadedUrl || uploadedUrl.trim() === '') {
      scnToast({
        variant: "destructive",
        title: t('noFileUploaded'),
        description: t('uploadFirst'),
      });
      return;
    }

    const payload = {
      proofUrl: uploadedUrl,
      bookingId: bookingId,
      amount: amount,
      notes: notes,
    };

    try {
      setIsSubmitting(true);

      const response = await axios.post(apiEndpoint, payload);

      if (response.data.success) {
        setUploadStatus("success");
        scnToast({
          variant: "success",
          title: t('submittedTitle'),
          description: t('submittedDesc'),
        });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.log("⚠️ Response success was false:", response.data);
        scnToast({
          variant: "destructive",
          title: t('submissionFailed'),
          description: response.data.error || t('submissionFailedDesc'),
        });
      }
    } catch (error: any) {
      console.error("❌ Submit error:", error);
      console.error("❌ Error response:", error.response?.data);
      setUploadStatus("error");
      scnToast({
        variant: "destructive",
        title: t('submissionFailed'),
        description: error.response?.data?.error || t('submissionFailedDesc'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (uploadStatus === "success") {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t('submitted')}</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {t('reviewMessage')}
        </p>
        <p className="text-sm text-slate-500">
          {t('meetingLinkMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Bank Account Details */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-brand-red-500" />
          {t('bankTransferTitle')}
        </h3>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">{t('identifier')}</div>
            <div className="font-mono">375202</div>
            
            <div className="font-medium">{t('accountName')}</div>
            <div>TALEL JOUINI</div>
            
            <div className="font-medium">{t('accountType')}</div>
            <div>COMPTES TAWFIR</div>
            
            <div className="font-medium">{t('rib')}</div>
            <div className="font-mono">25109000000056387409</div>
            
            <div className="font-medium">{t('iban')}</div>
            <div className="font-mono">TN59 2510 9000 0000 5638 7409</div>
            
            <div className="font-medium">{t('bic')}</div>
            <div className="font-mono">BZITINTT</div>
            
            <div className="font-medium">{t('bankName')}</div>
            <div>BANQUE ZITOUNA</div>
            
            <div className="font-medium">{t('amountTND')}</div>
            <div className="text-lg font-bold text-brand-red-500">{amount} DT</div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 text-sm">
          <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">{t('important')}</p>
          <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
            <li>{t('includeReference')}</li>
            <li>{t('takePhoto')}</li>
            <li>{t('uploadProof')}</li>
            <li>{t('processingTime')}</li>
            <li>{t('meetingLinkSent')}</li>
          </ul>
        </div>
      </div>

      {/* Upload Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('uploadTitle')}</h3>

        {!uploadedUrl ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
            <FileUpload
              endpoint="paymentProof"
              autoUpload={true}
              onUploadStart={() => {
                setIsUploading(true);
                setUploadedUrl(null); // Clear any previous URL
                console.log("📤 Upload started...");
              }}
              onChange={(url) => {
                setIsUploading(false);
                if (url && typeof url === 'string' && url.trim() !== '') {
                  setUploadedUrl(url);
                  setUploadStatus("idle");
                  console.log("✅ Upload complete. URL:", url);
                  scnToast({
                    variant: "success",
                    title: t('fileUploaded'),
                    description: t('submitProof'),
                  });
                } else {
                  console.error("❌ Invalid URL received:", url);
                  setUploadedUrl(null);
                }
              }}
              onUploadError={() => {
                setIsUploading(false);
                setUploadedUrl(null);
                setUploadStatus("error");
                console.error("❌ Upload failed");
              }}
              className="w-full"
            />
            {isUploading && (
              <div className="mt-2 text-center">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Uploading... Please wait and do not close this window.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  {t('fileUploaded')}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadedUrl(null);
                  setUploadStatus("idle");
                  setIsUploading(false);
                  console.log("🔄 File cleared, ready for new upload");
                }}
              >
                {t('changeFile')}
              </Button>
            </div>
            
            {uploadedUrl && (
              <div className="mt-4 relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                <Image
                  src={uploadedUrl}
                  fill
                  className="object-contain"
                  alt="Payment proof preview"
                />
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('additionalNotes')}
          </label>
          <Textarea
            placeholder={t('notesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitProof}
          disabled={!uploadedUrl || isSubmitting || isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>
              <Spinner />
              {t('uploading') || 'Uploading...'}
            </>
          ) : isSubmitting ? (
            <>
              <Spinner />
              {t('submitting')}
            </>
          ) : (
            t('submitProof')
          )}
        </Button>

        {/* Helper text */}
        {!uploadedUrl && !isUploading && (
          <p className="text-xs text-center text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ {t('uploadRequired') || 'Please upload payment proof to continue'}
          </p>
        )}
        
        {isUploading && (
          <p className="text-xs text-center text-blue-600 dark:text-blue-400 font-medium">
            ⏳ {t('uploadingWait') || 'Upload in progress, please wait...'}
          </p>
        )}

        <p className="text-xs text-center text-slate-500">
          {t('confirmAuthentic')}
        </p>
      </div>
    </div>
  );
}
