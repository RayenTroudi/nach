"use client";
import { useState } from "react";
import { Upload, Check, X, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scnToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/shared";
import axios from "axios";
import { UploadDropzone } from "@/lib/upload-thing";

interface BankTransferUploadProps {
  courseIds: string[];
  amount: number;
  onSuccess?: () => void;
}

export default function BankTransferUpload({
  courseIds,
  amount,
  onSuccess,
}: BankTransferUploadProps) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmitProof = async () => {
    if (!uploadedUrl) {
      scnToast({
        variant: "destructive",
        title: "No File Uploaded",
        description: "Please upload a payment proof first.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post("/api/submit-payment-proof", {
        proofUrl: uploadedUrl,
        courseIds: courseIds,
        amount: amount,
        notes: notes,
      });

      if (response.data.success) {
        setUploadStatus("success");
        scnToast({
          variant: "success",
          title: "Upload Successful",
          description: "Your payment proof has been submitted for review.",
        });
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      setUploadStatus("error");
      scnToast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.response?.data?.error || "Failed to submit payment proof.",
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
          Bank Transfer Instructions
        </h3>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Bank Name:</div>
            <div>Banque Centrale de Tunisie</div>
            
            <div className="font-medium">Account Name:</div>
            <div>GermanyFormation SARL</div>
            
            <div className="font-medium">Account Number:</div>
            <div className="font-mono">12345678901234567890</div>
            
            <div className="font-medium">IBAN:</div>
            <div className="font-mono">TN59 1234 5678 9012 3456 7890</div>
            
            <div className="font-medium">BIC/SWIFT:</div>
            <div className="font-mono">BCTUTNTX</div>
            
            <div className="font-medium">Amount to Transfer:</div>
            <div className="text-lg font-bold text-brand-red-500">{amount.toFixed(2)} TND</div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 text-sm">
          <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Important:</p>
          <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
            <li>Please include your full name in the transfer reference</li>
            <li>Take a clear photo or screenshot of the transfer receipt</li>
            <li>Upload the proof below after completing the transfer</li>
            <li>Processing time: 24-48 hours</li>
          </ul>
        </div>
      </div>

      {/* Upload Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upload Payment Proof</h3>

        {/* UploadThing Dropzone */}
        {!uploadedUrl ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
            <UploadDropzone
              endpoint="paymentProof"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setUploadedUrl(res[0].url);
                  setUploadStatus("idle");
                  scnToast({
                    variant: "success",
                    title: "File Uploaded",
                    description: "Payment proof uploaded successfully. Click submit to complete.",
                  });
                }
              }}
              onUploadError={(error: Error) => {
                console.error("Upload error:", error);
                scnToast({
                  variant: "destructive",
                  title: "Upload Failed",
                  description: error.message || "Failed to upload file.",
                });
              }}
              appearance={{
                container: "w-full",
                uploadIcon: "text-slate-400",
                label: "text-slate-700 dark:text-slate-300",
                allowedContent: "text-slate-500 dark:text-slate-400",
              }}
            />
          </div>
        ) : (
          <div className="border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Payment proof uploaded successfully
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
                <span className="text-sm">PDF Document</span>
              </div>
            ) : (
              <img
                src={uploadedUrl}
                alt="Payment proof preview"
                className="max-w-full max-h-64 rounded-lg mx-auto"
              />
            )}
          </div>
        )}

        {/* Notes Field */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Transfer reference number, bank name, etc."
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
              Submitting...
            </>
          ) : uploadStatus === "success" ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Submitted Successfully
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Submit Payment Proof
            </>
          )}
        </Button>

        {/* Status Messages */}
        {uploadStatus === "success" && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-green-800 dark:text-green-200">
              Payment Proof Submitted!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your proof is being reviewed. You&apos;ll receive an email once it&apos;s processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
