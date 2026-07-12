<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clearCache } from '../store';
import CustomSelect from '../components/CustomSelect.vue';
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
  ListChecks,
  Info,
  Copy,
  Check,
  Sparkles,
  AlertCircle
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
const inputMode = ref('paste'); // 'paste' | 'manual'
const manualForm = ref({
  pn: '', nama: '', giro: '', tab: '', depo: '',
  unit: '', ukerNama: '', ukerNilai: '',
  produk: 'TOTAL DANA', nilai: '',
  pipelineRMFT: '', pipelineNasabah: '', pipelineNominal: '', pipelineReal: '', pipelineJenis: 'Giro', pipelineDate: '',
  achRMFT: '', achAvgTab: '', achPosTab: '', achAvgGiro: '', achAvgDpk: '', achTotal: '',
  nasabahNama: '', nasabahUsaha: '', nasabahOmset: '', nasabahProduk: 'TAB', nasabahVolume: '', nasabahPersen: ''
});

const resetManualForm = () => {
  manualForm.value = {
    pn: '', nama: '', giro: '', tab: '', depo: '',
    unit: '', ukerNama: '', ukerNilai: '',
    produk: 'TOTAL DANA', nilai: '',
    pipelineRMFT: '', pipelineNasabah: '', pipelineNominal: '', pipelineReal: '', pipelineJenis: 'Giro', pipelineDate: tanggalInput.value,
    achRMFT: '', achAvgTab: '', achPosTab: '', achAvgGiro: '', achAvgDpk: '', achTotal: '',
    nasabahNama: '', nasabahUsaha: '', nasabahOmset: '', nasabahProduk: 'TAB', nasabahVolume: '', nasabahPersen: ''
  };
};

const addManualRow = () => {
  let row = {};
  if (inputType.value === 'pegawai') {
    if (!manualForm.value.pn || !manualForm.value.nama) return alert('Nama dan PN wajib diisi!');
    row = {
      pn: manualForm.value.pn,
      nama: manualForm.value.nama,
      giro: Number(manualForm.value.giro) || 0,
      tab: Number(manualForm.value.tab) || 0,
      depo: Number(manualForm.value.depo) || 0,
      tanggal: tanggalInput.value
    };
  } else if (inputType.value === 'uker') {
    if (!manualForm.value.unit) return alert('Kode Unit wajib diisi!');
    row = {
      unit: manualForm.value.unit,
      nama: manualForm.value.ukerNama || 'Unit Kerja',
      produk: selectedProduct.value,
      nilai: Number(manualForm.value.ukerNilai) || 0,
      tanggal: tanggalInput.value
    };
  } else if (inputType.value === 'keragaan' || inputType.value === 'rka') {
    row = {
      produk: manualForm.value.produk,
      nilai: Number(manualForm.value.nilai) || 0,
      tanggal: tanggalInput.value,
      bulan: tanggalInput.value.substring(0, 7)
    };
  } else if (inputType.value === 'pipeline') {
    if (!manualForm.value.pipelineRMFT || !manualForm.value.pipelineNasabah) return alert('Nama RMFT dan Nasabah wajib diisi!');
    row = {
      NAMA_RMFT: manualForm.value.pipelineRMFT,
      NAMA_NASABAH: manualForm.value.pipelineNasabah,
      PIPELINE: Number(manualForm.value.pipelineNominal) || 0,
      KETERANGAN: manualForm.value.pipelineJenis,
      NOMINAL: Number(manualForm.value.pipelineReal) || 0,
      TANGGAL: manualForm.value.pipelineDate || tanggalInput.value
    };
  } else if (inputType.value === 'rmft_ach') {
    if (!manualForm.value.achRMFT) return alert('Nama RMFT wajib diisi!');
    row = {
      NAMA_RMFT: manualForm.value.achRMFT,
      AVG_TAB: Number(manualForm.value.achAvgTab) || 0,
      posisi_tab: Number(manualForm.value.achPosTab) || 0,
      AVG_GIRO: Number(manualForm.value.achAvgGiro) || 0,
      AVG_DPK: Number(manualForm.value.achAvgDpk) || 0,
      TOTAL: Number(manualForm.value.achTotal) || 0,
      BULAN: tanggalInput.value.substring(0, 7),
      TANGGAL: tanggalInput.value
    };
  } else if (inputType.value === 'nasabah') {
    if (!manualForm.value.nasabahNama) return alert('Nama Nasabah wajib diisi!');
    const vol = Number(manualForm.value.nasabahVolume) || 0;
    const defaultPct = vol / 1000;
    const pct = manualForm.value.nasabahPersen !== null && manualForm.value.nasabahPersen !== ''
      ? Number(manualForm.value.nasabahPersen)
      : defaultPct;
    row = {
      Nama_Nasabah: manualForm.value.nasabahNama,
      Jenis_Usaha: manualForm.value.nasabahUsaha || '',
      Omset: Number(manualForm.value.nasabahOmset) || 0,
      Produk_BRI: manualForm.value.nasabahProduk.toUpperCase(),
      Volume: vol,
      Presentase: pct
    };
  }

  parsedData.value.push(row);
  resetManualForm();
};


