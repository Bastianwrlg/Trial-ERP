import { Company } from "../types";

export const COMPANIES: Company[] = [
  {
    id: "fujiyama",
    name: "Fujiyama",
    fullName: "PT FUJIYAMA INDUSTRY INDONESIA",
    code: "FUJI",
    tagline: "Manufaktur & Fabrikasi Presisi High-Temp",
    badgeColor: "bg-indigo-600 text-white border-indigo-700",
    primaryColor: "indigo",
    address: "Kawasan Industri Jababeka V Block C-18, Cikarang - Bekasi 17530",
    phone: "+62 21 8983-4567 / +62 812-9988-7766",
    email: "finance@fujiyama.co.id",
    npwp: "01.345.678.9-012.000",
    bankInfo: "Bank BCA KCP Cikarang - A/C: 789-012-3456 a.n. PT Fujiyama Industry Indonesia",
    logoText: "FJ",
    logoSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="220" height="55">
      <defs>
        <linearGradient id="fujiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4F46E5"/>
          <stop offset="100%" stop-color="#312E81"/>
        </linearGradient>
      </defs>
      <path d="M 20 60 L 50 15 L 62 32 L 75 15 L 105 60 Z" fill="url(#fujiGrad)" />
      <polygon points="50,15 62,32 57,32 45,25" fill="#818CF8" />
      <polygon points="75,15 80,25 68,32 62,32" fill="#A5B4FC" />
      <circle cx="62.5" cy="50" r="6" fill="#E0E7FF" />
      <text x="120" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="28" fill="#1E1B4B" letter-spacing="1">FUJIYAMA</text>
      <text x="120" y="62" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="11" fill="#4338CA" letter-spacing="2">INDUSTRY INDONESIA</text>
    </svg>`
  },
  {
    id: "argathara",
    name: "Argathara",
    fullName: "PT ARGATHARA UTAMA TEKNIKA",
    code: "ARGA",
    tagline: "Kelistrikan Industri & Otomasi Panel",
    badgeColor: "bg-emerald-600 text-white border-emerald-700",
    primaryColor: "emerald",
    address: "Kawasan Industri MITRA Karawang Lot A-5, Jawa Barat 41361",
    phone: "+62 267 8632-1100 / +62 813-1122-3344",
    email: "billing@argathara.co.id",
    npwp: "02.890.123.4-015.000",
    bankInfo: "Bank Mandiri Cab. Karawang - A/C: 132-00-9876543-2 a.n. PT Argathara Utama Teknika",
    logoText: "AU",
    logoSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="220" height="55">
      <defs>
        <linearGradient id="argaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#059669"/>
          <stop offset="100%" stop-color="#064E3B"/>
        </linearGradient>
      </defs>
      <rect x="20" y="15" width="70" height="50" rx="12" fill="url(#argaGrad)" />
      <path d="M 50 20 L 35 42 L 52 42 L 42 60 L 68 36 L 50 36 Z" fill="#34D399" />
      <text x="105" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="27" fill="#064E3B" letter-spacing="1">ARGATHARA</text>
      <text x="105" y="62" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="11" fill="#059669" letter-spacing="2">UTAMA TEKNIKA</text>
    </svg>`
  },
  {
    id: "artajaya",
    name: "Artajaya",
    fullName: "PT ARTAJAYA PRATAMA PRESISI",
    code: "ARTA",
    tagline: "Pemesinan, Perakitan & Komponen Mekanikal",
    badgeColor: "bg-amber-600 text-white border-amber-700",
    primaryColor: "amber",
    address: "Kawasan Industri MM2100 Blok B-12, Cibitung - Bekasi 17520",
    phone: "+62 21 8998-3322 / +62 811-4455-6677",
    email: "invoicing@artajaya.co.id",
    npwp: "03.456.789.0-022.000",
    bankInfo: "Bank BCA Cab. MM2100 - A/C: 543-210-9876 a.n. PT Artajaya Pratama Presisi",
    logoText: "AP",
    logoSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="220" height="55">
      <defs>
        <linearGradient id="artaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D97706"/>
          <stop offset="100%" stop-color="#78350F"/>
        </linearGradient>
      </defs>
      <circle cx="55" cy="40" r="28" fill="url(#artaGrad)" />
      <polygon points="55,18 62,30 75,30 65,40 70,52 55,44 40,52 45,40 35,30 48,30" fill="#FCD34D" />
      <circle cx="55" cy="40" r="10" fill="#FFFBEB" />
      <text x="100" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="28" fill="#78350F" letter-spacing="1">ARTAJAYA</text>
      <text x="100" y="62" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="11" fill="#B45309" letter-spacing="2">PRATAMA PRESISI</text>
    </svg>`
  }
];


