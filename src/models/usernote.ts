import { Schema, model, SchemaTypes } from "mongoose";
import IUserNote from "../interfaces/IUserNote";

const UserNoteSchema = new Schema<IUserNote>({
    author: { type: SchemaTypes.ObjectId, ref: "User" },
    text: String,
    createdAt: Number
});

model<IUserNote>("UserNote", UserNoteSchema);