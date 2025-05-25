from typing import List, Dict, Optional, TypedDict, Literal
import re
import httpx
import json
from fastapi import HTTPException
from pydantic import BaseModel, Field

class Message(TypedDict):
    role: Literal["system", "user", "assistant"]
    content: str

class OpenRouterResponse(BaseModel):
    choices: List[Dict[str, Dict[str, str]]]

class FlashCard(BaseModel):
    question: str
    answer: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int

class AIProcessor:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the AI processor with OpenRouter API key"""
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1"
        self.http_client = httpx.AsyncClient(timeout=30.0)  # Reuse HTTP client
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.http_client.aclose()
        
    async def _make_request(
        self,
        messages: List[Message],
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> str:
        """Make a request to OpenRouter API with proper error handling"""
        if not self.api_key:
            raise HTTPException(
                status_code=401,
                detail="OpenRouter API key is required"
            )
            
        try:
            response = await self.http_client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "HTTP-Referer": "https://study-helper.vercel.app",
                    "X-Title": "Study Helper"
                },
                json={
                    "model": "mistralai/mistral-7b-instruct",
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=30.0
            )
            
            response.raise_for_status()
            data = OpenRouterResponse.parse_obj(response.json())
            return data.choices[0]["message"]["content"]
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"OpenRouter API error: {e.response.text}"
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Error connecting to OpenRouter API: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error: {str(e)}"
            )

    async def generate_summary(self, text: str, max_length: int = 130) -> str:
        """Generate a concise summary of the given text"""
        chunks = self._split_text(text, max_length=2000)
        summaries = []
        
        for chunk in chunks:
            messages: List[Message] = [
                {
                    "role": "system",
                    "content": "You are a helpful AI that creates concise summaries."
                },
                {
                    "role": "user",
                    "content": f"Please summarize this text in about {max_length} words: {chunk}"
                }
            ]
            summary = await self._make_request(messages, temperature=0.3)
            summaries.append(summary)
        
        return " ".join(summaries)

    async def generate_flashcards(
        self,
        text: str,
        num_cards: int = 5
    ) -> List[FlashCard]:
        """Generate educational flashcards from text"""
        messages: List[Message] = [
            {
                "role": "system",
                "content": "Create educational flashcards. Return a JSON array with 'question' and 'answer' fields."
            },
            {
                "role": "user",
                "content": f"Create {num_cards} flashcards from this text. Focus on key concepts: {text}"
            }
        ]
        
        response = await self._make_request(messages, temperature=0.7)
        try:
            cards = json.loads(response)
            return [FlashCard(**card) for card in cards[:num_cards]]
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error parsing AI response: {str(e)}"
            )

    async def generate_quiz(
        self,
        text: str,
        num_questions: int = 5
    ) -> List[QuizQuestion]:
        """Generate multiple-choice quiz questions"""
        messages: List[Message] = [
            {
                "role": "system",
                "content": "Create multiple-choice questions. Return a JSON array with 'question', 'options' (4 choices), and 'correct_answer' (0-3) fields."
            },
            {
                "role": "user",
                "content": f"Create {num_questions} multiple-choice questions from: {text}"
            }
        ]
        
        response = await self._make_request(messages, temperature=0.7)
        try:
            questions = json.loads(response)
            return [QuizQuestion(**q) for q in questions[:num_questions]]
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error parsing AI response: {str(e)}"
            )

    async def answer_question(self, context: str, question: str) -> str:
        """Answer a specific question based on the context"""
        messages: List[Message] = [
            {
                "role": "system",
                "content": "You are a helpful AI that answers questions accurately based on the provided context."
            },
            {
                "role": "user",
                "content": f"Context: {context}\n\nQuestion: {question}"
            }
        ]
        
        return await self._make_request(messages, temperature=0.3)

    def _split_text(self, text: str, max_length: int = 2000) -> List[str]:
        """Split text into manageable chunks while preserving sentence boundaries"""
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        chunks: List[str] = []
        current_chunk: List[str] = []
        current_length = 0
        
        for sentence in sentences:
            sentence_length = len(sentence.split())
            if current_length + sentence_length > max_length and current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = [sentence]
                current_length = sentence_length
            else:
                current_chunk.append(sentence)
                current_length += sentence_length
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks 