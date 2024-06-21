import { Message } from "../models/message.model.js";
import { faker, simpleFaker } from "@faker-js/faker";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";

export const createMessages = async(numMessages) => {
    try {
        const users = await User.find().select("_id");
        const chats = await Chat.find().select("_id");

        const messagesPromise = [];

        for(let i = 0; i < numMessages; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomChat = chats[Math.floor(Math.random() * chats.length)];

            messagesPromise.push(
                Message.create({
                    chat: randomChat,
                    sender: randomUser,
                    content: faker.lorem.sentence(),
                })
            );
        }

        await Promise.all(messagesPromise);
        
        console.log("Messages created", numMessages);
        process.exit();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export const createMessagesInChat = async(chatId, numMessages) => {
    try {
        const users = await User.find().select("_id");

        const messagesPromise = [];

        for(let i = 0; i < numMessages; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];

            messagesPromise.push(
                Message.create({
                    chat: chatId,
                    sender: randomUser,
                    content: faker.lorem.sentence(),
                })
            );
        }

        await Promise.all(messagesPromise);
        
        console.log("Messages created", numMessages);
        process.exit();

    } catch (error) {
        console.log(error);
        process.exit(1);
        
    }
};