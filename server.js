import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

let conversationHistory = []

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Add user message to memory
    conversationHistory.push({
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
                text: "You are a useful assistant and answer queries as usual. Just when you get 'hari' as a promnpt just say 'good health matters'"
              }
            ]
          },
          ...conversationHistory
        ]
      })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));


    // Extract assistant reply safely
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

    // Add assistant reply to memory
    conversationHistory.push({
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
  conversationHistory = [];
  res.json({ status: "cleared" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
