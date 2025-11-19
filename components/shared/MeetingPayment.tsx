"use client";
import { useState } from "react";
import Image from "next/image";
import { Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scnToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/shared";
import axios from "axios";
import { UploadDropzone } from "@/lib/upload-thing";
import { Textarea } from "@/components/ui/textarea";

interface MeetingPaymentProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
}

export default function MeetingPayment({
  bookingId,
  amount,
  onSuccess,
}: MeetingPaymentProps) {
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

      const response = await axios.post("/api/booking-payment", {
        proofUrl: uploadedUrl,
        bookingId: bookingId,
        amount: amount,
        notes: notes,
      });

      if (response.data.success) {
        setUploadStatus("success");
        scnToast({
          variant: "success",
          title: "Payment Submitted",
          description: "Your payment proof has been submitted. You'll receive confirmation once verified.",
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

  const priceInEuros = (amount / 3.3).toFixed(2);

  if (uploadStatus === "success") {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Proof Submitted!</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          We&apos;ll review your payment and send you a confirmation email within 24-48 hours.
        </p>
        <p className="text-sm text-slate-500">
          You&apos;ll receive your meeting link once the payment is verified.
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
            
            <div className="font-medium">Amount (TND):</div>
            <div className="text-lg font-bold text-brand-red-500">{amount.toFixed(2)} TND</div>
            
            <div className="font-medium">Amount (EUR):</div>
            <div className="text-lg font-semibold">€{priceInEuros}</div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 text-sm">
          <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Important:</p>
          <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
            <li>Include your full name and booking ID in the transfer reference</li>
            <li>Take a clear photo or screenshot of the transfer receipt</li>
            <li>Upload the proof below after completing the transfer</li>
            <li>Processing time: 24-48 hours</li>
            <li>Meeting link will be sent after payment verification</li>
          </ul>
        </div>
      </div>

      {/* Upload Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upload Payment Proof</h3>

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
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  Payment proof uploaded successfully
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadedUrl(null)}
              >
                Change File
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
            Additional Notes (Optional)
          </label>
          <Textarea
            placeholder="Add any notes about the transfer (e.g., transaction reference number)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitProof}
          disabled={!uploadedUrl || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Spinner />
              Submitting...
            </>
          ) : (
            "Submit Payment Proof"
          )}
        </Button>

        <p className="text-xs text-center text-slate-500">
          By submitting, you confirm that the payment has been made and the proof is authentic.
        </p>
      </div>
    </div>
  );
}
