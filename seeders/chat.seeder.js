import { faker, simpleFaker } from "@faker-js/faker";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";

export const createSingleChats = async (numChats) => {
    try {
        const users = await User.find().select("_id");

        const chatsPromise = [];

        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                chatsPromise.push(
                    Chat.create({
                        name: faker.lorem.words(2),
                        members: [users[i], users[j]],
                    })
                );
            }
        }

        await Promise.all(chatsPromise);

        console.log("Chats created successfully");
        process.exit(1);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

export const createGroupChats = async (numChats) => {
    try {
        const users = await User.find().select("_id");

        const chatsPromise = [];

        for (let i = 0; i < numChats; i++) {
            const numMembers = simpleFaker.number.int({ min: 3, max: users.length });
            const members = [];

            for (let i = 0; i < numMembers; i++) {
                const randomIndex = Math.floor(Math.random() * users.length);
                const randomUser = users[randomIndex];

                if(!members.includes(randomUser)){
                    members.push(randomUser);
                }
            }

            const chat = Chat.create({
                name: faker.lorem.words(1),
                members,
                groupChat: true,
                creator: members[0],
            });

            chatsPromise.push(chat);
        }

        await Promise.all(chatsPromise);

        console.log("Group chats created successfully");
        process.exit(1);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};