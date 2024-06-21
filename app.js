import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import {v2 as cloudinary} from 'cloudinary';
import cors from 'cors';
import {v4 as uuid} from 'uuid';

import { connectToDB } from './utils/connectToDB.js';
import { errorMiddleware } from './middlewares/error.js';
import { ONLINE_USERS } from './constants/events.js';
import {corsOptions} from './constants/config.js';
import {createUsers} from './seeders/user.seeder.js';
import {createSingleChats, createGroupChats} from './seeders/chat.seeder.js';
import {createMessages, createMessagesInChat} from './seeders/message.seeder.js';

import userRoute from './routes/user.routes.js';
import chatRoute from './routes/chat.routes.js';
import adminRoute from './routes/admin.routes.js';

dotenv.config({
  path: './.env',
});

// Variables
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
const adminSecretKey = process.env.ADMIN_SECRET_KEY || "jfjkldfklsklfkladsjfdsjfkld";
const userSocketIDs = new Map();
const onlineUsers = new Set();

// Connecting database
connectToDB(mongoURI);
// createUsers(10);
// createSingleChats(10);
// createGroupChats(10);
// createMessagesInChat("6661656ffb4b29eb05765e06", 20);

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Applications and servers
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

app.set ("io", io);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Dynamic routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);

// Static route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Socket io functionality will come here
io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

io.on("connection", (socket) => {
  const user = socket.user;
  userSocketIDs.set(user._id.toString(), socket.id);
  console.log("a new user connected");


  socket.on("disconnect", () => {
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
  });

});


app.use(errorMiddleware);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port} in ${envMode} mode`);
});


export {envMode, adminSecretKey, userSocketIDs}