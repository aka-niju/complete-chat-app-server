export const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://localhost:4173",
        process.env.CLIENT_URL, 
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};

export const CHAT_TOKEN = "chat-token";