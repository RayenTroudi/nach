"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import BookingCalendar from "@/components/shared/BookingCalendar";

interface BookMeetingButtonProps {
  hostId: string;
  hostName?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const BookMeetingButton = ({
  hostId,
  hostName = "instructor",
  variant = "default",
  size = "default",
  className,
}: BookMeetingButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Book a Meeting
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book a Meeting with {hostName}</DialogTitle>
          </DialogHeader>
          <BookingCalendar
            hostId={hostId}
            onBookingComplete={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookMeetingButton;
