"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const http_errors_1 = __importDefault(require("http-errors"));
const assets_1 = __importDefault(require("./assets"));
const prices_1 = __importDefault(require("./prices"));
const markets_1 = __importDefault(require("./markets"));
const updates_1 = __importDefault(require("./updates"));
const api = new koa_1.default();
const router = new koa_router_1.default();
router.use("/assets", assets_1.default.routes());
router.use("/prices", prices_1.default.routes());
router.use("/markets", markets_1.default.routes());
router.use("/updates", updates_1.default.routes());
api.use(router.routes());
api.use(koa_bodyparser_1.default());
// API 404 handler
api.use(async () => {
  throw http_errors_1.default.NotFound();
});
exports.default = api;
//# sourceMappingURL=index.js.map
