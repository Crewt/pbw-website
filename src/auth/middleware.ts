import type { Request, Response, NextFunction } from "express";
import { getSessionUid } from "./session";

export interface AuthedRequest extends Request {
  adminUid?: number;
}

// Gate for mutating endpoints. Reads always stay public so the (future) public
// pages can consume the same API.
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const uid = getSessionUid(req);
  if (uid == null) {
    res.status(401).json({ error: "Nicht angemeldet." });
    return;
  }
  req.adminUid = uid;
  next();
}
