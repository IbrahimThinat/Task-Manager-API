import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

type Task = {
  id: number;
  title: string;
};

let tasks: Task[] = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Study HTTP" },
  { id: 3, title: "Study HTTP" },
  { id: 4, title: "Study HTTP" },
];

app.get("/tasks", (_req: Request, res: Response) => {
  res.json(tasks);
});

app.get("/tasks/:id", (req: Request, res: Response) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }
  res.json(task);
});

app.post("/tasks", (req: Request, res: Response) => {
  const task: Task = { id: tasks.length + 1, title: req.body.title };
  tasks.push(task);
  res.status(201).json(task);
});

app.put("/tasks/:id", (req: Request, res: Response) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }
  task.title = req.body.title;
  res.json(task);
});

app.delete("/tasks/:id", (req: Request, res: Response) => {
  tasks = tasks.filter((t) => t.id !== Number(req.params.id));
  res.status(204).end();
});

app.delete("/tasks", (req: Request, res: Response) => {
  const titles = req.body.title;
  tasks = tasks.filter((t) => t.title !== titles);
  res.status(200).json({ message: "i have delete the task", tasks });
});

app.listen(3000, () =>
  console.log("Task Manager API running on http://localhost:3000")
);
