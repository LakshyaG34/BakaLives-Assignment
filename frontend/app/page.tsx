"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Select, { type StylesConfig } from "react-select";
import { TaskForm } from "@/components/TaskForm";
import { TaskFilters } from "@/components/TaskFilters";
import { TaskList } from "@/components/TaskList";
import { DashboardOverview } from "@/components/DashboardOverview";
import { api } from "@/lib/api";
import { taskAlerts } from "@/lib/alerts";
import type { Filter, Task, TaskPriority, TaskStatus } from "@/types/task";

type Module = "overview" | "all_tasks" | "create_task";
const statusNames: Record<TaskStatus, string> = { todo: "To do", in_progress: "In progress", done: "Completed" };
const priorityNames: Record<TaskPriority, string> = { low: "Low", medium: "Medium", high: "High" };
type PageSizeOption = { value: number; label: string };
type DateFilter = "all" | "today" | "last_7_days" | "last_30_days" | "this_month";
type DateFilterOption = { value: DateFilter; label: string };
const pageSizeOptions: PageSizeOption[] = [5, 10, 20].map(value => ({ value, label: `${value} per page` }));
const dateFilterOptions: DateFilterOption[] = [
  { value: "all", label: "Any creation date" },
  { value: "today", label: "Created today" },
  { value: "last_7_days", label: "Created in past 7 days" },
  { value: "last_30_days", label: "Created in past 30 days" },
  { value: "this_month", label: "Created this month" },
];
const pageSizeSelectStyles: StylesConfig<PageSizeOption, false> = {
  control: base => ({ ...base, minHeight: 34, borderRadius: 9, borderColor: "#e2e8f0", boxShadow: "none", cursor: "pointer", "&:hover": { borderColor: "#c4b5fd" } }),
  valueContainer: base => ({ ...base, padding: "0 8px" }),
  singleValue: base => ({ ...base, color: "#475569", fontSize: 12, fontWeight: 500 }),
  indicatorsContainer: base => ({ ...base, height: 32 }),
  dropdownIndicator: base => ({ ...base, padding: 5, color: "#94a3b8", "&:hover": { color: "#7c3aed" } }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: base => ({ ...base, zIndex: 30, borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 24px rgba(37,33,57,.12)" }),
  option: (base, state) => ({ ...base, fontSize: 12, cursor: "pointer", backgroundColor: state.isSelected ? "#7c3aed" : state.isFocused ? "#f5f0ff" : "white", color: state.isSelected ? "white" : "#475569" }),
};
const dateFilterSelectStyles: StylesConfig<DateFilterOption, false> = {
  control: base => ({ ...base, minHeight: 40, borderRadius: 12, borderColor: "#e2e8f0", boxShadow: "none", cursor: "pointer", "&:hover": { borderColor: "#c4b5fd" } }),
  valueContainer: base => ({ ...base, padding: "0 10px" }),
  singleValue: base => ({ ...base, color: "#475569", fontSize: 13, fontWeight: 500 }),
  indicatorsContainer: base => ({ ...base, height: 38 }),
  dropdownIndicator: base => ({ ...base, padding: 6, color: "#94a3b8", "&:hover": { color: "#7c3aed" } }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: base => ({ ...base, zIndex: 30, borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 24px rgba(37,33,57,.12)" }),
  option: (base, state) => ({ ...base, fontSize: 13, cursor: "pointer", backgroundColor: state.isSelected ? "#7c3aed" : state.isFocused ? "#f5f0ff" : "white", color: state.isSelected ? "white" : "#475569" }),
};
function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    check: <><path d="m5 12 4 4L19 6"/><circle cx="12" cy="12" r="9"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeModule, setActiveModule] = useState<Module>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todayLabel, setTodayLabel] = useState("");
  const [greeting, setGreeting] = useState("Welcome back");
  const reload = useCallback(async () => { try { setTasks(await api.list()); setError(false); } catch { setError(true); } finally { setLoading(false); } }, []);
  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => {
    const now = new Date();
    setTodayLabel(now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }));
    setGreeting(now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening");
  }, []);
  async function changeStatus(id: number, status: TaskStatus) { try { const updated = await api.updateStatus(id, status); setTasks(current => current.map(task => task.id === id ? updated : task)); await taskAlerts.success("Task updated", `Task status changed to ${statusNames[status]}.`); } catch { setError(true); await taskAlerts.error("Couldn’t update task", "The status change could not be saved. Please try again."); } }
  async function changePriority(id: number, priority: TaskPriority) { try { const updated = await api.updatePriority(id, priority); setTasks(current => current.map(task => task.id === id ? updated : task)); await taskAlerts.success("Priority updated", `Task priority changed to ${priorityNames[priority]}.`); } catch { setError(true); await taskAlerts.error("Couldn’t update priority", "The priority change could not be saved. Please try again."); } }
  async function remove(id: number) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    const confirmation = await taskAlerts.confirmDelete(task.title);
    if (!confirmation.isConfirmed) return;
    try { await api.remove(id); setTasks(current => current.filter(item => item.id !== id)); await taskAlerts.success("Task deleted", "The task has been removed."); }
    catch { setError(true); await taskAlerts.error("Couldn’t delete task", "The task could not be deleted. Please try again."); }
  }
  function navigate(module: Module) { setActiveModule(module); setSidebarOpen(false); if (module === "all_tasks") { setFilter("all"); setSearchTerm(""); setDateFilter("all"); setCurrentPage(1); } }
  function selectStatus(status: Filter) { setFilter(status); setCurrentPage(1); setActiveModule("all_tasks"); setSidebarOpen(false); }
  const now = new Date();
  const dateRangeStart = new Date(now);
  dateRangeStart.setHours(0, 0, 0, 0);
  if (dateFilter === "last_7_days") dateRangeStart.setDate(dateRangeStart.getDate() - 6);
  if (dateFilter === "last_30_days") dateRangeStart.setDate(dateRangeStart.getDate() - 29);
  if (dateFilter === "this_month") dateRangeStart.setDate(1);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visible = tasks.filter(task => {
    const matchesStatus = filter === "all" || task.status === filter;
    const matchesSearch = !normalizedSearch || task.title.toLowerCase().includes(normalizedSearch);
    const createdAt = new Date(task.created_at);
    const matchesDate = dateFilter === "all" || (createdAt >= dateRangeStart && createdAt <= now);
    return matchesStatus && matchesSearch && matchesDate;
  });
  const hasActiveFilters = filter !== "all" || normalizedSearch.length > 0 || dateFilter !== "all";
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const paginatedTasks = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstVisibleTask = visible.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastVisibleTask = Math.min(currentPage * pageSize, visible.length);
  useEffect(() => { setCurrentPage(page => Math.min(page, pageCount)); }, [pageCount]);
  const counts = [tasks.length, tasks.filter(t => t.status === "todo").length, tasks.filter(t => t.status === "in_progress").length, tasks.filter(t => t.status === "done").length];
  const moduleTitle = activeModule === "overview" ? "Dashboard" : activeModule === "all_tasks" ? "All tasks" : "Create task";
  const moduleHeading = activeModule === "overview" ? "Dashboard" : activeModule === "all_tasks" ? "All your tasks, in one place." : "Create a task.";
  const moduleDescription = activeModule === "overview" ? `${greeting}. Here's your workload and what needs attention.` : activeModule === "all_tasks" ? "Review your list, update progress, and keep moving." : "Capture what needs doing and add it to your plan.";
  return <div className="min-h-screen bg-[#f8f7fb] text-[#252139]">
    {sidebarOpen && <button aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-[#eeeaf5] bg-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-[76px] items-center gap-3 border-b border-[#f1eef6] px-6"><div className="grid h-10 w-10 place-items-center rounded-[14px] bg-gradient-to-br from-violet-600 to-purple-800 text-white shadow-lg shadow-violet-200"><Icon name="check" className="h-5 w-5"/></div><div><div className="text-[17px] font-bold tracking-tight">TaskFlow</div><div className="text-[11px] font-medium tracking-wide text-slate-400">PERSONAL WORKSPACE</div></div><button aria-label="Close menu" className="ml-auto rounded-lg p-2 text-slate-400 lg:hidden" onClick={() => setSidebarOpen(false)}>×</button></div>
      <div className="px-4 pt-7"><div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.17em] text-slate-400">Workspace</div>
        {([{ id: "overview" as Module, label: "Dashboard", icon: "grid" }, { id: "all_tasks" as Module, label: "All tasks", icon: "check" }, { id: "create_task" as Module, label: "Create task", icon: "plus" }]).map(item => <button key={item.id} onClick={() => navigate(item.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${activeModule === item.id ? "bg-violet-50 font-semibold text-violet-700" : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}><Icon name={item.icon} className="h-[18px] w-[18px]"/>{item.label}{item.id === "all_tasks" && <span className={`ml-auto rounded-md px-2 py-0.5 text-xs ${activeModule === item.id ? "bg-white text-violet-600" : "bg-slate-100 text-slate-500"}`}>{tasks.length}</span>}{activeModule === item.id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500"/>}</button>)}
      </div>
      <div className="px-4 pt-8"><div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.17em] text-slate-400">Filter tasks</div>{[{ label: "To do", key: "todo" as Filter, dot: "bg-amber-400" }, { label: "In progress", key: "in_progress" as Filter, dot: "bg-blue-500" }, { label: "Completed", key: "done" as Filter, dot: "bg-emerald-500" }].map(item => <button key={item.key} onClick={() => selectStatus(item.key)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${activeModule === "all_tasks" && filter === item.key ? "bg-violet-50 font-semibold text-violet-700" : "font-medium text-slate-500 hover:bg-slate-50"}`}><span className={`h-2 w-2 rounded-full ${item.dot}`}/>{item.label}<span className="ml-auto text-xs text-slate-400">{tasks.filter(t => t.status === item.key).length}</span></button>)}</div>
      <div className="mt-auto p-4"><div className="rounded-2xl bg-gradient-to-br from-[#f5f0ff] to-[#faf8ff] p-4"><div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-white text-violet-600 shadow-sm"><Icon name="spark" className="h-[18px] w-[18px]"/></div><p className="text-sm font-semibold text-slate-800">Make room for focus</p><p className="mt-1 text-xs leading-5 text-slate-500">Small steps add up to meaningful progress.</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-violet-500" style={{ width: `${tasks.length ? Math.round(counts[3] / tasks.length * 100) : 0}%` }}/></div><p className="mt-2 text-[11px] font-medium text-slate-400">{tasks.length ? Math.round(counts[3] / tasks.length * 100) : 0}% of tasks complete</p></div><p className="px-2 pt-5 text-[11px] text-slate-400">TaskFlow · Your space to get things done</p></div>
    </aside>
    <div className="min-h-screen lg:pl-[258px]">
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#eeeaf5] bg-white/90 px-5 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3"><button aria-label="Open menu" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"><Icon name="menu"/></button><div className="hidden text-sm text-slate-400 sm:block">Workspace <span className="mx-2 text-slate-300">/</span> <span className="font-semibold text-slate-700">{moduleTitle}</span></div><div className="text-sm font-semibold sm:hidden">{moduleTitle}</div></div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-sm font-bold text-violet-700" aria-label="User profile">G</div>
      </header>
      <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 xl:px-10">
        <motion.div key={activeModule} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }} className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-violet-600"><span className="h-px w-5 bg-violet-400"/>{activeModule === "overview" ? todayLabel || "Your workspace" : "TaskFlow workspace"}</div>
            <h1 className="text-[30px] font-bold tracking-[-.04em] text-[#252139] sm:text-[36px]">{moduleHeading}</h1>
            <p className="mt-2 text-sm text-slate-500">{moduleDescription}</p>
          </div>
          {activeModule === "overview" && <div className="flex flex-wrap items-center gap-2"><button onClick={() => navigate("all_tasks")} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700">All tasks</button><button onClick={() => navigate("create_task")} className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700"><Icon name="plus" className="h-4 w-4"/>Create task</button></div>}
        </motion.div>

        {activeModule === "overview" && <DashboardOverview tasks={tasks} loading={loading} error={error} onOpenTasks={() => navigate("all_tasks")} onCreateTask={() => navigate("create_task")} onRetry={() => { void reload(); }}/>}

        {activeModule === "all_tasks" && <section className="min-w-0 rounded-2xl border border-[#eeeaf5] bg-white shadow-[0_2px_12px_rgba(37,33,57,.025)]"><div className="flex flex-col gap-4 border-b border-[#f1eef6] px-5 py-5 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="text-lg font-bold tracking-tight">All tasks</h2><span className="rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">{visible.length}</span></div><p className="mt-1 text-xs text-slate-400">Stay on top of what matters.</p></div><div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"><div className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-[#fcfbfe] px-3 text-slate-400 focus-within:border-violet-300 sm:w-[250px]"><Icon name="search" className="h-4 w-4"/><input aria-label="Search task titles" value={searchTerm} onChange={event => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Search task titles..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"/></div><div className="w-full sm:w-[220px]"><Select inputId="created-date-filter" aria-label="Filter by task creation date" options={dateFilterOptions} value={dateFilterOptions.find(option => option.value === dateFilter)} onChange={option => { if (option) { setDateFilter(option.value); setCurrentPage(1); } }} isSearchable={false} styles={dateFilterSelectStyles}/></div></div></div><TaskFilters value={filter} onChange={value => { setFilter(value); setCurrentPage(1); }}/></div><div className="p-4 sm:p-5">{loading ? <div className="grid min-h-48 place-items-center text-sm text-slate-400">Loading your tasks…</div> : error ? <div className="grid min-h-48 place-items-center text-sm text-rose-600">Something went wrong. Please try again.</div> : <><AnimatePresence mode="popLayout"><TaskList tasks={paginatedTasks} onStatus={changeStatus} onPriority={changePriority} onDelete={remove} emptyTitle={hasActiveFilters ? "No matching tasks" : "Nothing here just yet"} emptyDescription={hasActiveFilters ? "Try changing your search or filters." : "Your tasks will show up here."}/></AnimatePresence>{visible.length > 0 && <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><label htmlFor="tasks-per-page" className="whitespace-nowrap text-xs font-medium text-slate-500">Tasks per page</label><div className="w-[142px]"><Select inputId="tasks-per-page" aria-label="Tasks per page" options={pageSizeOptions} value={pageSizeOptions.find(option => option.value === pageSize)} onChange={option => { if (option) { setPageSize(option.value); setCurrentPage(1); } }} isSearchable={false} styles={pageSizeSelectStyles}/></div></div><p className="text-xs text-slate-400">Showing <span className="font-semibold text-slate-600">{firstVisibleTask}–{lastVisibleTask}</span> of <span className="font-semibold text-slate-600">{visible.length}</span> tasks</p><nav aria-label="Task list pages" className="flex items-center justify-between gap-1 sm:justify-end"><button onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><div className="flex items-center gap-1">{Array.from({ length: pageCount }, (_, index) => index + 1).map(page => <button key={page} aria-label={`Go to page ${page}`} aria-current={currentPage === page ? "page" : undefined} onClick={() => setCurrentPage(page)} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${currentPage === page ? "bg-violet-600 text-white shadow-sm shadow-violet-200" : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"}`}>{page}</button>)}</div><button onClick={() => setCurrentPage(page => Math.min(pageCount, page + 1))} disabled={currentPage === pageCount} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40">Next</button></nav></div>}</>}</div></section>}

        {activeModule === "create_task" && <div className="mx-auto grid max-w-4xl items-stretch gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(240px,.7fr)]">
          <TaskForm onCreated={() => { void reload(); navigate("all_tasks"); }}/>
          <aside className="flex h-full flex-col rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/70 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><span className="text-[10px] font-bold uppercase tracking-[.16em] text-violet-600">A helpful reminder</span><h2 className="mt-1 text-lg font-bold tracking-tight">A little progress adds up.</h2></div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-violet-600 shadow-sm"><Icon name="spark"/></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">Break your work into clear next steps. You can update a task’s status from the All Tasks module whenever it moves forward.</p>
            <button onClick={() => navigate("all_tasks")} className="mt-auto pt-6 text-left text-sm font-semibold text-violet-700 transition hover:text-violet-900">Browse all tasks →</button>
          </aside>
        </div>}

        <footer className="flex flex-col gap-2 py-7 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 TaskFlow</span><span>Make today count, one task at a time.</span></footer>
      </main>
    </div>
  </div>;
}
