import { Document } from "mongoose";

export default interface ITell extends Document {
    author: any,
    likes: Array<any>,
    dislikes: Array<any>,
    text: string,
    createdAt: Number,
    title: string,
    comments: Array<any>,
    views: Array<any>,
    in: string
}