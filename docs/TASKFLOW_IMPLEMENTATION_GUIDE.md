# TaskFlow - Quick Implementation Guide

## 🎯 Overview

Transform your current app into **TaskFlow** - a personal productivity app that helps people manage tasks and build better habits.

**Time to MVP:** 2-3 weeks
**Impact:** High - Everyone needs productivity help

---

## 📋 Step-by-Step Implementation

### Phase 1: Core Task Management (Week 1)

#### Step 1: Create Task Model

Create `frontend/models/Task.ts`:

```typescript
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  userId: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  dueDate?: Date;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title must be less than 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be less than 1000 characters"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },
    dueDate: {
      type: Date,
    },
    category: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, createdAt: -1 });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
```

#### Step 2: Create Task Types

Create `frontend/types/task.ts`:

```typescript
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "completed";

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  category?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  category?: string;
}
```

#### Step 3: Create Task API Routes

Create `frontend/app/api/tasks/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-middleware";
import Task from "@/models/Task";
import connectDB from "@/lib/db";

// GET /api/tasks - Get all tasks for current user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    // Build query
    const query: any = { userId: user.id };
    if (status) query.status = status;
    if (category) query.category = category;

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({ 
      success: true,
      tasks 
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, priority, dueDate, category } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    const task = new Task({
      userId: user.id,
      title: title.trim(),
      description: description?.trim(),
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      category: category?.trim(),
    });

    await task.save();

    return NextResponse.json(
      { 
        success: true,
        task 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
```

Create `frontend/app/api/tasks/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-middleware";
import Task from "@/models/Task";
import connectDB from "@/lib/db";

// GET /api/tasks/[id] - Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const task = await Task.findOne({
      _id: params.id,
      userId: user.id,
    }).exec();

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const task = await Task.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $set: body },
      { new: true, runValidators: true }
    ).exec();

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const task = await Task.findOneAndDelete({
      _id: params.id,
      userId: user.id,
    }).exec();

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Task deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
```

#### Step 4: Create Task Components

Create `frontend/components/tasks/task-list.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch, apiJson } from "@/lib/api-client";
import { Task } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const response = await authenticatedFetch("/api/tasks");
      const data = await apiJson<{ tasks: Task[] }>(response);
      setTasks(data.tasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateTaskStatus(taskId: string, status: Task["status"]) {
    try {
      const response = await authenticatedFetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        fetchTasks(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  }

  async function deleteTask(taskId: string) {
    try {
      const response = await authenticatedFetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchTasks(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks yet. Create your first task!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task._id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    updateTaskStatus(
                      task._id,
                      task.status === "completed" ? "todo" : "completed"
                    )
                  }
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </Button>
                <div className="flex-1">
                  <CardTitle
                    className={
                      task.status === "completed"
                        ? "line-through text-muted-foreground"
                        : ""
                    }
                  >
                    {task.title}
                  </CardTitle>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(task._id)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={
                  task.priority === "high"
                    ? "destructive"
                    : task.priority === "medium"
                    ? "default"
                    : "secondary"
                }
              >
                {task.priority}
              </Badge>
              {task.status === "in-progress" && (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
              )}
              {task.category && (
                <Badge variant="outline">{task.category}</Badge>
              )}
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

Create `frontend/components/tasks/task-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authenticatedFetch, apiJson } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSuccess?: () => void;
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "",
      dueDate: "",
    },
  });

  async function onSubmit(data: TaskFormValues) {
    try {
      setIsSubmitting(true);
      const response = await authenticatedFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Task created successfully!");
        form.reset();
        onSuccess?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create task");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter task description (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Work, Personal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </form>
    </Form>
  );
}
```

#### Step 5: Update Home Page

Update `frontend/app/home/page.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logout, isAuthenticated } from "@/lib/auth";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  const handleTaskCreated = () => {
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">TaskFlow</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm onSuccess={handleTaskCreated} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList key={refreshKey} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

#### Step 6: Add Badge Component (if missing)

If you don't have Badge component, create `frontend/components/ui/badge.tsx`:

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

---

## ✅ Checklist

- [ ] Create Task model
- [ ] Create Task types
- [ ] Create API routes (GET, POST, PATCH, DELETE)
- [ ] Create TaskList component
- [ ] Create TaskForm component
- [ ] Update home page
- [ ] Add Badge component (if needed)
- [ ] Test creating tasks
- [ ] Test updating tasks
- [ ] Test deleting tasks
- [ ] Test task completion

---

## 🚀 Next Steps (Phase 2)

1. **Add Statistics Dashboard**
   - Tasks completed today/week
   - Tasks by priority
   - Tasks by category

2. **Add Filters**
   - Filter by status
   - Filter by priority
   - Filter by category

3. **Add Search**
   - Search tasks by title/description

4. **Add Categories Management**
   - Create/edit/delete categories
   - Color coding

5. **Add Due Date Reminders**
   - Email notifications
   - Browser notifications

---

## 📚 Resources

- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Lucide Icons](https://lucide.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**You now have a working task management app!** 🎉

Start using it, get feedback, and iterate based on what users need!

