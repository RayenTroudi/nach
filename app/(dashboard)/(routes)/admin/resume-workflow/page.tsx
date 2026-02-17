"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import { 
  FileText,
  Upload,
  Download,
  Clock,
  Mail,
  Phone,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Info,
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

interface ResumeRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  professionalExperience?: string;
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

export default function ResumeWorkflowPage() {
  const t = useTranslations('dashboard.admin');
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"in_progress" | "completed">("in_progress");
  const [selectedRequest, setSelectedRequest] = useState<ResumeRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [completedResumeUrl, setCompletedResumeUrl] = useState("");

  // Only show approved requests (paid) that are in_progress or completed
  const approvedRequests = requests.filter(req => req.paymentStatus === "paid");
  const filteredRequests = approvedRequests.filter(req => req.status === statusFilter);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/resume-request");
      
      if (response.data.success) {
        setRequests(response.data.resumeRequests);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
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

  const stats = {
    inProgress: approvedRequests.filter(r => r.status === "in_progress").length,
    completed: approvedRequests.filter(r => r.status === "completed").length,
  };

  return (
    <div className="flex gap-6 min-h-screen bg-slate-50 dark:bg-slate-950">
      <LeftSideBar />
      
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Resume Creation Workflow
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create and deliver professional resumes for approved requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Awaiting Resume Creation</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Resumes Delivered</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <FileText className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={statusFilter === "in_progress" ? "default" : "outline"}
            onClick={() => setStatusFilter("in_progress")}
            className={statusFilter === "in_progress" ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            In Progress ({stats.inProgress})
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            onClick={() => setStatusFilter("completed")}
            className={statusFilter === "completed" ? "bg-green-500 hover:bg-green-600" : ""}
          >
            Completed ({stats.completed})
          </Button>
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
              No requests found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {statusFilter === "in_progress" 
                ? "No resume requests awaiting creation." 
                : "No completed resumes yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {request.name}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail className="w-4 h-4" />
                        {request.email}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="w-4 h-4" />
                        {request.phone}
                      </div>
                      {request.targetRole && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 col-span-2">
                          <Briefcase className="w-4 h-4" />
                          <span className="font-medium">Target Role:</span> {request.targetRole}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Submitted: {formatDate(request.createdAt)}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleViewRequest(request)}
                    variant="outline"
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Request Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('resumeWorkflow.detailsTitle')}
              </DialogTitle>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* Status Badge */}
                <div>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <Separator />

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Name</p>
                      <p className="font-medium">{selectedRequest.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                      <p className="font-medium text-sm break-all">{selectedRequest.email}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                      <p className="font-medium">{selectedRequest.phone}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Professional Details */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Professional Details
                  </h3>
                  <div className="space-y-4">
                    {selectedRequest.professionalExperience && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Professional Experience</p>
                        <p className="text-sm whitespace-pre-wrap">{selectedRequest.professionalExperience}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                {selectedRequest.additionalInfo && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Additional Information
                      </h3>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{selectedRequest.additionalInfo}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Current CV Download */}
                {selectedRequest.documentUrl && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">Current CV/Resume</h3>
                      <a
                        href={selectedRequest.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      >
                        <Download className="w-4 h-4" />
                        Download Current CV
                      </a>
                    </div>
                  </>
                )}

                <Separator />

                {/* Upload Completed Resume (for in_progress) */}
                {selectedRequest.status === "in_progress" && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload Completed Resume
                    </h3>
                    {completedResumeUrl ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm flex-1 text-green-700 dark:text-green-400">Resume uploaded successfully</span>
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
                )}

                {/* View Completed Resume (for completed) */}
                {selectedRequest.completedResumeUrl && selectedRequest.status === "completed" && (
                  <div>
                    <h3 className="font-semibold mb-3">Completed Resume</h3>
                    <a
                      href={selectedRequest.completedResumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
                    >
                      <Download className="w-4 h-4" />
                      Download Completed Resume
                    </a>
                  </div>
                )}

                {/* Admin/Instructor Notes */}
                {selectedRequest.status === "in_progress" && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Notes (Optional)</h3>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add any notes about this resume creation..."
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                    disabled={actionLoading}
                  >
                    Close
                  </Button>

                  {selectedRequest.status === "in_progress" && (
                    <Button
                      onClick={handleSubmitResume}
                      disabled={actionLoading || !completedResumeUrl}
                      className="bg-green-600 hover:bg-green-700"
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
