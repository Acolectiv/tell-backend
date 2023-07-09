import { Schema, model, SchemaTypes } from "mongoose";

import IPrivateMessage from "../interfaces/IPrivateMessage";

const PrivateMessageSchema = new Schema<IPrivateMessage>({
    sender: { type: SchemaTypes.ObjectId, ref: "User" },
    receiver: { type: SchemaTypes.ObjectId, ref: "User" },
    message: String,
    reactions: [{
        type: String,
        sentBy: { type: Schema.Types.ObjectId, ref: "User" },
        reaction: String
    }],
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" }
});

model<IPrivateMessage>("PrivateMessage", PrivateMessageSchema);