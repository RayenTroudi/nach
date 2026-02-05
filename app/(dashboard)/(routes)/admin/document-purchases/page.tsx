"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import {
  Check,
  X,
  Eye,
  FileText,
  Clock,
  User,
  Package,
  FolderOpen,
  Download,
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

interface DocumentPurchase {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    picture?: string;
  };
  itemType: "document" | "bundle";
  itemId: {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    uploadedBy?: {
      firstName: string;
      lastName: string;
    };
  } | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: "pending" | "completed" | "rejected";
  paymentProofUrl?: string;
  createdAt: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminDocumentPurchasesPage() {
  const router = useRouter();
  const [allPurchases, setAllPurchases] = useState<DocumentPurchase[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<DocumentPurchase | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Client-side filtering
  const filteredPurchases = allPurchases.filter((purchase) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "approved") return purchase.paymentStatus === "completed";
    if (statusFilter === "rejected") return purchase.paymentStatus === "rejected";
    return purchase.paymentStatus === statusFilter;
  });

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/admin/document-purchases");
      if (response.data.purchases) {
        setAllPurchases(response.data.purchases);
      }
    } catch (error: any) {
      console.error("Error fetching purchases:", error);
      scnToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch purchases",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleViewPurchase = (purchase: DocumentPurchase) => {
    setSelectedPurchase(purchase);
    setAdminNotes("");
    setIsViewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedPurchase) return;

    try {
      setActionLoading(true);
      const response = await axios.patch(`/api/document-purchases/${selectedPurchase._id}`, {
        paymentStatus: "completed",
      });

      if (response.data) {
        scnToast({
          title: "Success",
          description: "Purchase approved! Student now has access to the document(s).",
        });

        setAllPurchases((prev) =>
          prev.map((p) =>
            p._id === selectedPurchase._id ? { ...p, paymentStatus: "completed" } : p
          )
        );

        setIsViewDialogOpen(false);
        setAdminNotes("");
      }
    } catch (error: any) {
      console.error("Error approving purchase:", error);
      scnToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to approve purchase",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPurchase) return;

    if (!adminNotes.trim()) {
      scnToast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.patch(`/api/document-purchases/${selectedPurchase._id}`, {
        paymentStatus: "rejected",
      });

      if (response.data) {
        scnToast({
          title: "Success",
          description: "Purchase rejected. Student will be notified.",
        });

        setAllPurchases((prev) =>
          prev.map((p) =>
            p._id === selectedPurchase._id ? { ...p, paymentStatus: "rejected" } : p
          )
        );

        setIsViewDialogOpen(false);
        setAdminNotes("");
      }
    } catch (error: any) {
      console.error("Error rejecting purchase:", error);
      scnToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to reject purchase",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 text-white border-0">
            <Check className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white border-0">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500 text-white border-0">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <LeftSideBar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <LeftSideBar />
      <div className="flex-1 min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              Document Purchase Approvals
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Review and approve student document/bundle purchases
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              onClick={() => setStatusFilter("all")}
              variant={statusFilter === "all" ? "default" : "outline"}
            >
              All ({allPurchases.length})
            </Button>
            <Button
              onClick={() => setStatusFilter("pending")}
              variant={statusFilter === "pending" ? "default" : "outline"}
              className={statusFilter === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              Pending ({allPurchases.filter(p => p.paymentStatus === "pending").length})
            </Button>
            <Button
              onClick={() => setStatusFilter("approved")}
              variant={statusFilter === "approved" ? "default" : "outline"}
              className={statusFilter === "approved" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              Approved ({allPurchases.filter(p => p.paymentStatus === "completed").length})
            </Button>
            <Button
              onClick={() => setStatusFilter("rejected")}
              variant={statusFilter === "rejected" ? "default" : "outline"}
              className={statusFilter === "rejected" ? "bg-red-500 hover:bg-red-600" : ""}
            >
              Rejected ({allPurchases.filter(p => p.paymentStatus === "rejected").length})
            </Button>
          </div>

          {/* Purchases List */}
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-12 bg-slate-100 dark:bg-slate-900 rounded-lg">
              <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <p className="text-xl font-semibold mb-2">No purchases found</p>
              <p className="text-slate-600 dark:text-slate-400">
                {statusFilter !== "all"
                  ? `No ${statusFilter} purchases at the moment`
                  : "No purchases submitted yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPurchases.map((purchase) => (
                <div
                  key={purchase._id}
                  className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* User Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <Image
                        src={purchase.userId?.picture || "/images/default_profile.avif"}
                        alt="User"
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {purchase.userId?.firstName || "Unknown"} {purchase.userId?.lastName || "User"}
                          </h3>
                          {getStatusBadge(purchase.paymentStatus)}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {purchase.userId?.email || "No email available"}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(purchase.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            {purchase.itemType === "bundle" ? (
                              <FolderOpen className="w-3 h-3" />
                            ) : (
                              <FileText className="w-3 h-3" />
                            )}
                            {purchase.itemType === "bundle" ? "Bundle" : "Document"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Item & Amount */}
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-brand-red-500 mb-2">
                        {purchase.amount} {purchase.currency.toUpperCase()}
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          {purchase.itemId?.title || "(Item deleted)"}
                        </p>
                        {purchase.itemId?.category && (
                          <Badge variant="outline" className="text-xs">
                            {purchase.itemId.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:w-32">
                      <Button
                        onClick={() => handleViewPurchase(purchase)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {purchase.paymentStatus === "pending" && (
                        <>
                          <Button
                            onClick={() => {
                              setSelectedPurchase(purchase);
                              setAdminNotes("");
                              setIsViewDialogOpen(true);
                            }}
                            size="sm"
                            className="w-full bg-green-500 hover:bg-green-600"
                            disabled={actionLoading}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleViewPurchase(purchase)}
                            size="sm"
                            variant="destructive"
                            className="w-full"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Dialog */}
        {selectedPurchase && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Purchase Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Payment Proof */}
                {selectedPurchase.paymentProofUrl && (
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
                    <Image
                      src={selectedPurchase.paymentProofUrl}
                      alt="Payment Proof"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                {/* User & Item Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Student Info
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src={selectedPurchase.userId?.picture || "/images/default_profile.avif"}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">
                          {selectedPurchase.userId.firstName} {selectedPurchase.userId.lastName}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {selectedPurchase.userId.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Amount
                    </p>
                    <p className="text-2xl font-bold text-brand-red-500">
                      {selectedPurchase.amount} {selectedPurchase.currency.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Item Details */}
                <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-brand-red-50 dark:bg-brand-red-900/20 rounded">
                      {selectedPurchase.itemType === "bundle" ? (
                        <FolderOpen className="w-6 h-6 text-brand-red-500" />
                      ) : (
                        <FileText className="w-6 h-6 text-brand-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {selectedPurchase.itemType === "bundle" ? "Bundle" : "Document"}
                      </p>
                      <h4 className="font-medium mb-1">{selectedPurchase.itemId?.title || "(Item deleted)"}</h4>
                      {selectedPurchase.itemId?.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {selectedPurchase.itemId.description}
                        </p>
                      )}
                      {selectedPurchase.itemId?.category && (
                        <Badge variant="outline" className="mt-2">
                          {selectedPurchase.itemId.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Notes Input */}
                {selectedPurchase.paymentStatus === "pending" && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Admin Notes (Required for rejection)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this purchase..."
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-red-500"
                      rows={3}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {selectedPurchase.paymentStatus === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      {actionLoading ? (
                        <Spinner className="mr-2" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Approve Purchase
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={actionLoading || !adminNotes.trim()}
                      variant="destructive"
                      className="flex-1"
                    >
                      {actionLoading ? (
                        <Spinner className="mr-2" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      Reject Purchase
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
