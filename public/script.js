const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatLog = document.getElementById("chat-log");


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";

  // Show temporary thinking message
  const thinkingMsg = appendMessage("assistant", "Thinking...");

  try {
    const res = await fetch("api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await res.json();

    // Replace "Thinking..." with real reply
    thinkingMsg.textContent = data.reply;
  } catch (err) {
    thinkingMsg.textContent = "⚠️ Error talking to AI server.";
    console.error(err);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
  return msg;
}

const clearButton = document.getElementById("clear-chat");
clearButton.addEventListener("click", clearChat);

async function clearChat() {
  chatLog.innerHTML = "";

  await fetch("/api/clear", {
    method: "POST"
  });
}
