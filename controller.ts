// controller.ts: the logic for tasks (server.ts can use it later)

export class Task {
    id: number;
    title: string;
    done: boolean;
  
    constructor(id: number, title: string) {
      this.id = id;
      this.title = title;
      this.done = false;
    }
  
    complete(): void {
      this.done = true;
    }
  }
  
  export class Tasks {
    private tasks: Task[] = [];
    private nextId = 1;
  
    public createTask(title: string): Task {
      const task = new Task(this.nextId++, title);
      this.tasks.push(task);
      return task;
    }
  
    public getAll(): Task[] {
      return this.tasks;
    }
  
    public getOne(id: number): Task | undefined {
      return this.tasks.find((t) => t.id === id);
    }
  
    public deleteTask(id: number): void {
      this.tasks = this.tasks.filter((t) => t.id !== id);
    }
  }