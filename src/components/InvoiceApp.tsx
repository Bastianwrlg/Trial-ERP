/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Invoice } from "../types";
import { 
  Receipt, Check, CreditCard, ShieldAlert, 
  User, Calendar, Info, FileText, Percent 
} from "lucide-react";

interface InvoiceAppProps {
  invoices: Invoice[];
  onRefresh: () => void;
  currentUserRole: string;
}

export default function InvoiceApp({ invoices, onRefresh, currentUserRole }: InvoiceAppProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handlePay = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        onRefresh();
        const updated = await res.json();
        setSelectedInvoice(updated);
        alert("Pembayaran lunas terdaftar! Siklus SPK & alur sistem kini telah Selesai (Completed) sepenuhnya.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const hasAccessToInvoicing = currentUserRole === 'admin' || currentUserRole === 'finance' || currentUserRole === 'sales';
  const canPay = currentUserRole === 'admin' || currentUserRole === 'finance';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-800">Modul Invoice & Penagihan (Billing)</h2>
        <p className="text-xs text-slate-500 mt-1">Pantau piutang usaha, kalkulasi PPn 11% otomatis, dan catat pelunasan pembayaran pelanggan</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Invoice List */}
        <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tagihan Terbit</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition ${
                  selectedInvoice?.id === inv.id ? "bg-violet-50/50 border-l-4 border-violet-700" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-xs text-slate-500">{inv.number}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    inv.status === 'Paid' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {inv.status === 'Paid' ? 'Lunas (Paid)' : 'Belum Bayar'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{inv.customerName}</h4>
                <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                  <span className="font-bold text-slate-800">{formatCurrency(inv.totalAmount)}</span>
                  <span>Due: {inv.dueDate}</span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">Belum ada tagihan terbit. Invoice penjualan diterbitkan secara otomatis setelah barang dikonfirmasi sampai di modul Logistik.</div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 bg-white overflow-y-auto p-6 flex flex-col">
          {selectedInvoice ? (
            <div className="max-w-3xl flex-1 flex flex-col">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className="text-xs text-violet-700 font-bold bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">Faktur Penjualan Resmi</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-2">{selectedInvoice.number}</h3>
                  <p className="text-xs text-slate-500 mt-1">Berdasarkan SPK: <strong className="text-slate-700">{selectedInvoice.spkNumber}</strong></p>
                </div>

                {/* Pay button */}
                {canPay && selectedInvoice.status === 'Unpaid' && (
                  <button
                    onClick={() => handlePay(selectedInvoice.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Daftarkan Pelunasan (Lunas)
                  </button>
                )}
              </div>

              {/* Status Display Card */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex gap-2">
                  <User className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Nama Pelanggan</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{selectedInvoice.customerName}</div>
                    <div className="text-xs text-slate-500 mt-1">Terbit: {selectedInvoice.date}</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex gap-2">
                  <Calendar className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Batas Jatuh Tempo</div>
                    <div className="font-bold text-red-600 text-sm mt-0.5">{selectedInvoice.dueDate}</div>
                    <div className="text-xs text-slate-500 mt-1">Syarat Pembayaran: Net 30 Hari</div>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <h4 className="font-bold text-sm text-slate-800 mb-2">Perincian Faktur Penjualan</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold border-b text-[10px] uppercase">
                      <th className="py-3 px-4">Deskripsi Tagihan</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-800">Pengerjaan & Pengiriman SPK {selectedInvoice.spkNumber}</td>
                      <td className="py-3 px-4 text-right text-slate-700 font-mono font-semibold">{formatCurrency(selectedInvoice.amount)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-500 flex items-center gap-1">Pajak Pertambahan Nilai (PPn 11% otomatis) <Percent className="w-3.5 h-3.5 text-slate-400" /></td>
                      <td className="py-2 px-4 text-right text-slate-600 font-mono">{formatCurrency(selectedInvoice.tax)}</td>
                    </tr>
                    <tr className="bg-slate-50/50 font-bold text-sm border-t">
                      <td className="py-3 px-4 text-slate-800 uppercase tracking-wider text-xs">Jumlah Tagihan Akhir (Total)</td>
                      <td className="py-3 px-4 text-right text-violet-700 font-mono text-base">{formatCurrency(selectedInvoice.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status banner */}
              {selectedInvoice.status === 'Paid' ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-2.5 mt-auto">
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">✓</span>
                  <div>
                    <div className="font-bold text-sm">Faktur Telah Dilunasi (Lunas)</div>
                    <p className="text-xs text-emerald-700 mt-0.5">Seluruh kewajiban pembayaran telah dituntaskan oleh pelanggan. Alur sistem ERP untuk pengerjaan Surat Perintah Kerja ini telah selesai sempurna dari hulu ke hilir.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-2.5 mt-auto text-xs">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Menunggu Pelunasan Tagihan</div>
                    <p className="mt-0.5">Invoice ini masih dalam status Unpaid. Silakan daftarkan pelunasan jika customer telah mentransfer sejumlah tagihan di atas.</p>
                  </div>
                </div>
              )}

              {/* Permission warning */}
              {!canPay && selectedInvoice.status === 'Unpaid' && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2 text-xs mt-4">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <div>
                    <span className="font-bold">Akses Terbatas:</span> Hanya staf divisi <strong>Finance</strong> yang diizinkan untuk menandatangani and mencatat tanda pelunasan pembayaran.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Receipt className="w-12 h-12 text-slate-300 mb-2" />
              <div className="text-sm font-semibold">Silakan pilih Invoice terbit di panel kiri</div>
              <p className="text-xs text-center max-w-xs mt-1">Kelola faktur, PPn pajak, jatuh tempo, serta pembukuan pelunasan piutang usaha.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
