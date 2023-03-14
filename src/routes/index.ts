import express from "express";

import accountsRoute from "./accounts";
import tellsRoute from "./tells";
import followRoute from "./follow";
import unfollowRoute from "./unfollow";

export const routes = express.Router();

routes.use("/accounts", accountsRoute);
routes.use("/tells", tellsRoute);
routes.use("/follow", followRoute);
routes.use("/unfollow", unfollowRoute);