# Security remediation, 28 October 2026

Baseline: 5677528e04c9dd01c2b12519bfbec656c8553bd8.

- Old chat is retired. Its history API now requires a valid admin session. No anonymous history migration is safe because old session IDs are not ownership proof. The AI chatbot branch is not part of this patch.
- Admin auth uses a Secure/HttpOnly/SameSite=Strict __Host- cookie, one-hour signed claims, DB session rows, logout revocation and same-origin checks. Old 24h tokens are invalidated. AdminSession is created at login if absent; the database role needs CREATE TABLE. Existing password env remains compatible, but SHA-256 must still be migrated to scrypt using scripts/hash-password.mjs through piped stdin and Vercel's secret environment setting. Rotate AUTH_SECRET after a password change to revoke all existing sessions. Never paste a password into a shell argument or commit it.
- Public submission quotas serialize count/insert with PostgreSQL transaction advisory locks. DB failure rejects submissions, rather than falling back to a weaker counter. Global budgets, proactive retention and independent multi-instance staging checks are still required for stronger abuse controls. Telemetry/fast-login lane still have in-memory guards.
- CSP includes unsafe-inline for Next.js inline bootstrap/styles, but not unsafe-eval. A future nonce-based CSP would be stronger. Restricted frames, MIME sniffing, referrer and permissions headers are enforced.
- Optional analytics are consent-gated. Necessary security logs are separate. IP enrichment over HTTP was disabled. Existing historical analytics and security data was not deleted; retention automation remains future work.
- Archived source is text, outside runtime/public routes. The public prototype credential is redacted in its archive and disabled in the service entrypoint. Git history is NOT rewritten; the old credential remains compromised and must never be reused.
- npm is the canonical package manager; obsolete bun.lock is preserved as archive text so Vercel does not select its stale graph.

## Verification

`node security/tests/regression.cjs`: 28 exact-handler/claim checks, including three before-state reproductions using archived source.

The standalone integration harness needs playwright and embedded-postgres in a separate test tools directory, and Chrome. Run from repository root with NODE_PATH pointing to those test dependencies. It creates only an isolated synthetic PostgreSQL database, never uses production credentials, and tests 54 assertions. Test helpers are not runtime dependencies.

`npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm audit --omit=dev` are separate quality gates. Build without a real database emits caught fallback warnings for blog RSS; build succeeds. This does not certify production database access.
