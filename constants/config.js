export const corsOptions = {
    origin: [
        process.env.CLIENT_URL,
        // "https://complete-chat-app-server-demo.onrender.com"
        "http://localhost:5173",
        "http://localhost:4173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

export const CHAT_TOKEN = "chat-token";