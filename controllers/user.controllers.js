import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Chat } from "../models/chat.model.js";
import { Request } from "../models/request.model.js";


import { ErrorHandler } from '../utils/errorhandler.js';
import { cookieOptions, emitEvent, generateTokenAndSendCookie, uploadFilesToCloudinary } from "../utils/features.js"
import { NEW_REQUEST, REFETCH_CHATS } from '../constants/events.js';
import { getOtherMemberExceptUser } from '../lib/helper.js';

export const userSignup = async (req, res, next) => {
    try {
        const { name, username, password, bio } = req.body;

        const avatar = {
            public_id: 'avatar',
            url: "abcd",
        };

        // const file = req.file;
        // if(!file) return next(new ErrorHandler("Please Upload Avatar"));

        // const result = await uploadFilesToCloudinary([file]);

        // const avatar = {
        //     public_id: result[0].public_id,
        //     url: result[0].url,
        // };

        let user = await User.findOne({ username });
        if (user) return next(new ErrorHandler("User already exits", 400));

        user = await User.create({
            name,
            username,
            password,
            bio,
            avatar,
        });

        generateTokenAndSendCookie(res, user, "User created successfully", 201);

    } catch (error) {
        next(error);
    }
};

export const userLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username }).select("+password");

        if (!user) return next(new ErrorHandler("Invalid username or password", 404));

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        if (!isPasswordMatched) return next(new ErrorHandler("Invalid username or password", 404));

        generateTokenAndSendCookie(res, user, `Welcome back ${user.name}`, 200);

    } catch (error) {
        next(error);
    }
};

export const userLogout = async (req, res, next) => {
    try {
        return res.status(200).cookie("chat-token", "", { ...cookieOptions, maxAge: 0 }).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const getMyProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user);

        if (!user) return next(new ErrorHandler("User not found", 404));
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const searchUser = async (req, res, next) => {
    try {
        const { name = "" } = req.query;

        const myChats = await Chat.find({
            groupChat: false, members: req.user,
        });

        const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

        const allUsersExceptMeAndFriends = await User.find({
            _id: { $nin: allUsersFromMyChats },
            name: { $regex: name, $options: "i" },
        });

        const updatedUsers = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
            _id, name, avatar: avatar.url,
        }));

        return res.status(200).json({
            success: true,
            users: updatedUsers,
        });

    } catch (error) {
        next(error);
    }
};

export const sendFriendRequest = async (req, res, next) => {
    try {
        const { userId } = req.body;

        const request = await Request.findOne({
            $or: [
                { sender: req.user, receiver: userId },
                { sender: userId, receiver: req.user },
            ],
        });

        if (request) return next(new ErrorHandler("Request already sent", 400));

        await Request.create({
            sender: req.user,
            receiver: userId,
        });

        emitEvent(req, NEW_REQUEST, [userId]);

        return res.status(200).json({
            success: true,
            message: "Friend Request Sent",
        });

    } catch (error) {
        next(error);
    }
};

export const acceptFriendRequest = async (req, res, next) => {
    try {
        const { requestId, accept } = req.body;

        const request = await Request.findById(requestId).populate("sender", "name").populate("receiver", "name");

        if (!request) return next(new ErrorHandler("Request not found", 404));

        if (request.receiver._id.toString() !== req.user.toString())
            return next(new ErrorHandler("You are not authorized to accept this request", 401));

        if (!accept) {
            await request.deleteOne();

            return res.status(200).json({
                success: true,
                message: "Friend Request Rejected",
            });
        }

        const members = [request.sender._id, request.receiver._id];

        await Promise.all([
            Chat.create({
                members,
                name: `${request.sender.name}-${request.receiver.name}`,
            }),
            request.deletOne(),
        ]);

        emitEvent(req, REFETCH_CHATS, members);

        return res.status(200).json({
            success: true,
            message: "Friend Request Accepted",
            senderId: request.sender._id,
        });

    } catch (error) {
        next(error);
    }
};

export const getMyNotifications = async (req, res, next) => {
    try {
        const requests = await Request.find({ receiver: req.user }).populate("sender", "name avatar");

        const allRequests = requests.map(({ _id, sender }) => ({
            _id,
            sender: {
                _id: sender._id,
                name: sender.name,
                avatar: sender.avatar.url,
            },
        }));

        return res.status(200).json({
            success: true,
            allRequests,
        });

    } catch (error) {
        next(error);
    }

};

export const getMyFriends = async (req, res, next) => {
    try {
        const chatId = req.query.chatId;

        const chats = await Chat.find({
            members: req.user,
            groupChat: false,
        }).populate("members", "name avatar");

        const friends = chats.map(({ members }) => {
            const otherUser = getOtherMemberExceptUser(members, req.user);

            return {
                _id: otherUser._id,
                name: otherUser.name,
                avatar: otherUser.avatar.url,
            };
        });

        if (chatId) {
            const chat = await Chat.findById(chatId);

            const availableFriends = friends.filter((friend) => !chat.members.includes(friend._id));

            return res.status(200).json({
                success: true,
                friends: availableFriends,
            });
        } else {
            return res.status(200).json({
                success: true,
                friends,
            });
        }

    } catch (error) {
        next(error);
    }
};

