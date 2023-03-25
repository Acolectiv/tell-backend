import { Express, Router } from "express";

class RouteManager {
    private static instance: RouteManager;
    private static app: Express = null;

    constructor(app: Express) {
        if(!app) throw new TypeError("Key \'app\' is missing in RouteManager");

        RouteManager.app = app;
    }

    public static getInstance(): RouteManager {
        if(!RouteManager.instance) {
            RouteManager.instance = new RouteManager(RouteManager.app);
        }

        return RouteManager.instance;
    }

    registerRoute(route: string, data: Router) {
        RouteManager.app.use(route, data);
    }
}

export default RouteManager;