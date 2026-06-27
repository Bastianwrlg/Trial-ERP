/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  User, 
  Quotation, 
  Spk, 
  ProductionLog, 
  QaChecklist, 
  SuratJalan, 
  Invoice 
} from "./src/types";

// Path to file database
const DB_FILE = path.join(process.cwd(), "server_db.json");

// Helper to read database
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    // Write default seed data
    const seedData = getSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2));
    return seedData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    let updated = false;
    if (!parsed.inventory) {
      parsed.inventory = getSeedData().inventory;
      updated = true;
    }
    if (updated) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
    }
    return parsed;
  } catch (err) {
    console.error("Failed to parse DB, using seed data:", err);
    return getSeedData();
  }
}

// Helper to write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write to database:", err);
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API endpoints
app.get("/api/db/reset", (req, res) => {
  const seed = getSeedData();
  writeDB(seed);
  res.json({ message: "Database reset to initial state", data: seed });
});

// GET all data
app.get("/api/db", (req, res) => {
  res.json(readDB());
});

// USERS API
app.get("/api/users", (req, res) => {
  const db = readDB();
  res.json(db.users);
});

app.post("/api/users", (req, res) => {
  const db = readDB();
  const newUser = { id: Date.now().toString(), ...req.body };
  db.users.push(newUser);
  writeDB(db);
  res.status(210).json(newUser);
});

// QUOTATIONS (PENAWARAN) API
app.get("/api/quotations", (req, res) => {
  const db = readDB();
  res.json(db.quotations);
});

app.post("/api/quotations", (req, res) => {
  const db = readDB();
  const { customerName, customerEmail, customerPhone, items, notes, date } = req.body;
  
  const total = items.reduce((acc: number, item: any) => acc + (item.qty * item.price), 0);
  const prefix = "QTN/" + new Date().getFullYear() + "/";
  const num = (db.quotations.length + 1).toString().padStart(4, '0');
  
  const newQuotation: Quotation = {
    id: Date.now().toString(),
    number: prefix + num,
    customerName,
    customerEmail,
    customerPhone,
    date: date || new Date().toISOString().split('T')[0],
    items: items.map((it: any) => ({ ...it, id: Math.random().toString() })),
    total,
    status: 'Draft',
    notes
  };

  db.quotations.push(newQuotation);
  writeDB(db);
  res.status(201).json(newQuotation);
});

// Update Quotation Status (Approving triggers SPK generation!)
app.patch("/api/quotations/:id/status", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status } = req.body; // 'Approved' | 'Archived' | 'Draft'

  const qIndex = db.quotations.findIndex((q: any) => q.id === id);
  if (qIndex === -1) {
    return res.status(404).json({ error: "Quotation not found" });
  }

  const prevStatus = db.quotations[qIndex].status;
  db.quotations[qIndex].status = status;

  // If status is changed from anything to Approved, create an SPK (Surat Perintah Kerja)
  let generatedSpk: Spk | null = null;
  if (status === 'Approved' && prevStatus !== 'Approved') {
    const quotation = db.quotations[qIndex];
    const spkPrefix = "SPK/" + new Date().getFullYear() + "/";
    const spkNum = (db.spks.length + 1).toString().padStart(4, '0');
    
    // Create new SPK
    generatedSpk = {
      id: "spk_" + Date.now().toString(),
      quotationId: quotation.id,
      quotationNumber: quotation.number,
      number: spkPrefix + spkNum,
      customerName: quotation.customerName,
      date: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days default
      status: 'Pending',
      notes: "Generated from " + quotation.number
    };
    db.spks.push(generatedSpk);
  }

  writeDB(db);
  res.json({ quotation: db.quotations[qIndex], spk: generatedSpk });
});

// SPKs API
app.get("/api/spks", (req, res) => {
  const db = readDB();
  res.json(db.spks);
});

