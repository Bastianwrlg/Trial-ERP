/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Invoice, InvoiceItem, CompanyId, ItemType, Company } from "../types";
import { COMPANIES } from "../data/companies";
import { 
  Receipt, Check, CreditCard, ShieldAlert, 
  User, Calendar, Info, FileText, Percent,
  Printer, Package, Wrench, Plus, Trash2, Edit3,
  X, Save, Filter, Layers, CheckCircle2, Sparkles
} from "lucide-react";

interface InvoiceAppProps {
  invoices: Invoice[];
  onRefresh: () => void;
  currentUserRole: string;
  selectedCompanyId?: CompanyId | null;
  companies?: Company[];
}

export default function InvoiceApp({ invoices, onRefresh, currentUserRole, selectedCompanyId, companies = COMPANIES }: InvoiceAppProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'barang' | 'jasa'>('all');
  
  // Edit modal state
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [editItemDescription, setEditItemDescription] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editItems, setEditItems] = useState<InvoiceItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sync selectedInvoice when invoices change
  useEffect(() => {
    if (selectedInvoice) {
      const match = invoices.find(i => i.id === selectedInvoice.id);
      if (match) {
        setSelectedInvoice(match);
      }
    } else if (invoices.length > 0) {
      setSelectedInvoice(invoices[0]);
    }
  }, [invoices]);

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

  const openEditModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setEditItemDescription(inv.itemDescription || "Pengadaan Barang Manufaktur dan Layanan Jasa Teknis");
    setEditNotes(inv.notes || "");
    setEditDueDate(inv.dueDate || "");
    
    // Ensure items exist
    if (inv.items && inv.items.length > 0) {
      setEditItems(JSON.parse(JSON.stringify(inv.items)));
    } else {
      setEditItems([
        {
          id: "item_" + Date.now() + "_1",
          type: "barang",
          name: "Unit Produk & Material Fisik " + inv.spkNumber,
          description: "Pengadaan modul bodi panel enclosure baja presisi dan material pendukung.",
          qty: 1,
          unit: "Unit",
          price: Math.round(inv.amount * 0.75),
          total: Math.round(inv.amount * 0.75)
        },
        {
          id: "item_" + Date.now() + "_2",
          type: "jasa",
          name: "Jasa Fabrikasi, Finishing & Uji Mutu",
          description: "Pengerjaan laser cutting, bending, oven powder coating dan uji fungsi kelistrikan.",
          qty: 1,
          unit: "Paket",
          price: inv.amount - Math.round(inv.amount * 0.75),
          total: inv.amount - Math.round(inv.amount * 0.75)
        }
      ]);
    }
    setIsEditingItems(true);
  };

  const handleAddItem = (type: ItemType) => {
    const newItem: InvoiceItem = {
      id: "item_" + Date.now() + "_" + Math.random().toString().slice(2, 6),
      type,
      name: type === 'barang' ? "Komponen / Produk Baru" : "Jasa / Layanan Teknis Baru",
      description: type === 'barang' 
        ? "Deskripsi spesifikasi material, dimensi, standar mutu atau tipe unit fisik."
        : "Deskripsi lingkup pekerjaan pengerjaan, instalasi, perakitan, kalibrasi atau sertifikasi.",
      qty: 1,
      unit: type === 'barang' ? "Unit" : "Layanan",
      price: 1000000,
      total: 1000000
    };
    setEditItems([...editItems, newItem]);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...editItems];
    const item = { ...updated[index], [field]: value };
    if (field === 'qty' || field === 'price') {
      const q = field === 'qty' ? Number(value) : item.qty;
      const p = field === 'price' ? Number(value) : item.price;
      item.total = (q || 0) * (p || 0);
    }
    updated[index] = item;
    setEditItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const handleSaveInvoiceItems = async () => {
    if (!selectedInvoice) return;
    if (editItems.length === 0) {
      alert("Harap masukkan setidaknya satu item Barang atau Jasa.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: editItems,
          itemDescription: editItemDescription,
          notes: editNotes,
          dueDate: editDueDate
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedInvoice(updated);
        setIsEditingItems(false);
        onRefresh();
      } else {
        alert("Gagal menyimpan perubahan invoice.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = (inv: Invoice) => {
    const compId = inv.companyId || selectedCompanyId || 'fujiyama';
    const company = companies.find(c => c.id === compId) || companies[0] || COMPANIES[0];

    const printWindow = window.open('', '_blank', 'width=950,height=1000');
    if (!printWindow) {
      alert("Mohon izinkan pop-up browser untuk mengunduh atau mencetak PDF Invoice.");
      return;
    }

    const items = inv.items && inv.items.length > 0 ? inv.items : [
      {
        id: "item_def1",
        type: "barang" as ItemType,
        name: "Pengerjaan & Pengadaan SPK " + inv.spkNumber,
        description: "Unit komponen fisik manufaktur dan material perakitan standar industri.",
        qty: 1,
        unit: "Unit",
        price: Math.round(inv.amount * 0.75),
        total: Math.round(inv.amount * 0.75)
      },
      {
        id: "item_def2",
        type: "jasa" as ItemType,
        name: "Jasa Fabrikasi, Wiring & Uji Mutu",
        description: "Jasa pengerjaan laser cutting, bending, oven powder coating dan uji fungsi kelistrikan.",
        qty: 1,
        unit: "Paket",
        price: inv.amount - Math.round(inv.amount * 0.75),
        total: inv.amount - Math.round(inv.amount * 0.75)
      }
    ];

    const totalBarang = items.filter(it => it.type === 'barang').reduce((acc, it) => acc + (it.total || 0), 0);
    const totalJasa = items.filter(it => it.type === 'jasa').reduce((acc, it) => acc + (it.total || 0), 0);

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
            font-size: 12px; 
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
            margin-bottom: 20px;
          }
          .company-logo-container {
            max-width: 260px;
          }
          .company-details {
            text-align: right;
            font-size: 11px;
            color: #475569;
            max-width: 340px;
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
            margin-bottom: 16px;
            background: #f8fafc;
            padding: 14px 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .doc-title {
            font-size: 20px;
            font-weight: 900;
            color: #1e1b4b;
            letter-spacing: 0.5px;
          }
          .doc-number {
            font-size: 13px;
            font-weight: 700;
            color: #4f46e5;
            margin-top: 2px;
          }
          .status-stamp {
            display: inline-block;
            padding: 5px 14px;
            border-radius: 20px;
            font-weight: 800;
            font-size: 11px;
            letter-spacing: 0.5px;
            border: 2px solid;
          }
          .status-paid { background: #ecfdf5; color: #047857; border-color: #10b981; }
          .status-unpaid { background: #fef2f2; color: #b91c1c; border-color: #ef4444; }
          .grid-2 {
            display: flex;
            gap: 16px;
            margin-bottom: 20px;
          }
          .info-box {
            flex: 1;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px 16px;
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
            font-size: 13px;
            font-weight: 800;
            color: #0f172a;
          }
          .desc-banner {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 18px;
            font-size: 11px;
            color: #334155;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 10px 12px;
            border-bottom: 2px solid #cbd5e1;
            text-align: left;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
            vertical-align: top;
          }
          .badge-type {
            display: inline-block;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 2px 7px;
            border-radius: 4px;
            letter-spacing: 0.5px;
          }
          .badge-barang {
            background: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
          }
          .badge-jasa {
            background: #eef2ff;
            color: #4338ca;
            border: 1px solid #c7d2fe;
          }
          .item-desc-text {
            color: #64748b;
            font-size: 10px;
            margin-top: 3px;
            line-height: 1.4;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-mono { font-family: monospace; }
          .summary-card {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 24px;
          }
          .summary-table {
            width: 320px;
            border-collapse: collapse;
          }
          .summary-table td {
            padding: 6px 12px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 11px;
          }
          .summary-table .total-row td {
            background: #faf5ff;
            color: #581c87;
            font-weight: 900;
            border-top: 2px solid #c084fc;
            font-size: 13px;
            padding: 10px 12px;
          }
          .payment-notice {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 11px;
            color: #166534;
            margin-bottom: 24px;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            page-break-inside: avoid;
          }
          .sig-card {
            text-align: center;
            width: 200px;
            font-size: 10px;
          }
          .sig-space {
            height: 60px;
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
            font-size: 11px;
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
            <div style="font-weight:800; font-size:14px;">Official Invoice PDF Exporter</div>
            <div style="font-size:11px; opacity:0.9;">Faktur Resmi ${company.fullName || company.name}</div>
          </div>
          <button class="print-btn" onclick="window.print()">
            <span>🖨️</span> Cetak / Simpan PDF
          </button>
        </div>

        <div class="header-letterhead">
          <div class="company-logo-container">
            ${company.logoUrl 
              ? `<img src="${company.logoUrl}" style="max-height:50px; max-width:180px; object-fit:contain;" alt="${company.name}" />`
              : (company.logoSvg || `<div style="font-size:22px; font-weight:900; color:#4f46e5;">${company.name}</div>`)}
          </div>
          <div class="company-details">
            <div class="company-full-name">${company.fullName || company.name}</div>
            <div>${company.address}</div>
            <div>Telp: ${company.phone || '-'} | Email: ${company.email || '-'}</div>
            <div>NPWP: ${company.npwp || '-'}</div>
          </div>
        </div>

        <div class="doc-title-section">
          <div>
            <div class="doc-title">FAKTUR PENJUALAN (INVOICE)</div>
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
            <div style="margin-top:4px; font-size:11px; color:#64748b;">
              Referensi SPK: <strong style="color:#334155">${inv.spkNumber}</strong>
            </div>
          </div>

          <div class="info-box">
            <div class="box-label">Tanggal Terbit & Jatuh Tempo</div>
            <div style="font-size:11px; color:#334155;">Tanggal Terbit: <strong>${inv.date}</strong></div>
            <div style="font-size:11px; color:#dc2626; margin-top:2px;">Jatuh Tempo: <strong>${inv.dueDate}</strong></div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">Syarat Pembayaran: Net 30 Hari</div>
          </div>
        </div>

        ${inv.itemDescription ? `
          <div class="desc-banner">
            <strong style="color:#0f172a;">Keterangan / Ruang Lingkup:</strong> ${inv.itemDescription}
          </div>
        ` : ''}

        <table>
          <thead>
            <tr>
              <th style="width: 30px;" class="text-center">No.</th>
              <th style="width: 65px;" class="text-center">Jenis</th>
              <th>Nama & Deskripsi Barang & Jasa</th>
              <th style="width: 40px;" class="text-center">Qty</th>
              <th style="width: 55px;" class="text-center">Satuan</th>
              <th style="width: 110px;" class="text-right">Harga Satuan</th>
              <th style="width: 120px;" class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, idx) => `
              <tr>
                <td class="text-center font-mono" style="color:#64748b;">${idx + 1}</td>
                <td class="text-center">
                  <span class="badge-type ${item.type === 'jasa' ? 'badge-jasa' : 'badge-barang'}">
                    ${item.type === 'jasa' ? 'Jasa' : 'Barang'}
                  </span>
                </td>
                <td>
                  <strong style="color:#0f172a; font-size:12px;">${item.name}</strong>
                  ${item.description ? `<div class="item-desc-text">${item.description}</div>` : ''}
                </td>
                <td class="text-center font-mono">${item.qty}</td>
                <td class="text-center" style="color:#64748b;">${item.unit}</td>
                <td class="text-right font-mono">${formatCurrency(item.price)}</td>
                <td class="text-right font-mono" style="font-weight:700;">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary-card">
          <table class="summary-table">
            <tr>
              <td style="color:#64748b;">Subtotal Barang Fisik:</td>
              <td class="text-right font-mono">${formatCurrency(totalBarang)}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Subtotal Jasa & Layanan:</td>
              <td class="text-right font-mono">${formatCurrency(totalJasa)}</td>
            </tr>
            <tr style="border-top:1px solid #cbd5e1; font-weight:700;">
              <td style="color:#334155;">Dasar Pengenaan Pajak (DPP):</td>
              <td class="text-right font-mono">${formatCurrency(inv.amount)}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Pajak Pertambahan Nilai (PPn 11%):</td>
              <td class="text-right font-mono">${formatCurrency(inv.tax)}</td>
            </tr>
            <tr class="total-row">
              <td style="text-transform:uppercase;">TOTAL TAGIHAN (NETT):</td>
              <td class="text-right font-mono" style="font-size:14px;">${formatCurrency(inv.totalAmount)}</td>
            </tr>
          </table>
        </div>

        <div class="payment-notice">
          <strong style="font-size:12px;">Instruksi Pembayaran Transfer Bank Resmi:</strong><br/>
          Pembayaran wajib ditransfer ke rekening resmi entitas perusahaan:<br/>
          <strong style="font-size:12px; color:#065f46;">${company.bankInfo}</strong><br/>
          <span style="font-size:10px; opacity:0.9;">*Cantumkan Nomor Invoice (${inv.number}) dalam berita transfer bank Anda.</span>
          ${inv.notes ? `<div style="margin-top:6px; font-style:italic; border-top:1px dashed #a7f3d0; padding-top:4px;">Catatan: ${inv.notes}</div>` : ''}
        </div>

        <div class="signatures">
          <div class="sig-card">
            <div>Diterima & Disetujui Oleh,</div>
            <div class="sig-space"></div>
            <div style="border-top:1px solid #cbd5e1; padding-top:4px; font-weight:bold;">${inv.customerName}</div>
            <div style="color:#64748b; font-size:9px;">Pelanggan / Pembeli</div>
          </div>

          <div class="sig-card">
            <div>Hormat Kami,</div>
            <div class="sig-space">
              ${inv.status === 'Paid' ? '<div class="stamp-paid">LUNAS - STAMP</div>' : ''}
            </div>
            <div style="border-top:1px solid #cbd5e1; padding-top:4px; font-weight:bold;">${company.fullName || company.name}</div>
            <div style="color:#64748b; font-size:9px;">Departemen Keuangan / Finance</div>
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
  const canEditInvoice = currentUserRole === 'admin' || currentUserRole === 'finance';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Modul Invoice & Penagihan (Billing)</h2>
            <span className="bg-violet-100 text-violet-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-violet-200">
              Rincian Barang & Jasa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola faktur resmi, rincian deskripsi barang & jasa manufaktur, kalkulasi otomatis PPn 11%, dan cetak invoice PDF berstandar legalitas.
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Invoice List Panel */}
        <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daftar Faktur ({invoices.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {invoices.map((inv) => {
              const barangCount = (inv.items || []).filter(i => i.type === 'barang').length;
              const jasaCount = (inv.items || []).filter(i => i.type === 'jasa').length;

              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition ${
                    selectedInvoice?.id === inv.id ? "bg-violet-50/60 border-l-4 border-violet-700" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs text-slate-600">{inv.number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      inv.status === 'Paid' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {inv.status === 'Paid' ? 'Lunas (Paid)' : 'Belum Bayar'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{inv.customerName}</h4>
                  
                  {/* Goods and Services mini tag counter */}
                  <div className="flex items-center gap-1.5 mb-2 text-[10px]">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold">
                      <Package className="w-2.5 h-2.5" /> {barangCount > 0 ? `${barangCount} Barang` : 'Barang'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200/60 font-semibold">
                      <Wrench className="w-2.5 h-2.5" /> {jasaCount > 0 ? `${jasaCount} Jasa` : 'Jasa'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-bold text-slate-800">{formatCurrency(inv.totalAmount)}</span>
                    <span className="text-[11px]">Due: {inv.dueDate}</span>
                  </div>
                </div>
              );
            })}
            {invoices.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Belum ada tagihan terbit. Invoice penjualan diterbitkan secara otomatis setelah pengiriman Surat Jalan (SJ) dikonfirmasi di modul Logistik.
              </div>
            )}
          </div>
        </div>

        {/* Invoice Detail Panel */}
        <div className="flex-1 bg-white overflow-y-auto p-6 flex flex-col">
          {selectedInvoice ? (() => {
            const currentCompany = companies.find(c => c.id === (selectedInvoice.companyId || selectedCompanyId || 'fujiyama')) || companies[0] || COMPANIES[0];
            
            // Normalized items
            const rawItems: InvoiceItem[] = selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items : [
              {
                id: "item_def1",
                type: "barang",
                name: "Unit Produk & Material Fisik " + selectedInvoice.spkNumber,
                description: "Pengadaan modul bodi enclosure plat baja presisi, busbar tembaga, dan material utama.",
                qty: 1,
                unit: "Unit",
                price: Math.round(selectedInvoice.amount * 0.75),
                total: Math.round(selectedInvoice.amount * 0.75)
              },
              {
                id: "item_def2",
                type: "jasa",
                name: "Jasa Fabrikasi, Finishing & Uji Mutu",
                description: "Pengerjaan laser cutting, bending, oven powder coating, wiring kabel instalasi dan uji fungsi kelistrikan.",
                qty: 1,
                unit: "Paket",
                price: selectedInvoice.amount - Math.round(selectedInvoice.amount * 0.75),
                total: selectedInvoice.amount - Math.round(selectedInvoice.amount * 0.75)
              }
            ];

            const filteredItems = rawItems.filter(item => {
              if (activeTabFilter === 'barang') return item.type === 'barang';
              if (activeTabFilter === 'jasa') return item.type === 'jasa';
              return true;
            });

            const totalBarangVal = rawItems.filter(i => i.type === 'barang').reduce((acc, i) => acc + (i.total || 0), 0);
            const totalJasaVal = rawItems.filter(i => i.type === 'jasa').reduce((acc, i) => acc + (i.total || 0), 0);

            return (
              <div className="max-w-4xl flex-1 flex flex-col">
                {/* Company Letterhead Header Card */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 mb-6 border border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shrink-0 shadow-xs flex items-center justify-center min-w-[65px] min-h-[48px]">
                      {currentCompany.logoUrl ? (
                        <img 
                          src={currentCompany.logoUrl} 
                          alt={currentCompany.name} 
                          className="max-h-11 max-w-[130px] object-contain rounded" 
                        />
                      ) : currentCompany.logoSvg ? (
                        <div 
                          dangerouslySetInnerHTML={{ __html: currentCompany.logoSvg }} 
                          className="max-h-11 max-w-[140px] flex items-center [&_svg]:max-h-10 [&_svg]:w-auto" 
                        />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-600 text-white font-black flex items-center justify-center rounded-lg text-lg">
                          {currentCompany.logoText || currentCompany.name.slice(0, 2).toUpperCase()}
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

                  {/* Actions: Export PDF & Edit items */}
                  <div className="flex items-center gap-2">
                    {canEditInvoice && (
                      <button
                        onClick={() => openEditModal(selectedInvoice)}
                        className="bg-slate-700/80 hover:bg-slate-700 active:bg-slate-600 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition border border-slate-600"
                        title="Edit deskripsi dan rincian barang & jasa"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Edit Barang & Jasa</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleExportPDF(selectedInvoice)}
                      className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md border border-indigo-400/30 shrink-0"
                    >
                      <Printer className="w-4 h-4 text-indigo-200" />
                      <span>Cetak / PDF</span>
                    </button>
                  </div>
                </div>

                {/* Document Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
                  <div>
                    <span className="text-xs text-violet-700 font-bold bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">
                      Faktur Penjualan Resmi
                    </span>
                    <h3 className="text-2xl font-black text-slate-800 mt-1.5">{selectedInvoice.number}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Berdasarkan SPK: <strong className="text-slate-700">{selectedInvoice.spkNumber}</strong>
                    </p>
                  </div>

                  {/* Pay button */}
                  {canPay && selectedInvoice.status === 'Unpaid' && (
                    <button
                      onClick={() => handlePay(selectedInvoice.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-xs self-start sm:self-auto"
                    >
                      <CreditCard className="w-4 h-4" /> Daftarkan Pelunasan (Lunas)
                    </button>
                  )}
                </div>

                {/* Customer & Date Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex gap-3">
                    <User className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nama Pelanggan</div>
                      <div className="font-bold text-slate-800 text-sm mt-0.5">{selectedInvoice.customerName}</div>
                      <div className="text-xs text-slate-500 mt-1">Tanggal Terbit: <strong className="text-slate-700">{selectedInvoice.date}</strong></div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex gap-3">
                    <Calendar className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Batas Jatuh Tempo</div>
                      <div className="font-bold text-red-600 text-sm mt-0.5">{selectedInvoice.dueDate}</div>
                      <div className="text-xs text-slate-500 mt-1">Syarat Pembayaran: <span className="font-medium text-slate-700">Net 30 Hari</span></div>
                    </div>
                  </div>
                </div>

                {/* Ringkasan Deskripsi Barang & Jasa Banner */}
                {selectedInvoice.itemDescription && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Deskripsi & Ruang Lingkup Pekerjaan:</div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {selectedInvoice.itemDescription}
                        </p>
                      </div>
                    </div>
                    {canEditInvoice && (
                      <button 
                        onClick={() => openEditModal(selectedInvoice)}
                        className="text-[11px] font-semibold text-violet-700 hover:text-violet-900 shrink-0 flex items-center gap-1 hover:underline"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>
                )}

                {/* Section Header with Item Category Filter Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-800">Rincian Deskripsi Barang & Jasa</h4>
                    <span className="text-xs text-slate-400">({rawItems.length} Pos Tagihan)</span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
                    <button
                      onClick={() => setActiveTabFilter('all')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition ${
                        activeTabFilter === 'all' 
                          ? 'bg-white text-slate-800 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Semua ({rawItems.length})
                    </button>
                    <button
                      onClick={() => setActiveTabFilter('barang')}
                      className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                        activeTabFilter === 'barang' 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      <Package className="w-3 h-3" /> Barang ({rawItems.filter(i => i.type === 'barang').length})
                    </button>
                    <button
                      onClick={() => setActiveTabFilter('jasa')}
                      className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                        activeTabFilter === 'jasa' 
                          ? 'bg-violet-700 text-white shadow-xs' 
                          : 'text-violet-700 hover:bg-violet-50'
                      }`}
                    >
                      <Wrench className="w-3 h-3" /> Jasa ({rawItems.filter(i => i.type === 'jasa').length})
                    </button>
                  </div>
                </div>

                {/* Detailed Goods & Services Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b text-[10px] uppercase">
                        <th className="py-3 px-4 w-12 text-center">No.</th>
                        <th className="py-3 px-4 w-28">Kategori</th>
                        <th className="py-3 px-4">Nama & Deskripsi Lengkap Barang / Jasa</th>
                        <th className="py-3 px-3 text-center w-16">Qty</th>
                        <th className="py-3 px-3 text-center w-20">Satuan</th>
                        <th className="py-3 px-4 text-right w-32">Harga Satuan</th>
                        <th className="py-3 px-4 text-right w-36">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredItems.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            {item.type === 'jasa' ? (
                              <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                <Wrench className="w-2.5 h-2.5" /> Jasa
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                <Package className="w-2.5 h-2.5" /> Barang
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800 text-xs">
                              {item.name}
                            </div>
                            {item.description ? (
                              <div className="text-slate-500 text-[11px] mt-1 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {item.description}
                              </div>
                            ) : (
                              <div className="text-slate-400 italic text-[10px] mt-0.5">
                                Belum ada rincian deskripsi teknis
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700">
                            {item.qty}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-600">
                            {item.unit}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                      {filteredItems.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-6 text-slate-400">
                            Tidak ada item dalam kategori filter ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary & Breakdown (Barang, Jasa, PPn, Total) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Left: Goods & Services Subtotal summary badges */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                        Komposisi Tagihan (Barang & Jasa)
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Package className="w-3.5 h-3.5 text-emerald-600" />
                            Subtotal Barang Fisik ({rawItems.filter(i => i.type === 'barang').length} item):
                          </span>
                          <span className="font-mono font-bold text-slate-800">{formatCurrency(totalBarangVal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Wrench className="w-3.5 h-3.5 text-violet-600" />
                            Subtotal Jasa & Layanan ({rawItems.filter(i => i.type === 'jasa').length} item):
                          </span>
                          <span className="font-mono font-bold text-slate-800">{formatCurrency(totalJasaVal)}</span>
                        </div>
                      </div>
                    </div>

                    {selectedInvoice.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                        <span className="font-bold text-slate-600">Catatan Faktur:</span> {selectedInvoice.notes}
                      </div>
                    )}
                  </div>

                  {/* Right: Tax & Final Total Calculation */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Dasar Pengenaan Pajak (DPP Subtotal):</span>
                      <span className="font-mono font-bold text-slate-800">{formatCurrency(selectedInvoice.amount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        Pajak Pertambahan Nilai (PPn 11%):
                        <Percent className="w-3 h-3 text-slate-400" />
                      </span>
                      <span className="font-mono font-semibold text-slate-700">{formatCurrency(selectedInvoice.tax)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Total Tagihan (Nett):</span>
                      <span className="text-lg font-black text-violet-700 font-mono">{formatCurrency(selectedInvoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Status banner */}
                {selectedInvoice.status === 'Paid' ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3 mt-auto shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm">Faktur Telah Dilunasi (Lunas)</div>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Seluruh kewajiban pembayaran barang & jasa telah diselesaikan oleh pelanggan. Status alur sistem ERP untuk Surat Perintah Kerja ini telah tuntas sepenuhnya.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3 mt-auto text-xs shadow-xs">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm">Menunggu Pelunasan Tagihan (Unpaid)</div>
                      <p className="mt-0.5 text-amber-700">
                        Invoice ini berstatus belum lunas. Tim Keuangan (Finance) dapat mengonfirmasi pelunasan dengan menekan tombol "Daftarkan Pelunasan".
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })() : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Receipt className="w-12 h-12 text-slate-300 mb-2" />
              <div className="text-sm font-semibold">Silakan pilih Faktur di panel kiri</div>
              <p className="text-xs text-center max-w-xs mt-1">
                Kelola faktur, rincian deskripsi barang & jasa, pajak PPn 11%, dan pembukuan piutang usaha.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Goods & Services Modal */}
      {isEditingItems && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Kelola Deskripsi Barang & Jasa — {selectedInvoice.number}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ubah deskripsi, tambah pos barang/jasa, perbarui kuantitas dan harga satuan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingItems(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* General Invoice Description / Scope */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Ringkasan / Keterangan Ruang Lingkup Tagihan
                </label>
                <textarea
                  rows={2}
                  value={editItemDescription}
                  onChange={(e) => setEditItemDescription(e.target.value)}
                  placeholder="Contoh: Pengadaan unit Box Panel Custom 1200x800x400 dan Jasa Instalasi Wiring Kelistrikan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              {/* Items List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Rincian Pos Barang & Jasa ({editItems.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddItem('barang')}
                      className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Barang
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItem('jasa')}
                      className="px-3 py-1.5 bg-violet-50 border border-violet-300 text-violet-700 rounded-lg text-xs font-bold hover:bg-violet-100 flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Jasa
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {editItems.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        {/* Type Selector Toggle */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">#{idx + 1} Jenis:</span>
                          <div className="inline-flex bg-white rounded-lg border border-slate-200 p-0.5 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => handleItemChange(idx, "type", "barang")}
                              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition ${
                                item.type === 'barang' 
                                  ? 'bg-emerald-600 text-white shadow-xs' 
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <Package className="w-3 h-3" /> Barang
                            </button>
                            <button
                              type="button"
                              onClick={() => handleItemChange(idx, "type", "jasa")}
                              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition ${
                                item.type === 'jasa' 
                                  ? 'bg-violet-700 text-white shadow-xs' 
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <Wrench className="w-3 h-3" /> Jasa
                            </button>
                          </div>
                        </div>

                        {/* Subtotal & Delete */}
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className="text-xs font-bold text-slate-500">
                            Subtotal: <strong className="text-slate-800 font-mono">{formatCurrency(item.total)}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Name & Unit Price */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Nama Barang / Jasa
                          </label>
                          <input
                            type="text"
                            required
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                            placeholder="Contoh: Unit Box Panel / Jasa Perakitan & Wiring..."
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Satuan
                          </label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                            placeholder="Unit/Pcs/Paket"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Harga Satuan (Rp)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-violet-500 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Detailed Description */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Deskripsi Lengkap (Spesifikasi Teknis / Lingkup Pekerjaan Jasa)
                        </label>
                        <textarea
                          rows={2}
                          value={item.description || ""}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          placeholder="Jelaskan spesifikasi material, ukuran, ketebalan, toleransi teknis, atau ruang lingkup pengerjaan jasa..."
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra settings: Due Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Batas Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Catatan Faktur
                  </label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Contoh: Net 30 hari, garansi resmi pabrik..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Calculation Summary Bar */}
              {(() => {
                const subtotal = editItems.reduce((acc, it) => acc + (it.total || 0), 0);
                const tax = Math.round(subtotal * 0.11);
                const total = subtotal + tax;

                return (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="text-xs text-violet-800">
                      <div>Subtotal DPP: <strong className="font-mono">{formatCurrency(subtotal)}</strong></div>
                      <div>PPn 11%: <strong className="font-mono">{formatCurrency(tax)}</strong></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-violet-600">Total Akhir Tagihan (Nett)</div>
                      <div className="text-lg font-black text-violet-900 font-mono">{formatCurrency(total)}</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditingItems(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveInvoiceItems}
                className="px-5 py-2 bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


