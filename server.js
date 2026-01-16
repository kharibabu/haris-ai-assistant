import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import session  from "express-session";


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(
    session({
      secret: "haris-ai-assistant-secret", // change later
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true
      }
    })
);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Initialize session memory if missing
    if (!req.session.conversationHistory) {
      req.session.conversationHistory = [];
    }

    // Add user message
    req.session.conversationHistory.push({
      role: "user",
      content: [
        {
          type: "input_text",
          text: userMessage
        }
      ]
    });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: process.env.SYSTEM_PROMPT_TEXT
              }
            ]
          },
          ...req.session.conversationHistory
        ]
      })
    });

    const data = await response.json();

    // Extract assistant reply
    let reply = "No response";
    if (data.output_text) {
      reply = data.output_text;
    } else if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === "message" && Array.isArray(item.content)) {
          for (const content of item.content) {
            if (content.type === "output_text" && content.text) {
              reply = content.text;
              break;
            }
          }
        }
      }
    }

    // Save assistant reply
    req.session.conversationHistory.push({
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: reply
        }
      ]
    });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.post("/api/clear", (req, res) => {
  req.session.conversationHistory = [];
  res.json({ status: "cleared" });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
