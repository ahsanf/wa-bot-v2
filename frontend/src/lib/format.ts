export const formatRupiah = (amount: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)

export const formatType = (type: string) => (type === "income" ? "Pemasukan" : "Pengeluaran")

// the finance API returns totals/recap figures as pre-formatted "Rp. 1.234.567"
// strings; strip everything but digits to get a plottable number back.
export const parseRupiah = (value: string) => Number(value.replace(/[^0-9]/g, "")) || 0

export const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]
