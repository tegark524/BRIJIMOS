<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Users, Building2, Activity, TrendingUp, Target, Search } from 'lucide-vue-next';

// --- STATE / VARIABEL UTAMA ---
const route = useRoute();
const router = useRouter();
const activeTab = ref(route.query.tab || 'pegawai'); 
watch(() => route.query.tab, (newTab) => {
  if (newTab) activeTab.value = newTab;
});

watch(activeTab, (newVal) => {
  if (route.query.tab !== newVal) {
    router.replace({ query: { ...route.query, tab: newVal } });
  }
});

const menuTabs = [
  { id: 'pegawai', l: 'Pegawai', icon: Users },
  { id: 'unit', l: 'Unit Kerja', icon: Building2 },
  { id: 'keragaan', l: 'Keragaan', icon: Activity },
  { id: 'pipeline', l: 'Pipeline', icon: TrendingUp },
  { id: 'rmft_ach', l: 'Achievement', icon: Target }
];

const selectedProduct = ref('Giro'); 
const selectedDateUnit = ref(''); 
const rawData = ref({ pegawai: [], unit: [], keragaan: [], rka: [], pipeline: [], rmft_ach: [] });
const searchQuery = ref('');
const selectedBaseline = ref('');
const selectedLatest = ref('');
const selectedMonthRmft = ref('');
const tableScale = ref(1); 
const isLoading = ref(false);

const apiUrl = import.meta.env.VITE_API_URL; 

const fixedKeragaanProducts = [
  "GIRO", 
  "TAB", 
  "DEP", 
  "CASA", 
  "TOTAL DANA", 
  "EDC MERCHANT", 
  "SALES VOLUME EDC", 
  "CASA MERCHANT", // Pastikan namanya sama dengan yang di-input
  "PRODUKTIVITAS EDC", 
  "USER QRIS", 
  "SALES VOLUME QRIS", 
  "QRIS PRODUKTIF", 
  "MAU QLOLA"
];

// --- HELPERS ---
const formatToLocalWIB = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  // Offset WIB = UTC+7 = +420 menit
  const wib = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  return `${wib.getUTCFullYear()}-${String(wib.getUTCMonth() + 1).padStart(2, '0')}-${String(wib.getUTCDate()).padStart(2, '0')}`;
};

const formatNum = (val) => (val === 0 || isNaN(val) ? '-' : val.toLocaleString('id-ID'));

const formatJuta = (val) => {
  const num = Number(val);
  if (num === 0 || isNaN(num)) return '-';
  return (num / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 });
};

const deltaClass = (val) => {
  if (val < 0) return 'text-red-600 font-medium';
  if (val > 0) return 'text-green-600 font-medium';
  return 'text-slate-800 font-medium';
};

const cellBgClass = (val, threshold = 0) => {
  if (val < threshold) return 'text-red-700 bg-red-50 font-medium';
  if (val > threshold) return 'text-green-700 bg-green-50 font-medium';
  return 'text-slate-800 bg-white font-medium';
};

