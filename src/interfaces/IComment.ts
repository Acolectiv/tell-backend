import { Document } from "mongoose";

export default interface IComment extends Document {
    author: any,
    parent: any,
    likes: Array<any>,
    dislikes: Array<any>,
    text: string,
    createdAt: Number
}