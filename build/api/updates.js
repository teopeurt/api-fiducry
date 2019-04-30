"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const isomorphic_fetch_1 = __importDefault(require("isomorphic-fetch"));
const semver_1 = __importDefault(require("semver"));
const http_errors_1 = __importDefault(require("http-errors"));
const redis_1 = __importDefault(require("../db/redis"));
const router = new koa_router_1.default();
const UPDATE_CACHE_KEY = "update_cache";
router.get("/", async ctx => {
  const { v, os } = ctx.query;
  // Validate params, both v and os are required
  if (!v || !semver_1.default.valid(semver_1.default.clean(v)))
    throw http_errors_1.default.BadRequest("Invalid v param, semmver required");
  if (os !== "darwin")
    throw http_errors_1.default.BadRequest("Invalid os param");
  try {
    // Cache GitHub response on Redis for a minute at the time
    let data;
    let githubCache = await redis_1.default.getAsync(UPDATE_CACHE_KEY);
    if (githubCache) {
      data = JSON.parse(githubCache);
    } else {
      const res = await isomorphic_fetch_1.default("#");
      data = await res.json();
      await redis_1.default.setAsync(UPDATE_CACHE_KEY, JSON.stringify(data));
      await redis_1.default.expireAsync(UPDATE_CACHE_KEY, 60);
    }
    const build = data.assets[0];
    const version = semver_1.default.clean(data.tag_name);
    if (semver_1.default.gt(version, v)) {
      // Never version available
      ctx.body = {
        url: build["browser_download_url"],
        name: data.name,
        notes: data.body,
        pub_date: data.published_at
      };
      ctx.status = 200;
    } else {
      // Returning 204 as there's no updates just yet
      ctx.status = 204;
    }
  } catch (e) {
    console.log("Github update failed");
    console.log(e);
    ctx.status = 500;
  }
});
exports.default = router;
//# sourceMappingURL=updates.js.map