// --- DATA CONTOH & STRUKTUR STATIC ---
const rmftAchFormat = ref('terbaru'); // 'terbaru' | 'dasar'

const sampleDataStatic = {
  pegawai: {
    title: 'Dana RMFT',
    columns: ['PN - Nama', 'Saldo Giro', 'Saldo Tabungan', 'Saldo Deposito'],
    raw: `9012345 - Budi Santoso	150.000.000	250.000.000	500.000.000
9012346 - Siti Aminah	75.000.000	120.000.000	0
9012347 - Andi Wijaya	0	450.000.000	1.000.000.000`,
    desc: 'Pastikan 3 kolom terakhir adalah nilai Saldo Giro, Tabungan, dan Deposito secara berurutan. Format PN - Nama bisa dalam satu kolom (menggunakan tanda minus) atau dipisah dalam dua kolom.'
  },
  uker: {
    title: 'Unit Kerja',
    columns: ['Kode Uker - Nama Uker', 'Nilai Saldo'],
    raw: `0123 - KC Jakarta Central	50.000.000.000
4567 - KCP Mangga Dua	12.500.000.000
8901 - KCP Sudirman	8.750.000.000`,
    desc: 'Pilih jenis produk di dropdown kiri terlebih dahulu, kemudian paste kode & nama uker beserta nilai saldonya.'
  },
  keragaan: {
    title: 'Keragaan',
    columns: ['Nama Produk', 'Nilai Pencapaian'],
    raw: `TOTAL DANA	125.400.000.000
GIRO	45.200.000.000
TAB	60.100.000.000
DEP	20.100.000.000
SALES VOLUME QRIS	1.250.000.000`,
    desc: 'Nama produk harus sesuai dengan daftar produk sistem (misal: TOTAL DANA, GIRO, TAB, DEP, SALES VOLUME QRIS, dll).'
  },
  rka: {
    title: 'RKA',
    columns: ['Nama Produk', 'Target RKA'],
    raw: `TOTAL DANA	130.000.000.000
GIRO	50.000.000.000
TAB	65.000.000.000
DEP	15.000.000.000`,
    desc: 'Nama produk harus sesuai dengan daftar produk sistem (misal: TOTAL DANA, GIRO, TAB, DEP, dll).'
  },
  pipeline: {
    title: 'Pipeline',
    columns: ['RMFT', 'Nama Nasabah', 'Nominal Pipeline', 'Tanggal (DD/MM/YYYY)', 'Jenis', 'Nominal Realisasi'],
    raw: `Budi Santoso	PT Selalu Jaya	150.000.000	09/06/2026	Giro	120.000.000
Siti Aminah	PT Sukses Abadi	250.000.000	10/06/2026	Tabungan	200.000.000
Andi Wijaya	UD Makmur	50.000.000	11/06/2026	Deposito	50.000.000`,
    desc: 'Sistem mendeteksi format secara dinamis dengan melacak kolom tanggal. Bisa menggunakan format Tanggal di kolom 3 atau 4.'
  },
  nasabah: {
    title: 'Nasabah Pareto',
    columns: ['Nama Nasabah', 'Jenis Usaha', 'Omset', 'Produk BRI', 'Volume', 'Presentase'],
    raw: `Jawa Pos	Koran	100000000000	TAB	65000	65%
Lunic	Sawit	100000000000	TAB	43000	43%
Ladang	E Commerce	100000000000	TAB	50000	50%`,
    desc: 'Paste data nasabah prioritas. Kolom: Nama Nasabah | Jenis Usaha | Omset (angka) | Produk BRI | Volume (angka) | Presentase (%, angka/persen). Data ini bersifat STATIS (tidak ada kolom tanggal).'
  }
};

