"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, CheckCircle2, Eye } from "lucide-react";
import { Spinner } from "@/components/shared";
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
import { useTranslations } from "next-intl";

interface ResumeRequest {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  birthDate?: string;
  address?: string;
  phone: string;
  driverLicense?: string;
  germanLevel?: string;
  frenchLevel?: string;
  englishLevel?: string;
  hasBac?: string;
  bacObtainedDate?: string;
  bacStudiedDate?: string;
  bacSection?: string;
  bacHighSchool?: string;
  bacCity?: string;
  postBacStudies?: string;
  internships?: string;
  trainings?: string;
  desiredTraining?: string;
  currentRole?: string;
  targetRole?: string;
  experience?: string;
  education?: string;
  skills?: string;
  additionalInfo?: string;
  documentUrl?: string;
  paymentStatus: "pending" | "paid" | "rejected";
  status: "pending" | "in_progress" | "completed" | "rejected";
  completedResumeUrl?: string;
  completedMotivationLetterUrl?: string;
  completedMotivationLetter2Url?: string;
  createdAt: string;
}

export default function TeacherResumeRequestsPage() {
  const t = useTranslations("teacher.resumeRequests");
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ResumeRequest | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedMotivationLetterUrl, setUploadedMotivationLetterUrl] = useState<string | null>(null);
  const [uploadedMotivationLetter2Url, setUploadedMotivationLetter2Url] = useState<string | null>(null);
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
    setUploadedMotivationLetterUrl(null);
    setUploadedMotivationLetter2Url(null);
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
      console.log("Submitting documents:", {
        requestId: selectedRequest._id,
        completedResumeUrl: uploadedUrl,
        completedMotivationLetterUrl: uploadedMotivationLetterUrl,
        completedMotivationLetter2Url: uploadedMotivationLetter2Url,
      });

      await axios.post("/api/resume-complete", {
        requestId: selectedRequest._id,
        completedResumeUrl: uploadedUrl,
        completedMotivationLetterUrl: uploadedMotivationLetterUrl,
        completedMotivationLetter2Url: uploadedMotivationLetter2Url,
      });

      toast.success("Resume and motivation letter delivered successfully!");
      setIsUploadDialogOpen(false);
      setUploadedUrl(null);
      setUploadedMotivationLetterUrl(null);
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
          <Spinner size={32} />
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
              <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{t('title')}</h1>
              <p className="text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              className="rounded-full"
            >
              {t('all')} ({filteredRequests.length})
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              className="rounded-full"
            >
              {t('toStart')} ({requests.filter(r => r.status === "pending" && r.paymentStatus === "paid").length})
            </Button>
            <Button
              variant={filterStatus === "in_progress" ? "default" : "outline"}
              onClick={() => setFilterStatus("in_progress")}
              className="rounded-full"
            >
              {t('inProgress')} ({requests.filter(r => r.status === "in_progress").length})
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              onClick={() => setFilterStatus("completed")}
              className="rounded-full"
            >
              {t('completed')} ({requests.filter(r => r.status === "completed").length})
            </Button>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card className="border-2 border-slate-200 dark:border-slate-800">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-2">
                {t('noRequests')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t('noRequestsDesc')}
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
                        {t('viewDetails')}
                      </Button>
                      {request.status === "pending" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleStartWorking(request)}
                        >
                          {t('startWorking')}
                        </Button>
                      )}
                      {request.status === "completed" ? (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {t('delivered')}
                        </Button>
                      ) : request.status === "in_progress" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUploadResume(request)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {t('uploadResume')}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                {t('uploadDialogTitle')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{t('student')}:</strong> {selectedRequest?.name}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{t('targetRole')}:</strong> {selectedRequest?.targetRole}
                </p>
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-950 dark:text-white">{t('resumeCV')} {t('required')}</h4>
                {!uploadedUrl ? (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                    <UploadDropzone
                      endpoint="resumeDocument"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setUploadedUrl(res[0].url);
                          toast.success(t('resumeUploadSuccess'));
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`${t('uploadFailed')}: ${error.message}`);
                      }}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-slate-950 dark:text-white">{t('resumeUploaded')}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{t('readyToDeliver')}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadedUrl(null)}
                      >
                        {t('change')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Motivation Letter Upload */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-950 dark:text-white">{t('motivationLetter')}</h4>
                {!uploadedMotivationLetterUrl ? (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                    <UploadDropzone
                      endpoint="resumeDocument"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setUploadedMotivationLetterUrl(res[0].url);
                          toast.success(t('motivationLetterUploadSuccess'));
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`${t('uploadFailed')}: ${error.message}`);
                      }}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-slate-950 dark:text-white">{t('motivationLetterUploaded')}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{t('readyToDeliver')}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadedMotivationLetterUrl(null)}
                      >
                        {t('change')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Second Motivation Letter Upload */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-950 dark:text-white">{t('motivationLetter2')}</h4>
                {!uploadedMotivationLetter2Url ? (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                    <UploadDropzone
                      endpoint="resumeDocument"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setUploadedMotivationLetter2Url(res[0].url);
                          toast.success(t('motivationLetter2UploadSuccess'));
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`${t('uploadFailed')}: ${error.message}`);
                      }}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-slate-950 dark:text-white">{t('motivationLetter2Uploaded')}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{t('readyToDeliver')}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadedMotivationLetter2Url(null)}
                      >
                        {t('change')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleSubmitResume}
                disabled={!uploadedUrl || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size={16} className="mr-2" />
                    {t('delivering')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t('deliverToStudent')}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{t('detailsTitle')}</DialogTitle>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* Training Selection */}
                {selectedRequest.desiredTraining && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      {t('details.desiredTraining')}
                    </label>
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">{selectedRequest.desiredTraining}</p>
                  </div>
                )}

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-3 border-b pb-2">
                    {t('details.personalInfo')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.firstName')}</label>
                      <p className="text-slate-950 dark:text-white">{selectedRequest.firstName || selectedRequest.name.split(' ')[0] || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.lastName')}</label>
                      <p className="text-slate-950 dark:text-white">{selectedRequest.lastName || selectedRequest.name.split(' ').slice(1).join(' ') || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.email')}</label>
                      <p className="text-slate-950 dark:text-white break-all">{selectedRequest.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.phone')}</label>
                      <p className="text-slate-950 dark:text-white">{selectedRequest.phone}</p>
                    </div>
                    {selectedRequest.birthDate && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.birthDate')}</label>
                        <p className="text-slate-950 dark:text-white">{new Date(selectedRequest.birthDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedRequest.address && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.address')}</label>
                        <p className="text-slate-950 dark:text-white">{selectedRequest.address}</p>
                      </div>
                    )}
                    {selectedRequest.driverLicense && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.driverLicense')}</label>
                        <p className="text-slate-950 dark:text-white capitalize">{selectedRequest.driverLicense}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Language Levels */}
                {(selectedRequest.germanLevel || selectedRequest.frenchLevel || selectedRequest.englishLevel) && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-3 border-b pb-2">
                      {t('details.languageLevels')}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedRequest.germanLevel && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.german')}</label>
                          <p className="text-slate-950 dark:text-white font-semibold">{selectedRequest.germanLevel}</p>
                        </div>
                      )}
                      {selectedRequest.frenchLevel && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.french')}</label>
                          <p className="text-slate-950 dark:text-white font-semibold">{selectedRequest.frenchLevel}</p>
                        </div>
                      )}
                      {selectedRequest.englishLevel && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.english')}</label>
                          <p className="text-slate-950 dark:text-white font-semibold">{selectedRequest.englishLevel}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Baccalaureate Education */}
                {selectedRequest.hasBac && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-3 border-b pb-2">
                      {t('details.bacEducation')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.hasBac')}</label>
                        <p className="text-slate-950 dark:text-white capitalize">{selectedRequest.hasBac}</p>
                      </div>
                      {selectedRequest.bacObtainedDate && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.bacObtainedDate')}</label>
                          <p className="text-slate-950 dark:text-white">{new Date(selectedRequest.bacObtainedDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {selectedRequest.bacStudiedDate && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.bacStudiedDate')}</label>
                          <p className="text-slate-950 dark:text-white">{new Date(selectedRequest.bacStudiedDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {selectedRequest.bacSection && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.bacSection')}</label>
                          <p className="text-slate-950 dark:text-white">{selectedRequest.bacSection}</p>
                        </div>
                      )}
                      {selectedRequest.bacHighSchool && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.bacHighSchool')}</label>
                          <p className="text-slate-950 dark:text-white">{selectedRequest.bacHighSchool}</p>
                        </div>
                      )}
                      {selectedRequest.bacCity && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.bacCity')}</label>
                          <p className="text-slate-950 dark:text-white">{selectedRequest.bacCity}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Post-Bac Studies & Experience */}
                {(selectedRequest.postBacStudies || selectedRequest.internships || selectedRequest.trainings) && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-3 border-b pb-2">
                      {t('details.postBacExperience')}
                    </h3>
                    {selectedRequest.postBacStudies && (
                      <div className="mb-4">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          {t('details.postBacStudies')}
                        </label>
                        <p className="text-slate-950 dark:text-white whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 p-3 rounded">
                          {selectedRequest.postBacStudies}
                        </p>
                      </div>
                    )}
                    {selectedRequest.internships && (
                      <div className="mb-4">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          {t('details.internships')}
                        </label>
                        <p className="text-slate-950 dark:text-white whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 p-3 rounded">
                          {selectedRequest.internships}
                        </p>
                      </div>
                    )}
                    {selectedRequest.trainings && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          {t('details.trainings')}
                        </label>
                        <p className="text-slate-950 dark:text-white whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 p-3 rounded">
                          {selectedRequest.trainings}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Professional Details */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-3 border-b pb-2">
                    {t('details.professionalDetails')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {selectedRequest.currentRole && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.currentRole')}</label>
                        <p className="text-slate-950 dark:text-white">{selectedRequest.currentRole}</p>
                      </div>
                    )}
                    {selectedRequest.targetRole && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('details.targetRole')}</label>
                        <p className="text-slate-950 dark:text-white">{selectedRequest.targetRole}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedRequest.experience && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                        {t('details.experience')}
                      </label>
                      <p className="text-slate-950 dark:text-white whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 p-3 rounded">
                        {selectedRequest.experience}
                      </p>
                    </div>
                  )}

                  {selectedRequest.education && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                        {t('details.education')}
                      </label>
                      <p className="text-slate-950 dark:text-white whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 p-3 rounded">
                        {selectedRequest.education}
                      </p>
                    </div>
                  )}

                  {selectedRequest.skills && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                        {t('details.skills')}
                      </label>
                      <p className="text-slate-950 dark:text-white whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 p-3 rounded">
                        {selectedRequest.skills}
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                {selectedRequest.additionalInfo && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-3 border-b pb-2">
                      {t('details.additionalInfo')}
                    </h3>
                    <p className="text-slate-950 dark:text-white whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 p-3 rounded">
                      {selectedRequest.additionalInfo}
                    </p>
                  </div>
                )}

                {/* Document */}
                {selectedRequest.documentUrl && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-3 border-b pb-2">
                      {t('details.supportingDocument')}
                    </h3>
                    <a
                      href={selectedRequest.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <FileText className="w-4 h-4" />
                      {t('details.viewDocument')}
                    </a>
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
