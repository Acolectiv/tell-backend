import { Document, Schema } from "mongoose";

import IUser from "./IUser";

export default interface IMessage extends Document {
    _id: string;
    message: string;
    sender: IUser;
    receiver?: IUser;
    timestamp: Date;
    seenBy: IUser[];
    reactions: any[];
    mentions: IUser[];
    replyTo?: any;
    lastAccesedAt: number;
    archived: boolean;
    archivedAt?: number;
}