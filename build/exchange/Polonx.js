"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
// import autobahn from "autobahn";
const events_1 = __importDefault(require("events"));
const poloniex_api_node_1 = __importDefault(require("poloniex-api-node"));
const ApiClient_1 = __importDefault(require("./ApiClient"));
const period_1 = require("../utils/period");
const CRYPTO_CURRENCY_PAIRS = [
  "USDT_REP",
  "USDT_BTC",
  "USDT_LTC",
  "USDT_XMR",
  "USDT_ZEC",
  "USDT_ETC",
  "USDT_ETH",
  "USDT_XRP",
  "USDT_DASH",
  "USDT_STR",
  "BTC_LSK",
  "BTC_MAID",
  "BTC_FCT",
  "BTC_XEM",
  "ETH_STEEM",
  "BTC_DOGE",
  "BTC_BTS",
  "BTC_GAME",
  "BTC_ARDR",
  "BTC_DCR",
  "BTC_STORJ",
  "BTC_SC",
  "BTC_GNT",
  "BTC_BCH",
  "BTC_ZRX",
  "BTC_OMG" // OmiseGO
];
const BASE_URL = "https://poloniex.com/public";
// const WS_URL = "wss://api.poloniex.com"; //deprecated
class Polonx extends events_1.default {
  constructor() {
    super();
    this.connect = () => {
      this.poloniex.subscribe("ticker");
      //this.poloniex.subscribe('BTC_ETC');
      this.poloniex.on("message", (channelName, data, seq) => {
        if (channelName === "ticker") {
          console.log("ticker +---+ " + JSON.stringify(data));
          // if (CRYPTO_CURRENCY_PAIRS.indexOf(data.currencyPair) > -1) {
          const cryptoCurrency = data.currencyPair.split("_")[1];
          const price = parseFloat(data.last);
          console.log(" crypto " + cryptoCurrency);
          console.log(" price " + price);
          this.emit("message", {
            cryptoCurrency,
            price
          });
          // }
        }
        if (channelName === "BTC_ETC") {
          console.log(
            `order book and trade updates received for currency pair ${channelName}`
          );
          console.log(`data sequence number is ${seq}`);
        }
      });
      this.poloniex.on("open", () => {
        console.log(`Poloniex WebSocket connection open`);
      });
      this.poloniex.on("close", (reason, details) => {
        console.log(`Poloniex WebSocket connection disconnected`);
      });
      this.poloniex.on("error", error => {
        console.log(`An error has occured ${error}`);
      });
      this.poloniex.openWebSocket({ version: 2 });
      // this.websocket.onopen = connection => {
      //   connection.subscribe("ticker", data => {
      //     if (CRYPTO_CURRENCY_PAIRS.indexOf(data[0]) > -1) {
      //       const cryptoCurrency = data[0].split("_")[1];
      //       const price = parseFloat(data[1]);
      //       this.emit("message", {
      //         cryptoCurrency,
      //         price
      //       });
      //     }
      //   });
      // };
      //
      // this.websocket.open();
    };
    this.getPrices = async period => {
      let rates = {};
      let { start, end, granularity } = period_1.convertPeriod(
        period,
        "poloniex"
      );
      let starter = start.getTime() / 1000;
      let ender = end.getTime() / 1000;
      for (let pair of CRYPTO_CURRENCY_PAIRS) {
        const cryptoCurrency = pair.split("_")[1];
        const cryptoRates = [];
        const data = await this.apiClient.get("", {
          command: "returnChartData",
          currencyPair: pair,
          starter,
          ender,
          period: granularity
        });
        for (let rate of data) {
          cryptoRates.push(parseFloat(rate["close"]));
        }
        rates[cryptoCurrency] = cryptoRates;
      }
      return rates;
    };
    this.apiClient = new ApiClient_1.default({ baseUrl: BASE_URL });
    this.poloniex = new poloniex_api_node_1.default();
    // autobahn handles retries
    // this.websocket = new autobahn.Connection({
    //   url: WS_URL,
    //   realm: "realm1",
    //   max_retries: -1
    // });
  }
}
exports.default = Polonx;
//# sourceMappingURL=Polonx.js.map
