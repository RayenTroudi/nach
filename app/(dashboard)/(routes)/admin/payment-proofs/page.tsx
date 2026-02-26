"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getPaymentProofs, updatePaymentProofStatus } from "./actions";
import { 
  Check, 
  X, 
  Eye, 
  FileText, 
  Clock, 
  User, 
  BookOpen,
  ChevronLeft,
  ChevronRight
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
import { useTranslations } from "next-intl";

interface PaymentProof {
  _id: string;
  userId: {
    _id: string;
    clerkId: string;
    firstName: string;
    lastName: string;
    email: string;
    picture?: string;
  };
  courseIds?: string[]; // For backward compatibility
  itemIds?: string[];
  itemType: "course" | "document" | "bundle";
  amount: number;
  proofUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  adminNotes?: string;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  uploadedAt: string;
  courses?: Array<{
    _id: string;
    title: string;
    thumbnail: string;
    price: number;
  }>;
  items?: Array<{
    _id: string;
    title: string;
    thumbnail?: string;
    price: number;
  }>;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProofs: number;
  hasMore: boolean;
}

export default function PaymentProofsAdminPage() {
  const t = useTranslations('dashboard.admin.paymentProofs');
  const router = useRouter();
  const [allProofs, setAllProofs] = useState<PaymentProof[]>([]); // Store all proofs
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalProofs: 0,
    hasMore: false,
  });
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Filter proofs client-side
  const filteredProofs = statusFilter === "all" 
    ? allProofs 
    : allProofs.filter(proof => proof.status === statusFilter);

  const fetchProofs = async (page: number = 1) => {
    try {
      setIsLoading(true);

      const response = await getPaymentProofs(page, 100, "all");
      
      if (response.success && response.data) {
        setAllProofs(response.data.proofs);
        setPagination(response.data.pagination);
      } else {
        scnToast({
          variant: "destructive",
          title: t('errorTitle'),
          description: response.error || t('errorLoadingProofs'),
        });
      }
    } catch (error: any) {
      console.error("Fetch proofs error:", error);
      scnToast({
        variant: "destructive",
        title: t('errorTitle'),
        description: error.message || t('errorLoadingProofs'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch once on mount

  const handleViewProof = (proof: PaymentProof) => {
    setSelectedProof(proof);
    setAdminNotes(proof.adminNotes || "");
    setIsViewDialogOpen(true);
  };

  const handleApproveReject = async (proofId: string, status: "approved" | "rejected") => {
    if (status === "rejected" && !adminNotes.trim()) {
      scnToast({
        variant: "destructive",
        title: t('adminNotesRequired'),
        description: t('provideReason'),
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await updatePaymentProofStatus(
        proofId,
        status,
        adminNotes.trim() || undefined
      );

      if (response.success) {
        scnToast({
          variant: "success",
          title: status === "approved" ? t('proofApproved') : t('proofRejected'),
          description: status === "approved" ? t('proofApprovedDesc') : t('proofRejectedDesc'),
        });
        
        // Update the proof in the local state
        setAllProofs(prevProofs => 
          prevProofs.map(proof => 
            proof._id === proofId 
              ? { ...proof, status, adminNotes: adminNotes.trim() || proof.adminNotes }
              : proof
          )
        );
        setIsViewDialogOpen(false);
        setAdminNotes("");
      } else {
        scnToast({
          variant: "destructive",
          title: t('errorTitle'),
          description: response.error || (status === "approved" ? t('errorApproving') : t('errorRejecting')),
        });
      }
    } catch (error: any) {
      console.error("Action error:", error);
      scnToast({
        variant: "destructive",
        title: t('errorTitle'),
        description: error.message || (status === "approved" ? t('errorApproving') : t('errorRejecting')),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{t('pendingBadge')}</Badge>;
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">{t('approvedBadge')}</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">{t('rejectedBadge')}</Badge>;
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  if (isLoading) {
    return (
      <div className="flex">
        <LeftSideBar />
        <div className="flex items-center justify-center flex-1 min-h-screen">
          <Spinner size={50} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <LeftSideBar />
      
      <div className="p-6 flex-1">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setStatusFilter("all")}
          variant={statusFilter === "all" ? "default" : "outline"}
          className={statusFilter === "all" ? "bg-brand-red-500 hover:bg-brand-red-600" : ""}
        >
          {t('all')} ({allProofs.length})
        </Button>
        <Button
          onClick={() => setStatusFilter("pending")}
          variant={statusFilter === "pending" ? "default" : "outline"}
          className={statusFilter === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
        >
          {t('pending')} ({allProofs.filter(p => p.status === "pending").length})
        </Button>
        <Button
          onClick={() => setStatusFilter("approved")}
          variant={statusFilter === "approved" ? "default" : "outline"}
          className={statusFilter === "approved" ? "bg-green-500 hover:bg-green-600" : ""}
        >
          {t('approved')} ({allProofs.filter(p => p.status === "approved").length})
        </Button>
        <Button
          onClick={() => setStatusFilter("rejected")}
          variant={statusFilter === "rejected" ? "default" : "outline"}
          className={statusFilter === "rejected" ? "bg-red-500 hover:bg-red-600" : ""}
        >
          {t('rejected')} ({allProofs.filter(p => p.status === "rejected").length})
        </Button>
      </div>

      {/* Proofs List */}
      {filteredProofs.length === 0 ? (
        <div className="text-center py-12 bg-slate-100 dark:bg-slate-900 rounded-lg">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-xl font-semibold mb-2">{t('noProofsFound')}</p>
          <p className="text-slate-600 dark:text-slate-400">
            {statusFilter !== "all"
              ? t('noProofsStatus', { status: statusFilter })
              : t('noProofsSubmitted')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProofs.map((proof) => (
            <div
              key={proof._id}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* User Info */}
                <div className="flex items-start gap-3 flex-1">
                  <Image
                    src={proof.userId?.picture || "/images/default_profile.avif"}
                    alt="User"
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {proof.userId?.firstName} {proof.userId?.lastName}
                      </h3>
                      {getStatusBadge(proof.status)}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {proof.userId?.email}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(proof.uploadedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {formatFileSize(proof.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount & Items */}
                <div className="flex-1">
                  <p className="text-2xl font-bold text-brand-red-500 mb-2">
                    {proof.amount.toFixed(2)} DT
                  </p>
                  
                  {/* Display items based on type */}
                  {proof.items && proof.items.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {proof.itemType === "course" 
                          ? t('courses') 
                          : proof.itemType === "bundle" 
                          ? "Document Bundles"
                          : "Documents"} ({proof.items.length}):
                      </p>
                      {proof.items.map((item) => (
                        <p key={item._id} className="text-sm">
                          {item.title}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {/* Backward compatibility with courses */}
                  {!proof.items && proof.courses && proof.courses.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {t('courses')} ({proof.courses.length}):
                      </p>
                      {proof.courses.map((course) => (
                        <p key={course._id} className="text-sm">
                          {course.title}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {proof.notes && (
                    <div className="mt-2 text-sm">
                      <p className="font-semibold">{t('studentNotes')}</p>
                      <p className="text-slate-600 dark:text-slate-400">{proof.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 md:w-32">
                  <Button
                    onClick={() => handleViewProof(proof)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t('view')}
                  </Button>
                  {proof.status === "pending" && (
                    <>
                      <Button
                        onClick={() => {
                          setSelectedProof(proof);
                          handleApproveReject(proof._id, "approved");
                        }}
                        size="sm"
                        className="w-full bg-green-500 hover:bg-green-600"
                        disabled={actionLoading}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {t('approve')}
                      </Button>
                      <Button
                        onClick={() => handleViewProof(proof)}
                        size="sm"
                        variant="destructive"
                        className="w-full"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t('reject')}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Review Info */}
              {proof.status !== "pending" && proof.reviewedBy && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {proof.status === "approved" ? t('approvedBy') : t('rejectedBy')}{" "}
                    <span className="font-semibold">
                      {proof.reviewedBy.firstName} {proof.reviewedBy.lastName}
                    </span>{" "}
                    {t('on')} {formatDate(proof.reviewedAt!)}
                  </p>
                  {proof.adminNotes && (
                    <p className="text-sm mt-1">
                      <span className="font-semibold">{t('adminNotes')}:</span> {proof.adminNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination removed - loading all proofs at once for better filtering performance */}

      {/* View Proof Dialog */}
      {selectedProof && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('proofDetails')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Proof Image/PDF */}
              <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
                {selectedProof.fileType === "application/pdf" ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    <p className="font-semibold mb-2">{selectedProof.fileName}</p>
                    <Button
                      onClick={() => window.open(selectedProof.proofUrl, "_blank")}
                      variant="outline"
                    >
                      {t('viewProof')}
                    </Button>
                  </div>
                ) : (
                  <Image
                    src={selectedProof.proofUrl}
                    alt="Payment Proof"
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg"
                  />
                )}
              </div>

              {/* User & Payment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('studentInfo')}</p>
                  <p className="font-medium">
                    {selectedProof.userId?.firstName} {selectedProof.userId?.lastName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedProof.userId?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('amount')}</p>
                  <p className="text-2xl font-bold text-brand-red-500">
                    {selectedProof.amount.toFixed(2)} DT
                  </p>
                </div>
              </div>

              {selectedProof.notes && (
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t('studentNotes')}
                  </p>
                  <p className="text-sm bg-slate-100 dark:bg-slate-900 p-3 rounded">
                    {selectedProof.notes}
                  </p>
                </div>
              )}

              {/* Admin Notes Input (for rejection) */}
              {selectedProof.status === "pending" && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t('adminNotes')} {selectedProof.status === "pending" && t('adminNotesRequired')}
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={t('adminNotesPlaceholder')}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-red-500"
                    rows={3}
                  />
                </div>
              )}

              {/* Action Buttons */}
              {selectedProof.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproveReject(selectedProof._id, "approved")}
                    disabled={actionLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    {actionLoading ? <Spinner className="mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    {t('approveProof')}
                  </Button>
                  <Button
                    onClick={() => handleApproveReject(selectedProof._id, "rejected")}
                    disabled={actionLoading || !adminNotes.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    {actionLoading ? <Spinner className="mr-2" /> : <X className="w-4 h-4 mr-2" />}
                    {t('rejectProof')}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
}
