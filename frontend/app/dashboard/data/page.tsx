"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Database, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

type Item = { id: number; title: string; description?: string; status: string; };

export default function DataPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api.items.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    setAdding(true);
    try {
      await api.items.create({ title, description: desc || undefined });
      setTitle(""); setDesc("");
      await load();
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: number) => {
    await api.items.delete(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
          <Database className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Data</h1>
          <p className="text-gray-500 text-sm">Manage items via the FastAPI backend</p>
        </div>
      </div>

      {/* Create */}
      <div className="glass p-5 space-y-3">
        <p className="text-sm font-semibold text-white">Add Item</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            id="item-title-input"
            className="input"
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            id="item-desc-input"
            className="input"
            placeholder="Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <button
          id="item-create-btn"
          className="btn-primary"
          onClick={create}
          disabled={adding || !title.trim()}
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Item
        </button>
      </div>

      {/* List */}
      <div className="glass overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Items ({items.length})</p>
          <button
            id="refresh-btn"
            className="text-xs text-gray-500 hover:text-brand-400 transition-colors"
            onClick={load}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No items yet — create one above.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/2 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge-success">{item.status}</span>
                  <button
                    id={`delete-item-${item.id}`}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
