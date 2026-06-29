import { Router } from "express";
import bcrypt from "bcryptjs";
import { wrap } from "../http";
import { findByUsername, touchLastLogin } from "../repositories/admin.repo";
import { setSessionCookie, clearSessionCookie, getSessionUid } from "../auth/session";

export const authRouter = Router();

authRouter.post(
  "/login",
  wrap(async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      res.status(400).json({ error: "Benutzername und Passwort erforderlich." });
      return;
    }
    const user = await findByUsername(String(username));
    // Always run a compare to avoid leaking which usernames exist via timing.
    const hash = user?.password_hash || "$2a$12$0000000000000000000000000000000000000000000000000000a";
    const ok = await bcrypt.compare(String(password), hash);
    if (!user || !ok) {
      res.status(401).json({ error: "Benutzername oder Passwort falsch." });
      return;
    }
    setSessionCookie(res, user.id);
    await touchLastLogin(user.id);
    res.json({ ok: true, username: user.username });
  })
);

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", (req, res) => {
  res.json({ authed: getSessionUid(req) != null });
});
