// Proves the local HTTPS edge's certificate is cryptographically valid and
// accepted by a real, unmodified Chromium browser engine over a genuine TLS
// handshake -- not "a client told to ignore certificate errors" and not
// "Node's fetch with NODE_EXTRA_CA_CERTS", which is what every other
// production-parity HTTPS check in this repo actually does:
//   - tests/web-production-parity/smoke.mjs uses Node's fetch with
//     NODE_EXTRA_CA_CERTS -- proves the cert chain is *structurally* valid,
//     not that a real browser's own trust store accepts it.
//   - apps/web/playwright.production-parity.config.ts sets
//     `ignoreHTTPSErrors: true` -- explicitly bypasses trust validation, so
//     it cannot prove trust either.
//
// IMPORTANT SCOPE NOTE: what this script proves is an SPKI pin / selective
// certificate exception, NOT full OS/browser trust-store trust. Chromium's
// `--ignore-certificate-errors-spki-list` flag (used below) tells Chromium
// "accept a TLS connection presenting exactly this one certificate's public
// key, even though no CA it already trusts vouches for it" -- it still runs
// the full TLS handshake and certificate parsing against that specific key
// (unlike `ignoreHTTPSErrors`, which disables validation broadly for any
// certificate), so this is meaningfully stronger than a blanket bypass. But
// it is still a per-connection exception for one pinned key, not proof that
// an ordinary user's browser would accept this certificate on its own --
// that would require the CA to be installed in that browser's actual trust
// store, which is a different, stronger claim this script does NOT make.
// Do not read a "trusted"/pass result here as satisfying "Wygenerowac
// lokalny zaufany certyfikat TLS" (.claude/CLAUDE.md) -- that checkbox stays
// unchecked until the CA is actually installed in a real trust store; see
// the note at the bottom of this file's evidence and in CLAUDE.md for why
// this host cannot do that (no passwordless sudo).
//
// This host has no passwordless sudo, so the locally-generated CA
// (.runtime/backend-production-parity/edge-tls/ca.crt) cannot be installed
// into the host OS trust store here. Proving anything beyond raw TLS
// handshake validity therefore has to happen inside a throwaway container
// where installing the CA into the OS trust store needs no host root at all
// (the container build/run is already root by default) -- using Microsoft's
// official Playwright image, which ships the exact same Chromium Playwright
// uses everywhere else in this repo, launched with NO ignoreHTTPSErrors
// option at all (Playwright's real default: strict validation).
//
// Empirically, update-ca-certificates alone was not enough: Playwright's
// Chromium on Linux uses its own built-in "Chrome Root Store" and does not
// consult /etc/ssl/certs for arbitrary added CAs (confirmed below -- the
// cert genuinely lands in the OS store, Chromium still rejects it until the
// SPKI pin flag is added) -- which is exactly why this had to fall back to
// the narrower SPKI-pin mechanism instead of achieving real trust-store
// trust.
//
// Requires: compose.production-parity.yml up (for the edge service) and
// docker able to pull mcr.microsoft.com/playwright.
// Run with:
//   node tests/web-production-parity/https-trust-real-browser.mjs

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = new URL("../../", import.meta.url).pathname;
const caCertPath = join(repoRoot, ".runtime/backend-production-parity/edge-tls/ca.crt");
const serverCertPath = join(repoRoot, ".runtime/backend-production-parity/edge-tls/server.crt");
const playwrightImage = "mcr.microsoft.com/playwright:v1.62.1-noble";
const failures = [];
const evidence = {};

try {
  readFileSync(caCertPath);
} catch {
  console.error(`CA certificate not found at ${caCertPath}. Is compose.production-parity.yml up?`);
  process.exit(1);
}

const SPKI_PIN = spkiPinFor(serverCertPath);
evidence.spkiPin = SPKI_PIN;

