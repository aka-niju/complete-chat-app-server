import mongoose from "mongoose";

const connectToDB = (uri) => {
    mongoose.connect(uri, {dbName: "full-chat-app"})
    .then((data) => console.log(`MongoDB connected at ${data.connection.host}`))
    .catch((error)=> {
        throw error;
    });
};

export {connectToDB};
