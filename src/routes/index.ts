import express from "express";

import accountsRoute from "./accounts";
import tellsRoute from "./tells";
import followRoute from "./follow";
import unfollowRoute from "./unfollow";
import commentRoute from "./comments";
import noteRoute from "./note";
import notificationRoute from "./notification";
import permissionsRoute from "./permissions";
import communityRoute from "./community";

export const routes = express.Router();

routes.use("/accounts", accountsRoute);
routes.use("/tells", tellsRoute);
routes.use("/follow", followRoute);
routes.use("/unfollow", unfollowRoute);
routes.use("/comments", commentRoute);
routes.use("/note", noteRoute);
routes.use("/notification", notificationRoute);
routes.use("/permissions", permissionsRoute);
routes.use("/community", communityRoute);