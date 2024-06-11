import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

import { ALERT, NEW_MESSAGE, NEW_MESSAGE_ALERT, REFETCH_CHATS } from "../constants/events.js";
import { emitEvent, uploadFilesToCloudinary, deletFilesFromCloudinary, cookieOptions } from "../utils/features.js";
import { getOtherMemberExceptUser } from "../lib/helper.js";
import { ErrorHandler } from "../utils/errorhandler.js";

export const adminLogin = async (req, res, next) => {
    try {
        const { secretKey } = req.body;

        const isSecretKeyMatched = secretKey === process.env.ADMIN_SECRET_KEY;

        if (!isSecretKeyMatched)
            return next(new ErrorHandler("Invalid Secret Key", 401));

        const token = jwt.sign(secretKey, process.env.JWT_SECRET);

        return res.status(200).cookie("chat-admin-token", token, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        }).json({
            success: true,
            message: "Authenticated Successfully, Welcome Admin",
        });
    } catch (error) {
        next(error);
    }
};

export const adminLogout = async (req, res, next) => {
    try {
        return res.status(200).cookie("chat-admin-token", "", {
            ...cookieOptions,
            maxAge: 0,
        }).json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (error) {
        next(error);
    }
};

export const getAdminData = async (req, res, next) => {
    try {
        res.status(200).json({
            admin: true,
        });
    } catch (error) {
        next(error);
    }
};

export const allUsers = async (req, res, next) => {
    try {
        const users = await User.find({});

        const updatedUsers = await Promise.all(
            users.map(async ({ _id, name, username, avatar }) => {
                const [groups, friends] = await Promise.all([
                    Chat.countDocuments({ groupChat: true, members: _id }),
                    Chat.countDocuments({ groupChat: false, members: _id }),
                ]);

                return {
                    name, username, avatar: avatar.url,
                    _id, groups, friends,
                };
            })
        );

        return res.status(200).json({
            status: "success",
            users: updatedUsers,
        });

    } catch (error) {
        next(error);
    }
};

export const allChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({})
            .populate("members", "name avatar")
            .populate("creator", "name avatar");

        const updatedChats = await Promise.all(
            chats.map(async ({ _id, name, groupChat, creator, members }) => {
                const totalMessages = await Message.countDocuments({ chat: _id });

                return {
                    _id, name, groupChat,
                    avatar: members.slice(0, 3).map(member => member.avatar.url),
                    members: members.map(({ _id, name, avatar }) => ({
                        _id, name, avatar: avatar.url,
                    })
                    ),
                    creator: {
                        name: creator?.name || "None",
                        avatar: creator?.avatar.url || "",
                    },
                    totalMembers: members.length,
                    totalMessages,
                };
            })
        );

        return res.status(200).json({
            success: true,
            chats: updatedChats,
        });

    } catch (error) {
        next(error);
    }
};

export const allMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({})
            .populate("sender", "name avatar")
            .populate("chat", "groupChat");

        const updatedMessages = messages.map(({ content, attachments, _id, sender, createdAt, chat }) => ({
            _id, attachments, content,
            createdAt, chat: chat._id,
            groupChat: chat.groupChat,
            sender: {
                _id: sender._id,
                name: sender.name,
                avatar: sender.avatar.url,
            },
        })
        );

        return res.status(200).json({
            success: true,
            messages: updatedMessages,
        });

    } catch (error) {
        next(error);
    }
};

export const getDashboardStats = async(req, res, next) => {
    try {
        const [groupsCount, usersCount, messagesCount, totalChatsCount] = await Promise.all([
            Chat.countDocuments({groupChat: true}),
            User.countDocuments(),
            Message.countDocuments(),
            Chat.countDocuments(),
        ]);

        const today = new Date();

        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const last7DaysMessages = await Message.find({
            createdAt: {
                $gte: last7Days,
                $lte: today,
            },
        }).select("createdAt");

        const messages = new Array(7).fill(0);
        const dayInMilliseconds = 1000 * 60 * 60 * 24;

        last7DaysMessages.forEach((message) => {
            const indexApprox = (today.getTime() - message.createdAt.getTime())/dayInMilliseconds;
            const index = Math.floor(indexApprox);

            messages[6-index]++;
        });

        const stats = {
            groupsCount,
            usersCount, messagesCount,
            totalChatsCount, messagesChart: messages,
        };

        return res.status(200).json({
            success: true,
            stats,
        });

    } catch (error) {
       next(error); 
    }
};