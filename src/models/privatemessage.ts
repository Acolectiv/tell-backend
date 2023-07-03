import { Schema, model, SchemaTypes } from "mongoose";

const PrivateMessageSchema = new Schema({
    sender: { type: SchemaTypes.ObjectId, ref: "User" },
    receiver: { type: SchemaTypes.ObjectId, ref: "User" },
    message: { type: SchemaTypes.ObjectId, ref: "Message" }
});

model("PrivateMessage", PrivateMessageSchema);