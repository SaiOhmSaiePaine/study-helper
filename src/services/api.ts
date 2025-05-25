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
      error.message = data.detail || data.message || error.message;
    } catch (e) {
      console.error('Error parsing error response:', e);
    }

    throw error;
  }

  try {
    return await response.json();
  } catch (e) {
    console.error('Error parsing success response:', e);
    throw new Error('Invalid response format from server');
  }
};

const handleRequest = async <T>(
  url: string,
  options: RequestInit,
  errorContext: string
): Promise<T> => {
  try {
    console.log(`Making request to ${url}`, { options });
    const response = await fetch(url, options);
    console.log(`Received response from ${url}`, { status: response.status });
    return await handleResponse<T>(response);
  } catch (error) {
    console.error(`Error in ${errorContext}:`, error);
    throw error;
  }
};

export const api = {
  async processDocument(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const data = await handleRequest<DocumentResponse>(
      `${API_BASE_URL}/process-document`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      },
      'processDocument'
    );
    return data.text;
  },

  async generateNotes(text: string): Promise<string> {
    const data = await handleRequest<NotesResponse>(
      `${API_BASE_URL}/generate-notes`,
      {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify({ text }),
      },
      'generateNotes'
    );
    return data.summary;
  },

  async generateFlashcards(text: string, numCards: number = 5): Promise<FlashCard[]> {
    return handleRequest<FlashCard[]>(
      `${API_BASE_URL}/generate-flashcards?num_cards=${numCards}`,
      {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify({ text }),
      },
      'generateFlashcards'
    );
  },

  async generateQuiz(text: string, numQuestions: number = 5): Promise<QuizQuestion[]> {
    return handleRequest<QuizQuestion[]>(
      `${API_BASE_URL}/generate-quiz?num_questions=${numQuestions}`,
      {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify({ text }),
      },
      'generateQuiz'
    );
  },

  async askQuestion(text: string, question: string): Promise<string> {
    const data = await handleRequest<AnswerResponse>(
      `${API_BASE_URL}/ask-question`,
      {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify({ text, question }),
      },
      'askQuestion'
    );
    return data.answer;
  },
}; 