"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import Link from "next/link";
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Plus,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { scnToast } from "@/components/ui/use-toast";
import { LeftSideBar } from "@/components/shared";
import { useTranslations } from "next-intl";

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
  price: number;
  paymentStatus: "pending" | "paid" | "rejected";
  status: "pending" | "in_progress" | "completed" | "rejected";
  adminNotes?: string;
  completedResumeUrl?: string;
  completedMotivationLetterUrl?: string;
  completedMotivationLetter2Url?: string;
  createdAt: string;
}

export default function MyResumePage() {
  const t = useTranslations("dashboard.student.myResume");
  const { user } = useUser();
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/my-resume-requests");
      
      if (response.data.success) {
        setRequests(response.data.resumeRequests);
      }
    } catch (error: any) {
      console.error("Error fetching resume requests:", error);
      scnToast({
        title: t("errorTitle"),
        description: error.response?.data?.error || t("errorFetching"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <XCircle className="w-3 h-3 mr-1" />
          {t("paymentRejected")}
        </Badge>
      );
    }

    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            {t("pendingReview")}
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            {t("inProgress")}
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t("completed")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            {t("rejected")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = (status: string, paymentStatus: string, adminNotes?: string) => {
    if (paymentStatus === "rejected") {
      return (
        <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{t("paymentNotApproved")}</p>
            {adminNotes && <p className="mt-1">{adminNotes}</p>}
          </div>
        </div>
      );
    }

    switch (status) {
      case "pending":
        return (
          <div className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded">
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{t("beingReviewed")}</p>
          </div>
        );
      case "in_progress":
        return (
          <div className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded border border-blue-200 dark:border-blue-800">
            <Loader2 className="w-4 h-4 mt-0.5 flex-shrink-0 animate-spin" />
            <p>{t("crafting")}</p>
          </div>
        );
      case "completed":
        return (
          <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 p-3 rounded">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{t("resumeReady")}</p>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded">
            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{t("notApproved")}</p>
              {adminNotes && <p className="mt-1">{t("reason")}: {adminNotes}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-6 min-h-screen bg-slate-50 dark:bg-slate-950">
      <LeftSideBar />
      
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8 text-brand-red-500" />
              {t("title")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>
          <Link href="/contact/resume">
            <Button className="bg-brand-red-500 hover:bg-brand-red-600">
              <Plus className="w-4 h-4 mr-2" />
              {t("newRequest")}
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-red-500" />
          </div>
        ) : requests.length === 0 ? (
          /* Empty State */
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t("noRequestsYet")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">
                {t("getGermanCV")}
              </p>
              <Link href="/contact/resume">
                <Button className="bg-brand-red-500 hover:bg-brand-red-600">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("requestFirst")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Requests List */
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request._id} className="border-2 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {request.targetRole || t("professionalResume")}
                      </CardTitle>
                      {request.currentRole && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {t("currentRole")}: {request.currentRole}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(request.status, request.paymentStatus)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status Message */}
                  {getStatusMessage(request.status, request.paymentStatus, request.adminNotes)}

                  <Separator />

                  {/* Request Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">{t("submitted")}</p>
                      <p className="font-medium">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">{t("price")}</p>
                      <p className="font-medium">{request.price} TND</p>
                    </div>
                    {request.experience && (
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">{t("experienceLevel")}</p>
                        <p className="font-medium">{request.experience}</p>
                      </div>
                    )}
                    {request.education && (
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">{t("education")}</p>
                        <p className="font-medium text-xs">{request.education}</p>
                      </div>
                    )}
                  </div>

                  {/* Download Button for Completed Resume */}
                  {request.status === "completed" && request.completedResumeUrl && (
                    <>
                      <Separator />
                      <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg space-y-4">
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            {t("yourResumeReady")}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {t("downloadAndApply")}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={request.completedResumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Button className="bg-green-600 hover:bg-green-700">
                              <Download className="w-4 h-4 mr-2" />
                              {t("downloadResume")}
                            </Button>
                          </a>
                          {request.completedMotivationLetterUrl && (
                            <a
                              href={request.completedMotivationLetterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              <Button className="bg-blue-600 hover:bg-blue-700">
                                <Download className="w-4 h-4 mr-2" />
                                {t("downloadMotivationLetter1")}
                              </Button>
                            </a>
                          )}
                          {request.completedMotivationLetter2Url && (
                            <a
                              href={request.completedMotivationLetter2Url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              <Button className="bg-purple-600 hover:bg-purple-700">
                                <Download className="w-4 h-4 mr-2" />
                                {t("downloadMotivationLetter2")}
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Admin Notes (if any) */}
                  {request.adminNotes && request.status !== "rejected" && (
                    <>
                      <Separator />
                      <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                          {t("noteFromTeam")}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {request.adminNotes}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
