import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  file: File | null;
  onContentExtracted: (content: string) => void;
}

type PDFDocumentLoadSuccess = {
  numPages: number;
  _transport: any; // PDF document transport
};

const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.5;
const INITIAL_SCALE = 1.0;

export default function PDFViewer({ file, onContentExtracted }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentLoadSuccess = useCallback(async ({ numPages, _transport }: PDFDocumentLoadSuccess) => {
    setNumPages(numPages);
    try {
      // Extract text from the first page as a sample
      const page = await _transport.getPage(1);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      onContentExtracted(text);
    } catch (err) {
      setError('Failed to extract text content');
      console.error('Text extraction error:', err);
    }
  }, [onContentExtracted]);

  const handleNextPage = useCallback(() => {
    if (pageNumber < (numPages || 1)) {
      setPageNumber(prev => prev + 1);
    }
  }, [pageNumber, numPages]);

  const handlePreviousPage = useCallback(() => {
    if (pageNumber > 1) {
      setPageNumber(prev => prev - 1);
    }
  }, [pageNumber]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => prev + ZOOM_STEP);
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(MIN_SCALE, prev - ZOOM_STEP));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        handleNextPage();
        break;
      case 'ArrowLeft':
        handlePreviousPage();
        break;
      case '+':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
    }
  }, [handleNextPage, handlePreviousPage, handleZoomIn, handleZoomOut]);

  if (!file) {
    return null;
  }

  return (
    <div 
      className="h-full flex flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="PDF Viewer"
    >
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousPage}
            disabled={pageNumber <= 1}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 focus:ring-2 focus:ring-blue-500"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-sm" role="status" aria-live="polite">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 focus:ring-2 focus:ring-blue-500"
            aria-label="Next page"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2" role="group" aria-label="Zoom controls">
          <button
            onClick={handleZoomOut}
            className="px-2 py-1 text-sm border rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
            aria-label="Zoom out"
          >
            -
          </button>
          <span className="text-sm" role="status" aria-live="polite">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="px-2 py-1 text-sm border rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex justify-center p-4">
        {error && (
          <div className="text-red-500" role="alert">
            {error}
          </div>
        )}
        <Document
          file={file}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={() => setError('Failed to load PDF')}
          className="max-w-full"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            className="shadow-lg"
            renderTextLayer={true}
            renderAnnotationLayer={true}
            error={
              <div className="text-red-500" role="alert">
                Failed to load page {pageNumber}
              </div>
            }
          />
        </Document>
      </div>
    </div>
  );
} 