from fastapi import FastAPI, HTTPException, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
from groq import Groq
import json

# Initialize the FastAPI app
app = FastAPI(title="Groq Chat API", description="Chat with Groq Assistant via FastAPI")
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize Groq client with your API key
client = Groq(api_key="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")
conversation_history = []  # Maintain the chat history

class ChatRequest(BaseModel):
    user_input: str

class ChatResponse(BaseModel):
    assistant_response: str


@app.post("/chat", response_model=ChatResponse)
async def chat_with_groq(request: ChatRequest):
    """
    Endpoint to interact with the Groq chatbot.
    """
    global conversation_history

    try:
        # Prepare user message
        user_message = {
            "role": "user",
            "content": request.user_input
        }
        conversation_history.append(user_message)

        # Send the conversation history to the Groq model
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=conversation_history,
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False  # Simplify debugging
        )

        # Extract assistant response from the completion object
        assistant_message = completion.choices[0].message.content


        # Append assistant response to the conversation history
        assistant_history = {
            "role": "assistant",
            "content": assistant_message
        }
        conversation_history.append(assistant_history)

        return ChatResponse(assistant_response=assistant_message)

    except Exception as e:
        # Log the error for debugging
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {str(e)}")


@app.get("/")
async def chat_page(request: Request):
    """
    Render the chat interface with theme support
    """
    return templates.TemplateResponse(
        "chat.html",
        {
            "request": request,
            "title": "AI Chatbot",
            "chatbot_name": "Llama Chat",
            "conversation_history": conversation_history,
            "dark_mode": True  # Default theme
        }
    )

@app.get("/chat-history")
async def get_chat_history():
    """
    Endpoint to retrieve chat history
    """
    return JSONResponse(content=conversation_history)

@app.post("/clear-history")
async def clear_history():
    """
    Endpoint to clear conversation history
    """
    global conversation_history
    conversation_history = []
    return {"message": "Conversation history cleared"}

@app.post("/toggle-theme")
async def toggle_theme(dark_mode: bool = Form(...)):
    """
    Endpoint to toggle between dark and light mode
    """
    return {"dark_mode": dark_mode}

# Error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": str(exc.detail)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    print(f"Unexpected error: {str(exc)}")  # For debugging
    return JSONResponse(
        status_code=500,
        content={"error": "An unexpected error occurred"}
    )
