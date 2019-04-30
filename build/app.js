"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_ratelimit_1 = __importDefault(require("koa-ratelimit"));
const koa_compress_1 = __importDefault(require("koa-compress"));
const koa_logger_1 = __importDefault(require("koa-logger"));
const koa_mount_1 = __importDefault(require("koa-mount"));
const cors_1 = __importDefault(require("./middlewares/cors"));
const redis_1 = __importDefault(require("./db/redis"));
const api_1 = __importDefault(require("./api"));
const app = new koa_1.default();
if (process.env.NODE_ENV === "production") {
  app.use(
    koa_ratelimit_1.default({
      db: redis_1.default,
      duration: 60000,
      errorMessage:
        "Please stop hitting us so hard. Please deploy your own instance of the API",
      id: ctx => ctx.get("X-Real-IP"),
      headers: {
        remaining: "Rate-Limit-Remaining",
        reset: "Rate-Limit-Reset",
        total: "Rate-Limit-Total"
      },
      max: 50
    })
  );
}
app.use(koa_compress_1.default());
app.use(cors_1.default());
app.use(koa_mount_1.default("/api", api_1.default));
if (process.env.NODE_ENV === "development") {
  app.use(koa_logger_1.default());
}
exports.default = app;
//# sourceMappingURL=app.js.map
