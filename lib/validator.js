import { body, param, validationResult } from 'express-validator';
import { ErrorHandler } from '../utils/errorhandler.js';

export const validationHandler = (req, res, next) => {
    const errors = validationResult(req);

    const errrorMessages = errors.array().map(error => error.msg).join(", ");

    if (errors.isEmpty()) return next();
    else next(new ErrorHandler(errrorMessages, 400));
};

export const signupValidator = () => [
    body("name", "Please Enter Name").notEmpty(),
    body("username", "Please Enter Username").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),
];

export const loginValidator = () => [
    body("username", "Please Enter Username").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),
];

export const sendRequestValidator = () => [
    body("userId", "Please Enter User ID").notEmpty(),
];

export const acceptRequestValidator = () => [
    body("requestId", "Please Enter Request ID").notEmpty(),
    body("accept")
        .notEmpty()
        .withMessage("Please Add Accept")
        .isBoolean()
        .withMessage("Accept must be a boolean"),
];

export const newGroupValidator = () => [
    body("name", "Please Enter Name").notEmpty(),
    body("members")
        .notEmpty()
        .withMessage("Please Enter Members")
        .isArray({ min: 2, max: 100 })
        .withMessage("Members must be 2-100"),
];

export const addMembersValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("members")
        .notEmpty()
        .withMessage("Please Enter Members")
        .isArray({ min: 1, max: 97 })
        .withMessage("Members must be 1-97"),
];

export const removeMemberValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("userId", "Please Enter User ID").notEmpty(),
];

export const sendAttachmentsValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
];

export const chatIdValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
]

export const renameGroupValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
    body("name", "Please Enter New Name").notEmpty(),
];

export const adminLoginValidator = () => [
    body("secretKey", "Please Enter Secret Key").notEmpty(),
];