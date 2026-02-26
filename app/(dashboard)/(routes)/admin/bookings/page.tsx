"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAdminBookings, updateBookingStatus } from "./actions";
import { 
  Check, 
  X, 
  Eye, 
  Calendar,
  Clock, 
  User, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  DollarSign
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

interface Booking {
  _id: string;
  userId: {
    _id: string;
    clerkId: string;
    firstName: string;
    lastName: string;
    email: string;
    picture?: string;
  };
  hostId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  startAt: string;
  endAt: string;
  timezone: string;
  notes?: string;
  price?: number;
  paymentStatus: "pending" | "paid" | "free";
  paymentProof?: string;
  paymentMethod?: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalBookings: number;
  hasMore: boolean;
}

export default function AdminBookingsPage() {
  const t = useTranslations('dashboard.admin.bookings');
  const router = useRouter();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "free">("pending");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    hasMore: false,
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const filteredBookings = statusFilter === "all" 
    ? allBookings 
    : allBookings.filter(booking => booking.paymentStatus === statusFilter);

  const fetchBookings = async (page: number = 1) => {
    try {
      setIsLoading(true);

      const response = await getAdminBookings(page, 100);
      
      if (response.success && response.bookings) {
        setAllBookings(response.bookings);
        setPagination(response.pagination);
      } else {
        scnToast({
          title: t('error'),
          description: response.error || t('errorFetching'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      scnToast({
        title: t('error'),
        description: error.message || t('errorFetching'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.notes || "");
    setIsViewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedBooking) return;

    try {
      setActionLoading(true);
      const response = await updateBookingStatus(
        selectedBooking._id,
        "approve",
        adminNotes
      );

      if (response.success) {
        scnToast({
          title: t('success'),
          description: t('bookingApprovedDesc'),
        });

        // Update local state
        setAllBookings(prev => 
          prev.map(booking => 
            booking._id === selectedBooking._id 
              ? { ...booking, paymentStatus: "paid" as const }
              : booking
          )
        );

        setIsViewDialogOpen(false);
        setSelectedBooking(null);
        setAdminNotes("");
      } else {
        scnToast({
          title: t('error'),
          description: response.error || t('errorApproving'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error approving booking:", error);
      scnToast({
        title: t('error'),
        description: error.message || t('errorApproving'),
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking) return;

    try {
      setActionLoading(true);
      const response = await updateBookingStatus(
        selectedBooking._id,
        "reject",
        adminNotes
      );

      if (response.success) {
        scnToast({
          title: t('success'),
          description: t('bookingRejectedDesc'),
        });

        // Update local state - mark as cancelled
        setAllBookings(prev => 
          prev.map(booking => 
            booking._id === selectedBooking._id 
              ? { ...booking, status: "cancelled" as const }
              : booking
          )
        );

        setIsViewDialogOpen(false);
        setSelectedBooking(null);
        setAdminNotes("");
      } else {
        scnToast({
          title: t('error'),
          description: response.error || t('errorRejecting'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error rejecting booking:", error);
      scnToast({
        title: t('error'),
        description: error.message || t('errorRejecting'),
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "free":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
              {t('all')} ({allBookings.length})
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
              className="rounded-full"
            >
              {t('pending')} ({allBookings.filter(b => b.paymentStatus === "pending").length})
            </Button>
            <Button
              variant={statusFilter === "paid" ? "default" : "outline"}
              onClick={() => setStatusFilter("paid")}
              className="rounded-full"
            >
              {t('approved')} ({allBookings.filter(b => b.paymentStatus === "paid").length})
            </Button>
            <Button
              variant={statusFilter === "free" ? "default" : "outline"}
              onClick={() => setStatusFilter("free")}
              className="rounded-full"
            >
              {t('free')} ({allBookings.filter(b => b.paymentStatus === "free").length})
            </Button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-200 mb-2">
                {t('noBookingsFound')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t('noBookingsDesc')}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* User Info */}
                      <div className="flex-shrink-0">
                        {booking.userId.picture ? (
                          <Image
                            src={booking.userId.picture}
                            alt={booking.userId.firstName}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-brand-red-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-200">
                            {booking.userId.firstName} {booking.userId.lastName}
                          </h3>
                          <Badge className={getStatusColor(booking.paymentStatus)}>
                            {booking.paymentStatus}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(booking.startAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatTime(booking.startAt)} - {formatTime(booking.endAt)} ({booking.timezone})
                            </span>
                          </div>
                          {booking.price && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>{booking.price} TND</span>
                            </div>
                          )}
                          {booking.paymentMethod && (
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              <span className="capitalize">{booking.paymentMethod.replace('_', ' ')}</span>
                            </div>
                          )}
                        </div>

                        {booking.notes && (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 italic">
                            &quot;{booking.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBooking(booking)}
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('page')} {pagination.currentPage} {t('of')} {pagination.totalPages} 
                ({pagination.totalBookings} {t('totalBookings')})
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchBookings(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchBookings(pagination.currentPage + 1)}
                  disabled={!pagination.hasMore}
                >
                  {t('next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('detailsTitle')}</DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6">
                {/* User Info */}
                <div>
                  <h3 className="font-semibold mb-3">{t('studentInfo')}</h3>
                  <div className="flex items-center gap-3 mb-2">
                    {selectedBooking.userId.picture ? (
                      <Image
                        src={selectedBooking.userId.picture}
                        alt={selectedBooking.userId.firstName}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-brand-red-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">
                        {selectedBooking.userId.firstName} {selectedBooking.userId.lastName}
                      </p>
                      <p className="text-sm text-slate-600">{selectedBooking.userId.email}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Meeting Details */}
                <div>
                  <h3 className="font-semibold mb-3">{t('meetingDetails')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('date')}:</span>
                      <span className="font-medium">{formatDate(selectedBooking.startAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('time')}:</span>
                      <span className="font-medium">
                        {formatTime(selectedBooking.startAt)} - {formatTime(selectedBooking.endAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('timezone')}:</span>
                      <span className="font-medium">{selectedBooking.timezone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('status')}:</span>
                      <Badge className={getStatusColor(selectedBooking.paymentStatus)}>
                        {selectedBooking.paymentStatus}
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
                      <span className="font-medium">{selectedBooking.price || 0} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('paymentMethod')}:</span>
                      <span className="font-medium capitalize">
                        {selectedBooking.paymentMethod?.replace('_', ' ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Proof */}
                {selectedBooking.paymentProof && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">{t('paymentProof')}</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Image
                          src={selectedBooking.paymentProof}
                          alt="Payment proof"
                          width={600}
                          height={400}
                          className="w-full h-auto"
                        />
                      </div>
                      <a
                        href={selectedBooking.paymentProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                      >
                        {t('viewFullSize')} →
                      </a>
                    </div>
                  </>
                )}

                {/* Notes */}
                {selectedBooking.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">{t('studentNotes')}</h3>
                      <p className="text-sm text-slate-600 bg-slate-50 dark:bg-slate-900 p-3 rounded">
                        {selectedBooking.notes}
                      </p>
                    </div>
                  </>
                )}

                {/* Admin Notes */}
                <div>
                  <h3 className="font-semibold mb-2">{t('adminNotes')}</h3>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={t('adminNotesPlaceholder')}
                    rows={3}
                  />
                </div>

                {/* Actions */}
                {selectedBooking.paymentStatus === "pending" && (
                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsViewDialogOpen(false)}
                      disabled={actionLoading}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('reject')}
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading ? (
                        <Spinner />
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          {t('approveAndSendLink')}
                        </>
                      )}
                    </Button>
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
