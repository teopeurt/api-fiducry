// import autobahn from "autobahn";
import EventEmitter from "events";
import Poloniex from "poloniex-api-node";

import ApiClient from "./ApiClient";
import { convertPeriod } from "../utils/period";

const CRYPTO_CURRENCY_PAIRS = [
  "USDT_REP", // Augur
  "USDT_BTC", // Bitcoin
  "USDT_LTC", // Litecoin
  "USDT_XMR", // Monero
  "USDT_ZEC", // ZCash
  "USDT_ETC", // Ethereum classic
  "USDT_ETH", // Ethereum
  "USDT_XRP", // Ripple
  "USDT_DASH", // Dash
  "USDT_STR", // Stellar
  "BTC_LSK", // Lisk
  "BTC_MAID", // MaidSafe
  "BTC_FCT", // Factom
  "BTC_XEM", // NEM
  "ETH_STEEM", // Steem
  "BTC_DOGE", // Dogecoin
  "BTC_BTS", // BitShares
  "BTC_GAME", // GameCredit
  "BTC_ARDR", // Ardor
  "BTC_DCR", // Decred
  "BTC_STORJ", // Storjcoin X
  "BTC_SC", // SiaCoin
  "BTC_GNT", // Golem tokens
  "BTC_BCH", // Bitcoin Cash
  "BTC_ZRX", // 0x
  "BTC_OMG" // OmiseGO
];

const BASE_URL = "https://poloniex.com/public";
// const WS_URL = "wss://api.poloniex.com"; //deprecated

class Polonx extends EventEmitter {
  private apiClient: ApiClient;
  private poloniex: any;

  constructor() {
    super();
    this.apiClient = new ApiClient({ baseUrl: BASE_URL });

    this.poloniex = new Poloniex();

  }

  connect = () => {
    this.poloniex.subscribe("ticker");

    this.poloniex.on("message", (channelName, data, seq) => {
      if (channelName === "ticker") {
        const cryptoCurrency = data.currencyPair.split("_")[1];
        const price = parseFloat(data.last);
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

  };

  getPrices = async period => {
    let rates = {};

    let { start, end, granularity } = convertPeriod(period, "poloniex");

      let startEpoch = start.valueOf();
      let endEpoch = end.valueOf();

    for (let pair of CRYPTO_CURRENCY_PAIRS) {
      const cryptoCurrency = pair.split("_")[1];
      const cryptoRates = [];

      const data = await this.apiClient.get("", {
        command: "returnChartData",
        currencyPair: pair,
        start: startEpoch,
        end: endEpoch,
        period: granularity
      });

      for (let rate of data) {
        cryptoRates.push(parseFloat(rate["close"]));
      }
      rates[cryptoCurrency] = cryptoRates;
    }

    return rates;
  };
}

export default Polonx;