// Update SPK RAB / HPP
app.post("/api/spks/:id/hpp-rab", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { materialsBudget, laborBudget, overheadBudget, updatedBy } = req.body;

  const spkIndex = db.spks.findIndex((s: any) => s.id === id);
  if (spkIndex === -1) {
    return res.status(404).json({ error: "SPK not found" });
  }

  const materialsTotal = materialsBudget.reduce((sum: number, m: any) => sum + (m.qty * m.cost), 0);
  const laborTotal = laborBudget.reduce((sum: number, l: any) => sum + (l.hours * l.rate), 0);
  const overheadTotal = overheadBudget.reduce((sum: number, o: any) => sum + Number(o.cost), 0);
  const totalBudget = materialsTotal + laborTotal + overheadTotal;

  const hppRab = {
    id: "rab_" + Date.now().toString(),
    spkId: id,
    materialsBudget: materialsBudget.map((m: any) => ({ ...m, total: m.qty * m.cost })),
    laborBudget: laborBudget.map((l: any) => ({ ...l, total: l.hours * l.rate })),
    overheadBudget,
    totalBudget,
    status: 'Approved' as const,
    updatedBy: updatedBy || "Estimator",
    updatedAt: new Date().toISOString().split('T')[0]
  };

  db.spks[spkIndex].hppRab = hppRab;

  // Auto transition SPK to In Production if both RAB and Engineering are Approved
  checkAndAdvanceSpk(db, spkIndex);

  writeDB(db);
  res.json(db.spks[spkIndex]);
});

// Update SPK Engineering
app.post("/api/spks/:id/engineering", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { designName, drawingsUrl, machines, processSteps, updatedBy } = req.body;

  const spkIndex = db.spks.findIndex((s: any) => s.id === id);
  if (spkIndex === -1) {
    return res.status(404).json({ error: "SPK not found" });
  }

  const engineering = {
    id: "eng_" + Date.now().toString(),
    spkId: id,
    designName,
    drawingsUrl,
    machines,
    processSteps,
    status: 'Approved' as const,
    updatedBy: updatedBy || "Engineer",
    updatedAt: new Date().toISOString().split('T')[0]
  };

  db.spks[spkIndex].engineering = engineering;

  // Auto transition SPK to In Production if both RAB and Engineering are Approved
  checkAndAdvanceSpk(db, spkIndex);

  writeDB(db);
  res.json(db.spks[spkIndex]);
});

// Helper to auto transition SPK to "In Production"
function checkAndAdvanceSpk(db: any, spkIndex: number) {
  const spk = db.spks[spkIndex];
  if (spk.status === 'Pending' && spk.hppRab && spk.engineering) {
    spk.status = 'In Production';
    
    // Also auto create a production log in Draft
    const prodPrefix = "PRD/" + new Date().getFullYear() + "/";
    const prodNum = (db.productionLogs.length + 1).toString().padStart(4, '0');
    
    // Determine default materials from RAB
    const initialMaterials = spk.hppRab.materialsBudget.map((m: any) => ({
      name: m.name,
      qty: m.qty,
      lotNumber: "LOT-" + Math.floor(1000 + Math.random() * 9000)
    }));

    const newProdLog: ProductionLog = {
      id: "prod_" + Date.now().toString(),
      spkId: spk.id,
      spkNumber: spk.number,
      startDate: new Date().toISOString().split('T')[0],
      materialsUsed: initialMaterials,
      temperature: 24, // Suhu default
      humidity: 55,
      batchNumber: prodPrefix + prodNum,
      operatorName: "Production Team",
      mutuCheck: "Bahan & proses awal sesuai standar.",
      status: 'Draft',
      notes: "Diproduksi berdasarkan " + spk.number
    };
    db.productionLogs.push(newProdLog);
  }
}

// PRODUCTION API
app.get("/api/production-logs", (req, res) => {
  const db = readDB();
  res.json(db.productionLogs);
});

