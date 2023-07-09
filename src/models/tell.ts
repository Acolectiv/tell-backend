import { Schema, model, SchemaTypes } from "mongoose";
import ITell from "../interfaces/ITell";

const TellSchema = new Schema<ITell>({
    author: { type: SchemaTypes.ObjectId, ref: "User" },
    likes: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    dislikes: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    text: {
        type: String,
        maxlength: 2000
    },
    createdAt: Number,
    title: {
        type: String,
        maxlength: 200
    },
    comments: [{ type: SchemaTypes.ObjectId, ref: "Comment" }],
    views: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    in: { type: String, default: "general" }
});

model<ITell>("Tell", TellSchema);