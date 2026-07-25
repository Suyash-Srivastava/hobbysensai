import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_lib/middleware/cors";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
}
