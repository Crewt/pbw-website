import type { Request, Response, NextFunction, RequestHandler } from "express";

// Wrap an async route handler so rejected promises reach the Express error
// handler (which maps DB-connection errors to 503, everything else to 500).
export const wrap =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
