import { describe, it, expect, beforeEach } from "vitest";
import { Task, Tasks } from "./controller";

describe("Task", () => {
  it("starts as not done", () => {
    const task = new Task(1, "Buy milk");
    expect(task.done).toBe(false);
  });

  it("complete() marks the task done", () => {
    const task = new Task(1, "Buy milk");
    task.complete();
    expect(task.done).toBe(true);
  });
});

describe("Tasks", () => {
  let tasks: Tasks;

  beforeEach(() => {
    tasks = new Tasks();
  });

  it("createTask adds a task with an incrementing id", () => {
    const first = tasks.createTask("Buy milk");
    const second = tasks.createTask("Study HTTP");

    expect(first.id).toBe(1);
    expect(second.id).toBe(2);
    expect(first.title).toBe("Buy milk");
    expect(first.done).toBe(false);
    expect(tasks.getAll()).toHaveLength(2);
  });

  it("getOne returns the matching task", () => {
    tasks.createTask("Buy milk");
    const found = tasks.getOne(1);

    expect(found?.title).toBe("Buy milk");
  });

  it("getOne returns undefined when the id is missing", () => {
    expect(tasks.getOne(99)).toBeUndefined();
  });

  it("deleteTask removes that id", () => {
    tasks.createTask("Buy milk");
    tasks.createTask("Study HTTP");

    tasks.deleteTask(1);

    expect(tasks.getOne(1)).toBeUndefined();
    expect(tasks.getAll()).toHaveLength(1);
    expect(tasks.getAll()[0].title).toBe("Study HTTP");
  });
});