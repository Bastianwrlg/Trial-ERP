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
  Invoice,
  Company 
} from "./src/types";
import { COMPANIES } from "./src/data/companies";

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
    if (!parsed.companies || parsed.companies.length === 0) {
      parsed.companies = getSeedData().companies;
      updated = true;
    }
    if (!parsed.inventory) {
      parsed.inventory = getSeedData().inventory;
      updated = true;
    }
    if (!parsed.invoices || parsed.invoices.length === 0) {
      parsed.invoices = getSeedData().invoices;
      updated = true;
    } else {
      // Upgrade existing invoices without items
      parsed.invoices.forEach((inv: any, idx: number) => {
        if (!inv.items || inv.items.length === 0) {
          inv.itemDescription = inv.itemDescription || "Pengadaan Barang & Layanan Jasa Manufaktur " + (inv.spkNumber || inv.number);
          inv.items = [
            {
              id: "inv_item_auto_" + idx + "_1",
              type: "barang",
              name: "Unit Produk & Material Fisik " + (inv.spkNumber || inv.number),
              description: "Pengadaan bodi panel enclosure baja presisi dan material pendukung.",
              qty: 1,
              unit: "Unit",
              price: Math.round(inv.amount * 0.75),
              total: Math.round(inv.amount * 0.75)
            },
            {
              id: "inv_item_auto_" + idx + "_2",
              type: "jasa",
              name: "Jasa Fabrikasi, Finishing & Uji Mutu",
              description: "Pengerjaan laser cutting, bending, oven powder coating dan uji fungsi kelistrikan.",
              qty: 1,
              unit: "Paket",
              price: inv.amount - Math.round(inv.amount * 0.75),
              total: inv.amount - Math.round(inv.amount * 0.75)
            }
          ];
          updated = true;
        }
      });
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

app.use(express.json({ limit: "15mb" }));

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

// COMPANIES API
app.get("/api/companies", (req, res) => {
  const db = readDB();
  res.json(db.companies || getSeedData().companies);
});

app.post("/api/companies", (req, res) => {
  const db = readDB();
  if (!db.companies) db.companies = getSeedData().companies;

  const { name, fullName, code, tagline, address, phone, email, npwp, bankInfo, logoText, logoSvg, logoUrl, logoType, primaryColor, badgeColor } = req.body;
  const newCompanyId = (req.body.id || name.toLowerCase().replace(/[^a-z0-9]/g, '') + "_" + Date.now().toString().slice(-4));
  
  const newCompany: Company = {
    id: newCompanyId,
    name: name || "Perusahaan Baru",
    fullName: fullName || ("PT " + (name || "PERUSAHAAN BARU").toUpperCase()),
    code: (code || name.slice(0, 4)).toUpperCase(),
    tagline: tagline || "Manufaktur & Solusi Industri Presisi",
    badgeColor: badgeColor || "bg-indigo-600 text-white border-indigo-700",
    primaryColor: primaryColor || "indigo",
    address: address || "Kawasan Industri, Indonesia",
    phone: phone || "+62 21 0000-0000",
    email: email || "info@perusahaan.co.id",
    npwp: npwp || "00.000.000.0-000.000",
    bankInfo: bankInfo || "Bank BCA - A/C: 000-000-0000 a.n. " + (fullName || name),
    logoText: logoText || name.slice(0, 2).toUpperCase(),
    logoSvg: logoSvg || "",
    logoUrl: logoUrl || "",
    logoType: logoType || (logoUrl ? 'upload' : (logoSvg ? 'svg' : 'text'))
  };

  db.companies.push(newCompany);
  writeDB(db);
  res.status(201).json(newCompany);
});

app.patch("/api/companies/:id", (req, res) => {
  const db = readDB();
  if (!db.companies) db.companies = getSeedData().companies;
  const { id } = req.params;

  const compIndex = db.companies.findIndex((c: any) => c.id === id);
  if (compIndex === -1) {
    return res.status(404).json({ error: "Company not found" });
  }

  const comp = db.companies[compIndex];
  const fields = [
    'name', 'fullName', 'code', 'tagline', 'badgeColor', 
    'primaryColor', 'address', 'phone', 'email', 'npwp', 
    'bankInfo', 'logoText', 'logoSvg', 'logoUrl', 'logoType'
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      comp[f] = req.body[f];
    }
  });

  writeDB(db);
  res.json(comp);
});

