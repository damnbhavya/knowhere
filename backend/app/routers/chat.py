from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import ChatSession, Message, User
from ..schemas import (
    ChatSessionCreate,
    ChatSessionResponse,
    MessageCreate,
    MessageResponse,
    ChatResponse
)
from ..services.auth_service import get_current_user
from ..services.gemini_service import gemini_service

router = APIRouter()

@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    session_data: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new chat session"""
    chat_session = ChatSession(
        user_id=current_user.id,
        title=session_data.title
    )
    db.add(chat_session)
    db.commit()
    db.refresh(chat_session)
    return chat_session

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all chat sessions for the current user"""
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).all()
    return sessions

@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
async def get_chat_messages(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all messages for a specific chat session"""
    # Verify session belongs to user
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )

    messages = db.query(Message).filter(
        Message.chat_session_id == session_id
    ).order_by(Message.timestamp.asc()).all()

    return messages

@router.post("/sessions/{session_id}/messages", response_model=ChatResponse)
async def send_message(
    session_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message and get AI response"""
    # Verify session belongs to user
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )

    try:
        # Save user message
        user_message = Message(
            chat_session_id=session_id,
            user_id=current_user.id,
            content=message_data.content,
            is_user_message=True
        )
        db.add(user_message)
        db.commit()

        # Get conversation history for context
        previous_messages = db.query(Message).filter(
            Message.chat_session_id == session_id
        ).order_by(Message.timestamp.desc()).limit(20).all()

        # Convert to format expected by Gemini service
        conversation_history = [
            {
                "content": msg.content,
                "is_user_message": msg.is_user_message
            }
            for msg in reversed(previous_messages)
        ]

        # Generate AI response
        ai_response = await gemini_service.generate_response(
            message_data.content,
            conversation_history,
            message_data.mood or "precise"
        )

        # Save AI response
        ai_message = Message(
            chat_session_id=session_id,
            user_id=current_user.id,
            content=ai_response,
            is_user_message=False
        )
        db.add(ai_message)
        db.commit()

        # Update session timestamp
        from datetime import datetime
        session.updated_at = datetime.utcnow()
        db.commit()

        return ChatResponse(message=ai_response)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a chat session and all its messages"""
    # Verify session belongs to user
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )

    # Delete all messages in the session
    db.query(Message).filter(Message.chat_session_id == session_id).delete()

    # Delete the session
    db.delete(session)
    db.commit()

    return {"message": "Chat session deleted successfully"}

@router.post("/sessions/{session_id}/title")
async def update_session_title(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Auto-generate a title for the chat session based on first message"""
    # Verify session belongs to user
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )

    # Get first user message
    first_message = db.query(Message).filter(
        Message.chat_session_id == session_id,
        Message.is_user_message == True
    ).order_by(Message.timestamp.asc()).first()

    if not first_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No messages found in session"
        )

    try:
        # Generate title using Gemini
        new_title = await gemini_service.generate_chat_title(first_message.content)

        # Update session title
        session.title = new_title
        db.commit()

        return {"title": new_title}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate title: {str(e)}"
        )
