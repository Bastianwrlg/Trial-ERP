import React, { useState } from "react";
import { User, Company } from "../types";
import { Lock, User as UserIcon, Eye, EyeOff, LogIn, Building2, CheckCircle2, ShieldAlert, KeyRound } from "lucide-react";

interface LoginFormProps {
  company: Company;
  users: User[];
  onLoginSuccess: (user: User) => void;
  onChangeCompany: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  company,
  users,
  onLoginSuccess,
  onChangeCompany,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedUserDemo, setSelectedUserDemo] = useState<User | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMsg("Username wajib diisi!");
      return;
    }

    // Find matching user by username or name
    const foundUser = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        u.name.toLowerCase() === cleanUsername
    );

    if (!foundUser) {
      setErrorMsg(`Username "${username}" tidak ditemukan dalam sistem.`);
      return;
    }

    // Check password if set on user, otherwise accept default '123' or any non-empty password
    const userPass = foundUser.password || "123";
    if (password && password !== userPass && userPass !== "123") {
      setErrorMsg("Password salah! Silakan periksa kembali password Anda.");
      return;
    }

    // Success
    onLoginSuccess(foundUser);
  };

  const handleQuickDemoLogin = (user: User) => {
    setUsername(user.username);
    setPassword(user.password || "123");
    setSelectedUserDemo(user);
    setErrorMsg(null);
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-100/80 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header Header Banner with Company branding */}
        <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Logo display if available */}
          <div className="flex justify-center mb-3">
            {company.logoUrl ? (
              <div className="p-2.5 bg-white rounded-2xl border border-white/40 shadow-sm flex items-center justify-center">
                <img src={company.logoUrl} alt={company.name} className="h-11 max-w-[160px] object-contain rounded" />
              </div>
            ) : company.logoSvg ? (
              <div 
                className="p-2.5 bg-white rounded-2xl border border-white/40 shadow-sm max-h-14 flex items-center justify-center [&_svg]:h-9 [&_svg]:w-auto"
                dangerouslySetInnerHTML={{ __html: company.logoSvg }}
              />
            ) : (
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold tracking-wide border border-white/20 text-white shadow-xs">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs ${company.badgeColor || 'bg-indigo-600 text-white'}`}>
                  {company.logoText || company.name.slice(0, 2).toUpperCase()}
                </div>
                <span>{company.name} ({company.code})</span>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            ERP Login
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            {company.fullName || company.tagline || "Masuk ke Sistem Manajemen SPK & Manufaktur"}
          </p>

          <button
            onClick={onChangeCompany}
            className="mt-3 text-[11px] font-semibold text-violet-300 hover:text-white underline transition"
          >
            ← Ganti Entitas / Perusahaan
          </button>
        </div>

        {/* Login Form Body */}
        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2.5 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username / Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username (cth: admin, budi, eko)"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition font-medium text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-violet-700 hover:bg-violet-800 active:bg-violet-900 text-white font-extrabold text-sm rounded-xl transition duration-150 shadow-md shadow-violet-700/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Sistem ERP</span>
            </button>
          </form>

          {/* Quick Demo Simulator User Selector */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Pilih Akun Simulator (Demo):
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Password: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">123</code>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {users.map((u) => {
                const isSelected = username === u.username;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(u)}
                    className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-violet-50 border-violet-300 text-violet-900 font-bold shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold truncate">{u.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="font-mono text-slate-500">@{u.username}</span>
                      <span className="px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200 uppercase font-extrabold text-[9px]">
                        {u.role}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
