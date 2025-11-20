"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Loader2, CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadDropzone } from "@/lib/upload-thing";
import { LeftSideBar } from "@/components/shared";
import axios from "axios";

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
  paymentStatus: "pending" | "paid" | "rejected";
  status: "pending" | "in_progress" | "completed" | "rejected";
  completedResumeUrl?: string;
  createdAt: string;
}

export default function TeacherResumeRequestsPage() {
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ResumeRequest | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/resume-request");
      if (response.ok) {
        const data = await response.json();
        setRequests(data.resumeRequests);
      }
    } catch (error) {
      toast.error("Failed to fetch resume requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResume = (request: ResumeRequest) => {
    setSelectedRequest(request);
    setUploadedUrl(null);
    setIsUploadDialogOpen(true);
  };

  const handleStartWorking = async (request: ResumeRequest) => {
    try {
      await axios.post("/api/resume-update-status", {
        requestId: request._id,
        status: "in_progress",
      });

      toast.success("Status updated to In Progress");
      fetchRequests();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleViewDetails = (request: ResumeRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleSubmitResume = async () => {
    if (!uploadedUrl || !selectedRequest) {
      toast.error("Please upload a resume file first");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/resume-complete", {
        requestId: selectedRequest._id,
        completedResumeUrl: uploadedUrl,
      });

      toast.success("Resume delivered successfully!");
      setIsUploadDialogOpen(false);
      setUploadedUrl(null);
      fetchRequests();
    } catch (error) {
      toast.error("Failed to submit resume");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
            Pending
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter((request) => {
    // Only show requests with paid payment status
    if (request.paymentStatus !== "paid") return false;
    
    if (filterStatus === "all") return true;
    return request.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex gap-6 min-h-screen bg-slate-50 dark:bg-slate-950">
        <LeftSideBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 min-h-screen bg-slate-50 dark:bg-slate-950">
      <LeftSideBar />
      
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500/10 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Resume Requests</h1>
              <p className="text-slate-600 dark:text-slate-400">Create and deliver professional resumes</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              className="rounded-full"
            >
              All ({filteredRequests.length})
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              className="rounded-full"
            >
              To Start ({requests.filter(r => r.status === "pending" && r.paymentStatus === "paid").length})
            </Button>
            <Button
              variant={filterStatus === "in_progress" ? "default" : "outline"}
              onClick={() => setFilterStatus("in_progress")}
              className="rounded-full"
            >
              In Progress ({requests.filter(r => r.status === "in_progress").length})
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              onClick={() => setFilterStatus("completed")}
              className="rounded-full"
            >
              Completed ({requests.filter(r => r.status === "completed").length})
            </Button>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card className="border-2 border-slate-200 dark:border-slate-800">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-2">
                No Resume Requests
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                There are no approved resume requests at the moment
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card
                key={request._id}
                className="border-2 border-slate-200 dark:border-slate-800"
              >
                <CardHeader className="bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                          {request.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{request.name}</CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{request.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {getStatusBadge(request.status)}
                        <Badge variant="outline">{request.targetRole || "Resume"}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {request.status === "pending" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleStartWorking(request)}
                        >
                          Start Working
                        </Button>
                      )}
                      {request.status === "completed" ? (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Delivered
                        </Button>
                      ) : request.status === "in_progress" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUploadResume(request)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                Upload Completed Resume
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Student:</strong> {selectedRequest?.name}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Target Role:</strong> {selectedRequest?.targetRole}
                </p>
              </div>

              {!uploadedUrl ? (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                  <UploadDropzone
                    endpoint="resumeDocument"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        setUploadedUrl(res[0].url);
                        toast.success("Resume uploaded successfully");
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`Upload failed: ${error.message}`);
                    }}
                  />
                </div>
              ) : (
                <div className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-slate-950 dark:text-white">Resume uploaded</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Ready to deliver</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadedUrl(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleSubmitResume}
                disabled={!uploadedUrl || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Delivering...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Deliver Resume to Student
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Resume Request Details</DialogTitle>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Name</label>
                    <p className="text-slate-950 dark:text-white">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                    <p className="text-slate-950 dark:text-white">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</label>
                    <p className="text-slate-950 dark:text-white">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Target Role</label>
                    <p className="text-slate-950 dark:text-white">{selectedRequest.targetRole || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Role</label>
                    <p className="text-slate-950 dark:text-white">{selectedRequest.currentRole || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Experience</label>
                    <p className="text-slate-950 dark:text-white">{selectedRequest.experience || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Education</label>
                  <p className="text-slate-950 dark:text-white whitespace-pre-wrap">{selectedRequest.education || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Skills</label>
                  <p className="text-slate-950 dark:text-white whitespace-pre-wrap">{selectedRequest.skills || "N/A"}</p>
                </div>

                {selectedRequest.additionalInfo && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Additional Information</label>
                    <p className="text-slate-950 dark:text-white whitespace-pre-wrap">{selectedRequest.additionalInfo}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
