/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Quotation, QuotationItem } from "../types";
import { Plus, Check, Archive, ArrowRight, User, Calendar, DollarSign, FileText, Trash2 } from "lucide-react";

interface SalesAppProps {
  quotations: Quotation[];
  onRefresh: () => void;
  currentUserRole: string;
  selectedCompanyId?: string;
}

export default function SalesApp({ quotations, onRefresh, currentUserRole, selectedCompanyId }: SalesAppProps) {
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Omit<QuotationItem, "id">[]>([
    { type: "barang", name: "Panel Box Custom 1000x800", description: "Material Plat Besi 2.0mm Powder Coating Grey RAL 7035 + Aksesoris Busbar", qty: 1, unit: "Unit", price: 8500000 },
    { type: "jasa", name: "Jasa Wiring & Assembly Busbar", description: "Instalasi jalur pengkabelan internal panel, perakitan busbar tembaga, dan uji kontinuitas", qty: 1, unit: "Lot", price: 1500000 }
  ]);

  const handleAddItem = (type: 'barang' | 'jasa' = 'barang') => {
    setItems([...items, { 
      type, 
      name: "", 
      description: type === 'barang' ? "Spesifikasi teknis / material barang..." : "Lingkup pengerjaan jasa / instalasi...", 
      qty: 1, 
      unit: type === 'barang' ? "Unit" : "Lot", 
      price: 0 
    }]);
  };

  const handleItemChange = (index: number, field: keyof Omit<QuotationItem, "id">, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'qty' || field === 'price' ? Number(value) : value
    };
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || items.length === 0) return;

    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          notes,
          items,
          companyId: selectedCompanyId
        })
      });
      if (res.ok) {
        setIsCreating(false);
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setNotes("");
        setItems([
          { type: "barang", name: "Panel Box Custom 1000x800", description: "Material Plat Besi 2.0mm Powder Coating Grey RAL 7035 + Aksesoris Busbar", qty: 1, unit: "Unit", price: 8500000 },
          { type: "jasa", name: "Jasa Wiring & Assembly Busbar", description: "Instalasi jalur pengkabelan internal panel, perakitan busbar tembaga, dan uji kontinuitas", qty: 1, unit: "Lot", price: 1500000 }
        ]);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Approved' | 'Archived') => {
    try {
      const res = await fetch(`/api/quotations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        onRefresh();
        // Update selected view
        const data = await res.json();
        setSelectedQuotation(data.quotation);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuotation = async (id: string, qNumber: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!window.confirm(`Apakah Anda yakin ingin menghapus dokumen penawaran ${qNumber}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        if (selectedQuotation?.id === id) {
          setSelectedQuotation(null);
        }
        onRefresh();
      } else {
        alert("Gagal menghapus penawaran.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus penawaran.");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Module Title / Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Modul Penawaran & Penjualan (CRM)</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola penawaran harga kepada calon pelanggan & konversi otomatis ke SPK</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-violet-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-violet-800 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Buat Penawaran Baru
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Section */}
        {isCreating ? (
          <form onSubmit={handleSubmit} className="flex-1 bg-white p-8 overflow-y-auto max-w-4xl mx-auto my-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-6 flex items-center gap-2 text-violet-700">
              <FileText className="w-5 h-5" /> Formulir Penawaran Baru (Quotation)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Nama Customer <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: PT Angin Ribut Sejahtera"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Customer</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">No. HP / Telepon</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0812-3456-xxxx"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Catatan Tambahan</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Spesifikasi umum / jangka waktu pembayaran..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-slate-800">Daftar Rincian Barang & Jasa</h4>
                  <p className="text-xs text-slate-500">Tentukan kategori, nama produk/jasa, dan deskripsi spesifikasi pengerjaan</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddItem('barang')}
                    className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 hover:bg-sky-100 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Item Barang
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItem('jasa')}
                    className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Item Jasa
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 text-xs tracking-wider font-semibold uppercase">
                      <th className="py-2.5 px-3 w-28">Kategori</th>
                      <th className="py-2.5 px-3">Nama & Deskripsi Pekerjaan</th>
                      <th className="py-2.5 px-3 w-20">Qty</th>
                      <th className="py-2.5 px-3 w-24">Satuan</th>
                      <th className="py-2.5 px-3 w-36">Harga Satuan (Rp)</th>
                      <th className="py-2.5 px-3 w-36 text-right">Subtotal</th>
                      <th className="py-2.5 px-3 w-10 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-3 align-top">
                          <select
                            value={item.type || 'barang'}
                            onChange={(e) => handleItemChange(idx, "type", e.target.value as 'barang' | 'jasa')}
                            className={`w-full text-xs font-bold px-2 py-1.5 rounded border focus:outline-none ${
                              item.type === 'jasa' 
                                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                : 'bg-sky-50 text-sky-800 border-sky-200'
                            }`}
                          >
                            <option value="barang">📦 Barang</option>
                            <option value="jasa">🛠️ Jasa</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 align-top space-y-1.5">
                          <input
                            type="text"
                            required
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                            placeholder={item.type === 'jasa' ? "Contoh: Jasa Instalasi & Setting Busbar" : "Contoh: Panel Box Custom 1000x800"}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm font-semibold focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                            placeholder={item.type === 'jasa' ? "Deskripsi lingkup pengerjaan / instalasi..." : "Deskripsi spesifikasi / dimensi / material..."}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs text-slate-600 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 align-top">
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm text-center focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 align-top">
                          <input
                            type="text"
                            required
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                            placeholder="Unit/Lot/Pcs"
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm text-center focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 align-top">
                          <input
                            type="number"
                            required
                            min="0"
                            value={item.price}
                            onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm text-right focus:ring-1 focus:ring-violet-500 focus:outline-none font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800 align-top font-mono pt-3">
                          {formatCurrency(item.qty * item.price)}
                        </td>
                        <td className="py-2.5 px-3 text-center align-top pt-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-400 hover:text-red-700 font-bold p-1 rounded hover:bg-red-50"
                            title="Hapus baris"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-end mt-6 pr-3">
                <div className="text-slate-500 text-sm">Total Penawaran:</div>
                <div className="text-2xl font-bold text-slate-800">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.qty * item.price), 0))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 mt-8 pt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Batalkan
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-violet-700 text-white font-semibold rounded-lg text-sm shadow-sm hover:bg-violet-800 transition"
              >
                Simpan Penawaran
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Quotation List Side Panel */}
            <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari Penawaran..."
                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {quotations.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuotation(q)}
                    className={`p-4 cursor-pointer hover:bg-slate-50 transition group relative ${
                      selectedQuotation?.id === q.id ? "bg-violet-50/50 border-l-4 border-violet-700" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-xs text-slate-500">{q.number}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          q.status === 'Approved' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : q.status === 'Archived'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {q.status === 'Approved' ? 'Disetujui (Y)' : q.status === 'Archived' ? 'Arsip (N)' : 'Draft'}
                        </span>
                        <button
                          onClick={(e) => handleDeleteQuotation(q.id, q.number, e)}
                          title="Hapus Penawaran"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{q.customerName}</h4>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{q.date}</span>
                      <span className="font-bold text-slate-700">{formatCurrency(q.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Panel */}
            <div className="flex-1 bg-white overflow-y-auto p-6 flex flex-col">
              {selectedQuotation ? (
                <div className="max-w-3xl flex-1 flex flex-col">
                  {/* Status Breadcrumbs in Odoo Style */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Dokumen:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                          selectedQuotation.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Draft / Penawaran
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                          selectedQuotation.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          SPK (Disetujui / Y)
                        </span>
                        {selectedQuotation.status === 'Archived' && (
                          <>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                            <span className="px-2.5 py-1 text-xs font-bold rounded bg-slate-200 text-slate-700">
                              Diarsipkan (Tidak / N)
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action buttons based on current state & role */}
                    <div className="flex items-center gap-2">
                      {selectedQuotation.status === 'Draft' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(selectedQuotation.id, 'Archived')}
                            className="bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-200 flex items-center gap-1 transition"
                          >
                            <Archive className="w-3.5 h-3.5 text-slate-500" /> Tolak & Arsipkan (N)
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(selectedQuotation.id, 'Approved')}
                            className="bg-emerald-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center gap-1 transition shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Setujui & Buat SPK (Y)
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteQuotation(selectedQuotation.id, selectedQuotation.number)}
                        title="Hapus Dokumen Penawaran Ini"
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  {/* Document Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedQuotation.number}</h3>
                      <span className="text-xs text-slate-400">Dibuat pada {selectedQuotation.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider block">Total Penawaran</span>
                      <span className="text-2xl font-black text-violet-700">{formatCurrency(selectedQuotation.total)}</span>
                    </div>
                  </div>

                  {/* Customer Information Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <div className="flex gap-2">
                      <User className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-semibold">Pelanggan</div>
                        <div className="font-bold text-slate-800">{selectedQuotation.customerName}</div>
                        {selectedQuotation.customerEmail && <div className="text-xs text-slate-600">{selectedQuotation.customerEmail}</div>}
                        {selectedQuotation.customerPhone && <div className="text-xs text-slate-600">{selectedQuotation.customerPhone}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Calendar className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-semibold">Detail Transaksi</div>
                        <div className="text-xs text-slate-700 mt-1">
                          <span className="font-semibold text-slate-600">Masa Berlaku:</span> 14 Hari sejak penawaran
                        </div>
                        {selectedQuotation.notes && (
                          <div className="text-xs text-slate-700 mt-1">
                            <span className="font-semibold text-slate-600">Catatan:</span> {selectedQuotation.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product items table */}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">Rincian Barang & Jasa Penawaran</h4>
                    <span className="text-xs text-slate-500 font-medium">{selectedQuotation.items?.length || 0} item terdaftar</span>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                          <th className="py-3 px-4">Kategori & Deskripsi Item</th>
                          <th className="py-3 px-4 text-center">Qty</th>
                          <th className="py-3 px-4">Satuan</th>
                          <th className="py-3 px-4 text-right">Harga (Rp)</th>
                          <th className="py-3 px-4 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedQuotation.items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  item.type === 'jasa' 
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                                }`}>
                                  {item.type === 'jasa' ? 'Jasa' : 'Barang'}
                                </span>
                                <span className="font-semibold text-slate-800">{item.name}</span>
                              </div>
                              {item.description && (
                                <p className="text-xs text-slate-500 mt-1 pl-1 border-l-2 border-slate-200 ml-1 italic">
                                  {item.description}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-700 font-semibold">{item.qty}</td>
                            <td className="py-3 px-4 text-slate-600">{item.unit}</td>
                            <td className="py-3 px-4 text-right text-slate-700 font-mono">{formatCurrency(item.price)}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">{formatCurrency(item.qty * item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Flow feedback message */}
                  {selectedQuotation.status === 'Approved' && (
                    <div className="mt-auto bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-start gap-2.5">
                      <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">✓</span>
                      <div>
                        <div className="font-bold text-sm">Persetujuan Penawaran Selesai (Yes)</div>
                        <div className="text-xs text-emerald-700 mt-0.5">
                          Sistem otomatis meluncurkan Surat Perintah Kerja (SPK) untuk pesanan ini. Anda sekarang dapat mengakses menu <strong>SPK</strong> untuk merumuskan RAB / Costing serta spesifikasi Engineering.
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedQuotation.status === 'Archived' && (
                    <div className="mt-auto bg-slate-100 border border-slate-200 text-slate-800 p-4 rounded-lg flex items-start gap-2.5">
                      <span className="p-1 rounded-full bg-slate-200 text-slate-600">✓</span>
                      <div>
                        <div className="font-bold text-sm">Penawaran Diarsipkan (No)</div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Penawaran ini dinyatakan ditolak oleh customer dan diarsipkan. Alur sistem tidak dilanjutkan ke SPK.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-12 h-12 text-slate-300 mb-2" />
                  <div className="text-sm font-semibold">Silakan pilih penawaran dari daftar di samping</div>
                  <div className="text-xs">Atau buat penawaran baru dengan tombol di pojok kanan atas</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
