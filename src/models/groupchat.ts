import { Schema, model, SchemaTypes } from "mongoose";

import IGroupChat from "../interfaces/IGroupChat";

const GroupChatSchema = new Schema<IGroupChat>({
    author: { type: SchemaTypes.ObjectId, ref: "User" },
    gcType: { type: Number, default: 0 },
    members: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    createdAt: { type: Number, default: Date.now() },
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    lastMessage: {
        message: { type: String, default: "" },
        createdAt: { type: Number, default: Date.now() }
    },
    messages: [{
        text: { type: String, default: "" },
        createdAt: { type: Number, default: Date.now() },
        sentBy: { type: SchemaTypes.ObjectId, ref: "User" }
    }]
});

model<IGroupChat>("GroupChat", GroupChatSchema);