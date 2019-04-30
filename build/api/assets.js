"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const assets_1 = __importDefault(require("../utils/assets"));
const Exchange_1 = __importDefault(require("../exchange/Exchange"));
const redis_1 = __importDefault(require("../db/redis"));
const router = new koa_router_1.default();
const exchange = new Exchange_1.default();
router.get("/", async ctx => {
  try {
    const redisMarketData = await redis_1.default.getAsync("api-markets");
    let markets = JSON.parse(redisMarketData);
    if (!markets) {
      markets = await exchange.getMarketData();
      await redis_1.default.setAsync("api-markets", JSON.stringify(markets));
    }
    const period = ctx.query.period || "day";
    const key = `api-prices-${period}`;
    const redisPricesData = await redis_1.default.getAsync(key);
    let prices = JSON.parse(redisPricesData);
    if (!prices) {
      prices = await exchange.getPrices(period);
      await redis_1.default.setAsync(key, JSON.stringify(prices));
    }
    const assetData = {};
    for (let asset of assets_1.default) {
      assetData[asset.symbol] = {
        ...asset,
        ...markets[asset.symbol],
        price: prices[asset.symbol]
      };
    }
    ctx.body = { data: assetData };
  } catch (e) {
    console.log("Assets data API failed");
    console.log(e);
  }
});
exports.default = router;
//# sourceMappingURL=assets.js.map
