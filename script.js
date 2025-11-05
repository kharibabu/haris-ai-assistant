const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatLog = document.getElementById('chat-log');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (userMessage === '') return;

  appendMessage('user', userMessage);
  input.value = '';

  // Temporary mock assistant reply
  setTimeout(() => {
    appendMessage('assistant', `You said: "${userMessage}"`);
  }, 600);
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
}
