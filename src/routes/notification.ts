import express, { Request, Response } from "express";

import auth from "../middleware/auth";

import IRoute from "../interfaces/IRoute";

import * as notif from "../controllers/notification.controller";

export default class NotificationRoute implements IRoute {
    public path: string;
    public router: express.Router;

    constructor() {
        this.path = '/api/notification';

        this.router = express.Router();

        this.initializeRoute();
    }

    initializeRoute(): void {
        this.router.post('/create', auth, notif.createNotification);
        this.router.post('/delete', auth, notif.deleteNotification);
        this.router.get('/fetch/:notificationid', auth, notif.fetchNotification);
        this.router.post('/fetchAll/:userId', auth, notif.fetchAllNotifications);
        this.router.post('/markAsRead', auth, notif.markAsReadNotification);
    }
}