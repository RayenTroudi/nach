"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  pageNumber: number;
  scale: number;
  rotation: number;
  onLoadSuccess: (numPages: number) => void;
}

function loadPdfjsLib(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("SSR"));
    const win = window as any;
    if (win.pdfjsLib) {
      win.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      return resolve(win.pdfjsLib);
    }
    const script = document.createElement("script");
    script.src = PDFJS_CDN;
    script.onload = () => {
      win.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve(win.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function PDFViewer({
  fileUrl,
  fileName,
  pageNumber,
  onLoadSuccess,
}: PDFViewerProps) {
  const t = useTranslations("documentViewer");
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(850);
  const [isMobile, setIsMobile] = useState(false);
  const [pageWidth, setPageWidth] = useState(600);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
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

  const renderPage = useCallback(async (pdf: any, page: number, width: number) => {
    if (!canvasRef.current) return;
    try {
      if (renderTaskRef.current) renderTaskRef.current.cancel();
      const pdfPage = await pdf.getPage(page);
      const baseViewport = pdfPage.getViewport({ scale: 1 });
      const scale = width / baseViewport.width;
      const viewport = pdfPage.getViewport({ scale });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const task = pdfPage.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;
      setLoading(false);
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("PDF render error:", err);
        setError("Failed to render page.");
        setLoading(false);
      }
    }
  }, []);

  // Load PDF document on mobile when fileUrl changes
  useEffect(() => {
    if (!isMobile) return;
    setLoading(true);
    setError(null);

    let cancelled = false;
    loadPdfjsLib()
      .then((lib) => lib.getDocument(fileUrl).promise)
      .then((pdf: any) => {
        if (cancelled) return;
        pdfDocRef.current = pdf;
        onLoadSuccess(pdf.numPages);
        return renderPage(pdf, pageNumber, pageWidth);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("PDF load error:", err);
          setError("Failed to load PDF.");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, fileUrl]);

  // Re-render when page or width changes (after initial load)
  useEffect(() => {
    if (!isMobile || !pdfDocRef.current) return;
    renderPage(pdfDocRef.current, pageNumber, pageWidth);
  }, [pageNumber, pageWidth, isMobile, renderPage]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleIframeLoad = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setLoading(false), 800);
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

  // Mobile: render PDF onto a canvas element via PDF.js loaded from CDN
  if (isMobile) {
    return (
      <div
        className="relative flex flex-col items-center justify-start w-full overflow-auto py-2"
        style={{ minHeight: `${height}px` }}
      >
        {loading && spinner}
        {error ? (
          <p className="text-red-500 text-sm mt-4">{error}</p>
        ) : (
          <canvas
            ref={canvasRef}
            className="rounded shadow-md"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        )}
      </div>
    );
  }

  // Desktop: native iframe PDF rendering
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
