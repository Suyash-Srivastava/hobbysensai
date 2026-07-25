import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * This API has no auth/cookies and only ever accepts a JSON body, so a
 * wildcard origin carries no meaningful risk and avoids hardcoding
 * deployment URLs. Needed because in local dev the frontend and
 * `vercel dev` run on different origins (same-origin in production, so
 * this is a no-op risk there too, just an unused header).
 *
 * Returns true if this call fully handled an OPTIONS preflight - the
 * caller should return immediately without running the rest of the
 * handler in that case.
 */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}
