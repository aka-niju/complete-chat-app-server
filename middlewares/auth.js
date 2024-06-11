import jwt from 'jsonwebtoken';
import {ErrorHandler} from "../utils/errorhandler.js"

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies["chat-token"];

        if (!token) return next(new ErrorHandler("Please login to access this route", 401));

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decodedData._id;
        next();

    } catch (error) {
        next(error)
    }
};

export const adminOnly = async(req, res, next) => {
    try {
        const adminToken = req.cookies["chat-admin-token"];

        if (!adminToken) return next(new ErrorHandler("Only admin can access this route", 401));

        const secretKey = jwt.verify(adminToken, process.env.JWT_SECRET);

        const isSecretKeyMatched = secretKey === process.env.ADMIN_SECRET_KEY;

        if (!isSecretKeyMatched) return next(new ErrorHandler("Only admin can access this route", 401));

        next();
    } catch (error) {
        next(error);
    }
};

