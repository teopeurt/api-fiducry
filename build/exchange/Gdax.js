"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("websocket"));
const index_1 = __importDefault(require("reconnecting-websocket/dist/index"));
const events_1 = __importDefault(require("events"));
const ApiClient_1 = __importDefault(require("./ApiClient"));
const period_1 = require("../utils/period");
const redis_1 = __importDefault(require("../db/redis"));
const CRYPTO_CURRENCY_PAIRS = [];
const BASE_URL = "https://api.gdax.com";
const WS_URL = "wss://ws-feed.gdax.com";
class Gdax extends events_1.default {
  constructor() {
    super();
    this.connect = () => {
      const options = {
        constructor: websocket_1.default.w3cwebsocket
      };
      this.websocket = new index_1.default(WS_URL, null, options);
      this.websocket.addEventListener("open", () => {
        this.websocket.send(
          JSON.stringify({
            type: "subscribe",
            product_ids: CRYPTO_CURRENCY_PAIRS
          })
        );
      });
      this.websocket.addEventListener("message", message => {
        const data = JSON.parse(message.data);
        if (data.type === "match") {
          const cryptoCurrency = data.product_id.split("-")[0];
          const price = parseFloat(data.price);
          if (price) {
            this.emit("message", {
              cryptoCurrency,
              price
            });
          }
        }
      });
    };
    this.getPrices = async period => {
      let rates = {};
      let { start, end, granularity } = period_1.convertPeriod(period, "gdax");
      const expected =
        1 + (end.getTime() - start.getTime()) / (1000 * granularity);
      start = start.toISOString();
      end = end.toISOString();
      for (let pair of CRYPTO_CURRENCY_PAIRS) {
        const cryptoCurrency = pair.split("-")[0];
        const cryptoRates = [];
        const data = await this.apiClient.get(`/products/${pair}/candles`, {
          start,
          end,
          granularity
        });
        for (let rate of data) {
          // Record the closing price for each interval
          cryptoRates.unshift(parseFloat(rate[4]));
        }
        if (
          expected - cryptoRates.length < 5 ||
          period === "year" ||
          period === "hour"
        ) {
          rates[cryptoCurrency] = cryptoRates;
        } else {
          // Sometimes the API Fails and returns very few data points,
          // we don't want to update our cache with those values, we will
          // just return whatever is in cache already.
          const key = `api-prices-${period}`;
          const prices = JSON.parse(await redis_1.default.getAsync(key));
          rates[cryptoCurrency] = prices[cryptoCurrency];
          console.log(
            `[GDAX - ${cryptoCurrency}] Expected ${expected}, got ${cryptoRates.length}`
          );
        }
        // Wait for 1s to avoid getting rate limited
        await period_1.sleep(1000);
      }
      return rates;
    };
    this.apiClient = new ApiClient_1.default({ baseUrl: BASE_URL });
  }
}
exports.default = Gdax;
//# sourceMappingURL=Gdax.js.map
