from typing import List, Dict
import re
from transformers import pipeline

class AIProcessor:
    def __init__(self):
        # Initialize models
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        self.qa_model = pipeline("question-answering", model="deepset/roberta-base-squad2")
        
    def generate_summary(self, text: str, max_length: int = 130, min_length: int = 30) -> str:
        """Generate a summary of the given text"""
        try:
            # Split text into chunks if it's too long
            chunks = self._split_text(text, max_length=1024)
            summaries = []
            
            for chunk in chunks:
                summary = self.summarizer(chunk, max_length=max_length, min_length=min_length, do_sample=False)
                summaries.append(summary[0]["summary_text"])
            
            return " ".join(summaries)
        except Exception as e:
            raise Exception(f"Error generating summary: {str(e)}")

    def generate_flashcards(self, text: str, num_cards: int = 5) -> List[Dict[str, str]]:
        """Generate flashcards from text"""
        try:
            # Split text into sections
            sections = self._split_text(text, max_length=512)
            cards = []
            
            for section in sections[:num_cards]:
                # Generate a question from the section
                question = self.qa_model(
                    question="What is the main concept discussed in this text?",
                    context=section
                )
                
                # Use the answer as the basis for a flashcard
                cards.append({
                    "question": f"Explain the concept of {question['answer']}",
                    "answer": section
                })
            
            return cards
        except Exception as e:
            raise Exception(f"Error generating flashcards: {str(e)}")

    def generate_quiz(self, text: str, num_questions: int = 5) -> List[Dict]:
        """Generate quiz questions from text"""
        try:
            # Split text into sections
            sections = self._split_text(text, max_length=512)
            questions = []
            
            for section in sections[:num_questions]:
                # Generate a question from the section
                qa_result = self.qa_model(
                    question="What is a key fact from this text?",
                    context=section
                )
                
                # Create a multiple choice question
                question = {
                    "question": f"What is {qa_result['answer']}?",
                    "options": [
                        section,  # Correct answer
                        f"Not {section}",  # Simple incorrect option
                        "None of the above",  # Standard option
                        "All of the above"  # Standard option
                    ],
                    "correct_answer": 0  # Index of correct answer
                }
                
                questions.append(question)
            
            return questions
        except Exception as e:
            raise Exception(f"Error generating quiz: {str(e)}")

    def answer_question(self, context: str, question: str) -> str:
        """Answer a specific question about the text"""
        try:
            # Split context if it's too long
            contexts = self._split_text(context, max_length=512)
            best_answer = {"score": 0, "answer": ""}
            
            # Find the best answer across all context chunks
            for ctx in contexts:
                result = self.qa_model(question=question, context=ctx)
                if result["score"] > best_answer["score"]:
                    best_answer = result
            
            return best_answer["answer"]
        except Exception as e:
            raise Exception(f"Error answering question: {str(e)}")

    def _split_text(self, text: str, max_length: int = 1024) -> List[str]:
        """Split text into chunks of maximum length"""
        # Split text into sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence_length = len(sentence.split())
            if current_length + sentence_length > max_length:
                # Save current chunk and start a new one
                if current_chunk:
                    chunks.append(" ".join(current_chunk))
                current_chunk = [sentence]
                current_length = sentence_length
            else:
                current_chunk.append(sentence)
                current_length += sentence_length
        
        # Add the last chunk if it exists
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks 