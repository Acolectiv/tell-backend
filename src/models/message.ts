import { Schema, model, SchemaTypes } from "mongoose";

import IMessage from "../interfaces/IMessage";

const MessageSchema = new Schema<IMessage>({
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User", default: null }],
    timestamp: { type: Date, default: Date.now() },
    message: { type: String, required: true },
    reactions: [{
        type: String,
        sentBy: { type: Schema.Types.ObjectId, ref: "User" },
        reaction: String
    }],
    mentions: [{ type: Schema.Types.ObjectId, ref: "User", default: null }],
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" }
});

model<IMessage>("Message", MessageSchema);