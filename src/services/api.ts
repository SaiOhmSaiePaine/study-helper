const API_BASE_URL = 'http://localhost:8000/api';

export interface FlashCard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
}

export const api = {
  async processDocument(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/process-document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to process document');
    }

    const data = await response.json();
    return data.text;
  },

  async generateNotes(text: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/generate-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate notes');
    }

    const data = await response.json();
    return data.summary;
  },

  async generateFlashcards(text: string, numCards: number = 5): Promise<FlashCard[]> {
    const response = await fetch(`${API_BASE_URL}/generate-flashcards?num_cards=${numCards}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate flashcards');
    }

    return response.json();
  },

  async generateQuiz(text: string, numQuestions: number = 5): Promise<QuizQuestion[]> {
    const response = await fetch(`${API_BASE_URL}/generate-quiz?num_questions=${numQuestions}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate quiz');
    }

    return response.json();
  },

  async askQuestion(text: string, question: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/ask-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, question }),
    });

    if (!response.ok) {
      throw new Error('Failed to get answer');
    }

    const data = await response.json();
    return data.answer;
  },
}; 