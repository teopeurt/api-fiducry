"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const uws_1 = __importDefault(require("uws"));
const Exchange_1 = __importDefault(require("./exchange/Exchange"));
class WebsocketServer {
  constructor(server) {
    this.broadcast = data => {
      this.wss.clients.forEach(client => {
        if (client.readyState === uws_1.default.OPEN) {
          try {
            client.send(data);
          } catch (e) {
            console.log(e);
          }
        }
      });
    };
    this.ping = () => {
      this.wss.clients.forEach(client => {
        if (client.readyState === uws_1.default.OPEN) {
          try {
            client.ping();
          } catch (e) {
            console.log(e);
          }
        }
      });
    };
    this.verifyClient = info => {
      return this.originIsAllowed(info.origin);
    };
    this.originIsAllowed = origin => {
      // TODO: add origin checks here
      return true;
    };
    this.start = () => {
      this.exchange.connect();
      this.exchange.on(
        "message",
        lodash_1.default.throttle(data => {
          this.broadcast(JSON.stringify(data));
        }, 1000)
      );
      setInterval(() => {
        // Ping to prevent connections from closing
        this.ping();
      }, 30000);
    };
    this.exchange = new Exchange_1.default();
    this.wss = new uws_1.default.Server({
      server,
      verifyClient: this.verifyClient,
      clientTracking: true
    });
  }
}
exports.default = WebsocketServer;
//# sourceMappingURL=WebsocketServer.js.map
