'use client';

import { useState, useCallback } from 'react';
import { Tab } from '@headlessui/react';
import { DocumentTextIcon, BookOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import PDFViewer from '@/components/PDFViewer';
import Notes from '@/components/Notes';
import Flashcards from '@/components/Flashcards';
import Quiz from '@/components/Quiz';

type TabItem = {
  name: string;
  icon: typeof DocumentTextIcon;
  component: React.ComponentType<{ documentContent: string | null }>;
};

const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/epub+zip'] as const;
type AcceptedFileType = typeof ACCEPTED_FILE_TYPES[number];

const TABS: TabItem[] = [
  { name: 'Notes', icon: DocumentTextIcon, component: Notes },
  { name: 'Flashcards', icon: BookOpenIcon, component: Flashcards },
  { name: 'Quiz', icon: QuestionMarkCircleIcon, component: Quiz },
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    setError(null);

    if (!uploadedFile) {
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(uploadedFile.type as AcceptedFileType)) {
      setError('Please upload a PDF or EPUB file');
      return;
    }

    setFile(uploadedFile);
  }, []);

  const handleContentExtracted = useCallback((content: string) => {
    setDocumentContent(content);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (!ACCEPTED_FILE_TYPES.includes(droppedFile.type as AcceptedFileType)) {
      setError('Please upload a PDF or EPUB file');
      return;
    }

    setFile(droppedFile);
  }, []);

  return (
    <div className="flex h-screen">
      {/* Left side - Document Viewer */}
      <div className="w-1/2 border-r border-gray-200 bg-white">
        {!file ? (
          <div className="h-full flex items-center justify-center p-4">
            <label 
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              tabIndex={0}
              role="button"
              aria-label="Upload PDF or EPUB file"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mb-3" aria-hidden="true" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF or EPUB</p>
                {error && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                accept=".pdf,.epub"
                aria-label="File upload input"
              />
            </label>
          </div>
        ) : (
          <PDFViewer file={file} onContentExtracted={handleContentExtracted} />
        )}
      </div>

      {/* Right side - Study Tools */}
      <div className="w-1/2 bg-white">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 border-b border-gray-200 p-1">
            {TABS.map((tab, index) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full py-2.5 text-sm font-medium leading-5 text-gray-700 outline-none
                   ${selected ? 'border-b-2 border-indigo-500' : 'hover:bg-gray-100 hover:text-gray-900'}
                   focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="w-5 h-5" aria-hidden="true" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="h-[calc(100vh-3.5rem)]">
            {TABS.map((tab, index) => (
              <Tab.Panel
                key={tab.name}
                className="h-full p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <tab.component documentContent={documentContent} />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
