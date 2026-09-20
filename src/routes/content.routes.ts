import { Router } from "express";
import { wrap } from "../http";
import { requireAuth } from "../auth/middleware";
import {
  isCollection,
  listCollection,
  getItem,
  saveItem,
  removeItem,
  moveItem,
} from "../repositories/content.repo";
import { isSingleton, getSingle, saveSingle } from "../repositories/settings.repo";

export const contentRouter = Router();

// Composite read — lets the admin hydrate everything in one request.
contentRouter.get(
  "/",
  wrap(async (_req, res) => {
    res.json({
      kollegen: await listCollection("kollegen"),
      zertifikate: await listCollection("zertifikate"),
      referenzen: await listCollection("referenzen"),
      ressourcen: await listCollection("ressourcen"),
      kontakt: await getSingle("kontakt"),
      about: await getSingle("about"),
      bilder: await getSingle("bilder"),
    });
  })
);

// --- singletons (declared before :coll so "single" isn't matched as a collection) ---
contentRouter.get(
  "/single/:name",
  wrap(async (req, res) => {
    if (!isSingleton(req.params.name)) {
      res.status(404).json({ error: "Unbekannt." });
      return;
    }
    res.json(await getSingle(req.params.name));
  })
);

contentRouter.put(
  "/single/:name",
  requireAuth,
  wrap(async (req, res) => {
    if (!isSingleton(req.params.name)) {
      res.status(404).json({ error: "Unbekannt." });
      return;
    }
    res.json(await saveSingle(req.params.name, req.body || {}));
  })
);

// --- sortable collections ---
contentRouter.get(
  "/:coll",
  wrap(async (req, res) => {
    if (!isCollection(req.params.coll)) {
      res.status(404).json({ error: "Unbekannte Sammlung." });
      return;
    }
    res.json(await listCollection(req.params.coll));
  })
);

contentRouter.get(
  "/:coll/:id",
  wrap(async (req, res) => {
    if (!isCollection(req.params.coll)) {
      res.status(404).json({ error: "Unbekannte Sammlung." });
      return;
    }
    const item = await getItem(req.params.coll, req.params.id);
    if (!item) {
      res.status(404).json({ error: "Eintrag nicht gefunden." });
      return;
    }
    res.json(item);
  })
);

contentRouter.post(
  "/:coll",
  requireAuth,
  wrap(async (req, res) => {
    if (!isCollection(req.params.coll)) {
      res.status(404).json({ error: "Unbekannte Sammlung." });
      return;
    }
    const saved = await saveItem(req.params.coll, { ...req.body, id: undefined });
    res.status(201).json(saved);
  })
);

contentRouter.put(
  "/:coll/:id",
  requireAuth,
  wrap(async (req, res) => {
    if (!isCollection(req.params.coll)) {
      res.status(404).json({ error: "Unbekannte Sammlung." });
      return;
    }
    const saved = await saveItem(req.params.coll, { ...req.body, id: req.params.id });
    res.json(saved);
  })
);

contentRouter.post(
  "/:coll/:id/move",
  requireAuth,
  wrap(async (req, res) => {
    if (!isCollection(req.params.coll)) {
      res.status(404).json({ error: "Unbekannte Sammlung." });
      return;
    }
    const dir = Number(req.body?.dir) < 0 ? -1 : 1;
    await moveItem(req.params.coll, req.params.id, dir);
    res.json({ ok: true });
  })
);

contentRouter.delete(
  "/:coll/:id",
  requireAuth,
  wrap(async (req, res) => {
    if (!isCollection(req.params.coll)) {
      res.status(404).json({ error: "Unbekannte Sammlung." });
      return;
    }
    res.json({ ok: await removeItem(req.params.coll, req.params.id) });
  })
);
