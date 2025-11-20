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
      include: { 
        tasks: {
          orderBy: [
            {
              status: 'asc'
            },
            {
              position: 'asc'
            }
          ]
        } 
      },
    });

    // Custom sort tasks within each project: in-progress -> todo -> done
    const projectsWithSortedTasks = projects.map(project => ({
      ...project,
      tasks: project.tasks.sort((a, b) => {
        const getStatusOrder = (status: string): number => {
          switch (status) {
            case 'in-progress': return 1;
            case 'todo': return 2;
            case 'done': return 3;
            default: return 999;
          }
        };
        
        return getStatusOrder(a.status) - getStatusOrder(b.status);
      })
    }));
    res.json(projectsWithSortedTasks);
    
  } catch (error) {
    res.status(500).json({ 
      error: "Internal server error",
      details: error 
    });
  }
});

router.get("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: { id: Number(id), userId : (userId as any)["userId"] },
    include: { tasks: true },
  });

  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});


router.put("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);

  
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== (userId as any)["userId"])
    return res.status(403).json({ error: "Forbidden" });

  const updated = await prisma.project.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== (userId as any)["userId"])
    return res.status(403).json({ error: "Forbidden" });

  await prisma.project.delete({ where: { id } });

  res.json({ message: "Deleted" });
});

export default router;
