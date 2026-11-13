import "dotenv/config";
import express, { Request, Response } from "express";
import { prisma } from "./config/prisma"; // Import your configured prisma instance
import { authenticate, requireRole, signToken } from "./middleware/auth";

const app = express();

app.use(express.json());


app.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || String(password).length < 6) {
      return res
        .status(400)
        .json({ error: "name, email and a password of 6+ characters are required" });
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await prisma.users.create({
      data: { name, email, password_hash: String(password), role: "user" },
      select: { id: true, name: true, email: true, role: true }, 
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

  
app.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    const ok = !!user?.password_hash && user.password_hash === String(password);

    if (!user || !ok) {
      // Same message for both cases so attackers can't tell which emails exist
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.json({ accessToken: signToken({ id: user.id, role: user.role }) });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =====================================================================
// AUTHENTICATED endpoints (any logged-in user)
// =====================================================================

app.get("/me", authenticate, (req: Request, res: Response) => {
  return res.json(req.user);
});

// List tasks: a normal user sees only their own tasks, an admin sees all
app.get("/tasks", authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const isAdmin = req.user!.role === "admin";

    const where = isAdmin
      ? userId
        ? { user_id: Number(userId) } // admin may filter by user
        : undefined
      : { user_id: req.user!.id }; // normal user: always only their own

    const tasks = await prisma.tasks.findMany({
      where,
      // select only safe fields, so the password hash is never sent
      include: { users: { select: { id: true, name: true } } },
    });
    return res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Create task: the owner comes from the TOKEN, not from the request body
app.post("/tasks", authenticate, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const task = await prisma.tasks.create({
      data: {
        name,
        user_id: req.user!.id,
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete task: only the owner or an admin
app.delete("/tasks/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.id);

    const task = await prisma.tasks.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const isOwner = task.user_id === req.user!.id;
    const isAdmin = req.user!.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "You can only delete your own tasks" });
    }

    const deletedTask = await prisma.tasks.delete({ where: { id: taskId } });
    return res.json({ message: "Task deleted successfully", deletedTask });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =====================================================================
// ADMIN-ONLY endpoints (authenticated + authorized)
// =====================================================================

app.get("/users", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      select: { id: true, name: true, email: true, role: true, tasks: true }, // no password
    });
    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});