// --- FETCH DATA ---
const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    rawData.value = { ...data, pipeline: data.pipeline || [], rmft_ach: data.rmft_ach || [] };
    
    // Set Default Dates
    const kDates = [...new Set(data.keragaan.map(item => formatToLocalWIB(item.Tanggal_Data)))].sort();
    if (kDates.length > 0) selectedDateUnit.value = kDates[kDates.length - 1];

    const pDates = [...new Set(data.pegawai.map(item => formatToLocalWIB(item.Tanggal_Data)))].sort();
    if (pDates.length > 0) {
      selectedBaseline.value = pDates[0];
      selectedLatest.value = pDates[pDates.length - 1];
    }

    const rmftMonths = [...new Set((data.rmft_ach || []).map(i => i.BULAN || i.bulan || '').filter(Boolean))].sort();
    if (rmftMonths.length > 0) {
      selectedMonthRmft.value = rmftMonths[rmftMonths.length - 1];
    }
  } catch (error) { 
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// --- LOGIKA DATA ---

const pegawaiComparison = computed(() => {
  const data = rawData.value.pegawai;
  if (!data.length) return [];
  const pns = [...new Set(data.map(i => i.PN))];
  return pns.map(pn => {
    const rows = data.filter(r => r.PN === pn);
    const latest = rows.find(r => formatToLocalWIB(r.Tanggal_Data) === selectedLatest.value) || {};
    const comp = rows.find(r => formatToLocalWIB(r.Tanggal_Data) === selectedBaseline.value) || {};
    const n = (o, k) => Number(o[k] || 0);
    return {
      pn, nama: latest.Nama_Pegawai || comp.Nama_Pegawai || "Unknown",
      c_g: n(comp, 'Kelolaan_Giro'), c_t: n(comp, 'Kelolaan_Tab'), c_d: n(comp, 'Kelolaan_Depo'),
      l_g: n(latest, 'Kelolaan_Giro'), l_t: n(latest, 'Kelolaan_Tab'), l_d: n(latest, 'Kelolaan_Depo'),
      d_g: n(latest, 'Kelolaan_Giro') - n(comp, 'Kelolaan_Giro'),
      d_t: n(latest, 'Kelolaan_Tab') - n(comp, 'Kelolaan_Tab'),
      d_d: n(latest, 'Kelolaan_Depo') - n(comp, 'Kelolaan_Depo'),
      total_c: n(comp, 'Kelolaan_Giro') + n(comp, 'Kelolaan_Tab') + n(comp, 'Kelolaan_Depo'),
      total_l: n(latest, 'Kelolaan_Giro') + n(latest, 'Kelolaan_Tab') + n(latest, 'Kelolaan_Depo')
    };
  }).filter(i => String(i.nama).toLowerCase().includes(String(searchQuery.value).toLowerCase()) || String(i.pn).includes(String(searchQuery.value)));
});

const unitAnalysis = computed(() => {
  const allUnitData = rawData.value.unit;
  if (!allUnitData.length || !selectedDateUnit.value) return [];
  const data = allUnitData.filter(i => i.Produk === selectedProduct.value);
  const units = [...new Set(data.map(i => i.Unit_KC))];
  const tglPilih = selectedDateUnit.value;
  const allDates = [...new Set(data.map(i => formatToLocalWIB(i.Tanggal_Data)))].sort();
  const idx = allDates.indexOf(tglPilih);
  const tglKemarin = idx > 0 ? allDates[idx - 1] : null;
  const bulanPilih = tglPilih.substring(0, 7);
  const tglAkhirBulanLalu = allDates.findLast(d => d < bulanPilih);
  const tglAkhirTahunLalu = allDates.findLast(d => d < tglPilih.substring(0, 4));

  return units.map(u => {
    const rows = data.filter(r => r.Unit_KC === u);
    const getVal = (d) => d ? Number(rows.find(r => formatToLocalWIB(r.Tanggal_Data) === d)?.Nilai || 0) : 0;
    const valPilih = getVal(tglPilih);
    return {
      u, nama: rows[0]?.Nama_Unit || "Unit Kerja", 
      tglKemarin, tglAkhirBulanLalu, tglAkhirTahunLalu,
      valPilih, valKemarin: getVal(tglKemarin), valBulanLalu: getVal(tglAkhirBulanLalu), valTahunLalu: getVal(tglAkhirTahunLalu),
      dtd: valPilih - getVal(tglKemarin), mtd: valPilih - getVal(tglAkhirBulanLalu), ytd: valPilih - getVal(tglAkhirTahunLalu)
    };
  });
});

const keragaanAnalysis = computed(() => {
  const realData = rawData.value.keragaan;
  const targetData = rawData.value.rka;
  if (!realData.length || !selectedDateUnit.value) return [];
  const tglPilih = selectedDateUnit.value;
  const bulanPilih = tglPilih.substring(0, 7);
  const allDates = [...new Set(realData.map(i => formatToLocalWIB(i.Tanggal_Data)))].sort();
  const tglAkhirBulanLalu = allDates.findLast(d => d < bulanPilih);
  const tglJan = allDates.find(d => d.includes('-01-'));

  return fixedKeragaanProducts.map(prod => {
    const rowsReal = realData.filter(r => r.Produk.toUpperCase() === prod.toUpperCase());
    let rowRka = targetData.find(r => formatToLocalWIB(r.Bulan_Tahun).substring(0, 7) === bulanPilih && r.Produk.toUpperCase() === prod.toUpperCase());
    if (!rowRka) {
      rowRka = [...targetData].filter(r => r.Produk.toUpperCase() === prod.toUpperCase()).sort((a,b) => new Date(b.Bulan_Tahun) - new Date(a.Bulan_Tahun))[0];
    }
    const getVal = (d) => d ? Number(rowsReal.find(r => formatToLocalWIB(r.Tanggal_Data) === d)?.Nilai || 0) : 0;
    const realSekarang = getVal(tglPilih);
    const rkaVal = Number(rowRka?.Nilai_RKA || 0);
    return {
      produk: prod, realSekarang, realJan: getVal(tglJan), rkaVal,
      pencPersen: rkaVal > 0 ? (realSekarang / rkaVal) * 100 : 0,
      pencRka: realSekarang - rkaVal,
      mtd: realSekarang - getVal(tglAkhirBulanLalu)
    };
  });
});

// --- PIPELINE ANALYSIS ---
const pipelineAnalysis = computed(() => {
  const data = rawData.value.pipeline || [];
  if (!data.length) return [];
  const q = String(searchQuery.value).toLowerCase();
  return data.filter(i => {
    const rmft = String(i.NAMA_RMFT || i.RMFT || '').toLowerCase();
    const nasabah = String(i.NAMA_NASABAH || i.Nasabah || i.NASABAH || '').toLowerCase();
    const ket = String(i.KETERANGAN || i.Ket || '').toLowerCase();
    return rmft.includes(q) || nasabah.includes(q) || ket.includes(q);
  });
});

const rmftPipelineSummary = computed(() => {
  const data = rawData.value.pipeline || [];
  const summary = {};
  data.forEach(i => {
    const rmft = String(i.NAMA_RMFT || i.RMFT || 'Unknown RMFT');
    const val = Number(i.PIPELINE || i.Pipeline || 0);
    if (!summary[rmft]) summary[rmft] = 0;
    summary[rmft] += val;
  });
  
  return Object.keys(summary).map(rmft => ({
    rmft,
    totalPipeline: summary[rmft]
  })).sort((a, b) => b.totalPipeline - a.totalPipeline).slice(0, 10);
});

// --- RMFT ACHIEVEMENT ANALYSIS ---
const achievementMonths = computed(() => {
  const data = rawData.value.rmft_ach || [];
  if (!data.length) return [];
  const months = data.map(i => String(i.BULAN || i.bulan || '')).filter(Boolean);
  return [...new Set(months)].sort().reverse();
});

const rmftAchievementAnalysis = computed(() => {
  const data = rawData.value.rmft_ach || [];
  if (!data.length) return [];
  const q = String(searchQuery.value).toLowerCase();
  const month = selectedMonthRmft.value;
  
  return data.filter(i => {
    const m = String(i.BULAN || i.bulan || '');
    if (month && m !== month) return false;
    const rmft = String(i.NAMA_RMFT || i.RMFT || i.rmft || i['Keterangan (Nama RMFT)'] || i.KETERANGAN || i.Keterangan || '').toLowerCase();
    return rmft.includes(q);
  });
});

// --- CHARTS LOGIC ---

// Tambah state ini di bagian atas (setelah deklarasi ref lainnya)
const selectedPegawaiProduct = ref('Giro');

const pegawaiChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 4 } },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: {
    categories: pegawaiComparison.value.slice(0, 10).map(i => i.nama.split(' ')[0]),
    labels: { style: { fontSize: '11px', colors: '#64748b' } }
  },
  yaxis: {
    labels: { style: { fontSize: '11px', colors: '#64748b' }, formatter: (v) => formatNum(v) }
  },
  colors: [
    '#64748b', // Abu tua untuk pembanding (Baseline)
    ({ dataPointIndex }) => {
      const item = pegawaiComparison.value[dataPointIndex];
      if (!item) return '#64748b';
      const map = {
        'Giro':     item.l_g - item.c_g,
        'Tabungan': item.l_t - item.c_t,
        'Deposito': item.l_d - item.c_d,
      };
      return map[selectedPegawaiProduct.value] >= 0 ? '#10b981' : '#2563eb'; // Hijau jika naik, Biru tua jika turun
    }
  ],
  legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px', markers: { radius: 12 } },
  tooltip: { y: { formatter: (v) => formatNum(v) } }
}));

