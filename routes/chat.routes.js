import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { attachmentsMulter } from "../middlewares/multer.js";
import { newGroupChat, getMyChats, getMyGroups, addMembers, removeMember, leaveGroup, sendAttachments, renameGroup, getChatDetails, deleteChat, getMessages } from '../controllers/chat.controllers.js';
import { addMembersValidator, chatIdValidator, newGroupValidator, removeMemberValidator, renameGroupValidator, sendAttachmentsValidator, validationHandler } from "../lib/validator.js";

const router = express.Router();

// Authentcation middleware
router.use(isAuthenticated);


router.post("/new", newGroupValidator(), validationHandler, newGroupChat);
router.get("/my", getMyChats);
router.get("/my/groups", getMyGroups);

router.put("/addmembers", addMembersValidator(), validationHandler, addMembers);
router.put("/removemember", removeMemberValidator(), validationHandler, removeMember);

router.delete("/leave/:id", chatIdValidator(), validationHandler, leaveGroup);

// Send attachments
router.post("/message", attachmentsMulter, sendAttachmentsValidator(), validationHandler, sendAttachments);

// Get messages
router.get("/message/:id", chatIdValidator(), validationHandler, getMessages);

// Get Chat Details, rename, delelte
router.route("/:id")
    .put(renameGroupValidator(), validationHandler, renameGroup)
    .get(chatIdValidator(), validationHandler, getChatDetails)
    .delete(chatIdValidator(), validationHandler, deleteChat);


export default router;
