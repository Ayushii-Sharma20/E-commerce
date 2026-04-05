const redis = require("redis");

const client = redis.createClient({
  url: "redis://127.0.0.1:6379",
});

client.on("error", (err) => console.error("❌ Redis Error:", err));

client.on("connect", () => console.log("🔌 Connecting to Redis..."));
client.on("ready", () => console.log("✅ Redis connected"));

async function connectRedis() {
  try {
    await client.connect();
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
}

connectRedis();

module.exports = client;