app.delete("/api/companies/:id", (req, res) => {
  const db = readDB();
  if (!db.companies) db.companies = getSeedData().companies;
  const { id } = req.params;

  if (db.companies.length <= 1) {
    return res.status(400).json({ error: "Minimal harus ada 1 perusahaan terdaftar di sistem." });
  }

  const compIndex = db.companies.findIndex((c: any) => c.id === id);
  if (compIndex === -1) {
    return res.status(404).json({ error: "Company not found" });
  }

  const deleted = db.companies.splice(compIndex, 1)[0];
  writeDB(db);
  res.json({ message: "Company deleted successfully", company: deleted });
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

// POST QUOTATIONS
app.post("/api/quotations", (req, res) => {
  const db = readDB();
  const { customerName, customerEmail, customerPhone, items, notes, date, companyId } = req.body;
  
  const total = items.reduce((acc: number, item: any) => acc + (item.qty * item.price), 0);
  const prefix = "QTN/" + new Date().getFullYear() + "/";
  const num = (db.quotations.length + 1).toString().padStart(4, '0');
  
  const newQuotation: Quotation = {
    id: Date.now().toString(),
    companyId: companyId || 'fujiyama',
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
      companyId: quotation.companyId || 'fujiyama',
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

// Delete Quotation
app.delete("/api/quotations/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;

  const qIndex = db.quotations.findIndex((q: any) => q.id === id);
  if (qIndex === -1) {
    return res.status(404).json({ error: "Penawaran tidak ditemukan" });
  }

  db.quotations.splice(qIndex, 1);
  writeDB(db);
  res.json({ success: true, message: "Penawaran berhasil dihapus" });
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
      companyId: spk.companyId || 'fujiyama',
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
      companyId: log.companyId || 'fujiyama',
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
        companyId: spk.companyId || qa.companyId || 'fujiyama',
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
      // Get actual quotation to calculate original items and total
      const quotation = db.quotations.find((q: any) => q.id === spk.quotationId);
      
      let invoiceItems: any[] = [];
      let subtotal = 0;

      if (quotation && quotation.items && quotation.items.length > 0) {
        invoiceItems = quotation.items.map((it: any, idx: number) => {
          const isJasa = it.type === 'jasa' || /jasa|instalasi|pemasangan|wiring|rakit|testing|service|ongkos|pemeliharaan/i.test(it.name);
          const itemTotal = (it.qty || 1) * (it.price || 0);
          subtotal += itemTotal;
          return {
            id: it.id || "inv_item_" + Date.now() + "_" + idx,
            type: it.type || (isJasa ? 'jasa' : 'barang'),
            name: it.name,
            description: it.description || (isJasa 
              ? "Jasa teknis, perakitan presisi, dan uji fungsi kelistrikan sesuai spesifikasi SPK " + spk.number 
              : "Pengadaan unit / material fisik berspesifikasi industri mutu terjamin sesuai SPK " + spk.number),
            qty: it.qty || 1,
            unit: it.unit || "Pcs",
            price: it.price || 0,
            total: itemTotal
          };
        });
      } else {
        // Fallback realistic items (Barang + Jasa)
        invoiceItems = [
          {
            id: "inv_item_" + Date.now() + "_1",
            type: "barang",
            name: "Unit Produk & Komponen Manufaktur " + spk.number,
            description: "Pengadaan modul bodi enclosure plat baja, busbar tembaga, dan komponen utama.",
            qty: 1,
            unit: "Unit",
            price: 12000000,
            total: 12000000
          },
          {
            id: "inv_item_" + Date.now() + "_2",
            type: "jasa",
            name: "Jasa Fabrikasi, Wiring & Uji Kelayakan",
            description: "Jasa pengerjaan laser cutting, bending, oven powder coating, wiring instalasi dan uji mutu.",
            qty: 1,
            unit: "Paket",
            price: 3000000,
            total: 3000000
          }
        ];
        subtotal = 15000000;
      }

      const tax = Math.round(subtotal * 0.11); // 11% tax

      const newInv: Invoice = {
        id: "inv_" + Date.now().toString(),
        companyId: spk.companyId || sj.companyId || 'fujiyama',
        spkId: spk.id,
        spkNumber: spk.number,
        number: invPrefix + invNum,
        date: new Date().toISOString().split('T')[0],
        customerName: spk.customerName,
        itemDescription: "Pengadaan Barang Manufaktur dan Layanan Jasa Teknis Terintegrasi untuk " + spk.number,
        items: invoiceItems,
        amount: subtotal,
        tax,
        totalAmount: subtotal + tax,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days due
        status: 'Unpaid',
        notes: "Pembayaran jatuh tempo dalam 30 hari kalender. Garansi barang dan hasil pengerjaan jasa dilindungi garansi resmi."
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

// UPDATE INVOICE DETAILS & ITEMS (BARANG & JASA)
app.patch("/api/invoices/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { items, itemDescription, notes, dueDate, customerName, status } = req.body;

  const invIndex = db.invoices.findIndex((inv: any) => inv.id === id);
  if (invIndex === -1) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  const invoice = db.invoices[invIndex];
  if (itemDescription !== undefined) invoice.itemDescription = itemDescription;
  if (notes !== undefined) invoice.notes = notes;
  if (dueDate !== undefined) invoice.dueDate = dueDate;
  if (customerName !== undefined) invoice.customerName = customerName;
  if (status !== undefined) invoice.status = status;

  if (items && Array.isArray(items)) {
    invoice.items = items.map((it: any) => ({
      id: it.id || "inv_item_" + Date.now() + "_" + Math.random().toString().slice(2, 6),
      type: it.type === 'jasa' ? 'jasa' : 'barang',
      name: it.name || "Item",
      description: it.description || "",
      qty: Number(it.qty) || 1,
      unit: it.unit || "Pcs",
      price: Number(it.price) || 0,
      total: (Number(it.qty) || 1) * (Number(it.price) || 0)
    }));

    const subtotal = invoice.items.reduce((acc: number, item: any) => acc + item.total, 0);
    invoice.amount = subtotal;
    invoice.tax = Math.round(subtotal * 0.11);
    invoice.totalAmount = subtotal + invoice.tax;
  }

  writeDB(db);
  res.json(invoice);
});

app.delete("/api/invoices/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;

  const invIndex = db.invoices.findIndex((inv: any) => inv.id === id);
  if (invIndex === -1) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  const deleted = db.invoices.splice(invIndex, 1)[0];
  writeDB(db);
  res.json({ message: "Invoice deleted successfully", invoice: deleted });
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

app.delete("/api/users/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;

  const userIndex = db.users.findIndex((u: any) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  db.users.splice(userIndex, 1);
  writeDB(db);
  res.json({ message: "User deleted successfully" });
});

// INVENTORY (BAHAN BAKU & STOK) API
app.get("/api/inventory", (req, res) => {
  const db = readDB();
  res.json(db.inventory || []);
});

app.post("/api/inventory", (req, res) => {
  const db = readDB();
  const { name, sku, category, qty, unit, minQty, unitPrice, supplier, notes, companyId } = req.body;

  const newId = "inv_" + Date.now().toString();
  const newItem = {
    id: newId,
    companyId: companyId || 'fujiyama',
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
    companies: COMPANIES,
    users: [
      { id: "u1", name: "Administrator", username: "admin", role: "admin", allowedMenus: ["sales", "spk", "production", "qa", "logistics", "finance", "inventory", "users"] },
      { id: "u2", name: "Budi Santoso", username: "budi", role: "sales", allowedMenus: ["sales", "finance"] },
      { id: "u3", name: "Eko Prasetyo", username: "eko", role: "engineering", allowedMenus: ["spk"] },
      { id: "u4", name: "Siti Rahma", username: "siti", role: "finance", allowedMenus: ["spk", "finance"] },
      { id: "u5", name: "Agus Wijaya", username: "agus", role: "production", allowedMenus: ["spk", "production", "inventory"] },
      { id: "u6", name: "Rudi Hartono", username: "rudi", role: "qa", allowedMenus: ["production", "qa"] },
      { id: "u7", name: "Joko Widodo", username: "joko", role: "logistics", allowedMenus: ["logistics"] }
    ],
    quotations: [
      {
        id: "q_seed_fuji_1",
        companyId: "fujiyama",
        number: "QTN/FJ/2026/0001",
        customerName: "PT Global Tech Indonesia",
        customerEmail: "info@globaltech.co.id",
        customerPhone: "021-5551234",
        date: "2026-06-25",
        items: [
          { 
            id: "item1", 
            type: "barang",
            name: "Panel Box Custom 1200x800x400 (Fujiyama Spec)", 
            description: "Enclosure plat baja 2mm, powder coating RAL-7035 abu-abu, tahan suhu oven industri dan proteksi IP65.",
            qty: 2, 
            unit: "Unit", 
            price: 12500000 
          },
          { 
            id: "item2", 
            type: "barang",
            name: "Kabel NYY 4x16mm Supreme", 
            description: "Kabel tembaga isolasi PVC tegangan 0.6/1kV standar SPLN.",
            qty: 150, 
            unit: "Meter", 
            price: 75000 
          },
          {
            id: "item3",
            type: "jasa",
            name: "Jasa Fabrikasi, Wiring & Perakitan Busbar",
            description: "Jasa pemotongan laser CNC, bending bodi panel, instalasi rel busbar tembaga, dan wiring kabel kontrol internal.",
            qty: 1,
            unit: "Paket",
            price: 5000000
          }
        ],
        total: 41250000,
        status: "Approved",
        notes: "Project fabrikasi panel oven high-temp Fujiyama Industry."
      },
      {
        id: "q_seed_arga_1",
        companyId: "argathara",
        number: "QTN/AG/2026/0001",
        customerName: "PT Energi Perkasa Karawang",
        customerEmail: "procurement@energiperkasa.com",
        customerPhone: "0267-889911",
        date: "2026-06-26",
        items: [
          { 
            id: "item_arga1", 
            type: "barang",
            name: "Cubicle Panel Distribution 20kV", 
            description: "Unit cubicle gardu tegangan menengah berisolasi udara dengan vacuum circuit breaker.",
            qty: 1, 
            unit: "Unit", 
            price: 68000000 
          },
          { 
            id: "item_arga2", 
            type: "barang",
            name: "Digital Metering Relay ABB", 
            description: "Proteksi arus lebih dan hubung singkat mikroprosesor presisi tinggi.",
            qty: 2, 
            unit: "Pcs", 
            price: 14500000 
          },
          {
            id: "item_arga3",
            type: "jasa",
            name: "Jasa Testing, High-Voltage Injection & Commissioning",
            description: "Pengujian injeksi tegangan tinggi 20kV, setting rele proteksi ABB, dan uji sertifikasi layak operasi.",
            qty: 1,
            unit: "Layanan",
            price: 8500000
          }
        ],
        total: 105500000,
        status: "Approved",
        notes: "Instalasi gardu distribusi listrik Argathara Utama."
      },
      {
        id: "q_seed_arta_1",
        companyId: "artajaya",
        number: "QTN/AT/2026/0001",
        customerName: "CV Otomotif Presisi Nusantara",
        customerEmail: "sales@otomotifpresisi.co.id",
        customerPhone: "021-8991200",
        date: "2026-06-27",
        items: [
          { 
            id: "item_arta1", 
            type: "barang",
            name: "Jig Fixture Precision Machining", 
            description: "Alat bantu pencekam presisi toleransi ±0.01mm material tool steel SKD11.",
            qty: 5, 
            unit: "Set", 
            price: 8500000 
          },
          { 
            id: "item_arta2", 
            type: "barang",
            name: "Shaft Stainless SS304 CNC Turned", 
            description: "Poros putar transmisi stainless steel grade SS304 hasil bubut CNC mirror finish.",
            qty: 50, 
            unit: "Pcs", 
            price: 450000 
          },
          {
            id: "item_arta3",
            type: "jasa",
            name: "Jasa Heat Treatment & Hardness Inspection",
            description: "Proses perlakuan panas vacuum hardening 58-60 HRC dan uji kekerasan material.",
            qty: 1,
            unit: "Paket",
            price: 3500000
          }
        ],
        total: 68500000,
        status: "Draft",
        notes: "Pemesanan komponen perakitan Artajaya Pratama."
      }
    ],
    spks: [
      {
        id: "spk_seed_fuji_1",
        companyId: "fujiyama",
        quotationId: "q_seed_fuji_1",
        quotationNumber: "QTN/FJ/2026/0001",
        number: "SPK/FJ/2026/0001",
        customerName: "PT Global Tech Indonesia",
        date: "2026-06-25",
        deadline: "2026-07-09",
        hppRab: {
          id: "rab_seed_1",
          spkId: "spk_seed_fuji_1",
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
          spkId: "spk_seed_fuji_1",
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
        notes: "Prioritas tinggi, pabrik Fujiyama Industry."
      },
      {
        id: "spk_seed_arga_1",
        companyId: "argathara",
        quotationId: "q_seed_arga_1",
        quotationNumber: "QTN/AG/2026/0001",
        number: "SPK/AG/2026/0001",
        customerName: "PT Energi Perkasa Karawang",
        date: "2026-06-26",
        deadline: "2026-07-15",
        status: "Pending",
        notes: "Pekerjaan panel gardu Argathara Utama."
      }
    ],
    productionLogs: [
      {
        id: "prod_seed_fuji_1",
        companyId: "fujiyama",
        spkId: "spk_seed_fuji_1",
        spkNumber: "SPK/FJ/2026/0001",
        startDate: "2026-06-26",
        materialsUsed: [
          { name: "Plate Steel 2mm", qty: 4, lotNumber: "LOT-8871" },
          { name: "Powder Coating Grey", qty: 2, lotNumber: "LOT-1102" }
        ],
        temperature: 25.5,
        humidity: 50,
        batchNumber: "PRD/FJ/2026/0001",
        operatorName: "Agus Wijaya",
        mutuCheck: "Proses welding kuat, cat merata tanpa cacat permukaan.",
        status: "In Progress",
        notes: "Lini produksi Fujiyama."
      }
    ],
    qaChecklists: [],
    suratJalanList: [],
    invoices: [
      {
        id: "inv_seed_fuji_1",
        companyId: "fujiyama",
        spkId: "spk_seed_fuji_1",
        spkNumber: "SPK/FJ/2026/0001",
        number: "INV/FJ/2026/0001",
        date: "2026-06-28",
        customerName: "PT Global Tech Indonesia",
        itemDescription: "Pengadaan unit Panel Box Custom dan paket pengerjaan fabrikasi perakitan wiring oven industri.",
        items: [
          {
            id: "inv_item_f1",
            type: "barang",
            name: "Panel Box Custom 1200x800x400 (Fujiyama Spec)",
            description: "Enclosure box baja tebal 2mm, powder coating oven RAL-7035 abu-abu, tahan suhu panas industri dan proteksi IP65.",
            qty: 2,
            unit: "Unit",
            price: 12500000,
            total: 25000000
          },
          {
            id: "inv_item_f2",
            type: "barang",
            name: "Kabel NYY 4x16mm Supreme",
            description: "Kabel tembaga instalasi daya tegangan 0.6/1kV standar SNI/SPLN.",
            qty: 150,
            unit: "Meter",
            price: 75000,
            total: 11250000
          },
          {
            id: "inv_item_f3",
            type: "jasa",
            name: "Jasa Fabrikasi, Wiring & Perakitan Busbar Tembaga",
            description: "Jasa pemotongan laser CNC, bending bodi panel, instalasi busbar, dan terminasi kabel kontrol internal.",
            qty: 1,
            unit: "Paket",
            price: 5000000,
            total: 5000000
          }
        ],
        amount: 41250000,
        tax: 4537500,
        totalAmount: 45787500,
        dueDate: "2026-07-28",
        status: "Unpaid",
        notes: "Termin pembayaran Net 30 hari. Garansi barang fisik 12 bulan dan garansi pengerjaan jasa instalasi 6 bulan."
      },
      {
        id: "inv_seed_arga_1",
        companyId: "argathara",
        spkId: "spk_seed_arga_1",
        spkNumber: "SPK/AG/2026/0001",
        number: "INV/AG/2026/0001",
        date: "2026-06-29",
        customerName: "PT Energi Perkasa Karawang",
        itemDescription: "Pengadaan cubicle distribusi daya 20kV beserta jasa testing injeksi tegangan tinggi dan sertifikasi kelayakan.",
        items: [
          {
            id: "inv_item_a1",
            type: "barang",
            name: "Cubicle Panel Distribution 20kV",
            description: "Unit cubicle gardu distribusi tegangan menengah 20kV dilengkapi vacuum circuit breaker dan busbar tembaga.",
            qty: 1,
            unit: "Unit",
            price: 68000000,
            total: 68000000
          },
          {
            id: "inv_item_a2",
            type: "barang",
            name: "Digital Metering Relay ABB",
            description: "Modul digital protection relay mikroprosesor presisi monitoring tegangan & arus daya gardu.",
            qty: 2,
            unit: "Pcs",
            price: 14500000,
            total: 29000000
          },
          {
            id: "inv_item_a3",
            type: "jasa",
            name: "Jasa Testing, High-Voltage Injection & Commissioning Proyek",
            description: "Pengujian injeksi tegangan tinggi 20kV, kalibrasi sensor, pengujian trip rele, dan commissioning di lokasi proyek gardu.",
            qty: 1,
            unit: "Layanan",
            price: 8500000,
            total: 8500000
          }
        ],
        amount: 105500000,
        tax: 11605000,
        totalAmount: 117105000,
        dueDate: "2026-07-29",
        status: "Paid",
        notes: "Lunas ditransfer via Bank Mandiri resmi entitas PT Argathara Utama Mandiri."
      }
    ],
    inventory: [
      {
        id: "inv_fj_1",
        companyId: "fujiyama",
        name: "Plate Steel 2mm (Fujiyama)",
        sku: "FJ-RAW-PLT-001",
        category: "Bahan Baku",
        qty: 45,
        unit: "Lembar",
        minQty: 10,
        unitPrice: 800000,
        supplier: "PT Krakatau Steel",
        notes: "Bahan bodi box panel high-temp",
        lastRestocked: "2026-06-25"
      },
      {
        id: "inv_fj_2",
        companyId: "fujiyama",
        name: "Powder Coating Grey RAL-7035",
        sku: "FJ-RAW-PWD-002",
        category: "Bahan Baku",
        qty: 18,
        unit: "Kg",
        minQty: 5,
        unitPrice: 450000,
        supplier: "Sinar Warna Abadi",
        notes: "Cat oven powder coating",
        lastRestocked: "2026-06-24"
      },
      {
        id: "inv_ag_1",
        companyId: "argathara",
        name: "Busbar Tembaga 10x100mm (Argathara)",
        sku: "AG-COP-100",
        category: "Bahan Baku",
        qty: 32,
        unit: "Batang",
        minQty: 8,
        unitPrice: 1450000,
        supplier: "PT Tembaga Nusantara",
        notes: "Rel daya tinggi panel transmisi 20kV",
        lastRestocked: "2026-06-26"
      },
      {
        id: "inv_ag_2",
        companyId: "argathara",
        name: "Relay Proteksi Digital ABB",
        sku: "AG-ELC-RLY",
        category: "Suku Cadang",
        qty: 15,
        unit: "Pcs",
        minQty: 3,
        unitPrice: 12000000,
        supplier: "ABB Indonesia",
        notes: "Komponen otokontrol listrik",
        lastRestocked: "2026-06-25"
      },
      {
        id: "inv_at_1",
        companyId: "artajaya",
        name: "Bar Stock Stainless Steel SS304 Ø50mm",
        sku: "AT-RAW-SS304",
        category: "Bahan Baku",
        qty: 60,
        unit: "Batang",
        minQty: 12,
        unitPrice: 950000,
        supplier: "CV Logam Presisi",
        notes: "Bahan bubut CNC komponen mekanikal",
        lastRestocked: "2026-06-27"
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
