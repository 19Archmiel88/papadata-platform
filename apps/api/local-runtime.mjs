import { createAuthHttpRuntime } from "./authHttpRuntime.mjs";

const port = readPort(process.env.API_PORT, 3001);
const allowedHosts = readCsv(process.env.AUTH_ALLOWED_HOSTS) ?? [
  `127.0.0.1:${port}`,
  `localhost:${port}`,
];
const allowedOrigins = readCsv(process.env.AUTH_ALLOWED_ORIGINS) ?? [
  `http://127.0.0.1:${port}`,
  `http://localhost:${port}`,
];

const runtime = createAuthHttpRuntime({
  allowedHosts,
  allowedOrigins,
  environment: process.env.NODE_ENV === "production" ? "production" : "local",
  exposeLocalTestRoutes: process.env.AUTH_EXPOSE_LOCAL_TEST_ROUTES === "true",
  useRedis: process.env.AUTH_STATE_STORE !== "memory",
});

runtime.server.listen(port, "0.0.0.0", () => {
  console.log(
    JSON.stringify({
      authBasePath: "/v1/auth",
      port,
      service: "api",
      status: "listening",
    }),
  );
});

function readPort(rawValue, fallback) {
  const parsed = Number.parseInt(rawValue ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readCsv(value) {
  if (!value) {
    return undefined;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
