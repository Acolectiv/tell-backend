import { Document } from "mongoose";

export default interface ICommunity extends Document {
    owner: any,
    members: Array<any>,
    title: string,
    description: string,
    public: boolean,
    name: string,
    createdAt: number
}