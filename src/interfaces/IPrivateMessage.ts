import { Document, Schema } from "mongoose";

import IUser from "./IUser";
import IMessage from "./IMessage";

export default interface IPrivateMessage extends Document {
    _id: string;
    sender: IUser;
    receiver: IUser;
    message: IMessage;
    reactions: any[];
    mentions: IUser[];
    replyTo?: any;
    lastAccesedAt: number;
    archived: boolean;
    archivedAt?: number;
}