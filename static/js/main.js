// Theme handling
function toggleTheme() {
    const body = document.body;
    const themeToggleIcon = document.querySelector('.theme-toggle .material-icons');
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        // Switch to light theme
        body.removeAttribute('data-theme');
        if (themeToggleIcon) {
            themeToggleIcon.textContent = 'dark_mode';
        }
        localStorage.setItem('theme', 'light');
    } else {
        // Switch to dark theme
        body.setAttribute('data-theme', 'dark');
        if (themeToggleIcon) {
            themeToggleIcon.textContent = 'light_mode';
        }
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeToggleIcon = document.querySelector('.theme-toggle .material-icons');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggleIcon) {
            themeToggleIcon.textContent = 'light_mode';
        }
    } else {
        document.body.removeAttribute('data-theme');
        if (themeToggleIcon) {
            themeToggleIcon.textContent = 'dark_mode';
        }
    }
});


// Chat history sidebar handling
function showHistory() {
    document.getElementById('historySidebar').classList.add('active');
    loadChatHistory();
}

function hideHistory() {
    document.getElementById('historySidebar').classList.remove('active');
}

// Clear chat functionality
async function clearChat() {
    try {
        // Clear messages from UI
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = '';
        
        // Add initial bot message
        addMessageToChat('bot', 'Hello! How can I assist you today? 👋');
        
        // Clear backend chat history
        await axios.post('/clear-history');
        
        // Clear history sidebar if it's open
        const historyContent = document.getElementById('historyContent');
        if (historyContent) {
            historyContent.innerHTML = '';
        }
        
    } catch (error) {
        console.error('Error clearing chat:', error);
        addMessageToChat('bot', 'Sorry, I encountered an error while clearing the chat. Please try again.');
    }
}


// Message handling
async function sendMessage() {
    const inputElement = document.getElementById('user-input');
    const message = inputElement.value.trim();
    
    if (!message) return;

    // Disable input and show loading
    inputElement.disabled = true;
    document.getElementById('send-button').disabled = true;
    document.getElementById('loading').style.display = 'flex';

    // Add user message to chat
    addMessageToChat('user', message);
    inputElement.value = '';

    try {
        const response = await axios.post('/chat', {
            user_input: message
        });

        // Add bot response to chat
        addMessageToChat('bot', response.data.assistant_response);
        
        // Update chat history in sidebar
        loadChatHistory();
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('bot', 'Sorry, I encountered an error. Please try again.');
    } finally {
        // Re-enable input and hide loading
        inputElement.disabled = false;
        document.getElementById('send-button').disabled = false;
        document.getElementById('loading').style.display = 'none';
        inputElement.focus();
    }
}

function addMessageToChat(role, content) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function loadChatHistory() {
    try {
        const response = await axios.get('/chat-history');
        const historyContent = document.getElementById('historyContent');
        historyContent.innerHTML = '';

        // Filter and display only user messages
        response.data
            .filter(message => message.role === 'user')
            .forEach((message, index) => {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'history-item';
                
                // Add timestamp
                const timestamp = new Date().toLocaleTimeString();
                
                messageDiv.innerHTML = `
                    <span class="history-timestamp">${timestamp}</span>
                    <p class="history-text">${message.content}</p>
                `;
                
                // Add click handler to load this message into input
                messageDiv.onclick = () => {
                    document.getElementById('user-input').value = message.content;
                    hideHistory(); // Close sidebar after selection
                };
                
                historyContent.appendChild(messageDiv);
            });

        // Add "no messages" text if history is empty
        if (historyContent.children.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'history-empty';
            emptyMessage.textContent = 'No previous messages';
            historyContent.appendChild(emptyMessage);
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Enter key handling
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize input field (optional)
const input = document.getElementById('user-input');
input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Focus input on load
    document.getElementById('user-input').focus();
});