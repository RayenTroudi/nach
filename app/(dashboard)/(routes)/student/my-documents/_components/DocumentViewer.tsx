"use client";

import { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Printer } from "lucide-react";
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
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);

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
      setScale(1.2);
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

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  
  const handleReset = () => {
    setScale(1.2);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl h-[90vh] md:h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-3 md:px-6 py-3 md:py-4 border-b bg-slate-50 dark:bg-slate-900 flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0 md:justify-between">
            <div className="hidden md:block md:flex-1"></div>
            <div className="flex-1 text-center min-w-0 order-2 md:order-none">
              <DialogTitle className="text-base md:text-lg font-semibold truncate">{title}</DialogTitle>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 truncate">
                {fileName}
              </p>
            </div>
            <div className="flex-1 flex items-center gap-1 md:gap-2 justify-end order-1 md:order-none">
              {isPDF && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                    title={t("zoomOut")}
                    className="h-8 w-8 p-0 md:w-auto md:px-3"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs md:text-sm font-medium min-w-[3rem] md:min-w-[4rem] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={scale >= 3.0}
                    title={t("zoomIn")}
                    className="h-8 w-8 p-0 md:w-auto md:px-3"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleReset}
                    title={t("reset")}
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
              {isImage && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                    className="h-8 w-8 p-0 md:w-auto md:px-3"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs md:text-sm font-medium min-w-[3rem] md:min-w-[4rem] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={scale >= 3.0}
                    className="h-8 w-8 p-0 md:w-auto md:px-3"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRotate}
                    className="h-8 w-8 p-0 md:w-auto md:px-3"
                  >
                    <RotateCw className="w-4 h-4" />
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
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isPDF && numPages > 0 && (
          <div className="px-3 md:px-6 py-2 md:py-3 border-b bg-white dark:bg-slate-900 flex items-center justify-between flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={pageNumber <= 1}
              className="h-8 px-2 md:px-4"
            >
              <ChevronLeft className="w-4 h-4 md:ltr:mr-1 md:rtl:ml-1 rtl:rotate-180" />
              <span className="hidden md:inline">{t("previous")}</span>
            </Button>
            <span className="text-xs md:text-sm font-medium px-2">
              {t("page")} {pageNumber} {t("of")} {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pageNumber >= numPages}
              className="h-8 px-2 md:px-4"
            >
              <span className="hidden md:inline">{t("next")}</span>
              <ChevronRight className="w-4 h-4 md:ltr:ml-1 md:rtl:mr-1 rtl:rotate-180" />
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 pdf-viewer-container">
          {isViewable ? (
            <div className="flex items-center justify-center min-h-full p-2 md:p-6">
              {isPDF ? (
                <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-lg overflow-hidden w-full md:w-auto">
                  <PDFViewer
                    fileUrl={fileUrl}
                    fileName={fileName}
                    pageNumber={pageNumber}
                    scale={scale}
                    rotation={rotation}
                    onLoadSuccess={setNumPages}
                  />
                </div>
              ) : isImage ? (
                <div className="flex items-center justify-center w-full">
                  <div
                    style={{
                      transform: `scale(${scale}) rotate(${rotation}deg)`,
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
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center">
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {t("cannotPreview")}
                </h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
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
