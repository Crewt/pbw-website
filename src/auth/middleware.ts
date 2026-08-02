import type { Request, Response, NextFunction } from "express";
import { getSessionUid } from "./session";

export interface AuthedRequest extends Request {
  adminUid?: number;
}

// Gate for mutating endpoints. Reads always stay public so the (future) public
// pages can consume the same API.
// Async because getSessionUid consults the DB for the current token_version;
// it never rejects (DB errors are swallowed in verifyToken → treated as invalid).
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const uid = await getSessionUid(req);
    if (uid == null) {
      res.status(401).json({ error: "Nicht angemeldet." });
      return;
    }
    req.adminUid = uid;
    next();
  } catch (err) {
    // getSessionUid is designed never to reject; guard anyway so a future change
    // can't turn into an unhandled rejection / hanging request without a response.
    next(err);
  }
}
