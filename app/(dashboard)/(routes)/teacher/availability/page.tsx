"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Calendar, Clock, Plus, Trash2, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/shared";
import { LeftSideBar } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";

interface AvailabilitySlot {
  _id: string;
  date: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const AvailabilityPage = () => {
  const t = useTranslations('teacher.availability');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { userId, isLoaded } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString(locale, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Format time with localized AM/PM
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const isPM = hour >= 12;
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinutes = minutes ? minutes.padStart(2, '0') : '00';
    return `${displayHour}:${displayMinutes} ${isPM ? t('pm') : t('am')}`;
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch("/api/teacher/availability");
        if (res.ok) {
          const data = await res.json();
          // Ensure dates are properly formatted
          const formattedSlots = (data.availability || []).map((slot: any) => ({
            ...slot,
            date: slot.date || new Date().toISOString()
          }));
          setSlots(formattedSlots);
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && userId) {
      fetchAvailability();
    }
  }, [userId, isLoaded]);

  const handleAddSlot = async () => {
    try {
      const res = await fetch("/api/teacher/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          startTime,
          endTime,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSlots([...slots, data.availability]);
        toast.success(t('availabilityAdded'));
      } else {
        const error = await res.json();
        toast.error(error.error || t('failedToAdd'));
      }
    } catch (error) {
      console.error("Error adding availability:", error);
      toast.error(t('failedToAdd'));
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const res = await fetch(`/api/teacher/availability?id=${slotId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSlots(slots.filter((slot) => slot._id !== slotId));
        toast.success(t('availabilityRemoved'));
      } else {
        toast.error(t('failedToRemove'));
      }
    } catch (error) {
      console.error("Error deleting availability:", error);
      toast.error(t('failedToRemove'));
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  const groupedSlots = slots.reduce((acc, slot) => {
    // Normalize date to YYYY-MM-DD format for grouping
    const date = new Date(slot.date);
    const dateKey = date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  return (
    <div className="flex gap-6 min-h-screen bg-slate-50 dark:bg-slate-950">
      <LeftSideBar />
      
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-brand-red-500/10 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-brand-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{t('title')}</h1>
              <p className="text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Add Availability Form */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 mb-6 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-brand-red-500" />
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{t('addAvailability')}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('date')}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={getMinDate()}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-950 dark:text-white focus:border-brand-red-500 focus:ring-2 focus:ring-brand-red-500/20 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('startTime')}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-950 dark:text-white focus:border-brand-red-500 focus:ring-2 focus:ring-brand-red-500/20 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('endTime')}
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-950 dark:text-white focus:border-brand-red-500 focus:ring-2 focus:ring-brand-red-500/20 focus:outline-none transition-all"
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleAddSlot} 
                  className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-white font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addSlot')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Availability */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-red-500" />
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{t('currentAvailability')}</h2>
              </div>
              {Object.keys(groupedSlots).length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {Object.values(groupedSlots).flat().length} {Object.values(groupedSlots).flat().length === 1 ? t('slot') : t('slots')}
                </Badge>
              )}
            </div>

            {Object.keys(groupedSlots).length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-2">
                  {t('noAvailabilityTitle')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {t('noAvailability')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedSlots)
                  .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                  .map(([dateKey, dateSlots]) => {
                    return (
                      <div key={dateKey} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-base text-slate-950 dark:text-white">
                            {formatDate(dateKey)}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {dateSlots.length} {dateSlots.length === 1 ? t('slot') : t('slots')}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {dateSlots.map((slot) => (
                            <div
                              key={slot._id}
                              className="group flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-red-300 dark:hover:border-brand-red-700 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <div className="bg-brand-red-500/10 p-1.5 rounded">
                                  <Clock className="w-3.5 h-3.5 text-brand-red-500" />
                                </div>
                                <span className="text-sm font-medium text-slate-950 dark:text-white">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSlot(slot._id)}
                                className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvailabilityPage;
