"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, User, Mail, Phone, Briefcase, Download, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import LeftSideBar from "@/components/shared/LeftSideBar";

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
  updatedAt: string;
}

export default function AdminResumeRequestsPage() {
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ResumeRequest | null>(null);
  const [updating, setUpdating] = useState(false);

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

  const updateStatus = async (requestId: string, status: string, paymentStatus?: string, adminNotes?: string, completedResumeUrl?: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/resume-request/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus, adminNotes, completedResumeUrl }),
      });

      if (response.ok) {
        toast.success("Resume request updated successfully");
        fetchRequests();
        setSelectedRequest(null);
      } else {
        toast.error("Failed to update resume request");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Payment Pending
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Payment Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Payment Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <LeftSideBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <LeftSideBar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Resume Requests</h1>
                <p className="text-slate-600 dark:text-slate-400">Manage customer resume creation requests</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="border-2 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-slate-950 dark:text-white">
                    {requests.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Requests</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {requests.filter((r) => r.status === "pending").length}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Pending</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {requests.filter((r) => r.status === "in_progress").length}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">In Progress</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {requests.filter((r) => r.status === "completed").length}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {["all", "pending", "in_progress", "completed", "rejected"].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={filter === status ? "bg-brand-red-500 hover:bg-brand-red-600" : ""}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>

          {/* Requests List */}
          <div className="grid gap-4">
            {filteredRequests.length === 0 ? (
              <Card className="border-2 border-slate-200 dark:border-slate-800">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No resume requests found</p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card
                  key={request._id}
                  className="border-2 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{request.name}</CardTitle>
                          {getStatusBadge(request.status)}
                          {getPaymentStatusBadge(request.paymentStatus)}
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {request.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {request.phone}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          Submitted: {formatDate(request.createdAt)} • Price: {request.price} TND
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(selectedRequest?._id === request._id ? null : request)}
                      >
                        {selectedRequest?._id === request._id ? "Hide Details" : "View Details"}
                      </Button>
                    </div>
                  </CardHeader>

                  {selectedRequest?._id === request._id && (
                    <CardContent className="p-6 space-y-6">
                      {/* Professional Details */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {request.currentRole && (
                          <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Role</label>
                            <p className="text-slate-950 dark:text-white">{request.currentRole}</p>
                          </div>
                        )}
                        {request.targetRole && (
                          <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Role</label>
                            <p className="text-slate-950 dark:text-white">{request.targetRole}</p>
                          </div>
                        )}
                      </div>

                      {request.experience && (
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Experience</label>
                          <p className="text-slate-950 dark:text-white whitespace-pre-wrap">{request.experience}</p>
                        </div>
                      )}

                      {request.education && (
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Education</label>
                          <p className="text-slate-950 dark:text-white whitespace-pre-wrap">{request.education}</p>
                        </div>
                      )}

                      {request.skills && (
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Skills</label>
                          <p className="text-slate-950 dark:text-white whitespace-pre-wrap">{request.skills}</p>
                        </div>
                      )}

                      {request.additionalInfo && (
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Additional Information</label>
                          <p className="text-slate-950 dark:text-white whitespace-pre-wrap">{request.additionalInfo}</p>
                        </div>
                      )}

                      {request.documentUrl && (
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Uploaded Document</label>
                          <a
                            href={request.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-brand-red-500 hover:text-brand-red-600"
                          >
                            <Download className="w-4 h-4" />
                            Download Document
                          </a>
                        </div>
                      )}

                      {/* Payment Proof */}
                      {request.paymentProofUrl && (
                        <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-6">
                          <h4 className="font-semibold text-lg mb-4">Payment Verification</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Payment Proof</label>
                              <a
                                href={request.paymentProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-brand-red-500 hover:text-brand-red-600"
                              >
                                <Download className="w-4 h-4" />
                                View Payment Proof
                              </a>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Payment Status</label>
                              <Select
                                value={request.paymentStatus}
                                onValueChange={(value) => updateStatus(request._id, request.status, value)}
                                disabled={updating}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending Verification</SelectItem>
                                  <SelectItem value="paid">Payment Verified</SelectItem>
                                  <SelectItem value="rejected">Payment Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Admin Actions */}
                      <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-6 space-y-4">
                        <h3 className="font-semibold text-lg">Admin Actions</h3>
                        
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Update Status</label>
                          <Select
                            value={request.status}
                            onValueChange={(value) => updateStatus(request._id, value)}
                            disabled={updating}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {request.adminNotes && (
                          <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Admin Notes</label>
                            <p className="text-slate-600 dark:text-slate-400">{request.adminNotes}</p>
                          </div>
                        )}

                        {request.completedResumeUrl && (
                          <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Completed Resume</label>
                            <a
                              href={request.completedResumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
                            >
                              <Download className="w-4 h-4" />
                              Download Completed Resume
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
