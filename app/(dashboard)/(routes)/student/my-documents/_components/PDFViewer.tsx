"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);

  // Load PDF.js library
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          setPdfjsLib(pdfjsLib);
        }
      };
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!pdfjsLib || !fileUrl) return;

    setLoading(true);
    setError(false);

    const loadingTask = pdfjsLib.getDocument(fileUrl);
    loadingTask.promise
      .then((pdf: any) => {
        setPdfDoc(pdf);
        onLoadSuccess(pdf.numPages);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Error loading PDF:", err);
        setError(true);
        setLoading(false);
      });
  }, [pdfjsLib, fileUrl, onLoadSuccess]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    pdfDoc.getPage(pageNumber).then((page: any) => {
      const viewport = page.getViewport({ scale, rotation });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      page.render(renderContext);
    });
  }, [pdfDoc, pageNumber, scale, rotation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] w-[800px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t("loadingPDF")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] w-[800px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{t("errorLoadingPDF")}</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {t("errorLoadingPDF")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="max-w-full h-auto"
      style={{
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
}