// Update production state (from Draft -> In Progress -> Completed)
app.patch("/api/production-logs/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status, temperature, humidity, materialsUsed, mutuCheck, notes, operatorName } = req.body;

  const pIndex = db.productionLogs.findIndex((p: any) => p.id === id);
  if (pIndex === -1) {
    return res.status(404).json({ error: "Production log not found" });
  }

  const log = db.productionLogs[pIndex];
  if (status) log.status = status;
  if (temperature !== undefined) log.temperature = temperature;
  if (humidity !== undefined) log.humidity = humidity;
  if (materialsUsed) log.materialsUsed = materialsUsed;
  if (mutuCheck !== undefined) log.mutuCheck = mutuCheck;
  if (notes !== undefined) log.notes = notes;
  if (operatorName) log.operatorName = operatorName;

  if (status === 'Completed') {
    log.endDate = new Date().toISOString().split('T')[0];
    
    // Update parent SPK to QA Inspection
    const spkIndex = db.spks.findIndex((s: any) => s.id === log.spkId);
    if (spkIndex !== -1) {
      db.spks[spkIndex].status = 'QA Inspection';
    }

    // Auto generate QA checklist in Pending state
    const newQa: QaChecklist = {
      id: "qa_" + Date.now().toString(),
      spkId: log.spkId,
      spkNumber: log.spkNumber,
      inspectorName: "Quality Assurer",
      checkDate: new Date().toISOString().split('T')[0],
      dimensionCheck: 'N/A',
      visualCheck: 'N/A',
      functionalCheck: 'N/A',
      temperaturePass: log.temperature >= 20 && log.temperature <= 28, // Contoh validasi suhu
      mutuRating: 4,
      remarks: `Hasil produksi batch ${log.batchNumber} dengan suhu rata-rata ${log.temperature}°C.`,
      status: 'Failed' // default until inspected and passed
    };
    db.qaChecklists.push(newQa);
  }

  writeDB(db);
  res.json(log);
});

// QA API
app.get("/api/qa-checklists", (req, res) => {
  const db = readDB();
  res.json(db.qaChecklists);
});

app.post("/api/qa-checklists/:id/inspect", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { inspectorName, dimensionCheck, visualCheck, functionalCheck, mutuRating, remarks, status } = req.body;

  const qaIndex = db.qaChecklists.findIndex((q: any) => q.id === id);
  if (qaIndex === -1) {
    return res.status(404).json({ error: "QA checklist not found" });
  }

  const qa = db.qaChecklists[qaIndex];
  qa.inspectorName = inspectorName;
  qa.dimensionCheck = dimensionCheck;
  qa.visualCheck = visualCheck;
  qa.functionalCheck = functionalCheck;
  qa.mutuRating = mutuRating;
  qa.remarks = remarks;
  qa.status = status; // 'Passed' | 'Failed'
  qa.checkDate = new Date().toISOString().split('T')[0];

  const spkIndex = db.spks.findIndex((s: any) => s.id === qa.spkId);
  if (spkIndex !== -1) {
    if (status === 'Passed') {
      db.spks[spkIndex].status = 'Ready for Delivery';

      // Auto generate Surat Jalan (SJ) in Draft
      const sjPrefix = "SJ/" + new Date().getFullYear() + "/";
      const sjNum = (db.suratJalanList.length + 1).toString().padStart(4, '0');
      
      const spk = db.spks[spkIndex];
      // default items from quotation or spk hpp
      const items = spk.hppRab ? spk.hppRab.materialsBudget.map((m: any) => ({
        name: m.name,
        qty: m.qty,
        unit: "Pcs"
      })) : [{ name: "Produk Selesai " + spk.number, qty: 1, unit: "Pcs" }];

      const newSj: SuratJalan = {
        id: "sj_" + Date.now().toString(),
        spkId: spk.id,
        spkNumber: spk.number,
        number: sjPrefix + sjNum,
        date: new Date().toISOString().split('T')[0],
        customerName: spk.customerName,
        deliveryAddress: "Alamat Customer " + spk.customerName,
        driverName: "Sopir Logistik",
        vehicleNumber: "B " + Math.floor(1000 + Math.random() * 8999) + " SEC",
        items,
        status: 'Draft'
      };
      db.suratJalanList.push(newSj);
    } else {
      db.spks[spkIndex].status = 'In Production'; // Send back to production on fail!
    }
  }

  writeDB(db);
  res.json(qa);
});

// SURAT JALAN (SJ) / LOGISTICS API
app.get("/api/surat-jalan", (req, res) => {
  const db = readDB();
  res.json(db.suratJalanList);
});

