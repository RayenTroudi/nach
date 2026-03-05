"use client";

import { useState, useEffect, useRef } from "react";
import { X, RotateCw, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

// Define the PDFViewer props interface
interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  pageNumber: number;
  scale: number;
  rotation: number;
  onLoadSuccess: (numPages: number) => void;
}

// Dynamically import PDF components with no SSR
const PDFViewer = dynamic<PDFViewerProps>(
  // @ts-ignore - TypeScript caching issue with dynamic imports
  () => import("./PDFViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px] md:min-h-[600px] w-full md:w-[800px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">Loading PDF viewer...</p>
        </div>
      </div>
    ),
  }
);

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  title: string;
}

export default function DocumentViewer({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  title,
}: DocumentViewerProps) {
  const t = useTranslations("documentViewer");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const fileExtension = fileName.split(".").pop()?.toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
    fileExtension || ""
  );
  const isPDF = fileExtension === "pdf";
  const isViewable = isImage || isPDF;

  // Reset state when document changes
  useEffect(() => {
    if (isOpen) {
      setPageNumber(1);
      setRotation(0);
      
      // Dynamically load print-js CSS on client side only
      if (typeof window !== 'undefined') {
        const link = document.getElementById('print-js-css');
        if (!link) {
          const cssLink = document.createElement('link');
          cssLink.id = 'print-js-css';
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://printjs-4de6.kxcdn.com/print.min.css';
          document.head.appendChild(cssLink);
        }
      }
    }
  }, [isOpen, fileUrl]);

  const handlePreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  
  const handleReset = () => {
    setRotation(0);
  };

  const handlePrint = async () => {
    try {
      // Dynamically import print-js only when needed (client-side only)
      const printJS = (await import('print-js')).default;
      
      if (isPDF) {
        // For PDFs, use printJS library
        printJS({
          printable: fileUrl,
          type: 'pdf',
          showModal: true,
          modalMessage: 'Preparing document for printing...',
          onError: (error: any) => {
            console.error('Print error:', error);
          }
        });
      } else if (isImage) {
        // For images, use printJS library
        printJS({
          printable: fileUrl,
          type: 'image',
          showModal: true,
          modalMessage: 'Preparing image for printing...',
          imageStyle: 'width:100%;',
          onError: (error: any) => {
            console.error('Print error:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error loading print-js:', error);
    }
  };

  // Handle touch events for swipe navigation on mobile
  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    touchEndY.current = e.changedTouches[0].clientY;
    
    const swipeDistance = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50; // Minimum pixels to trigger swipe

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe up - next page
        handleNextPage();
      } else {
        // Swipe down - previous page
        handlePreviousPage();
      }
    }
  };

  // Add touch listeners on mobile devices
  useEffect(() => {
    if (!isOpen || !isPDF) return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const dialogElement = document.querySelector('[role="dialog"]');
    if (!dialogElement) return;

    dialogElement.addEventListener('touchstart', handleTouchStart as any);
    dialogElement.addEventListener('touchend', handleTouchEnd as any);

    return () => {
      dialogElement.removeEventListener('touchstart', handleTouchStart as any);
      dialogElement.removeEventListener('touchend', handleTouchEnd as any);
    };
  }, [isOpen, isPDF, numPages]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full sm:w-[95vw] sm:h-[95vh] lg:w-[90vw] lg:h-[92vh] max-w-[1600px] sm:rounded-lg p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 border-b bg-slate-50 dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-sm sm:text-base md:text-lg font-semibold truncate">{title}</DialogTitle>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                {fileName}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
              {isPDF && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrint}
                    title={t("print")}
                    className="text-brand-red-500 hover:text-brand-red-600 h-8 w-8 p-0 md:w-auto md:px-3"
                  >
                    <Printer className="w-4 h-4 md:ltr:mr-1 md:rtl:ml-1" />
                    <span className="hidden md:inline">{t("print")}</span>
                  </Button>
                </>
              )}
              {isImage && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRotate}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 md:w-auto md:px-3"
                  >
                    <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleReset}
                    className="hidden md:inline-flex"
                  >
                    {t("reset")}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrint}
                    title={t("print")}
                    className="text-brand-red-500 hover:text-brand-red-600 h-8 w-8 p-0 md:w-auto md:px-3"
                  >
                    <Printer className="w-4 h-4 md:ltr:mr-1 md:rtl:ml-1" />
                    <span className="hidden md:inline">{t("print")}</span>
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 pdf-viewer-container">
          {isViewable ? (
            <div className="flex items-center justify-center min-h-full w-full p-1 sm:p-2 md:p-4 lg:p-6">
              {isPDF ? (
                <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-lg overflow-hidden w-full max-w-[1400px] flex items-center justify-center">
                  <PDFViewer
                    fileUrl={fileUrl}
                    fileName={fileName}
                    pageNumber={pageNumber}
                    scale={1.0}
                    rotation={rotation}
                    onLoadSuccess={setNumPages}
                  />
                </div>
              ) : isImage ? (
                <div className="flex items-center justify-center w-full">
                  <div
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: "transform 0.2s ease",
                    }}
                    className="relative max-w-full"
                  >
                    <Image
                      src={fileUrl}
                      alt={fileName}
                      width={800}
                      height={600}
                      className="max-w-full h-auto object-contain shadow-2xl rounded-lg"
                      unoptimized
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full px-2 sm:px-4">
              <div className="text-center">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-50 mb-1 sm:mb-2">
                  {t("cannotPreview")}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
                  {t("cannotPreviewDescription")}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
