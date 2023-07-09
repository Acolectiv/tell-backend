import bunyan from "bunyan";

import { getStreams } from "../config/bunyan";

const logger = bunyan.createLogger({ name: "log", streams: getStreams() });

export default logger;