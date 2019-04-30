"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = __importDefault(require("bluebird"));
const redis_1 = __importDefault(require("redis"));
bluebird_1.default.promisifyAll(redis_1.default.RedisClient.prototype);
bluebird_1.default.promisifyAll(redis_1.default.Multi.prototype);
// APPROACH 1: Using environment variables created by Docker
// var client = redis.createClient(
//  process.env.REDIS_PORT_6379_TCP_PORT,
//    process.env.REDIS_PORT_6379_TCP_ADDR
// );
// APPROACH 2: Using host entries created by Docker in /etc/hosts (RECOMMENDED)
var client = redis_1.default.createClient("6379", "redis");
client.on("connect", () => {
  console.log("Redis connected");
});
exports.default = client;
//# sourceMappingURL=redis.js.map
