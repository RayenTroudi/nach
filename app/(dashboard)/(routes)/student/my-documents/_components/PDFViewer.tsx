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
  scale,
  rotation,
  onLoadSuccess,
}: PDFViewerProps) {
  const t = useTranslations("documentViewer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewerType, setViewerType] = useState<'native' | 'object'>('native');
  const [iframeKey, setIframeKey] = useState(0);

  // Get responsive dimensions
  const [dimensions, setDimensions] = useState({ width: 1400, height: 850 });

  useEffect(() => {
    const updateDimensions = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isMobile = viewportWidth < 768;
      const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
      
      if (isMobile) {
        setDimensions({
          width: viewportWidth - 8,
          height: Math.min(viewportHeight * 0.75, viewportHeight - 180)
        });
      } else if (isTablet) {
        setDimensions({
          width: Math.min(viewportWidth - 60, 900),
          height: Math.min(viewportHeight * 0.7, 700)
        });
      } else {
        // Desktop/Laptop - much larger and take advantage of full space
        const desktopWidth = Math.min(viewportWidth - 150, 1400);
        const desktopHeight = Math.min(viewportHeight * 0.8, 900);
        setDimensions({
          width: desktopWidth,
          height: desktopHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Update iframe when page changes
  useEffect(() => {
    setLoading(true);
    setIframeKey(prev => prev + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  // Build PDF URL based on viewer type
  const buildViewerUrl = () => {
    if (viewerType === 'native') {
      // Browser native viewer with toolbar disabled (no download/print buttons)
      return `${fileUrl}#page=${pageNumber}&view=FitH&toolbar=0&navpanes=0`;
    } else {
      // Direct embedding
      return fileUrl;
    }
  };

  // Handle load success
  const handleLoad = () => {
    setLoading(false);
    setError(false);
    onLoadSuccess(1);
  };

  // Handle load errors with fallback strategy
  const handleError = () => {
    if (viewerType === 'native') {
      // Try object embed as fallback
      setViewerType('object');
      setLoading(true);
    } else {
      setError(true);
      setLoading(false);
    }
  };

  // Reset viewer type when file changes
  useEffect(() => {
    setViewerType('native');
    setLoading(true);
    setError(false);
  }, [fileUrl]);

  if (error) {
    return (
      <div 
        className="flex items-center justify-center flex-col gap-2 sm:gap-4" 
        style={{ height: dimensions.height, width: dimensions.width }}
      >
        <div className="text-center px-2 sm:px-4">
          <p className="text-red-500 mb-2 sm:mb-4 text-xs sm:text-sm md:text-base">{t("errorLoadingPDF")}</p>
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs md:text-sm transition-colors"
          >
            {t("openInNewTab") || "Open in new tab"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-brand-red-500 mx-auto mb-2 sm:mb-3 md:mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm md:text-base px-2">{t("loadingPDF")}</p>
          </div>
        </div>
      )}
      
      {viewerType === 'object' ? (
        <object
          key={`object-${iframeKey}`}
          data={buildViewerUrl()}
          type="application/pdf"
          className="border-0 rounded-lg mx-auto"
          style={{
            width: '100%',
            height: `${dimensions.height}px`,
            minHeight: '300px',
            maxHeight: '90vh',
            display: 'block',
          }}
          onLoad={handleLoad}
          onError={handleError}
        >
          <embed
            src={buildViewerUrl()}
            type="application/pdf"
            className="border-0 rounded-lg mx-auto"
            style={{
              width: '100%',
              height: `${dimensions.height}px`,
              minHeight: '300px',
              maxHeight: '90vh',
              display: 'block',
            }}
          />
        </object>
      ) : (
        <iframe
          key={`iframe-${iframeKey}`}
          src={buildViewerUrl()}
          title={fileName}
          className="border-0 rounded-lg mx-auto"
          style={{
            width: '100%',
            height: `${dimensions.height}px`,
            minHeight: '300px',
            maxHeight: '90vh',
            display: 'block',
          }}
          onLoad={handleLoad}
          onError={handleError}
          allow="fullscreen"
        />
      )}
    </div>
  );
}
