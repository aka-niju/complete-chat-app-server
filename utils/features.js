import jwt from 'jsonwebtoken';

import {v2 as cloudinary} from 'cloudinary';
import {v4 as uuid} from 'uuid';
import {getSockets, getBase64} from '../lib/helper.js';

export const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
};

export const generateTokenAndSendCookie = (res, user, message, statusCode) => {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    return res.status(statusCode).cookie("chat-token", token, cookieOptions).json({
        success: true,
        message,
        user,
    });
};

export const emitEvent = (req, event, users, data) => {
    const io = req.app.get("io");
    const usersSocket = getSockets(users);
    io.to(usersSocket).emit(event, data);
};

export const uploadFilesToCloudinary = async (files = []) => {

    const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                getBase64(file),
                {
                    resource_type: "auto",
                    public_id: uuid(),
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
        });
    });

    try {
        const results = await Promise.all(uploadPromises);

        const formattedResults = results.map((result) => ({
            public_id: result.public_id,
            url: result.secure_url,
        }));
        return formattedResults;
    } catch (err) {
        throw new Error("Error uploading files to cloudinary", err);
    }
};


export const deletFilesFromCloudinary = async (public_ids) => {
    console.log("files deleted from cloudinary")
    await cloudinary.v2.api.delete_resources(public_ids, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            console.log(result);
        }
    });
};