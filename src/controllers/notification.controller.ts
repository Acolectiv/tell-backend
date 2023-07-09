import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";

import NotificationManager from "../managers/NotificationManager";

export async function createNotification(req: IUserRequest, res: Response) {
    try {
        const { type, text } = req.body;

        if(!type || !text)
            return res.status(401).send({ success: false, error: "noTypeOrText" });

        let { result, msg, notification } = await NotificationManager.getInstance().postNotification(req.userId, type, "hello there");
        if(result == "error") return res.status(400).json({ success: false, msg });
        else return res.json({ success: true, notification });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function deleteNotification(req: IUserRequest, res: Response) {
    try {
        const { notificationId } = req.body;

        if(!notificationId)
            return res.status(401).send({ success: false, error: "noNotificationId" });

        let { result, msg, notification } = await NotificationManager.getInstance().deleteNotification(req.userId, notificationId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else return res.json({ success: true, notification });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function markAsReadNotification(req: IUserRequest, res: Response) {
    try {
        const { notificationId } = req.body;

        if(!notificationId)
            return res.status(401).send({ success: false, error: "noNotificationId" });

        let { result, msg, notification } = await NotificationManager.getInstance().markAsRead(notificationId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else return res.json({ success: true, notification });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function fetchNotification(req: IUserRequest, res: Response) {
    try {
        const { notificationId } = req.params;

        if(!notificationId)
            return res.status(401).send({ success: false, error: "noNotificationId" });

        let { result, msg, notification } = await NotificationManager.getInstance().fetchNotification(notificationId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else return res.json({ success: true, notification });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function fetchAllNotifications(req: IUserRequest, res: Response) {
    try {
        const { userId } = req.params;

        if(!userId)
            return res.status(401).send({ success: false, error: "noUserId" });

        let { result, msg, notifications } = await NotificationManager.getInstance().fetchNotifications(userId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else return res.json({ success: true, notifications });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}