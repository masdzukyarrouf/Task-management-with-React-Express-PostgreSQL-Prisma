import { Router } from "express";
import prisma from "../prisma";
import { getUserId } from "../utils/auth";

const router = Router();

// CREATE TASK
router.post("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { title, description, status = "todo", position = 0, projectId } = req.body;

  // verify project belongs to user
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });

  const task = await prisma.task.create({
    data: { title, description, status, position, projectId }
  });

  res.json(task);
});

// UPDATE TASK
router.put("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);

  // extra: ensure ownership by checking its project
  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: true }
  });

  if (!task || task.project.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });

  const updated = await prisma.task.update({
    where: { id },
    data: req.body
  });

  res.json(updated);
});

// DELETE TASK
router.delete("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: true }
  });

  if (!task || task.project.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });

  await prisma.task.delete({ where: { id } });

  res.json({ message: "Deleted" });
});

export default router;
