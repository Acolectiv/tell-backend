import { Document } from "mongoose";

export default interface IGroupChat extends Document {
    author: any,
    gcType: number,
    members: Array<any>,
    createdAt: number,
    name: string,
    image: string,
    lastMessage: {
        message: string,
        createdAt: number
    },
    messages: Array<any>
}