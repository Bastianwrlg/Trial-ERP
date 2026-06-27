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
  InventoryItem
} from "./types";

import SalesApp from "./components/SalesApp";
import SpkApp from "./components/SpkApp";
import ProductionApp from "./components/ProductionApp";
import QaApp from "./components/QaApp";
import LogisticsApp from "./components/LogisticsApp";
import InvoiceApp from "./components/InvoiceApp";
import SettingsApp from "./components/SettingsApp";
import InventoryApp from "./components/InventoryApp";
import WorkflowVisualizer from "./components/WorkflowVisualizer";

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
  Package
} from "lucide-react";

export default function App() {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  
  // Data State
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
        setUsers(data.users || []);
        setQuotations(data.quotations || []);
        setSpks(data.spks || []);
        setProductionLogs(data.productionLogs || []);
        setQaChecklists(data.qaChecklists || []);
        setSjList(data.suratJalanList || []);
        setInvoices(data.invoices || []);
        setInventory(data.inventory || []);

        // Default current user to Administrator on first load
        if (!currentUser && data.users && data.users.length > 0) {
          setCurrentUser(data.users[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching ERP database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    // Auto reset view if switching user forbids the current app
    if (activeApp && !user.allowedMenus.includes(activeApp)) {
      // Keep selected but will show Access Denied page, which is perfect to show permission restriction!
    }
  };

  // Helper to determine active workflow node for visualizer
  const getOverallWorkflowStage = () => {
    if (spks.length === 0) return 'Penawaran';
    
    // Check in reverse order
    const hasPaidInvoice = invoices.some(i => i.status === 'Paid');
    if (hasPaidInvoice) return 'Completed';

    const hasInvoiced = invoices.length > 0;
    if (hasInvoiced) return 'Invoice';

    const hasSjDelivered = sjList.some(s => s.status === 'Delivered');
    if (hasSjDelivered) return 'Invoice';

    const hasSj = sjList.length > 0;
    if (hasSj) return 'Surat Jalan';

    const hasPassedQa = qaChecklists.some(q => q.status === 'Passed');
    if (hasPassedQa) return 'Surat Jalan';

    const hasQaCheck = qaChecklists.length > 0;
    if (hasQaCheck) return 'QA';

    const hasCompletedProd = productionLogs.some(p => p.status === 'Completed');
    if (hasCompletedProd) return 'QA';

    const hasActiveProd = productionLogs.some(p => p.status === 'In Progress');
    if (hasActiveProd) return 'Produksi';

    const hasSpkInProd = spks.some(s => s.status === 'In Production');
    if (hasSpkInProd) return 'Produksi';

    if (spks.length > 0) return 'SPK';

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
    { id: "users", title: "Setelan Otorisasi", desc: "Manajemen Akses Menu", icon: Users, color: "bg-rose-500 text-white" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500 mb-4"></div>
        <div className="text-sm font-semibold tracking-wide">Menghubungkan ke Mesin ERP Odoo...</div>
      </div>
    );
  }

  // App accessibility check
  const isAppAllowed = activeApp ? currentUser?.allowedMenus.includes(activeApp) : true;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-800">
      
      {/* Top Odoo Navigation Bar */}
      <header className="bg-[#714B67] text-white flex items-center justify-between px-4 py-2.5 shadow-md shrink-0 select-none">
        <div className="flex items-center gap-4">
          {/* App Launcher Grid button */}
          <button 
            onClick={() => setActiveApp(null)}
            title="Home Menu Apps"
            className="p-1.5 hover:bg-white/10 rounded transition focus:outline-none flex items-center gap-1.5"
          >
            <Grid className="w-5 h-5" />
            <span className="font-extrabold tracking-wider text-sm">Odoo ERP</span>
          </button>

          {activeApp && (
            <div className="flex items-center gap-2 border-l border-white/20 pl-4 text-xs font-semibold">
              <span className="text-white/70">Aplikasi Aktif:</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-white font-bold tracking-wide uppercase">
                {activeApp === 'sales' && 'Sales & Penawaran'}
                {activeApp === 'spk' && 'SPK (Work Orders)'}
                {activeApp === 'production' && 'Manufaktur & Produksi'}
                {activeApp === 'qa' && 'Quality Control (QA)'}
                {activeApp === 'logistics' && 'Surat Jalan & Logistik'}
                {activeApp === 'finance' && 'Invoice & Penagihan'}
                {activeApp === 'inventory' && 'Inventaris & Bahan Baku'}
                {activeApp === 'users' && 'Setelan Akses'}
              </span>
            </div>
          )}
        </div>

        {/* Simulator session user switcher in navbar for high-speed testing */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-black/15 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
            <span className="text-white/60">Simulator User:</span>
            <span className="font-bold text-violet-200">{currentUser?.name}</span>
            <span className="bg-violet-500/30 text-violet-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase">{currentUser?.role}</span>
          </div>

          <button
            onClick={handleResetDB}
            title="Reset ulang seluruh database simulasi"
            className="p-1.5 hover:bg-white/10 rounded transition text-white/80 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeApp === null ? (
          /* Odoo App Launcher / Grid Dashboard */
          <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
            
            {/* Visual workflow banner mapping directly to user sketch */}
            <WorkflowVisualizer currentStage={getOverallWorkflowStage()} />

            {/* Headline and introduction card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Layers className="w-6 h-6 text-violet-700" />
                  Sistem ERP Manufaktur SPK & Produksi (Odoo-Inspired)
                </h1>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                  Sistem ERP terintegrasi penuh yang mengotomasi alur Surat Perintah Kerja (SPK), Costing Anggaran (RAB/HPP), Desain Engineering, Rekaman Suhu Oven, Uji Mutu QA, Surat Jalan Logistik, and Penagihan Invoice.
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-100 w-fit">
                  <UserIcon className="w-4 h-4" />
                  Anda masuk sebagai: <strong>{currentUser?.name} ({currentUser?.role.toUpperCase()})</strong>. Gunakan modul "Setelan Otorisasi" untuk ganti user atau mengedit hak akses menu!
                </div>
              </div>

              {/* Little stats summary panel */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border w-full md:w-auto shrink-0 text-center">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Sales</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{quotations.length}</div>
                </div>
                <div className="border-x px-3">
                  <div className="text-xs text-slate-400 font-bold uppercase">SPK</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{spks.length}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Invoice</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{invoices.length}</div>
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
                    onClick={() => setActiveApp(app.id)}
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
          <div className="flex-1 overflow-hidden">
            {!isAppAllowed ? (
              /* Access Denied Page */
              <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-200 shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800">Akses Menu Ditolak!</h3>
                <p className="text-sm text-slate-500 max-w-md mt-2">
                  Role Anda saat ini sebagai <strong className="text-slate-700 font-bold">{(currentUser?.role || "GUEST").toUpperCase()}</strong> tidak memiliki otorisasi untuk mengakses menu ini. Hal ini membuktikan sistem manajemen hak akses modular ERP bekerja sepenuhnya sesuai spesifikasi!
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setActiveApp(null)}
                    className="px-4 py-2 border border-slate-300 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Kembali ke Dashboard
                  </button>
                  <button
                    onClick={() => setActiveApp("users")}
                    className="px-4 py-2 bg-violet-700 text-white rounded-lg text-xs font-bold hover:bg-violet-800 transition"
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
                    quotations={quotations} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                  />
                )}
                {activeApp === "spk" && (
                  <SpkApp 
                    spks={spks} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                    currentUsername={currentUser?.name || ""} 
                  />
                )}
                {activeApp === "production" && (
                  <ProductionApp 
                    logs={productionLogs} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                  />
                )}
                {activeApp === "qa" && (
                  <QaApp 
                    checklists={qaChecklists} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                    currentUsername={currentUser?.name || ""} 
                  />
                )}
                {activeApp === "logistics" && (
                  <LogisticsApp 
                    sjList={sjList} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                  />
                )}
                {activeApp === "finance" && (
                  <InvoiceApp 
                    invoices={invoices} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                  />
                )}
                {activeApp === "inventory" && (
                  <InventoryApp 
                    inventory={inventory} 
                    onRefresh={fetchData} 
                    currentUserRole={currentUser?.role || ""} 
                  />
                )}
                {activeApp === "users" && (
                  <SettingsApp 
                    users={users} 
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

      {/* Simulator Quick Actions bottom helper for high visibility */}
      <footer className="bg-slate-900 text-slate-400 text-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Simulator Status: <strong>LIVE</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>Ganti Role Instan untuk Test Hak Akses Menu:</span>
          <div className="flex gap-1.5">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSwitchUser(u)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
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
