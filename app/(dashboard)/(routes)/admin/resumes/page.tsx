"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { 
  Check, 
  X, 
  Eye, 
  FileText,
  User, 
  Mail,
  Phone,
  CreditCard,
  Upload,
  Download,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { scnToast } from "@/components/ui/use-toast";
import { Spinner, LeftSideBar } from "@/components/shared";
import FileUpload from "@/components/shared/FileUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResumeRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentRole?: string;
  targetRole?: string;
  experience?: string;
  education?: string;
  skills?: string;
  additionalInfo?: string;
  documentUrl?: string;
  price: number;
  paymentProofUrl?: string;
  paymentStatus: "pending" | "paid" | "rejected";
  status: "pending" | "in_progress" | "completed" | "rejected";
  adminNotes?: string;
  completedResumeUrl?: string;
  createdAt: string;
}

export default function AdminResumesPage() {
  const t = useTranslations('dashboard.admin');
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "completed" | "rejected">("pending");
  const [selectedRequest, setSelectedRequest] = useState<ResumeRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [completedResumeUrl, setCompletedResumeUrl] = useState("");

  const filteredRequests = statusFilter === "all" 
    ? requests 
    : requests.filter(req => req.status === statusFilter);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/resume-request");
      
      console.log("Resume requests response:", response.data);
      
      if (response.data.success) {
        setRequests(response.data.resumeRequests);
      } else {
        console.error("No success flag in response:", response.data);
      }
    } catch (error: any) {
      console.error("Error fetching resume requests:", error);
      scnToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch resume requests",
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
    setAdminNotes(request.adminNotes || "");
    setCompletedResumeUrl(request.completedResumeUrl || "");
    setIsViewDialogOpen(true);
  };

  const handleApprovePayment = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      const response = await axios.patch(`/api/resume-request/${selectedRequest._id}`, {
        paymentStatus: "paid",
        status: "in_progress",
        adminNotes,
      });

      if (response.data.success) {
        scnToast({
          title: "Success",
          description: "Payment approved! Resume request is now in progress.",
        });

        setRequests(prev =>
          prev.map(req =>
            req._id === selectedRequest._id
              ? { ...req, paymentStatus: "paid", status: "in_progress", adminNotes }
              : req
          )
        );

        setIsViewDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error approving payment:", error);
      scnToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to approve payment",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      const response = await axios.patch(`/api/resume-request/${selectedRequest._id}`, {
        paymentStatus: "rejected",
        status: "rejected",
        adminNotes,
      });

      if (response.data.success) {
        scnToast({
          title: "Success",
          description: "Payment rejected. Student will be notified.",
        });

        setRequests(prev =>
          prev.map(req =>
            req._id === selectedRequest._id
              ? { ...req, paymentStatus: "rejected", status: "rejected", adminNotes }
              : req
          )
        );

        setIsViewDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error rejecting payment:", error);
      scnToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to reject payment",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitResume = async () => {
    if (!selectedRequest || !completedResumeUrl) {
      scnToast({
        title: "Error",
        description: "Please upload the completed resume first",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.patch(`/api/resume-request/${selectedRequest._id}`, {
        status: "completed",
        completedResumeUrl,
        adminNotes,
      });

      if (response.data.success) {
        scnToast({
          title: "Success",
          description: "Resume submitted successfully! Student has been notified.",
        });

        setRequests(prev =>
          prev.map(req =>
            req._id === selectedRequest._id
              ? { ...req, status: "completed", completedResumeUrl, adminNotes }
              : req
          )
        );

        setIsViewDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error submitting resume:", error);
      scnToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to submit resume",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      case "paid": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400";
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    inProgress: requests.filter(r => r.status === "in_progress").length,
    completed: requests.filter(r => r.status === "completed").length,
  };

  return (
    <div className="flex gap-6 min-h-screen bg-slate-50 dark:bg-slate-950">
      <LeftSideBar />
      
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Resume Requests Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Review payment proofs, manage resume creation workflow, and deliver completed resumes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Requests</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <Check className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["all", "pending", "in_progress", "completed", "rejected"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="whitespace-nowrap"
            >
              {status === "all" ? "All" : status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              {status !== "all" && ` (${requests.filter(r => r.status === status).length})`}
            </Button>
          ))}
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No resume requests found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {statusFilter === "all" 
                ? "No resume requests have been submitted yet." 
                : `No ${statusFilter.replace("_", " ")} requests found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {request.name}
                      </h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace("_", " ")}
                      </Badge>
                      <Badge className={getPaymentStatusColor(request.paymentStatus)}>
                        Payment: {request.paymentStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail className="w-4 h-4" />
                        {request.email}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="w-4 h-4" />
                        {request.phone}
                      </div>
                      {request.targetRole && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <FileText className="w-4 h-4" />
                          Target: {request.targetRole}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <CreditCard className="w-4 h-4" />
                        {request.price} TND
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
                      Submitted: {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleViewRequest(request)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View/Edit Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('resumes.detailsTitle')}
              </DialogTitle>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* Status Badges */}
                <div className="flex gap-2">
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    Status: {selectedRequest.status.replace("_", " ")}
                  </Badge>
                  <Badge className={getPaymentStatusColor(selectedRequest.paymentStatus)}>
                    Payment: {selectedRequest.paymentStatus}
                  </Badge>
                </div>

                <Separator />

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Name</p>
                      <p className="font-medium">{selectedRequest.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                      <p className="font-medium">{selectedRequest.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                      <p className="font-medium">{selectedRequest.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Price</p>
                      <p className="font-medium">{selectedRequest.price} TND</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Professional Details */}
                <div>
                  <h3 className="font-semibold mb-3">Professional Details</h3>
                  <div className="space-y-3">
                    {selectedRequest.currentRole && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Current Role</p>
                        <p className="font-medium">{selectedRequest.currentRole}</p>
                      </div>
                    )}
                    {selectedRequest.targetRole && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Target Role</p>
                        <p className="font-medium">{selectedRequest.targetRole}</p>
                      </div>
                    )}
                    {selectedRequest.experience && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Experience</p>
                        <p className="text-sm">{selectedRequest.experience}</p>
                      </div>
                    )}
                    {selectedRequest.education && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Education</p>
                        <p className="text-sm">{selectedRequest.education}</p>
                      </div>
                    )}
                    {selectedRequest.skills && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Skills</p>
                        <p className="text-sm">{selectedRequest.skills}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current CV */}
                {selectedRequest.documentUrl && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">Current CV/Resume</h3>
                      <a
                        href={selectedRequest.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        Download Current CV
                      </a>
                    </div>
                  </>
                )}

                {/* Payment Proof */}
                {selectedRequest.paymentProofUrl && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">Payment Proof</h3>
                      <div className="border rounded-lg overflow-hidden mb-3">
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
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View full size →
                      </a>
                    </div>
                  </>
                )}

                {/* Additional Info */}
                {selectedRequest.additionalInfo && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Additional Information</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                        {selectedRequest.additionalInfo}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Upload Completed Resume (for in_progress status) */}
                {selectedRequest.status === "in_progress" && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">Upload Completed Resume</h3>
                      {completedResumeUrl ? (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="text-sm flex-1">Resume uploaded successfully</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCompletedResumeUrl("")}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <FileUpload
                          endpoint="documentUpload"
                          onChange={(url) => setCompletedResumeUrl(url || "")}
                        />
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                {/* View Completed Resume (for completed status) */}
                {selectedRequest.completedResumeUrl && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">Completed Resume</h3>
                      <a
                        href={selectedRequest.completedResumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-green-600 hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        Download Completed Resume
                      </a>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Admin Notes */}
                <div>
                  <h3 className="font-semibold mb-2">Admin Notes</h3>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this request..."
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                    disabled={actionLoading}
                  >
                    Close
                  </Button>

                  {/* Payment Approval Buttons */}
                  {selectedRequest.paymentStatus === "pending" && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={handleRejectPayment}
                        disabled={actionLoading}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject Payment
                      </Button>
                      <Button
                        onClick={handleApprovePayment}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading ? (
                          <Spinner />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Approve Payment
                          </>
                        )}
                      </Button>
                    </>
                  )}

                  {/* Submit Completed Resume */}
                  {selectedRequest.status === "in_progress" && (
                    <Button
                      onClick={handleSubmitResume}
                      disabled={actionLoading || !completedResumeUrl}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {actionLoading ? (
                        <Spinner />
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Resume to Student
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
