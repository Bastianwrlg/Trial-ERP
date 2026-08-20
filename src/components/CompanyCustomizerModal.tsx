/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Company, CompanyId } from "../types";
import { 
  Building2, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Save, 
  Trash2, 
  X, 
  Check, 
  RefreshCw, 
  Plus, 
  Palette, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Code2, 
  Eye,
  Factory,
  Zap,
  Wrench,
  Cpu,
  Truck,
  ShieldCheck,
  Building
} from "lucide-react";

interface CompanyCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  currentCompanyId?: string | null;
  selectedCompanyId?: string | null;
  onCompaniesUpdated?: () => void;
  onSaved?: () => void;
  onSelectCompany?: (id: CompanyId) => void;
}

// Preset vector SVG icon templates
const PRESET_ICONS = [
  {
    id: "factory",
    name: "Pabrik & Fabrikasi",
    icon: Factory,
    generateSvg: (name: string, sub: string, color1: string, color2: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="220" height="55">
  <defs>
    <linearGradient id="grad_custom" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <path d="M 20 60 L 50 15 L 62 32 L 75 15 L 105 60 Z" fill="url(#grad_custom)" />
  <polygon points="50,15 62,32 57,32 45,25" fill="#E0E7FF" opacity="0.8" />
  <circle cx="62.5" cy="48" r="7" fill="#FFFFFF" />
  <text x="120" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="26" fill="${color2}" letter-spacing="1">${name.toUpperCase()}</text>
  <text x="120" y="62" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="10" fill="${color1}" letter-spacing="2">${sub.toUpperCase()}</text>
</svg>`
  },
  {
    id: "energy",
    name: "Kelistrikan & Energi",
    icon: Zap,
    generateSvg: (name: string, sub: string, color1: string, color2: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="220" height="55">
  <defs>
    <linearGradient id="grad_custom" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <rect x="20" y="15" width="70" height="50" rx="14" fill="url(#grad_custom)" />
  <path d="M 50 20 L 36 42 L 53 42 L 43 60 L 69 36 L 51 36 Z" fill="#FFFFFF" />
  <text x="105" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="26" fill="${color2}" letter-spacing="1">${name.toUpperCase()}</text>
  <text x="105" y="62" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="10" fill="${color1}" letter-spacing="2">${sub.toUpperCase()}</text>
</svg>`
  },
  {
    id: "machining",
    name: "Presisi & Machining",
    icon: Wrench,
    generateSvg: (name: string, sub: string, color1: string, color2: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="220" height="55">
  <defs>
    <linearGradient id="grad_custom" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <circle cx="55" cy="40" r="28" fill="url(#grad_custom)" />
  <polygon points="55,18 62,30 75,30 65,40 70,52 55,44 40,52 45,40 35,30 48,30" fill="#FFFFFF" />
  <circle cx="55" cy="40" r="9" fill="${color1}" />
  <text x="100" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="26" fill="${color2}" letter-spacing="1">${name.toUpperCase()}</text>
  <text x="100" y="62" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="10" fill="${color1}" letter-spacing="2">${sub.toUpperCase()}</text>
</svg>`
  },
  {
    id: "hightech",
    name: "Teknologi & Hardware",
    icon: Cpu,
    generateSvg: (name: string, sub: string, color1: string, color2: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="220" height="55">
  <defs>
    <linearGradient id="grad_custom" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <rect x="22" y="18" width="60" height="44" rx="8" fill="url(#grad_custom)" />
  <rect x="34" y="28" width="36" height="24" rx="4" fill="#FFFFFF" />
  <circle cx="52" cy="40" r="6" fill="${color1}" />
  <text x="100" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="26" fill="${color2}" letter-spacing="1">${name.toUpperCase()}</text>
  <text x="100" y="62" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="10" fill="${color1}" letter-spacing="2">${sub.toUpperCase()}</text>
</svg>`
  },
  {
    id: "corporate",
    name: "Korporat & Konstruksi",
    icon: Building,
    generateSvg: (name: string, sub: string, color1: string, color2: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="220" height="55">
  <defs>
    <linearGradient id="grad_custom" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <path d="M 25 60 L 25 30 L 45 18 L 65 30 L 65 60 Z" fill="url(#grad_custom)" />
  <rect x="68" y="32" width="22" height="28" rx="2" fill="${color1}" opacity="0.8" />
  <rect x="36" y="32" width="6" height="6" fill="#FFFFFF" />
  <rect x="48" y="32" width="6" height="6" fill="#FFFFFF" />
  <rect x="36" y="44" width="6" height="6" fill="#FFFFFF" />
  <rect x="48" y="44" width="6" height="6" fill="#FFFFFF" />
  <text x="105" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="26" fill="${color2}" letter-spacing="1">${name.toUpperCase()}</text>
  <text x="105" y="62" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="10" fill="${color1}" letter-spacing="2">${sub.toUpperCase()}</text>
</svg>`
  },
  {
    id: "logistics",
    name: "Logistik & Transport",
    icon: Truck,
    generateSvg: (name: string, sub: string, color1: string, color2: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="220" height="55">
  <defs>
    <linearGradient id="grad_custom" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <rect x="20" y="22" width="46" height="34" rx="4" fill="url(#grad_custom)" />
  <path d="M 68 32 L 84 32 L 90 44 L 90 56 L 68 56 Z" fill="${color1}" />
  <circle cx="36" cy="58" r="6" fill="${color2}" />
  <circle cx="78" cy="58" r="6" fill="${color2}" />
  <text x="105" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="26" fill="${color2}" letter-spacing="1">${name.toUpperCase()}</text>
  <text x="105" y="62" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="10" fill="${color1}" letter-spacing="2">${sub.toUpperCase()}</text>
</svg>`
  }
];

// Color palette options
const COLOR_PALETTES = [
  { name: "Indigo Modern", primary: "indigo", color1: "#4F46E5", color2: "#1E1B4B", badge: "bg-indigo-600 text-white border-indigo-700" },
  { name: "Emerald Hijau", primary: "emerald", color1: "#059669", color2: "#064E3B", badge: "bg-emerald-600 text-white border-emerald-700" },
  { name: "Amber Emas", primary: "amber", color1: "#D97706", color2: "#78350F", badge: "bg-amber-600 text-white border-amber-700" },
  { name: "Blue Klasik", primary: "blue", color1: "#2563EB", color2: "#1E3A8A", badge: "bg-blue-600 text-white border-blue-700" },
  { name: "Rose Merah", primary: "rose", color1: "#E11D48", color2: "#881337", badge: "bg-rose-600 text-white border-rose-700" },
  { name: "Slate Hitam", primary: "slate", color1: "#475569", color2: "#0F172A", badge: "bg-slate-800 text-white border-slate-900" },
  { name: "Violet Ungu", primary: "violet", color1: "#7C3AED", color2: "#4C1D95", badge: "bg-violet-600 text-white border-violet-700" }
];

export const CompanyCustomizerModal: React.FC<CompanyCustomizerModalProps> = ({
  isOpen,
  onClose,
  companies,
  currentCompanyId,
  selectedCompanyId,
  onCompaniesUpdated,
  onSaved,
  onSelectCompany
}) => {
  const effectiveTargetId = selectedCompanyId || currentCompanyId;
  const notifyUpdated = () => {
    if (onCompaniesUpdated) onCompaniesUpdated();
    if (onSaved) onSaved();
  };

  const [selectedCompId, setSelectedCompId] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeLogoTab, setActiveLogoTab] = useState<'upload' | 'preset' | 'monogram' | 'svg'>('upload');
  
  // Form fields
  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [npwp, setNpwp] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  
  // Logo & Styling fields
  const [logoText, setLogoText] = useState("");
  const [logoSvg, setLogoSvg] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);
  const [selectedPresetId, setSelectedPresetId] = useState("factory");

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize selected company
  useEffect(() => {
    if (companies.length > 0) {
      const targetId = effectiveTargetId || companies[0].id;
      const targetComp = companies.find(c => c.id === targetId) || companies[0];
      loadCompanyToForm(targetComp);
    }
  }, [isOpen, companies, effectiveTargetId]);

  const loadCompanyToForm = (comp: Company) => {
    setSelectedCompId(comp.id);
    setIsCreatingNew(false);
    setName(comp.name || "");
    setFullName(comp.fullName || "");
    setCode(comp.code || "");
    setTagline(comp.tagline || "");
    setAddress(comp.address || "");
    setPhone(comp.phone || "");
    setEmail(comp.email || "");
    setNpwp(comp.npwp || "");
    setBankInfo(comp.bankInfo || "");
    setLogoText(comp.logoText || comp.name.slice(0, 2).toUpperCase());
    setLogoSvg(comp.logoSvg || "");
    setLogoUrl(comp.logoUrl || "");

    const matchedPalette = COLOR_PALETTES.find(p => p.primary === comp.primaryColor) || COLOR_PALETTES[0];
    setSelectedPalette(matchedPalette);

    if (comp.logoUrl) {
      setActiveLogoTab('upload');
    } else if (comp.logoSvg) {
      setActiveLogoTab('preset');
    } else {
      setActiveLogoTab('monogram');
    }
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleStartNewCompany = () => {
    setIsCreatingNew(true);
    setSelectedCompId("");
    setName("Perusahaan Baru");
    setFullName("PT PERUSAHAAN BARU INDONESIA");
    setCode("PBI");
    setTagline("Solusi Industri & Manufaktur Terpadu");
    setAddress("Kawasan Industri Hijau Blok A-1, Indonesia");
    setPhone("+62 21 555-1234");
    setEmail("info@perusahaanbaru.co.id");
    setNpwp("01.234.567.8-000.000");
    setBankInfo("Bank BCA - A/C: 123-456-7890 a.n. PT Perusahaan Baru Indonesia");
    setLogoText("PB");
    setLogoUrl("");
    
    const defaultPalette = COLOR_PALETTES[0];
    setSelectedPalette(defaultPalette);
    const preset = PRESET_ICONS[0];
    setLogoSvg(preset.generateSvg("Perusahaan Baru", "Solusi Industri", defaultPalette.color1, defaultPalette.color2));
    setActiveLogoTab('preset');
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  // Image Upload Handler (converts to base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran file gambar maksimal 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setLogoUrl(result);
      setSuccessMsg("Logo gambar berhasil dimuat!");
      setTimeout(() => setSuccessMsg(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Preset Icon Generator
  const handleApplyPreset = (presetId: string, palette = selectedPalette) => {
    setSelectedPresetId(presetId);
    const preset = PRESET_ICONS.find(p => p.id === presetId) || PRESET_ICONS[0];
    const generated = preset.generateSvg(
      name || "PERUSAHAAN", 
      tagline.slice(0, 24) || "INDUSTRI", 
      palette.color1, 
      palette.color2
    );
    setLogoSvg(generated);
    setLogoUrl(""); // Clear uploaded URL if preset selected
  };

  // Save changes to API & DB
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama perusahaan wajib diisi.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      fullName: fullName.trim() || ("PT " + name.trim().toUpperCase()),
      code: (code.trim() || name.trim().slice(0, 4)).toUpperCase(),
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      npwp: npwp.trim(),
      bankInfo: bankInfo.trim(),
      badgeColor: selectedPalette.badge,
      primaryColor: selectedPalette.primary,
      logoText: logoText.trim().toUpperCase() || name.slice(0, 2).toUpperCase(),
      logoSvg: logoSvg,
      logoUrl: logoUrl,
      logoType: logoUrl ? 'upload' : (logoSvg ? 'preset' : 'text')
    };

    try {
      const url = isCreatingNew ? "/api/companies" : `/api/companies/${selectedCompId}`;
      const method = isCreatingNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedComp = await res.json();
        setSuccessMsg(`Profil & Logo "${savedComp.name}" berhasil disimpan!`);
        notifyUpdated();
        if (isCreatingNew) {
          setIsCreatingNew(false);
          setSelectedCompId(savedComp.id);
          if (onSelectCompany) {
            onSelectCompany(savedComp.id);
          }
        }
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || "Gagal menyimpan perubahan perusahaan.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan koneksi saat menyimpan perusahaan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompId || companies.length <= 1) {
      alert("Sistem membutuhkan minimal satu perusahaan terdaftar.");
      return;
    }

    if (!confirm(`Hapus perusahaan "${name}" dari sistem? Data yang terhubung akan tetap aman namun entitas ini tidak akan muncul di daftar pilihan.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/companies/${selectedCompId}`, { method: "DELETE" });
      if (res.ok) {
        notifyUpdated();
        const remaining = companies.filter(c => c.id !== selectedCompId);
        if (remaining.length > 0) {
          loadCompanyToForm(remaining[0]);
          if (onSelectCompany) onSelectCompany(remaining[0].id);
        }
        setSuccessMsg("Perusahaan berhasil dihapus.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
              <Building2 className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Kustomisasi Nama & Logo Perusahaan
                <span className="text-[11px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Multi-Company ERP
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Atur nama brand, nama resmi PT/CV, logo grafis/gambar, rekening bank, dan identitas kop surat faktur
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Selector Switcher Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Pilih Entitas:
            </span>
            {companies.map((c) => {
              const isActive = !isCreatingNew && selectedCompId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => loadCompanyToForm(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({c.code})</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleStartNewCompany}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-dashed ${
                isCreatingNew
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "border-indigo-300 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Perusahaan Baru</span>
            </button>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Company Info Inputs (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Box 1: Identitas Pokok */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3 mb-4 text-indigo-700">
                  <Building2 className="w-4 h-4" /> 1. Identitas Nama & Badan Hukum
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Brand / Perusahaan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Fujiyama / Jaya Teknik"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Nama ringkas yang tampil pada tombol & navigasi.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kode Singkatan Dokumen <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Contoh: FUJI / ARGA / JT"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Digunakan untuk penomoran SPK/INV (misal: SPK/FUJI/..)</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Resmi Badan Usaha (PT / CV / Firma)
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: PT FUJIYAMA INDUSTRY INDONESIA"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Nama lengkap hukum yang tertera pada kop surat resmi dan tanda tangan faktur.</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Slogan / Tagline Bidang Usaha
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Contoh: Manufaktur & Fabrikasi Presisi High-Temp"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Box 2: Alamat & Kontak Resmi */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3 mb-4 text-indigo-700">
                  <MapPin className="w-4 h-4" /> 2. Alamat, Kontak & NPWP Resmi
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Lengkap Pabrik / Kantor
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Contoh: Kawasan Industri Jababeka V Blok C-18, Cikarang - Bekasi"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor Telepon / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+62 21 8983-4567"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Resmi Invoicing / Info
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="finance@fujiyama.co.id"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor Pokok Wajib Pajak (NPWP)
                      </label>
                      <input
                        type="text"
                        value={npwp}
                        onChange={(e) => setNpwp(e.target.value)}
                        placeholder="01.345.678.9-012.000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 3: Rekening Bank Penagihan */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3 mb-4 text-indigo-700">
                  <CreditCard className="w-4 h-4" /> 3. Rekening Bank untuk Faktur Tagihan (Invoice)
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instruksi Transfer Bank Resmi
                  </label>
                  <input
                    type="text"
                    value={bankInfo}
                    onChange={(e) => setBankInfo(e.target.value)}
                    placeholder="Contoh: Bank BCA KCP Cikarang - A/C: 789-012-3456 a.n. PT Fujiyama Industry Indonesia"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Informasi ini otomatis tercetak pada bagian instruksi pembayaran di setiap invoice PDF yang diekspor.
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Logo Customization & Live Previews (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Box 4: Logo Customizer Tool */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between border-b pb-3 mb-4 text-indigo-700">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" /> 4. Kustomisasi Logo Grafis
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                    Logo Desain
                  </span>
                </h3>

                {/* Logo method tab pills */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveLogoTab('upload')}
                    className={`py-1.5 rounded-lg transition text-center ${
                      activeLogoTab === 'upload' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upload Gambar
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLogoTab('preset')}
                    className={`py-1.5 rounded-lg transition text-center ${
                      activeLogoTab === 'preset' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ikon Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLogoTab('monogram')}
                    className={`py-1.5 rounded-lg transition text-center ${
                      activeLogoTab === 'monogram' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monogram
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLogoTab('svg')}
                    className={`py-1.5 rounded-lg transition text-center ${
                      activeLogoTab === 'svg' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kode SVG
                  </button>
                </div>

                {/* TAB 1: Upload Image */}
                {activeLogoTab === 'upload' && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      className="hidden"
                    />

                    {logoUrl ? (
                      <div className="p-4 bg-slate-50 border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center gap-3">
                        <img 
                          src={logoUrl} 
                          alt="Logo Perusahaan" 
                          className="max-h-20 max-w-full object-contain rounded drop-shadow-xs" 
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" /> Ganti Gambar
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogoUrl("")}
                            className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-6 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl flex flex-col items-center justify-center cursor-pointer transition text-center group"
                      >
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-2 group-hover:scale-110 transition">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">Klik untuk upload file logo</span>
                        <span className="text-[10px] text-slate-400 mt-1">Format PNG, JPG, WebP, atau SVG (Maks. 5 MB)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Presets & Icons */}
                {activeLogoTab === 'preset' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-2">Pilih Ikon Vektor Industri:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESET_ICONS.map((preset) => {
                          const Icon = preset.icon;
                          const isSelected = selectedPresetId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleApplyPreset(preset.id)}
                              className={`p-2.5 rounded-xl border text-left flex flex-col items-center gap-1.5 transition ${
                                isSelected 
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-600' 
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <Icon className="w-5 h-5 text-indigo-600" />
                              <span className="text-[10px] font-bold text-center leading-tight">{preset.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Monogram Inisial */}
                {activeLogoTab === 'monogram' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Inisial 2-3 Huruf
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value.toUpperCase())}
                        placeholder="FJ"
                        className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-black uppercase text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: Raw SVG Input */}
                {activeLogoTab === 'svg' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Kode SVG Logo Kustom:</label>
                    <textarea
                      rows={4}
                      value={logoSvg}
                      onChange={(e) => {
                        setLogoSvg(e.target.value);
                        setLogoUrl("");
                      }}
                      placeholder="<svg ...>...</svg>"
                      className="w-full px-3 py-2 border rounded-lg text-[11px] font-mono text-slate-700 focus:outline-none"
                    />
                  </div>
                )}

                {/* Color Palette Selector */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-700 mb-2">
                    Tema Warna Entitas Perusahaan:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTES.map((pal) => {
                      const isSelected = selectedPalette.primary === pal.primary;
                      return (
                        <button
                          key={pal.primary}
                          type="button"
                          onClick={() => {
                            setSelectedPalette(pal);
                            if (activeLogoTab === 'preset') {
                              handleApplyPreset(selectedPresetId, pal);
                            }
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                            isSelected ? 'ring-2 ring-indigo-600 border-indigo-600 bg-slate-50' : 'border-slate-200'
                          }`}
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-black/10" 
                            style={{ backgroundColor: pal.color1 }} 
                          />
                          <span className="text-[11px] text-slate-800 font-semibold">{pal.name.split(" ")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Box 5: Live Realtime Preview */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-md">
                <h3 className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Eye className="w-3.5 h-3.5" /> Pratinjau Tampilan Logo & Kop Surat
                </h3>

                {/* Live Banner Preview */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/15 backdrop-blur-xs space-y-3">
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">1. Tampilan Header Navbar:</div>
                  <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-lg border border-white/20">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain rounded" />
                    ) : (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${selectedPalette.badge}`}>
                        {logoText || name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="leading-none">
                      <div className="font-bold text-xs text-white">{name || "Nama Perusahaan"}</div>
                      <div className="text-[9px] text-slate-300 font-mono mt-0.5">[{code || "CODE"}]</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold pt-2 border-t border-white/10">
                    2. Kop Surat Faktur Invoice / PDF:
                  </div>
                  <div className="bg-white text-slate-900 p-3 rounded-lg border shadow-xs flex items-center gap-3">
                    <div className="shrink-0">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="max-h-10 max-w-[100px] object-contain" />
                      ) : logoSvg ? (
                        <div 
                          className="max-h-10 max-w-[120px] flex items-center [&_svg]:max-h-9 [&_svg]:w-auto"
                          dangerouslySetInnerHTML={{ __html: logoSvg }} 
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-base ${selectedPalette.badge}`}>
                          {logoText || name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="font-black text-xs text-slate-900 leading-tight truncate">
                        {fullName || ("PT " + (name || "PERUSAHAAN").toUpperCase())}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">{address || "Alamat Perusahaan"}</div>
                      <div className="text-[9px] text-slate-400 font-mono">NPWP: {npwp || "00.000.000.0-000.000"}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Modal Footer Controls */}
          <div className="border-t border-slate-200 pt-5 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-white py-2">
            {!isCreatingNew && companies.length > 1 ? (
              <button
                type="button"
                onClick={handleDeleteCompany}
                className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Entitas Ini
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Batal / Tutup
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Profil & Logo Perusahaan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
