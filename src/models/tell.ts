import { Schema, model, SchemaTypes } from "mongoose";
import ITell from "../interfaces/ITell";

const TellSchema = new Schema<ITell>({
    author: { type: SchemaTypes.ObjectId, ref: "User" },
    likes: Number,
    dislikes: Number,
    text: String
});

model<ITell>("Tell", TellSchema);