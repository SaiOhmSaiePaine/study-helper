const API_BASE_URL = 'http://localhost:3001/api';

// Get API key from environment variable
const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

// Common headers for all requests
const getHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {
    'X-API-Key': API_KEY || '',
  };
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  return headers;
};

export interface APIError {
  message: string;
  status: number;
}

export interface FlashCard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
}

interface DocumentResponse {
  text: string;
}

interface NotesResponse {
  summary: string;
}

interface AnswerResponse {
  answer: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error: APIError = {
      message: 'An error occurred while processing your request',
      status: response.status,
    };

    try {
      const data = await response.json();
      error.message = data.message || error.message;
    } catch {
      // Use default error message if response is not JSON
    }

    throw error;
  }

  return response.json();
};

export const api = {
  async processDocument(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/process-document`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });

    const data = await handleResponse<DocumentResponse>(response);
    return data.text;
  },

  async generateNotes(text: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/generate-notes`, {
      method: 'POST',
      headers: getHeaders('application/json'),
      body: JSON.stringify({ text }),
    });

    const data = await handleResponse<NotesResponse>(response);
    return data.summary;
  },

  async generateFlashcards(text: string, numCards: number = 5): Promise<FlashCard[]> {
    const response = await fetch(`${API_BASE_URL}/generate-flashcards?num_cards=${numCards}`, {
      method: 'POST',
      headers: getHeaders('application/json'),
      body: JSON.stringify({ text }),
    });

    return handleResponse<FlashCard[]>(response);
  },

  async generateQuiz(text: string, numQuestions: number = 5): Promise<QuizQuestion[]> {
    const response = await fetch(`${API_BASE_URL}/generate-quiz?num_questions=${numQuestions}`, {
      method: 'POST',
      headers: getHeaders('application/json'),
      body: JSON.stringify({ text }),
    });

    return handleResponse<QuizQuestion[]>(response);
  },

  async askQuestion(text: string, question: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/ask-question`, {
      method: 'POST',
      headers: getHeaders('application/json'),
      body: JSON.stringify({ text, question }),
    });

    const data = await handleResponse<AnswerResponse>(response);
    return data.answer;
  },
}; 