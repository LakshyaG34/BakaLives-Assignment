"use client";
import type { Filter } from "@/types/task";
const choices: { value: Filter; label: string }[] = [{ value: "all", label: "All tasks" }, { value: "todo", label: "To do" }, { value: "in_progress", label: "In progress" }, { value: "done", label: "Completed" }];
export function TaskFilters({ value, onChange }: { value: Filter; onChange: (value: Filter) => void }) {
  return <div aria-label="Filter tasks" className="flex flex-wrap gap-1.5">{choices.map(choice => <button key={choice.value} onClick={() => onChange(choice.value)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${value === choice.value ? "bg-violet-600 text-white shadow-sm shadow-violet-200" : "bg-[#f8f7fb] text-slate-500 hover:bg-violet-50 hover:text-violet-700"}`}>{choice.label}</button>)}</div>;
}
