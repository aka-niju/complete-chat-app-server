import express from "express";
import { userLogin, userLogout, userSignup, getMyProfile, searchUser, sendFriendRequest, acceptFriendRequest, getMyNotifications, getMyFriends } from "../controllers/user.controllers.js";
import {isAuthenticated} from '../middlewares/auth.js' 
import {singleAvatar} from "../middlewares/multer.js"
import { acceptRequestValidator, loginValidator, sendRequestValidator, signupValidator, validationHandler } from "../lib/validator.js";

const router = express.Router();

router.post("/new", singleAvatar, signupValidator(), validationHandler, userSignup);
router.post("/login", loginValidator(),validationHandler, userLogin);

// Authentication middleware
router.use(isAuthenticated);

router.get("/logout", userLogout);
router.get("/me", getMyProfile);

router.get("/search", searchUser);
router.put("/sendrequest", sendRequestValidator(), validationHandler, sendFriendRequest);
router.put("/acceptrequest", acceptRequestValidator(), validationHandler, acceptFriendRequest);

router.get("/notifications", getMyNotifications);
router.get("/friends", getMyFriends);


export default router;
