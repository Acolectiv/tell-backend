import express from "express";

import accountsRoute from "./accounts";
import tellsRoute from "./tells";

export const routes = express.Router();

routes.use("/accounts", accountsRoute);
routes.use("/tells", tellsRoute);