// The probe script that runs *inside* the container, using the exact same
// Playwright package the rest of the repo's browser tests use -- not a bare
// fetch/curl, so this genuinely proves a real browser instance validates
// the chain, not just that TLS handshakes at the transport level.
const probeScript = `
const { chromium } = require("playwright");

(async () => {
  // update-ca-certificates genuinely installs the CA into
  // /etc/ssl/certs/ca-certificates.crt (verified: "1 added, 0 removed"),
  // but Playwright's bundled Chromium on Linux ships its own built-in
  // "Chrome Root Store" and does not consult the OS trust store for
  // arbitrary added CAs (there is also no NSS database in this image for
  // the older NSS-based integration path some distros' Chrome build used).
  // --ignore-certificate-errors-spki-list is Chromium's own supported
  // mechanism for exactly this situation (a known local dev certificate) --
  // unlike ignoreHTTPSErrors/--ignore-certificate-errors, it does not
  // disable validation broadly: it still performs a real TLS handshake and
  // only accepts a connection presenting this *exact* certificate's public
  // key (SPKI pin), so a MITM presenting any other certificate -- including
  // one signed by the same CA for a different host -- would still fail.
  const browser = await chromium.launch({
    args: ["--ignore-certificate-errors-spki-list=${SPKI_PIN}"],
  });
  try {
    const page = await browser.newPage(); // no ignoreHTTPSErrors -- Playwright's real default (strict).
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    // Chromium (like curl) hard-codes *.localhost to resolve straight to
    // loopback per RFC 6761, bypassing /etc/hosts and DNS entirely -- so
    // this container runs with --network host (below) specifically so that
    // "loopback" here really is the host's loopback, where edge is already
    // published at 127.0.0.1:443 by compose.production-parity.yml. There is
    // no other way to make a *real* browser navigate to papadata.localhost
    // and land on this stack's edge container.
    const response = await page.goto("https://papadata.localhost/", { waitUntil: "networkidle", timeout: 15000 });
    const securityDetails = await response.request().response().then((res) => res?.securityDetails() ?? null);

    console.log(JSON.stringify({
      ok: true,
      status: response.status(),
      url: response.url(),
      securityDetails,
      pageErrors: errors,
    }));
  } catch (error) {
    console.log(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
`;

const scratchDir = join(repoRoot, ".runtime", "backend-production-parity", "https-trust-probe");
mkdirSync(scratchDir, { recursive: true });
writeFileSync(join(scratchDir, "probe.js"), probeScript, "utf8");

const containerArgs = [
  "run",
  "--rm",
  // See the comment in probeScript above: papadata.localhost must resolve
  // to loopback for a real browser, and edge is already published at the
  // host's 127.0.0.1:443 -- sharing the host's network namespace is the
  // only way to land there from inside this container.
  "--network",
  "host",
  "-v",
  `${caCertPath}:/usr/local/share/ca-certificates/papadata-production-parity-ca.crt:ro`,
  "-v",
  `${join(scratchDir, "probe.js")}:/tmp/probe.js:ro`,
  "-w",
  "/tmp",
  playwrightImage,
  "bash",
  "-c",
  // update-ca-certificates needs no sudo here: this container runs as root
  // by default, and only this ephemeral container's own trust store is
  // modified -- the host's is untouched. The image ships the browsers
  // pre-installed (PLAYWRIGHT_BROWSERS_PATH) but not the `playwright` npm
  // package itself, so it's installed fresh here (into /tmp, where node's
  // module resolution will find it from probe.js), pinned to the exact
  // version this repo already uses elsewhere for CSP testing.
  "update-ca-certificates >/dev/null && npm install --no-save --no-audit --no-fund playwright@1.62.1 >/dev/null 2>&1 && node probe.js",
];

const result = spawnSync("docker", containerArgs, { encoding: "utf8" });
const stdoutLines = (result.stdout ?? "").trim().split("\n");
const lastLine = stdoutLines[stdoutLines.length - 1] ?? "";
evidence.containerStdout = result.stdout;
evidence.containerStderr = result.stderr;

let probeResult = null;
try {
  probeResult = JSON.parse(lastLine);
} catch {
  failures.push(`Could not parse probe output as JSON. stdout=${result.stdout} stderr=${result.stderr}`);
}

if (probeResult) {
  evidence.probeResult = probeResult;
  if (!probeResult.ok) {
    failures.push(`Real browser navigation failed (likely a genuine certificate trust failure): ${probeResult.error}`);
  } else {
    if (probeResult.status !== 200) {
      failures.push(`Expected HTTP 200 from the SPKI-pinned real-browser navigation, got ${probeResult.status}.`);
    }
    if (!probeResult.securityDetails) {
      failures.push("Response carried no TLS securityDetails -- navigation may not have gone over a validated HTTPS connection.");
    }
    if (probeResult.pageErrors?.length > 0) {
      failures.push(`Unexpected page errors during navigation: ${probeResult.pageErrors.join("; ")}`);
    }
  }
}

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  // Deliberately not "trusted"/"not_trusted": this proves a real Chromium's
  // TLS stack accepts the certificate via an SPKI pin / selective
  // certificate exception (--ignore-certificate-errors-spki-list), not that
  // an ordinary browser's OS/CA trust store would accept it unassisted. See
  // the file header for the full distinction.
  result: failures.length === 0 ? "spki_pin_accepted" : "spki_pin_rejected",
  scope: "SPKI pin / selective certificate exception via a real TLS handshake -- NOT full OS/browser trust-store trust",
  evidence,
  failures,
}, null, 2));
if (failures.length > 0) process.exitCode = 1;

function spkiPinFor(certPath) {
  const pubkeyDer = execFileSync("bash", [
    "-c",
    `openssl x509 -in "${certPath}" -pubkey -noout | openssl pkey -pubin -outform der`,
  ]);
  return execFileSync("openssl", ["dgst", "-sha256", "-binary"], { input: pubkeyDer })
    .toString("base64");
}
