import bluebird from "bluebird";
import redis from "redis";

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

// APPROACH 1: Using environment variables created by Docker
// var client = redis.createClient(
//  process.env.REDIS_PORT_6379_TCP_PORT,
//    process.env.REDIS_PORT_6379_TCP_ADDR
// );

// APPROACH 2: Using host entries created by Docker in /etc/hosts (RECOMMENDED)
var client = redis.createClient("6379", process.env.REDIS_URL || "redis");


client.on("connect", () => {
  console.log("Redis connected");
});

export default client;
