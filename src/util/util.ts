export const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
}

export const formatType = (type: string) => {
  return type === 'income' ? 'Pemasukan' : 'Pengeluaran'
}