const pegawaiChartSeries = computed(() => {
  const map = {
    'Giro':     { c: 'c_g', l: 'l_g' },
    'Tabungan': { c: 'c_t', l: 'l_t' },
    'Deposito': { c: 'c_d', l: 'l_d' },
  };
  const key = map[selectedPegawaiProduct.value];
  return [
    { name: 'Baseline', data: pegawaiComparison.value.slice(0, 10).map(i => i[key.c]) },
    { name: 'Latest',   data: pegawaiComparison.value.slice(0, 10).map(i => i[key.l]) }
  ];
});

const keragaanChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  plotOptions: { 
    bar: { 
      horizontal: true,
      barHeight: '50%', 
      borderRadius: 4 
    } 
  },
  dataLabels: { 
    enabled: true, 
    formatter: (v) => v.toFixed(1) + '%',
    style: { fontSize: '11px', colors: ['#ffffff'] }
  },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
  xaxis: { 
    categories: keragaanAnalysis.value.map(i => i.produk),
    labels: { 
      formatter: (v) => v + '%',
      style: { fontSize: '11px', colors: '#64748b' } 
    },
    max: 150
  },
  yaxis: {
    labels: { style: { fontSize: '11px', colors: '#64748b' } }
  },
  annotations: {
    xaxis: [{
      x: 100,
      borderColor: '#94a3b8',
      strokeDashArray: 4,
      borderWidth: 1,
      label: {
        text: 'TARGET (100%)',
        style: { color: '#64748b', background: '#f8fafc', fontSize: '10px', fontWeight: 500 }
      }
    }]
  },
  colors: [({ value }) => value >= 100 ? '#10b981' : '#2563eb'], // Hijau jika >= 100%, Biru tua jika di bawah
  legend: { show: false },
  tooltip: { 
    y: { formatter: (v) => v.toFixed(2) + '%' }
  }
}));

const keragaanChartSeries = computed(() => [
  { 
    name: 'Pencapaian RKA', 
    data: keragaanAnalysis.value.map(i => 
      i.rkaVal > 0 ? parseFloat((i.realSekarang / i.rkaVal * 100).toFixed(2)) : 0
    ) 
  }
]);

const selectedUnitProduct = ref('Giro');

