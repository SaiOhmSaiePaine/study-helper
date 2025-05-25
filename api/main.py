from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import fitz  # PyMuPDF
from utils.ai_processor import AIProcessor

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI processor
ai_processor = AIProcessor()

class QuestionAnswer(BaseModel):
    question: str
    options: List[str]
    correct_answer: int

class FlashCard(BaseModel):
    question: str
    answer: str

class TextRequest(BaseModel):
    text: str

class QuestionRequest(BaseModel):
    text: str
    question: str

def extract_text_from_pdf(file: UploadFile) -> str:
    try:
        pdf_document = fitz.open(stream=file.file.read(), filetype="pdf")
        text = ""
        for page in pdf_document:
            text += page.get_text()
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")

@app.post("/api/process-document")
async def process_document(file: UploadFile = File(...)):
    """Extract text from uploaded document"""
    if file.content_type == "application/pdf":
        text = extract_text_from_pdf(file)
        return {"text": text}
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

@app.post("/api/generate-notes")
async def generate_notes(request: TextRequest):
    """Generate AI-powered notes from document text"""
    try:
        summary = ai_processor.generate_summary(request.text)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-flashcards")
async def generate_flashcards(request: TextRequest, num_cards: int = 5) -> List[FlashCard]:
    """Generate flashcards from document text"""
    try:
        cards = ai_processor.generate_flashcards(request.text, num_cards)
        return [FlashCard(**card) for card in cards]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-quiz")
async def generate_quiz(request: TextRequest, num_questions: int = 5) -> List[QuestionAnswer]:
    """Generate quiz questions from document text"""
    try:
        questions = ai_processor.generate_quiz(request.text, num_questions)
        return [QuestionAnswer(**question) for question in questions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ask-question")
async def ask_question(request: QuestionRequest):
    """Answer a specific question about the document"""
    try:
        answer = ai_processor.answer_question(request.text, request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 