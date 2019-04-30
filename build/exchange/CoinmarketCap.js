"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const ApiClient_1 = __importDefault(require("./ApiClient"));
const BASE_URL = "https://api.coinmarketcap.com/v1/";
class CoinmarketCap {
  constructor() {
    this.getMarketData = async () => {
      const data = await this.apiClient.get("ticker");
      return data;
    };
    this.apiClient = new ApiClient_1.default({ baseUrl: BASE_URL });
  }
}
exports.default = CoinmarketCap;
//# sourceMappingURL=CoinmarketCap.js.map
