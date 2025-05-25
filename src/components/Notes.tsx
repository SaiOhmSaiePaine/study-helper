import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';
import { ChatBubbleLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { api } from '@/services/api';

interface NotesProps {
  documentContent: string | null;
}

export default function Notes({ documentContent }: NotesProps) {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState(false);

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
      },
    },
  });

  const handleAiAssist = async () => {
    if (!documentContent) return;
    
    setIsAiThinking(true);
    try {
      const summary = await api.generateNotes(documentContent);
      setAiResponse(summary);
      
      // Insert the AI response into the editor
      if (editor) {
        editor.commands.insertContent(summary);
      }
    } catch (error) {
      console.error('Error getting AI assistance:', error);
      setAiResponse('Sorry, there was an error processing your request.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleExport = async () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    // Create a Blob with the content
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notes.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleAiAssist}
          disabled={isAiThinking || !documentContent}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span>{isAiThinking ? 'Thinking...' : 'Ask AI'}</span>
        </button>
        
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      {aiResponse && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{aiResponse}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto border rounded-lg p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
} 