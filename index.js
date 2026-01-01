import autocannon from "autocannon";

// ===== CONFIG (Render ENV se control hoga) =====
const TARGET_URL = process.env.TARGET_URL || "https://example.com";
const CONNECTIONS = Number(process.env.CONNECTIONS || 50); // default safe
const DURATION = Number(process.env.DURATION || 30);       // seconds
const PIPELINING = Number(process.env.PIPELINING || 10);   // safe default

console.log("Starting load test...");
console.log({
  TARGET_URL,
  CONNECTIONS,
  DURATION,
  PIPELINING
});

// Run autocannon
const instance = autocannon(
  {
    url: TARGET_URL,
    connections: CONNECTIONS,
    duration: DURATION,
    pipelining: PIPELINING,
  },
  finished
);

// Live stats (Render logs mein dikhega)
autocannon.track(instance);

function finished(err, result) {
  if (err) {
    console.error("Test failed:", err);
  } else {
    console.log("Test completed!");
    console.log("Requests/sec:", result.requests.average);
    console.log("Latency (ms):", result.latency.average);
    console.log("Throughput (bytes/sec):", result.throughput.average);
  }

  // Render service ko clean exit
  process.exit(0);
}
