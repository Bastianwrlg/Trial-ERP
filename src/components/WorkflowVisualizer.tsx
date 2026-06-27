/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, Circle, ArrowRight, HelpCircle } from "lucide-react";

interface WorkflowVisualizerProps {
  currentStage: 'Penawaran' | 'SPK' | 'Produksi' | 'QA' | 'Surat Jalan' | 'Invoice' | 'Completed' | 'None';
}

export default function WorkflowVisualizer({ currentStage }: WorkflowVisualizerProps) {
  const stages = [
    { name: 'Penawaran', label: '1. Penawaran', desc: 'Customer Quotation' },
    { name: 'SPK', label: '2. SPK & Budget', desc: 'SPK, RAB & Engineering' },
    { name: 'Produksi', label: '3. Produksi', desc: 'Fabrication & Suhu' },
    { name: 'QA', label: '4. QA & Mutu', desc: 'Inspeksi & Nilai Mutu' },
    { name: 'Surat Jalan', label: '5. Surat Jalan', desc: 'Delivery Order' },
    { name: 'Invoice', label: '6. Invoice', desc: 'Billing & PPn 11%' },
  ];

  const getStageIndex = (stage: string) => {
    if (stage === 'Completed') return 99;
    if (stage === 'None') return -1;
    return stages.findIndex(s => s.name === stage);
  };

  const activeIndex = getStageIndex(currentStage);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse"></span>
          Alur Sistem Real-Time (Sesuai Diagram Sketsa)
        </h3>
        <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
          Status Aktif: {currentStage === 'Completed' ? 'Selesai ✓' : currentStage}
        </span>
      </div>

      {/* Process Flow Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
        {stages.map((stage, idx) => {
          const isPassed = activeIndex > idx || currentStage === 'Completed';
          const isActive = currentStage === stage.name;
          const isPending = activeIndex < idx && currentStage !== 'Completed';

          return (
            <div 
              key={stage.name}
              className={`flex flex-col p-3 rounded-lg border transition-all duration-300 relative ${
                isActive 
                  ? 'border-violet-500 bg-violet-50/50 shadow-md scale-102 ring-1 ring-violet-400' 
                  : isPassed 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold tracking-wide uppercase ${
                  isActive ? 'text-violet-700' : isPassed ? 'text-emerald-700' : 'text-slate-500'
                }`}>
                  {stage.label}
                </span>
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isActive ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
                  </span>
                ) : (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
              </div>

              <div className="text-sm font-semibold text-slate-800">
                {stage.name === 'SPK' && 'RAB & Desain'}
                {stage.name === 'Penawaran' && 'Quotation'}
                {stage.name === 'Produksi' && 'Uji Suhu & Bahan'}
                {stage.name === 'QA' && 'Lolos Mutu'}
                {stage.name === 'Surat Jalan' && 'Logistik'}
                {stage.name === 'Invoice' && 'Penagihan'}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5">{stage.desc}</span>

              {/* Arrow Connector for desktop */}
              {idx < 5 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend & Sketsa Connection */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 inline-block"></span> Passed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-violet-50 border border-violet-400 inline-block"></span> Active Stage
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200 inline-block"></span> Waiting
          </span>
        </div>
        <div className="flex items-center gap-1 text-violet-600 font-medium">
          <HelpCircle className="w-3.5 h-3.5" />
          Setiap persetujuan di atas otomatis mendorong dokumen ke alur berikutnya.
        </div>
      </div>
    </div>
  );
}
