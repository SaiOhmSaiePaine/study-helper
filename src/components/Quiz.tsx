import { useState } from 'react';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProps {
  documentContent: string | null;
}

export default function Quiz({ documentContent }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    if (!documentContent) return;
    
    setIsGenerating(true);
    try {
      // TODO: Implement AI quiz generation
      const sampleQuestions = [
        {
          id: 1,
          question: "Sample Question 1?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
        },
        {
          id: 2,
          question: "Sample Question 2?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 1,
        },
        // Add more sample questions as needed
      ];
      setQuestions(sampleQuestions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    if (optionIndex === questions[currentIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={generateQuiz}
          disabled={isGenerating || !documentContent}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>{isGenerating ? 'Generating...' : 'Generate Quiz'}</span>
        </button>
      </div>

      {questions.length > 0 ? (
        showResult ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
            <p className="text-xl mb-8">
              Your score: {score} out of {questions.length}
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-2">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <h3 className="text-xl font-medium mb-6">
                {questions[currentIndex].question}
              </h3>
              <div className="space-y-4">
                {questions[currentIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border ${
                      selectedAnswer === index
                        ? selectedAnswer === questions[currentIndex].correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    disabled={selectedAnswer !== null}
                  >
                    <div className="flex items-center">
                      <span className="flex-1">{option}</span>
                      {selectedAnswer === index && (
                        selectedAnswer === questions[currentIndex].correctAnswer ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-500" />
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
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
              >
                {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="flex-1 flex items-center justify-center">
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