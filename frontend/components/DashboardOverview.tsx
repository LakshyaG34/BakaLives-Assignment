import { motion } from "framer-motion";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

const statusLabels: Record<TaskStatus, string> = { todo: "To do", in_progress: "In progress", done: "Completed" };
const statusStyles: Record<TaskStatus, string> = { todo: "bg-amber-50 text-amber-700", in_progress: "bg-blue-50 text-blue-700", done: "bg-emerald-50 text-emerald-700" };
const priorityLabels: Record<TaskPriority, string> = { low: "Low", medium: "Medium", high: "High" };
const priorityStyles: Record<TaskPriority, string> = { low: "text-slate-500", medium: "text-violet-600", high: "text-rose-600" };

export function DashboardOverview({ tasks, loading, error, onOpenTasks, onCreateTask, onRetry }: { tasks: Task[]; loading: boolean; error: boolean; onOpenTasks: () => void; onCreateTask: () => void; onRetry: () => void }) {
  const todoCount = tasks.filter(task => task.status === "todo").length;
  const inProgressCount = tasks.filter(task => task.status === "in_progress").length;
  const completedCount = tasks.filter(task => task.status === "done").length;
  const highPriorityCount = tasks.filter(task => task.priority === "high").length;
  const completion = tasks.length ? Math.round(completedCount / tasks.length * 100) : 0;
  const metrics = [
    { label: "Total tasks", value: tasks.length, note: "In your workspace", tone: "bg-violet-50", marker: "#7c3aed" },
    { label: "To do", value: todoCount, note: "Ready to start", tone: "bg-amber-50", marker: "#f59e0b" },
    { label: "In progress", value: inProgressCount, note: "Currently underway", tone: "bg-blue-50", marker: "#3b82f6" },
    { label: "Completed", value: completedCount, note: `${completion}% of all tasks`, tone: "bg-emerald-50", marker: "#10b981" },
  ];
  const priorities: { key: TaskPriority; count: number; color: string }[] = [
    { key: "high", count: highPriorityCount, color: "bg-rose-500" },
    { key: "medium", count: tasks.filter(task => task.priority === "medium").length, color: "bg-violet-500" },
    { key: "low", count: tasks.filter(task => task.priority === "low").length, color: "bg-slate-400" },
  ];
  const recentTasks = [...tasks].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 5);

  return <>
    <section aria-label="Task summary" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {metrics.map((metric, index) => <motion.article key={metric.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05, duration: .3 }} className="rounded-2xl border border-[#eeeaf5] bg-white p-5 shadow-[0_2px_12px_rgba(37,33,57,.025)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(37,33,57,.07)]"><div className="flex items-center justify-between"><p className="text-[13px] font-medium text-slate-500">{metric.label}</p><span className={`grid h-9 w-9 place-items-center rounded-xl ${metric.tone}`}><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: metric.marker }}/></span></div><p className="mt-4 text-[32px] font-bold leading-none tracking-tight text-[#29253d]">{loading || error ? "—" : metric.value}</p><p className="mt-3 text-xs text-slate-400">{metric.note}</p></motion.article>)}
    </section>

    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,.8fr)]">
      <section className="overflow-hidden rounded-2xl border border-[#eeeaf5] bg-white shadow-[0_2px_12px_rgba(37,33,57,.025)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"><div><h2 className="text-base font-bold tracking-tight">Recent tasks</h2><p className="mt-1 text-xs text-slate-400">Your latest additions to the list.</p></div><button onClick={onOpenTasks} className="text-xs font-semibold text-violet-600 transition hover:text-violet-800">View all <span aria-hidden="true">→</span></button></div>
        {error ? <div className="grid min-h-52 place-items-center px-6 text-center"><div><p className="text-sm font-semibold text-slate-700">Couldn’t load your tasks</p><p className="mt-1 text-xs text-slate-400">Check your connection and try again.</p><button onClick={onRetry} className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700">Try again</button></div></div> : loading ? <div className="grid min-h-52 place-items-center text-sm text-slate-400">Loading your tasks…</div> : recentTasks.length === 0 ? <div className="grid min-h-52 place-items-center px-6 text-center"><div><div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-2xl text-violet-500">✦</div><p className="mt-3 text-sm font-semibold text-slate-700">Start with one small task</p><p className="mt-1 text-xs text-slate-400">Add something you’d like to make progress on.</p><button onClick={onCreateTask} className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700">Create your first task</button></div></div> : <div className="divide-y divide-slate-100">{recentTasks.map(task => <div key={task.id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-[#fcfbfe] sm:px-6"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${task.status === "done" ? "bg-emerald-500" : task.status === "in_progress" ? "bg-blue-500" : "bg-amber-400"}`}/><div className="min-w-0 flex-1"><p className={`truncate text-sm font-semibold ${task.status === "done" ? "text-slate-400 line-through" : "text-slate-700"}`}>{task.title}</p><p className="mt-1 text-[11px] text-slate-400">Added {new Date(task.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p></div><span className={`hidden rounded-md px-2 py-1 text-[10px] font-semibold sm:inline-flex ${statusStyles[task.status]}`}>{statusLabels[task.status]}</span><span className={`text-[10px] font-semibold ${priorityStyles[task.priority]}`}>{priorityLabels[task.priority]}</span></div>)}</div>}
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
        <section className="rounded-2xl border border-[#eeeaf5] bg-white p-5 shadow-[0_2px_12px_rgba(37,33,57,.025)] sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-base font-bold tracking-tight">Priority overview</h2><p className="mt-1 text-xs text-slate-400">Know what deserves attention first.</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600"><svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z"/><path d="M12 8v5m0 3h.01"/></svg></span></div><div className="mt-6 space-y-5">{priorities.map(item => <div key={item.key}><div className="mb-2 flex items-center justify-between"><span className={`text-xs font-semibold ${priorityStyles[item.key]}`}>{item.key === "high" ? "High" : item.key === "medium" ? "Medium" : "Low"} priority</span><span className="text-xs font-semibold text-slate-700">{loading || error ? "—" : item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${tasks.length ? item.count / tasks.length * 100 : 0}%` }}/></div></div>)}</div><button onClick={onOpenTasks} className="mt-6 text-xs font-semibold text-violet-600 transition hover:text-violet-800">Review priorities <span aria-hidden="true">→</span></button></section>

        <section className="rounded-2xl border border-[#eeeaf5] bg-white p-5 shadow-[0_2px_12px_rgba(37,33,57,.025)] sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-base font-bold tracking-tight">Completion</h2><p className="mt-1 text-xs text-slate-400">A little progress goes a long way.</p></div><div role="img" aria-label={error ? "Task completion unavailable" : `${completion}% of tasks completed`} className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#7c3aed ${completion}%, #f1eef6 ${completion}% 100%)` }}><div className="grid h-[58px] w-[58px] place-items-center rounded-full bg-white text-sm font-bold text-slate-800">{loading || error ? "—" : `${completion}%`}</div></div></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs text-slate-500">Tasks completed</span><span className="text-xs font-semibold text-slate-700">{loading || error ? "—" : `${completedCount} of ${tasks.length}`}</span></div></section>
      </div>
    </div>
  </>;
}
