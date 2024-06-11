import express from 'express';
import {isAuthenticated} from '../middlewares/auth.js';
import {attachmentsMulter} from "../middlewares/multer.js";
import {newGroupChat, getMyChats, getMyGroups, addMembers, removeMember, leaveGroup, sendAttachments, renameGroup, getChatDetails, deleteChat, getMessages} from '../controllers/chat.controllers.js';

const router = express.Router();

// Authentcation middleware
router.use(isAuthenticated);


router.post("/new", newGroupChat);
router.get("/my", getMyChats);
router.get("/my/groups", getMyGroups);

router.put("/addmembers", addMembers);
router.put("/removemember", removeMember);

router.delete("/leave/:id", leaveGroup);

// Send attachments
router.post("/message", attachmentsMulter , sendAttachments);

// Get messages
router.get("/message/:id", getMessages);

// Get Chat Details, rename, delelte
router.route("/:id").put(renameGroup)
.get(getChatDetails)
.delete(deleteChat);


export default router;
