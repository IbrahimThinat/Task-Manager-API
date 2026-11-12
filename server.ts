import express, { Request, Response } from "express";
import { prisma } from "./config/prisma"; // Import your configured prisma instance

const app = express();
app.use(express.json());

app.get("/users", async (req: Request, res: Response) => {
    try {
        const users = await prisma.users.findMany({
            include: { tasks: true }
        });
        return res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/users", async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const user = await prisma.users.create({
            data: { name }
        });

        return res.status(201).json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


app.get("/tasks", async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        const tasks = await prisma.tasks.findMany({
            where: userId ? { user_id: Number(userId) } : undefined,
            include: { users: true }
        });

        return res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/tasks", async (req: Request, res: Response) => {
    try {
        const { name, userId } = req.body;
        if (!name || !userId) {
            return res.status(400).json({ error: "Name and userId are required" });
        }

        const task = await prisma.tasks.create({
            data: {
                name,
                user_id: Number(userId)
            }
        });

        return res.status(201).json(task);
    } catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const taskId = Number(req.params.id);

        const deletedTask = await prisma.tasks.delete({
            where: { id: taskId }
        });

        return res.json({ message: "Task deleted successfully", deletedTask });
    } catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({ error: "Task not found or internal server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});