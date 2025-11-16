import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@local" },
    update: {},
    create: { name: "Demo", email: "demo@local", password: "12345678" } 
  });

  const project = await prisma.project.create({
    data: { name: "Demo Project", description: "Seed project", userId: user.id }
  });

  await prisma.task.createMany({
    data: [
      { title: "Task A", status: "todo", position: 0, projectId: project.id },
      { title: "Task B", status: "inprogress", position: 0, projectId: project.id },
      { title: "Task C", status: "done", position: 0, projectId: project.id },
    ]
  });

  console.log("Seed finished");
}
main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
