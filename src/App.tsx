/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  User, 
  Quotation, 
  Spk, 
  ProductionLog, 
  QaChecklist, 
  SuratJalan, 
  Invoice,
  InventoryItem,
  CompanyId,
  Company
} from "./types";
import { COMPANIES } from "./data/companies";

import SalesApp from "./components/SalesApp";
import SpkApp from "./components/SpkApp";
import ProductionApp from "./components/ProductionApp";
import QaApp from "./components/QaApp";
import LogisticsApp from "./components/LogisticsApp";
import InvoiceApp from "./components/InvoiceApp";
import SettingsApp from "./components/SettingsApp";
import InventoryApp from "./components/InventoryApp";
import WorkflowVisualizer from "./components/WorkflowVisualizer";
import { CompanySelector } from "./components/CompanySelector";
import { LanAccessModal } from "./components/LanAccessModal";
import { LoginForm } from "./components/LoginForm";
import { CompanyCustomizerModal } from "./components/CompanyCustomizerModal";

import { 
  Grid, 
  ShoppingBag, 
  Briefcase, 
  Wrench, 
  ShieldCheck, 
  Truck, 
  Receipt, 
  Users, 
  Lock, 
  RefreshCw, 
  User as UserIcon, 
  Layers,
  Package,
  Building2,
  ChevronDown,
  LogOut,
  Wifi,
  ArrowLeft,
  ArrowRight,
  Home,
  Palette,
  Edit3
} from "lucide-react";

const DEFAULT_USERS: User[] = [
  { id: "u1", name: "Administrator", username: "admin", password: "123", role: "admin", allowedMenus: ["sales", "spk", "production", "qa", "logistics", "finance", "inventory", "users"] },
  { id: "u2", name: "Budi Santoso", username: "budi", password: "123", role: "sales", allowedMenus: ["sales", "finance"] },
  { id: "u3", name: "Eko Prasetyo", username: "eko", password: "123", role: "engineering", allowedMenus: ["spk"] },
  { id: "u4", name: "Siti Rahma", username: "siti", password: "123", role: "finance", allowedMenus: ["spk", "finance"] },
  { id: "u5", name: "Agus Wijaya", username: "agus", password: "123", role: "production", allowedMenus: ["spk", "production", "inventory"] },
  { id: "u6", name: "Rudi Hartono", username: "rudi", password: "123", role: "qa", allowedMenus: ["production", "qa"] },
  { id: "u7", name: "Joko Widodo", username: "joko", password: "123", role: "logistics", allowedMenus: ["logistics"] }
];

