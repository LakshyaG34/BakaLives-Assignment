"use client";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { taskAlerts } from "@/lib/alerts";

export function TaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!title.trim()) return; setSaving(true); try { await api.create(title, description); setTitle(""); setDescription(""); onCreated(); await taskAlerts.success("Task created", "Your new task has been added to All Tasks."); } catch { await taskAlerts.error("Couldn’t create task", "The task could not be saved. Please try again."); } finally { setSaving(false); } }
  return <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12, duration: .32 }} onSubmit={submit} className="rounded-2xl border border-[#eeeaf5] bg-white p-5 shadow-[0_2px_12px_rgba(37,33,57,.025)] sm:p-6">
    <div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-bold uppercase tracking-[.16em] text-violet-600">Capture an idea</span><h2 className="mt-1 text-lg font-bold tracking-tight">Add a task</h2><p className="mt-1 text-xs leading-5 text-slate-400">Get it out of your head and into your plan.</p></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-xl font-light text-violet-600">+</span></div>
    <label htmlFor="title" className="mt-5 block text-xs font-semibold text-slate-600">Task title</label><input id="title" required maxLength={255} value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs doing?" className="mt-2 w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"/>
    <label htmlFor="description" className="mt-4 block text-xs font-semibold text-slate-600">Details <span className="font-normal text-slate-400">· optional</span></label><textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Add a little context..." className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"/>
    <button disabled={saving} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-200 disabled:cursor-wait disabled:opacity-60">{saving ? "Adding task…" : <><span className="text-base leading-none">+</span> Add to my list</>}</button>
  </motion.form>;
}
