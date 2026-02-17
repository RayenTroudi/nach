"use client";
import { useState } from "react";
import Image from "next/image";
import { Upload, Check, X, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scnToast } from "@/components/ui/use-toast";
import { Spinner, FileUpload } from "@/components/shared";
import axios from "axios";
import { useTranslations } from 'next-intl';

interface BankTransferUploadProps {
  courseIds: string[];
  amount: number;
  onSuccess?: () => void;
  itemType?: "course" | "document" | "bundle" | "resume";
  itemId?: string;
}

export default function BankTransferUpload({
  courseIds,
  amount,
  onSuccess,
  itemType = "course",
  itemId,
}: BankTransferUploadProps) {
  const t = useTranslations('course.bankTransfer');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmitProof = async () => {
    if (!uploadedUrl) {
      scnToast({
        variant: "destructive",
        title: t('noFileUploaded'),
        description: t('noFileUploadedDesc'),
      });
      return;
    }

    try {
      setIsSubmitting(true);

      let response;
      
      // Route to the correct API based on item type
      if (itemType === "document" || itemType === "bundle") {
        // Document/Bundle purchases go to document-purchases API
        response = await axios.post("/api/document-purchases", {
          itemType: itemType,
          itemId: itemId || courseIds[0],
          proofUrl: uploadedUrl,
          amount: amount,
          notes: notes,
        });
      } else if (itemType === "resume") {
        // Resume payment goes to resume-payment API
        response = await axios.post("/api/resume-payment", {
          resumeRequestId: itemId || courseIds[0],
          proofUrl: uploadedUrl,
          notes: notes,
        });
      } else {
        // Course purchases go to submit-payment-proof API
        response = await axios.post("/api/submit-payment-proof", {
          proofUrl: uploadedUrl,
          courseIds: courseIds,
          amount: amount,
          notes: notes,
        });
      }

      if (response.data.success) {
        setUploadStatus("success");
        scnToast({
          variant: "success",
          title: t('uploadSuccessful'),
          description: t('uploadSuccessfulDesc'),
        });
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      setUploadStatus("error");
      scnToast({
        variant: "destructive",
        title: t('submissionFailed'),
        description: error.response?.data?.error || t('submissionFailed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Bank Account Details */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-brand-red-500" />
          {t('title')}
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
            
            <div className="font-medium">{t('swiftCode')}</div>
            <div className="font-mono">BZITINTT</div>
            
            <div className="font-medium">{t('bankName')}</div>
            <div>BANQUE ZITOUNA</div>
            
            <div className="font-medium">{t('amountToTransfer')}</div>
            <div className="text-lg font-bold text-brand-red-500">{amount.toFixed(2)} TND</div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 text-sm">
          <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">{t('important')}</p>
          <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
            <li>{t('includeFullName')}</li>
            <li>{t('takeClearPhoto')}</li>
            <li>{t('uploadProofBelow')}</li>
            <li>{t('processingTime')}</li>
          </ul>
        </div>
      </div>

      {/* Upload Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('uploadProofTitle')}</h3>

        {/* UploadThing Dropzone */}
        {!uploadedUrl ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
            <FileUpload
              endpoint="paymentProof"
              autoUpload={true}
              onChange={(url) => {
                if (url) {
                  setUploadedUrl(url);
                  setUploadStatus("idle");
                  scnToast({
                    variant: "success",
                    title: t('fileUploaded'),
                    description: t('fileUploadedDesc'),
                  });
                }
              }}
              className="w-full"
            />
          </div>
        ) : (
          <div className="border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {t('paymentProofUploaded')}
                </span>
              </div>
              <button
                onClick={() => {
                  setUploadedUrl(null);
                }}
                className="text-red-500 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {uploadedUrl.toLowerCase().endsWith('.pdf') ? (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <FileText className="w-8 h-8" />
                <span className="text-sm">{t('pdfDocument')}</span>
              </div>
            ) : (
              <Image
                src={uploadedUrl}
                alt="Payment proof preview"
                width={500}
                height={300}
                className="max-w-full max-h-64 rounded-lg mx-auto object-contain"
              />
            )}
          </div>
        )}

        {/* Notes Field */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('additionalNotes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notesPlaceholder')}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-red-500"
            rows={3}
          />
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleSubmitProof}
          disabled={!uploadedUrl || isSubmitting || uploadStatus === "success"}
          className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-white font-semibold py-3"
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              {t('submitting')}
            </>
          ) : uploadStatus === "success" ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              {t('submittedSuccessfully')}
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              {t('submitProof')}
            </>
          )}
        </Button>

        {/* Status Messages */}
        {uploadStatus === "success" && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-green-800 dark:text-green-200">
              {t('paymentProofSubmitted')}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {t('proofUnderReview')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
