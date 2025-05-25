import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback } from 'react';
import { ChatBubbleLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { api } from '@/services/api';

interface NotesProps {
  documentContent: string | null;
}

type ExportFormat = 'html' | 'txt' | 'md';

export default function Notes({ documentContent }: NotesProps) {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Type / for commands or start typing your notes...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': 'Notes editor',
      },
    },
  });

  const handleAiAssist = useCallback(async () => {
    if (!documentContent) {
      setError('Please upload a document first');
      return;
    }
    
    setIsAiThinking(true);
    setError(null);
    
    try {
      const summary = await api.generateNotes(documentContent);
      setAiResponse(summary);
      
      if (editor) {
        const currentContent = editor.getHTML();
        editor.commands.setContent(currentContent + '\n\n' + summary);
      }
    } catch (error) {
      console.error('Error getting AI assistance:', error);
      setError('Failed to generate AI notes. Please try again.');
      setAiResponse('');
    } finally {
      setIsAiThinking(false);
    }
  }, [documentContent, editor]);

  const handleExport = useCallback(async (format: ExportFormat = 'html') => {
    if (!editor) return;
    
    try {
      let content = editor.getHTML();
      let mimeType = 'text/html';
      let extension = 'html';
      
      if (format === 'txt') {
        content = editor.getText();
        mimeType = 'text/plain';
        extension = 'txt';
      } else if (format === 'md') {
        content = editor.storage.markdown.getMarkdown();
        mimeType = 'text/markdown';
        extension = 'md';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `notes.${extension}`;
      link.setAttribute('aria-label', `Download notes as ${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting notes:', error);
      setError('Failed to export notes. Please try again.');
    }
  }, [editor]);

  return (
    <div className="h-full flex flex-col" role="region" aria-label="Notes Section">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleAiAssist}
          disabled={isAiThinking || !documentContent}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label={isAiThinking ? 'AI is generating notes' : 'Generate AI notes'}
        >
          <ChatBubbleLeftIcon className="w-5 h-5" aria-hidden="true" />
          <span>{isAiThinking ? 'Thinking...' : 'Ask AI'}</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('html')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Export notes as HTML"
          >
            <DocumentArrowDownIcon className="w-5 h-5" aria-hidden="true" />
            <span>Export HTML</span>
          </button>
          <button
            onClick={() => handleExport('txt')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Export notes as plain text"
          >
            <DocumentArrowDownIcon className="w-5 h-5" aria-hidden="true" />
            <span>Export TXT</span>
          </button>
        </div>
      </div>

      {error && (
        <div 
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {aiResponse && (
        <div 
          className="mb-4 p-4 bg-gray-50 rounded-lg"
          role="region"
          aria-label="AI Generated Notes"
        >
          <p className="text-sm text-gray-600">{aiResponse}</p>
        </div>
      )}

      <div 
        className="flex-1 overflow-y-auto border rounded-lg p-4 focus-within:ring-2 focus-within:ring-indigo-500"
        role="textbox"
        aria-label="Notes editor"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
} 