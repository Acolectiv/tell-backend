import { Schema, model, SchemaTypes } from "mongoose";
import ITell from "../interfaces/ITell";

const TellSchema = new Schema<ITell>({
    author: { type: SchemaTypes.ObjectId, ref: "User" },
    likes: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    dislikes: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    text: String,
    createdAt: Number,
    title: String,
    comments: [{ type: SchemaTypes.ObjectId, ref: "Comment" }],
    views: [{ type: SchemaTypes.ObjectId, ref: "User" }]
});

model<ITell>("Tell", TellSchema);