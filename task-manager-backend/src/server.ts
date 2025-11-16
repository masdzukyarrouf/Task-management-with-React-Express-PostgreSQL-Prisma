import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.use("/auth", authRoutes);


app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
