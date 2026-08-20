/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { User, UserRole, Company, CompanyId } from "../types";
import { 
  Building2, 
  ShieldCheck, 
  UserPlus, 
  ShieldAlert, 
  Key, 
  Grid, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  UserCheck, 
  Upload, 
  Palette, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Save, 
  Plus, 
  Eye, 
  Sparkles,
  Factory,
  Zap,
  Wrench,
  Cpu,
  Building,
  Truck
} from "lucide-react";

interface SettingsAppProps {
  users: User[];
  companies: Company[];
  selectedCompanyId?: CompanyId | null;
  onRefresh: () => void;
  currentUserRole: string;
  onSwitchSessionUser: (user: User) => void;
}

const COLOR_PALETTES = [
  { name: "Indigo Modern", primary: "indigo", color1: "#4F46E5", color2: "#1E1B4B", badge: "bg-indigo-600 text-white border-indigo-700" },
  { name: "Emerald Hijau", primary: "emerald", color1: "#059669", color2: "#064E3B", badge: "bg-emerald-600 text-white border-emerald-700" },
  { name: "Amber Emas", primary: "amber", color1: "#D97706", color2: "#78350F", badge: "bg-amber-600 text-white border-amber-700" },
  { name: "Blue Klasik", primary: "blue", color1: "#2563EB", color2: "#1E3A8A", badge: "bg-blue-600 text-white border-blue-700" },
  { name: "Rose Merah", primary: "rose", color1: "#E11D48", color2: "#881337", badge: "bg-rose-600 text-white border-rose-700" },
  { name: "Slate Hitam", primary: "slate", color1: "#475569", color2: "#0F172A", badge: "bg-slate-800 text-white border-slate-900" },
  { name: "Violet Ungu", primary: "violet", color1: "#7C3AED", color2: "#4C1D95", badge: "bg-violet-600 text-white border-violet-700" }
];

