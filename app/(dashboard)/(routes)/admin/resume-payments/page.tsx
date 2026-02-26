"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getResumeRequests, approvePayment, rejectPayment } from "./actions";
import { 
  Check, 
  X, 
  Eye, 
  FileText,
  Clock, 
  Mail,
  Phone,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { scnToast } from "@/components/ui/use-toast";
import { Spinner, LeftSideBar } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ResumeRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  targetRole?: string;
  price: number;
  paymentProofUrl?: string;
  paymentStatus: "pending" | "paid" | "rejected";
  status: "pending" | "in_progress" | "completed" | "rejected";
  createdAt: string;
}

export default function AdminResumePaymentsPage() {
  const t = useTranslations('dashboard.admin.resumePayments');
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "rejected">("pending");
  const [selectedRequest, setSelectedRequest] = useState<ResumeRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const filteredRequests = statusFilter === "all" 
    ? requests 
    : requests.filter(req => req.paymentStatus === statusFilter);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await getResumeRequests();
      
      console.log("Resume requests data:", response.data);
      
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        scnToast({
          title: "Error",
          description: response.error || "Failed to fetch resume requests",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error fetching resume requests:", error);
      scnToast({
        title: "Error",
        description: error.message || "Failed to fetch resume requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleViewRequest = (request: ResumeRequest) => {
    setSelectedRequest(request);
    setAdminNotes("");
    setIsViewDialogOpen(true);
  };

  const handleApprovePayment = async () => {
    if (!selectedRequest) return;

    try {
      setApproveLoading(true);
      const response = await approvePayment(selectedRequest._id, adminNotes);

      if (response.success) {
        scnToast({
          title: "Success",
          description: "Payment approved! Resume request is now available for the instructor.",
        });

        setRequests(prev =>
          prev.map(req =>
            req._id === selectedRequest._id
              ? { ...req, paymentStatus: "paid", status: "in_progress" }
              : req
          )
        );

        setIsViewDialogOpen(false);
      } else {
        scnToast({
          title: "Error",
          description: response.error || "Failed to approve payment",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error approving payment:", error);
      scnToast({
        title: "Error",
        description: error.message || "Failed to approve payment",
        variant: "destructive",
      });
    } finally {
      setApproveLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedRequest) return;

    if (!adminNotes.trim()) {
      scnToast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setRejectLoading(true);
      const response = await rejectPayment(selectedRequest._id, adminNotes);

      if (response.success) {
        scnToast({
          title: response.emailSent ? "Success" : "Warning",
          description: response.message || (response.emailSent 
            ? "Payment rejected. Student will be notified." 
            : "Payment rejected but email failed. Contact student manually."),
          variant: response.emailSent ? "default" : "destructive",
        });

        setRequests(prev =>
          prev.map(req =>
            req._id === selectedRequest._id
              ? { ...req, paymentStatus: "rejected", status: "rejected" }
              : req
          )
        );

        setIsViewDialogOpen(false);
      } else {
        scnToast({
          title: "Error",
          description: response.error || "Failed to reject payment",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error rejecting payment:", error);
      scnToast({
        title: "Error",
        description: error.message || "Failed to reject payment",
        variant: "destructive",
      });
    } finally {
      setRejectLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex gap-4">
      <LeftSideBar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-950 dark:text-slate-200 mb-2">
              {t('title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {t('subtitle')}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className="rounded-full"
            >
              {t('all')} ({requests.length})
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
              className="rounded-full"
            >
              {t('pending')} ({requests.filter(r => r.paymentStatus === "pending").length})
            </Button>
            <Button
              variant={statusFilter === "paid" ? "default" : "outline"}
              onClick={() => setStatusFilter("paid")}
              className="rounded-full"
            >
              {t('approved')} ({requests.filter(r => r.paymentStatus === "paid").length})
            </Button>
            <Button
              variant={statusFilter === "rejected" ? "default" : "outline"}
              onClick={() => setStatusFilter("rejected")}
              className="rounded-full"
            >
              {t('rejected')} ({requests.filter(r => r.paymentStatus === "rejected").length})
            </Button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-200 mb-2">
                {t('noRequestsFound')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t('noRequestsDesc')}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* User Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-200">
                            {request.name}
                          </h3>
                          <Badge className={getStatusColor(request.paymentStatus)}>
                            {request.paymentStatus}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{request.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{request.phone}</span>
                          </div>
                          {request.targetRole && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>{t('targetRole')}: {request.targetRole}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span>{request.price} TND</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(request.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t('viewDetails')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View Payment Proof Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('detailsTitle')}</DialogTitle>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* Student Info */}
                <div>
                  <h3 className="font-semibold mb-3">{t('studentInfo')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('name')}:</span>
                      <span className="font-medium">{selectedRequest.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('email')}:</span>
                      <span className="font-medium">{selectedRequest.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('phone')}:</span>
                      <span className="font-medium">{selectedRequest.phone}</span>
                    </div>
                    {selectedRequest.targetRole && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('targetRole')}:</span>
                        <span className="font-medium">{selectedRequest.targetRole}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('status')}:</span>
                      <Badge className={getStatusColor(selectedRequest.paymentStatus)}>
                        {selectedRequest.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Details */}
                <div>
                  <h3 className="font-semibold mb-3">{t('paymentInfo')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('amount')}:</span>
                      <span className="font-medium">{selectedRequest.price} TND</span>
                    </div>
                  </div>
                </div>

                {/* Payment Proof */}
                {selectedRequest.paymentProofUrl ? (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">{t('paymentProof')}</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Image
                          src={selectedRequest.paymentProofUrl}
                          alt="Payment proof"
                          width={600}
                          height={400}
                          className="w-full h-auto"
                        />
                      </div>
                      <a
                        href={selectedRequest.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                      >
                        {t('viewFullSize')} →
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <Separator />
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-600 dark:text-slate-400">{t('noProofUploaded')}</p>
                      <p className="text-xs text-slate-500 mt-2">Payment proof URL: {String(selectedRequest.paymentProofUrl || 'null')}</p>
                    </div>
                  </>
                )}

                {/* Admin Notes */}
                {selectedRequest.paymentStatus === "pending" && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">{t('adminNotes')}</h3>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder={t('adminNotesPlaceholder')}
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {/* Actions */}
                {selectedRequest.paymentStatus === "pending" && (
                  <>
                    <Separator />
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsViewDialogOpen(false)}
                        disabled={approveLoading || rejectLoading}
                      >
                        {t('close')}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleRejectPayment}
                        disabled={approveLoading || rejectLoading}
                      >
                        {rejectLoading ? (
                          <Spinner />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            {t('reject')}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleApprovePayment}
                        disabled={approveLoading || rejectLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approveLoading ? (
                          <Spinner />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            {t('approve')}
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}
