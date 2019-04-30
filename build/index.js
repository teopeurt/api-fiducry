"use strict";
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
require("./init");
// @ts-ignore
const http = __importStar(require("http"));
const WebsocketServer = __importStar(require("./WebsocketServer"));
const app = __importStar(require("./app"));
const UpdateJob = __importStar(require("./db/UpdateJob"));
if (process.env.LOG_KEY) {
  require("now-logs")(process.env.LOG_KEY);
}
// Start all the periodic jobs
UpdateJob.startCacheUpdateJobs();
// Start the http server
const httpServer = http.createServer(app.default.callback());
httpServer.listen(process.env.PORT || "3005");
httpServer.on("error", err => {
  throw err;
});
httpServer.on("listening", () => {
  const address = httpServer.address();
  // console.log("Listening on %s%s", address, address.port);
});
const wsServer = new WebsocketServer.default(httpServer);
wsServer.start();
//# sourceMappingURL=index.js.map
