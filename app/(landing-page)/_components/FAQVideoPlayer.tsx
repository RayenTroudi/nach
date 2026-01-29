"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";
import { TCourse } from "@/types/models.types";
import { motion, AnimatePresence } from "framer-motion";
import { getProxiedVideoUrl } from "@/lib/utils/video-url-helper";

interface FAQVideoPlayerProps {
  course: TCourse;
  onClose?: () => void;
  autoPlay?: boolean;
}

export default function FAQVideoPlayer({ course, onClose, autoPlay = false }: FAQVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
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

  const toggleFullscreen = () => {
    if (videoRef) {
      if (!document.fullscreenElement) {
        videoRef.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <Card className="overflow-hidden bg-slate-900 border-slate-700 max-w-md mx-auto">
      <div className="relative group">
        {/* Video Element - Reel Mode (9:16 aspect ratio) */}
        <video
          ref={setVideoRef}
          src={getProxiedVideoUrl(course.faqVideo)}
          className="w-full aspect-[9/16] object-cover"
          onEnded={handleVideoEnd}
          onClick={togglePlay}
          autoPlay={autoPlay}
          loop={false}
          crossOrigin="anonymous"
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
            {/* Control Bar */}
            <div className="flex items-center gap-3">
              {/* Play/Pause Button */}
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              {/* Mute Button */}
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>

              {/* Title */}
              <div className="flex-1 text-white font-medium truncate">
                {course.title}
              </div>

              {/* Fullscreen Button */}
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                <Maximize className="w-5 h-5" />
              </Button>

              {/* Close Button (if onClose provided) */}
              {onClose && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Play Button Overlay (when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-brand-red-500 rounded-full p-6 pointer-events-auto cursor-pointer"
              onClick={togglePlay}
            >
              <Play className="w-12 h-12 text-white ml-1" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4 bg-slate-800">
        <h3 className="text-lg font-semibold text-white mb-2">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-sm text-slate-300 line-clamp-2">
            {course.description}
          </p>
        )}
        <div className="mt-3 text-sm">
          <span className="text-slate-400">
            by {course.instructor?.firstName} {course.instructor?.lastName}
          </span>
        </div>
      </div>
    </Card>
  );
}
