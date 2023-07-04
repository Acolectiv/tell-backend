import { Schema, model, SchemaTypes } from "mongoose";

const FriendRequestSchema = new Schema({
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    recipientId: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now() }
});

model("FriendRequest", FriendRequestSchema);