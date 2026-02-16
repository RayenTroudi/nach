"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Clock } from "lucide-react";
import Spinner from "./Spinner";
import { cn } from "@/lib/utils";
import MeetingPayment from "./MeetingPayment";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookingCalendarProps {
  hostId: string;
  onBookingComplete: () => void;
  price?: number;
  requiresPayment?: boolean;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface AvailabilitySlot {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const BookingCalendar = ({
  hostId,
  onBookingComplete,
  price = 0,
  requiresPayment = false,
}: BookingCalendarProps) => {
  const t = useTranslations('components.bookingCalendar');
  const tAvailability = useTranslations('teacher.availability');
  const locale = useLocale();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const { scnToast } = useToast();

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchSlots = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    try {
      // Fetch teacher's availability
      const response = await fetch(`/api/teacher/availability`);
      const data = await response.json();

      if (response.ok && data.availability) {
        // Filter slots for the selected day of week
        const dayOfWeek = selectedDate.getDay();
        const daySlots = data.availability.filter(
          (slot: AvailabilitySlot) => slot.dayOfWeek === dayOfWeek && slot.isActive
        );

        // Transform to time slots for the selected date
        const transformedSlots: TimeSlot[] = daySlots.map((slot: AvailabilitySlot) => {
          const [startHour, startMinute] = slot.startTime.split(':').map(Number);
          const [endHour, endMinute] = slot.endTime.split(':').map(Number);

          const start = new Date(selectedDate);
          start.setHours(startHour, startMinute, 0, 0);

          const end = new Date(selectedDate);
          end.setHours(endHour, endMinute, 0, 0);

          return {
            start: start.toISOString(),
            end: end.toISOString(),
            available: true,
          };
        });

        setSlots(transformedSlots);
      } else {
        setSlots([]);
      }
    } catch (error) {
      scnToast({
        title: t('errorTitle'),
        description: t('errorDesc'),
        variant: "destructive",
      });
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;

    setBooking(true);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId,
          startAt: selectedSlot.start,
          endAt: selectedSlot.end,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notes,
          price,
          paymentStatus: requiresPayment ? "pending" : "free",
          paymentMethod: requiresPayment ? undefined : "free",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (requiresPayment && price > 0) {
          // Show payment screen
          setBookingId(data._id);
          setShowPayment(true);
        } else {
          // Free booking - show success
          scnToast({
            title: t('successTitle'),
            description: t('successDesc'),
          });
          onBookingComplete();
        }
      } else {
        scnToast({
          title: t('errorTitle'),
          description: data.error || t('errorBookingDesc'),
          variant: "destructive",
        });
      }
    } catch (error) {
      scnToast({
        title: t('errorTitle'),
        description: t('errorBookingDesc'),
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale === 'de' ? 'de-DE' : 'en-US', {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const hour12 = hours % 12 || 12;
    const minuteStr = minutes.toString().padStart(2, '0');
    
    // Use localized AM/PM text
    const amPm = hours >= 12 ? tAvailability('pm') : tAvailability('am');
    
    return `${hour12}:${minuteStr} ${amPm}`;
  };



  return (
    <div className="space-y-6">
      {showPayment && bookingId ? (
        <MeetingPayment
          bookingId={bookingId}
          amount={price}
          onSuccess={onBookingComplete}
        />
      ) : (
        <>
          {/* Time Slots */}
          <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-red-500" />
                  <CardTitle className="text-lg">{t('availableTimeSlots')}</CardTitle>
                </div>
                {slots.length > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {slots.length} {slots.length === 1 ? t('slot') : t('slots')}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size={32} className="text-brand-red-500" />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Clock className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-lg font-medium mb-2">{t('noSlots')}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('tryDifferentDate')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                  {slots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedSlot === slot ? "default" : "outline"}
                      className={cn(
                        "h-auto py-4 flex flex-col items-center gap-1 transition-all",
                        selectedSlot === slot 
                          ? "ring-2 ring-brand-red-500 bg-brand-red-500 hover:bg-brand-red-600 shadow-md scale-105" 
                          : "hover:scale-102 hover:shadow hover:border-brand-red-300 dark:hover:border-brand-red-700"
                      )}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <span className="font-semibold text-base">{formatTime(slot.start)}</span>
                      <span className="text-xs opacity-70">
                        {formatTime(slot.end)}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {selectedSlot && (
            <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{t('notesOptional')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={t('notesPlaceholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          )}

          {/* Booking Summary & Confirm */}
          {selectedSlot && selectedDate && (
            <Card className="shadow-lg border-2 border-brand-red-300 dark:border-brand-red-700 bg-gradient-to-br from-brand-red-50 to-red-100 dark:from-slate-900 dark:to-slate-800">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('youSelected')}</p>
                    <p className="font-semibold text-lg mb-1 text-slate-900 dark:text-slate-50">
                      {formatDate(selectedDate)}
                    </p>
                    <p className="text-brand-red-600 dark:text-brand-red-400 font-medium">
                      {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {t('duration')}
                    </p>
                    {requiresPayment && price > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('price')}</p>
                        <p className="text-xl font-bold text-brand-red-600 dark:text-brand-red-500">
                          {price} DT
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={booking}
                    className="w-full h-12 text-lg font-semibold bg-brand-red-500 hover:bg-brand-red-600 shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    {booking ? (
                      <>
                        <Spinner size={18} className="mr-2" />
                        {t('booking')}
                      </>
                    ) : requiresPayment && price > 0 ? (
                      t('continueToPayment')
                    ) : (
                      t('confirmBooking')
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-600 dark:text-slate-400 px-4">
                    {requiresPayment && price > 0
                      ? t('paymentRedirect')
                      : t('emailReminder')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default BookingCalendar;
