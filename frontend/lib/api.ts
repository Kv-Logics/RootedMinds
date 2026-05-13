const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}/api/v1${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API ${res.status}: ${detail}`);
  }

  return res.json() as Promise<T>;
}

/* ─── Health ─────────────────────────────────── */
export const api = {
  health: {
    check: () => request<{ status: string; uptime_seconds: number }>("/health"),
  },

  ai: {
    chat: (message: string, systemPrompt?: string, model?: "gemini" | "openai") =>
      request<{ response: string; model_used: string; tokens_used: number }>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message, system_prompt: systemPrompt, model: model ?? "gemini" }),
      }),

    models: () => request<{ available: string[] }>("/ai/models"),
  },

  items: {
    list: () => request<Item[]>("/items/"),
    get:  (id: number) => request<Item>(`/items/${id}`),
    create: (payload: { title: string; description?: string }) =>
      request<Item>("/items/", { method: "POST", body: JSON.stringify(payload) }),
    delete: (id: number) => request<void>(`/items/${id}`, { method: "DELETE" }),
  },
};

/* ─── Types ──────────────────────────────────── */
export interface Item {
  id: number;
  title: string;
  description: string | null;
  status: string;
  is_active: boolean;
}
