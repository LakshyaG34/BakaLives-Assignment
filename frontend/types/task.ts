export type TaskStatus = "todo" | "in_progress" | "done";
export type Filter = "all" | TaskStatus;
export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
};
