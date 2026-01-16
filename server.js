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
            content: "You are a helpful assistant. Answer queries as usual. But just to test, If you get a user message as 'Hi Hari', then just say, 'All is well' "
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: userMessage
              }
            ]
          }
        ]
      })
    });


    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));

const reply =
  data.output_text ||
  data.output?.[0]?.content?.[0]?.text ||
  "No response";

res.json({ reply });  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
