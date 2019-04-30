"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VALID_PERIODS = ["day", "week", "month"];
exports.VALID_PERIODS = VALID_PERIODS;
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
const convertPeriod = (period, exchange) => {
  period = period || "day";
  if (!VALID_PERIODS.includes(period)) {
    period = "day";
  }
  const end = new Date();
  let start = new Date();
  let granularity = 3600; // 1 hour
  switch (period) {
    case "day":
      start.setUTCDate(end.getUTCDate() - 1);
      if (exchange === "poloniex") {
        granularity = 7200; // 2 hours
      } else {
        granularity = 3600; // 1 hour
      }
      break;
    case "week":
      start.setUTCDate(end.getUTCDate() - 7);
      if (exchange === "poloniex") {
        granularity = 14400; // 4 hours
      } else {
        granularity = 21600; // 6 hours
      }
      break;
    case "month":
      start.setUTCMonth(end.getUTCMonth() - 1);
      granularity = 86400; // 1 day
      break;
    default:
      start.setUTCDate(end.getUTCDate() - 1);
  }
  return { start, end, granularity };
};
exports.convertPeriod = convertPeriod;
//# sourceMappingURL=period.js.map
