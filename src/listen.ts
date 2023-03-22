import app from "./main";

import config from "./config/server";

app.listen(config.port, () => console.log(`[Express] -> Web Server running on port ${config.port}`));