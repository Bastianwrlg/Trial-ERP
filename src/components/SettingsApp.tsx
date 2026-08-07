/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, UserRole } from "../types";
import { ShieldCheck, UserPlus, ShieldAlert, Key, Grid, Edit3, Trash2, CheckCircle, UserCheck } from "lucide-react";

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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
    setStatusMessage(null);
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
          name: name.trim(),
          username: username.trim().toLowerCase().replace(/\s/g, ''),
          role,
          allowedMenus
        })
      });

      if (res.ok) {
        setIsAdding(false);
        const savedName = name;
        setEditingUserId(null);
        setName("");
        setUsername("");
        setRole("sales");
        setAllowedMenus(["sales"]);
        setStatusMessage(`User "${savedName}" berhasil diperbarui!`);
        setTimeout(() => setStatusMessage(null), 4000);
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
          setIsAdding(false);
          setEditingUserId(null);
        }
        setStatusMessage(`User "${user.name}" berhasil dihapus.`);
        setTimeout(() => setStatusMessage(null), 4000);
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
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Modul Edit Nama Pengguna & Otorisasi Hak Akses</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola dan edit nama personil, username, jabatan divisi, serta otorisasi menu ERP</p>
        </div>
        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Simulation User Quick Test Card */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-5 rounded-xl shadow-md lg:col-span-3 flex flex-wrap items-center justify-between gap-4">
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

          {/* User List Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-violet-600" /> Daftar Pengguna & Edit Nama User
              </h4>
              {!isAdding && (
                <button
                  onClick={() => {
                    setEditingUserId(null);
                    setName("");
                    setUsername("");
                    setRole("sales");
                    setAllowedMenus(["sales"]);
                    setIsAdding(true);
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
                              onClick={() => handleStartEdit(u)}
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
            {isAdding ? (
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="budi"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role / Jabatan Utama</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Checklist allowed menus */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Otorisasi Akses Menu ERP</label>
                  <div className="space-y-1.5 border p-3 rounded-lg bg-slate-50/60 max-h-48 overflow-y-auto">
                    {menuOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-violet-700">
                        <input
                          type="checkbox"
                          checked={allowedMenus.includes(opt.value)}
                          onChange={() => handleMenuToggle(opt.value)}
                          className="rounded text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-slate-700 font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-between pt-3 border-t">
                  {editingUserId ? (
                    <button
                      type="button"
                      onClick={() => {
                        const targetUser = users.find(u => u.id === editingUserId);
                        if (targetUser) handleDeleteUser(targetUser);
                      }}
                      className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  ) : <div />}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setEditingUserId(null);
                      }}
                      className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-violet-700 text-white rounded-lg font-bold hover:bg-violet-800 shadow-xs transition"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-slate-400 text-center text-xs">
                <Grid className="w-10 h-10 text-slate-300 mb-2" />
                <span className="font-bold text-slate-600 text-sm">Form Edit Nama & Pengguna</span>
                <p className="mt-1 max-w-xs text-slate-500">
                  Klik tombol <strong className="text-violet-700 font-bold">"Edit Nama"</strong> pada tabel user untuk mengubah nama personil atau memperbarui izin akses menu.
                </p>
                <button
                  onClick={() => {
                    setEditingUserId(null);
                    setName("");
                    setUsername("");
                    setRole("sales");
                    setAllowedMenus(["sales"]);
                    setIsAdding(true);
                  }}
                  className="mt-4 px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded-lg font-bold transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah User Baru</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

