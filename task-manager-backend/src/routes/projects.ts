import { Router } from "express";
import prisma from "../prisma";
import { getUserId } from "../utils/auth";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { name, description } = req.body;

  const project = await prisma.project.create({
    data: { name, description, userId: (userId as any)["userId"] },
  });

  res.json(project);
});

router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    
    const projects = await prisma.project.findMany({
      where: { userId: (userId as any)["userId"] },
      include: { tasks: true },
    });

    res.json(projects);
    
  } catch (error) {
    res.status(500).json({ 
      error: "Internal server error",
      details: error 
    });
  }
});

// GET SINGLE PROJECT
router.get("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: { id: Number(id), userId },
    include: { tasks: true },
  });

  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

// UPDATE PROJECT
router.put("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);

  // check ownership
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });

  const updated = await prisma.project.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
});

// DELETE PROJECT
router.delete("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });

  await prisma.project.delete({ where: { id } });

  res.json({ message: "Deleted" });
});

export default router;
