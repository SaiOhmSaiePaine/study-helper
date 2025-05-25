from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, constr
from typing import List, Optional
import fitz  # PyMuPDF
from utils.ai_processor import AIProcessor, FlashCard, QuizQuestion

# Initialize FastAPI app
app = FastAPI(
    title="Study Helper API",
    description="AI-powered study assistant API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3004",
        "http://localhost:3005",
        "https://study-helper.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Request/Response Models
class TextRequest(BaseModel):
    text: constr(min_length=1, max_length=10000) = Field(..., description="The text to process")

class QuestionRequest(BaseModel):
    text: constr(min_length=1, max_length=10000) = Field(..., description="The context text")
    question: constr(min_length=1, max_length=500) = Field(..., description="The question to answer")

class SummaryResponse(BaseModel):
    summary: str = Field(..., description="Generated summary")

class AnswerResponse(BaseModel):
    answer: str = Field(..., description="Generated answer")

# Dependencies
async def get_api_key(x_api_key: str = Header(..., description="OpenRouter API key")) -> str:
    """Validate and return the API key"""
    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="API key is required"
        )
    return x_api_key

def get_ai_processor(api_key: str = Depends(get_api_key)) -> AIProcessor:
    """Create and return an AIProcessor instance"""
    return AIProcessor(api_key=api_key)

# Error Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# API Endpoints
@app.post("/api/process-document", response_model=TextRequest)
async def process_document(file: UploadFile = File(...)):
    """Extract text from uploaded document"""
    if not file.content_type == "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    try:
        pdf_document = fitz.open(stream=file.file.read(), filetype="pdf")
        text = ""
        for page in pdf_document:
            text += page.get_text()
        return {"text": text}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing PDF: {str(e)}"
        )

@app.post("/api/generate-notes", response_model=SummaryResponse)
async def generate_notes(
    request: TextRequest,
    ai_processor: AIProcessor = Depends(get_ai_processor)
):
    """Generate AI-powered notes from document text"""
    summary = await ai_processor.generate_summary(request.text)
    return {"summary": summary}

@app.post("/api/generate-flashcards", response_model=List[FlashCard])
async def generate_flashcards(
    request: TextRequest,
    num_cards: Optional[int] = 5,
    ai_processor: AIProcessor = Depends(get_ai_processor)
):
    """Generate flashcards from document text"""
    cards = await ai_processor.generate_flashcards(request.text, num_cards)
    return cards

@app.post("/api/generate-quiz", response_model=List[QuizQuestion])
async def generate_quiz(
    request: TextRequest,
    num_questions: Optional[int] = 5,
    ai_processor: AIProcessor = Depends(get_ai_processor)
):
    """Generate quiz questions from document text"""
    questions = await ai_processor.generate_quiz(request.text, num_questions)
    return questions

@app.post("/api/ask-question", response_model=AnswerResponse)
async def ask_question(
    request: QuestionRequest,
    ai_processor: AIProcessor = Depends(get_ai_processor)
):
    """Answer a specific question about the document"""
    answer = await ai_processor.answer_question(request.text, request.question)
    return {"answer": answer} 

# hi Sai Ohm Saie Paine