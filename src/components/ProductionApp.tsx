/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ProductionLog } from "../types";
import { 
  Wrench, Play, CheckCircle, Thermometer, Droplets, 
  Layers, User, Clock, AlertTriangle, ShieldAlert 
} from "lucide-react";

interface ProductionAppProps {
  logs: ProductionLog[];
  onRefresh: () => void;
  currentUserRole: string;
}

export default function ProductionApp({ logs, onRefresh, currentUserRole }: ProductionAppProps) {
  const [selectedLog, setSelectedLog] = useState<ProductionLog | null>(null);

  // Form states for active editing of parameters
  const [temperature, setTemperature] = useState<number>(25);
  const [humidity, setHumidity] = useState<number>(55);
  const [operatorName, setOperatorName] = useState("");
  const [mutuCheck, setMutuCheck] = useState("");
  const [notes, setNotes] = useState("");

  const selectLog = (log: ProductionLog) => {
    setSelectedLog(log);
    setTemperature(log.temperature);
    setHumidity(log.humidity || 50);
    setOperatorName(log.operatorName);
    setMutuCheck(log.mutuCheck);
    setNotes(log.notes || "");
  };

  const handleUpdateStatus = async (id: string, nextStatus: 'In Progress' | 'Completed') => {
    if (!selectedLog) return;
    try {
      const res = await fetch(`/api/production-logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          temperature,
          humidity,
          operatorName,
          mutuCheck,
          notes
        })
      });
      if (res.ok) {
        onRefresh();
        const updated = await res.json();
        setSelectedLog(updated);
        alert(nextStatus === 'Completed' ? "Batch produksi selesai! Mengirimkan ke modul inspeksi QA." : "Pekerjaan produksi dimulai.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveParameters = async () => {
    if (!selectedLog) return;
    try {
      const res = await fetch(`/api/production-logs/${selectedLog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature,
          humidity,
          operatorName,
          mutuCheck,
          notes
        })
      });
      if (res.ok) {
        onRefresh();
        const updated = await res.json();
        setSelectedLog(updated);
        alert("Parameter produksi (suhu, kelembaban, mutu) berhasil diupdate.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const hasAccessToEdit = currentUserRole === 'admin' || currentUserRole === 'production';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-800">Modul Produksi & Manufaktur</h2>
        <p className="text-xs text-slate-500 mt-1">Pantau dan update status pembuatan fisik, lot bahan baku, serta suhu oven pemanggangan cat</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Production Batches List */}
        <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Antrean Manufaktur Aktif</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {logs.map((log) => (
              <div
                key={log.id}
                onClick={() => selectLog(log)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition ${
                  selectedLog?.id === log.id ? "bg-violet-50/50 border-l-4 border-violet-700" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-xs text-slate-500">{log.batchNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    log.status === 'Completed' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : log.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {log.status === 'Completed' ? 'Selesai' : log.status === 'In Progress' ? 'Diproses' : 'Draft'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">SPK Ref: {log.spkNumber}</h4>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-500" /> Suhu: {log.temperature}°C</span>
                  <span className="font-semibold text-slate-600">Op: {log.operatorName}</span>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">Belum ada antrean produksi. SPK akan muncul di sini setelah Finance dan Engineering menyetujui anggaran & gambar kerja.</div>
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="flex-1 bg-white overflow-y-auto p-6 flex flex-col">
          {selectedLog ? (
            <div className="max-w-4xl flex-1 flex flex-col">
              {/* Top Banner */}
              <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-r from-slate-50 to-white mb-6 flex justify-between items-center">
                <div>
                  <span className="text-xs text-violet-700 font-bold bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">Siklus Produksi Aktif</span>
                  <h3 className="text-xl font-black text-slate-800 mt-2">Batch {selectedLog.batchNumber}</h3>
                  <p className="text-xs text-slate-500 mt-1">Dasar Surat Perintah Kerja: <strong className="text-slate-700">{selectedLog.spkNumber}</strong></p>
                </div>

                {/* Workflow trigger buttons */}
                {hasAccessToEdit && (
                  <div className="flex gap-2">
                    {selectedLog.status === 'Draft' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedLog.id, 'In Progress')}
                        className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition"
                      >
                        <Play className="w-3.5 h-3.5" /> Mulai Produksi
                      </button>
                    )}
                    {selectedLog.status === 'In Progress' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedLog.id, 'Completed')}
                        className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Selesaikan Produksi
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left side: Bahan baku & Operator */}
                <div className="space-y-4">
                  <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                    <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-violet-600" /> Penggunaan Bahan Baku (Bahan)
                    </h4>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b text-slate-400 font-semibold bg-slate-50">
                          <th className="p-1.5">Nama Bahan</th>
                          <th className="p-1.5 w-16 text-center">Qty</th>
                          <th className="p-1.5">Lot Number / Batch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedLog.materialsUsed.map((m, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-1.5 font-medium text-slate-700">{m.name}</td>
                            <td className="p-1.5 text-center text-slate-600">{m.qty}</td>
                            <td className="p-1.5 text-slate-500 font-mono text-[10px]">{m.lotNumber || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                    <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-violet-600" /> Informasi Operator & Log
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase">Nama Operator Penanggungjawab</label>
                        {selectedLog.status !== 'Completed' && hasAccessToEdit ? (
                          <input
                            type="text"
                            value={operatorName}
                            onChange={(e) => setOperatorName(e.target.value)}
                            placeholder="Contoh: Joko Widodo"
                            className="w-full mt-1 px-3 py-1.5 border rounded text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        ) : (
                          <span className="font-bold text-slate-700 block mt-0.5">{selectedLog.operatorName}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase">Catatan Operator</label>
                        {selectedLog.status !== 'Completed' && hasAccessToEdit ? (
                          <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Catatan pengerjaan..."
                            className="w-full mt-1 px-3 py-1.5 border rounded text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-600 block mt-0.5 text-xs">{selectedLog.notes || '-'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Realtime Parameters (Suhu, Kelembaban, Mutu) */}
                <div className="space-y-4">
                  <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                    <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-red-500 animate-pulse" /> Pengukuran Suhu & Kelembaban (Suhu)
                    </h4>
                    <p className="text-[10px] text-slate-500 mb-3">Suhu oven powder coating harus terjaga di kisaran ideal (20°C - 28°C) agar hasil akhir mulus & cat menempel sempurna.</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white border rounded-lg p-3 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Suhu Oven</span>
                        <div className="text-2xl font-black text-red-500 mt-1">{temperature}°C</div>
                        {selectedLog.status !== 'Completed' && hasAccessToEdit && (
                          <div className="flex justify-center gap-1.5 mt-2">
                            <button onClick={() => setTemperature(prev => prev - 1)} className="bg-slate-100 px-2 py-0.5 text-xs rounded font-bold hover:bg-slate-200">-</button>
                            <button onClick={() => setTemperature(prev => prev + 1)} className="bg-slate-100 px-2 py-0.5 text-xs rounded font-bold hover:bg-slate-200">+</button>
                          </div>
                        )}
                      </div>

                      <div className="bg-white border rounded-lg p-3 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Kelembaban</span>
                        <div className="text-2xl font-black text-blue-500 mt-1">{humidity}%</div>
                        {selectedLog.status !== 'Completed' && hasAccessToEdit && (
                          <div className="flex justify-center gap-1.5 mt-2">
                            <button onClick={() => setHumidity(prev => Math.max(0, prev - 5))} className="bg-slate-100 px-2 py-0.5 text-xs rounded font-bold hover:bg-slate-200">-</button>
                            <button onClick={() => setHumidity(prev => Math.min(100, prev + 5))} className="bg-slate-100 px-2 py-0.5 text-xs rounded font-bold hover:bg-slate-200">+</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alert indicators for temperature limits */}
                    {(temperature < 20 || temperature > 28) ? (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-[10px] rounded flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <strong>Peringatan!</strong> Suhu oven berada di luar rentang ideal 20°C - 28°C. Hal ini berisiko menurunkan nilai uji mutu.
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] rounded flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        Suhu terpantau stabil dalam batas aman.
                      </div>
                    )}
                  </div>

                  <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                    <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Deskripsi Kelayakan Awal (Mutu)
                    </h4>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Checklist Kelayakan Rangka & Finishing</label>
                      {selectedLog.status !== 'Completed' && hasAccessToEdit ? (
                        <textarea
                          rows={2}
                          value={mutuCheck}
                          onChange={(e) => setMutuCheck(e.target.value)}
                          placeholder="Contoh: Pengelasan plat besi kokoh dan cat merekat mulus..."
                          className="w-full px-3 py-1.5 border rounded text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                        />
                      ) : (
                        <p className="text-slate-700 text-xs italic bg-white p-2.5 rounded border border-slate-100">{selectedLog.mutuCheck}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              {selectedLog.status !== 'Completed' && hasAccessToEdit && (
                <div className="mt-auto border-t pt-4 flex justify-end gap-2">
                  <button
                    onClick={handleSaveParameters}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg transition"
                  >
                    Simpan Perubahan Parameter
                  </button>
                  {selectedLog.status === 'In Progress' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedLog.id, 'Completed')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                    >
                      Konfirmasi Produksi Selesai (Y)
                    </button>
                  )}
                </div>
              )}

              {/* Warning on missing permissions */}
              {!hasAccessToEdit && (
                <div className="mt-auto p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2 text-xs">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <div>
                    <span className="font-bold">Akses Terbatas:</span> Hanya operator <strong>Produksi</strong> yang dapat merekam and menyelesaikan siklus pengerjaan manufaktur.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Wrench className="w-12 h-12 text-slate-300 mb-2" />
              <div className="text-sm font-semibold">Silakan pilih antrean produksi dari panel kiri</div>
              <p className="text-xs text-center max-w-xs mt-1">Gunakan modul ini untuk memasukkan suhu aktual, lot plat besi, and kelayakan mutu dasar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
