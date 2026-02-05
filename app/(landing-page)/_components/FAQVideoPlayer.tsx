"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, X, ChevronLeft, ChevronRight } from "lucide-react";
import { TCourse } from "@/types/models.types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface FAQVideoPlayerProps {
  course: TCourse;
  courses?: TCourse[];
  onClose?: () => void;
  autoPlay?: boolean;
  onCourseChange?: (course: TCourse) => void;
}

export default function FAQVideoPlayer({ 
  course, 
  courses = [], 
  onClose, 
  autoPlay = false,
  onCourseChange 
}: FAQVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find current course index
  useEffect(() => {
    const index = courses.findIndex(c => c._id === course._id);
    if (index !== -1) setCurrentIndex(index);
    setVideoError(false); // Reset error when course changes
  }, [course, courses]);

  const togglePlay = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play().catch(err => console.error("Playback error:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef) {
      videoRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnd = () => {
    // Auto advance to next video
    if (currentIndex < courses.length - 1) {
      handleNext();
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0 && courses[currentIndex - 1]) {
      setIsPlaying(false);
      onCourseChange?.(courses[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < courses.length - 1 && courses[currentIndex + 1]) {
      setIsPlaying(false);
      onCourseChange?.(courses[currentIndex + 1]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, courses.length]);

  // Auto-hide info after 3 seconds
  useEffect(() => {
    if (showInfo && isPlaying) {
      const timer = setTimeout(() => setShowInfo(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showInfo, isPlaying]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden"
      onClick={onClose}
    >
      {/* Main Video - Instagram Feed Style */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={course._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center"
          >
            {videoError || !course.faqVideo ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🎥</div>
                  <h3 className="text-white text-xl font-semibold mb-2">Video Not Available</h3>
                  <p className="text-slate-400">This video is currently unavailable or has been removed.</p>
                  {courses.length > 1 && (
                    <Button
                      onClick={() => {
                        if (currentIndex < courses.length - 1) handleNext();
                        else if (currentIndex > 0) handlePrevious();
                        else onClose?.();
                      }}
                      className="mt-4"
                    >
                      {currentIndex < courses.length - 1 ? 'Next Video' : currentIndex > 0 ? 'Previous Video' : 'Close'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <video
                ref={setVideoRef}
                src={course.faqVideo}
                className="w-full h-full object-contain"
                onEnded={handleVideoEnd}
                onError={(e) => {
                  console.error("Video loading error:", e);
                  setVideoError(true);
                  setIsPlaying(false);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                autoPlay={autoPlay}
                loop={false}
                playsInline
                preload="metadata"
                poster={course.thumbnail}
                onLoadedData={() => {
                  if (autoPlay && videoRef) {
                    videoRef.play().catch(err => {
                      console.error("Auto-play failed:", err);
                      setVideoError(true);
                    });
                  }
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Close Button - Top Right */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 z-50 h-10 w-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Navigation Arrows */}
        {courses.length > 1 && (
          <>
            {/* Previous */}
            {currentIndex > 0 && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}

            {/* Next */}
            {currentIndex < courses.length - 1 && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}
          </>
        )}

        {/* Play Button Overlay (when paused) */}
        {!isPlaying && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-30"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            <div className="bg-white/20 backdrop-blur-md rounded-full p-6 cursor-pointer hover:bg-white/30 transition-all">
              <Play className="w-16 h-16 text-white ml-1" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
