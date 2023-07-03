import { Document } from "mongoose";

import IUser from "./IUser";

export default interface IMessage extends Document {
    _id: string;
    message: string;
    sender: string;
    receiver?: string;
    timestamp: Date;
    seenBy: IUser[];
}