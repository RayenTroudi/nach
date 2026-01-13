"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle2, XCircle, Loader2, Download, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ResumeRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentRole?: string;
  targetRole?: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  paymentStatus: "pending" | "paid" | "rejected";
  paymentProofUrl?: string;
  adminNotes?: string;
  completedResumeUrl?: string;
  completedMotivationLetterUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyResumeRequestsPage() {
  const { user } = useUser();
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/my-resume-requests");
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.resumeRequests || []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      toast.error("Failed to fetch resume requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Being Created
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ready for Download
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-950 dark:text-white">My Resume Requests</h1>
                <p className="text-slate-600 dark:text-slate-400">Track your professional resume requests</p>
              </div>
            </div>
            <Link href="/contact/resume">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </Link>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card className="border-2 border-slate-200 dark:border-slate-800">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-2">
                No Resume Requests Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Get started with a professional German-style CV crafted by experts
              </p>
              <Link href="/contact/resume">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Request Your First Resume
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card
                key={request._id}
                className="border-2 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all"
              >
                <CardHeader className="bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {request.targetRole || "Resume Request"}
                        </CardTitle>
                        {getStatusBadge(request.status)}
                      </div>
                      {request.currentRole && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Current: {request.currentRole}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Submitted: {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Payment Status Banner */}
                  {request.paymentStatus === "pending" && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        💳 Payment Processing
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Your payment proof is being verified by our team. This usually takes 24-48 hours.
                      </p>
                    </div>
                  )}

                  {request.paymentStatus === "paid" && request.status === "pending" && (
                    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                        ✅ Payment Approved - Resume Creation Started
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Your payment has been verified! Our experts will start working on your resume shortly.
                      </p>
                    </div>
                  )}

                  {request.paymentStatus === "rejected" && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        ❌ Payment Issue
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        There was an issue with your payment proof. Please contact support or submit a new request.
                      </p>
                    </div>
                  )}

                  {/* Resume Status Banner */}
                  {request.status === "pending" && request.paymentStatus === "paid" && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⏳ Your resume request is queued. We&apos;ll start working on it soon!
                      </p>
                    </div>
                  )}

                  {request.status === "in_progress" && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        🔨 Your Resume is Being Created!
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Our experts are currently crafting your professional German-style resume. Expected completion: 1-2 business days.
                      </p>
                    </div>
                  )}

                  {request.status === "completed" && request.completedResumeUrl && (
                    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                        ✅ Your professional documents are ready! Download them below.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href={request.completedResumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="bg-green-600 hover:bg-green-700 text-white">
                            <Download className="w-4 h-4 mr-2" />
                            Download Resume
                          </Button>
                        </a>
                        {request.completedMotivationLetterUrl && (
                          <a
                            href={request.completedMotivationLetterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Download className="w-4 h-4 mr-2" />
                              Download Motivation Letter
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {request.status === "rejected" && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        ❌ This request was not approved. {request.adminNotes && `Reason: ${request.adminNotes}`}
                      </p>
                    </div>
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
