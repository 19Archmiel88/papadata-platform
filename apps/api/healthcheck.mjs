import { request } from "node:http";

const port = readPort(process.env.API_PORT, 3001);

const healthRequest = request(
  {
    hostname: "127.0.0.1",
    port,
    path: "/healthz",
    method: "GET",
    timeout: 2000,
  },
  (response) => {
    response.resume();
    process.exitCode = response.statusCode === 200 ? 0 : 1;
  },
);

healthRequest.on("timeout", () => {
  healthRequest.destroy(new Error("API healthcheck timed out."));
});

healthRequest.on("error", () => {
  process.exitCode = 1;
});

healthRequest.end();

function readPort(rawValue, fallback) {
  const parsed = Number.parseInt(rawValue ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