app.patch("/api/surat-jalan/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { driverName, vehicleNumber, deliveryAddress, status } = req.body;

  const sjIndex = db.suratJalanList.findIndex((s: any) => s.id === id);
  if (sjIndex === -1) {
    return res.status(404).json({ error: "Surat Jalan not found" });
  }

  const sj = db.suratJalanList[sjIndex];
  if (driverName) sj.driverName = driverName;
  if (vehicleNumber) sj.vehicleNumber = vehicleNumber;
  if (deliveryAddress) sj.deliveryAddress = deliveryAddress;
  if (status) sj.status = status;

  if (status === 'Delivered') {
    sj.deliveredAt = new Date().toISOString();
    
    // Update parent SPK to Ready for Invoicing / Delivered
    const spkIndex = db.spks.findIndex((s: any) => s.id === sj.spkId);
    if (spkIndex !== -1) {
      db.spks[spkIndex].status = 'Delivered';

      // Auto generate Invoice
      const invPrefix = "INV/" + new Date().getFullYear() + "/";
      const invNum = (db.invoices.length + 1).toString().padStart(4, '0');
      
      const spk = db.spks[spkIndex];
      // Get actual quotation to calculate original total
      const quotation = db.quotations.find((q: any) => q.id === spk.quotationId);
      const subtotal = quotation ? quotation.total : 15000000; // default backup
      const tax = Math.round(subtotal * 0.11); // 11% tax

      const newInv: Invoice = {
        id: "inv_" + Date.now().toString(),
        spkId: spk.id,
        spkNumber: spk.number,
        number: invPrefix + invNum,
        date: new Date().toISOString().split('T')[0],
        customerName: spk.customerName,
        amount: subtotal,
        tax,
        totalAmount: subtotal + tax,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days due
        status: 'Unpaid'
      };
      db.invoices.push(newInv);
    }
  }

  writeDB(db);
  res.json(sj);
});

// INVOICES API
app.get("/api/invoices", (req, res) => {
  const db = readDB();
  res.json(db.invoices);
});

app.patch("/api/invoices/:id/pay", (req, res) => {
  const db = readDB();
  const { id } = req.params;

  const invIndex = db.invoices.findIndex((inv: any) => inv.id === id);
  if (invIndex === -1) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  db.invoices[invIndex].status = 'Paid';

  // Update parent SPK to Completed!
  const spkIndex = db.spks.findIndex((s: any) => s.id === db.invoices[invIndex].spkId);
  if (spkIndex !== -1) {
    db.spks[spkIndex].status = 'Completed';
  }

  writeDB(db);
  res.json(db.invoices[invIndex]);
});

// USERS MANAGEMENT & PERMISSIONS API
app.patch("/api/users/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { allowedMenus, name, username, role } = req.body;

  const userIndex = db.users.findIndex((u: any) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const user = db.users[userIndex];
  if (allowedMenus !== undefined) user.allowedMenus = allowedMenus;
  if (name !== undefined) user.name = name;
  if (username !== undefined) user.username = username;
  if (role !== undefined) user.role = role;

  writeDB(db);
  res.json(user);
});

// INVENTORY (BAHAN BAKU & STOK) API
app.get("/api/inventory", (req, res) => {
  const db = readDB();
  res.json(db.inventory || []);
});

app.post("/api/inventory", (req, res) => {
  const db = readDB();
  const { name, sku, category, qty, unit, minQty, unitPrice, supplier, notes } = req.body;

  const newId = "inv_" + Date.now().toString();
  const newItem = {
    id: newId,
    name,
    sku: sku || "SKU-" + Math.floor(1000 + Math.random() * 9000),
    category: category || "Bahan Baku",
    qty: Number(qty) || 0,
    unit: unit || "Pcs",
    minQty: Number(minQty) || 0,
    unitPrice: Number(unitPrice) || 0,
    supplier: supplier || "-",
    notes: notes || "",
    lastRestocked: new Date().toISOString().split('T')[0]
  };

  if (!db.inventory) db.inventory = [];
  db.inventory.push(newItem);
  writeDB(db);
  res.status(201).json(newItem);
});

