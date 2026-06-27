/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Spk } from "../types";
import { 
  Briefcase, CheckCircle, Clock, FileSpreadsheet, 
  Settings, Users, ShieldAlert, Check, Plus, Trash2, Cpu 
} from "lucide-react";

interface SpkAppProps {
  spks: Spk[];
  onRefresh: () => void;
  currentUserRole: string;
  currentUsername: string;
}

export default function SpkApp({ spks, onRefresh, currentUserRole, currentUsername }: SpkAppProps) {
  const [selectedSpk, setSelectedSpk] = useState<Spk | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'rab' | 'engineering'>('info');

  // HPP / RAB temporary form state
  const [rabMaterials, setRabMaterials] = useState<{ name: string; qty: number; cost: number }[]>([
    { name: "Plate Steel 2mm", qty: 2, cost: 800000 },
    { name: "Powder Coating Grey", qty: 1, cost: 450000 }
  ]);
  const [rabLabor, setRabLabor] = useState<{ task: string; hours: number; rate: number }[]>([
    { task: "Welding", hours: 8, rate: 100000 }
  ]);
  const [rabOverhead, setRabOverhead] = useState<{ name: string; cost: number }[]>([
    { name: "Utility", cost: 500000 }
  ]);

  // Engineering temporary form state
  const [designName, setDesignName] = useState("");
  const [engMachines, setEngMachines] = useState<{ machineName: string; hoursNeeded: number }[]>([
    { machineName: "CNC Milling", hoursNeeded: 4 }
  ]);
  const [engSteps, setEngSteps] = useState<{ step: number; description: string; estDuration: string }[]>([
    { step: 1, description: "Potong plat besi", estDuration: "2 Jam" }
  ]);

  const selectSpk = (spk: Spk) => {
    setSelectedSpk(spk);
    setActiveTab('info');
    
    // Seed forms from current values if they exist
    if (spk.hppRab) {
      setRabMaterials(spk.hppRab.materialsBudget.map(m => ({ name: m.name, qty: m.qty, cost: m.cost })));
      setRabLabor(spk.hppRab.laborBudget.map(l => ({ task: l.task, hours: l.hours, rate: l.rate })));
      setRabOverhead(spk.hppRab.overheadBudget);
    } else {
      setRabMaterials([{ name: "Plate Steel 2mm", qty: 2, cost: 800000 }]);
      setRabLabor([{ task: "Welding", hours: 8, rate: 100000 }]);
      setRabOverhead([{ name: "Utility & Konsumsi", cost: 500000 }]);
    }

    if (spk.engineering) {
      setDesignName(spk.engineering.designName);
      setEngMachines(spk.engineering.machines);
      setEngSteps(spk.engineering.processSteps);
    } else {
      setDesignName("Layout_Custom_Panel_" + spk.number.replace(/\//g, "_") + ".pdf");
      setEngMachines([{ machineName: "CNC Laser Cutting", hoursNeeded: 4 }]);
      setEngSteps([{ step: 1, description: "Potong plat besi sesuai sketsa rancangan", estDuration: "3 Jam" }]);
    }
  };

  const handleSaveRab = async () => {
    if (!selectedSpk) return;
    try {
      const res = await fetch(`/api/spks/${selectedSpk.id}/hpp-rab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialsBudget: rabMaterials,
          laborBudget: rabLabor,
          overheadBudget: rabOverhead,
          updatedBy: currentUsername
        })
      });
      if (res.ok) {
        onRefresh();
        const updated = await res.json();
        setSelectedSpk(updated);
        alert("HPP / RAB berhasil disimpan dan disetujui!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEngineering = async () => {
    if (!selectedSpk) return;
    try {
      const res = await fetch(`/api/spks/${selectedSpk.id}/engineering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designName,
          machines: engMachines,
          processSteps: engSteps,
          updatedBy: currentUsername
        })
      });
      if (res.ok) {
        onRefresh();
        const updated = await res.json();
        setSelectedSpk(updated);
        alert("Rancangan Engineering & Mesin berhasil disimpan dan disetujui!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const hasAccessToRab = currentUserRole === 'admin' || currentUserRole === 'finance';
  const hasAccessToEng = currentUserRole === 'admin' || currentUserRole === 'engineering';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-800">Modul Surat Perintah Kerja (SPK)</h2>
        <p className="text-xs text-slate-500 mt-1">Otorisasi pengerjaan, estimasi biaya RAB (HPP), and spesifikasi rekayasa mesin</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left SPK List */}
        <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daftar Dokumen SPK Aktif</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {spks.map((spk) => (
              <div
                key={spk.id}
                onClick={() => selectSpk(spk)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition ${
                  selectedSpk?.id === spk.id ? "bg-violet-50/50 border-l-4 border-violet-700" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-xs text-slate-500">{spk.number}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    spk.status === 'Completed' || spk.status === 'Ready for Delivery' || spk.status === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : spk.status === 'In Production'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {spk.status === 'In Production' ? 'Di Produksi' : spk.status === 'Pending' ? 'Perlu RAB & Eng' : spk.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{spk.customerName}</h4>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-red-400" /> Deadline: {spk.deadline}</span>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Ref: {spk.quotationNumber}</span>
                </div>
              </div>
            ))}
            {spks.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">Belum ada SPK aktif. Harap setujui Penawaran di Modul Sales terlebih dahulu.</div>
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="flex-1 bg-white overflow-y-auto p-6 flex flex-col">
          {selectedSpk ? (
            <div className="max-w-4xl flex-1 flex flex-col">
              {/* Top Header Card */}
              <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-r from-slate-50 to-white shadow-xs mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-violet-700 font-bold bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">Surat Perintah Kerja (SPK)</span>
                    <h3 className="text-2xl font-black text-slate-800 mt-2">{selectedSpk.number}</h3>
                    <p className="text-xs text-slate-500 mt-1">Pemesan: <strong className="text-slate-700">{selectedSpk.customerName}</strong> | Tanggal Terbit: {selectedSpk.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase font-bold block">Status SPK</span>
                    <span className="text-lg font-black text-slate-800 uppercase tracking-wider">{selectedSpk.status}</span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs: Info, HPP/RAB, Engineering */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-2 px-4 text-sm font-bold border-b-2 transition ${
                    activeTab === 'info' ? 'border-violet-700 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Informasi Umum
                </button>
                <button
                  onClick={() => setActiveTab('rab')}
                  className={`py-2 px-4 text-sm font-bold border-b-2 transition flex items-center gap-1 ${
                    activeTab === 'rab' ? 'border-violet-700 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" /> 1. Costing (HPP / RAB)
                  {selectedSpk.hppRab ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('engineering')}
                  className={`py-2 px-4 text-sm font-bold border-b-2 transition flex items-center gap-1 ${
                    activeTab === 'engineering' ? 'border-violet-700 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Cpu className="w-4 h-4" /> 2. Desain & Mesin (Engineering)
                  {selectedSpk.engineering ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                      <h4 className="font-bold text-sm text-slate-700 mb-2">Metadata Penjualan</h4>
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div><span className="font-semibold text-slate-500">Rujukan Penawaran:</span> {selectedSpk.quotationNumber}</div>
                        <div><span className="font-semibold text-slate-500">Batas Deadline:</span> {selectedSpk.deadline}</div>
                        <div><span className="font-semibold text-slate-500">Catatan Internal:</span> {selectedSpk.notes || '-'}</div>
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-700 mb-2">Kesiapan Produksi</h4>
                        <p className="text-xs text-slate-500 mb-4">Pengerjaan di lantai produksi hanya bisa dimulai setelah Estimasi RAB disubmit oleh Tim Keuangan dan Spesifikasi Rekayasa disubmit oleh Tim Engineering.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3 h-3 rounded-full ${selectedSpk.hppRab ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          <span className="text-xs font-semibold text-slate-600">RAB Approved</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3 h-3 rounded-full ${selectedSpk.engineering ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          <span className="text-xs font-semibold text-slate-600">Design Approved</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedSpk.status === 'Pending' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-start gap-2 text-xs">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">SPK Menunggu Pengisian Data (Pending)</div>
                        <p className="mt-1">Untuk memulai siklus manufaktur, silakan isi tab <strong>Costing (HPP/RAB)</strong> (sebagai Finance/Admin) dan tab <strong>Desain & Mesin</strong> (sebagai Engineer/Admin). Setelah keduanya disimpan, SPK akan otomatis diluncurkan ke Modul Produksi.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* HPP / RAB Tab */}
              {activeTab === 'rab' && (
                <div className="space-y-6">
                  {!hasAccessToRab && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2 text-xs">
                      <ShieldAlert className="w-5 h-5 text-red-600" />
                      <div>
                        <span className="font-bold">Akses Ditolak!</span> Menu ini hanya bisa diakses oleh pengguna dengan role <strong>Finance</strong> atau <strong>Admin</strong>.
                      </div>
                    </div>
                  )}

                  {/* RAB Form or View */}
                  {selectedSpk.hppRab ? (
                    <div className="border border-slate-200 rounded-lg p-5">
                      <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-600" /> Rincian Budget HPP / RAB (Disetujui)
                        </h4>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded border border-emerald-200">
                          Disusun oleh: {selectedSpk.hppRab.updatedBy} ({selectedSpk.hppRab.updatedAt})
                        </span>
                      </div>

                      {/* Display RAB Table */}
                      <div className="space-y-4 text-xs">
                        <div>
                          <div className="font-bold text-slate-700 mb-1.5">A. Anggaran Bahan Baku (Bahan)</div>
                          <table className="w-full border text-left rounded overflow-hidden">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                                <th className="p-2">Nama Bahan</th>
                                <th className="p-2 w-20 text-center">Qty</th>
                                <th className="p-2 text-right">Biaya Satuan</th>
                                <th className="p-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedSpk.hppRab.materialsBudget.map((m, i) => (
                                <tr key={i} className="border-b">
                                  <td className="p-2 font-medium">{m.name}</td>
                                  <td className="p-2 text-center">{m.qty}</td>
                                  <td className="p-2 text-right">{formatCurrency(m.cost)}</td>
                                  <td className="p-2 text-right font-semibold">{formatCurrency(m.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <div className="font-bold text-slate-700 mb-1.5">B. Anggaran Tenaga Kerja (Labor)</div>
                          <table className="w-full border text-left rounded overflow-hidden">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                                <th className="p-2">Uraian Pekerjaan</th>
                                <th className="p-2 w-20 text-center">Jam</th>
                                <th className="p-2 text-right">Tarif / Jam</th>
                                <th className="p-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedSpk.hppRab.laborBudget.map((l, i) => (
                                <tr key={i} className="border-b">
                                  <td className="p-2 font-medium">{l.task}</td>
                                  <td className="p-2 text-center">{l.hours}</td>
                                  <td className="p-2 text-right">{formatCurrency(l.rate)}</td>
                                  <td className="p-2 text-right font-semibold">{formatCurrency(l.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <div className="font-bold text-slate-700 mb-1.5">C. Anggaran Overhead (Peralatan, Listrik, dsb)</div>
                          <table className="w-full border text-left rounded overflow-hidden">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                                <th className="p-2">Uraian Biaya</th>
                                <th className="p-2 text-right">Estimasi Biaya</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedSpk.hppRab.overheadBudget.map((o, i) => (
                                <tr key={i} className="border-b">
                                  <td className="p-2 font-medium">{o.name}</td>
                                  <td className="p-2 text-right font-semibold">{formatCurrency(o.cost)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="border-t pt-4 flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-700">Total Anggaran (Estimasi HPP):</span>
                          <span className="font-black text-violet-700 text-lg">{formatCurrency(selectedSpk.hppRab.totalBudget)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    hasAccessToRab && (
                      <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50">
                        <h4 className="font-bold text-slate-800 text-sm mb-4">Lengkapi Estimasi Anggaran (RAB/HPP)</h4>
                        
                        <div className="space-y-4">
                          {/* Materials Form */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-slate-700">A. Anggaran Bahan Baku (Bahan)</span>
                              <button
                                type="button"
                                onClick={() => setRabMaterials([...rabMaterials, { name: "", qty: 1, cost: 0 }])}
                                className="text-[10px] text-violet-600 bg-white border px-2 py-1 rounded"
                              >
                                + Tambah Bahan
                              </button>
                            </div>
                            <div className="space-y-2">
                              {rabMaterials.map((m, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    placeholder="Nama Plat / Cat / Kabel"
                                    value={m.name}
                                    onChange={(e) => {
                                      const updated = [...rabMaterials];
                                      updated[idx].name = e.target.value;
                                      setRabMaterials(updated);
                                    }}
                                    className="flex-1 px-3 py-1.5 border rounded text-xs"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Qty"
                                    value={m.qty}
                                    onChange={(e) => {
                                      const updated = [...rabMaterials];
                                      updated[idx].qty = Number(e.target.value);
                                      setRabMaterials(updated);
                                    }}
                                    className="w-16 px-3 py-1.5 border rounded text-xs text-center"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Biaya Satuan"
                                    value={m.cost}
                                    onChange={(e) => {
                                      const updated = [...rabMaterials];
                                      updated[idx].cost = Number(e.target.value);
                                      setRabMaterials(updated);
                                    }}
                                    className="w-32 px-3 py-1.5 border rounded text-xs"
                                  />
                                  <button
                                    onClick={() => setRabMaterials(rabMaterials.filter((_, i) => i !== idx))}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Labor Form */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-slate-700">B. Anggaran Tenaga Kerja (Labor)</span>
                              <button
                                type="button"
                                onClick={() => setRabLabor([...rabLabor, { task: "", hours: 8, rate: 100000 }])}
                                className="text-[10px] text-violet-600 bg-white border px-2 py-1 rounded"
                              >
                                + Tambah Pekerjaan
                              </button>
                            </div>
                            <div className="space-y-2">
                              {rabLabor.map((l, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    placeholder="Uraian (Welding, Wiring, Assembler)"
                                    value={l.task}
                                    onChange={(e) => {
                                      const updated = [...rabLabor];
                                      updated[idx].task = e.target.value;
                                      setRabLabor(updated);
                                    }}
                                    className="flex-1 px-3 py-1.5 border rounded text-xs"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Jam"
                                    value={l.hours}
                                    onChange={(e) => {
                                      const updated = [...rabLabor];
                                      updated[idx].hours = Number(e.target.value);
                                      setRabLabor(updated);
                                    }}
                                    className="w-16 px-3 py-1.5 border rounded text-xs text-center"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Tarif per Jam"
                                    value={l.rate}
                                    onChange={(e) => {
                                      const updated = [...rabLabor];
                                      updated[idx].rate = Number(e.target.value);
                                      setRabLabor(updated);
                                    }}
                                    className="w-32 px-3 py-1.5 border rounded text-xs"
                                  />
                                  <button
                                    onClick={() => setRabLabor(rabLabor.filter((_, i) => i !== idx))}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Overhead Form */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-slate-700">C. Anggaran Overhead (Konsumsi, Listrik, dsb)</span>
                              <button
                                type="button"
                                onClick={() => setRabOverhead([...rabOverhead, { name: "", cost: 0 }])}
                                className="text-[10px] text-violet-600 bg-white border px-2 py-1 rounded"
                              >
                                + Tambah Biaya
                              </button>
                            </div>
                            <div className="space-y-2">
                              {rabOverhead.map((o, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    placeholder="Jenis Overhead"
                                    value={o.name}
                                    onChange={(e) => {
                                      const updated = [...rabOverhead];
                                      updated[idx].name = e.target.value;
                                      setRabOverhead(updated);
                                    }}
                                    className="flex-1 px-3 py-1.5 border rounded text-xs"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Biaya"
                                    value={o.cost}
                                    onChange={(e) => {
                                      const updated = [...rabOverhead];
                                      updated[idx].cost = Number(e.target.value);
                                      setRabOverhead(updated);
                                    }}
                                    className="w-40 px-3 py-1.5 border rounded text-xs"
                                  />
                                  <button
                                    onClick={() => setRabOverhead(rabOverhead.filter((_, i) => i !== idx))}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-200 mt-6 pt-4 flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-700">Estimasi Pengeluaran Total:</span>
                          <span className="font-bold text-violet-700">
                            {formatCurrency(
                              rabMaterials.reduce((sum, m) => sum + (m.qty * m.cost), 0) +
                              rabLabor.reduce((sum, l) => sum + (l.hours * l.rate), 0) +
                              rabOverhead.reduce((sum, o) => sum + Number(o.cost), 0)
                            )}
                          </span>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                          <button
                            onClick={handleSaveRab}
                            className="bg-violet-700 text-white font-semibold text-xs px-4 py-2 rounded shadow hover:bg-violet-800 transition"
                          >
                            Simpan & Setujui Anggaran RAB (Y)
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Engineering Tab */}
              {activeTab === 'engineering' && (
                <div className="space-y-6">
                  {!hasAccessToEng && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2 text-xs">
                      <ShieldAlert className="w-5 h-5 text-red-600" />
                      <div>
                        <span className="font-bold">Akses Ditolak!</span> Menu ini hanya bisa diakses oleh pengguna dengan role <strong>Engineering</strong> atau <strong>Admin</strong>.
                      </div>
                    </div>
                  )}

                  {/* Engineering Form or View */}
                  {selectedSpk.engineering ? (
                    <div className="border border-slate-200 rounded-lg p-5">
                      <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-600" /> Spesifikasi Engineering & Proses Manufaktur
                        </h4>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded border border-emerald-200">
                          Disusun oleh: {selectedSpk.engineering.updatedBy} ({selectedSpk.engineering.updatedAt})
                        </span>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">Nama Berkas Desain</span>
                          <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                            📄 {selectedSpk.engineering.designName}
                          </span>
                        </div>

                        <div>
                          <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px] mb-1.5">Alokasi Peralatan & Mesin</span>
                          <div className="grid grid-cols-2 gap-3">
                            {selectedSpk.engineering.machines.map((mac, i) => (
                              <div key={i} className="border p-2.5 rounded bg-slate-50/50 flex justify-between items-center">
                                <span className="font-bold text-slate-700">{mac.machineName}</span>
                                <span className="text-slate-500">{mac.hoursNeeded} Jam</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px] mb-1.5">Rencana Tahapan Proses (SOP)</span>
                          <div className="space-y-2">
                            {selectedSpk.engineering.processSteps.map((step, i) => (
                              <div key={i} className="flex gap-3 border p-2.5 rounded">
                                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs shrink-0">{step.step}</span>
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-800">{step.description}</p>
                                  <span className="text-[10px] text-slate-400">Estimasi Durasi: {step.estDuration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    hasAccessToEng && (
                      <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50">
                        <h4 className="font-bold text-slate-800 text-sm mb-4">Lengkapi Spesifikasi Teknik & Rencana Mesin</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nama File Desain CAD / Gambar Kerja <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={designName}
                              onChange={(e) => setDesignName(e.target.value)}
                              placeholder="layout-panel-box-customer.dwg"
                              className="w-full px-3 py-1.5 border rounded text-xs"
                            />
                          </div>

                          {/* Machines Form */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-slate-700">Mesin yang Digunakan</span>
                              <button
                                type="button"
                                onClick={() => setEngMachines([...engMachines, { machineName: "", hoursNeeded: 2 }])}
                                className="text-[10px] text-violet-600 bg-white border px-2 py-1 rounded"
                              >
                                + Tambah Mesin
                              </button>
                            </div>
                            <div className="space-y-2">
                              {engMachines.map((m, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    placeholder="Nama Mesin (CNC Laser, Bending, Powder Oven)"
                                    value={m.machineName}
                                    onChange={(e) => {
                                      const updated = [...engMachines];
                                      updated[idx].machineName = e.target.value;
                                      setEngMachines(updated);
                                    }}
                                    className="flex-1 px-3 py-1.5 border rounded text-xs"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Jam"
                                    value={m.hoursNeeded}
                                    onChange={(e) => {
                                      const updated = [...engMachines];
                                      updated[idx].hoursNeeded = Number(e.target.value);
                                      setEngMachines(updated);
                                    }}
                                    className="w-20 px-3 py-1.5 border rounded text-xs text-center"
                                  />
                                  <button
                                    onClick={() => setEngMachines(engMachines.filter((_, i) => i !== idx))}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Process Steps */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-slate-700">Rencana Tahapan Proses Kerja</span>
                              <button
                                type="button"
                                onClick={() => setEngSteps([...engSteps, { step: engSteps.length + 1, description: "", estDuration: "1 Jam" }])}
                                className="text-[10px] text-violet-600 bg-white border px-2 py-1 rounded"
                              >
                                + Tambah Tahapan
                              </button>
                            </div>
                            <div className="space-y-2">
                              {engSteps.map((s, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                                  <input
                                    type="text"
                                    placeholder="Uraian langkah pengerjaan..."
                                    value={s.description}
                                    onChange={(e) => {
                                      const updated = [...engSteps];
                                      updated[idx].description = e.target.value;
                                      setEngSteps(updated);
                                    }}
                                    className="flex-1 px-3 py-1.5 border rounded text-xs"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Durasi (e.g. 2 Jam)"
                                    value={s.estDuration}
                                    onChange={(e) => {
                                      const updated = [...engSteps];
                                      updated[idx].estDuration = e.target.value;
                                      setEngSteps(updated);
                                    }}
                                    className="w-28 px-3 py-1.5 border rounded text-xs"
                                  />
                                  <button
                                    onClick={() => setEngSteps(engSteps.filter((_, i) => i !== idx))}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                          <button
                            onClick={handleSaveEngineering}
                            className="bg-violet-700 text-white font-semibold text-xs px-4 py-2 rounded shadow hover:bg-violet-800 transition"
                          >
                            Simpan & Setujui Dokumen Engineering (Y)
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Briefcase className="w-12 h-12 text-slate-300 mb-2" />
              <div className="text-sm font-semibold">Silakan pilih dokumen SPK aktif di samping</div>
              <p className="text-xs text-center max-w-xs mt-1">Anda dapat melengkapi RAB (Finance) atau Gambar Engineering untuk meluncurkan produksi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
