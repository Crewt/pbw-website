import { Router } from "express";
import { wrap } from "../http";
import { requireAuth } from "../auth/middleware";
import { seedAll } from "../seeding";

export const adminRouter = Router();

// "Beispieldaten zurücksetzen" — wipe content and reload the defaults.
adminRouter.post(
  "/reset",
  requireAuth,
  wrap(async (_req, res) => {
    await seedAll();
    res.json({ ok: true });
  })
);