// --- DATA CONTOH AKTIF (COMPUTED DYNAMIC) ---
const activeSample = computed(() => {
  if (inputType.value === 'rmft_ach') {
    if (rmftAchFormat.value === 'terbaru') {
      return {
        title: 'Achievement RMFT (Format Terbaru)',
        columns: ['RMFT', 'AVG TAB', 'POSISI TAB', 'AVG GIRO', 'AVG DPK', 'EDC/QRIS', 'PAYROLL', 'CASA ME', 'SV EDC', 'USER ACTIV B', 'USER ACTIV QLOLA', 'PH PROGRAM', 'TOTAL'],
        raw: `RMFT	AVG TAB	POSISI TAB	AVG GIRO	AVG DPK	EDC/QRIS	PAYROLL	CASA ME	SV EDC	USER ACTIV B	USER ACTIV QLOLA	PH PROGRAM	TOTAL
Budi Santoso	85%	90%	75%	80%	70%	95%	85%	90%	65%	60%	80%	82%
Siti Aminah	90%	95%	80%	88%	75%	90%	80%	85%	70%	65%	85%	85%`,
        desc: 'Achievement RMFT menggunakan FORMAT TERBARU. Pastikan baris header disertakan agar pemetaan kolom terdeteksi secara dinamis oleh parser.'
      };
    } else {
      return {
        title: 'Achievement RMFT (Format Dasar)',
        columns: ['RMFT', 'AVG TAB', 'AVG GIRO', 'AVG DPK', 'FBI PA', 'EDC/QRIS', 'DPK MERCH', 'SV', 'PAYROLL', 'QLOLA', 'KANWIL', 'SGF', 'TOTAL'],
        raw: `RMFT	AVG TAB	AVG GIRO	AVG DPK	FBI PA	EDC/QRIS	DPK MERCH	SV	PAYROLL	QLOLA	KANWIL	SGF	TOTAL
Budi Santoso	85%	75%	80%	90%	70%	65%	85%	95%	60%	80%	75%	78%
Siti Aminah	90%	80%	88%	85%	75%	70%	80%	90%	65%	85%	80%	82%`,
        desc: 'Achievement RMFT menggunakan FORMAT DASAR (Lama). Pastikan baris header disertakan agar pemetaan kolom terdeteksi secara dinamis oleh parser.'
      };
    }
  }
  return sampleDataStatic[inputType.value] || {};
});

const isCopied = ref(false);

const loadSample = () => {
  const sample = activeSample.value;
  if (sample) {
    rawPaste.value = sample.raw;
    inputMode.value = 'paste';
    handlePaste();
  }
};

const copySample = async () => {
  const sample = activeSample.value;
  if (sample) {
    // Auto-fill dan auto-parse langsung ke paste zone (bisa dipakai offline/HTTP)
    rawPaste.value = sample.raw;
    inputMode.value = 'paste';
    handlePaste();
    
    // Copy ke clipboard fisik
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(sample.raw);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = sample.raw;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    } catch (err) {
      console.warn('Clipboard copy failed: ', err);
      // Tetap set true karena data sudah terisi otomatis di zone
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    }
  }
};

const apiUrl = import.meta.env.VITE_API_URL;

