require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ======================
// Gemini AI Setup
// ======================
const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ======================
// MongoDB Connection
// ======================
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI missing in .env");
} else {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("✅ MongoDB Connected"))
        .catch(err => console.log("❌ MongoDB Error:", err));
}

// ======================
// Schema & Model
// ======================
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);

// ======================
// Routes
// ======================

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Contact API
app.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newMessage = new Contact({ name, email, message });
        await newMessage.save();

        res.json({
            success: true,
            message: "Message saved successfully"
        });

    } catch (err) {
        console.error("Contact Error:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// AI Chat API
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ reply: "No message received" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite"
        });

 const prompt = `
You are an intelligent, friendly, and slightly conversational AI assistant for Debtirtho's personal portfolio website.

ABOUT DEBTIRTHO:
- Name: Debtirtho Ghosh
- Education: BCA student
- Skills: Full-stack development (HTML, CSS, JavaScript, Node.js, Express, MongoDB), basic cybersecurity
- Interests: Building real-world projects, AI integration, web apps
- Personality: Curious, hardworking, always learning, tech enthusiast

CONTACT INFO:
- Email: debtirthoghosh@gmail.com

YOUR BEHAVIOR:
- Answer ANY question (not just about the portfolio)
- If asked about Debtirtho, answer confidently and clearly
- If asked for contact, ALWAYS provide the correct email above
- Be friendly, human-like, and slightly casual (not robotic)
- Keep answers short unless user asks for detail
- If question is unrelated, still answer like a normal AI (like ChatGPT)
- You can explain, guide, and help with coding, career, or general topics

STYLE:
- Talk like a smart friend (not too formal)
- Avoid saying "I am just an AI"
- Be helpful and engaging

User question:
${message}
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        res.json({ reply: text });
    } catch (err) {
        console.error("🤖 AI Error:", err);
        res.status(500).json({
            reply: "AI is currently unavailable. Try again later."
        });
    }
});

// ======================
// ✅ IMPORTANT FIX (Express 5)
// Catch-all route (prevents "Not Found")
// ======================
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server successfully running at: http://localhost:${PORT}`));