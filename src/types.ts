/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 
  | 'admin'
  | 'sales'
  | 'engineering'
  | 'finance'
  | 'production'
  | 'qa'
  | 'logistics';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  allowedMenus: string[]; // Menus they can access
}

export type QuotationStatus = 'Draft' | 'Approved' | 'Archived';

export interface QuotationItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

export interface Quotation {
  id: string;
  number: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  date: string;
  items: QuotationItem[];
  total: number;
  status: QuotationStatus;
  notes?: string;
}

// HPP / RAB (Costing / Budgeting) under SPK
export interface HppRab {
  id: string;
  spkId: string;
  materialsBudget: { name: string; qty: number; cost: number; total: number }[];
  laborBudget: { task: string; hours: number; rate: number; total: number }[];
  overheadBudget: { name: string; cost: number }[];
  totalBudget: number;
  status: 'Draft' | 'Approved';
  updatedBy: string;
  updatedAt: string;
}

// Engineering / Design details under SPK
export interface EngineeringDetail {
  id: string;
  spkId: string;
  designName: string;
  drawingsUrl?: string; // simulation placeholder
  machines: { machineName: string; hoursNeeded: number }[];
  processSteps: { step: number; description: string; estDuration: string }[];
  status: 'Draft' | 'Approved';
  updatedBy: string;
  updatedAt: string;
}

// SPK (Surat Perintah Kerja - Work Order)
export interface Spk {
  id: string;
  quotationId: string;
  quotationNumber: string;
  number: string;
  customerName: string;
  date: string;
  deadline: string;
  hppRab?: HppRab;
  engineering?: EngineeringDetail;
  status: 'Pending' | 'In Production' | 'QA Inspection' | 'Ready for Delivery' | 'Delivered' | 'Invoiced' | 'Completed';
  notes?: string;
}

// Produksi (Production parameters)
export interface ProductionLog {
  id: string;
  spkId: string;
  spkNumber: string;
  startDate: string;
  endDate?: string;
  materialsUsed: { name: string; qty: number; lotNumber?: string }[];
  temperature: number; // Suhu
  humidity?: number;
  batchNumber: string;
  operatorName: string;
  mutuCheck: string; // Deskripsi Mutu
  status: 'Draft' | 'In Progress' | 'Completed';
  notes?: string;
}

// Quality Assurance (QA)
export interface QaChecklist {
  id: string;
  spkId: string;
  spkNumber: string;
  inspectorName: string;
  checkDate: string;
  dimensionCheck: 'Pass' | 'Fail' | 'N/A';
  visualCheck: 'Pass' | 'Fail' | 'N/A';
  functionalCheck: 'Pass' | 'Fail' | 'N/A';
  temperaturePass: boolean; // did temperature check pass
  mutuRating: 1 | 2 | 3 | 4 | 5; // Mutu rating (1-5 star quality scale)
  remarks: string;
  status: 'Passed' | 'Failed';
}

// Surat Jalan (SJ - Delivery Note)
export interface SuratJalan {
  id: string;
  spkId: string;
  spkNumber: string;
  number: string;
  date: string;
  customerName: string;
  deliveryAddress: string;
  driverName: string;
  vehicleNumber: string;
  items: { name: string; qty: number; unit: string }[];
  status: 'Draft' | 'Shipped' | 'Delivered';
  deliveredAt?: string;
}

// Invoice
export interface Invoice {
  id: string;
  spkId: string;
  spkNumber: string;
  number: string;
  date: string;
  customerName: string;
  amount: number;
  tax: number;
  totalAmount: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid';
}

// Inventory Item (Bahan Baku / Stok)
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string; // e.g. 'Bahan Baku', 'Suku Cadang', 'Kemasan'
  qty: number;
  unit: string;
  minQty: number;
  unitPrice: number;
  supplier: string;
  notes?: string;
  lastRestocked?: string;
}

