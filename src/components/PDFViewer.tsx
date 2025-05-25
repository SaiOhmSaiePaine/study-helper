import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | null;
  onContentExtracted: (content: string) => void;
}

export default function PDFViewer({ file, onContentExtracted }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    // TODO: Implement text extraction and pass to parent
    onContentExtracted("Sample extracted content");
  }

  const nextPage = () => {
    if (pageNumber < (numPages || 1)) {
      setPageNumber(pageNumber + 1);
    }
  };

  const previousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const zoomIn = () => {
    setScale(scale + 0.1);
  };

  const zoomOut = () => {
    if (scale > 0.5) {
      setScale(scale - 0.1);
    }
  };

  if (!file) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-4">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-sm">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button
            onClick={nextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
          >
            -
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex justify-center p-4">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          className="max-w-full"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            className="shadow-lg"
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
} 