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

// --- STATE / VARIABEL ---
const inputType = ref('pegawai'); 
const selectedProduct = ref('Giro'); 
const rawPaste = ref('');
const parsedData = ref([]);
const tanggalInput = ref(new Date().toISOString().split('T')[0]);
const isSaving = ref(false);

const apiUrl = 'https://script.google.com/macros/s/AKfycbz9dCJE_F9tn6GAkbEeXp4x--DK0alT8V0SKBRxPLjRPshCmZ7x5cdsExtKH1YtUhy5Bw/exec'; 

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
  { id: 'pegawai', l: 'Pegawai', icon: Users },
  { id: 'uker', l: 'Unit Kerja', icon: Building2 },
  { id: 'keragaan', l: 'Keragaan', icon: BarChart3 },
  { id: 'rka', l: 'RKA', icon: FileText },
  { id: 'pipeline', l: 'Pipeline', icon: TrendingUp },
  { id: 'rmft_ach', l: 'Achievement RMFT', icon: Target }
];

watch(inputType, () => {
  rawPaste.value = '';
  parsedData.value = [];
});

const cleanNum = (val) => {
  if (!val || val === '-' || val === '') return 0;
  let cleaned = val.toString().replace(/\./g, '').replace(/,/g, '.').replace(/%/g, '').trim();
  return isNaN(parseFloat(cleaned)) ? 0 : parseFloat(cleaned);
};

// --- LOGIKA SMART PASTE ---
const handlePaste = () => {
  setTimeout(() => {
    const rows = rawPaste.value.split('\n');
    const result = [];
    let lastRMFT = ''; // Untuk menyimpan nama RMFT jika baris bawahnya kosong

    rows.forEach(row => {
      const text = row.trim();
      if (text === '' || text.toUpperCase().includes('RMFT') || text.toUpperCase().includes('NASABAH')) return;
      const cols = text.split('\t'); 
      
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
        // Mapping: RMFT(0), Nasabah(1), Pipeline(2), Ket(3), Nominal(4), Tgl(5)
        // Kita gunakan length >= 3 agar data minimal RMFT+Nasabah+Pipeline tetap masuk
        if (cols.length >= 3) {
          let currentRMFT = cols[0].trim();
          
          // Sticky RMFT: Jika kolom RMFT kosong, ambil dari baris di atasnya
          if (!currentRMFT && lastRMFT) {
            currentRMFT = lastRMFT;
          } else if (currentRMFT) {
            lastRMFT = currentRMFT;
          }

          // Cek jika ada kolom tanggal di kolom terakhir (format DD/MM/YYYY)
          let rowDate = tanggalInput.value;
          const datePart = cols[cols.length - 1]?.trim();
          if (datePart && datePart.includes('/')) {
            const [d, m, y] = datePart.split('/');
            rowDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          }

          result.push({
            rmft: currentRMFT || 'Unknown RMFT',
            nasabah: cols[1]?.trim() || 'Nasabah Umum',
            pipeline: cleanNum(cols[2]),
            ket: cols[3]?.trim() || '-',
            nominal: cleanNum(cols[4]),
            tanggal: rowDate
          });
        }

      } else if (inputType.value === 'rmft_ach') {
        if (cols.length > 1) {
          result.push({
            rmft: cols[0]?.trim() || 'Unknown RMFT',
            avg_tab: cleanNum(cols[1]),
            avg_giro: cleanNum(cols[2]),
            avg_dpk: cleanNum(cols[3]),
            fbi_pa: cleanNum(cols[4]),
            edc_qris: cleanNum(cols[5]),
            dpk_merchant: cleanNum(cols[6]),
            sv: cleanNum(cols[7]),
            new_payroll: cleanNum(cols[8]),
            prod_qlola: cleanNum(cols[9]),
            prog_kanwil: cleanNum(cols[10]),
            prog_sgf: cleanNum(cols[11]),
            total: cleanNum(cols[12]),
            bulan: tanggalInput.value.substring(0, 7),
            tanggal: tanggalInput.value
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
               {{ inputType }} MODE
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
                <tr v-else-if="inputType === 'rmft_ach'">
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
                      <div class="font-black text-blue-900 uppercase text-[11px]">{{ d.rmft || '-' }}</div>
                      <div class="font-bold text-slate-400 text-[9px] mt-1">{{ d.nasabah || '-' }}</div>
                    </td>
                    <td class="p-4 text-right font-black text-amber-600 border-b border-slate-100">{{ d.pipeline.toLocaleString('id-ID') }}</td>
                    <td class="p-4 text-right font-black text-green-700 border-b border-slate-100">{{ d.nominal.toLocaleString('id-ID') }}</td>
                    <td class="p-4 text-center font-bold text-slate-400 border-b border-slate-100">{{ formatDateIndo(d.tanggal) }}</td>
                    <td class="p-4 text-slate-400 font-bold border-b border-slate-100 italic">{{ d.ket }}</td>
                  </template>
                  <template v-else-if="inputType === 'rmft_ach'">
                    <td class="p-4 border-b border-slate-100 font-black text-blue-900 uppercase text-[10px] whitespace-nowrap">{{ d.rmft }}</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.avg_tab }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.avg_giro }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.avg_dpk }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.fbi_pa }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.edc_qris }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.dpk_merchant }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.sv }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.new_payroll }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.prod_qlola }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.prog_kanwil }}%</td>
                    <td class="p-4 text-right font-mono text-slate-500 border-b border-slate-100">{{ d.prog_sgf }}%</td>
                    <td class="p-4 text-right font-black text-green-700 border-b border-slate-100">{{ d.total }}%</td>
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