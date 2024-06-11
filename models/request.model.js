import mongoose, {Schema, Types, model} from "mongoose";

const requestSchema = new Schema({
    sender: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
}, 
{
    timestamps: true,
});

export const Request = mongoose.models.Request ||  model("Request", requestSchema);