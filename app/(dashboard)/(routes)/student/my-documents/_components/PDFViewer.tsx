"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  pageNumber: number;
  scale: number;
  rotation: number;
  onLoadSuccess: (numPages: number) => void;
}

export default function PDFViewer({
  fileUrl,
  fileName,
  pageNumber,
  scale,
  rotation,
  onLoadSuccess,
}: PDFViewerProps) {
  const t = useTranslations("documentViewer");
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(850);
  const [isMobile, setIsMobile] = useState(false);
  const [pageWidth, setPageWidth] = useState(600);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 768;

      setIsMobile(mobile);

      if (mobile) {
        setHeight(Math.min(vh * 0.75, vh - 180));
        setPageWidth(vw - 32);
      } else if (vw < 1024) {
        setHeight(Math.min(vh * 0.7, 700));
        setPageWidth(Math.min(vw * 0.85, 700));
      } else {
        setHeight(Math.min(vh * 0.8, 900));
        setPageWidth(Math.min(vw * 0.75, 900));
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleIframeLoad = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setLoading(false), 800);
  };

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    onLoadSuccess(numPages);
    setLoading(false);
  };

  const spinner = (
    <div
      className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10"
      style={{ minHeight: `${height}px` }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-brand-red-500 mx-auto mb-2 sm:mb-3" />
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
          {t("loadingPDF")}
        </p>
      </div>
    </div>
  );

  // Mobile: use react-pdf to render the PDF directly (iframes don't show PDFs on mobile browsers)
  if (isMobile) {
    return (
      <div
        className="relative flex items-center justify-center w-full overflow-auto"
        style={{ minHeight: `${height}px` }}
      >
        {loading && spinner}
        <Document
          file={fileUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={() => setLoading(false)}
          loading={null}
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            rotate={rotation}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    );
  }

  // Desktop: use native iframe PDF rendering
  const src = `${fileUrl}#page=${pageNumber}&toolbar=0&navpanes=0`;

  return (
    <div className="relative flex items-center justify-center w-full">
      {loading && spinner}
      <iframe
        key={`${fileUrl}-${pageNumber}`}
        src={src}
        title={fileName}
        className="border-0 rounded-lg"
        style={{
          width: "100%",
          height: `${height}px`,
          minHeight: "300px",
          maxHeight: "90vh",
          display: "block",
        }}
        onLoad={handleIframeLoad}
        allow="fullscreen"
      />
    </div>
  );
}
