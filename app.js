import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { connectToDB } from './utils/connectToDB.js';
import userRoute from './routes/user.routes.js';
import chatRoute from './routes/chat.routes.js';
import adminRoute from './routes/admin.routes.js';
import { errorMiddleware } from './middlewares/error.js';
import {createUsers} from './seeders/user.seeder.js';

dotenv.config({
  path: './.env',
});

// Variables
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const envMode = process.env.NODE_ENV || "PRODUCTION";
const adminSecretKey = process.env.ADMIN_SECRET_KEY;

// Connecting database
connectToDB(mongoURI);
// createUsers(10);

// Applications and servers
const app = express();


// Middlewares
app.use(express.json());
app.use(cookieParser());

// Dynamic routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);

// Static route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Socket io functionality will come here


app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


export {envMode, adminSecretKey}
