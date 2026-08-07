/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Invoice, CompanyId } from "../types";
import { COMPANIES } from "../data/companies";
import { 
  Receipt, Check, CreditCard, ShieldAlert, 
  User, Calendar, Info, FileText, Percent,
  Printer, Download, Building2
} from "lucide-react";

interface InvoiceAppProps {
  invoices: Invoice[];
  onRefresh: () => void;
  currentUserRole: string;
  selectedCompanyId?: CompanyId | null;
}

export default function InvoiceApp({ invoices, onRefresh, currentUserRole, selectedCompanyId }: InvoiceAppProps) {
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

  const handleExportPDF = (inv: Invoice) => {
    const compId = inv.companyId || selectedCompanyId || 'fujiyama';
    const company = COMPANIES.find(c => c.id === compId) || COMPANIES[0];

    const printWindow = window.open('', '_blank', 'width=950,height=1000');
    if (!printWindow) {
      alert("Mohon izinkan pop-up browser untuk mengunduh atau mencetak PDF Invoice.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${inv.number} - ${company.fullName || company.name}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            color: #1e293b; 
            margin: 0; 
            padding: 24px; 
            font-size: 13px; 
            line-height: 1.5; 
            background-color: #fff;
          }
          .no-print-bar {
            background: #4f46e5;
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          }
          .print-btn {
            background: white;
            color: #4f46e5;
            border: none;
            padding: 9px 18px;
            font-weight: 800;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .print-btn:hover {
            background: #f8fafc;
            transform: translateY(-1px);
          }
          .header-letterhead {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px double #cbd5e1;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .company-logo-container {
            max-width: 260px;
          }
          .company-details {
            text-align: right;
            font-size: 11px;
            color: #475569;
            max-width: 320px;
          }
          .company-full-name {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .doc-title-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            background: #f8fafc;
            padding: 16px 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .doc-title {
            font-size: 22px;
            font-weight: 900;
            color: #1e1b4b;
            letter-spacing: 1px;
          }
          .doc-number {
            font-size: 14px;
            font-weight: 700;
            color: #4f46e5;
            margin-top: 2px;
          }
          .status-stamp {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 900;
            font-size: 12px;
            letter-spacing: 1px;
            border: 2px solid;
          }
          .status-paid { background: #ecfdf5; color: #047857; border-color: #10b981; }
          .status-unpaid { background: #fef2f2; color: #b91c1c; border-color: #ef4444; }
          .grid-2 {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
          }
          .info-box {
            flex: 1;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px 18px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          }
          .box-label {
            font-size: 10px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .box-val {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 12px 16px;
            border-bottom: 2px solid #cbd5e1;
            text-align: left;
          }
          td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
          }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; }
          .total-row td {
            background: #faf5ff;
            color: #581c87;
            font-weight: 900;
            border-top: 2px solid #c084fc;
            font-size: 14px;
          }
          .payment-notice {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 10px;
            padding: 14px 18px;
            font-size: 12px;
            color: #166534;
            margin-bottom: 30px;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            page-break-inside: avoid;
          }
          .sig-card {
            text-align: center;
            width: 220px;
            font-size: 11px;
          }
          .sig-space {
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .stamp-paid {
            color: #059669;
            border: 2px dashed #059669;
            padding: 4px 12px;
            font-weight: 900;
            border-radius: 6px;
            transform: rotate(-6deg);
            font-size: 12px;
            letter-spacing: 1px;
          }
          @media print {
            body { padding: 0; }
            .no-print-bar { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <div>
            <div style="font-weight:800; font-size:15px;">Official Invoice PDF Exporter</div>
            <div style="font-size:11px; opacity:0.9;">Faktur Resmi ${company.fullName || company.name}</div>
          </div>
          <button class="print-btn" onclick="window.print()">
            <span>🖨️</span> Cetak / Simpan PDF
          </button>
        </div>

        <div class="header-letterhead">
          <div class="company-logo-container">
            ${company.logoSvg || `<div style="font-size:24px; font-weight:900; color:#4f46e5;">${company.name}</div>`}
          </div>
          <div class="company-details">
            <div class="company-full-name">${company.fullName || company.name}</div>
            <div>${company.address}</div>
            <div>Telp: ${company.phone || '-'}</div>
            <div>Email: ${company.email || '-'}</div>
            <div>NPWP: ${company.npwp || '-'}</div>
          </div>
        </div>

        <div class="doc-title-section">
          <div>
            <div class="doc-title">FAKTUR PENJUALAN</div>
            <div class="doc-number">NO: ${inv.number}</div>
          </div>
          <div>
            <span class="status-stamp ${inv.status === 'Paid' ? 'status-paid' : 'status-unpaid'}">
              ${inv.status === 'Paid' ? 'LUNAS / PAID' : 'BELUM BAYAR / UNPAID'}
            </span>
          </div>
        </div>

        <div class="grid-2">
          <div class="info-box">
            <div class="box-label">Diterbitkan Kepada (Pelanggan)</div>
            <div class="box-val">${inv.customerName}</div>
            <div style="margin-top:6px; font-size:11px; color:#64748b;">
              Ref. SPK: <strong style="color:#334155">${inv.spkNumber}</strong>
            </div>
          </div>

          <div class="info-box">
            <div class="box-label">Tanggal Terbit & Jatuh Tempo</div>
            <div style="font-size:12px; color:#334155;">Tanggal Terbit: <strong>${inv.date}</strong></div>
            <div style="font-size:12px; color:#dc2626; margin-top:2px;">Jatuh Tempo: <strong>${inv.dueDate}</strong></div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">Syarat Pembayaran: Net 30 Hari</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">No.</th>
              <th>Deskripsi Pekerjaan / Layanan</th>
              <th class="text-right">Subtotal Sub-Pekerjaan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                <strong>Pengerjaan & Pengadaan SPK ${inv.spkNumber}</strong><br/>
                <span style="color:#64748b; font-size:11px;">Jasa manufaktur, perakitan, dan pengiriman unit pesanan industri resmi.</span>
              </td>
              <td class="text-right font-mono" style="font-weight:700;">${formatCurrency(inv.amount)}</td>
            </tr>
            <tr>
              <td>2</td>
              <td style="color:#64748b;">Pajak Pertambahan Nilai (PPn 11% Otomatis)</td>
              <td class="text-right font-mono" style="color:#475569;">${formatCurrency(inv.tax)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="2" style="text-align:right; font-size:12px; text-transform:uppercase;">Jumlah Tagihan Total (Nett)</td>
              <td class="text-right font-mono" style="font-size:16px;">${formatCurrency(inv.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div class="payment-notice">
          <strong style="font-size:13px;">Instruksi Pembayaran Transfer Bank Resmi:</strong><br/>
          Pembayaran wajib ditransfer ke rekening resmi entitas perusahaan:<br/>
          <strong style="font-size:13px; color:#065f46;">${company.bankInfo}</strong><br/>
          <span style="font-size:11px; opacity:0.9;">*Cantumkan Nomor Invoice (${inv.number}) dalam berita transfer bank Anda.</span>
        </div>

        <div class="signatures">
          <div class="sig-card">
            <div>Diterima & Disetujui Oleh,</div>
            <div class="sig-space"></div>
            <div style="border-top:1px solid #cbd5e1; padding-top:4px; font-weight:bold;">${inv.customerName}</div>
            <div style="color:#64748b; font-size:10px;">Pelanggan / Pembeli</div>
          </div>

          <div class="sig-card">
            <div>Hormat Kami,</div>
            <div class="sig-space">
              ${inv.status === 'Paid' ? '<div class="stamp-paid">LUNAS - STAMP</div>' : ''}
            </div>
            <div style="border-top:1px solid #cbd5e1; padding-top:4px; font-weight:bold;">${company.fullName || company.name}</div>
            <div style="color:#64748b; font-size:10px;">Departemen Keuangan / Finance</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const hasAccessToInvoicing = currentUserRole === 'admin' || currentUserRole === 'finance' || currentUserRole === 'sales';
  const canPay = currentUserRole === 'admin' || currentUserRole === 'finance';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-800">Modul Invoice & Penagihan (Billing)</h2>
        <p className="text-xs text-slate-500 mt-1">Pantau piutang usaha, kalkulasi PPn 11% otomatis, cetak PDF resmi berlogo perusahaan, dan catat pelunasan</p>
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
          {selectedInvoice ? (() => {
            const currentCompany = COMPANIES.find(c => c.id === (selectedInvoice.companyId || selectedCompanyId || 'fujiyama')) || COMPANIES[0];

            return (
              <div className="max-w-3xl flex-1 flex flex-col">
                {/* Company Logo & Letterhead Header Card */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 mb-6 border border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Vector SVG Logo */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shrink-0 shadow-xs">
                      {currentCompany.logoSvg ? (
                        <div dangerouslySetInnerHTML={{ __html: currentCompany.logoSvg }} className="h-10 w-auto" />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-600 text-white font-black flex items-center justify-center rounded-lg text-lg">
                          {currentCompany.logoText}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          {currentCompany.code}
                        </span>
                        <h3 className="text-base font-extrabold text-white">
                          {currentCompany.fullName || currentCompany.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {currentCompany.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Export PDF Button */}
                  <button
                    onClick={() => handleExportPDF(selectedInvoice)}
                    className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md border border-indigo-400/30 shrink-0"
                  >
                    <Printer className="w-4 h-4 text-indigo-200" />
                    <span>Export / Cetak PDF</span>
                  </button>
                </div>

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
            );
          })() : (
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

