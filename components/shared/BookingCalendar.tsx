"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Clock, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import MeetingPayment from "./MeetingPayment";
import { useTranslations } from "next-intl";

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

const BookingCalendar = ({
  hostId,
  onBookingComplete,
  price = 0,
  requiresPayment = false,
}: BookingCalendarProps) => {
  const t = useTranslations('components.bookingCalendar');
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
      const response = await fetch(
        `/api/availability?hostId=${hostId}&date=${selectedDate.toISOString()}`
      );
      const data = await response.json();

      if (response.ok) {
        setSlots(data.slots || []);
      } else {
        scnToast({
          title: t('errorTitle'),
          description: data.error || t('errorDesc'),
          variant: "destructive",
        });
      }
    } catch (error) {
      scnToast({
        title: t('errorTitle'),
        description: t('errorDesc'),
        variant: "destructive",
      });
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
    return date.toLocaleDateString("en-US", {
      weekday: "long",
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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
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
          {/* Calendar Selector */}
          <div>
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">{t('selectDate')}</h3>
        </div>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            }
            className="rounded-md border"
            initialFocus
          />
        </div>
        {selectedDate && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">{t('selectedDate')}</p>
            <p className="text-lg font-semibold">{formatDate(selectedDate)}</p>
          </div>
        )}
      </div>

      {/* Time Slots */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">{t('availableTimeSlots')}</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t('noSlots')}</p>
            <p className="text-sm mt-2">{t('tryDifferentDate')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
            {slots.map((slot, index) => (
              <Button
                key={index}
                variant={selectedSlot === slot ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 flex flex-col items-center",
                  selectedSlot === slot && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedSlot(slot)}
              >
                <span className="font-semibold">{formatTime(slot.start)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(slot.end)}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {selectedSlot && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('notesOptional')}
          </label>
          <Textarea
            placeholder={t('notesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      )}

      {/* Booking Summary & Confirm */}
      {selectedSlot && selectedDate && (
        <div className="p-4 bg-muted rounded-lg space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('youSelected')}</p>
            <p className="font-semibold">
              {formatDate(selectedDate)} at {formatTime(selectedSlot.start)}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('duration')}
            </p>
            {requiresPayment && price > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm text-muted-foreground">{t('price')}</p>
                <p className="text-lg font-bold text-brand-red-500">
                  {price.toFixed(2)} TND (€{(price / 3.3).toFixed(2)})
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleBooking}
            disabled={booking}
            className="w-full"
            size="lg"
          >
            {booking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('booking')}
              </>
            ) : requiresPayment && price > 0 ? (
              t('continueToPayment')
            ) : (
              t('confirmBooking')
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {requiresPayment && price > 0
              ? t('paymentRedirect')
              : t('emailReminder')}
          </p>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default BookingCalendar;
