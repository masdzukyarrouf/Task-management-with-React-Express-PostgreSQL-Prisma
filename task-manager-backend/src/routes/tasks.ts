import { Router } from "express";
import prisma from "../prisma";
import { getUserId } from "../utils/auth";

const router = Router();

router.post("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const {
    title,
    description,
    status = "todo",
    projectId,
  } = req.body;

  // check
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== (userId as any)["userId"])
    return res.status(403).json({ error: "Forbidden" });

  try {
    const maxPositionTask = await prisma.task.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    const newPosition = maxPositionTask ? maxPositionTask.position + 1 : 0;
    const task = await prisma.task.create({
      data: { 
        title, 
        description, 
        status, 
        position: newPosition, 
        projectId 
      },
    });

    res.json(task);
    
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);

  // check
  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!task || task.project.userId !== (userId as any)["userId"])
    return res.status(403).json({ error: "Forbidden" });

  const updated = await prisma.task.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!task || task.project.userId !== (userId as any)["userId"])
    return res.status(403).json({ error: "Forbidden" });

  const projectId = task.projectId;
  
  await prisma.task.delete({ where: { id } });
  
  await reorderTaskPositions(projectId);
  
  res.json({ message: "Deleted" });
});

router.patch("/:id/reorder", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);
  const { newPosition } = req.body;

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!task || task.project.userId !== (userId as any)["userId"])
    return res.status(403).json({ error: "Forbidden" });

  // Get all tasks in the project
  const tasks = await prisma.task.findMany({
    where: { projectId: task.projectId },
    orderBy: { position: 'asc' }
  });

  // Remove the moved task from the list
  const filteredTasks = tasks.filter(t => t.id !== id);
  
  // Insert the moved task at the new position
  filteredTasks.splice(newPosition, 0, task);

  // Update all positions in a transaction
  const updateOperations = filteredTasks.map((t, index) =>
    prisma.task.update({
      where: { id: t.id },
      data: { position: index }
    })
  );

  await prisma.$transaction(updateOperations);

  res.json({ message: "Reordered successfully" });
}); 


router.get("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);

  const task = await prisma.task.findFirst({
    where: {
      id,
      project: {
        userId: (userId as any)["userId"],
      },
    },
    include: {
      project: true,
    },
  });

  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});


// reorder
const reorderTaskPositions = async (projectId: number) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
      select: { id: true } 
    });

    const updateOperations = tasks.map((task, index) => 
      prisma.task.update({
        where: { id: task.id },
        data: { position: index }
      })
    );

    await prisma.$transaction(updateOperations);

    console.log(`Reordered ${tasks.length} tasks for project ${projectId}`);
  } catch (error) {
    console.error('Error reordering tasks:', error);
  }
};


export default router;