app.patch("/api/inventory/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { name, sku, category, qty, unit, minQty, unitPrice, supplier, notes, adjustQty } = req.body;

  const index = db.inventory.findIndex((item: any) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Inventory item not found" });
  }

  const item = db.inventory[index];
  if (name !== undefined) item.name = name;
  if (sku !== undefined) item.sku = sku;
  if (category !== undefined) item.category = category;
  if (qty !== undefined) item.qty = Number(qty);
  if (unit !== undefined) item.unit = unit;
  if (minQty !== undefined) item.minQty = Number(minQty);
  if (unitPrice !== undefined) item.unitPrice = Number(unitPrice);
  if (supplier !== undefined) item.supplier = supplier;
  if (notes !== undefined) item.notes = notes;
  
  if (adjustQty !== undefined) {
    item.qty = Math.max(0, item.qty + Number(adjustQty));
    if (Number(adjustQty) > 0) {
      item.lastRestocked = new Date().toISOString().split('T')[0];
    }
  }

  writeDB(db);
  res.json(item);
});

app.delete("/api/inventory/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;

  const index = db.inventory.findIndex((item: any) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Inventory item not found" });
  }

  db.inventory.splice(index, 1);
  writeDB(db);
  res.json({ message: "Inventory item deleted successfully" });
});


