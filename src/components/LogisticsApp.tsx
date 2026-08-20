/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { SuratJalan, Company, CompanyId } from "../types";
import { COMPANIES } from "../data/companies";
import { 
  Truck, CheckCircle, Navigation, ShieldAlert, 
  MapPin, User, ShieldCheck, ClipboardList, Calendar,
  Printer
} from "lucide-react";

interface LogisticsAppProps {
  sjList: SuratJalan[];
  onRefresh: () => void;
  currentUserRole: string;
  selectedCompanyId?: CompanyId | null;
  companies?: Company[];
}

export default function LogisticsApp({ 
  sjList, 
  onRefresh, 
  currentUserRole,
  selectedCompanyId,
  companies = COMPANIES
}: LogisticsAppProps) {
  const [selectedSj, setSelectedSj] = useState<SuratJalan | null>(null);

  // Form states
  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const selectSj = (sj: SuratJalan) => {
    setSelectedSj(sj);
    setDriverName(sj.driverName);
    setVehicleNumber(sj.vehicleNumber);
    setDeliveryAddress(sj.deliveryAddress);
  };

  const handleUpdateStatus = async (nextStatus: 'Shipped' | 'Delivered') => {
    if (!selectedSj) return;
    try {
      const res = await fetch(`/api/surat-jalan/${selectedSj.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverName,
          vehicleNumber,
          deliveryAddress,
          status: nextStatus
        })
      });
      if (res.ok) {
        onRefresh();
        const updated = await res.json();
        setSelectedSj(updated);
        alert(nextStatus === 'Delivered' 
          ? "Barang sukses terkirim! Invoice penjualan otomatis diterbitkan di bagian Penagihan." 
          : "Status dirubah: Sedang dalam perjalanan pengiriman."
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedSj) return;
    try {
      const res = await fetch(`/api/surat-jalan/${selectedSj.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverName,
          vehicleNumber,
          deliveryAddress
        })
      });
      if (res.ok) {
        onRefresh();
        const updated = await res.json();
        setSelectedSj(updated);
        alert("Informasi sopir & armada pengiriman berhasil diupdate.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintSuratJalan = (sj: SuratJalan) => {
    const compId = sj.companyId || selectedCompanyId || 'fujiyama';
    const company = companies.find(c => c.id === compId) || companies[0] || COMPANIES[0];

    const printWin = window.open('', '_blank', 'width=900,height=1000');
    if (!printWin) {
      alert("Mohon izinkan pop-up browser untuk mencetak Surat Jalan.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Surat Jalan ${sj.number} - ${company.fullName || company.name}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; font-size: 12px; }
          .no-print-bar { background: #1e1b4b; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .print-btn { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
          .header-letterhead { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 3px double #cbd5e1; margin-bottom: 16px; }
          .company-logo-box { max-width: 180px; max-height: 50px; }
          .company-logo-box img { max-height: 48px; max-width: 180px; object-fit: contain; }
          .company-info { text-align: right; font-size: 10px; color: #475569; line-height: 1.4; }
          .company-name { font-size: 15px; font-weight: 900; color: #0f172a; }
          .doc-title { text-align: center; margin: 16px 0; }
          .doc-title h2 { margin: 0; font-size: 18px; font-weight: 900; letter-spacing: 1px; }
          .doc-title p { margin: 2px 0 0; font-family: monospace; font-size: 13px; font-weight: bold; color: #334155; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .meta-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; font-size: 11px; }
          .meta-label { font-size: 9px; text-transform: uppercase; font-weight: 800; color: #64748b; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 10px; text-transform: uppercase; text-align: left; }
          td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 11px; }
          .text-center { text-align: center; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 36px; text-align: center; font-size: 10px; }
          .sig-box { border-top: 1px solid #cbd5e1; padding-top: 6px; font-weight: bold; }
          .sig-space { height: 65px; }
          @media print { .no-print-bar { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <div><strong>Surat Jalan Resmi</strong> - ${company.name}</div>
          <button class="print-btn" onclick="window.print()">🖨️ Cetak Dokumen</button>
        </div>

        <div class="header-letterhead">
          <div class="company-logo-box">
            ${company.logoUrl 
              ? `<img src="${company.logoUrl}" alt="${company.name}" />`
              : (company.logoSvg || `<div style="font-size:20px; font-weight:900; color:#4338ca;">${company.name}</div>`)}
          </div>
          <div class="company-info">
            <div class="company-name">${company.fullName || company.name}</div>
            <div>${company.address}</div>
            <div>Telp: ${company.phone || '-'} | Email: ${company.email || '-'}</div>
          </div>
        </div>

        <div class="doc-title">
          <h2>SURAT JALAN / DELIVERY ORDER</h2>
          <p>NOMOR: ${sj.number}</p>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <div class="meta-label">Penerima / Alamat Kirim:</div>
            <strong style="font-size:12px;">${sj.customerName}</strong>
            <div style="margin-top:4px; color:#475569;">${sj.deliveryAddress || 'Alamat Pabrik / Gudang Pelanggan'}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Informasi Ekspedisi & Kendaraan:</div>
            <div>Tanggal Kirim: <strong>${sj.date}</strong></div>
            <div>Sopir / Kurir: <strong>${sj.driverName || '-'}</strong></div>
            <div>No. Polisi Plat: <strong style="font-family:monospace;">${sj.vehicleNumber || '-'}</strong></div>
            <div>Referensi SPK: <strong style="font-family:monospace;">${sj.spkNumber}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px;" class="text-center">No.</th>
              <th>Nama Barang / Deskripsi Paket</th>
              <th style="width:70px;" class="text-center">Jumlah (Qty)</th>
              <th style="width:80px;" class="text-center">Satuan</th>
              <th>Keterangan / Kondisi</th>
            </tr>
          </thead>
          <tbody>
            ${sj.items.map((it, idx) => `
              <tr>
                <td class="text-center font-mono">${idx + 1}</td>
                <td><strong>${it.name}</strong></td>
                <td class="text-center font-mono" style="font-weight:bold;">${it.qty}</td>
                <td class="text-center" style="color:#64748b;">${it.unit}</td>
                <td style="color:#64748b; font-size:10px;">Lolos QC, Segel Utuh & Siap Pasang</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div>
            <div>Dibuat Oleh,</div>
            <div class="sig-space"></div>
            <div class="sig-box">Bagian Logistik & Gudang</div>
          </div>
          <div>
            <div>Dibawa Oleh (Driver),</div>
            <div class="sig-space"></div>
            <div class="sig-box">${sj.driverName || 'Sopir Ekspedisi'}</div>
          </div>
          <div>
            <div>Diterima Oleh,</div>
            <div class="sig-space"></div>
            <div class="sig-box">${sj.customerName}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const hasAccessToLogistics = currentUserRole === 'admin' || currentUserRole === 'logistics';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Modul Logistik & Surat Jalan (SJ)</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola armada kurir, alamat pengiriman barang, serta terbitkan Surat Jalan resmi</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Surat Jalan Side Panel */}
        <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Jalan Terbit</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{sjList.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {sjList.map((sj) => (
              <div
                key={sj.id}
                onClick={() => selectSj(sj)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition ${
                  selectedSj?.id === sj.id ? "bg-violet-50/50 border-l-4 border-violet-700" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-xs text-slate-500">{sj.number}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    sj.status === 'Delivered' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : sj.status === 'Shipped'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {sj.status === 'Delivered' ? 'Sampai' : sj.status === 'Shipped' ? 'Kirim' : 'Draft'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{sj.customerName}</h4>
                <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded">🚛 {sj.vehicleNumber || 'N/A'}</span>
                  <span>{sj.date}</span>
                </div>
              </div>
            ))}
            {sjList.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">Belum ada Surat Jalan. Surat Jalan otomatis diterbitkan begitu produk lolos pengujian di modul QA.</div>
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="flex-1 bg-white overflow-y-auto p-6 flex flex-col">
          {selectedSj ? (
            <div className="max-w-4xl flex-1 flex flex-col">
              {/* Document Header Card */}
              <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-r from-slate-50 to-white shadow-xs mb-6 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="text-xs text-violet-700 font-bold bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">Surat Jalan (Delivery Note)</span>
                  <h3 className="text-xl font-black text-slate-800 mt-2">{selectedSj.number}</h3>
                  <p className="text-xs text-slate-500 mt-1">Ref SPK: <strong className="text-slate-700">{selectedSj.spkNumber}</strong> | Penerbitan: {selectedSj.date}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintSuratJalan(selectedSj)}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition"
                    title="Cetak Surat Jalan Resmi dengan Kop Perusahaan"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Cetak Surat Jalan</span>
                  </button>

                  {/* Shipping state buttons */}
                  {hasAccessToLogistics && (
                    <>
                      {selectedSj.status === 'Draft' && (
                        <button
                          onClick={() => handleUpdateStatus('Shipped')}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
                        >
                          <Truck className="w-3.5 h-3.5" /> Kirim Barang
                        </button>
                      )}
                      {selectedSj.status === 'Shipped' && (
                        <button
                          onClick={() => handleUpdateStatus('Delivered')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Konfirmasi Sampai
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Form & Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left side: Driver parameters */}
                <div className="space-y-4">
                  <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                    <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-violet-600" /> Informasi Pengantaran & Sopir
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Nama Pengemudi (Driver)</label>
                        {selectedSj.status !== 'Delivered' && hasAccessToLogistics ? (
                          <input
                            type="text"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            placeholder="Contoh: Joko Susilo"
                            className="w-full px-3 py-1.5 border rounded text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        ) : (
                          <span className="font-bold text-slate-800 block text-xs mt-0.5">{selectedSj.driverName}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Nomor Plat Polisi Kendaraan</label>
                        {selectedSj.status !== 'Delivered' && hasAccessToLogistics ? (
                          <input
                            type="text"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            placeholder="Contoh: B 1234 ABC"
                            className="w-full px-3 py-1.5 border rounded text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        ) : (
                          <span className="font-mono font-bold text-slate-700 block text-xs mt-0.5">{selectedSj.vehicleNumber}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Alamat Pengiriman Tujuan</label>
                        {selectedSj.status !== 'Delivered' && hasAccessToLogistics ? (
                          <textarea
                            rows={2}
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Alamat lengkap penerima..."
                            className="w-full px-3 py-1.5 border rounded text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-slate-700 text-xs mt-0.5">{selectedSj.deliveryAddress}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Items Package */}
                <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                  <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-violet-600" /> Rincian Barang Dikirim
                  </h4>
                  <div className="border rounded bg-white overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold border-b text-[10px] uppercase">
                          <th className="p-2">Nama Barang / Produk</th>
                          <th className="p-2 w-20 text-center">Qty</th>
                          <th className="p-2 w-20">Satuan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSj.items.map((it, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="p-2 font-semibold text-slate-800">{it.name}</td>
                            <td className="p-2 text-center text-slate-700">{it.qty}</td>
                            <td className="p-2 text-slate-600">{it.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {selectedSj.status === 'Delivered' && selectedSj.deliveredAt && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] rounded-lg flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <strong>Terverifikasi Terkirim:</strong> {new Date(selectedSj.deliveredAt).toLocaleString("id-ID")}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons footer */}
              {selectedSj.status !== 'Delivered' && hasAccessToLogistics && (
                <div className="mt-auto border-t pt-4 flex justify-end gap-2">
                  <button
                    onClick={handleSaveDetails}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg transition"
                  >
                    Simpan Perubahan Dokumen
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedSj.status === 'Draft' ? 'Shipped' : 'Delivered')}
                    className="bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                  >
                    {selectedSj.status === 'Draft' ? 'Konfirmasi Jalan (Y)' : 'Konfirmasi Sampai Tujuan (Y)'}
                  </button>
                </div>
              )}

              {/* Warning label */}
              {!hasAccessToLogistics && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2 text-xs mt-auto">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <div>
                    <span className="font-bold">Akses Ditolak:</span> Hanya personel divisi <strong>Logistik / Gudang</strong> yang diijinkan mengupdate status pengiriman kurir.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Truck className="w-12 h-12 text-slate-300 mb-2" />
              <div className="text-sm font-semibold">Silakan pilih Surat Jalan aktif di samping</div>
              <p className="text-xs text-center max-w-xs mt-1">Sopir, nomor plat polisi, and status kiriman direkam untuk mengaktifkan pelacakan pengiriman.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
