import { useState } from 'react';
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { api, FlashCard } from '@/services/api';

interface FlashcardsProps {
  documentContent: string | null;
}

export default function Flashcards({ documentContent }: FlashcardsProps) {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateFlashcards = async () => {
    if (!documentContent) return;
    
    setIsGenerating(true);
    try {
      const generatedCards = await api.generateFlashcards(documentContent);
      setCards(generatedCards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleExport = () => {
    if (cards.length === 0) return;

    // Convert cards to CSV format
    const csvContent = [
      ['Question', 'Answer'],
      ...cards.map(card => [card.question, card.answer])
    ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flashcards.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={generateFlashcards}
          disabled={isGenerating || !documentContent}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>{isGenerating ? 'Generating...' : 'Generate Flashcards'}</span>
        </button>

        {cards.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {cards.length > 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            className="w-full max-w-lg aspect-video relative cursor-pointer"
            onClick={handleFlip}
          >
            <div
              className={`absolute inset-0 transition-all duration-500 ${
                isFlipped ? 'rotate-y-180 opacity-0' : 'rotate-y-0 opacity-100'
              }`}
            >
              <div className="h-full bg-white rounded-xl shadow-lg p-8 flex items-center justify-center">
                <p className="text-xl text-center">{cards[currentIndex].question}</p>
              </div>
            </div>
            <div
              className={`absolute inset-0 transition-all duration-500 ${
                isFlipped ? 'rotate-y-0 opacity-100' : 'rotate-y-180 opacity-0'
              }`}
            >
              <div className="h-full bg-indigo-50 rounded-xl shadow-lg p-8 flex items-center justify-center">
                <p className="text-xl text-center">{cards[currentIndex].answer}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {cards.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
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