from groq import Groq

def chat_with_groq():
    print("Welcome to the Groq Chat Assistant! (Type 'exit' to quit)")

    client = Groq()  # Initialize Groq client
    conversation_history = []

    while True:
        # Take user input from the terminal
        user_input = input("\nYou: ")

        # Exit condition
        if user_input.lower() == "exit":
            print("Exiting... Goodbye!")
            break
        
        # Append user input to the conversation history
        conversation_history.append({"role": "user", "content": user_input})

        try:
            # Send the conversation history to the Groq model
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=conversation_history,
                temperature=1,
                max_tokens=1024,
                top_p=1,
                stream=True,
                stop=None,
            )

            # Initialize an empty string to hold the full response
            assistant_message = ""

            # Process and collect the response chunks
            for chunk in completion:
                # Append each chunk of the response to the assistant_message
                assistant_message += chunk.choices[0].delta.content or ""
            
            # After collecting the full response, print it once
            print(f"Groq: {assistant_message}")
            
            # Append assistant response to the conversation history
            conversation_history.append({"role": "assistant", "content": assistant_message})
        
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    chat_with_groq()
