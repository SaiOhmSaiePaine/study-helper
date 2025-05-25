import { useState, useCallback } from 'react';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { api, QuizQuestion } from '@/services/api';

interface QuizProps {
  documentContent: string | null;
}

interface QuizState {
  questions: (QuizQuestion & { id: number })[];
  currentIndex: number;
  selectedAnswer: number | null;
  showResult: boolean;
  score: number;
}

const initialQuizState: QuizState = {
  questions: [],
  currentIndex: 0,
  selectedAnswer: null,
  showResult: false,
  score: 0,
};

export default function Quiz({ documentContent }: QuizProps) {
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { questions, currentIndex, selectedAnswer, showResult, score } = quizState;

  const generateQuiz = useCallback(async () => {
    if (!documentContent) {
      setError('Please upload a document first');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedQuestions = await api.generateQuiz(documentContent);
      setQuizState({
        ...initialQuizState,
        questions: generatedQuestions.map((q, index) => ({
          ...q,
          id: index + 1,
        })),
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [documentContent]);

  const handleAnswerSelect = useCallback((optionIndex: number) => {
    if (selectedAnswer !== null) return;

    setQuizState(prev => ({
      ...prev,
      selectedAnswer: optionIndex,
      score: optionIndex === prev.questions[prev.currentIndex].correct_answer ? prev.score + 1 : prev.score,
    }));
  }, [selectedAnswer]);

  const handleNext = useCallback(() => {
    if (selectedAnswer === null) return;

    setQuizState(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      selectedAnswer: null,
      showResult: prev.currentIndex === prev.questions.length - 1,
    }));
  }, [selectedAnswer]);

  const handleRetry = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      currentIndex: 0,
      selectedAnswer: null,
      showResult: false,
      score: 0,
    }));
  }, []);

  const handleKeyboardNavigation = useCallback((e: React.KeyboardEvent) => {
    if (showResult) return;

    const key = e.key;
    if (key >= '1' && key <= '4') {
      const optionIndex = parseInt(key) - 1;
      if (optionIndex < questions[currentIndex]?.options.length) {
        handleAnswerSelect(optionIndex);
      }
    } else if (key === 'Enter' && selectedAnswer !== null) {
      handleNext();
    }
  }, [showResult, questions, currentIndex, selectedAnswer, handleAnswerSelect, handleNext]);

  return (
    <div 
      className="h-full flex flex-col"
      role="region"
      aria-label="Quiz Section"
      onKeyDown={handleKeyboardNavigation}
      tabIndex={0}
    >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={generateQuiz}
          disabled={isGenerating || !documentContent}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label={isGenerating ? 'Generating quiz' : 'Generate quiz'}
        >
          <ArrowPathIcon className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{isGenerating ? 'Generating...' : 'Generate Quiz'}</span>
        </button>
      </div>

      {error && (
        <div 
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {questions.length > 0 ? (
        showResult ? (
          <div 
            className="flex-1 flex flex-col items-center justify-center"
            role="region"
            aria-label="Quiz Results"
          >
            <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
            <p className="text-xl mb-8" role="status">
              Your score: {score} out of {questions.length}
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Try quiz again"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <p 
                className="text-sm text-gray-500 mb-2"
                role="status"
                aria-live="polite"
              >
                Question {currentIndex + 1} of {questions.length}
              </p>
              <h3 
                className="text-xl font-medium mb-6"
                role="heading"
                aria-level={1}
              >
                {questions[currentIndex].question}
              </h3>
              <div 
                className="space-y-4"
                role="radiogroup"
                aria-label="Answer options"
              >
                {questions[currentIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border ${
                      selectedAnswer === index
                        ? selectedAnswer === questions[currentIndex].correct_answer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    disabled={selectedAnswer !== null}
                    role="radio"
                    aria-checked={selectedAnswer === index}
                    aria-label={`Option ${index + 1}: ${option}`}
                    tabIndex={selectedAnswer === null ? 0 : -1}
                  >
                    <div className="flex items-center">
                      <span className="flex-1">
                        <span className="font-medium mr-2">{index + 1}.</span>
                        {option}
                      </span>
                      {selectedAnswer === index && (
                        selectedAnswer === questions[currentIndex].correct_answer ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" aria-hidden="true" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-500" aria-hidden="true" />
                        )
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-auto">
              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label={currentIndex === questions.length - 1 ? 'Finish quiz' : 'Next question'}
              >
                {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </div>
        )
      ) : (
        <div 
          className="flex-1 flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-gray-500">
            {documentContent
              ? 'Click "Generate Quiz" to create practice questions'
              : 'Upload a document to generate a quiz'}
          </p>
        </div>
      )}
    </div>
  );
} 