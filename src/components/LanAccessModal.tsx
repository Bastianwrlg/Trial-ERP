import React, { useState } from "react";
import { Wifi, Laptop, Smartphone, Copy, Check, Server, ShieldCheck, Globe, HelpCircle, X, Terminal } from "lucide-react";

interface LanAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanAccessModal({ isOpen, onClose }: LanAccessModalProps) {
  const [ipInput, setIpInput] = useState("192.168.1.100");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const lanUrl = `http://${ipInput.trim() || '192.168.x.x'}:3000`;

  const handleCopy = () => {
    navigator.clipboard.writeText(lanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 my-8 border border-slate-200 relative animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                Akses ERP Lewat Jaringan Lokal (LAN / Wi-Fi)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan beberapa perangkat (HP, Tablet, Laptop) sekaligus dalam satu jaringan toko / pabrik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Status Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-800">Status Server Express ERP: </span>
              <span className="text-emerald-700">Aktif & Siap Menerima Koneksi Multi-Device (0.0.0.0:3000)</span>
            </div>
          </div>
          <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            ONLINE LAN
          </span>
        </div>

        {/* IP URL Generator */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 mb-6 shadow-inner">
          <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-400" />
            Masukkan Alamat IP Lokal Komputer Server Anda:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">http://</span>
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full pl-16 pr-14 py-2 bg-slate-800 text-emerald-300 border border-slate-700 rounded-xl font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">:3000</span>
            </div>
            <button
              onClick={handleCopy}
              className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Berhasil Disalin!" : "Salin URL LAN"}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Salin link ini dan buka di browser (Chrome / Safari / Edge) di HP, Tablet, atau Laptop karyawan lain.
          </p>
        </div>

        {/* Steps to find IP */}
        <div className="space-y-4 text-xs text-slate-700">
          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            Cara Mengetahui Alamat IP Komputer Server Anda:
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-blue-600" /> Windows:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                <li>Tekan <kbd className="bg-slate-200 px-1 rounded">Win + R</kbd>, ketik <code className="font-bold text-slate-800">cmd</code>, tekan Enter.</li>
                <li>Ketik <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-800">ipconfig</code> lalu tekan Enter.</li>
                <li>Cari baris <strong className="text-indigo-700">IPv4 Address</strong> (misal: <code className="font-mono">192.168.1.15</code>).</li>
              </ol>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-slate-700" /> macOS / Linux:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                <li>Buka aplikasi <strong className="text-slate-800">Terminal</strong>.</li>
                <li>Ketik <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-800">ip a</code> atau <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-800">ifconfig</code>.</li>
                <li>Lihat IP jaringan Wi-Fi/LAN Anda (misal: <code className="font-mono">192.168.1.15</code>).</li>
              </ol>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong>Ketentuan Akses Jaringan Lokal:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-indigo-800">
                <li>Semua HP, Tablet, dan Laptop harus terhubung ke Wi-Fi / Router toko/pabrik yang sama.</li>
                <li>Pastikan Windows Firewall / Antivirus di komputer server mengizinkan Port <code className="font-mono font-bold">3000</code>.</li>
                <li>Setiap perubahan data (penawaran, SPK, stok, invoice) langsung tersinkronisasi antar perangkat.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6 border-t pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
