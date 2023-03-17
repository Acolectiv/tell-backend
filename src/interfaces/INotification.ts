import { Document } from "mongoose";

export default interface INotification extends Document {
    author: any,
    text: string,
    type: string,
    seen: boolean
    createdAt: number
}