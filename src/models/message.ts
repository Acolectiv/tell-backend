import { Schema, model, SchemaTypes } from "mongoose";

const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User", default: null }],
    timestamp: { type: Date, default: Date.now() },
    message: { type: String, required: true },
    reactions: [{
        type: String,
        sentBy: { type: Schema.Types.ObjectId, ref: "User" },
        reaction: String
    }]
});

model("Message", MessageSchema);