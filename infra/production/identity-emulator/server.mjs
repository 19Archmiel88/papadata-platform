// Local production-parity emulator for the GCE/Cloud Run metadata server's
// identity-token endpoint. It exists ONLY so that
// apps/bff/src/cloud-run-identity.service.ts -- token acquisition, caching,
// refresh-on-expiry, timeout handling, and failure handling -- runs the
// EXACT SAME code in production-parity as it does in real production,
// instead of that entire code path going unexercised locally.
//
// What this emulator faithfully replicates (the request/response CONTRACT):
//   - GET .../instance/service-accounts/default/identity?audience=X&format=full
//   - requires header Metadata-Flavor: Google (else 403, matching the real
//     metadata server's behavior for any request missing that header)
//   - requires a non-empty `audience` query parameter (else 400)
//   - requires `format=full` (else 400) -- CloudRunIdentityService always
//     sends this, so a missing/wrong value is exactly the malformed-request
//     case the real server would also reject
//   - responds 200 text/plain with a JWT-SHAPED bearer token
//
// What this emulator explicitly does NOT and CANNOT replicate: real Google
// signing, or Cloud Run's IAM invoker verification of that signature at the
// platform's ingress layer. That verification boundary is enforced by GCP
// itself (google_cloud_run_v2_service_iam_member.bff_invokes_api in
// infra/terraform/main.tf), not by application code, and cannot be
// faithfully emulated outside real GCP -- it is a Class 3 concern covered
// by GCP staging acceptance (tools/verify-gcp-staging-acceptance.mjs), not
// by this emulator. The token produced here is unsigned (alg: none) and
// must never be treated as a real credential.
import { createServer } from "node:http";

const port = Number(process.env.IDENTITY_EMULATOR_PORT ?? 8081);

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function issueToken(audience) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    aud: audience,
    azp: "local-parity-identity-emulator",
    email: "local-parity@papadata.localhost",
    exp: nowSeconds + 3600,
    iat: nowSeconds,
    iss: "https://papadata.localhost/identity-emulator",
  }));
  // No real signature is possible or meaningful here (see module doc
  // comment) -- an explicit, unmistakably-fake marker segment instead of a
  // base64url-looking string keeps this from ever being mistaken for a
  // real, verifiable Google-signed token.
  const signature = base64url("unsigned-local-parity-emulator-token");
  return `${header}.${payload}.${signature}`;
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method !== "GET") {
    response.writeHead(405, { "content-type": "text/plain" }).end("Method Not Allowed");
    return;
  }

  if (request.headers["metadata-flavor"] !== "Google") {
    response.writeHead(403, { "content-type": "text/plain" }).end("Metadata-Flavor: Google header is required.");
    return;
  }

  const audience = url.searchParams.get("audience");
  if (!audience) {
    response.writeHead(400, { "content-type": "text/plain" }).end("audience query parameter is required.");
    return;
  }

  if (url.searchParams.get("format") !== "full") {
    response.writeHead(400, { "content-type": "text/plain" }).end("format=full query parameter is required.");
    return;
  }

  response.writeHead(200, { "content-type": "text/plain; charset=utf-8" }).end(issueToken(audience));
});

server.listen(port, () => {
  console.log(`identity-emulator listening on :${port}`);
});
