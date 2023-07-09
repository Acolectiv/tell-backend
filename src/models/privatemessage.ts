import { Schema, model, SchemaTypes } from "mongoose";

import IPrivateMessage from "../interfaces/IPrivateMessage";

const PrivateMessageSchema = new Schema<IPrivateMessage>({
    sender: { type: SchemaTypes.ObjectId, ref: "User" },
    receiver: { type: SchemaTypes.ObjectId, ref: "User" },
    message: { type: SchemaTypes.ObjectId, ref: "Message" },
    reactions: [{
        type: String,
        sentBy: { type: Schema.Types.ObjectId, ref: "User" },
        reaction: String
    }],
    mentions: [{ type: Schema.Types.ObjectId, ref: "User", default: null }],
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    lastAccesedAt: Number,
    archived: { type: Boolean, default: false },
    archivedAt: { type: Number, default: null }
});

model<IPrivateMessage>("PrivateMessage", PrivateMessageSchema);