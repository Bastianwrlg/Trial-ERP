/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { QaChecklist } from "../types";
import { 
  ShieldCheck, Check, X, ShieldAlert, Star, 
  Ruler, Eye, Settings, FileText, Sparkles 
} from "lucide-react";

interface QaAppProps {
  checklists: QaChecklist[];
  onRefresh: () => void;
  currentUserRole: string;
  currentUsername: string;
}

export default function QaApp({ checklists, onRefresh, currentUserRole, currentUsername }: QaAppProps) {
  const [selectedCheck, setSelectedCheck] = useState<QaChecklist | null>(null);

  // Form states for active inspection
  const [dimensionCheck, setDimensionCheck] = useState<'Pass' | 'Fail' | 'N/A'>('Pass');
  const [visualCheck, setVisualCheck] = useState<'Pass' | 'Fail' | 'N/A'>('Pass');
  const [functionalCheck, setFunctionalCheck] = useState<'Pass' | 'Fail' | 'N/A'>('Pass');
  const [mutuRating, setMutuRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [remarks, setRemarks] = useState("");

  const selectCheck = (c: QaChecklist) => {
    setSelectedCheck(c);
    setDimensionCheck(c.dimensionCheck === 'N/A' ? 'Pass' : c.dimensionCheck);
    setVisualCheck(c.visualCheck === 'N/A' ? 'Pass' : c.visualCheck);
    setFunctionalCheck(c.functionalCheck === 'N/A' ? 'Pass' : c.functionalCheck);
    setMutuRating(c.mutuRating);
    setRemarks(c.remarks);
  };

  const handleInspect = async (status: 'Passed' | 'Failed') => {
    if (!selectedCheck) return;
    try {
      const res = await fetch(`/api/qa-checklists/${selectedCheck.id}/inspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectorName: currentUsername,
          dimensionCheck,
          visualCheck,
          functionalCheck,
          mutuRating,
          remarks,
          status
        })
      });
      if (res.ok) {
        onRefresh();
        const updated = await res.json();
        setSelectedCheck(updated);
        alert(status === 'Passed' 
          ? "Uji mutu Passed! Surat Jalan pengiriman barang otomatis diterbitkan." 
          : "Uji mutu Failed! SPK diturunkan kembali ke tahapan Produksi untuk direparasi."
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const hasAccessToQa = currentUserRole === 'admin' || currentUserRole === 'qa';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-800">Modul Quality Control & QA (Mutu)</h2>
        <p className="text-xs text-slate-500 mt-1">Lakukan verifikasi mutu dimensi, visual, and uji fungsional sebelum diterbitkan ke gudang pengiriman</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* QA List Panel */}
        <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Antrean Uji Mutu</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {checklists.map((c) => (
              <div
                key={c.id}
                onClick={() => selectCheck(c)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition ${
                  selectedCheck?.id === c.id ? "bg-violet-50/50 border-l-4 border-violet-700" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-xs text-slate-500">SPK Ref: {c.spkNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    c.status === 'Passed' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {c.status === 'Passed' ? 'Lolos (Passed)' : 'Pending / Gagal'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-xs mb-1">Inspektur: {c.inspectorName || 'Belum diisi'}</h4>
                <div className="flex justify-between items-center text-xs text-slate-500 mt-2 border-t pt-1.5 border-slate-100">
                  <span className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < c.mutuRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </span>
                  <span>{c.checkDate}</span>
                </div>
              </div>
            ))}
            {checklists.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">Belum ada tugas inspeksi QA. Setelah operator produksi menyelesaikan pembuatan fisik, antrean uji kelayakan akan tampil di sini secara real-time.</div>
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="flex-1 bg-white overflow-y-auto p-6 flex flex-col">
          {selectedCheck ? (
            <div className="max-w-4xl flex-1 flex flex-col">
              {/* Card top bar */}
              <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-r from-slate-50 to-white shadow-xs mb-6">
                <div>
                  <span className="text-xs text-violet-700 font-bold bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">Sertifikasi & Verifikasi Mutu</span>
                  <h3 className="text-xl font-black text-slate-800 mt-2">Uji Kelayakan SPK {selectedCheck.spkNumber}</h3>
                  <p className="text-xs text-slate-500 mt-1">Diinspeksi oleh: <strong className="text-slate-700">{selectedCheck.inspectorName}</strong> | Tanggal Audit: {selectedCheck.checkDate}</p>
                </div>
              </div>

              {/* Form Content */}
              <div className="space-y-6">
                {/* Visual Check Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Dimension */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/30 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <Ruler className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-xs text-slate-700 uppercase">1. Uji Dimensi & Ukuran</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3">Kesesuaian ketebalan bodi plat besi dan presisi engsel box panel.</p>
                    {hasAccessToQa && selectedCheck.status !== 'Passed' ? (
                      <div className="flex gap-1.5 mt-auto">
                        {['Pass', 'Fail', 'N/A'].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setDimensionCheck(v as any)}
                            className={`flex-1 text-xs py-1 rounded font-bold border transition ${
                              dimensionCheck === v
                                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-700">Hasil: {selectedCheck.dimensionCheck}</span>
                    )}
                  </div>

                  {/* Visual */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/30 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-xs text-slate-700 uppercase">2. Uji Visual & Cat</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3">Ketebalan cat oven powder coating RAL-7035, kehalusan permukaan tanpa baret.</p>
                    {hasAccessToQa && selectedCheck.status !== 'Passed' ? (
                      <div className="flex gap-1.5 mt-auto">
                        {['Pass', 'Fail', 'N/A'].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setVisualCheck(v as any)}
                            className={`flex-1 text-xs py-1 rounded font-bold border transition ${
                              visualCheck === v
                                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-700">Hasil: {selectedCheck.visualCheck}</span>
                    )}
                  </div>

                  {/* Functional */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/30 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-xs text-slate-700 uppercase">3. Uji Fungsi Mekanikal</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3">Kelancaran buka tutup pintu box panel and fungsi kuncian mekanis.</p>
                    {hasAccessToQa && selectedCheck.status !== 'Passed' ? (
                      <div className="flex gap-1.5 mt-auto">
                        {['Pass', 'Fail', 'N/A'].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setFunctionalCheck(v as any)}
                            className={`flex-1 text-xs py-1 rounded font-bold border transition ${
                              functionalCheck === v
                                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-700">Hasil: {selectedCheck.functionalCheck}</span>
                    )}
                  </div>
                </div>

                {/* Rating Mutu & Suhu Feedback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                  <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                    <h4 className="font-bold text-xs text-slate-600 uppercase mb-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Rating Kualitas Mutu (Skala Bintang)
                    </h4>
                    <p className="text-[10px] text-slate-400 mb-3">Nilai keunggulan pengerjaan fisik produk.</p>
                    {hasAccessToQa && selectedCheck.status !== 'Passed' ? (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setMutuRating(val as any)}
                            className="p-1 text-slate-300 hover:scale-110 transition"
                          >
                            <Star className={`w-6 h-6 ${val <= mutuRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < selectedCheck.mutuRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                    <h4 className="font-bold text-xs text-slate-600 uppercase mb-2">Audit Suhu Oven Manufaktur</h4>
                    <p className="text-[10px] text-slate-400 mb-3">Analisis apakah proses oven memenuhi kualifikasi ideal 20°C - 28°C.</p>
                    {selectedCheck.temperaturePass ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                        <Check className="w-3.5 h-3.5" /> Suhu Memenuhi Standar Oven ✓
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-800 text-xs font-semibold rounded-full border border-red-200">
                        <X className="w-3.5 h-3.5" /> Deviasi Suhu Oven Terlalu Tinggi ❌
                      </div>
                    )}
                  </div>
                </div>

                {/* Remarks & Notes */}
                <div className="border-t border-slate-100 pt-6">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Review & Rekomendasi Inspektur</label>
                  {hasAccessToQa && selectedCheck.status !== 'Passed' ? (
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Tulis ulasan teknis, toleransi ukuran atau tindak lanjut di sini..."
                      className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-violet-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-slate-700 text-sm italic bg-slate-50 p-3 rounded-lg border">{selectedCheck.remarks}</p>
                  )}
                </div>

                {/* Form Buttons */}
                {hasAccessToQa && selectedCheck.status !== 'Passed' && (
                  <div className="border-t border-slate-100 pt-6 flex justify-end gap-2">
                    <button
                      onClick={() => handleInspect('Failed')}
                      className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 font-semibold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Reject (Gagal / Rework)
                    </button>
                    <button
                      onClick={() => handleInspect('Passed')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve & Lolos Mutu (Y)
                    </button>
                  </div>
                )}

                {/* Warning on missing permissions */}
                {!hasAccessToQa && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2 text-xs mt-6">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <div>
                      <span className="font-bold">Akses Terbatas:</span> Hanya auditor/inspektur <strong>QA</strong> yang diijinkan menyetujui and menandatangani kelayakan mutu produk.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <ShieldCheck className="w-12 h-12 text-slate-300 mb-2" />
              <div className="text-sm font-semibold">Silakan pilih tugas inspeksi di panel kiri</div>
              <p className="text-xs text-center max-w-xs mt-1">Uji kelayakan fungsional, visual, serta ketebalan bodi untuk menentukan status Passed (Lolos) atau Failed (Rework).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
