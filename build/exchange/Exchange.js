"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Gdax_1 = __importDefault(require("./Gdax"));
const Polonx_1 = __importDefault(require("./Polonx"));
const CoinmarketCap_1 = __importDefault(require("./CoinmarketCap"));
const prices_1 = require("../utils/prices");
const period_1 = require("../utils/period");
const redis_1 = __importDefault(require("../db/redis"));
class Exchange extends events_1.EventEmitter {
  constructor() {
    super();
    this.connect = () => {
      this.poloniex.connect();
      this.poloniex.on("message", data => {
        const currency = data.cryptoCurrency;
        console.log("prices ->>> " + JSON.stringify(this.prices));
        console.log("currnecy -->>> " + currency);
        if (!prices_1.cryptoCurrencyMap[currency].hasNativeCurrency) {
          data.price = this.convert(data.price, currency, this.prices);
        }
        this.updateCacheAndEmit(data);
      });
    };
    this.getMarketData = async () => {
      const marketData = {};
      const cmcData = await this.coinmarketcap.getMarketData();
      for (let market of cmcData) {
        marketData[market.symbol] = {
          marketCap: parseFloat(market["market_cap_usd"]),
          "24hVolume": parseFloat(market["24h_volume_usd"]),
          availableSupply: parseFloat(market["available_supply"]),
          totalSupply: parseFloat(market["total_supply"])
        };
      }
      return marketData;
    };
    this.getPrices = async period => {
      let prices = {};
      const [poloPrices, gdaxPrices] = await Promise.all([
        this.poloniex.getPrices(period),
        this.gdax.getPrices(period)
      ]);
      for (let currency in prices_1.cryptoCurrencyMap) {
        switch (prices_1.cryptoCurrencyMap[currency].exchange) {
          case "gdax":
            prices[currency] = gdaxPrices[currency];
            break;
          case "poloniex":
            prices[currency] = poloPrices[currency];
            break;
        }
      }
      for (let currency in prices_1.cryptoCurrencyMap) {
        if (prices_1.cryptoCurrencyMap[currency].hasNativeCurrency) {
          continue;
        }
        const converted = [];
        prices[currency].forEach(rate => {
          converted.push(this.convert(rate, currency, prices));
        });
        prices[currency] = converted;
      }
      this.prices = this.formatPrices(prices);
      return this.prices;
    };
    this.updateCacheAndEmit = async data => {
      let emitted = false;
      for (let period of period_1.VALID_PERIODS) {
        const key = `api-prices-${period}`;
        try {
          const prices = JSON.parse(await redis_1.default.getAsync(key));
          if (!prices) return;
          const updatePrices = prices[data.cryptoCurrency];
          if (!updatePrices) return;
          if (updatePrices.slice(-1)[0] !== data.price) {
            const index = updatePrices.length - 1;
            updatePrices[index] = data.price;
            prices[data.cryptoCurrency] = updatePrices;
            await redis_1.default.setAsync(key, JSON.stringify(prices));
            if (!emitted) {
              this.emit("message", data);
              emitted = true;
            }
          }
        } catch (e) {
          console.log("Websocket cache update failed.");
          console.log(e);
        }
      }
    };
    this.updateAllCache = async period => {
      try {
        const [prices, markets] = await Promise.all([
          this.getPrices(period),
          this.getMarketData()
        ]);
        await redis_1.default.setAsync(
          `api-prices-${period}`,
          JSON.stringify(prices)
        );
        await redis_1.default.setAsync("api-markets", JSON.stringify(markets));
      } catch (e) {
        console.log("Cache update failed.");
        console.log(e);
      }
    };
    this.formatPrices = prices => {
      for (let currency in prices) {
        let formatted = [];
        for (let rate of prices[currency]) {
          formatted.push(parseFloat(rate));
        }
        prices[currency] = formatted;
      }
      return prices;
    };
    this.convert = (amount, currency, prices) => {
      const intCurrency =
        prices_1.cryptoCurrencyMap[currency].intermediateCurrency;
      // Use the last rate
      console.log(prices);
      const intRate = prices[intCurrency].slice(-1)[0];
      return intRate * amount;
    };
    this.gdax = new Gdax_1.default();
    this.poloniex = new Polonx_1.default();
    this.coinmarketcap = new CoinmarketCap_1.default();
    this.prices = {};
  }
}
exports.default = Exchange;
//# sourceMappingURL=Exchange.js.map