const unitDates = computed(() => 
  [...new Set(rawData.value.unit
    .filter(i => i.Produk === selectedUnitProduct.value)
    .map(i => formatToLocalWIB(i.Tanggal_Data))
  )].sort()
);

const unitChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  plotOptions: { bar: { horizontal: true, barHeight: '50%', borderRadius: 4 } },
  dataLabels: { enabled: true, formatter: (v) => formatNum(v), style: { fontSize: '10px', colors: ['#ffffff'] } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
  xaxis: {
    categories: unitChartData.value.map(i => i.nama),
    labels: { formatter: (v) => formatNum(v), style: { fontSize: '11px', colors: '#64748b' } }
  },
  yaxis: {
    labels: { style: { fontSize: '11px', colors: '#64748b' } }
  },
  colors: [
    '#64748b', // Abu tua untuk pembanding (Baseline)
    ({ dataPointIndex }) => {
      const item = unitChartData.value[dataPointIndex];
      if (!item) return '#64748b';
      return item.latest >= item.baseline ? '#10b981' : '#2563eb'; // Hijau jika naik, Biru tua jika turun
    }
  ],
  legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px', markers: { radius: 12 } },
  tooltip: { y: { formatter: (v) => formatNum(v) } }
}));

const unitChartData = computed(() => {
  const data = rawData.value.unit.filter(i => i.Produk === selectedUnitProduct.value);
  const units = [...new Set(data.map(i => i.Unit_KC))];
  const baselineDate = unitDates.value[0];
  const latestDate = selectedDateUnit.value;

  return units.map(u => {
    const rows = data.filter(r => r.Unit_KC === u);
    const getVal = (d) => d ? Number(rows.find(r => formatToLocalWIB(r.Tanggal_Data) === d)?.Nilai || 0) : 0;
    return {
      unit: u,
      nama: rows[0]?.Nama_Unit || u,
      baseline: getVal(baselineDate),
      latest: getVal(latestDate),
    };
  }).sort((a, b) => b.latest - a.latest);
});

const unitChartSeries = computed(() => [
  { name: 'Baseline', data: unitChartData.value.map(i => i.baseline) },
  { name: 'Latest',   data: unitChartData.value.map(i => i.latest) }
]);

const pipelineChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  plotOptions: { bar: { horizontal: true, barHeight: '50%', borderRadius: 4 } },
  dataLabels: { enabled: true, formatter: (v) => formatJuta(v) + ' Jt', style: { fontSize: '11px', colors: ['#ffffff'] } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
  xaxis: {
    categories: rmftPipelineSummary.value.map(i => i.rmft),
    labels: { formatter: (v) => formatJuta(v), style: { fontSize: '11px', colors: '#64748b' } }
  },
  yaxis: { labels: { style: { fontSize: '11px', colors: '#64748b' } } },
  colors: ['#2563eb'], // Biru tua untuk default
  tooltip: { y: { formatter: (v) => formatJuta(v) + ' Jt' } }
}));

const pipelineChartSeries = computed(() => [
  { name: 'Total Pipeline', data: rmftPipelineSummary.value.map(i => i.totalPipeline) }
]);

// --- RMFT ACHIEVEMENT CHART OPTIONS ---
const rmftChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  plotOptions: { bar: { horizontal: true, barHeight: '50%', borderRadius: 4 } },
  dataLabels: { enabled: true, formatter: (v) => v.toFixed(1) + '%', style: { fontSize: '10px', colors: ['#ffffff'] } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
  xaxis: {
    categories: rmftAchievementAnalysis.value.map(i => i.NAMA_RMFT || i.RMFT || i.rmft || i['Keterangan (Nama RMFT)'] || i.KETERANGAN || i.Keterangan || '-'),
    labels: { formatter: (v) => v + '%', style: { fontSize: '11px', colors: '#64748b' } }
  },
  yaxis: { labels: { style: { fontSize: '11px', colors: '#64748b' } } },
  annotations: {
    xaxis: [{
      x: 100,
      borderColor: '#94a3b8',
      strokeDashArray: 4,
      borderWidth: 1,
      label: { text: 'TARGET (100%)', style: { color: '#64748b', background: '#f8fafc', fontSize: '10px', fontWeight: 500 } }
    }]
  },
  colors: [({ value }) => value >= 100 ? '#10b981' : '#2563eb'], // Hijau jika >= 100%, Biru tua jika di bawah
  tooltip: { y: { formatter: (v) => v.toFixed(2) + '%' } }
}));

const rmftChartSeries = computed(() => [
  { name: 'Total Pencapaian', data: rmftAchievementAnalysis.value.map(i => Number(i.TOTAL || i.total || 0)) }
]);

onMounted(fetchData);
</script>

