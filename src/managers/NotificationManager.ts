import { model } from "mongoose";

import NotificationTypes from "../typings/NotificationTypes";
import removeArrayElementById from "../utils/removeArrayElementById";
import removeElementById from "../utils/removeElemntById";
import UserManager from "./UserManager";

const Notification = model("Notification");

class NotificationManager {
    private static instance: NotificationManager;

    private constructor() {
        console.log(`[NotificationManager] -> NotificationManager initialized.`);
    }

    public static getInstance(): NotificationManager {
        if(!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }

        return NotificationManager.instance;
    }

    async fetchNotification(notificationId: string) {
        let notification = await Notification.findById(notificationId);
        if(notification === null) return { result: "error", msg: "noNotificationByNotificationId" }
        else return { result: "success", notification };
    }

    async fetchNotifications(author: string) {
        let notifications = await Notification.find({ author });
        if(notifications === null) return { result: "error", msg: "noNotificationByAuthor" }
        else return { result: "success", notifications };
    }

    async postNotification(author: string, type: string, text: string) {
        let user = await UserManager.getInstance().fetchUser(author);
        if(!type || !text) return { result: "error", msg: "noTypeOrText" };
        if(user === null) return { result: "error", msg: "noUser" };

        if(!NotificationTypes.includes(type))
            return { result: "error", msg: "typeNotValid" };

        let notification = await Notification.create({
            author,
            type,
            text,
            seen: false,
            createdAt: Date.now()
        });

        user.notifications.push(notification._id);

        await user.save();

        return { result: "success", notification };
    }

    async deleteNotification(author: string, notificationId: string) {
        let user = await UserManager.getInstance().fetchUser(author);
        if(!notificationId) return { result: "error", msg: "noNotificationId" };
        if(user === null) return { result: "error", msg: "noUser" };

        let { result, msg, notification } = await this.fetchNotification(notificationId);
        if(result == "error") return { result: "error", msg };

        if(notification.author.toString() != author)
            return { result: "error", msg: "noPermission" };

        await Notification.deleteOne({ _id: notificationId });

        let notificationsParsed = JSON.parse(JSON.stringify(user.notifications));

        user.notifications = removeElementById(notificationsParsed, notificationId);

        await user.save();

        return { result: "success", notification };
    }

    async markAsRead(notificationId: string) {
        let { result, msg, notification } = await this.fetchNotification(notificationId);
        if(result == "error") return { result: "error", msg };

        notification.seen = true;

        await notification.save();

        return { result: "success", notification };
    }
}

export default NotificationManager;