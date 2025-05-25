import { useState, useCallback, useEffect } from 'react';
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { api, FlashCard } from '@/services/api';

interface FlashcardsProps {
  documentContent: string | null;
}

const KEYBOARD_SHORTCUTS = {
  FLIP: ['Space', 'Enter'] as const,
  NEXT: ['ArrowRight'] as const,
  PREVIOUS: ['ArrowLeft'] as const,
} as const;

export default function Flashcards({ documentContent }: FlashcardsProps) {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (cards.length === 0) return;

    const code = e.code as typeof KEYBOARD_SHORTCUTS.FLIP[number] | typeof KEYBOARD_SHORTCUTS.NEXT[number] | typeof KEYBOARD_SHORTCUTS.PREVIOUS[number];

    if (KEYBOARD_SHORTCUTS.FLIP.includes(code as typeof KEYBOARD_SHORTCUTS.FLIP[number])) {
      e.preventDefault();
      setIsFlipped(prev => !prev);
    } else if (KEYBOARD_SHORTCUTS.NEXT.includes(code as typeof KEYBOARD_SHORTCUTS.NEXT[number]) && currentIndex < cards.length - 1) {
      e.preventDefault();
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else if (KEYBOARD_SHORTCUTS.PREVIOUS.includes(code as typeof KEYBOARD_SHORTCUTS.PREVIOUS[number]) && currentIndex > 0) {
      e.preventDefault();
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [cards.length, currentIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const generateFlashcards = useCallback(async () => {
    if (!documentContent) {
      setError('Please upload a document first');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedCards = await api.generateFlashcards(documentContent);
      setCards(generatedCards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError('Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [documentContent]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, cards.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleExport = useCallback(() => {
    if (cards.length === 0) return;

    try {
      const csvContent = [
        ['Question', 'Answer'],
        ...cards.map(card => [card.question, card.answer])
      ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'flashcards.csv';
      link.setAttribute('aria-label', 'Download flashcards as CSV');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting flashcards:', error);
      setError('Failed to export flashcards. Please try again.');
    }
  }, [cards]);

  return (
    <div className="h-full flex flex-col" role="region" aria-label="Flashcards Section">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={generateFlashcards}
          disabled={isGenerating || !documentContent}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label={isGenerating ? 'Generating flashcards' : 'Generate flashcards'}
        >
          <ArrowPathIcon className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{isGenerating ? 'Generating...' : 'Generate Flashcards'}</span>
        </button>

        {cards.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Export flashcards as CSV"
          >
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {error && (
        <div 
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {cards.length > 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            className="w-full max-w-lg aspect-video relative"
            onClick={handleFlip}
            onKeyDown={(e) => {
              if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                handleFlip();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Flashcard ${currentIndex + 1} of ${cards.length}. Press Space or Enter to flip.`}
          >
            <div
              className={`absolute inset-0 transition-all duration-500 ${
                isFlipped ? 'rotate-y-180 opacity-0' : 'rotate-y-0 opacity-100'
              }`}
              aria-hidden={isFlipped}
            >
              <div className="h-full bg-white rounded-xl shadow-lg p-8 flex items-center justify-center">
                <p className="text-xl text-center">{cards[currentIndex].question}</p>
              </div>
            </div>
            <div
              className={`absolute inset-0 transition-all duration-500 ${
                isFlipped ? 'rotate-y-0 opacity-100' : 'rotate-y-180 opacity-0'
              }`}
              aria-hidden={!isFlipped}
            >
              <div className="h-full bg-indigo-50 rounded-xl shadow-lg p-8 flex items-center justify-center">
                <p className="text-xl text-center">{cards[currentIndex].answer}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-8" role="group" aria-label="Flashcard navigation">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Previous flashcard"
            >
              <ChevronLeftIcon className="w-6 h-6" aria-hidden="true" />
            </button>
            <span className="text-sm text-gray-500" role="status">
              {currentIndex + 1} / {cards.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Next flashcard"
            >
              <ChevronRightIcon className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="flex-1 flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-gray-500">
            {documentContent
              ? 'Click "Generate Flashcards" to create study cards'
              : 'Upload a document to generate flashcards'}
          </p>
        </div>
      )}
    </div>
  );
} 