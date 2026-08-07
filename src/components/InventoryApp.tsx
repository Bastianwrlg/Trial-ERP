/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { InventoryItem } from "../types";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Trash2, 
  Edit, 
  Check, 
  TrendingUp, 
  Coins, 
  Layers, 
  Database,
  ArrowUpDown,
  Filter,
  X
} from "lucide-react";

interface InventoryAppProps {
  inventory: InventoryItem[];
  onRefresh: () => void;
  currentUserRole: string;
  selectedCompanyId?: string;
}

export default function InventoryApp({ inventory, onRefresh, currentUserRole, selectedCompanyId }: InventoryAppProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form State for Adding / Editing
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Bahan Baku");
  const [qty, setQty] = useState(0);
  const [unit, setUnit] = useState("Pcs");
  const [minQty, setMinQty] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");

  // Quick stock change modal state
  const [adjustingItemId, setAdjustingItemId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [adjustType, setAdjustType] = useState<"add" | "sub">("add");

  const categories = ["Semua", "Bahan Baku", "Suku Cadang", "Kemasan", "Lainnya"];

  // Open Edit Form
  const handleStartEdit = (item: InventoryItem) => {
    setIsEditing(item.id);
    setName(item.name);
    setSku(item.sku);
    setCategory(item.category);
    setQty(item.qty);
    setUnit(item.unit);
    setMinQty(item.minQty);
    setUnitPrice(item.unitPrice);
    setSupplier(item.supplier);
    setNotes(item.notes || "");
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setSku("");
    setCategory("Bahan Baku");
    setQty(0);
    setUnit("Pcs");
    setMinQty(0);
    setUnitPrice(0);
    setSupplier("");
    setNotes("");
  };

  // Submit Add / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      sku,
      category,
      qty: Number(qty),
      unit,
      minQty: Number(minQty),
      unitPrice: Number(unitPrice),
      supplier,
      notes,
      companyId: selectedCompanyId
    };

    try {
      if (isEditing) {
        const res = await fetch(`/api/inventory/${isEditing}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsEditing(null);
          onRefresh();
          resetForm();
        }
      } else {
        const res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsAdding(false);
          onRefresh();
          resetForm();
        }
      }
    } catch (err) {
      console.error("Error saving inventory item:", err);
    }
  };

  // Handle stock adjustment (restock or dispense)
  const handleStockAdjustment = async () => {
    if (!adjustingItemId) return;
    const adjustQty = adjustType === "add" ? adjustAmount : -adjustAmount;

    try {
      const res = await fetch(`/api/inventory/${adjustingItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustQty })
      });
      if (res.ok) {
        setAdjustingItemId(null);
        setAdjustAmount(1);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bahan/stok ini dari inventaris?")) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filters and Search
  const filteredItems = inventory.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const totalItemsCount = inventory.length;
  const lowStockItemsCount = inventory.filter(i => i.qty <= i.minQty).length;
  const totalAssetValue = inventory.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);

  const isAdminOrFinanceOrProd = ['admin', 'production', 'finance'].includes(currentUserRole);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Modul Manajemen Inventaris & Bahan Baku
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau stok bahan mentah produksi, lakukan restoking, and pastikan ketersediaan HPP/RAB pabrik terjamin aman.
          </p>
        </div>

        {isAdminOrFinanceOrProd && !isAdding && !isEditing && (
          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Input Bahan Baku Baru
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Total Jenis Barang</span>
              <div className="text-xl font-black text-slate-800 mt-0.5">{totalItemsCount} Item</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-4">
            <div className={`p-3 rounded-lg shrink-0 ${lowStockItemsCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Bahan Perlu Restok (Low Stock)</span>
              <div className="text-xl font-black text-slate-800 mt-0.5">
                {lowStockItemsCount > 0 ? (
                  <span className="text-amber-600 font-black">{lowStockItemsCount} Item</span>
                ) : (
                  <span className="text-emerald-600">Semua Aman</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Total Estimasi Nilai Aset</span>
              <div className="text-xl font-black text-slate-800 mt-0.5">
                Rp {totalAssetValue.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col min-h-[400px]">
            {/* Filter and Search actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, SKU, supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold hidden md:inline">Kategori:</span>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold w-full sm:w-auto overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-md transition whitespace-nowrap ${
                        selectedCategory === cat 
                          ? "bg-white text-indigo-600 shadow-xs" 
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inventory List Table */}
            <div className="overflow-x-auto flex-1">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-center text-xs h-full">
                  <Database className="w-12 h-12 text-slate-300 mb-2" />
                  <span className="font-bold text-slate-600">Tidak Ada Data Inventaris</span>
                  <p className="mt-1">Tidak ada item bahan baku yang cocok dengan pencarian / filter Anda.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold border-b text-[10px] uppercase">
                      <th className="p-3">Info Barang</th>
                      <th className="p-3 text-center">Stok Saat Ini</th>
                      <th className="p-3">Harga Satuan</th>
                      <th className="p-3">Supplier Utama</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item) => {
                      const isLow = item.qty <= item.minQty;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3 max-w-xs">
                            <div className="font-bold text-slate-800">{item.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded font-semibold">{item.sku}</span>
                              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded-full border border-indigo-100/50">{item.category}</span>
                            </div>
                            {item.notes && (
                              <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1">{item.notes}</p>
                            )}
                          </td>
                          
                          <td className="p-3">
                            <div className="flex flex-col items-center justify-center">
                              <span className={`font-black text-sm px-2.5 py-1 rounded-md ${
                                isLow ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-slate-100 text-slate-700"
                              }`}>
                                {item.qty} {item.unit}
                              </span>
                              {isLow && (
                                <span className="text-[9px] text-amber-600 font-extrabold flex items-center gap-0.5 mt-1">
                                  <AlertTriangle className="w-2.5 h-2.5 shrink-0" /> Low Stock (&lt;= {item.minQty})
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3 font-semibold text-slate-700">
                            Rp {item.unitPrice.toLocaleString("id-ID")}
                            <div className="text-[9px] text-slate-400 font-normal mt-0.5">Total: Rp {(item.qty * item.unitPrice).toLocaleString("id-ID")}</div>
                          </td>

                          <td className="p-3">
                            <span className="font-medium text-slate-600">{item.supplier || "-"}</span>
                            {item.lastRestocked && (
                              <div className="text-[9px] text-slate-400 mt-0.5">Restok: {item.lastRestocked}</div>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Adjustment Button */}
                              {isAdminOrFinanceOrProd && (
                                <>
                                  <button
                                    onClick={() => {
                                      setAdjustingItemId(item.id);
                                      setAdjustType("add");
                                    }}
                                    title="Tambah / Kurangi Stok"
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded text-[11px] transition"
                                  >
                                    Stok +/-
                                  </button>

                                  <button
                                    onClick={() => handleStartEdit(item)}
                                    title="Edit Detail Barang"
                                    className="p-1 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded transition"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {currentUserRole === 'admin' && (
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  title="Hapus Barang"
                                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Side Panel: Form Input / Adjustment Dialog */}
          <div className="space-y-4">
            {/* Form Add / Edit */}
            {isAdding || isEditing ? (
              <div className="bg-white border border-indigo-200 rounded-xl p-5 shadow-sm ring-1 ring-indigo-100 animate-fade-in">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-600" />
                    {isEditing ? "Edit Bahan Baku / Stok" : "Tambah Bahan Baku Baru"}
                  </h4>
                  <button onClick={handleCancel} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Nama Barang / Bahan Baku *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Plat Besi 3mm, Cat RAL-9010"
                      className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">SKU / Kode Barang</label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="RAW-PLT-009"
                        className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Kategori</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-1.5 border rounded bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Bahan Baku">Bahan Baku</option>
                        <option value="Suku Cadang">Suku Cadang</option>
                        <option value="Kemasan">Kemasan</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Qty Awal</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={qty}
                        disabled={!!isEditing} // qty adjustments should use the +/- buttons for audit trace
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Satuan</label>
                      <input
                        type="text"
                        required
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="Lembar/Kg/Pcs"
                        className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Batas Minimum</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={minQty}
                        onChange={(e) => setMinQty(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Harga Satuan (HPP)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Supplier Utama</label>
                      <input
                        type="text"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        placeholder="PT Maju Sejahtera"
                        className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Catatan Tambahan</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Spesifikasi bahan, grade besi, ketebalan, dll..."
                      className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none h-16 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 shadow-xs"
                    >
                      {isEditing ? "Simpan Perubahan" : "Simpan Bahan Baku"}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* Quick stock +/- adjust widget */}
            {adjustingItemId && (
              <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-5 shadow-lg animate-fade-in">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5" /> Penyesuaian Stok Cepat
                  </h4>
                  <button 
                    onClick={() => setAdjustingItemId(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="font-bold text-sm text-slate-200">
                    {inventory.find(i => i.id === adjustingItemId)?.name}
                  </div>

                  {/* Toggle Type */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setAdjustType("add")}
                      className={`py-1.5 rounded text-xs font-bold transition ${
                        adjustType === "add" 
                          ? "bg-emerald-600 text-white shadow" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      ➕ Restok / Tambah
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType("sub")}
                      className={`py-1.5 rounded text-xs font-bold transition ${
                        adjustType === "sub" 
                          ? "bg-red-600 text-white shadow" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      ➖ Pakai / Kurangi
                    </button>
                  </div>

                  {/* Quantity to adjust */}
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Jumlah Unit ({inventory.find(i => i.id === adjustingItemId)?.unit})</label>
                    <input
                      type="number"
                      min="1"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded font-bold text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setAdjustingItemId(null)}
                      className="px-3 py-1.5 border border-slate-700 rounded text-slate-300 hover:bg-slate-800"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleStockAdjustment}
                      className={`px-4 py-1.5 rounded font-black text-white shadow ${
                        adjustType === "add" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      Konfirmasi Update
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instruction Help Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-xs space-y-2">
              <h5 className="font-bold text-slate-800 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                💡 Alur Integrasi Inventaris
              </h5>
              <p className="text-slate-500 leading-relaxed">
                Stok yang diinput di modul ini secara langsung merefleksikan persediaan riil pabrik. 
              </p>
              <ul className="list-disc list-inside text-slate-500 space-y-1">
                <li>Bahan baku digunakan oleh Divisi Estimator saat menyusun <strong>Costing HPP & RAB SPK</strong>.</li>
                <li>Divisi Operator Produksi memantau lot bahan baku saat memasukkan data **Uji Oven**.</li>
                <li>Lakukan audit stok secara berkala menggunakan fitur penyesuaian cepat <strong className="text-indigo-600">Stok +/-</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