<template>
  <div class="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-900 font-sans relative">
    
    <div v-if="isLoading" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <div class="w-20 h-20 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <h2 class="mt-4 text-xs font-black text-blue-900 uppercase tracking-[0.3em] animate-pulse">Menghubungkan Database...</h2>
    </div>

    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
      
      <!-- Mobile Dropdown Tabs -->
      <div class="block lg:hidden w-full relative">
        <select v-model="activeTab" class="w-full border border-slate-200 p-3.5 rounded-xl bg-white font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer shadow-sm">
          <option v-for="t in menuTabs" :key="t.id" :value="t.id">{{ t.l }}</option>
        </select>
        <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
      </div>

      <!-- Desktop Tabs -->
      <div class="hidden lg:flex p-1.5 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto w-full lg:w-auto gap-1">
        <button v-for="t in menuTabs" 
          :key="t.id" @click="activeTab = t.id"
          :class="activeTab === t.id ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm border border-indigo-100/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'"
          class="flex items-center px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap"
        >
          <component :is="t.icon" class="w-4 h-4 mr-2" :class="activeTab === t.id ? 'text-indigo-600' : 'text-slate-400'" />
          {{ t.l }}
        </button>
      </div>

      <div class="flex items-center space-x-4 bg-white p-3 px-5 rounded-2xl border shadow-sm border-slate-200 w-full lg:w-auto justify-between lg:justify-start">
        <span class="text-[10px] font-black uppercase text-slate-400">Ukuran Tabel: {{ Math.round(tableScale * 100) }}%</span>
        <input type="range" min="0.5" max="1.5" step="0.1" v-model="tableScale" class="w-32 accent-blue-600 cursor-pointer" />
      </div>
    </div>

    <div v-if="activeTab === 'pegawai'" class="animate-in fade-in duration-500 space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
  
  <!-- Toggle Produk -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
    <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
      Kelolaan {{ selectedPegawaiProduct }}: Baseline vs Posisi Saat Ini
    </h3>
    <div class="flex p-1 bg-slate-100 rounded-lg gap-1 w-full sm:w-auto">
      <button 
        v-for="p in ['Giro', 'Tabungan', 'Deposito']" :key="p"
        @click="selectedPegawaiProduct = p"
        :class="selectedPegawaiProduct === p 
          ? 'bg-white text-slate-800 shadow-sm font-semibold' 
          : 'text-slate-500 hover:text-slate-700'"
        class="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs transition-all"
      >
        {{ p }}
      </button>
    </div>
  </div>

  <!-- Chart -->
  <div class="w-full overflow-x-auto custom-scrollbar pb-2">
    <div class="min-w-[600px] lg:min-w-full">
      <apexchart 
        type="bar" 
        height="280" 
        :key="selectedBaseline + selectedLatest + selectedPegawaiProduct"
        :options="pegawaiChartOptions" 
        :series="pegawaiChartSeries"
      ></apexchart>
    </div>
  </div>

