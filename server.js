// Task Manager API (the simplest version: just the HTTP methods)
const express = require("express");
const app = express();

app.use(express.json()); // lets the server read JSON from the request body

let tasks = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Study HTTP" },
];
let nextId = 3;

// GET: read all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// GET: read one task
app.get("/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id == req.params.id);
  res.json(task);
});

// POST: create a task
app.post("/tasks", (req, res) => {
  const task = { id: nextId++, title: req.body.title };
  tasks.push(task);
  res.status(201).json(task);
});

// PUT: replace a task
app.put("/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id == req.params.id);
  task.title = req.body.title;
  res.json(task);
});

// DELETE: remove a task
app.delete("/tasks/:id", (req, res) => {
  tasks = tasks.filter((t) => t.id != req.params.id);
  res.status(204).end();
});

app.listen(3000, () => console.log("Task Manager API running on http://localhost:3000"));