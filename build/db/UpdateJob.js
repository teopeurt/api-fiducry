"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const Exchange_1 = __importDefault(require("../exchange/Exchange"));
const period_1 = require("../utils/period");
const DEFAULT_PERIOD = 60 * 1000;
class UpdateJob {
  constructor(options = {}) {
    this.start = () => {
      this.interval = setInterval(async () => {
        try {
          await this.exchange.updateAllCache(this.period);
        } catch (e) {
          console.log(`[${this.period}] Update job failed`);
          console.log(e);
        }
      }, this.jobRunPeriod);
    };
    this.stop = () => {
      if (this.interval) {
        clearInterval(this.interval);
      }
    };
    this.period = options.period;
    this.jobRunPeriod = options.jobRunPeriod || DEFAULT_PERIOD;
    this.exchange = new Exchange_1.default();
  }
}
const startCacheUpdateJobs = async () => {
  let updateJob;
  for (let period of period_1.VALID_PERIODS) {
    updateJob = new UpdateJob({
      period,
      jobRunPeriod: 60 * 1000
    });
    updateJob.start();
    await period_1.sleep(5000);
  }
};
exports.startCacheUpdateJobs = startCacheUpdateJobs;
exports.default = UpdateJob;
//# sourceMappingURL=UpdateJob.js.map
