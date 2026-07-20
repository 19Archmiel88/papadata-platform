import { createServer } from "node:http";

const serviceName = "worker";
const port = readPort(process.env.WORKER_HEALTH_PORT, 3002);

const manifest = await loadManifest();

const server = createServer((request, response) => {
  const path = request.url?.split("?")[0] ?? "/";

  if (path === "/healthz" || path === "/readyz") {
    sendJson(response, 200, {
      service: serviceName,
      status: "ready",
      manifest,
      dependencies: {
        postgres: process.env.POSTGRES_HOST ?? "postgres",
        redis: process.env.REDIS_HOST ?? "redis",
      },
    });
    return;
  }

  sendJson(response, 404, {
    service: serviceName,
    error: "not_found",
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(JSON.stringify({ service: serviceName, port, status: "listening" }));
});

function readPort(rawValue, fallback) {
  const parsed = Number.parseInt(rawValue ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function loadManifest() {
  try {
    const module = await import("./dist/index.js");
    return module.workerServiceManifest;
  } catch {
    return {
      serviceName,
      readiness: "not_configured",
      limitations: ["Build the worker package before using the local runtime manifest."],
    };
  }
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);

  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  });
  response.end(body);
}
