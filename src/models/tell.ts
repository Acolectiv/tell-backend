import { Schema, model, SchemaTypes } from "mongoose";
import ITell from "../interfaces/ITell";

const TellSchema = new Schema<ITell>({
    author: { type: SchemaTypes.ObjectId, ref: "User" },
    likes: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    dislikes: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    text: String,
    createdAt: Number
});

model<ITell>("Tell", TellSchema);