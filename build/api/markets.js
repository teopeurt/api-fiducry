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
    const redisData = await redis_1.default.getAsync("api-markets");
    let markets = JSON.parse(redisData);
    if (!markets) {
      markets = await exchange.getMarketData();
      await redis_1.default.setAsync("api-markets", JSON.stringify(markets));
    }
    const marketCaps = {};
    for (let symbol in markets) {
      marketCaps[symbol] = markets[symbol]["marketCap"];
    }
    ctx.body = { data: marketCaps };
  } catch (e) {
    console.log("Market data API failed");
    console.log(e);
  }
});
exports.default = router;
//# sourceMappingURL=markets.js.map
