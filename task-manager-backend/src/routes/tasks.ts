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
    position = 0,
    projectId,
  } = req.body;

  // check
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== (userId as any)["userId"])
    return res.status(403).json({ error: "Forbidden" });

  const task = await prisma.task.create({
    data: { title, description, status, position, projectId },
  });

  res.json(task);
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

  await prisma.task.delete({ where: { id } });

  res.json({ message: "Deleted" });
});

// router.get("/", async (req, res) => {
//   const userId = getUserId(req);
//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const tasks = await prisma.task.findMany({
//       where: {
//         project: {
//           userId: (userId as any)["userId"]
//         }
//       },
//       include: {
//         project: true
//       },
//       orderBy: [
//         {
//           position: 'asc'
//         }
//       ]
//     });

//     const sortedTasks = tasks.sort((a, b) => {
//       const getStatusOrder = (status: string): number => {
//         switch (status) {
//           case 'in-progress': return 1;
//           case 'todo': return 2;
//           case 'done': return 3;
//           default: return 999;
//         }
//       };
      
//       console.log(sortedTasks);
//       return getStatusOrder(a.status) - getStatusOrder(b.status);
//     });

//     res.json(sortedTasks);
//   } catch (error) {
//     res.status(500).json({ 
//       error: "Internal server error",
//       details: error 
//     });
//   }
// });

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

export default router;
