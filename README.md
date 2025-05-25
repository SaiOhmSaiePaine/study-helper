# Study Helper

A powerful study assistant that helps you learn from PDF documents using AI. This application uses OpenRouter's free AI models to provide features like:

- Text extraction from PDFs
- AI-powered note generation
- Flashcard creation
- Quiz generation
- Question answering

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/study-helper.git
cd study-helper
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

4. Get your OpenRouter API key:
- Visit [OpenRouter](https://openrouter.ai/)
- Sign up for a free account
- Get your API key from the dashboard

5. Create a `.env` file in the `api` directory:
```bash
PORT=8000
HOST=localhost
DEBUG=True
```

## Running the Application

1. Start the backend server:
```bash
cd api
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
python run.py
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Visit http://localhost:3000 in your browser

## Using the API

The application requires an OpenRouter API key for AI features. You need to include your API key in the request headers:

```typescript
const response = await fetch('http://localhost:8000/api/generate-notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-openrouter-api-key'
  },
  body: JSON.stringify({
    text: 'Your text here'
  })
});
```

## Features

### 1. PDF Processing
- Upload PDF documents
- Extract text content
- Process multiple pages

### 2. AI-Powered Notes
- Generate concise summaries
- Extract key points
- Create structured notes

### 3. Flashcards
- Automatically generate question-answer pairs
- Focus on key concepts
- Review important information

### 4. Quiz Generation
- Create multiple-choice questions
- Test understanding
- Immediate feedback

### 5. Question Answering
- Ask specific questions about the content
- Get AI-powered answers
- Deep understanding of the material

## API Endpoints

- `POST /api/process-document`: Upload and process PDF files
- `POST /api/generate-notes`: Generate AI-powered notes
- `POST /api/generate-flashcards`: Create flashcards
- `POST /api/generate-quiz`: Generate quiz questions
- `POST /api/ask-question`: Answer specific questions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Tailwind CSS](https://tailwindcss.com/) and [Headless UI](https://headlessui.com/)
- Rich text editing powered by [TipTap](https://tiptap.dev/)
- PDF handling with [react-pdf](https://react-pdf.org/)
