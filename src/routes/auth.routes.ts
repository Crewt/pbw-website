import { Router } from "express";
import bcrypt from "bcryptjs";
import { wrap } from "../http";
import { findByUsername, touchLastLogin, bumpTokenVersion } from "../repositories/admin.repo";
import { setSessionCookie, clearSessionCookie, getSessionUid } from "../auth/session";
import { rateLimit } from "../middleware/rateLimit";

export const authRouter = Router();

// Strict throttle to blunt online brute-force of admin credentials: at most 10
// login attempts per 15 minutes per client IP (app runs behind one trusted proxy,
// so req.ip is the real client). Successful logins count too, which is fine — a
// human logs in far below this ceiling.
const loginRateLimit = rateLimit({ windowMs: 15 * 60_000, max: 10 });

authRouter.post(
  "/login",
  loginRateLimit,
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
    // Embed the user's current token_version so the token can be revoked on logout.
    setSessionCookie(res, user.id, user.token_version);
    await touchLastLogin(user.id);
    res.json({ ok: true, username: user.username });
  })
);

authRouter.post(
  "/logout",
  wrap(async (req, res) => {
    // Bump the user's token_version so the (stateless) token is rejected on the
    // next request server-side, not just cleared client-side.
    const uid = await getSessionUid(req);
    if (uid != null) await bumpTokenVersion(uid);
    clearSessionCookie(res);
    res.json({ ok: true });
  })
);

authRouter.get(
  "/me",
  wrap(async (req, res) => {
    res.json({ authed: (await getSessionUid(req)) != null });
  })
);
