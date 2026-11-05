"use client";
import { motion } from "framer-motion";
import Select from "react-select";
import type { Task, TaskStatus } from "@/types/task";
const labels: Record<TaskStatus, string> = { todo: "To do", in_progress: "In progress", done: "Completed" };
const colors: Record<TaskStatus, string> = { todo: "bg-amber-50 text-amber-700 ring-amber-100", in_progress: "bg-blue-50 text-blue-700 ring-blue-100", done: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
const statusOptions = (Object.entries(labels) as [TaskStatus, string][]).map(([value, label]) => ({ value, label }));
const statusSelectStyles = {
  control: (base: object) => ({ ...base, minHeight: 34, borderRadius: 9, borderColor: "#e2e8f0", boxShadow: "none", cursor: "pointer", "&:hover": { borderColor: "#c4b5fd" } }),
  valueContainer: (base: object) => ({ ...base, padding: "0 7px" }),
  singleValue: (base: object) => ({ ...base, color: "#475569", fontSize: 12, fontWeight: 500 }),
  indicatorsContainer: (base: object) => ({ ...base, height: 32 }),
  dropdownIndicator: (base: object) => ({ ...base, padding: 5, color: "#94a3b8", "&:hover": { color: "#7c3aed" } }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (base: object) => ({ ...base, zIndex: 30, borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 24px rgba(37,33,57,.12)" }),
  option: (base: object, state: { isFocused: boolean; isSelected: boolean }) => ({ ...base, fontSize: 12, cursor: "pointer", backgroundColor: state.isSelected ? "#7c3aed" : state.isFocused ? "#f5f0ff" : "white", color: state.isSelected ? "white" : "#475569", ":active": { backgroundColor: "#ede9fe" } }),
};
export function TaskCard({ task, index, onStatus, onDelete }: { task: Task; index: number; onStatus: (id: number, status: TaskStatus) => void; onDelete: (id: number) => void }) {
  return <motion.article layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .98 }} transition={{ duration: .2, delay: Math.min(index * .035, .18) }} className="group rounded-xl border border-[#eeeaf5] bg-white p-4 transition hover:border-violet-200 hover:shadow-[0_5px_18px_rgba(37,33,57,.05)] sm:p-5">
    <div className="flex items-start gap-3"><div className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${task.status === "done" ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent group-hover:border-violet-400"}`}><svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 8 3 3 7-7"/></svg></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className={`text-sm font-semibold ${task.status === "done" ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.title}</h3><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ${colors[task.status]}`}>{labels[task.status]}</span></div>{task.description && <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-500">{task.description}</p>}<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400"><span>Added {new Date(task.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>{task.updated_at !== task.created_at && <span>Updated {new Date(task.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}</div></div><button aria-label={`Delete ${task.title}`} onClick={() => onDelete(task.id)} className="rounded-lg p-2 text-slate-300 opacity-100 transition hover:bg-rose-50 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"/></svg></button></div>
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-[11px] font-medium text-slate-400">Move to</span><div className="w-[148px]"><Select options={statusOptions} value={statusOptions.find(option => option.value === task.status)} onChange={option => { if (option) onStatus(task.id, option.value); }} isSearchable={false} aria-label={`Status for ${task.title}`} styles={statusSelectStyles}/></div></div>
  </motion.article>;
}
