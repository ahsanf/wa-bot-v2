const API_BASE = import.meta.env.VITE_API_URL ?? ""

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message ?? res.statusText)
  return data as T
}

export type WaStatus = {
  status: "INITIALIZING" | "QR" | "AUTHENTICATED" | "READY" | "DISCONNECTED"
  hasQr: boolean
}

// total_income/total_expense and recap income/expense already come pre-formatted
// as Rupiah strings from the finance API; list amount is a numeric string.
export type FinanceTotals = { total_expense: string; total_income: string }
export type FinanceRecapRow = { month_name: string; income: string; expense: string }
export type FinanceEntry = {
  id: number
  name: string
  amount: string
  date: string
  type: "income" | "expense"
}

export type ScheduledMessage = {
  id: string
  to: string
  message: string
  sendAt: string
  sent: boolean
  error?: string
}

export const api = {
  waStatus: () => request<WaStatus>("/wa/status"),
  waQr: () => request<{ qr: string }>("/wa/qr"),
  waReset: () => request<{ message: string }>("/wa/reset", { method: "POST" }),
  waSend: (to: string, message: string) =>
    request<{ message: string }>("/wa/send", {
      method: "POST",
      body: JSON.stringify({ to, message }),
    }),
  waGetConfig: () => request<{ clientRemotePath: string }>("/wa/config"),
  waSetConfig: (clientRemotePath: string) =>
    request<{ message: string }>("/wa/config", {
      method: "POST",
      body: JSON.stringify({ clientRemotePath }),
    }),
  waRestart: () => request<{ message: string }>("/wa/restart", { method: "POST" }),

  financeSummary: () => request<{ data: FinanceTotals }>("/finance/summary"),
  financeRecap: (year: string) =>
    request<{ message: string; data: FinanceRecapRow[] }>(`/finance/recap?year=${year}`),
  financeList: (params: { month?: string; year?: string; type?: string; search?: string }) =>
    request<{ message: string; data: FinanceEntry[] }>(`/finance/list?${new URLSearchParams(params)}`),
  financeEntry: (name: string, amount: string, type: "income" | "expense", date?: string) =>
    request<{ message: string }>("/finance/entry", {
      method: "POST",
      body: JSON.stringify({ name, amount, type, date }),
    }),
  financeUpdateEntry: (id: number, name: string, amount: string, type: "income" | "expense", date: string) =>
    request<{ message: string }>(`/finance/entry/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, amount, type, date }),
    }),
  financeDeleteEntry: (id: number) =>
    request<{ message: string }>(`/finance/entry/${id}`, { method: "DELETE" }),

  scheduledList: () => request<{ data: ScheduledMessage[] }>("/scheduled-messages"),
  scheduledCreate: (to: string, message: string, sendAt: string) =>
    request<{ data: ScheduledMessage }>("/scheduled-messages", {
      method: "POST",
      body: JSON.stringify({ to, message, sendAt }),
    }),
  scheduledCancel: (id: string) =>
    request<{ message: string }>(`/scheduled-messages/${id}`, { method: "DELETE" }),
}
