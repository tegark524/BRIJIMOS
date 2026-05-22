<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Users,
  Building2,
  BarChart3,
  FileText,
  TrendingUp,
  Target,
  FilePlus2,
  UploadCloud,
  Calendar,
  Send,
  ListChecks
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

// --- STATE / VARIABEL ---
const inputType = ref(route.query.tab || route.query.type || 'pegawai'); 
const selectedProduct = ref('Giro'); 
const rawPaste = ref('');
const parsedData = ref([]);
const tanggalInput = ref(new Date().toISOString().split('T')[0]);
const isSaving = ref(false);

const apiUrl = import.meta.env.VITE_API_URL; 

// --- FIX: URUTAN PRODUK ---
const fixedProducts = [
  "SALES VOLUME QRIS", "SALES VOLUME EDC", "CASA MERCHANT", "EDC MERCHANT",
  "PRODUKTIVITAS EDC", "QRIS PRODUKTIF", "TOTAL DANA", "MAU QLOLA",
  "USER QRIS", "GIRO", "TAB", "DEP", "CASA"
];

// Formatter Tanggal Cantik (D-M-Y)
const formatDateIndo = (dateStr) => {
  if(!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const menuTabs = [
  { id: 'pegawai', l: 'Dana RMFT', icon: Users },
  { id: 'uker', l: 'Unit Kerja', icon: Building2 },
  { id: 'keragaan', l: 'Keragaan', icon: BarChart3 },
  { id: 'rka', l: 'RKA', icon: FileText },
  { id: 'pipeline', l: 'Pipeline', icon: TrendingUp },
  { id: 'rmft_ach', l: 'Achievement RMFT', icon: Target }
];

watch(() => route.query.tab || route.query.type, (newTab) => {
  if (newTab) {
    inputType.value = newTab;
  }
});

watch(inputType, (newVal) => {
  rawPaste.value = '';
  parsedData.value = [];
  if (route.query.tab !== newVal && route.query.type !== newVal) {
    router.replace({ query: { ...route.query, tab: newVal } });
  }
});

const cleanNum = (val) => {
  if (!val || val === '-' || val === '') return 0;
  let cleaned = val.toString().replace(/\./g, '').replace(/,/g, '.').replace(/%/g, '').trim();
  return isNaN(parseFloat(cleaned)) ? 0 : parseFloat(cleaned);
};

// Parser Tanggal Indo ("4 Mei 2026" / "04/05/2026" -> "2026-05-04")
// Parser Tanggal Indo ("4 Mei 2026" / "04-Mei-26" / "04/05/2026" -> "2026-05-04")
const parseIndoDate = (dateStr) => {
  if (!dateStr) return null;
  // Ganti semua tanda hubung (termasuk en-dash), garis miring, titik menjadi spasi
  let cleanStr = dateStr.toString().trim().replace(/[-–—\/.,]/g, ' ').replace(/\s+/g, ' ').toLowerCase();

  const months = {
    'januari': '01', 'jan': '01',
    'februari': '02', 'feb': '02', 'febuari': '02',
    'maret': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'mei': '05', 'may': '05',
    'juni': '06', 'jun': '06',
    'juli': '07', 'jul': '07',
    'agustus': '08', 'agu': '08', 'agt': '08', 'aug': '08',
    'september': '09', 'sep': '09',
    'oktober': '10', 'okt': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'desember': '12', 'des': '12', 'dec': '12'
  };

  const parts = cleanStr.split(' ');
  if (parts.length >= 3) {
    if (parts[0].length === 4 && !isNaN(parts[0])) {
      let y = parts[0];
      let mRaw = parts[1];
      let m = months[mRaw];
      if (!m && /^\d+$/.test(mRaw)) {
        let mNum = parseInt(mRaw, 10);
        if (mNum >= 1 && mNum <= 12) m = mRaw.padStart(2, '0');
      }
      let dNum = parseInt(parts[2], 10);
      if (m && dNum >= 1 && dNum <= 31) {
        return `${y}-${m}-${parts[2].replace(/\D/g, '').padStart(2, '0')}`;
      }
    } else {
      let d = parts[0].replace(/\D/g, '').padStart(2, '0');
      let mRaw = parts[1];
      let m = months[mRaw];
      if (!m && /^\d+$/.test(mRaw)) {
        let mNum = parseInt(mRaw, 10);
        if (mNum >= 1 && mNum <= 12) m = mRaw.padStart(2, '0');
      }
      let y = parts[2].replace(/\D/g, '');
      
      let dNum = parseInt(d, 10);
      if (dNum >= 1 && dNum <= 31 && m && y && y.length >= 2) {
        if (y.length === 2) y = "20" + y;
        return `${y}-${m}-${d}`;
      }
    }
  }
  return null;
};

const mapJenisProduct = (k) => {
  if (!k) return '-';
  const up = k.trim().toUpperCase();
  if (up === 'G' || up === 'GIRO') return 'GIRO';
  if (up === 'T' || up === 'TAB' || up === 'TABUNGAN') return 'TAB';
  if (up === 'D' || up === 'DEP' || up === 'DEPO' || up === 'DEPOSITO') return 'DEPO';
  return up;
};

const activeVersion = ref('new');

// --- LOGIKA SMART PASTE ---
const handlePaste = () => {
  setTimeout(() => {
    const rows = rawPaste.value.split('\n');
    const result = [];
    let lastRMFT = ''; // Untuk menyimpan nama RMFT jika baris bawahnya kosong
    let lastFormatIndex = -1; // Menyimpan letak kolom tanggal dari baris sebelumnya

    // --- SETUP SMART MAPPING UNTUK RMFT_ACH ---
    let rmftMap = {};
    let isNewVersion = false;

    if (inputType.value === 'rmft_ach') {
      // Cari baris yang kemungkinan besar adalah header
      const headerRow = rows.find(r => {
        const up = r.trim().toUpperCase();
        return up.includes('RMFT') || up.includes('TAB') || up.includes('GIRO') || up.includes('KETERANGAN') || up.includes('POSISI');
      });
      
      if (headerRow) {
        const upHeader = headerRow.toUpperCase();
        if (upHeader.includes('POSISI TAB') || upHeader.includes('USER ACTIV') || upHeader.includes('CASA') || upHeader.includes('PH')) {
          isNewVersion = true;
        }

        let headerCols = headerRow.trim().split('\t');
        if (headerCols.length < 5) {
          headerCols = headerRow.trim().split(/\s{2,}/);
        }
        headerCols = headerCols.map(c => c.trim().toUpperCase());
        
        if (isNewVersion) {
          headerCols.forEach((col, idx) => {
            if (col === 'KETERANGAN' || col.includes('RMFT')) rmftMap.rmft = idx;
            else if (col.includes('AVG TAB')) rmftMap.avg_tab = idx;
            else if (col.includes('POSISI TAB') || col.includes('POSISI')) rmftMap.posisi_tab = idx;
            else if (col.includes('AVG GIRO')) rmftMap.avg_giro = idx;
            else if (col.includes('AVG DPK')) rmftMap.avg_dpk = idx;
            else if (col.includes('PAYROLL')) rmftMap.new_payroll = idx;
            else if (col.includes('SV EDC')) rmftMap.sv_edc = idx; // Letakkan sebelum EDC agar tidak overlap
            else if (col.includes('EDC') || col.includes('QRIS PROC')) rmftMap.edc_qris = idx;
            else if (col.includes('CASA')) rmftMap.casa_me = idx;
            else if (col.includes('ACTIV B') || col.includes('ACTIV') && col.includes('B')) rmftMap.user_activ_b = idx;
            else if (col.includes('ACTIV QLOLA') || col.includes('ACTIV') && col.includes('QLOLA')) rmftMap.user_activ_qlola = idx;
            else if (col.includes('PH')) rmftMap.ph_program = idx;
            else if (col.includes('TOTAL')) rmftMap.total = idx;
          });
        } else {
          headerCols.forEach((col, idx) => {
            if (col.includes('RMFT') || col.includes('KETERANGAN')) rmftMap.rmft = idx;
            else if (col.includes('TAB')) rmftMap.avg_tab = idx;
            else if (col.includes('GIRO')) rmftMap.avg_giro = idx;
            else if (col.includes('MERCHANT') || col.includes('MERCH')) rmftMap.dpk_merchant = idx;
            else if (col.includes('DPK')) rmftMap.avg_dpk = idx;
            else if (col.includes('FBI')) rmftMap.fbi_pa = idx;
            else if (col.includes('EDC') || col.includes('QRIS')) rmftMap.edc_qris = idx;
            else if (col.includes('SV') || col.includes('SALES')) rmftMap.sv = idx;
            else if (col.includes('PAYROLL')) rmftMap.new_payroll = idx;
            else if (col.includes('QLOLA')) rmftMap.prod_qlola = idx;
            else if (col.includes('KANWIL')) rmftMap.prog_kanwil = idx;
            else if (col.includes('SGF')) rmftMap.prog_sgf = idx;
            else if (col.includes('TOTAL')) rmftMap.total = idx;
          });
        }
      }

      if (Object.keys(rmftMap).length === 0) {
        rmftMap = {
          rmft: 0, avg_tab: 1, posisi_tab: 2, avg_giro: 3, avg_dpk: 4, 
          new_payroll: 5, edc_qris: 6, casa_me: 7, sv_edc: 8, 
          user_activ_b: 9, user_activ_qlola: 10, ph_program: 11, total: 12
        };
        isNewVersion = true;
      }
      activeVersion.value = isNewVersion ? 'new' : 'old';
    }

    rows.forEach(row => {
      const text = row.trim();
      const upText = text.toUpperCase();
      if (text === '' || upText.includes('RMFT') || upText.includes('NASABAH') || upText.includes('KETERANGAN') || upText.includes('POSISI TAB') || upText.includes('AVG TAB')) return;
      let cols = text.split('\t'); 
      if (cols.length < 5) {
        cols = text.split(/\s{2,}/);
      }
      
      if (inputType.value === 'pegawai') {
        let pn = '', nama = '', g, t, d;
        if (cols.length > 1) {
          pn = cols[0].includes(' - ') ? cols[0].split(' - ')[0] : cols[0];
          nama = cols[0].includes(' - ') ? cols[0].split(' - ')[1] : cols[1];
          g = cols[cols.length - 3]; t = cols[cols.length - 2]; d = cols[cols.length - 1];
        }
        result.push({ pn, nama, giro: cleanNum(g), tab: cleanNum(t), depo: cleanNum(d), tanggal: tanggalInput.value });
      
      } else if (inputType.value === 'uker') {
        const regexAngka = /(.*?)\s+([\d.,-]+)$/; 
        const match = text.match(regexAngka);
        let unit = '', namaUker = '', nilai = 0;

        if (match) {
          nilai = cleanNum(match[2]);
          let id = match[1].trim();
          unit = id.split(/ -- | - /)[0];
          namaUker = id.split(/ -- | - /)[1] || 'Unit Kerja';
        }
        result.push({ unit, nama: namaUker, produk: selectedProduct.value, nilai, tanggal: tanggalInput.value });

      } else if (inputType.value === 'pipeline') {
        if (cols.length >= 3) {
          let currentRMFT = cols[0].trim();
          
          if (!currentRMFT && lastRMFT) {
            currentRMFT = lastRMFT;
          } else if (currentRMFT) {
            lastRMFT = currentRMFT;
          }

          let rowDate = tanggalInput.value;
          let pPipeline = 0, pNominal = 0, pKet = '-';

          let dateMatch = null;
          for (let i = 2; i < Math.min(cols.length, 6); i++) {
             const parsed = parseIndoDate(cols[i]?.trim());
             if (parsed) {
                dateMatch = { index: i, date: parsed };
                break;
             }
          }

          let usedIndex = -1;
          const isProd = (val) => {
            const up = val?.trim().toUpperCase();
            return ['T', 'G', 'D', 'TAB', 'GIRO', 'DEPO', 'TABUNGAN', 'DEPOSITO'].includes(up);
          };

          if (dateMatch) {
            rowDate = dateMatch.date;
            usedIndex = dateMatch.index;
            lastFormatIndex = usedIndex;
          } else if (lastFormatIndex !== -1) {
            usedIndex = lastFormatIndex;
            rowDate = ''; // Biarkan tanggal kosong sesuai input jika kolom kosong
          } else {
            // Heuristik jika baris pertama langsung kosong tanggalnya
            if (isProd(cols[3])) { usedIndex = 2; rowDate = ''; }
            else if (isProd(cols[4])) { usedIndex = 3; rowDate = ''; }
          }

          if (usedIndex === 3) {
              // FORMAT BARU: RMFT(0), Nasabah(1), Nominal Pipeline(2), Tanggal(3), Jenis(4)
              pPipeline = cleanNum(cols[2]);
              pKet = mapJenisProduct(cols[4]);
              pNominal = cleanNum(cols[5]) || 0;
          } else if (usedIndex === 2) {
              // FORMAT LAIN: RMFT(0), Nasabah(1), Tanggal(2), Jenis(3), Nominal Pipeline(4), Realisasi(5)
              pKet = mapJenisProduct(cols[3]);
              pPipeline = cleanNum(cols[4]);
              pNominal = cleanNum(cols[5]);
          } else if (usedIndex > 3) {
              // FORMAT LAMA: RMFT, Nasabah, Pipeline, Ket, Nominal, Tgl(last)
              pPipeline = cleanNum(cols[2]);
              pKet = cols[3]?.trim() || '-';
              pNominal = cleanNum(cols[4]);
          } else {
            // FORMAT DEFAULT
            pPipeline = cleanNum(cols[2]);
            pKet = cols[3]?.trim() || '-';
            pNominal = cleanNum(cols[4]);
            if (!dateMatch && lastFormatIndex === -1 && usedIndex === -1) {
                rowDate = tanggalInput.value;
            }
          }

          result.push({
            NAMA_RMFT: currentRMFT || 'Unknown RMFT',
            NAMA_NASABAH: cols[1]?.trim() || 'Nasabah Umum',
            PIPELINE: pPipeline,
            KETERANGAN: pKet,
            NOMINAL: pNominal,
            TANGGAL: rowDate
          });
        }

      } else if (inputType.value === 'rmft_ach') {
        if (cols.length > 1) {
          result.push({
            NAMA_RMFT: cols[rmftMap.rmft]?.trim() || 'Unknown RMFT',
            AVG_TAB: cleanNum(cols[rmftMap.avg_tab]),
            posisi_tab: cleanNum(cols[rmftMap.posisi_tab]),
            AVG_GIRO: cleanNum(cols[rmftMap.avg_giro]),
            AVG_DPK: cleanNum(cols[rmftMap.avg_dpk]),
            FBI_PA: cleanNum(cols[rmftMap.fbi_pa]),
            EDC_QRIS: cleanNum(cols[rmftMap.edc_qris]),
            DPK_MERCHANT: cleanNum(cols[rmftMap.dpk_merchant]),
            SV: cleanNum(cols[rmftMap.sv]),
            NEW_PAYROLL: cleanNum(cols[rmftMap.new_payroll]),
            PROD_QLOLA: cleanNum(cols[rmftMap.prod_qlola]),
            PROG_KANWIL: cleanNum(cols[rmftMap.prog_kanwil]),
            PROG_SGF: cleanNum(cols[rmftMap.prog_sgf]),
            casa_me: cleanNum(cols[rmftMap.casa_me]),
            sv_edc: cleanNum(cols[rmftMap.sv_edc]),
            user_activ_b: cleanNum(cols[rmftMap.user_activ_b]),
            user_activ_qlola: cleanNum(cols[rmftMap.user_activ_qlola]),
            ph_program: cleanNum(cols[rmftMap.ph_program]),
            TOTAL: cleanNum(cols[rmftMap.total]),
            BULAN: tanggalInput.value.substring(0, 7),
            TANGGAL: tanggalInput.value
          });
        }
      } else if (inputType.value === 'keragaan' || inputType.value === 'rka') {
        const inputRowText = text.toUpperCase();
        const foundProd = fixedProducts.find(p => inputRowText.includes(p));
        
        if (foundProd) {
          const nilaiRaw = cols[cols.length - 1];
          result.push({ 
            produk: foundProd, 
            nilai: cleanNum(nilaiRaw), 
            tanggal: tanggalInput.value,
            bulan: tanggalInput.value.substring(0, 7)
          });
        }
      }
    });
    parsedData.value = result;
  }, 100);
};

const saveData = async () => {
  if (parsedData.value.length === 0) return alert('Preview masih kosong, bre!');
  if (!confirm(`Kirim ${parsedData.value.length} data ke database?`)) return;

  isSaving.value = true;
  try {
    const payload = {
      action: 'insert',
      type: inputType.value,
      data: parsedData.value
    };
    const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify(payload) });
    const res = await response.json();
    if (res.status === 'success') {
      alert(`🚀 BERHASIL!\n${parsedData.value.length} data ${inputType.value} periode ${formatDateIndo(tanggalInput.value)} sudah masuk.`);
          sessionStorage.removeItem('brijimos_data');
          sessionStorage.removeItem('brijimos_data_timestamp');
      parsedData.value = [];
      rawPaste.value = '';
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    alert('Waduh, Gagal Simpan: ' + error.message);
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
    
    <div class="flex items-center space-x-5 mb-10">
      <div class="p-5 bg-blue-600 rounded-[2.5rem] shadow-2xl text-white rotate-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <h1 class="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Entry Center</h1>
        <p class="text-[10px] font-bold text-slate-400 tracking-[0.3em] mt-2 uppercase">Input Data Cepat via Smart-Paste</p>
      </div>
    </div>

    <!-- Mobile Dropdown -->
    <div class="block lg:hidden w-full mb-8 relative">
      <select v-model="inputType" class="w-full border border-slate-200 p-3.5 rounded-xl bg-white font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer shadow-sm">
        <option v-for="m in menuTabs" :key="m.id" :value="m.id">{{ m.l }}</option>
      </select>
      <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
    </div>

    <!-- Desktop Tabs -->
    <div class="hidden lg:flex flex-wrap gap-2 p-1.5 bg-white rounded-xl w-full lg:w-fit mb-8 border border-slate-200 shadow-sm">
      <button v-for="m in menuTabs" 
        :key="m.id" @click="inputType = m.id" 
        :class="inputType === m.id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'"
        class="flex items-center px-4 py-2 rounded-lg font-semibold transition-all text-sm"
      >
        <component :is="m.icon" class="w-4 h-4 mr-2" />
        {{ m.l }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      <div class="lg:col-span-4 space-y-8">
        <div class="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100">
          <div class="space-y-6">
            <div>
              <label class="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2"><Calendar class="w-4 h-4" /> Tanggal Data (Wajib Cek)</label>
              <input type="date" v-model="tanggalInput" @change="handlePaste" class="w-full border-4 border-slate-50 p-4 rounded-3xl bg-slate-50 font-black text-lg focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner" />
              <p class="mt-2 text-[9px] text-blue-500 font-bold uppercase tracking-widest ml-2 italic">* Pastikan tanggal sesuai data Excel</p>
            </div>
            
            <div v-if="inputType === 'uker'">
              <label class="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2"><ListChecks class="w-4 h-4" /> Pilih Produk Unit</label>
              <select v-model="selectedProduct" @change="handlePaste" class="w-full border-4 border-slate-50 p-4 rounded-3xl bg-slate-50 font-black focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner">
                <option value="Giro">Giro</option>
                <option value="Tabungan">Tabungan</option>
                <option value="Deposito">Deposito</option>
              </select>
            </div>

            <div>
              <label class="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2"><FilePlus2 class="w-4 h-4" /> Excel Paste Zone</label>
              <textarea 
                v-model="rawPaste" 
                @input="handlePaste"
                :placeholder="inputType === 'pegawai' ? 'Paste PN - Nama & Saldo...' : 'Copy dari Excel lalu Paste di sini...'" 
                class="w-full h-96 p-6 border-4 border-slate-50 bg-slate-50 rounded-[2.5rem] focus:bg-white focus:border-blue-500 outline-none font-mono text-xs transition-all leading-relaxed shadow-inner"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-8 flex flex-col">
        <div class="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-full min-h-[600px]">
          
          <div class="p-8 border-b flex justify-between items-center bg-slate-50/50 backdrop-blur-sm">
            <div>
              <h3 class="font-black text-slate-700 text-xl tracking-tight uppercase">Live Preview</h3>
              <div class="flex items-center space-x-3 mt-1">
                <p class="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{{ parsedData.length }} Baris Terdeteksi</p>
                <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                <p class="flex items-center gap-1 text-[10px] text-red-600 font-black uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                  <Calendar class="w-3 h-3" /> Periode: {{ formatDateIndo(tanggalInput) }}
                </p>
              </div>
            </div>
            <div class="px-5 py-2 bg-blue-100 text-blue-700 rounded-2xl font-black text-[10px] uppercase border border-blue-200">
               {{ inputType === 'pegawai' ? 'DANA' : inputType }} MODE
            </div>
          </div>

          <div class="flex-1 overflow-auto p-4">
            <table v-if="parsedData.length > 0" class="w-full text-left border-separate border-spacing-0">
              <thead class="bg-slate-800 text-white sticky top-0 z-10 uppercase text-[10px] tracking-widest text-center">
                <tr v-if="inputType === 'pipeline'">
                  <th class="p-5 rounded-tl-2xl border-b border-slate-700 text-left">RMFT & Nasabah</th>
                  <th class="p-5 border-b border-slate-700 text-right">Pipeline</th>
                  <th class="p-5 border-b border-slate-700 text-right">Nominal</th>
                  <th class="p-5 border-b border-slate-700 text-center">Tanggal</th>
                  <th class="p-5 border-b border-slate-700 text-left rounded-tr-2xl">Ket</th>
                </tr>
                <tr v-else-if="inputType === 'rmft_ach' && activeVersion === 'new'">
                  <th class="p-4 rounded-tl-2xl border-b border-slate-700 whitespace-nowrap">RMFT</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">AVG TAB</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">POSISI TAB</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">AVG GIRO</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">AVG DPK</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">PAYROLL</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">EDC & QRIS</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">CASA ME</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">SV EDC</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">USER ACTIV B</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">USER ACTIV QLOLA</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">PH PROGRAM</th>
                  <th class="p-4 border-b border-slate-700 text-right rounded-tr-2xl whitespace-nowrap">TOTAL</th>
                </tr>
                <tr v-else-if="inputType === 'rmft_ach' && activeVersion === 'old'">
                  <th class="p-4 rounded-tl-2xl border-b border-slate-700 whitespace-nowrap">RMFT</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">AVG TAB</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">AVG GIRO</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">AVG DPK</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">FBI PA</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">EDC/QRIS</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">DPK MERCH</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">SV</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">PAYROLL</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">QLOLA</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">KANWIL</th>
                  <th class="p-4 border-b border-slate-700 text-right whitespace-nowrap">SGF</th>
                  <th class="p-4 border-b border-slate-700 text-right rounded-tr-2xl whitespace-nowrap">TOTAL</th>
                </tr>
                <tr v-else>
                  <th class="p-5 rounded-tl-2xl border-b border-slate-700">Data Utama</th>
                  <th v-if="inputType === 'pegawai'" v-for="h in ['Giro','Tab','Depo']" :key="h" class="p-5 text-right border-b border-slate-700">{{ h }}</th>
                  <th v-if="inputType === 'uker'" class="p-5 border-b border-slate-700 text-center">Produk</th>
                  <th v-if="inputType !== 'pegawai'" class="p-5 text-right border-b border-slate-700 rounded-tr-2xl">Nilai</th>
                </tr>
              </thead>
              <tbody class="text-sm">
                <tr v-for="(d, i) in parsedData" :key="i" class="hover:bg-blue-50/50 transition-colors">
                  <template v-if="inputType === 'pipeline'">
                    <td class="p-4 border-b border-slate-100">
                      <div class="font-black text-blue-900 uppercase text-[11px]">{{ d.NAMA_RMFT || '-' }}</div>
                      <div class="font-bold text-slate-400 text-[9px] mt-1">{{ d.NAMA_NASABAH || '-' }}</div>
                    </td>
                    <td class="p-4 text-right font-black text-amber-600 border-b border-slate-100">{{ d.PIPELINE.toLocaleString('id-ID') }}</td>
                    <td class="p-4 text-right font-black text-green-700 border-b border-slate-100">{{ d.NOMINAL.toLocaleString('id-ID') }}</td>
                    <td class="p-4 text-center font-bold text-slate-400 border-b border-slate-100">{{ formatDateIndo(d.TANGGAL) }}</td>
                    <td class="p-4 text-slate-400 font-bold border-b border-slate-100 italic">{{ d.KETERANGAN }}</td>
                  </template>
                  <template v-else-if="inputType === 'rmft_ach' && activeVersion === 'new'">
                    <td class="p-4 border-b border-slate-100 font-black text-blue-900 uppercase text-[10px] whitespace-nowrap">{{ d.NAMA_RMFT }}</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.AVG_TAB }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.posisi_tab }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.AVG_GIRO }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.AVG_DPK }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.NEW_PAYROLL }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.EDC_QRIS }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.casa_me }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.sv_edc }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.user_activ_b }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.user_activ_qlola }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.ph_program }}%</td>
                    <td class="p-4 text-right font-black text-green-700 border-b border-slate-100">{{ d.TOTAL }}%</td>
                  </template>
                  <template v-else-if="inputType === 'rmft_ach' && activeVersion === 'old'">
                    <td class="p-4 border-b border-slate-100 font-black text-blue-900 uppercase text-[10px] whitespace-nowrap">{{ d.NAMA_RMFT }}</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.AVG_TAB }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.AVG_GIRO }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.AVG_DPK }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.FBI_PA }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.EDC_QRIS }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.DPK_MERCHANT }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.SV }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.NEW_PAYROLL }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.PROD_QLOLA }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.PROG_KANWIL }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.PROG_SGF }}%</td>
                    <td class="p-4 text-right font-black text-green-700 border-b border-slate-100">{{ d.TOTAL }}%</td>
                  </template>
                  <template v-else>
                    <td class="p-5 font-black text-slate-700 border-b border-slate-100 uppercase">{{ d.pn || d.unit || d.produk }} <span class="block font-medium text-slate-400 text-[10px] mt-1">{{ d.nama || '' }}</span></td>
                    <td v-if="inputType === 'pegawai'" class="p-5 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.giro.toLocaleString('id-ID') }}</td>
                    <td v-if="inputType === 'pegawai'" class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.tab.toLocaleString('id-ID') }}</td>
                    <td v-if="inputType === 'pegawai'" class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.depo.toLocaleString('id-ID') }}</td>
                    <td v-if="inputType === 'uker'" class="p-5 text-center border-b border-slate-100"><span class="px-3 py-1 bg-slate-100 rounded-lg font-black text-[10px] text-slate-500">{{ d.produk }}</span></td>
                    <td v-if="inputType === 'uker'" class="p-5 text-right font-black text-blue-900 text-xl border-b border-slate-100">{{ d.nilai.toLocaleString('id-ID') }}</td>
                    <td v-if="inputType === 'keragaan' || inputType === 'rka'" class="p-5 text-right font-black text-blue-900 text-2xl italic border-b border-slate-100">{{ d.nilai.toLocaleString('id-ID') }}</td>
                  </template>
                </tr>
              </tbody>
            </table>
            <div v-else class="flex flex-col items-center justify-center h-full opacity-30 py-20">
              <UploadCloud class="w-24 h-24 mb-6 text-slate-500" />
              <p class="font-black uppercase tracking-widest text-xs">Siap Menerima Paste Tabel {{ inputType }}...</p>
            </div>
          </div>

          <div class="p-8 bg-slate-50/80 border-t border-slate-200">
            <button 
              @click="saveData" 
              :disabled="isSaving || parsedData.length === 0"
              class="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all disabled:bg-slate-300 disabled:shadow-none active:scale-95 flex flex-col items-center justify-center space-y-1 uppercase tracking-widest"
            >
              <template v-if="!isSaving">
                <span class="flex items-center gap-2 text-base"><Send class="w-5 h-5" /> KIRIM {{ parsedData.length }} DATA</span>
                <span class="text-[9px] opacity-70 tracking-[0.2em]">UNTUK PERIODE {{ formatDateIndo(tanggalInput) }}</span>
              </template>
              <template v-else>
                <div class="flex items-center space-x-3">
                   <div class="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span>PROSES SINKRONISASI...</span>
                </div>
              </template>
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* Scrollbar Custom */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>