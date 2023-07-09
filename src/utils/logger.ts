import bunyan from "bunyan";

import { getStreams } from "../config/bunyan";

export default bunyan.createLogger({ name: "log", streams: getStreams() });
