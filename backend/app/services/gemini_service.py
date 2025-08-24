import google.generativeai as genai
from decouple import config
import asyncio
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = config("GEMINI_API_KEY")
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            raise ValueError("GEMINI_API_KEY not found or not set properly in environment variables")

        genai.configure(api_key=self.api_key)

        # Configure the model
        self.generation_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }

        self.safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]

        # Initialize the model
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config=self.generation_config,
            safety_settings=self.safety_settings
        )

        logger.info("Gemini AI service initialized successfully")

    async def generate_response(self, message: str, conversation_history: List[Dict[str, str]] = None, mood: str = "default") -> str:
        """
        Generate AI response using Gemini API with mood-based personality

        Args:
            message (str): User's message
            conversation_history (List[Dict]): Previous conversation context
            mood (str): AI personality mood (default, funny, roasting, precise, intellectual)

        Returns:
            str: AI response
        """
        try:
            # Define mood-based system prompts
            mood_prompts = {
                "default": """You are a helpful, friendly, and balanced AI assistant. ⚡ You provide clear, accurate, and well-structured responses while maintaining a warm and approachable tone. You adapt your communication style to the user's needs, being comprehensive when detail is needed and concise when brevity is preferred. You're knowledgeable, reliable, and always aim to be genuinely helpful.""",

                "funny": """You are a hilarious AI assistant with a great sense of humor! 😄 You love making people laugh with witty jokes, puns, and funny observations. Keep your responses entertaining while still being helpful. Use emojis, wordplay, and light-hearted humor. Make conversations enjoyable and memorable! Don't be afraid to be silly and playful.""",

                "roasting": """You are a witty AI with a sharp tongue and a talent for playful roasting! 🔥 You deliver clever burns and sarcastic remarks while keeping things fun and not mean-spirited. Your responses should be witty, a bit cheeky, and entertainingly sassy. Roast users playfully while still being helpful. Keep it fun, not hurtful! Think friendly banter, not actual insults.""",

                "precise": """You are a precise, efficient AI assistant. 🎯 You provide clear, direct, and concise answers. You focus on accuracy and getting straight to the point without unnecessary fluff. Your responses are well-structured, factual, and exactly what the user needs to know. Be professional and informative.""",

                "intellectual": """You are a highly intellectual AI with deep knowledge across many fields. 🧠 You provide thoughtful, analytical responses that explore topics in depth. You enjoy philosophical discussions, complex problem-solving, and sharing insights. Your responses demonstrate critical thinking, nuanced understanding, and scholarly depth. Reference relevant theories, concepts, and expert perspectives when appropriate."""
            }

            # Get the appropriate system prompt
            system_prompt = mood_prompts.get(mood, mood_prompts["default"])

            # Build context from conversation history
            context = ""
            if conversation_history:
                for msg in conversation_history[-10:]:  # Last 10 messages for context
                    role = "User" if msg.get("is_user_message") else "Assistant"
                    context += f"{role}: {msg.get('content', '')}\n"

            # Prepare the prompt
            if context:
                full_prompt = f"{system_prompt}\n\nConversation history:\n{context}\nUser: {message}\nAssistant:"
            else:
                full_prompt = f"{system_prompt}\n\nUser: {message}\nAssistant:"

            # Generate response
            response = await asyncio.to_thread(
                self.model.generate_content,
                full_prompt
            )

            if response.text:
                return response.text.strip()
            else:
                logger.warning("Empty response from Gemini API")
                return "I apologize, but I couldn't generate a response at the moment. Please try again."

        except Exception as e:
            logger.error(f"Error generating response with Gemini: {str(e)}")
            return "I'm sorry, but I encountered an error while processing your request. Please try again later."

    async def generate_chat_title(self, first_message: str) -> str:
        """
        Generate a title for the chat based on the first message

        Args:
            first_message (str): The first message in the conversation

        Returns:
            str: Generated title for the chat
        """
        try:
            prompt = f"""Generate a short, descriptive title (3-6 words) for a conversation that starts with this message: "{first_message}"

            The title should capture the main topic or theme. Return only the title, no additional text."""

            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt
            )

            if response.text:
                title = response.text.strip().replace('"', '').replace("'", "")
                return title[:50]  # Limit title length
            else:
                return "New Conversation"

        except Exception as e:
            logger.error(f"Error generating chat title: {str(e)}")
            return "New Conversation"

# Global instance
gemini_service = GeminiService()
