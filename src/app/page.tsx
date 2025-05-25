'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { DocumentTextIcon, BookOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import PDFViewer from '@/components/PDFViewer';
import Notes from '@/components/Notes';
import Flashcards from '@/components/Flashcards';
import Quiz from '@/components/Quiz';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/epub+zip')) {
      setFile(file);
    }
  };

  const handleContentExtracted = (content: string) => {
    setDocumentContent(content);
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Document Viewer */}
      <div className="w-1/2 border-r border-gray-200 bg-white">
        {!file ? (
          <div className="h-full flex items-center justify-center p-4">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF or EPUB</p>
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.epub" />
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
            <Tab className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium leading-5 text-gray-700
               ${selected ? 'border-b-2 border-indigo-500' : 'hover:bg-gray-100 hover:text-gray-900'}`
            }>
              <div className="flex items-center justify-center space-x-2">
                <DocumentTextIcon className="w-5 h-5" />
                <span>Notes</span>
              </div>
            </Tab>
            <Tab className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium leading-5 text-gray-700
               ${selected ? 'border-b-2 border-indigo-500' : 'hover:bg-gray-100 hover:text-gray-900'}`
            }>
              <div className="flex items-center justify-center space-x-2">
                <BookOpenIcon className="w-5 h-5" />
                <span>Flashcards</span>
              </div>
            </Tab>
            <Tab className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium leading-5 text-gray-700
               ${selected ? 'border-b-2 border-indigo-500' : 'hover:bg-gray-100 hover:text-gray-900'}`
            }>
              <div className="flex items-center justify-center space-x-2">
                <QuestionMarkCircleIcon className="w-5 h-5" />
                <span>Quiz</span>
              </div>
            </Tab>
          </Tab.List>
          <Tab.Panels className="h-[calc(100vh-3.5rem)]">
            <Tab.Panel className="h-full p-4">
              <Notes documentContent={documentContent} />
            </Tab.Panel>
            <Tab.Panel className="h-full p-4">
              <Flashcards documentContent={documentContent} />
            </Tab.Panel>
            <Tab.Panel className="h-full p-4">
              <Quiz documentContent={documentContent} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
