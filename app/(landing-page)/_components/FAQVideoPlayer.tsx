"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { TCourse } from "@/types/models.types";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "@/components/shared/Spinner";
import MuxVideoPlayer, { getMuxThumbnail } from "@/components/shared/MuxVideoPlayer";

interface FAQVideoPlayerProps {
  course: TCourse;
  courses?: TCourse[];
  onClose?: () => void;
  autoPlay?: boolean;
  onCourseChange?: (course: TCourse) => void;
}

/**
 * FAQVideoPlayer - Mux-powered Instagram-style video player
 * Updated to use Mux streaming with adaptive bitrate
 * Maintains custom navigation and controls overlay
 */
export default function FAQVideoPlayer({ 
  course, 
  courses = [], 
  onClose, 
  autoPlay = false,
  onCourseChange 
}: FAQVideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find current course index
  useEffect(() => {
    const index = courses.findIndex(c => c._id === course._id);
    if (index !== -1) setCurrentIndex(index);
    setVideoError(false);
    setIsLoading(true);
  }, [course, courses]);

  const handlePrevious = () => {
    if (currentIndex > 0 && courses[currentIndex - 1]) {
      onCourseChange?.(courses[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < courses.length - 1 && courses[currentIndex + 1]) {
      onCourseChange?.(courses[currentIndex + 1]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, courses.length]);

  // Check if video has Mux data
  const hasMuxVideo = course.faqVideoMuxData?.playbackId;
  const playbackId = course.faqVideoMuxData?.playbackId || "";

  // Generate thumbnail
  const posterUrl = course.thumbnail || (playbackId ? getMuxThumbnail(playbackId) : "");

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden"
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
            {videoError || !hasMuxVideo ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🎥</div>
                  <h3 className="text-white text-xl font-semibold mb-2">
                    Video Not Available
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {!hasMuxVideo 
                      ? "This video is still processing. Please check back soon." 
                      : "This video is currently unavailable or has been removed."}
                  </p>
                  {courses.length > 1 && (
                    <Button
                      onClick={() => {
                        if (currentIndex < courses.length - 1) handleNext();
                        else if (currentIndex > 0) handlePrevious();
                        else onClose?.();
                      }}
                      className="mt-4"
                    >
                      {currentIndex < courses.length - 1 
                        ? 'Next Video' 
                        : currentIndex > 0 
                        ? 'Previous Video' 
                        : 'Close'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>                
                {/* Mux Video Player */}
                <div className="w-full h-full">
                  <MuxVideoPlayer
                    playbackId={playbackId}
                    title={course.title}
                    poster={posterUrl}
                    autoPlay={autoPlay}
                    muted={false}
                    aspectRatio="16:9"
                    metadata={{
                      video_id: course._id?.toString(),
                      video_title: course.title,
                      video_type: "faq",
                    }}
                    onLoadedData={() => setIsLoading(false)}
                    onError={() => {
                      setVideoError(true);
                      setIsLoading(false);
                    }}
                    showControls={true}
                    minimalHover={false}
                    className="h-full"
                  />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Close Button - Top Right */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 z-50 h-10 w-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full"
          onClick={onClose}
          aria-label="Close video player"
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-full transition-all hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                aria-label="Previous video"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}

            {/* Next */}
            {currentIndex < courses.length - 1 && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-full transition-all hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next video"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}
          </>
        )}

        {/* Video Counter */}
        {courses.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
            {currentIndex + 1} / {courses.length}
          </div>
        )}
      </div>
    </div>
  );
}
