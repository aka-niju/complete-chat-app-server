import express from "express";
import { userLogin, userLogout, userSignup, getMyProfile } from "../controllers/user.controllers.js";
import {isAuthenticated} from '../middlewares/auth.js' 
import {singleAvatar} from "../middlewares/multer.js"

const router = express.Router();

router.post("/new", singleAvatar, userSignup);
router.post("/login", userLogin);

// Authentication middleware
router.use(isAuthenticated);

router.get("/logout", userLogout);
router.get("/me", getMyProfile);
/*

router.get("/search", searchUser);
router.put("/sendrequest", sendFriendRequest);
router.put("/acceptrequest", acceptFriendRequest);

router.get("/notifications", getMyNotifications);
router.get("/friends", getMyFriends);

*/

export default router;
