import { Router } from "express";
import { wrap } from "../http";
import { requireAuth } from "../auth/middleware";
import { listCourses, getCourse, saveCourse, removeCourse } from "../repositories/courses.repo";

export const coursesRouter = Router();

// Reads are public (website content); mutations require an admin session.
coursesRouter.get(
  "/",
  wrap(async (_req, res) => {
    res.json(await listCourses());
  })
);

coursesRouter.get(
  "/:id",
  wrap(async (req, res) => {
    const c = await getCourse(req.params.id);
    if (!c) {
      res.status(404).json({ error: "Kurs nicht gefunden." });
      return;
    }
    res.json(c);
  })
);

coursesRouter.post(
  "/",
  requireAuth,
  wrap(async (req, res) => {
    const saved = await saveCourse({ ...req.body, id: undefined });
    res.status(201).json(saved);
  })
);

coursesRouter.put(
  "/:id",
  requireAuth,
  wrap(async (req, res) => {
    const saved = await saveCourse({ ...req.body, id: req.params.id });
    res.json(saved);
  })
);

coursesRouter.delete(
  "/:id",
  requireAuth,
  wrap(async (req, res) => {
    res.json({ ok: await removeCourse(req.params.id) });
  })
);
