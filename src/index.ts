require("./init");

// @ts-ignore
import * as http from "http"
import * as WebsocketServer from "./WebsocketServer"
import app from "./app"
import * as UpdateJob from "./db/UpdateJob"
if (process.env.LOG_KEY) {
  require("now-logs")(process.env.LOG_KEY);
}

// Start all the periodic jobs
UpdateJob.startCacheUpdateJobs();

// Start the http server
const httpServer = http.createServer(app.callback());
httpServer.listen(process.env.PORT || "3005");
httpServer.on("error", err => {
  throw err;
});

httpServer.on("listening", () => {
  const address = httpServer.address();
  console.log("Listening on %s%s", JSON.stringify(address));
});

const wsServer = new WebsocketServer.default(httpServer);
wsServer.start();
