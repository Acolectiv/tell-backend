import { Schema, model, SchemaTypes } from "mongoose";

import INotification from "../interfaces/INotification";
import NotificationTypes from "../typings/NotificationTypes";

const NotificationSchema = new Schema<INotification>({
    author: { type: SchemaTypes.ObjectId, ref: "User" },
    text: String,
    seen: Boolean,
    type: String,
    createdAt: Number
});

model<INotification>("Notification", NotificationSchema);