</div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-center">
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Parameter Analisis</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input v-model="searchQuery" placeholder="Cari Nama/PN..." class="w-full border border-slate-200 pl-10 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
          </div>
          <div class="space-y-3">
            <div>
              <span class="text-xs font-medium text-slate-500 mb-1 block">Pilih Baseline</span>
              <select v-model="selectedBaseline" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option v-for="d in [...new Set(rawData.pegawai.map(i => formatToLocalWIB(i.Tanggal_Data)))].sort()" :key="d">{{d}}</option>
              </select>
            </div>
            <div>
              <span class="text-xs font-medium text-slate-500 mb-1 block">Pilih Latest</span>
              <select v-model="selectedLatest" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option v-for="d in [...new Set(rawData.pegawai.map(i => formatToLocalWIB(i.Tanggal_Data)))].sort()" :key="d">{{d}}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto w-full scroll-custom">
          <div :style="{ transform: `scale(${tableScale})`, transformOrigin: 'top left', width: `${100/tableScale}%` }">
            <table class="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
              <thead class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th rowspan="2" class="p-4 border-b border-slate-200 w-64">Nama Pegawai / PN</th>
                  <th colspan="3" class="p-4 border-b border-slate-200 text-center">Baseline <span class="block text-[10px] font-normal text-slate-400 mt-1 lowercase capitalize">({{selectedBaseline}})</span></th>
                  <th colspan="3" class="p-4 border-b border-slate-200 text-center">Posisi Latest <span class="block text-[10px] font-normal text-slate-400 mt-1 lowercase capitalize">({{selectedLatest}})</span></th>
                  <th colspan="3" class="p-4 border-b border-slate-200 text-center bg-indigo-50/50 text-indigo-800">Delta Analysis</th>
                </tr>
                <tr class="bg-slate-50 text-[11px] text-slate-500">
                  <th class="p-3 border-b border-slate-200 text-right">Giro</th><th class="p-3 border-b border-slate-200 text-right">Tab</th><th class="p-3 border-b border-slate-200 text-right">Depo</th>
                  <th class="p-3 border-b border-slate-200 text-right">Giro</th><th class="p-3 border-b border-slate-200 text-right">Tab</th><th class="p-3 border-b border-slate-200 text-right">Depo</th>
                  <th class="p-3 border-b border-slate-200 text-right bg-indigo-50/30">Giro</th><th class="p-3 border-b border-slate-200 text-right bg-indigo-50/30">Tab</th><th class="p-3 border-b border-slate-200 text-right bg-indigo-50/30">Depo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in pegawaiComparison" :key="item.pn" class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <td class="p-4 font-medium text-slate-800">{{item.pn}} - {{item.nama}}</td>
                  <td class="p-3 text-right text-slate-500">{{formatNum(item.c_g)}}</td><td class="p-3 text-right text-slate-500">{{formatNum(item.c_t)}}</td><td class="p-3 text-right text-slate-500">{{formatNum(item.c_d)}}</td>
                  <td class="p-3 text-right font-medium text-slate-800">{{formatNum(item.l_g)}}</td><td class="p-3 text-right font-medium text-slate-800">{{formatNum(item.l_t)}}</td><td class="p-3 text-right font-medium text-slate-800">{{formatNum(item.l_d)}}</td>
                  <td class="p-3 text-right" :class="cellBgClass(item.d_g)">{{formatNum(item.d_g)}}</td>
                  <td class="p-3 text-right" :class="cellBgClass(item.d_t)">{{formatNum(item.d_t)}}</td>
                  <td class="p-3 text-right" :class="cellBgClass(item.d_d)">{{formatNum(item.d_d)}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'unit'" class="animate-in slide-in-from-bottom-2 duration-500 space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div class="flex flex-col gap-2">
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filter Produk</label>
            <button 
              v-for="p in ['Giro', 'Tabungan', 'Deposito']" :key="p" 
              @click="selectedUnitProduct = p; selectedProduct = p"
              :class="selectedUnitProduct === p ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'" 
              class="p-2.5 rounded-lg border font-medium transition-all text-sm"
            >
              {{p}}
            </button>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Tinjau Tanggal</label>
            <select v-model="selectedDateUnit" class="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all">
              <option v-for="d in [...new Set(rawData.unit.map(i => formatToLocalWIB(i.Tanggal_Data)))].sort().reverse()" :key="d" :value="d">{{d}}</option>
            </select>
          </div>
        </div>
        <div class="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
  
  <!-- Header + Toggle -->

  <!-- Chart -->
  <div class="w-full overflow-x-auto custom-scrollbar pb-2">
    <div class="min-w-[600px] lg:min-w-full">
      <apexchart
        type="bar"
        :height="Math.max(300, unitChartData.length * 45)"
        :key="selectedDateUnit + selectedUnitProduct"
        :options="unitChartOptions"
        :series="unitChartSeries"
      ></apexchart>
    </div>
  </div>

</div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto w-full scroll-custom">
          <div :style="{ transform: `scale(${tableScale})`, transformOrigin: 'top left', width: `${100/tableScale}%` }">
            <table class="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
              <thead class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th rowspan="2" class="p-4 border-b border-slate-200 w-72">Unit / Cabang Kerja</th>
                  <th colspan="4" class="p-4 border-b border-slate-200 text-center">Posisi Saldo Riil</th>
                  <th colspan="3" class="p-4 border-b border-slate-200 text-center bg-indigo-50/50 text-indigo-800">Analisis Delta <span class="block text-[10px] font-normal text-indigo-400 mt-1 capitalize">(DTD, MTD, YTD)</span></th>
                </tr>
                <tr class="bg-slate-50 text-[11px] text-slate-500">
                  <th class="p-3 border-b border-slate-200 text-right text-slate-700">Dipilih ({{selectedDateUnit}})</th>
                  <th class="p-3 border-b border-slate-200 text-right font-normal">H-1 ({{unitAnalysis[0]?.tglKemarin || '-'}})</th>
                  <th class="p-3 border-b border-slate-200 text-right font-normal">Bln-L ({{unitAnalysis[0]?.tglAkhirBulanLalu || '-'}})</th>
                  <th class="p-3 border-b border-slate-200 text-right font-normal">Thn-L ({{unitAnalysis[0]?.tglAkhirTahunLalu || '-'}})</th>
                  <th class="p-3 border-b border-slate-200 text-right bg-indigo-50/30 text-indigo-700">DTD</th>
                  <th class="p-3 border-b border-slate-200 text-right bg-indigo-50/30 text-indigo-700">MTD</th>
                  <th class="p-3 border-b border-slate-200 text-right bg-indigo-50/30 text-indigo-700">YTD</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in unitAnalysis" :key="item.u" class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <td class="p-4 font-medium text-slate-800">{{item.u}} - {{item.nama}}</td>
                  <td class="p-4 text-right font-semibold text-slate-800">{{formatNum(item.valPilih)}}</td>
                  <td class="p-4 text-right text-slate-500">{{formatNum(item.valKemarin)}}</td>
                  <td class="p-4 text-right text-slate-500">{{formatNum(item.valBulanLalu)}}</td>
                  <td class="p-4 text-right text-slate-500">{{formatNum(item.valTahunLalu)}}</td>
                  <td class="p-4 text-right" :class="cellBgClass(item.dtd)">{{item.dtd > 0 ? '+' : ''}}{{formatNum(item.dtd)}}</td>
                  <td class="p-4 text-right" :class="cellBgClass(item.mtd)">{{item.mtd > 0 ? '+' : ''}}{{formatNum(item.mtd)}}</td>
                  <td class="p-4 text-right" :class="cellBgClass(item.ytd)">{{item.ytd > 0 ? '+' : ''}}{{formatNum(item.ytd)}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB KERAGAAN -->
    <div v-else-if="activeTab === 'keragaan'" class="animate-in fade-in duration-500 space-y-6">
       <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">Analisis Visual: Realisasi Saat Ini vs Target RKA</h3>
             <div class="w-full overflow-x-auto custom-scrollbar pb-2">
               <div class="min-w-[600px] lg:min-w-full">
                 <apexchart type="bar" height="300" :key="selectedDateUnit" :options="keragaanChartOptions" :series="keragaanChartSeries"></apexchart>
               </div>
             </div>
          </div>
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center text-center">
             <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Pilih Hari Tinjauan</label>
             <select v-model="selectedDateUnit" class="w-full border border-slate-200 p-4 rounded-xl bg-slate-50 font-semibold text-lg text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all text-center cursor-pointer">
               <option v-for="d in [...new Set(rawData.keragaan.map(i => formatToLocalWIB(i.Tanggal_Data)))].sort().reverse()" :key="d" :value="d">{{d}}</option>
             </select>
          </div>
       </div>

       <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div class="overflow-x-auto w-full scroll-custom">
            <div :style="{ transform: `scale(${tableScale})`, transformOrigin: 'top left', width: `${100/tableScale}%` }">
              <table class="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
                <thead class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider">
                  <tr>
                    <th class="p-4 border-b border-slate-200 w-12 text-center">NO</th>
                    <th class="p-4 border-b border-slate-200 w-56">PRODUK KERAGAAN</th>
                    <th class="p-4 border-b border-slate-200 text-right">Posisi {{ selectedDateUnit }}</th>
                    <th class="p-4 border-b border-slate-200 text-right text-slate-500">Target RKA</th>
                    <th class="p-4 border-b border-slate-200 text-center">Penc (%)</th>
                    <th class="p-4 border-b border-slate-200 text-right">Penc RKA</th>
                    <th class="p-4 border-b border-slate-200 text-right bg-indigo-50/50 text-indigo-700">MTD (Growth)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in keragaanAnalysis" :key="item.produk" class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                    <td class="p-4 text-center text-slate-400">{{ idx + 1 }}</td>
                    <td class="p-4 font-semibold text-slate-800">{{ item.produk }}</td>
                    <td class="p-4 text-right font-semibold text-slate-800">{{ formatNum(item.realSekarang) }}</td>
                    <td class="p-4 text-right text-slate-500">{{ formatNum(item.rkaVal) }}</td>
                    <td class="p-4 text-center" :class="cellBgClass(item.pencPersen, 100)">{{ item.pencPersen.toFixed(1) }}%</td>
                    <td class="p-4 text-right" :class="cellBgClass(item.pencRka)">{{ item.pencRka > 0 ? '+' : '' }}{{ formatNum(item.pencRka) }}</td>
                    <td class="p-4 text-right" :class="cellBgClass(item.mtd)">{{ item.mtd > 0 ? '+' : '' }}{{ formatNum(item.mtd) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
         </div>
       </div>
    </div>

    <!-- TAB PIPELINE -->
    <div v-else-if="activeTab === 'pipeline'" class="animate-in fade-in duration-500 space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Top 10 RMFT - Total Pipeline (Juta)</h3>
          <div class="w-full overflow-x-auto custom-scrollbar pb-2">
            <div class="min-w-[600px] lg:min-w-full">
              <apexchart type="bar" height="300" :options="pipelineChartOptions" :series="pipelineChartSeries"></apexchart>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-4">
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Pencarian Data</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input v-model="searchQuery" placeholder="Cari RMFT, Nasabah, Keterangan..." class="w-full border border-slate-200 pl-10 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto w-full scroll-custom">
          <div :style="{ transform: `scale(${tableScale})`, transformOrigin: 'top left', width: `${100/tableScale}%` }">
            <table class="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
              <thead class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th class="p-4 border-b border-slate-200 w-64">RMFT & Nasabah</th>
                  <th class="p-4 border-b border-slate-200 text-right">Pipeline (Jt)</th>
                  <th class="p-4 border-b border-slate-200 text-right">Realisasi (Jt)</th>
                  <th class="p-4 border-b border-slate-200 text-center">Tanggal Target</th>
                  <th class="p-4 border-b border-slate-200">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in pipelineAnalysis" :key="idx" class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <td class="p-4">
                    <div class="font-medium text-slate-800">{{ item.NAMA_RMFT || item.RMFT || '-' }}</div>
                    <div class="text-[11px] text-slate-500 mt-1">{{ item.NAMA_NASABAH || item.Nasabah || item.NASABAH || '-' }}</div>
                  </td>
                  <td class="p-4 text-right font-semibold text-indigo-600">{{ formatJuta(item.PIPELINE || item.Pipeline || item.pipeline || 0) }}</td>
                  <td class="p-4 text-right font-semibold text-blue-600">{{ formatJuta(item.REALISASI || item.Nominal || item.NOMINAL || item.nominal || 0) }}</td>
                  <td class="p-4 text-center text-slate-500">{{ formatToLocalWIB(item.TANGGAL_TARGET || item.Tanggal || item.TANGGAL || '') }}</td>
                  <td class="p-4 text-slate-500 max-w-xs truncate" :title="item.KETERANGAN || item.Ket || item.KETERANGAN">{{ item.KETERANGAN || item.Ket || item.KETERANGAN || '-' }}</td>
                </tr>
                <tr v-if="!pipelineAnalysis.length">
                  <td colspan="5" class="p-8 text-center text-slate-500 font-medium">Tidak ada data Pipeline ditemukan.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB RMFT -->
    <div v-else-if="activeTab === 'rmft_ach'" class="animate-in fade-in duration-500 space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div class="flex flex-col gap-2">
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filter Bulan</label>
            <select v-model="selectedMonthRmft" class="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer">
              <option v-for="m in achievementMonths" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Pencarian RMFT</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input v-model="searchQuery" placeholder="Cari Nama RMFT..." class="w-full border border-slate-200 pl-10 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
            </div>
          </div>
        </div>
        <div class="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Persentase Total Pencapaian RMFT</h3>
          <div class="w-full overflow-x-auto custom-scrollbar pb-2">
            <div class="min-w-[600px] lg:min-w-full">
              <apexchart type="bar" :height="Math.max(300, rmftAchievementAnalysis.length * 45)" :key="selectedMonthRmft" :options="rmftChartOptions" :series="rmftChartSeries"></apexchart>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto w-full scroll-custom max-h-[600px]">
          <div :style="{ transform: `scale(${tableScale})`, transformOrigin: 'top left', width: `${100/tableScale}%` }">
            <table class="w-full text-left text-sm whitespace-nowrap min-w-[1200px]">
              <thead class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider sticky top-0 z-10">
                <tr>
                  <th class="p-4 border-b border-slate-200 w-56 bg-slate-100 shadow-[0_1px_0_#e2e8f0]">Keterangan (Nama RMFT)</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">AVG TAB</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">AVG GIRO</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">AVG DPK</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">FBI PA non PA</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">EDC Qris Prod</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">DPK merchant</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">SV</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">New payroll</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">Prod Qlola</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">progam kanwil</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">Progam SGF</th>
                  <th class="p-4 border-b border-slate-200 text-right bg-indigo-50/50 shadow-[0_1px_0_#e2e8f0] text-indigo-800">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in rmftAchievementAnalysis" :key="idx" class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <td class="p-4 font-medium text-slate-800">{{ item.NAMA_RMFT || item.RMFT || item.rmft || item['Keterangan (Nama RMFT)'] || item.KETERANGAN || item.Keterangan || '-' }}</td>
                  <td class="p-4 text-right text-slate-600">{{ item.AVG_TAB || item.avg_tab || 0 }}%</td>
                  <td class="p-4 text-right text-slate-600">{{ item.AVG_GIRO || item.avg_giro || 0 }}%</td>
                  <td class="p-4 text-right text-slate-600">{{ item.AVG_DPK || item.avg_dpk || 0 }}%</td>
                  <td class="p-4 text-right text-slate-600">{{ item.FBI_PA || item.fbi_pa || 0 }}%</td>
                  <td class="p-4 text-right text-slate-600">{{ item.EDC_QRIS || item.edc_qris || 0 }}%</td>
                  <td class="p-4 text-right text-slate-600">{{ item.DPK_MERCHANT || item.dpk_merchant || 0 }}%</td>
                  <td class="p-4 text-right text-slate-600">{{ item.SV || item.sv || 0 }}%</td>
                  <td class="p-4 text-right text-slate-600">{{ item.NEW_PAYROLL || item.new_payroll || 0 }}%</td>
                  <td class="p-4 text-right text-slate-600">{{ item.PROD_QLOLA || item.prod_qlola || 0 }}%</td>
                  <td class="p-4 text-right text-slate-600">{{ item.PROG_KANWIL || item.prog_kanwil || 0 }}%</td>
                  <td class="p-4 text-right text-slate-600">{{ item.PROG_SGF || item.prog_sgf || 0 }}%</td>
                  <td class="p-4 text-right font-semibold text-indigo-700 bg-indigo-50/30">{{ item.TOTAL || item.total || 0 }}%</td>
                </tr>
                <tr v-if="!rmftAchievementAnalysis.length">
                  <td colspan="13" class="p-8 text-center text-slate-500 font-medium">Tidak ada data Pencapaian RMFT ditemukan pada bulan ini.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.scroll-custom::-webkit-scrollbar { height: 8px; width: 8px; }
.scroll-custom::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
.scroll-custom::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.scroll-custom::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>