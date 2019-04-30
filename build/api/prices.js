"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const Exchange_1 = __importDefault(require("../exchange/Exchange"));
const redis_1 = __importDefault(require("../db/redis"));
const router = new koa_router_1.default();
const exchange = new Exchange_1.default();
router.get("/", async ctx => {
  try {
    const period = ctx.query.period || "day";
    const key = `api-prices-${period}`;
    const redisData = await redis_1.default.getAsync(key);
    let prices = JSON.parse(redisData);
    if (!prices) {
      prices = await exchange.getPrices(period);
      await redis_1.default.setAsync(key, JSON.stringify(prices));
    }
    ctx.body = { data: prices };
  } catch (e) {
    console.log("Prices data API failed");
    console.log(e);
  }
});
exports.default = router;
//# sourceMappingURL=prices.js.map
