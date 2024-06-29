import mongoose from "mongoose";

export const connectToDB = (uri) => {
    mongoose.connect(uri, {dbName: "complete-chat-app"})
    .then((data) => console.log(`MongoDB connected at ${data.connection.host}`))
    .catch((error)=> {
        throw error;
    });
};

