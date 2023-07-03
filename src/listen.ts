import sv from "./main";

import http from "http";

import config from "./config/server";

sv.listen(config.port, () => console.log(`[Express] -> Web Server running on port ${config.port}`));