const PRESET_ICONS = [
  {
    id: "factory",
    name: "Pabrik & Fabrikasi",
    icon: Factory,
    generateSvg: (name: string, sub: string, color1: string, color2: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="220" height="55">
  <defs>
    <linearGradient id="grad_custom_set" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <path d="M 20 60 L 50 15 L 62 32 L 75 15 L 105 60 Z" fill="url(#grad_custom_set)" />
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
    <linearGradient id="grad_custom_set" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <rect x="20" y="15" width="70" height="50" rx="14" fill="url(#grad_custom_set)" />
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
    <linearGradient id="grad_custom_set" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <circle cx="55" cy="40" r="28" fill="url(#grad_custom_set)" />
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
    <linearGradient id="grad_custom_set" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <rect x="22" y="18" width="60" height="44" rx="8" fill="url(#grad_custom_set)" />
  <rect x="34" y="28" width="36" height="24" rx="4" fill="#FFFFFF" />
  <circle cx="52" cy="40" r="6" fill="${color1}" />
  <text x="100" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="26" fill="${color2}" letter-spacing="1">${name.toUpperCase()}</text>
  <text x="100" y="62" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="10" fill="${color1}" letter-spacing="2">${sub.toUpperCase()}</text>
</svg>`
  }
];

export default function SettingsApp({ 
  users, 
  companies = [], 
  selectedCompanyId, 
  onRefresh, 
  currentUserRole, 
  onSwitchSessionUser 
}: SettingsAppProps) {
  const [activeTab, setActiveTab] = useState<'company' | 'users'>('company');

  // --- USER STATE ---
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("sales");
  const [userAllowedMenus, setUserAllowedMenus] = useState<string[]>(["sales"]);
  const [userStatusMessage, setUserStatusMessage] = useState<string | null>(null);

  // --- COMPANY CUSTOMIZER STATE ---
  const initialCompany = companies.find(c => c.id === selectedCompanyId) || companies[0] || null;
  const [selectedCompId, setSelectedCompId] = useState<string>(initialCompany ? initialCompany.id : "");
  const [isCreatingNewCompany, setIsCreatingNewCompany] = useState(false);
  const [activeLogoTab, setActiveLogoTab] = useState<'upload' | 'preset' | 'monogram' | 'svg'>('upload');

  // Company Form fields
  const [compName, setCompName] = useState(initialCompany ? initialCompany.name : "");
  const [compFullName, setCompFullName] = useState(initialCompany ? (initialCompany.fullName || "") : "");
  const [compCode, setCompCode] = useState(initialCompany ? initialCompany.code : "");
  const [compTagline, setCompTagline] = useState(initialCompany ? initialCompany.tagline : "");
  const [compAddress, setCompAddress] = useState(initialCompany ? initialCompany.address : "");
  const [compPhone, setCompPhone] = useState(initialCompany ? (initialCompany.phone || "") : "");
  const [compEmail, setCompEmail] = useState(initialCompany ? (initialCompany.email || "") : "");
  const [compNpwp, setCompNpwp] = useState(initialCompany ? (initialCompany.npwp || "") : "");
  const [compBankInfo, setCompBankInfo] = useState(initialCompany ? (initialCompany.bankInfo || "") : "");
  const [compLogoText, setCompLogoText] = useState(initialCompany ? initialCompany.logoText : "");
  const [compLogoSvg, setCompLogoSvg] = useState(initialCompany ? (initialCompany.logoSvg || "") : "");
  const [compLogoUrl, setCompLogoUrl] = useState(initialCompany ? (initialCompany.logoUrl || "") : "");
  
  const initialPalette = COLOR_PALETTES.find(p => p.primary === initialCompany?.primaryColor) || COLOR_PALETTES[0];
  const [selectedPalette, setSelectedPalette] = useState(initialPalette);
  const [selectedPresetId, setSelectedPresetId] = useState("factory");
  const [isSavingComp, setIsSavingComp] = useState(false);
  const [compStatusMessage, setCompStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectCompanyToEdit = (comp: Company) => {
    setSelectedCompId(comp.id);
    setIsCreatingNewCompany(false);
    setCompName(comp.name || "");
    setCompFullName(comp.fullName || "");
    setCompCode(comp.code || "");
    setCompTagline(comp.tagline || "");
    setCompAddress(comp.address || "");
    setCompPhone(comp.phone || "");
    setCompEmail(comp.email || "");
    setCompNpwp(comp.npwp || "");
    setCompBankInfo(comp.bankInfo || "");
    setCompLogoText(comp.logoText || comp.name.slice(0, 2).toUpperCase());
    setCompLogoSvg(comp.logoSvg || "");
    setCompLogoUrl(comp.logoUrl || "");

    const matchedPalette = COLOR_PALETTES.find(p => p.primary === comp.primaryColor) || COLOR_PALETTES[0];
    setSelectedPalette(matchedPalette);

    if (comp.logoUrl) {
      setActiveLogoTab('upload');
    } else if (comp.logoSvg) {
      setActiveLogoTab('preset');
    } else {
      setActiveLogoTab('monogram');
    }
    setCompStatusMessage(null);
  };

  const handleStartNewCompany = () => {
    setIsCreatingNewCompany(true);
    setSelectedCompId("");
    setCompName("Perusahaan Baru");
    setCompFullName("PT PERUSAHAAN BARU INDONESIA");
    setCompCode("PBI");
    setCompTagline("Solusi Industri & Manufaktur Terpadu");
    setCompAddress("Kawasan Industri Hijau Blok A-1, Indonesia");
    setCompPhone("+62 21 555-1234");
    setCompEmail("info@perusahaanbaru.co.id");
    setCompNpwp("01.234.567.8-000.000");
    setCompBankInfo("Bank BCA - A/C: 123-456-7890 a.n. PT Perusahaan Baru Indonesia");
    setCompLogoText("PB");
    setCompLogoUrl("");
    
    const defaultPalette = COLOR_PALETTES[0];
    setSelectedPalette(defaultPalette);
    const preset = PRESET_ICONS[0];
    setCompLogoSvg(preset.generateSvg("Perusahaan Baru", "Solusi Industri", defaultPalette.color1, defaultPalette.color2));
    setActiveLogoTab('preset');
    setCompStatusMessage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setCompLogoUrl(result);
      setCompStatusMessage("Logo gambar berhasil dimuat ke editor!");
      setTimeout(() => setCompStatusMessage(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (presetId: string, palette = selectedPalette) => {
    setSelectedPresetId(presetId);
    const preset = PRESET_ICONS.find(p => p.id === presetId) || PRESET_ICONS[0];
    const generated = preset.generateSvg(
      compName || "PERUSAHAAN", 
      compTagline.slice(0, 24) || "INDUSTRI", 
      palette.color1, 
      palette.color2
    );
    setCompLogoSvg(generated);
    setCompLogoUrl("");
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) {
      alert("Nama perusahaan wajib diisi.");
      return;
    }

    setIsSavingComp(true);
    const payload = {
      name: compName.trim(),
      fullName: compFullName.trim() || ("PT " + compName.trim().toUpperCase()),
      code: (compCode.trim() || compName.trim().slice(0, 4)).toUpperCase(),
      tagline: compTagline.trim(),
      address: compAddress.trim(),
      phone: compPhone.trim(),
      email: compEmail.trim(),
      npwp: compNpwp.trim(),
      bankInfo: compBankInfo.trim(),
      badgeColor: selectedPalette.badge,
      primaryColor: selectedPalette.primary,
      logoText: compLogoText.trim().toUpperCase() || compName.slice(0, 2).toUpperCase(),
      logoSvg: compLogoSvg,
      logoUrl: compLogoUrl,
      logoType: compLogoUrl ? 'upload' : (compLogoSvg ? 'preset' : 'text')
    };

    try {
      const url = isCreatingNewCompany ? "/api/companies" : `/api/companies/${selectedCompId}`;
      const method = isCreatingNewCompany ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setCompStatusMessage(`Profil & Logo "${saved.name}" berhasil disimpan!`);
        setIsCreatingNewCompany(false);
        setSelectedCompId(saved.id);
        onRefresh();
        setTimeout(() => setCompStatusMessage(null), 4000);
      } else {
        alert("Gagal menyimpan data perusahaan.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingComp(false);
    }
  };

  // --- USER HANDLERS ---
  const handleMenuToggle = (menu: string) => {
    if (userAllowedMenus.includes(menu)) {
      setUserAllowedMenus(userAllowedMenus.filter(m => m !== menu));
    } else {
      setUserAllowedMenus([...userAllowedMenus, menu]);
    }
  };

  const handleStartEditUser = (user: User) => {
    setEditingUserId(user.id);
    setUserName(user.name);
    setUserUsername(user.username);
    setUserRole(user.role);
    setUserAllowedMenus(user.allowedMenus || []);
    setIsAddingUser(true);
    setUserStatusMessage(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userUsername.trim()) return;

    try {
      const url = editingUserId ? `/api/users/${editingUserId}` : "/api/users";
      const method = editingUserId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName.trim(),
          username: userUsername.trim().toLowerCase().replace(/\s/g, ''),
          role: userRole,
          allowedMenus: userAllowedMenus
        })
      });

      if (res.ok) {
        setIsAddingUser(false);
        const savedName = userName;
        setEditingUserId(null);
        setUserName("");
        setUserUsername("");
        setUserRole("sales");
        setUserAllowedMenus(["sales"]);
        setUserStatusMessage(`User "${savedName}" berhasil diperbarui!`);
        setTimeout(() => setUserStatusMessage(null), 4000);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${user.name}"?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        if (editingUserId === user.id) {
          setIsAddingUser(false);
          setEditingUserId(null);
        }
        setUserStatusMessage(`User "${user.name}" berhasil dihapus.`);
        setTimeout(() => setUserStatusMessage(null), 4000);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const menuOptions = [
    { value: "sales", label: "Penawaran & Sales (CRM)" },
    { value: "spk", label: "Work Orders (SPK)" },
    { value: "production", label: "Manufaktur & Produksi" },
    { value: "qa", label: "Quality Control (QA)" },
    { value: "logistics", label: "Surat Jalan & Logistik" },
    { value: "finance", label: "Invoice & Penagihan" },
    { value: "inventory", label: "Inventaris & Bahan Baku (Stok)" },
    { value: "users", label: "Manajemen Pengguna (Admin Only)" }
  ];

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: "admin", label: "Administrator / Superuser" },
    { value: "sales", label: "Sales & Marketing Officer" },
    { value: "engineering", label: "Engineering Designer" },
    { value: "finance", label: "Estimator & Finance Officer" },
    { value: "production", label: "Production Operator" },
    { value: "qa", label: "QA Auditor" },
    { value: "logistics", label: "Warehouse & Logistics Manager" }
  ];

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* Top Header with Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Pengaturan Sistem & Kustomisasi ERP
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sesuaikan nama & logo perusahaan, rekening bank faktur, serta otorisasi hak akses personil
          </p>
        </div>

        {/* Primary Settings Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('company')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'company'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Profil & Logo Perusahaan</span>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pengguna & Hak Akses</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto w-full">
        
        {/* TAB 1: COMPANY CUSTOMIZATION */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            
            {/* Company Selection Ribbon */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Pilih Entitas:
                </span>
                {companies.map((c) => {
                  const isSelected = !isCreatingNewCompany && selectedCompId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCompanyToEdit(c)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{c.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">({c.code})</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={handleStartNewCompany}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-dashed ${
                    isCreatingNewCompany
                      ? "bg-amber-500 text-white border-amber-600"
                      : "border-indigo-300 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Entitas Baru</span>
                </button>
              </div>

              {compStatusMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{compStatusMessage}</span>
                </div>
              )}
            </div>

            {/* Customizer Form Grid */}
            <form onSubmit={handleSaveCompany} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Details (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* 1. Nama & Badan Usaha */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3 mb-4 text-indigo-700">
                    <Building2 className="w-4 h-4" /> 1. Identitas Nama & Badan Hukum
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Singkat / Brand <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={compName}
                        onChange={(e) => setCompName(e.target.value)}
                        placeholder="Contoh: Fujiyama"
                        className="w-full px-3 py-2 border rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Nama ringkas yang tampil pada tombol & navigasi.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kode Singkatan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={8}
                        value={compCode}
                        onChange={(e) => setCompCode(e.target.value.toUpperCase())}
                        placeholder="FUJI"
                        className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Digunakan untuk nomor dokumen SPK & Invoice.</p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Resmi Badan Hukum (PT / CV / Firma)
                      </label>
                      <input
                        type="text"
                        value={compFullName}
                        onChange={(e) => setCompFullName(e.target.value)}
                        placeholder="PT FUJIYAMA INDUSTRY INDONESIA"
                        className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Tercetak pada kop surat faktur dan stempel resmi.</p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Slogan / Tagline Usaha
                      </label>
                      <input
                        type="text"
                        value={compTagline}
                        onChange={(e) => setCompTagline(e.target.value)}
                        placeholder="Manufaktur & Fabrikasi Presisi High-Temp"
                        className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Alamat & Kontak */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3 mb-4 text-indigo-700">
                    <MapPin className="w-4 h-4" /> 2. Alamat Pabrik, Kontak & NPWP
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                      <textarea
                        rows={2}
                        value={compAddress}
                        onChange={(e) => setCompAddress(e.target.value)}
                        placeholder="Alamat kantor atau workshop pabrik..."
                        className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Telepon</label>
                        <input
                          type="text"
                          value={compPhone}
                          onChange={(e) => setCompPhone(e.target.value)}
                          placeholder="+62 21 8983-4567"
                          className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi</label>
                        <input
                          type="email"
                          value={compEmail}
                          onChange={(e) => setCompEmail(e.target.value)}
                          placeholder="finance@fujiyama.co.id"
                          className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">NPWP Perusahaan</label>
                        <input
                          type="text"
                          value={compNpwp}
                          onChange={(e) => setCompNpwp(e.target.value)}
                          placeholder="01.345.678.9-012.000"
                          className="w-full px-3 py-2 border rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Rekening Bank */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3 mb-4 text-indigo-700">
                    <CreditCard className="w-4 h-4" /> 3. Rekening Bank untuk Faktur Tagihan (Invoice)
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Instruksi Transfer Bank Resmi
                    </label>
                    <input
                      type="text"
                      value={compBankInfo}
                      onChange={(e) => setCompBankInfo(e.target.value)}
                      placeholder="Bank BCA - A/C: 789-012-3456 a.n. PT Fujiyama Industry Indonesia"
                      className="w-full px-3 py-2 border rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Informasi ini otomatis tampil di bagian instruksi transfer faktur invoice dan surat jalan.
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column: Logo Customizer & Live Previews (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* 4. Logo Designer Box */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between border-b pb-3 mb-4 text-indigo-700">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" /> 4. Kustomisasi Logo Grafis
                    </div>
                  </h3>

                  {/* Logo Mode Tabs */}
                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveLogoTab('upload')}
                      className={`py-1.5 rounded-lg transition text-center ${
                        activeLogoTab === 'upload' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Upload File
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

                  {/* TAB 1: Upload */}
                  {activeLogoTab === 'upload' && (
                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        className="hidden"
                      />

                      {compLogoUrl ? (
                        <div className="p-4 bg-slate-50 border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center gap-3">
                          <img 
                            src={compLogoUrl} 
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
                              onClick={() => setCompLogoUrl("")}
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

                  {/* TAB 2: Presets */}
                  {activeLogoTab === 'preset' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-2">Pilih Ikon Vektor Industri:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {PRESET_ICONS.map((preset) => {
                            const Icon = preset.icon;
                            const isSelected = selectedPresetId === preset.id;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleApplyPreset(preset.id)}
                                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                                  isSelected 
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-600' 
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <Icon className="w-5 h-5 text-indigo-600 shrink-0" />
                                <span className="text-[10px] font-bold leading-tight">{preset.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Monogram */}
                  {activeLogoTab === 'monogram' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Inisial Monogram (2-3 Huruf)
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={compLogoText}
                          onChange={(e) => setCompLogoText(e.target.value.toUpperCase())}
                          placeholder="FJ"
                          className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-black uppercase text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Raw SVG */}
                  {activeLogoTab === 'svg' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Kode SVG Logo Kustom:</label>
                      <textarea
                        rows={4}
                        value={compLogoSvg}
                        onChange={(e) => {
                          setCompLogoSvg(e.target.value);
                          setCompLogoUrl("");
                        }}
                        placeholder="<svg ...>...</svg>"
                        className="w-full px-3 py-2 border rounded-lg text-[11px] font-mono text-slate-700 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Palette Selector */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <label className="block text-[11px] font-bold text-slate-700 mb-2">
                      Pilihan Warna Tema Entitas:
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

                {/* 5. Live Realtime Preview */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-md">
                  <h3 className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Eye className="w-3.5 h-3.5" /> Pratinjau Tampilan Logo & Kop Surat
                  </h3>

                  <div className="bg-white/10 rounded-xl p-4 border border-white/15 backdrop-blur-xs space-y-3">
                    <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">1. Tampilan Header Navbar:</div>
                    <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-lg border border-white/20">
                      {compLogoUrl ? (
                        <img src={compLogoUrl} alt="Logo" className="w-6 h-6 object-contain rounded" />
                      ) : (
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${selectedPalette.badge}`}>
                          {compLogoText || compName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="leading-none">
                        <div className="font-bold text-xs text-white">{compName || "Nama Perusahaan"}</div>
                        <div className="text-[9px] text-slate-300 font-mono mt-0.5">[{compCode || "CODE"}]</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold pt-2 border-t border-white/10">
                      2. Kop Surat Faktur Invoice / PDF:
                    </div>
                    <div className="bg-white text-slate-900 p-3 rounded-lg border shadow-xs flex items-center gap-3">
                      <div className="shrink-0">
                        {compLogoUrl ? (
                          <img src={compLogoUrl} alt="Logo" className="max-h-10 max-w-[100px] object-contain" />
                        ) : compLogoSvg ? (
                          <div 
                            className="max-h-10 max-w-[120px] flex items-center [&_svg]:max-h-9 [&_svg]:w-auto"
                            dangerouslySetInnerHTML={{ __html: compLogoSvg }} 
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-base ${selectedPalette.badge}`}>
                            {compLogoText || compName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="font-black text-xs text-slate-900 leading-tight truncate">
                          {compFullName || ("PT " + (compName || "PERUSAHAAN").toUpperCase())}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate mt-0.5">{compAddress || "Alamat Perusahaan"}</div>
                        <div className="text-[9px] text-slate-400 font-mono">NPWP: {compNpwp || "00.000.000.0-000.000"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSavingComp}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingComp ? "Menyimpan Perubahan..." : "Simpan Profil & Logo Perusahaan"}</span>
                </button>

              </div>

            </form>
          </div>
        )}

        {/* TAB 2: USERS & ROLES */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* Active Simulation User Quick Test Card */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-5 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-1.5">
                  <Key className="w-5 h-5 text-violet-200" />
                  Panel Switcher Simulator User ERP
                </h3>
                <p className="text-xs text-violet-100 mt-1 max-w-xl">
                  Pilih salah satu user terdaftar di bawah ini untuk mensimulasikan sesi login personil dan menguji langsung tampilan menu serta izin aksesnya.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchSessionUser(u)}
                    className="bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-violet-200" />
                    <span>{u.name} ({u.role.toUpperCase()})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* User List Panel */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-violet-600" /> Daftar Pengguna & Edit Nama User
                  </h4>
                  {!isAddingUser && (
                    <button
                      onClick={() => {
                        setEditingUserId(null);
                        setUserName("");
                        setUserUsername("");
                        setUserRole("sales");
                        setUserAllowedMenus(["sales"]);
                        setIsAddingUser(true);
                      }}
                      className="bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Tambah User Baru
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold border-b text-[10px] uppercase">
                        <th className="p-3">Nama Lengkap User</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Jabatan (Role)</th>
                        <th className="p-3">Akses Menu ERP</th>
                        <th className="p-3 text-right">Aksi Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => {
                        const isBeingEdited = editingUserId === u.id;
                        return (
                          <tr 
                            key={u.id} 
                            className={`transition-colors ${isBeingEdited ? 'bg-violet-50/70 border-l-4 border-l-violet-600' : 'hover:bg-slate-50/70'}`}
                          >
                            <td className="p-3">
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isBeingEdited && (
                                  <span className="text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded font-medium">Sedang Di-Edit</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-mono text-slate-600">@{u.username}</td>
                            <td className="p-3">
                              <span className="text-[10px] bg-violet-50 text-violet-700 font-black px-2 py-0.5 rounded-full border border-violet-100">
                                {u.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {u.allowedMenus.map((menu) => (
                                  <span key={menu} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                    {menu === 'sales' && 'Sales'}
                                    {menu === 'spk' && 'SPK'}
                                    {menu === 'production' && 'Produksi'}
                                    {menu === 'qa' && 'QA'}
                                    {menu === 'logistics' && 'Surat Jalan'}
                                    {menu === 'finance' && 'Invoice'}
                                    {menu === 'inventory' && 'Inventaris'}
                                    {menu === 'users' && 'Setelan'}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStartEditUser(u)}
                                  className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-md font-bold text-xs flex items-center gap-1 transition border border-violet-200"
                                  title="Edit Nama & Detail User"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit Nama</span>
                                </button>
                                {isAdmin && users.length > 1 && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                                    title="Hapus User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add/Edit User Panel Form */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                {isAddingUser ? (
                  <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
                    <div className="border-b pb-2 flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-violet-600" /> 
                        {editingUserId ? "Form Edit Nama & Detail User" : "Tambah User Baru"}
                      </h4>
                      {editingUserId && (
                        <span className="text-[10px] text-slate-400 font-mono">ID: {editingUserId}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Nama Lengkap User <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none font-medium text-slate-800"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">Ubah nama user ini sesuai nama personil resmi.</p>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Username Login <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={userUsername}
                        onChange={(e) => setUserUsername(e.target.value)}
                        placeholder="Contoh: budi"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none font-mono text-slate-800"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">Username unik untuk autentikasi sistem.</p>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Jabatan Divisi (Role) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none font-medium text-slate-800 bg-white"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                        <span>Otorisasi Hak Akses Modul ERP:</span>
                        <span className="text-[10px] text-violet-600 font-normal">Pilih modul yang diizinkan</span>
                      </label>
                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-48 overflow-y-auto">
                        {menuOptions.map((m) => {
                          const isChecked = userAllowedMenus.includes(m.value);
                          return (
                            <label key={m.value} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100/80 p-1 rounded transition">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleMenuToggle(m.value)}
                                className="rounded text-violet-600 focus:ring-violet-500 h-3.5 w-3.5"
                              />
                              <span className={`text-xs ${isChecked ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                {m.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-3 rounded-lg shadow-sm transition"
                      >
                        {editingUserId ? "Simpan Perubahan User" : "Simpan User Baru"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingUser(false);
                          setEditingUserId(null);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-3 rounded-lg transition"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <ShieldAlert className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">Pilih User untuk Di-Edit Namanya</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      Klik tombol "Edit Nama" pada salah satu baris pengguna di tabel sebelah kiri untuk mengubah nama personil atau hak aksesnya.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