export default function App() {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [history, setHistory] = useState<(string | null)[]>([null]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [selectedCompanyId, setSelectedCompanyId] = useState<CompanyId | null>(() => {
    return (localStorage.getItem("erp_company_id") as CompanyId) || null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("erp_auth") === "true";
  });
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isLanModalOpen, setIsLanModalOpen] = useState(false);
  const [isCustomizerModalOpen, setIsCustomizerModalOpen] = useState(false);
  const [customizerCompanyId, setCustomizerCompanyId] = useState<string | null>(null);

  const navigateToModule = (appId: string | null) => {
    if (appId === activeApp) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(appId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setActiveApp(appId);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setActiveApp(history[prevIndex]);
    } else if (activeApp !== null) {
      navigateToModule(null);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setActiveApp(history[nextIndex]);
    } else if (activeApp) {
      const moduleSequence = ["sales", "spk", "production", "qa", "logistics", "finance", "inventory", "users"];
      const currentIndex = moduleSequence.indexOf(activeApp);
      if (currentIndex >= 0 && currentIndex < moduleSequence.length - 1) {
        navigateToModule(moduleSequence[currentIndex + 1]);
      }
    }
  };
  
  // Data State
  const [companies, setCompanies] = useState<Company[]>(COMPANIES);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [spks, setSpks] = useState<Spk[]>([]);
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>([]);
  const [qaChecklists, setQaChecklists] = useState<QaChecklist[]>([]);
  const [sjList, setSjList] = useState<SuratJalan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Fetch all state from full-stack API
  const fetchData = async () => {
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const data = await res.json();
        if (data.companies && Array.isArray(data.companies) && data.companies.length > 0) {
          setCompanies(data.companies);
        } else {
          setCompanies(COMPANIES);
        }

        const loadedUsers = data.users || DEFAULT_USERS;
        setUsers(loadedUsers);
        setQuotations(data.quotations || []);
        setSpks(data.spks || []);
        setProductionLogs(data.productionLogs || []);
        setQaChecklists(data.qaChecklists || []);
        setSjList(data.suratJalanList || []);
        setInvoices(data.invoices || []);
        setInventory(data.inventory || []);

        const storedUserId = localStorage.getItem("erp_user_id");
        if (storedUserId) {
          const match = loadedUsers.find((u: User) => u.id === storedUserId);
          if (match) setCurrentUser(match);
          else setCurrentUser(loadedUsers[0]);
        } else if (!currentUser) {
          setCurrentUser(loadedUsers[0]);
        }
      } else {
        setCompanies(COMPANIES);
        setUsers(DEFAULT_USERS);
        const storedUserId = localStorage.getItem("erp_user_id");
        const match = DEFAULT_USERS.find((u: User) => u.id === storedUserId);
        setCurrentUser(match || DEFAULT_USERS[0]);
      }
    } catch (err) {
      console.error("Error fetching ERP database, using client fallback:", err);
      setCompanies(COMPANIES);
      setUsers(DEFAULT_USERS);
      const storedUserId = localStorage.getItem("erp_user_id");
      const match = DEFAULT_USERS.find((u: User) => u.id === storedUserId);
      setCurrentUser(match || DEFAULT_USERS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectCompany = (id: CompanyId) => {
    setSelectedCompanyId(id);
    localStorage.setItem("erp_company_id", id);
    setIsCompanyModalOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("erp_auth");
    localStorage.removeItem("erp_user_id");
    setActiveApp(null);
  };

  const activeCompany = (companies.find(c => c.id === selectedCompanyId) || companies[0]) ?? null;

  // Calculate counts per company for CompanySelector
  const quotationCountByCompany = quotations.reduce((acc, q) => {
    const cId = q.companyId || 'fujiyama';
    acc[cId] = (acc[cId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const spkCountByCompany = spks.reduce((acc, s) => {
    const cId = s.companyId || 'fujiyama';
    acc[cId] = (acc[cId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter state for current company
  const filteredQuotations = quotations.filter(q => (q.companyId || 'fujiyama') === selectedCompanyId);
  const filteredSpks = spks.filter(s => (s.companyId || 'fujiyama') === selectedCompanyId);
  const filteredProductionLogs = productionLogs.filter(p => (p.companyId || 'fujiyama') === selectedCompanyId);
  const filteredQaChecklists = qaChecklists.filter(q => (q.companyId || 'fujiyama') === selectedCompanyId);
  const filteredSjList = sjList.filter(s => (s.companyId || 'fujiyama') === selectedCompanyId);
  const filteredInvoices = invoices.filter(i => (i.companyId || 'fujiyama') === selectedCompanyId);
  const filteredInventory = inventory.filter(inv => (inv.companyId || 'fujiyama') === selectedCompanyId);

  const handleResetDB = async () => {
    if (confirm("Reset ulang seluruh database ERP ke kondisi default?")) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/db/reset");
        if (res.ok) {
          alert("Database berhasil direset!");
          fetchData();
          setActiveApp(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("erp_user_id", user.id);
  };

  const handleOpenCustomizer = (companyId?: string) => {
    setCustomizerCompanyId(companyId || selectedCompanyId || companies[0]?.id || "fujiyama");
    setIsCustomizerModalOpen(true);
  };

  // Helper to determine active workflow node for visualizer
  const getOverallWorkflowStage = () => {
    if (filteredSpks.length === 0) return 'Penawaran';
    
    // Check in reverse order
    const hasPaidInvoice = filteredInvoices.some(i => i.status === 'Paid');
    if (hasPaidInvoice) return 'Completed';

    const hasInvoiced = filteredInvoices.length > 0;
    if (hasInvoiced) return 'Invoice';

    const hasSjDelivered = filteredSjList.some(s => s.status === 'Delivered');
    if (hasSjDelivered) return 'Invoice';

    const hasSj = filteredSjList.length > 0;
    if (hasSj) return 'Surat Jalan';

    const hasPassedQa = filteredQaChecklists.some(q => q.status === 'Passed');
    if (hasPassedQa) return 'Surat Jalan';

    const hasQaCheck = filteredQaChecklists.length > 0;
    if (hasQaCheck) return 'QA';

    const hasCompletedProd = filteredProductionLogs.some(p => p.status === 'Completed');
    if (hasCompletedProd) return 'QA';

    const hasActiveProd = filteredProductionLogs.some(p => p.status === 'In Progress');
    if (hasActiveProd) return 'Produksi';

    const hasSpkInProd = filteredSpks.some(s => s.status === 'In Production');
    if (hasSpkInProd) return 'Produksi';

    if (filteredSpks.length > 0) return 'SPK';

    return 'Penawaran';
  };

  // Odoo Module Grid details
  const appsList = [
    { id: "sales", title: "Sales & Penawaran", desc: "CRM & Quotation", icon: ShoppingBag, color: "bg-amber-500 text-white" },
    { id: "spk", title: "Work Orders (SPK)", desc: "RAB & Engineering", icon: Briefcase, color: "bg-sky-500 text-white" },
    { id: "production", title: "Manufaktur & Produksi", desc: "Uji Oven & Bahan Baku", icon: Wrench, color: "bg-indigo-500 text-white" },
    { id: "qa", title: "Quality Control (QA)", desc: "Verifikasi Kelayakan", icon: ShieldCheck, color: "bg-emerald-500 text-white" },
    { id: "logistics", title: "Surat Jalan & Kirim", desc: "Logistik & Ekspedisi", icon: Truck, color: "bg-teal-500 text-white" },
    { id: "finance", title: "Penagihan & Invoice", desc: "Billing & PPn 11%", icon: Receipt, color: "bg-violet-500 text-white" },
    { id: "inventory", title: "Inventaris & Bahan Baku", desc: "Manajemen Stok & Bahan Baku", icon: Package, color: "bg-slate-600 text-white" },
    { id: "users", title: "Profil PT & Akses User", desc: "Nama/Logo & Akses Menu", icon: Users, color: "bg-rose-500 text-white" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500 mb-4"></div>
        <div className="text-sm font-semibold tracking-wide">Menghubungkan ke Mesin ERP...</div>
      </div>
    );
  }

  // App accessibility check
  const isAppAllowed = activeApp ? currentUser?.allowedMenus.includes(activeApp) : true;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-800">
      
      {/* Top Navigation Bar */}
      <header className="bg-[#714B67] text-white flex items-center justify-between px-4 py-2.5 shadow-md shrink-0 select-none">
        <div className="flex items-center gap-3">
          {/* App Launcher Grid button */}
          <button 
            onClick={() => navigateToModule(null)}
            title="Home Menu Apps"
            className="p-1.5 hover:bg-white/10 rounded transition focus:outline-none flex items-center gap-1.5 cursor-pointer"
          >
            <Grid className="w-5 h-5" />
            <span className="font-extrabold tracking-wider text-sm hidden sm:inline">ERP</span>
          </button>

          {/* Back & Forward Quick Navigation Buttons in Navbar */}
          <div className="flex items-center gap-1 bg-black/25 p-1 rounded-lg border border-white/20">
            <button
              onClick={handleGoBack}
              disabled={historyIndex === 0 && activeApp === null}
              title="Kembali ke Halaman / Modul Sebelumnya (Back)"
              className="p-1 hover:bg-white/20 active:bg-white/30 disabled:opacity-30 disabled:hover:bg-transparent rounded transition text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoForward}
              title="Maju ke Halaman / Modul Selanjutnya (Forward)"
              className="p-1 hover:bg-white/20 active:bg-white/30 rounded transition text-white cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Company Selector Button in Navbar */}
          <button
            onClick={() => setIsCompanyModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/25 hover:bg-black/35 border border-white/20 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title="Ganti Perusahaan / Unit Bisnis"
          >
            {activeCompany?.logoUrl ? (
              <img src={activeCompany.logoUrl} alt="Logo" className="w-4 h-4 object-contain rounded" />
            ) : (
              <Building2 className="w-4 h-4 text-amber-300" />
            )}
            <span className="max-w-[150px] sm:max-w-xs truncate">{activeCompany ? activeCompany.name : 'Pilih Perusahaan'}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {activeApp && (
            <div className="hidden lg:flex items-center gap-2 border-l border-white/20 pl-3 text-xs font-semibold">
              <span className="text-white/70">Aplikasi:</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-white font-bold tracking-wide uppercase">
                {activeApp === 'sales' && 'Sales & Penawaran'}
                {activeApp === 'spk' && 'SPK (Work Orders)'}
                {activeApp === 'production' && 'Manufaktur & Produksi'}
                {activeApp === 'qa' && 'Quality Control (QA)'}
                {activeApp === 'logistics' && 'Surat Jalan & Logistik'}
                {activeApp === 'finance' && 'Invoice & Penagihan'}
                {activeApp === 'inventory' && 'Inventaris & Bahan Baku'}
                {activeApp === 'users' && 'Setelan Profil & Akses'}
              </span>
            </div>
          )}
        </div>

        {/* Simulator session user switcher & Logout button in navbar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLanModalOpen(true)}
            title="Akses ERP Lewat Jaringan Lokal (Wi-Fi / LAN)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs border border-emerald-400/30 cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Akses LAN</span>
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2 bg-black/15 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
              <span className="text-white/60">User:</span>
              <span className="font-bold text-violet-200">{currentUser?.name}</span>
              <span className="bg-violet-500/30 text-violet-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase">{currentUser?.role}</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 bg-black/15 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-amber-200 font-medium">
              Silakan Login
            </div>
          )}

          <button
            onClick={handleResetDB}
            title="Reset ulang seluruh database simulasi"
            className="p-1.5 hover:bg-white/10 rounded transition text-white/80 hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              title="Keluar dari Akun / Kembali ke Form Login"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs border border-red-400/30 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedCompanyId === null ? (
          /* Multi-Company Portal Selection Landing Page */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex items-center justify-center">
            <CompanySelector
              currentCompanyId={selectedCompanyId}
              onSelectCompany={handleSelectCompany}
              quotationCountByCompany={quotationCountByCompany}
              spkCountByCompany={spkCountByCompany}
              companies={companies}
              onOpenCustomizer={handleOpenCustomizer}
            />
          </div>
        ) : !isAuthenticated ? (
          /* Login Form after Company Selection */
          <div className="flex-1 overflow-y-auto bg-slate-100 flex items-center justify-center py-6">
            <LoginForm
              company={activeCompany!}
              users={users}
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                setIsAuthenticated(true);
                localStorage.setItem("erp_auth", "true");
                localStorage.setItem("erp_user_id", user.id);
              }}
              onChangeCompany={() => {
                setSelectedCompanyId(null);
                localStorage.removeItem("erp_company_id");
              }}
            />
          </div>
        ) : activeApp === null ? (
          /* Odoo App Launcher / Grid Dashboard */
          <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
            
            {/* Visual workflow banner mapping directly to user sketch */}
            <WorkflowVisualizer currentStage={getOverallWorkflowStage()} />

            {/* Headline and introduction card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 w-fit mb-2 border border-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Entitas Aktif: {activeCompany?.name} ({activeCompany?.code})</span>
                  <button
                    onClick={() => setIsCompanyModalOpen(true)}
                    className="ml-1 text-indigo-600 hover:underline font-bold cursor-pointer"
                  >
                    [ Ganti ]
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={handleLogout}
                    className="text-rose-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    title="Logout & Kembali Pilih Perusahaan"
                  >
                    <LogOut className="w-3 h-3" />
                    Logout
                  </button>
                </div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Layers className="w-6 h-6 text-violet-700" />
                  ERP Manufaktur SPK & Produksi - {activeCompany?.name}
                </h1>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                  {activeCompany?.fullName ? `${activeCompany.fullName} — ` : ''}Sistem ERP terintegrasi penuh yang mengotomasi alur Surat Perintah Kerja (SPK), Costing Anggaran (RAB/HPP), Desain Engineering, Rekaman Suhu Oven, Uji Mutu QA, Surat Jalan Logistik, dan Penagihan Invoice.
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-100 w-fit">
                  <UserIcon className="w-4 h-4" />
                  Anda masuk sebagai: <strong>{currentUser?.name} ({currentUser?.role.toUpperCase()})</strong>.
                </div>
              </div>

              {/* Little stats summary panel */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border w-full md:w-auto shrink-0 text-center">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Sales</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{filteredQuotations.length}</div>
                </div>
                <div className="border-x px-3">
                  <div className="text-xs text-slate-400 font-bold uppercase">SPK</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{filteredSpks.length}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Invoice</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{filteredInvoices.length}</div>
                </div>
              </div>
            </div>

            {/* Apps Launcher Grid */}
            <h3 className="font-extrabold text-slate-500 uppercase tracking-wider text-xs mb-4">Aplikasi & Modul Sistem</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {appsList.map((app) => {
                const Icon = app.icon;
                const isAllowed = currentUser?.allowedMenus.includes(app.id);

                return (
                  <div
                    key={app.id}
                    onClick={() => navigateToModule(app.id)}
                    className="group bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md cursor-pointer transition duration-200 relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className={`p-2.5 rounded-lg ${app.color} shadow-xs group-hover:scale-105 transition`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Permission Lock Indicator */}
                        {!isAllowed && (
                          <span className="bg-red-50 text-red-700 border border-red-100 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Terkunci
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-800 group-hover:text-violet-700 transition">{app.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{app.desc}</p>
                    </div>

                    <div className="text-[10px] font-bold text-violet-700 mt-4 group-hover:translate-x-1 transition flex items-center gap-1">
                      Buka Aplikasi →
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          /* Active App Screen Pane with access restriction checking */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sticky Module Sub-Navigation Bar with Back & Forward Buttons */}
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs shrink-0 z-20">
              <div className="flex items-center gap-2">
                {/* Back Button */}
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 shadow-2xs cursor-pointer"
                  title="Kembali ke Modul Sebelumnya / Home (Back)"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-600" />
                  <span>Kembali (Back)</span>
                </button>

                {/* Home / Dashboard Button */}
                <button
                  onClick={() => navigateToModule(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200 shadow-2xs cursor-pointer"
                  title="Kembali ke Dashboard Utama"
                >
                  <Home className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>

                {/* Forward Button */}
                <button
                  onClick={handleGoForward}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition border border-indigo-200 shadow-2xs cursor-pointer"
                  title="Maju ke Modul Selanjutnya (Forward)"
                >
                  <span>Lanjut (Forward)</span>
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                </button>
              </div>

              {/* Current Module Info */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-400">Modul Aktif:</span>
                <span className="text-violet-700 font-extrabold uppercase">
                  {appsList.find(a => a.id === activeApp)?.title || activeApp}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-medium text-[11px] hidden md:inline">
                  Langkah {appsList.findIndex(a => a.id === activeApp) + 1} dari {appsList.length}
                </span>
              </div>
            </div>

            {!isAppAllowed ? (
              /* Access Denied Page */
              <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-200 shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800">Akses Menu Ditolak!</h3>
                <p className="text-sm text-slate-500 max-w-md mt-2">
                  Role Anda saat ini sebagai <strong className="text-slate-700 font-bold">{(currentUser?.role || "GUEST").toUpperCase()}</strong> tidak memiliki otorisasi untuk mengakses menu ini.
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setActiveApp(null)}
                    className="px-4 py-2 border border-slate-300 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Kembali ke Dashboard
                  </button>
                  <button
                    onClick={() => setActiveApp("users")}
                    className="px-4 py-2 bg-violet-700 text-white rounded-lg text-xs font-bold hover:bg-violet-800 transition cursor-pointer"
                  >
                    Ganti Akun Simulator
                  </button>
                </div>
              </div>
            ) : (
              /* Active Module Component injection */
              <>
                {activeApp === "sales" && (
                  <SalesApp 
                    quotations={filteredQuotations} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                    selectedCompanyId={selectedCompanyId}
                  />
                )}
                {activeApp === "spk" && (
                  <SpkApp 
                    spks={filteredSpks} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                    currentUsername={currentUser?.name || ""} 
                  />
                )}
                {activeApp === "production" && (
                  <ProductionApp 
                    logs={filteredProductionLogs} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                  />
                )}
                {activeApp === "qa" && (
                  <QaApp 
                    checklists={filteredQaChecklists} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                    currentUsername={currentUser?.name || ""} 
                  />
                )}
                {activeApp === "logistics" && (
                  <LogisticsApp 
                    sjList={filteredSjList} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                    selectedCompanyId={selectedCompanyId}
                    companies={companies}
                  />
                )}
                {activeApp === "finance" && (
                  <InvoiceApp 
                    invoices={filteredInvoices} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                    selectedCompanyId={selectedCompanyId}
                    companies={companies}
                  />
                )}
                {activeApp === "inventory" && (
                  <InventoryApp 
                    inventory={filteredInventory} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                    selectedCompanyId={selectedCompanyId}
                  />
                )}
                {activeApp === "users" && (
                  <SettingsApp 
                    users={users} 
                    companies={companies}
                    selectedCompanyId={selectedCompanyId}
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                    onSwitchSessionUser={handleSwitchUser} 
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Company Switcher Modal */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-2 sm:p-6 my-8 max-h-[90vh] overflow-y-auto border border-slate-200">
            <CompanySelector
              currentCompanyId={selectedCompanyId}
              onSelectCompany={handleSelectCompany}
              onCloseModal={() => setIsCompanyModalOpen(false)}
              isModal={true}
              quotationCountByCompany={quotationCountByCompany}
              spkCountByCompany={spkCountByCompany}
              companies={companies}
              onOpenCustomizer={(cId) => {
                setIsCompanyModalOpen(false);
                handleOpenCustomizer(cId);
              }}
            />
          </div>
        </div>
      )}

      {/* Standalone Company Customizer Modal */}
      <CompanyCustomizerModal
        isOpen={isCustomizerModalOpen}
        onClose={() => setIsCustomizerModalOpen(false)}
        onSaved={fetchData}
        companies={companies}
        selectedCompanyId={customizerCompanyId}
      />

      {/* LAN Access Guide Modal */}
      <LanAccessModal
        isOpen={isLanModalOpen}
        onClose={() => setIsLanModalOpen(false)}
      />

      {/* Simulator Quick Actions bottom helper for high visibility */}
      <footer className="bg-slate-900 text-slate-400 text-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Sistem: <strong>{activeCompany ? activeCompany.name : 'Semua Perusahaan'}</strong></span>
          {activeCompany?.fullName && <span className="text-slate-500 hidden sm:inline">({activeCompany.fullName})</span>}
        </div>
        <div className="flex items-center gap-3">
          <span>Ganti Role Instan:</span>
          <div className="flex gap-1.5">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSwitchUser(u)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                  currentUser?.id === u.id
                    ? 'bg-violet-600 text-white font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {u.role.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
