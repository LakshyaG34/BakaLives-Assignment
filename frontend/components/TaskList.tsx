import { motion } from "framer-motion";
import type { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
export function TaskList({ tasks, onStatus, onDelete }: { tasks: Task[]; onStatus: (id: number, status: TaskStatus) => void; onDelete: (id: number) => void }) {
  if (!tasks.length) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid min-h-56 place-items-center rounded-xl border border-dashed border-slate-200 bg-[#fcfbfe] px-5 text-center"><div><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-2xl text-violet-500">✦</div><p className="mt-3 text-sm font-semibold text-slate-700">Nothing here just yet</p><p className="mt-1 text-xs text-slate-400">Your tasks will show up here.</p></div></motion.div>;
  return <div className="grid gap-3">{tasks.map((task, i) => <TaskCard key={task.id} task={task} index={i} onStatus={onStatus} onDelete={onDelete}/>)}</div>;
}
