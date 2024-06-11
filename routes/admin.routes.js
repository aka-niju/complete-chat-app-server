import express from 'express';
import { adminLogin, adminLogout, allChats, allMessages, allUsers, getAdminData, getDashboardStats } from '../controllers/admin.controllers.js';
import { adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.post("/verify", adminLogin);
router.get("/logout", adminLogout);

// Authentication Middleware
router.use(adminOnly);

router.get("/", getAdminData);
router.get("/users", allUsers);
router.get("/chats", allChats);
router.get("/messages", allMessages);

router.get("/stats", getDashboardStats);
export default router;