import React from 'react';
import { Company, CompanyId } from '../types';
import { COMPANIES } from '../data/companies';
import { Building2, ArrowRight, ShieldCheck, CheckCircle2, Factory, Zap, Wrench, RefreshCw, X } from 'lucide-react';

interface CompanySelectorProps {
  currentCompanyId: CompanyId | null;
  onSelectCompany: (companyId: CompanyId) => void;
  onCloseModal?: () => void;
  isModal?: boolean;
  quotationCountByCompany?: Record<string, number>;
  spkCountByCompany?: Record<string, number>;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  currentCompanyId,
  onSelectCompany,
  onCloseModal,
  isModal = false,
  quotationCountByCompany = {},
  spkCountByCompany = {}
}) => {
  const getCompanyIcon = (id: CompanyId) => {
    switch (id) {
      case 'fujiyama':
        return <Factory className="w-7 h-7 text-indigo-600" />;
      case 'argathara':
        return <Zap className="w-7 h-7 text-emerald-600" />;
      case 'artajaya':
        return <Wrench className="w-7 h-7 text-amber-600" />;
      default:
        return <Building2 className="w-7 h-7 text-slate-600" />;
    }
  };

  const getCompanyBadgeClass = (id: CompanyId) => {
    switch (id) {
      case 'fujiyama':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'argathara':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'artajaya':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getButtonClass = (id: CompanyId, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-slate-900 hover:bg-slate-800 text-white shadow-md';
    }
    switch (id) {
      case 'fujiyama':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100';
      case 'argathara':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100';
      case 'artajaya':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-100';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto ${isModal ? 'p-2' : 'p-6 sm:p-10'}`}>
      {/* Header section */}
      <div className="relative mb-8 text-center">
        {isModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="absolute right-0 top-0 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Tutup"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium mb-3">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Sistem Portal Multi-Company ERP</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Pilih Perusahaan / Unit Bisnis
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
          Silakan pilih entitas perusahaan untuk mengakses modul operasional, SPK, Penawaran, Produksi, dan Laporan Keuangan secara terisolasi.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {COMPANIES.map((company) => {
          const isSelected = currentCompanyId === company.id;
          const qCount = quotationCountByCompany[company.id] ?? 0;
          const spkCount = spkCountByCompany[company.id] ?? 0;

          return (
            <div
              key={company.id}
              onClick={() => onSelectCompany(company.id)}
              className={`relative group bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-xl scale-[1.02]'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {/* Top status tag */}
              {isSelected && (
                <div className="bg-indigo-600 text-white text-[11px] font-semibold px-3 py-1 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sedang Aktif Digunakan</span>
                </div>
              )}

              <div className="p-6">
                {/* Logo & Code */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                    {getCompanyIcon(company.id)}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getCompanyBadgeClass(company.id)}`}>
                    {company.code}
                  </span>
                </div>

                {/* Company Title */}
                <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {company.name}
                </h2>
                <p className="text-xs font-medium text-slate-500 mb-4 line-clamp-2">
                  {company.tagline}
                </p>

                {/* Quick Indicators */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex-1 bg-slate-50 p-2 rounded-lg text-center">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Penawaran</span>
                    <span className="font-bold text-slate-800 text-sm">{qCount}</span>
                  </div>
                  <div className="flex-1 bg-slate-50 p-2 rounded-lg text-center">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">SPK Aktif</span>
                    <span className="font-bold text-slate-800 text-sm">{spkCount}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCompany(company.id);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${getButtonClass(
                    company.id,
                    isSelected
                  )}`}
                >
                  <span>{isSelected ? 'Masuk ke Dashboard' : 'Buka Perusahaan ini'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Setiap perusahaan memiliki database nomor SPK, Stok Inventaris, Surat Jalan, dan Invoice yang terpisah dan aman.
          </span>
        </div>
        {currentCompanyId && !isModal && (
          <button
            onClick={() => onSelectCompany(currentCompanyId)}
            className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Lanjutkan ke {COMPANIES.find(c => c.id === currentCompanyId)?.name}</span>
          </button>
        )}
      </div>
    </div>
  );
};
