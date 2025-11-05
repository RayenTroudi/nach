"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import { Clock, FileText, Check, X, AlertCircle, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/shared";
import { scnToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

interface PaymentProof {
  _id: string;
  courseIds: string[];
  amount: number;
  proofUrl: string;
  fileName: string;
  fileType: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  adminNotes?: string;
  uploadedAt: string;
  reviewedAt?: string;
  courses?: Array<{
    _id: string;
    title: string;
    thumbnail: string;
  }>;
}

export default function MyPaymentProofsPage() {
  const { user, isLoaded } = useUser();
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyProofs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/my-payment-proofs");
        
        if (response.data.success) {
          setProofs(response.data.data.proofs);
        }
      } catch (error: any) {
        console.error("Fetch proofs error:", error);
        scnToast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.error || "Failed to load your payment proofs",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchMyProofs();
    }
  }, [isLoaded, user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 flex items-center gap-1">
            <X className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={50} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Payment Proofs</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track the status of your payment proof submissions
        </p>
      </div>

      {proofs.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-semibold mb-2">No Payment Proofs</h2>
          <p className="text-slate-600 dark:text-slate-400">
            You haven't submitted any payment proofs yet
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {proofs.map((proof) => (
            <Card key={proof._id} className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Proof Preview */}
                <div className="md:w-48 flex-shrink-0">
                  {proof.fileType === "application/pdf" ? (
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-6 flex flex-col items-center justify-center h-full">
                      <FileText className="w-12 h-12 text-slate-400 mb-2" />
                      <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                        {proof.fileName}
                      </p>
                    </div>
                  ) : (
                    <Image
                      src={proof.proofUrl}
                      alt="Payment Proof"
                      width={192}
                      height={144}
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  )}
                </div>

                {/* Proof Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-2xl font-bold text-brand-red-500">
                        {proof.amount.toFixed(2)} DT
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Submitted on {formatDate(proof.uploadedAt)}
                      </p>
                    </div>
                    {getStatusBadge(proof.status)}
                  </div>

                  {/* Courses */}
                  {proof.courses && proof.courses.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        Courses ({proof.courses.length})
                      </p>
                      <div className="space-y-2">
                        {proof.courses.map((course) => (
                          <div key={course._id} className="flex items-center gap-2">
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              width={48}
                              height={32}
                              className="rounded object-cover"
                            />
                            <p className="text-sm font-medium">{course.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Student Notes */}
                  {proof.notes && (
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Your Notes
                      </p>
                      <p className="text-sm">{proof.notes}</p>
                    </div>
                  )}

                  {/* Status Messages */}
                  {proof.status === "pending" && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                          Under Review
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          Your payment proof is being reviewed by our admin team. This typically takes 24-48 hours.
                          You'll receive an email once it's processed.
                        </p>
                      </div>
                    </div>
                  )}

                  {proof.status === "approved" && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex gap-2">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                          Payment Approved!
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          Your payment has been verified and you've been enrolled in the course(s).
                          {proof.reviewedAt && ` Approved on ${formatDate(proof.reviewedAt)}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {proof.status === "rejected" && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
                      <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                          Payment Rejected
                        </p>
                        {proof.adminNotes && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                              Admin Notes:
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                              {proof.adminNotes}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                          Please submit a new payment proof with the correct information.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
