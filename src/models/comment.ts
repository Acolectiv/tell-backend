import { Schema, model, SchemaTypes } from "mongoose";
import IComment from "../interfaces/IComment";

const CommentSchema = new Schema<IComment>({
    author: { type: SchemaTypes.ObjectId, ref: "User" },
    parent: { type: SchemaTypes.ObjectId, ref: "Tell" },
    likes: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    dislikes: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    text: {
        type: String,
        maxlength: 1000
    },
    createdAt: Number
});

model<IComment>("Comment", CommentSchema);