const validationErrors = computed(() => {
  const errors = [];
  if (!parsedData.value || parsedData.value.length === 0) return errors;

  parsedData.value.forEach((row, index) => {
    const rowNum = index + 1;
    if (inputType.value === 'pegawai') {
      if (!row.pn || String(row.pn).trim() === '') errors.push(`Baris ${rowNum}: PN Pegawai kosong.`);
      if (!row.nama || String(row.nama).trim() === '') errors.push(`Baris ${rowNum}: Nama Pegawai kosong.`);
    } else if (inputType.value === 'uker') {
      if (!row.unit || String(row.unit).trim() === '') errors.push(`Baris ${rowNum}: Kode Unit Kerja kosong.`);
      if (!row.nama || String(row.nama).trim() === '' || row.nama === 'Unit Kerja') errors.push(`Baris ${rowNum}: Nama Unit Kerja tidak valid.`);
    } else if (inputType.value === 'keragaan' || inputType.value === 'rka') {
      if (!row.produk || String(row.produk).trim() === '') errors.push(`Baris ${rowNum}: Produk kosong.`);
    } else if (inputType.value === 'pipeline') {
      if (!row.NAMA_RMFT || String(row.NAMA_RMFT).trim() === '' || row.NAMA_RMFT === 'Unknown RMFT') {
        errors.push(`Baris ${rowNum}: Nama RMFT tidak valid.`);
      }
      if (!row.TANGGAL || String(row.TANGGAL).trim() === '') {
        errors.push(`Baris ${rowNum}: Tanggal target pipeline kosong atau format tanggal tidak terdeteksi.`);
      }
    } else if (inputType.value === 'rmft_ach') {
      if (!row.NAMA_RMFT || String(row.NAMA_RMFT).trim() === '' || row.NAMA_RMFT === 'Unknown RMFT') {
        errors.push(`Baris ${rowNum}: Nama RMFT tidak valid.`);
      }
    } else if (inputType.value === 'nasabah') {
      if (!row.Nama_Nasabah || String(row.Nama_Nasabah).trim() === '') {
        errors.push(`Baris ${rowNum}: Nama Nasabah kosong.`);
      }
    }
  });
  return errors;
}); 

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
  { id: 'rmft_ach', l: 'Achievement RMFT', icon: Target },
  { id: 'nasabah', l: 'Nasabah Pareto', icon: Sparkles }
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
  let cleaned = val.toString().replace(/[^0-9.,%\-]/g, '').trim();
  cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.').replace(/%/g, '').trim();
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
        if (headerCols.length === 1) {
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
      if (rmftMap.rmft === undefined && Object.keys(rmftMap).length > 0) {
        rmftMap.rmft = 0;
      }
      activeVersion.value = isNewVersion ? 'new' : 'old';
    }

    rows.forEach(row => {
      const text = row.trim();
      const upText = text.toUpperCase();
      if (text === '' || upText.includes('RMFT') || upText.includes('NASABAH') || upText.includes('KETERANGAN') || upText.includes('POSISI TAB') || upText.includes('AVG TAB')) return;
      let cols = text.split('\t'); 
      if (cols.length === 1) {
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

      } else if (inputType.value === 'nasabah') {
        if (cols.length >= 2) {
          result.push({
            Nama_Nasabah: cols[0]?.trim() || '',
            Jenis_Usaha: cols[1]?.trim() || '',
            Omset: cleanNum(cols[2]),
            Produk_BRI: (cols[3]?.trim() || 'TAB').toUpperCase(),
            Volume: cleanNum(cols[4]),
            Presentase: cols[5] ? cleanNum(cols[5]) : 0
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
      clearCache();
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
  <div class="p-6 md:p-10 pb-64 max-w-7xl mx-auto animate-in fade-in duration-500">
    
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
      <CustomSelect 
        v-model="inputType" 
        :options="menuTabs.map(m => ({ label: m.l, value: m.id }))" 
      />
    </div>

    <!-- Desktop Tabs -->
    <div class="hidden lg:flex flex-wrap gap-2 p-1.5 bg-white rounded-xl w-full lg:w-fit mb-8 border border-slate-200 shadow-sm">
      <button v-for="m in menuTabs" 
        :key="m.id" @click="inputType = m.id" 
        :class="inputType === m.id ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'"
        class="flex items-center px-4 py-2 rounded-lg font-semibold transition-all text-sm"
      >
        <component :is="m.icon" class="w-4 h-4 mr-2" />
        {{ m.l }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      <div class="lg:col-span-4 space-y-8">
        <div class="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <!-- Toggle Mode Input -->
          <div class="flex p-1 bg-slate-100 rounded-2xl gap-1 mb-6 border border-slate-200/50">
            <button
              type="button"
              @click="inputMode = 'paste'"
              :class="inputMode === 'paste' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'"
              class="flex-1 py-2.5 rounded-xl text-xs transition-all text-center uppercase tracking-wider font-semibold"
            >
              Smart Paste Excel
            </button>
            <button
              type="button"
              @click="inputMode = 'manual'"
              :class="inputMode === 'manual' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'"
              class="flex-1 py-2.5 rounded-xl text-xs transition-all text-center uppercase tracking-wider font-semibold"
            >
              Input Form Manual
            </button>
          </div>

          <div class="space-y-6">
            <div>
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"><Calendar class="w-4 h-4" /> Tanggal Data</label>
              <input type="date" v-model="tanggalInput" @change="handlePaste" class="w-full border border-slate-200 p-3 rounded-2xl bg-slate-50 font-bold text-sm focus:bg-white focus:border-blue-500 outline-none transition-all shadow-sm" />
            </div>

            <!-- SMART PASTE ZONE -->
            <div v-if="inputMode === 'paste'" class="space-y-5">
              <div v-if="inputType === 'uker'">
                <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"><ListChecks class="w-4 h-4" /> Pilih Produk Unit</label>
                <CustomSelect 
                  v-model="selectedProduct" 
                  @change="handlePaste"
                  :options="['Giro', 'Tabungan', 'Deposito']" 
                />
              </div>

              <div>
                <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"><FilePlus2 class="w-4 h-4" /> Excel Paste Zone</label>
                <textarea 
                  v-model="rawPaste" 
                  @input="handlePaste"
                  :placeholder="inputType === 'pegawai' ? 'Paste PN - Nama & Saldo...' : 'Copy dari Excel lalu Paste di sini...'" 
                  class="w-full h-80 p-4 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-mono text-xs transition-all leading-relaxed shadow-inner"
                ></textarea>
              </div>
            </div>

            <!-- MANUAL ENTRY FORM ZONE -->
            <div v-else class="space-y-4">
              
              <!-- Form Pegawai -->
              <div v-if="inputType === 'pegawai'" class="space-y-3">
                <input v-model="manualForm.pn" placeholder="PN Pegawai (misal: 9012345)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input v-model="manualForm.nama" placeholder="Nama Lengkap Pegawai" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.giro" placeholder="Saldo Giro (Rp)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.tab" placeholder="Saldo Tabungan (Rp)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.depo" placeholder="Saldo Deposito (Rp)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
              </div>

              <!-- Form Uker -->
              <div v-if="inputType === 'uker'" class="space-y-3">
                <CustomSelect
                  v-model="selectedProduct"
                  :options="['Giro', 'Tabungan', 'Deposito']"
                />
                <input v-model="manualForm.unit" placeholder="Kode Unit Kerja (misal: 0123)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input v-model="manualForm.ukerNama" placeholder="Nama Unit Kerja (misal: KC Central)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.ukerNilai" placeholder="Nilai Saldo (Rp)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
              </div>

              <!-- Form Keragaan & RKA -->
              <div v-if="inputType === 'keragaan' || inputType === 'rka'" class="space-y-3">
                <CustomSelect
                  v-model="manualForm.produk"
                  :options="fixedProducts"
                  searchable
                />
                <input type="number" v-model="manualForm.nilai" placeholder="Nilai Saldo / Target RKA" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
              </div>

              <!-- Form Pipeline -->
              <div v-if="inputType === 'pipeline'" class="space-y-3">
                <input v-model="manualForm.pipelineRMFT" placeholder="Nama RMFT" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input v-model="manualForm.pipelineNasabah" placeholder="Nama Calon Nasabah" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.pipelineNominal" placeholder="Nominal Potensi Pipeline (Rp)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <CustomSelect
                  v-model="manualForm.pipelineJenis"
                  :options="['Giro', 'Tabungan', 'Deposito']"
                />
                <input type="number" v-model="manualForm.pipelineReal" placeholder="Realisasi Nominal (Rp)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="date" v-model="manualForm.pipelineDate" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
              </div>

              <!-- Form Achievement RMFT -->
              <div v-if="inputType === 'rmft_ach'" class="space-y-3">
                <input v-model="manualForm.achRMFT" placeholder="Nama RMFT" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.achAvgTab" placeholder="AVG Tabungan (%)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.achPosTab" placeholder="Posisi Tabungan (%)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.achAvgGiro" placeholder="AVG Giro (%)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.achAvgDpk" placeholder="AVG DPK (%)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.achTotal" placeholder="Total Achievement (%)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
              </div>

              <!-- Form Nasabah Pareto -->
              <div v-if="inputType === 'nasabah'" class="space-y-3">
                <input v-model="manualForm.nasabahNama" placeholder="Nama Nasabah (wajib)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input v-model="manualForm.nasabahUsaha" placeholder="Jenis Usaha (misal: Koran)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.nasabahOmset" placeholder="Omset Usaha (Rp)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <CustomSelect
                  v-model="manualForm.nasabahProduk"
                  :options="['TAB', 'GIRO', 'DEP']"
                />
                <input type="number" v-model="manualForm.nasabahVolume" placeholder="Volume Tabungan (misal: 65000)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                <input type="number" v-model="manualForm.nasabahPersen" placeholder="Presentase (%, Kosongkan = Volume / 1000)" class="w-full border border-slate-200 p-3 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
              </div>

              <button
                type="button"
                @click="addManualRow"
                class="w-full py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 flex justify-center items-center gap-1.5"
              >
                <FilePlus2 class="w-4 h-4" /> Tambah ke Daftar Preview
              </button>
            </div>
          </div>
        </div>

        <!-- Panduan Struktur & Contoh Data -->
        <div class="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Info class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-black text-slate-700 text-sm tracking-tight uppercase">Panduan Struktur Kolom</h4>
              <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Format Data & Contoh Untuk {{ activeSample?.title }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Deskripsi -->
            <p class="text-xs text-slate-500 leading-relaxed">
              {{ activeSample?.desc }}
            </p>

            <!-- Format Toggle (Hanya untuk Achievement RMFT) -->
            <div v-if="inputType === 'rmft_ach'" class="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-2xl">
              <button 
                @click="rmftAchFormat = 'terbaru'"
                :class="rmftAchFormat === 'terbaru' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                class="flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all"
              >
                Format Terbaru
              </button>
              <button 
                @click="rmftAchFormat = 'dasar'"
                :class="rmftAchFormat === 'dasar' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                class="flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all"
              >
                Format Dasar
              </button>
            </div>

            <!-- Struktur Kolom Badges -->
            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Struktur Kolom Excel (Kiri ke Kanan):</label>
              <div class="flex flex-wrap gap-1.5">
                <span 
                  v-for="(col, index) in activeSample?.columns" 
                  :key="index"
                  class="px-2.5 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-[10px] font-bold text-blue-700"
                >
                  {{ col }}
                </span>
              </div>
            </div>

            <!-- Preview Copyable Box -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contoh Data Excel (Tinggal Copy-Paste):</label>
                <button 
                  @click="copySample" 
                  class="flex items-center gap-1 text-[9px] text-blue-600 font-black uppercase tracking-wider hover:text-blue-700 transition-colors"
                >
                  <component :is="isCopied ? Check : Copy" class="w-3 h-3" />
                  {{ isCopied ? 'Tersalin!' : 'Salin Contoh' }}
                </button>
              </div>
              <pre class="bg-slate-50 border border-slate-100 rounded-2xl p-4 font-mono text-[10px] text-slate-600 overflow-x-auto whitespace-pre leading-relaxed shadow-inner max-h-40">{{ activeSample?.raw }}</pre>
            </div>

            <!-- Load Button -->
            <button 
              @click="loadSample" 
              class="w-full py-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl text-[10px] font-black text-slate-600 hover:text-blue-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-sm active:scale-[0.98]"
            >
              <Sparkles class="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              Gunakan Data Contoh
            </button>
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
            <!-- Alert Warning Validasi Data -->
            <div v-if="validationErrors.length > 0" class="mb-6 p-6 bg-red-50 border-2 border-red-100 rounded-3xl space-y-3 animate-in fade-in duration-300">
              <div class="flex items-center gap-2.5 text-red-800">
                <AlertCircle class="w-5 h-5 shrink-0" />
                <h4 class="font-black text-xs uppercase tracking-wider">Terdeteksi {{ validationErrors.length }} Masalah Data</h4>
              </div>
              <ul class="list-disc pl-5 text-[10px] text-red-600 font-bold space-y-1.5 max-h-32 overflow-y-auto">
                <li v-for="(err, idx) in validationErrors.slice(0, 10)" :key="idx">{{ err }}</li>
                <li v-if="validationErrors.length > 10" class="italic text-red-400 mt-1">... dan {{ validationErrors.length - 10 }} baris bermasalah lainnya. Silakan periksa kembali spreadsheet Anda.</li>
              </ul>
            </div>

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
              :disabled="isSaving || parsedData.length === 0 || validationErrors.length > 0"
              :class="{ 'bg-rose-600 hover:bg-rose-700 shadow-rose-200': validationErrors.length > 0 && !isSaving }"
              class="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all disabled:bg-slate-300 disabled:shadow-none active:scale-95 flex flex-col items-center justify-center space-y-1 uppercase tracking-widest"
            >
              <template v-if="!isSaving">
                <template v-if="validationErrors.length > 0">
                  <span class="flex items-center gap-2 text-base"><AlertCircle class="w-5 h-5" /> PERBAIKI {{ validationErrors.length }} MASALAH DATA</span>
                  <span class="text-[9px] opacity-70 tracking-[0.2em]">TIDAK BISA MENGIRIM DATA CACAT</span>
                </template>
                <template v-else>
                  <span class="flex items-center gap-2 text-base"><Send class="w-5 h-5" /> KIRIM {{ parsedData.length }} DATA</span>
                  <span class="text-[9px] opacity-70 tracking-[0.2em]">UNTUK PERIODE {{ formatDateIndo(tanggalInput) }}</span>
                </template>
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