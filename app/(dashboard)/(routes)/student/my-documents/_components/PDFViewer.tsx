"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
  onLoadSuccess,
}: PDFViewerProps) {
  const t = useTranslations("documentViewer");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [height, setHeight] = useState(850);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 768;
      setIsMobile(mobile);

      if (mobile) {
        setHeight(Math.min(vh * 0.75, vh - 180));
      } else if (vw < 1024) {
        setHeight(Math.min(vh * 0.7, 700));
      } else {
        setHeight(Math.min(vh * 0.8, 900));
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Notify parent that the document is ready (single-page signal)
  useEffect(() => {
    onLoadSuccess(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

  // Reset loading state when file or page changes
  useEffect(() => {
    setLoading(true);
  }, [fileUrl, pageNumber]);

  const handleLoad = () => setLoading(false);

  // Mobile browsers (especially iOS Safari) cannot render PDFs inline via iframe.
  // Google Docs Viewer proxies and renders the PDF as HTML, working on all mobile browsers.
  // Desktop browsers use the native PDF viewer via direct URL.
  const src = isMobile
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
    : `${fileUrl}#page=${pageNumber}&toolbar=0&navpanes=0`;

  return (
    <div className="relative flex items-center justify-center w-full">
      {loading && (
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
      )}
      <iframe
        key={`${fileUrl}-${pageNumber}-${isMobile}`}
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
        onLoad={handleLoad}
        allow="fullscreen"
      />
    </div>
  );
}
