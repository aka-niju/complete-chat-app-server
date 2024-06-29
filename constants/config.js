export const corsOptions = {
    origin: [
        "https://complete-chat-app-server-demo.onrender.com",
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:4173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

export const CHAT_TOKEN = "chat-token";