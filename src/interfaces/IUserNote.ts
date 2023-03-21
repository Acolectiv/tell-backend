import { Document } from "mongoose";

export default interface IUserNote extends Document {
    author: any,
    text: string,
    createdAt: number,
    updatedAt: number
}