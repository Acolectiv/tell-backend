import { Schema, model, SchemaTypes } from "mongoose";

const GroupMessageSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    active: { type: Boolean, default: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    bannedMembers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now() },
    logs: [{
        actionType: String,
        actionTakenBy: { type: Schema.Types.ObjectId, ref: "User" },
        actionTakenAgainst: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now() }
    }]
});

model("Group", GroupMessageSchema);