// SEED DATA GENERATOR
function getSeedData() {
  return {
    users: [
      { id: "u1", name: "Administrator", username: "admin", role: "admin", allowedMenus: ["sales", "spk", "production", "qa", "logistics", "finance", "users"] },
      { id: "u2", name: "Budi Santoso", username: "budi", role: "sales", allowedMenus: ["sales", "finance"] },
      { id: "u3", name: "Eko Prasetyo", username: "eko", role: "engineering", allowedMenus: ["spk"] },
      { id: "u4", name: "Siti Rahma", username: "siti", role: "finance", allowedMenus: ["spk", "finance"] },
      { id: "u5", name: "Agus Wijaya", username: "agus", role: "production", allowedMenus: ["spk", "production"] },
      { id: "u6", name: "Rudi Hartono", username: "rudi", role: "qa", allowedMenus: ["production", "qa"] },
      { id: "u7", name: "Joko Widodo", username: "joko", role: "logistics", allowedMenus: ["logistics"] }
    ],
    quotations: [
      {
        id: "q_seed_1",
        number: "QTN/2026/0001",
        customerName: "PT Global Tech Indonesia",
        customerEmail: "info@globaltech.co.id",
        customerPhone: "021-5551234",
        date: "2026-06-25",
        items: [
          { id: "item1", name: "Panel Box Custom 1200x800x400", qty: 2, unit: "Unit", price: 12500000 },
          { id: "item2", name: "Kabel NYY 4x16mm (Meter)", qty: 150, unit: "Meter", price: 75000 }
        ],
        total: 36250000,
        status: "Approved",
        notes: "Project instalasi kelistrikan pabrik Tahap 1."
      },
      {
        id: "q_seed_2",
        number: "QTN/2026/0002",
        customerName: "CV Maju Jaya Abadi",
        customerEmail: "purchasing@majujaya.com",
        customerPhone: "031-8884321",
        date: "2026-06-26",
        items: [
          { id: "item3", name: "Suhu Controller Module STC-3000", qty: 10, unit: "Pcs", price: 850000 }
        ],
        total: 8500000,
        status: "Draft",
        notes: "Uji coba modul controller otomatis."
      }
    ],
    spks: [
      {
        id: "spk_seed_1",
        quotationId: "q_seed_1",
        quotationNumber: "QTN/2026/0001",
        number: "SPK/2026/0001",
        customerName: "PT Global Tech Indonesia",
        date: "2026-06-25",
        deadline: "2026-07-09",
        hppRab: {
          id: "rab_seed_1",
          spkId: "spk_seed_1",
          materialsBudget: [
            { name: "Plate Steel 2mm", qty: 4, cost: 800000, total: 3200000 },
            { name: "Powder Coating Grey", qty: 2, cost: 450000, total: 900000 },
            { name: "Copper Busbar 3x30mm", qty: 12, cost: 250000, total: 3000000 }
          ],
          laborBudget: [
            { task: "Welding & Fabrication", hours: 16, rate: 100000, total: 1600000 },
            { task: "Wiring & Assembly", hours: 24, rate: 85000, total: 2040000 }
          ],
          overheadBudget: [
            { name: "Electricity & Consumables", cost: 1200000 }
          ],
          totalBudget: 11940000,
          status: "Approved",
          updatedBy: "Siti Rahma",
          updatedAt: "2026-06-25"
        },
        engineering: {
          id: "eng_seed_1",
          spkId: "spk_seed_1",
          designName: "Layout Panel Custom GT-1200.pdf",
          drawingsUrl: "#",
          machines: [
            { machineName: "CNC Laser Cutting Machine", hoursNeeded: 4 },
            { machineName: "Bending Machine Hydraulic", hoursNeeded: 6 }
          ],
          processSteps: [
            { step: 1, description: "Cutting plat besi menggunakan CNC Laser sesuai pola gambar", estDuration: "4 Jam" },
            { step: 2, description: "Bending plat pembentuk bodi box panel", estDuration: "6 Jam" },
            { step: 3, description: "Welding rangka utama dan engsel pintu", estDuration: "8 Jam" },
            { step: 4, description: "Treatment anti-karat & Oven powder coating grey RAL-7035", estDuration: "12 Jam" }
          ],
          status: "Approved",
          updatedBy: "Eko Prasetyo",
          updatedAt: "2026-06-25"
        },
        status: "In Production",
        notes: "Prioritas tinggi, harus presisi tinggi."
      }
    ],
    productionLogs: [
      {
        id: "prod_seed_1",
        spkId: "spk_seed_1",
        spkNumber: "SPK/2026/0001",
        startDate: "2026-06-26",
        materialsUsed: [
          { name: "Plate Steel 2mm", qty: 4, lotNumber: "LOT-8871" },
          { name: "Powder Coating Grey", qty: 2, lotNumber: "LOT-1102" }
        ],
        temperature: 25.5, // Suhu ruang oven terpantau
        humidity: 50,
        batchNumber: "PRD/2026/0001",
        operatorName: "Agus Wijaya",
        mutuCheck: "Proses welding kuat, cat merata tanpa cacat permukaan.",
        status: "In Progress",
        notes: "Sedang pengerjaan wiring internal."
      }
    ],
    qaChecklists: [],
    suratJalanList: [],
    invoices: [],
    inventory: [
      {
        id: "inv_1",
        name: "Plate Steel 2mm",
        sku: "RAW-PLT-001",
        category: "Bahan Baku",
        qty: 45,
        unit: "Lembar",
        minQty: 10,
        unitPrice: 800000,
        supplier: "PT Krakatau Steel",
        notes: "Bahan utama pembuatan bodi box panel",
        lastRestocked: "2026-06-25"
      },
      {
        id: "inv_2",
        name: "Powder Coating Grey RAL-7035",
        sku: "RAW-PWD-002",
        category: "Bahan Baku",
        qty: 12,
        unit: "Kg",
        minQty: 5,
        unitPrice: 450000,
        supplier: "Sinar Warna Abadi",
        notes: "Pelapis luar tahan karat cat oven",
        lastRestocked: "2026-06-24"
      },
      {
        id: "inv_3",
        name: "Copper Busbar 3x30mm",
        sku: "RAW-COP-003",
        category: "Bahan Baku",
        qty: 80,
        unit: "Batang",
        minQty: 15,
        unitPrice: 250000,
        supplier: "Lembah Tembaga Jaya",
        notes: "Busbar penghantar daya tinggi",
        lastRestocked: "2026-06-25"
      },
      {
        id: "inv_4",
        name: "Kabel NYY 4x16mm",
        sku: "RAW-KBL-004",
        category: "Bahan Baku",
        qty: 500,
        unit: "Meter",
        minQty: 100,
        unitPrice: 75000,
        supplier: "Kabel Metal Indonesia",
        notes: "Kabel instalasi distribusi daya",
        lastRestocked: "2026-06-25"
      },
      {
        id: "inv_5",
        name: "Suhu Controller Module STC-3000",
        sku: "RAW-CTR-005",
        category: "Suku Cadang",
        qty: 25,
        unit: "Pcs",
        minQty: 5,
        unitPrice: 850000,
        supplier: "Autonics Distributor",
        notes: "Modul controller suhu otomatis",
        lastRestocked: "2026-06-26"
      }
    ]
  };
}


// Start express, serving client in prod and proxying in dev
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
