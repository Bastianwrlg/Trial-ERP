/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, UserRole } from "../types";
import { ShieldCheck, Plus, Check, ShieldAlert, Key, Grid, UserPlus } from "lucide-react";

interface SettingsAppProps {
  users: User[];
  onRefresh: () => void;
  currentUserRole: string;
  onSwitchSessionUser: (user: User) => void;
}

export default function SettingsApp({ users, onRefresh, currentUserRole, onSwitchSessionUser }: SettingsAppProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("sales");
  const [allowedMenus, setAllowedMenus] = useState<string[]>(["sales"]);

  const handleMenuToggle = (menu: string) => {
    if (allowedMenus.includes(menu)) {
      setAllowedMenus(allowedMenus.filter(m => m !== menu));
    } else {
      setAllowedMenus([...allowedMenus, menu]);
    }
  };

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username);
    setRole(user.role);
    setAllowedMenus(user.allowedMenus || []);
    setIsAdding(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    try {
      const url = editingUserId ? `/api/users/${editingUserId}` : "/api/users";
      const method = editingUserId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          role,
          allowedMenus
        })
      });
      if (res.ok) {
        setIsAdding(false);
        setEditingUserId(null);
        setName("");
        setUsername("");
        setRole("sales");
        setAllowedMenus(["sales"]);
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
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-800">Modul Manajemen Pengguna & Hak Akses</h2>
        <p className="text-xs text-slate-500 mt-1">Otorisasi menu mana saja yang bisa diakses oleh masing-masing personil / jabatan divisi</p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Simulation User Quick Test Card */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-5 rounded-xl shadow-md lg:col-span-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-1.5">
                <Key className="w-5 h-5 text-violet-200" />
                Panel Simulator Hak Akses Pengguna (Role-Based Testing)
              </h3>
              <p className="text-xs text-violet-100 mt-1 max-w-xl">
                Odoo ERP mengandalkan kontrol akses ketat. Pilih salah satu user simulasi di bawah ini untuk menguji bagaimana menu and tombol aksi di sistem langsung berubah menyesuaikan hak akses jabatannya!
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => onSwitchSessionUser(u)}
                  className="bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  👤 {u.name} ({u.role.toUpperCase()})
                </button>
              ))}
            </div>
          </div>

          {/* User List Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-violet-600" /> Daftar Pengguna ERP Terdaftar
              </h4>
              {isAdmin && !isAdding && (
                <button
                  onClick={() => {
                    setEditingUserId(null);
                    setName("");
                    setUsername("");
                    setRole("sales");
                    setAllowedMenus(["sales"]);
                    setIsAdding(true);
                  }}
                  className="bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Tambah User
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold border-b text-[10px] uppercase">
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Jabatan Divisi (Role)</th>
                    <th className="p-3">Akses Menu Odoo</th>
                    {isAdmin && <th className="p-3 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{u.name}</td>
                      <td className="p-3 font-mono text-slate-600">@{u.username}</td>
                      <td className="p-3">
                        <span className="text-[10px] bg-violet-50 text-violet-700 font-black px-2 py-0.5 rounded-full border border-violet-100">
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.allowedMenus.map((menu) => (
                            <span key={menu} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {menu === 'sales' && 'Sales'}
                              {menu === 'spk' && 'SPK'}
                              {menu === 'production' && 'Produksi'}
                              {menu === 'qa' && 'QA'}
                              {menu === 'logistics' && 'Surat Jalan'}
                              {menu === 'finance' && 'Invoice'}
                              {menu === 'inventory' && 'Inventaris'}
                              {menu === 'users' && 'Admin Settings'}
                            </span>
                          ))}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleStartEdit(u)}
                            className="text-violet-700 hover:text-violet-900 font-bold hover:underline"
                          >
                            Edit Akses
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add/Edit User Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            {!isAdmin ? (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-2 text-xs">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Akses Admin Diperlukan!</span> Anda hanya dapat merubah hak akses menu and membuat user baru jika login sebagai <strong>Administrator</strong>. Silakan klik tombol "Administrator" di panel Simulator atas terlebih dahulu untuk berganti mode pengujian.
                </div>
              </div>
            ) : isAdding ? (
              <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-violet-600" /> 
                  {editingUserId ? "Edit Hak Akses & Jabatan" : "Tambah User Baru"}
                </h4>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Michael Cole"
                    className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="michael"
                    className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Role / Jabatan Utama</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-1.5 border rounded bg-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Checklist allowed menus */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">Otorisasi Akses Menu (Bisa Pilih Apa Saja)</label>
                  <div className="space-y-1.5 border p-2.5 rounded bg-slate-50/50">
                    {menuOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer py-0.5">
                        <input
                          type="checkbox"
                          checked={allowedMenus.includes(opt.value)}
                          onChange={() => handleMenuToggle(opt.value)}
                          className="rounded text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-slate-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingUserId(null);
                    }}
                    className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-violet-700 text-white rounded font-bold hover:bg-violet-800 shadow-xs"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-slate-400 text-center text-xs">
                <Grid className="w-10 h-10 text-slate-300 mb-2" />
                <span className="font-bold text-slate-600">Manajemen Akses Menu</span>
                <p className="mt-1">Pilih "Tambah User" atau klik "Edit Akses" pada tabel di sebelah kiri untuk mengonfigurasi menu apa saja yang bisa diizinkan untuk tiap user secara modular!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
