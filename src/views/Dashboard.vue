<script setup>
import { onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Users, Building2, Activity, TrendingUp, Target, Search, Calendar, ArrowUp, ArrowDown, ArrowUpDown, RefreshCw, Star } from 'lucide-vue-next';
import { store, fetchData as storeFetchData } from '../store';
import CustomSelect from '../components/CustomSelect.vue';

// --- STATE / VARIABEL UTAMA ---
const route = useRoute();
const router = useRouter();

const activeTab = computed({
  get: () => store.dashboard.activeTab,
  set: (val) => { store.dashboard.activeTab = val; }
});
const selectedProduct = computed({
  get: () => store.dashboard.selectedProduct,
  set: (val) => { store.dashboard.selectedProduct = val; }
});
const selectedDateUnit = computed({
  get: () => store.dashboard.selectedDateUnit,
  set: (val) => { store.dashboard.selectedDateUnit = val; }
});
const selectedBaselineUnit = computed({
  get: () => store.dashboard.selectedBaselineUnit,
  set: (val) => { store.dashboard.selectedBaselineUnit = val; }
});
const searchQuery = computed({
  get: () => store.dashboard.searchQuery,
  set: (val) => { store.dashboard.searchQuery = val; }
});
const selectedBaseline = computed({
  get: () => store.dashboard.selectedBaseline,
  set: (val) => { store.dashboard.selectedBaseline = val; }
});
const selectedLatest = computed({
  get: () => store.dashboard.selectedLatest,
  set: (val) => { store.dashboard.selectedLatest = val; }
});
const selectedMonthRmft = computed({
  get: () => store.dashboard.selectedMonthRmft,
  set: (val) => { store.dashboard.selectedMonthRmft = val; }
});
const tableScale = computed({
  get: () => store.dashboard.tableScale,
  set: (val) => { store.dashboard.tableScale = val; }
});
const selectedPegawaiProduct = computed({
  get: () => store.dashboard.selectedPegawaiProduct,
  set: (val) => { store.dashboard.selectedPegawaiProduct = val; }
});
const selectedUnitProduct = computed({
  get: () => store.dashboard.selectedUnitProduct,
  set: (val) => { store.dashboard.selectedUnitProduct = val; }
});
const pipelineSelectedMonth = computed({
  get: () => store.dashboard.pipelineSelectedMonth,
  set: (val) => { store.dashboard.pipelineSelectedMonth = val; }
});
const pipelineSortOrder = computed({
  get: () => store.dashboard.pipelineSortOrder,
  set: (val) => { store.dashboard.pipelineSortOrder = val; }
});

const rawData = computed(() => store.rawData);
const isLoading = computed(() => store.isLoading);

if (route.query.tab) {
  store.dashboard.activeTab = route.query.tab;
}

watch(() => route.query.tab, (newTab) => {
  if (newTab) store.dashboard.activeTab = newTab;
});

watch(activeTab, (newVal) => {
  if (newVal === 'nasabah') {
    router.push('/nasabah');
    // Kembalikan tab terpilih ke nilai lama agar tidak tertahan di 'nasabah' saat back/kembali
    activeTab.value = route.query.tab || 'pegawai';
  } else if (route.query.tab !== newVal) {
    router.replace({ query: { ...route.query, tab: newVal } });
  }
});


const menuTabs = [
  { id: 'pegawai', l: 'Dana RMFT', icon: Users },
  { id: 'unit', l: 'Unit Kerja', icon: Building2 },
  { id: 'keragaan', l: 'Keragaan', icon: Activity },
  { id: 'pipeline', l: 'Pipeline', icon: TrendingUp },
  { id: 'rmft_ach', l: 'Achievement', icon: Target }
];

const fixedKeragaanProducts = [
  "GIRO", 
  "TAB", 
  "DEP", 
  "CASA", 
  "TOTAL DANA", 
  "EDC MERCHANT", 
  "SALES VOLUME EDC", 
  "CASA MERCHANT", 
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
  const wib = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  return `${wib.getUTCFullYear()}-${String(wib.getUTCMonth() + 1).padStart(2, '0')}-${String(wib.getUTCDate()).padStart(2, '0')}`;
};

const formatNum = (val) => (val === 0 || isNaN(val) ? '-' : val.toLocaleString('id-ID'));

const formatPercent = (val) => {
  if (val === undefined || val === null || val === '') return '-';
  return val + '%';
};

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

// --- SET DEFAULT FILTERS ---
const setDefaultFilters = () => {
  const data = store.rawData;
  if (!data) return;

  if (data.keragaan && data.keragaan.length > 0) {
    const kDates = [...new Set(data.keragaan.map(item => formatToLocalWIB(item.Tanggal_Data)))].sort();
    if (kDates.length > 0 && !store.dashboard.selectedDateUnit) {
      store.dashboard.selectedDateUnit = kDates[kDates.length - 1];
    }
  }

  if (data.unit && data.unit.length > 0) {
    const uDates = [...new Set(data.unit.map(item => formatToLocalWIB(item.Tanggal_Data)))].sort();
    if (uDates.length > 0 && !store.dashboard.selectedBaselineUnit) {
      store.dashboard.selectedBaselineUnit = uDates[0];
    }
  }

  if (data.pegawai && data.pegawai.length > 0) {
    const pDates = [...new Set(data.pegawai.map(item => formatToLocalWIB(item.Tanggal_Data)))].sort();
    if (pDates.length > 0) {
      if (!store.dashboard.selectedBaseline) {
        store.dashboard.selectedBaseline = pDates[0];
      }
      if (!store.dashboard.selectedLatest) {
        store.dashboard.selectedLatest = pDates[pDates.length - 1];
      }
    }
  }

  if (data.rmft_ach && data.rmft_ach.length > 0) {
    const rmftMonths = [...new Set(data.rmft_ach.map(i => i.BULAN || i.bulan || '').filter(Boolean))].sort();
    if (rmftMonths.length > 0 && !store.dashboard.selectedMonthRmft) {
      store.dashboard.selectedMonthRmft = rmftMonths[rmftMonths.length - 1];
    }
  }
};

// --- FETCH DATA ---
const fetchData = async (forceRefresh = false) => {
  if (forceRefresh) {
    store.dashboard.selectedDateUnit = '';
    store.dashboard.selectedBaselineUnit = '';
    store.dashboard.selectedBaseline = '';
    store.dashboard.selectedLatest = '';
    store.dashboard.selectedMonthRmft = '';
  }
  try {
    await storeFetchData(forceRefresh);
    setDefaultFilters();
  } catch (error) {
    console.error(error);
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

const togglePipelineSort = () => {
  if (pipelineSortOrder.value === 'default') pipelineSortOrder.value = 'asc';
  else if (pipelineSortOrder.value === 'asc') pipelineSortOrder.value = 'desc';
  else pipelineSortOrder.value = 'default';
};

const pipelineMonths = computed(() => {
  const data = rawData.value.pipeline || [];
  if (!data.length) return [];
  const months = data.map(i => {
    const d = i.TANGGAL_TARGET || i.Tanggal || i.TANGGAL || '';
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return formatToLocalWIB(d).substring(0, 7);
  }).filter(Boolean);
  return [...new Set(months)].sort().reverse();
});

const pipelineAnalysis = computed(() => {
  let data = rawData.value.pipeline || [];
  if (!data.length) return [];
  const q = String(searchQuery.value).toLowerCase();
  const month = pipelineSelectedMonth.value;

  let filtered = data.filter(i => {
    const rmft = String(i.NAMA_RMFT || i.RMFT || '').toLowerCase();
    const nasabah = String(i.NAMA_NASABAH || i.Nasabah || i.NASABAH || '').toLowerCase();
    const ket = String(i.KETERANGAN || i.Ket || '').toLowerCase();
    const matchQ = rmft.includes(q) || nasabah.includes(q) || ket.includes(q);

    let matchMonth = true;
    if (month) {
      const d = i.TANGGAL_TARGET || i.Tanggal || i.TANGGAL || '';
      const localD = formatToLocalWIB(d).substring(0, 7);
      matchMonth = (localD === month);
    }
    return matchQ && matchMonth;
  });

  if (pipelineSortOrder.value === 'asc' || pipelineSortOrder.value === 'desc') {
    filtered.sort((a, b) => {
      const da = new Date(a.TANGGAL_TARGET || a.Tanggal || a.TANGGAL || 0).getTime();
      const db = new Date(b.TANGGAL_TARGET || b.Tanggal || b.TANGGAL || 0).getTime();
      return pipelineSortOrder.value === 'asc' ? da - db : db - da;
    });
  } else {
    filtered.sort((a, b) => {
      const rmftA = String(a.NAMA_RMFT || a.RMFT || '');
      const rmftB = String(b.NAMA_RMFT || b.RMFT || '');
      return rmftA.localeCompare(rmftB);
    });
  }

  return filtered;
});

const rmftPipelineSummary = computed(() => {
  const data = rawData.value.pipeline || [];
  const summary = {};
  data.forEach(i => {
    const rmft = String(i.NAMA_RMFT || i.RMFT || 'Unknown RMFT');
    const valPipeline = Number(i.PIPELINE || i.Pipeline || i.pipeline || 0);
    const valRealisasi = Number(i.REALISASI || i.Nominal || i.NOMINAL || i.nominal || 0);
    
    if (!summary[rmft]) summary[rmft] = { pipeline: 0, realisasi: 0 };
    summary[rmft].pipeline += valPipeline;
    summary[rmft].realisasi += valRealisasi;
  });
  
  return Object.keys(summary).map(rmft => ({
    rmft,
    totalPipeline: summary[rmft].pipeline,
    totalRealisasi: summary[rmft].realisasi
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

const rmftColHasData = computed(() => {
  const data = rmftAchievementAnalysis.value;
  if (!data.length) return {};
  
  const has = (key1, key2) => data.some(item => {
    const val = item[key1] ?? item[key2];
    return val !== 0 && val !== '0' && val !== null && val !== undefined && val !== '';
  });

  return {
    avg_tab: has('AVG_TAB', 'avg_tab'),
    posisi_tab: has('POSISI_TAB', 'posisi_tab'),
    avg_giro: has('AVG_GIRO', 'avg_giro'),
    avg_dpk: has('AVG_DPK', 'avg_dpk'),
    fbi_pa: has('FBI_PA', 'fbi_pa'),
    edc_qris: has('EDC_QRIS', 'edc_qris'),
    dpk_merchant: has('DPK_MERCHANT', 'dpk_merchant'),
    sv: has('SV', 'sv'),
    new_payroll: has('NEW_PAYROLL', 'new_payroll'),
    prod_qlola: has('PROD_QLOLA', 'prod_qlola'),
    prog_kanwil: has('PROG_KANWIL', 'prog_kanwil'),
    prog_sgf: has('PROG_SGF', 'prog_sgf'),
    casa_me: has('CASA_ME', 'casa_me'),
    sv_edc: has('SV_EDC', 'sv_edc'),
    user_activ_b: has('USER_ACTIV_B', 'user_activ_b'),
    user_activ_qlola: has('USER_ACTIV_QLOLA', 'user_activ_qlola'),
    ph_program: has('PH_PROGRAM', 'ph_program'),
  };
});

// --- CHARTS LOGIC ---

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
      return map[selectedPegawaiProduct.value] >= 0 ? '#10b981' : '#ef4444'; // Hijau jika naik/sama, Merah jika turun
    }
  ],
  legend: { 
    position: 'top', 
    horizontalAlign: 'right', 
    fontSize: '12px', 
    customLegendItems: ['Baseline', 'Latest (Naik/Sama)', 'Latest (Turun)'],
    markers: { radius: 12, fillColors: ['#64748b', '#10b981', '#ef4444'] },
    onItemClick: { toggleDataSeries: false },
    onItemHover: { highlightDataSeries: false }
  },
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
  colors: [({ value }) => value >= 100 ? '#10b981' : '#ef4444'], // Hijau jika >= 100%, Merah jika di bawah
  legend: { 
    show: true,
    position: 'top', 
    horizontalAlign: 'right', 
    fontSize: '12px',
    customLegendItems: ['Target Terpenuhi (≥100%)', 'Belum Memenuhi (<100%)'],
    markers: { radius: 12, fillColors: ['#10b981', '#ef4444'] },
    onItemClick: { toggleDataSeries: false },
    onItemHover: { highlightDataSeries: false }
  },
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
      return item.latest >= item.baseline ? '#10b981' : '#ef4444'; // Hijau jika naik, Merah jika turun
    }
  ],
  legend: { 
    position: 'top', 
    horizontalAlign: 'right', 
    fontSize: '12px', 
    customLegendItems: ['Baseline', 'Latest (Naik/Sama)', 'Latest (Turun)'],
    markers: { radius: 12, fillColors: ['#64748b', '#10b981', '#ef4444'] },
    onItemClick: { toggleDataSeries: false },
    onItemHover: { highlightDataSeries: false }
  },
  tooltip: { y: { formatter: (v) => formatNum(v) } }
}));

const unitChartData = computed(() => {
  const data = rawData.value.unit.filter(i => i.Produk === selectedUnitProduct.value);
  const units = [...new Set(data.map(i => i.Unit_KC))];
  const baselineDate = selectedBaselineUnit.value || unitDates.value[0];
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
  plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 4 } },
  dataLabels: { enabled: true, formatter: (v) => formatJuta(v) + ' Jt', style: { fontSize: '10px', colors: ['#ffffff'] } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
  xaxis: {
    categories: rmftPipelineSummary.value.map(i => i.rmft),
    labels: { formatter: (v) => formatJuta(v), style: { fontSize: '11px', colors: '#64748b' } }
  },
  yaxis: { labels: { style: { fontSize: '11px', colors: '#64748b' } } },
  colors: [
    '#64748b', // Abu-abu tua untuk Target Pipeline
    ({ dataPointIndex }) => {
      const item = rmftPipelineSummary.value[dataPointIndex];
      if (!item) return '#64748b';
      return item.totalRealisasi >= item.totalPipeline ? '#10b981' : '#ef4444'; // Hijau jika tembus, Merah jika belum
    }
  ],
  legend: { 
    position: 'top', 
    horizontalAlign: 'right', 
    fontSize: '12px', 
    customLegendItems: ['Target Pipeline', 'Realisasi (Tembus)', 'Realisasi (Belum)'],
    markers: { radius: 12, fillColors: ['#64748b', '#10b981', '#ef4444'] },
    onItemClick: { toggleDataSeries: false },
    onItemHover: { highlightDataSeries: false }
  },
  tooltip: { y: { formatter: (v) => formatJuta(v) + ' Jt' } }
}));

const pipelineChartSeries = computed(() => [
  { name: 'Target Pipeline', data: rmftPipelineSummary.value.map(i => i.totalPipeline) },
  { name: 'Realisasi', data: rmftPipelineSummary.value.map(i => i.totalRealisasi) }
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
  colors: [({ value }) => value >= 100 ? '#10b981' : '#ef4444'], // Hijau jika >= 100%, Merah jika di bawah
  legend: { 
    show: true,
    position: 'top', 
    horizontalAlign: 'right', 
    fontSize: '12px',
    customLegendItems: ['Target Terpenuhi (≥100%)', 'Belum Memenuhi (<100%)'],
    markers: { radius: 12, fillColors: ['#10b981', '#ef4444'] },
    onItemClick: { toggleDataSeries: false },
    onItemHover: { highlightDataSeries: false }
  },
  tooltip: { y: { formatter: (v) => v.toFixed(2) + '%' } }
}));

const rmftChartSeries = computed(() => [
  { name: 'Total Pencapaian', data: rmftAchievementAnalysis.value.map(i => Number(i.TOTAL || i.total || 0)) }
]);

onMounted(fetchData);
</script>

<template>
  <div class="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-900 font-sans relative">
    
    <!-- Main Content Header -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
      
      <!-- Mobile Dropdown Tabs -->
      <div class="block lg:hidden w-full relative">
        <CustomSelect 
          v-model="activeTab" 
          :options="[...menuTabs.map(t => ({ label: t.l, value: t.id })), { label: '⭐ Nasabah Pareto', value: 'nasabah' }]" 
        />
      </div>

      <!-- Desktop Tabs -->
      <div class="hidden lg:flex p-1.5 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto w-full lg:w-auto gap-1">
        <button v-for="t in menuTabs" 
          :key="t.id" @click="activeTab = t.id"
          :class="activeTab === t.id ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'"
          class="flex items-center px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap"
        >
          <component :is="t.icon" class="w-4 h-4 mr-2" :class="activeTab === t.id ? 'text-blue-600' : 'text-slate-400'" />
          {{ t.l }}
        </button>
        
        <!-- Tab Nasabah Pareto (Menuju Laman Nasabah) -->
        <router-link
          to="/nasabah"
          class="flex items-center px-4 py-2 rounded-lg transition-all text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent whitespace-nowrap"
        >
          <Star class="w-4.5 h-4.5 mr-2 text-slate-400" />
          Nasabah Pareto
        </router-link>
      </div>

      <div class="flex items-center space-x-4 bg-white p-3 px-5 rounded-2xl border shadow-sm border-slate-200 w-full lg:w-auto justify-between lg:justify-start">
        <button @click="fetchData(true)" :disabled="isLoading" class="flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50" title="Refresh Data">
          <RefreshCw class="w-4 h-4 mr-1.5" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </button>
        <div class="w-px h-6 bg-slate-200 hidden lg:block"></div>
        <span class="text-[10px] font-black uppercase text-slate-400">Ukuran Tabel: {{ Math.round(tableScale * 100) }}%</span>
        <input type="range" min="0.5" max="1.5" step="0.1" v-model="tableScale" class="w-32 accent-blue-600 cursor-pointer" />
      </div>
    </div>

    <!-- Alert Error Connection -->
    <div v-if="store.error" class="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-300">
      <div class="flex items-start gap-4">
        <div class="p-3 bg-red-100 text-red-700 rounded-2xl shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h4 class="font-black text-red-800 text-base uppercase tracking-tight">Koneksi Database Gagal</h4>
          <p class="text-xs text-red-600 mt-1">Gagal menyinkronkan data dengan Google Apps Script API: <strong>{{ store.error }}</strong>. Silakan coba segarkan data.</p>
        </div>
      </div>
      <button 
        @click="fetchData(true)" 
        class="px-5 py-3 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 shrink-0"
      >
        Segarkan Ulang
      </button>
    </div>

    <div v-if="activeTab === 'pegawai'" class="animate-in fade-in duration-500 space-y-6">
      
      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-[380px] flex flex-col justify-between">
            <div class="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div class="flex-1 flex items-end justify-between px-2 gap-4 pb-4">
              <div v-for="i in 10" :key="i" class="w-full bg-slate-100 rounded-t" :style="{ height: `${[50, 75, 40, 90, 60, 45, 80, 55, 70, 65][i-1]}%` }"></div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse flex flex-col justify-center space-y-6">
            <div class="h-4 bg-slate-200 rounded w-1/2"></div>
            <div class="h-10 bg-slate-100 rounded-lg w-full"></div>
            <div class="space-y-2">
              <div class="h-3 bg-slate-200 rounded w-1/4"></div>
              <div class="h-10 bg-slate-100 rounded-lg w-full"></div>
            </div>
            <div class="space-y-2">
              <div class="h-3 bg-slate-200 rounded w-1/4"></div>
              <div class="h-10 bg-slate-100 rounded-lg w-full"></div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
          <div class="p-4 bg-slate-50 border-b border-slate-200 h-14 flex items-center justify-between">
            <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div class="p-4 space-y-4">
            <div v-for="i in 5" :key="i" class="h-8 bg-slate-100 rounded w-full"></div>
          </div>
        </div>
      </div>

      <!-- Real Content -->
      <template v-else>
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
              <input v-model="searchQuery" placeholder="Cari Nama/PN..." class="w-full border border-slate-200 pl-10 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
            </div>
            <div class="space-y-3">
              <div>
                <span class="text-xs font-medium text-slate-500 mb-1 block">Pilih Baseline</span>
                <CustomSelect
                  v-model="selectedBaseline"
                  :options="[...new Set(rawData.pegawai.map(i => formatToLocalWIB(i.Tanggal_Data)))].sort()"
                />
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 mb-1 block">Pilih Latest</span>
                <CustomSelect
                  v-model="selectedLatest"
                  :options="[...new Set(rawData.pegawai.map(i => formatToLocalWIB(i.Tanggal_Data)))].sort()"
                />
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
                    <th rowspan="2" class="p-4 border-b border-slate-200 w-64">Dana RMFT / PN</th>
                    <th colspan="3" class="p-4 border-b border-slate-200 text-center">Baseline <span class="block text-[10px] font-normal text-slate-400 mt-1 lowercase capitalize">({{selectedBaseline}})</span></th>
                    <th colspan="3" class="p-4 border-b border-slate-200 text-center">Posisi Latest <span class="block text-[10px] font-normal text-slate-400 mt-1 lowercase capitalize">({{selectedLatest}})</span></th>
                    <th colspan="3" class="p-4 border-b border-slate-200 text-center bg-blue-50/50 text-blue-800">Delta Analysis</th>
                  </tr>
                  <tr class="bg-slate-50 text-[11px] text-slate-500">
                    <th class="p-3 border-b border-slate-200 text-right">Giro</th><th class="p-3 border-b border-slate-200 text-right">Tab</th><th class="p-3 border-b border-slate-200 text-right">Depo</th>
                    <th class="p-3 border-b border-slate-200 text-right">Giro</th><th class="p-3 border-b border-slate-200 text-right">Tab</th><th class="p-3 border-b border-slate-200 text-right">Depo</th>
                    <th class="p-3 border-b border-slate-200 text-right bg-blue-50/30">Giro</th><th class="p-3 border-b border-slate-200 text-right bg-blue-50/30">Tab</th><th class="p-3 border-b border-slate-200 text-right bg-blue-50/30">Depo</th>
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
      </template>
    </div>

    <div v-else-if="activeTab === 'unit'" class="animate-in slide-in-from-bottom-2 duration-500 space-y-6">
      
      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse space-y-6">
            <div class="h-4 bg-slate-200 rounded w-1/2"></div>
            <div class="space-y-3">
              <div v-for="i in 3" :key="i" class="h-10 bg-slate-50 rounded-lg w-full"></div>
            </div>
            <div class="space-y-4 pt-4">
              <div class="space-y-2">
                <div class="h-3 bg-slate-200 rounded w-1/4"></div>
                <div class="h-10 bg-slate-100 rounded-lg w-full"></div>
              </div>
              <div class="space-y-2">
                <div class="h-3 bg-slate-200 rounded w-1/4"></div>
                <div class="h-10 bg-slate-100 rounded-lg w-full"></div>
              </div>
            </div>
          </div>
          <div class="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-[380px] flex flex-col justify-between">
            <div class="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div class="flex-1 flex items-end justify-between px-2 gap-4 pb-4">
              <div v-for="i in 8" :key="i" class="w-full bg-slate-100 rounded-t" :style="{ height: `${[60, 45, 80, 55, 70, 65, 50, 75][i-1]}%` }"></div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
          <div class="p-4 bg-slate-50 border-b border-slate-200 h-14 flex items-center justify-between">
            <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div class="p-4 space-y-4">
            <div v-for="i in 5" :key="i" class="h-8 bg-slate-100 rounded w-full"></div>
          </div>
        </div>
      </div>

      <!-- Real Content -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div class="flex flex-col gap-2">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filter Produk</label>
              <button 
                v-for="p in ['Giro', 'Tabungan', 'Deposito']" :key="p" 
                @click="selectedUnitProduct = p; selectedProduct = p"
                :class="selectedUnitProduct === p ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'" 
                class="p-2.5 rounded-lg border font-medium transition-all text-sm"
              >
                {{p}}
              </button>
            </div>
            <div class="space-y-4 mt-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pilih Baseline</label>
                <CustomSelect
                  v-model="selectedBaselineUnit"
                  :options="[...new Set(rawData.unit.map(i => formatToLocalWIB(i.Tanggal_Data)))].sort()"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pilih Latest</label>
                <CustomSelect
                  v-model="selectedDateUnit"
                  :options="[...new Set(rawData.unit.map(i => formatToLocalWIB(i.Tanggal_Data)))].sort().reverse()"
                />
              </div>
            </div>
          </div>
          <div class="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            <!-- Chart -->
            <div class="w-full overflow-x-auto custom-scrollbar pb-2">
              <div class="min-w-[600px] lg:min-w-full">
                <apexchart
                  type="bar"
                  :height="Math.max(300, unitChartData.length * 45)"
                  :key="selectedBaselineUnit + selectedDateUnit + selectedUnitProduct"
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
                    <th colspan="3" class="p-4 border-b border-slate-200 text-center bg-blue-50/50 text-blue-800">Analisis Delta <span class="block text-[10px] font-normal text-blue-400 mt-1 capitalize">(DTD, MTD, YTD)</span></th>
                  </tr>
                  <tr class="bg-slate-50 text-[11px] text-slate-500">
                    <th class="p-3 border-b border-slate-200 text-right text-slate-700">Dipilih ({{selectedDateUnit}})</th>
                    <th class="p-3 border-b border-slate-200 text-right font-normal">H-1 ({{unitAnalysis[0]?.tglKemarin || '-'}})</th>
                    <th class="p-3 border-b border-slate-200 text-right font-normal">Bln-L ({{unitAnalysis[0]?.tglAkhirBulanLalu || '-'}})</th>
                    <th class="p-3 border-b border-slate-200 text-right font-normal">Thn-L ({{unitAnalysis[0]?.tglAkhirTahunLalu || '-'}})</th>
                    <th class="p-3 border-b border-slate-200 text-right bg-blue-50/30 text-blue-700">DTD</th>
                    <th class="p-3 border-b border-slate-200 text-right bg-blue-50/30 text-blue-700">MTD</th>
                    <th class="p-3 border-b border-slate-200 text-right bg-blue-50/30 text-blue-700">YTD</th>
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
      </template>
    </div>

    <!-- TAB KERAGAAN -->
    <div v-else-if="activeTab === 'keragaan'" class="animate-in fade-in duration-500 space-y-6">
       
       <!-- Skeleton Loading State -->
       <div v-if="isLoading" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-[380px] flex flex-col justify-between">
                <div class="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div class="flex-1 flex items-end justify-between px-2 gap-4 pb-4">
                  <div v-for="i in 8" :key="i" class="w-full bg-slate-100 rounded-t" :style="{ height: `${[50, 75, 40, 90, 60, 45, 80, 55][i-1]}%` }"></div>
                </div>
             </div>
             <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse flex flex-col justify-center text-center space-y-4">
                <div class="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
                <div class="h-12 bg-slate-50 rounded-xl w-full"></div>
             </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
             <div class="p-4 bg-slate-50 border-b border-slate-200 h-14 flex items-center justify-between">
                <div class="h-4 bg-slate-200 rounded w-1/4"></div>
                <div class="h-4 bg-slate-200 rounded w-1/3"></div>
             </div>
             <div class="p-4 space-y-4">
                <div v-for="i in 5" :key="i" class="h-8 bg-slate-100 rounded w-full"></div>
             </div>
          </div>
       </div>

       <!-- Real Content -->
       <template v-else>
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
                <CustomSelect
                  v-model="selectedDateUnit"
                  :options="[...new Set(rawData.keragaan.map(i => formatToLocalWIB(i.Tanggal_Data)))].sort().reverse()"
                />
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
                       <th class="p-4 border-b border-slate-200 text-right bg-blue-50/50 text-blue-700">MTD (Growth)</th>
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
       </template>
    </div>

    <!-- TAB PIPELINE -->
    <div v-else-if="activeTab === 'pipeline'" class="animate-in fade-in duration-500 space-y-6">
      
      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-[380px] flex flex-col justify-between">
            <div class="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div class="flex-1 flex items-end justify-between px-2 gap-4 pb-4">
              <div v-for="i in 8" :key="i" class="w-full bg-slate-100 rounded-t" :style="{ height: `${[70, 60, 45, 80, 55, 75, 50, 65][i-1]}%` }"></div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse flex flex-col justify-center space-y-4">
            <div class="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
            <div class="h-10 bg-slate-50 rounded-lg w-full"></div>
            <div class="h-4 bg-slate-200 rounded w-1/2 mx-auto mt-2"></div>
            <div class="h-10 bg-slate-50 rounded-lg w-full"></div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
          <div class="p-4 bg-slate-50 border-b border-slate-200 h-14 flex items-center justify-between">
            <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div class="p-4 space-y-4">
            <div v-for="i in 5" :key="i" class="h-8 bg-slate-100 rounded w-full"></div>
          </div>
        </div>
      </div>

      <!-- Real Content -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Top 10 RMFT by Pipeline</h3>
            <div class="w-full overflow-x-auto custom-scrollbar pb-2">
              <div class="min-w-[600px] lg:min-w-full">
                <apexchart type="bar" :height="Math.max(350, rmftPipelineSummary.length * 45)" :options="pipelineChartOptions" :series="pipelineChartSeries"></apexchart>
              </div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-4">
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Pencarian Data</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input v-model="searchQuery" placeholder="Cari RMFT, Nasabah, Keterangan..." class="w-full border border-slate-200 pl-10 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
            </div>
            
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mt-2">Filter Bulan Target</label>
            <div class="relative">
              <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
              <CustomSelect
                v-model="pipelineSelectedMonth"
                :options="[{ label: 'Semua Bulan', value: '' }, ...pipelineMonths]"
                class="pl-10"
              />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto w-full scroll-custom">
            <div :style="{ transform: `scale(${tableScale})`, transformOrigin: 'top left', width: `${100/tableScale}%` }">
              <table class="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
                <thead class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider">
                  <tr>
                    <th class="p-4 border-b border-slate-200 w-48"><Users class="w-4 h-4 inline-block mr-1 mb-0.5 text-slate-400" /> RMFT</th>
                    <th class="p-4 border-b border-slate-200 w-48">Nasabah</th>
                    <th class="p-4 border-b border-slate-200 text-right">Nominal Pipeline</th>
                    <th class="p-4 border-b border-slate-200">Produk</th>
                    <th class="p-4 border-b border-slate-200 text-right">Realisasi</th>
                    <th @click="togglePipelineSort" class="p-4 border-b border-slate-200 text-center cursor-pointer hover:bg-slate-200/50 transition-colors select-none group">
                      <span class="inline-flex items-center">
                        <Calendar class="w-4 h-4 mr-1 text-slate-400" /> Target Tanggal
                        <ArrowUp v-if="pipelineSortOrder === 'asc'" class="w-4 h-4 ml-1 text-blue-600" />
                        <ArrowDown v-else-if="pipelineSortOrder === 'desc'" class="w-4 h-4 ml-1 text-blue-600" />
                        <ArrowUpDown v-else class="w-4 h-4 ml-1 text-slate-300 group-hover:text-slate-400" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in pipelineAnalysis" :key="idx" class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                    <td class="p-4 font-bold text-slate-800 uppercase text-xs">{{ item.NAMA_RMFT || item.RMFT || '-' }}</td>
                    <td class="p-4 font-medium text-slate-600">{{ item.NAMA_NASABAH || item.Nasabah || item.NASABAH || '-' }}</td>
                    <td class="p-4 text-right font-black text-blue-600">{{ formatNum(item.PIPELINE || item.Pipeline || item.pipeline || 0) }}</td>
                    <td class="p-4 text-slate-500 font-medium">{{ item.KETERANGAN || item.Ket || item.KETERANGAN || '-' }}</td>
                    <td class="p-4 text-right font-bold text-emerald-600">{{ formatNum(item.REALISASI || item.Nominal || item.NOMINAL || item.nominal || 0) }}</td>
                    <td class="p-4 text-center font-medium text-slate-500">{{ formatToLocalWIB(item.TANGGAL_TARGET || item.Tanggal || item.TANGGAL || '') }}</td>
                  </tr>
                  <tr v-if="!pipelineAnalysis.length">
                    <td colspan="6" class="p-8 text-center text-slate-500 font-medium">Tidak ada data Pipeline ditemukan.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- TAB RMFT -->
    <div v-else-if="activeTab === 'rmft_ach'" class="animate-in fade-in duration-500 space-y-6">
      
      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse space-y-6">
            <div class="h-4 bg-slate-200 rounded w-1/2"></div>
            <div class="h-10 bg-slate-50 rounded-lg w-full"></div>
            <div class="h-4 bg-slate-200 rounded w-1/2 mt-4"></div>
            <div class="h-10 bg-slate-50 rounded-lg w-full"></div>
          </div>
          <div class="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-[300px] flex flex-col justify-between">
            <div class="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div class="flex-1 flex items-end justify-between px-2 gap-4 pb-4">
              <div v-for="i in 8" :key="i" class="w-full bg-slate-100 rounded-t" :style="{ height: `${[50, 75, 40, 90, 60, 45, 80, 55][i-1]}%` }"></div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
          <div class="p-4 bg-slate-50 border-b border-slate-200 h-14 flex items-center justify-between">
            <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div class="p-4 space-y-4">
            <div v-for="i in 5" :key="i" class="h-8 bg-slate-100 rounded w-full"></div>
          </div>
        </div>
      </div>

      <!-- Real Content -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div class="flex flex-col gap-2">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filter Bulan</label>
              <CustomSelect
                v-model="selectedMonthRmft"
                :options="achievementMonths"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Pencarian RMFT</label>
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="searchQuery" placeholder="Cari Nama RMFT..." class="w-full border border-slate-200 pl-10 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
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
                    <th class="p-4 border-b border-slate-200 w-56 bg-slate-100 shadow-[0_1px_0_#e2e8f0]">RMFT</th>
                    <th v-if="rmftColHasData.avg_tab" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">AVG TAB</th>
                    <th v-if="rmftColHasData.posisi_tab" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">POSISI TAB</th>
                    <th v-if="rmftColHasData.avg_giro" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">AVG GIRO</th>
                    <th v-if="rmftColHasData.avg_dpk" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">AVG DPK</th>
                    <th v-if="rmftColHasData.fbi_pa" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">FBI PA</th>
                    <th v-if="rmftColHasData.edc_qris" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">EDC/QRIS</th>
                    <th v-if="rmftColHasData.dpk_merchant" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">DPK MERCH</th>
                    <th v-if="rmftColHasData.sv" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">SV</th>
                    <th v-if="rmftColHasData.new_payroll" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">PAYROLL</th>
                    <th v-if="rmftColHasData.prod_qlola" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">QLOLA</th>
                    <th v-if="rmftColHasData.prog_kanwil" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">KANWIL</th>
                    <th v-if="rmftColHasData.prog_sgf" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">SGF</th>
                    <th v-if="rmftColHasData.casa_me" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">CASA ME</th>
                    <th v-if="rmftColHasData.sv_edc" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">SV EDC</th>
                    <th v-if="rmftColHasData.user_activ_b" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">USER ACTIV B</th>
                    <th v-if="rmftColHasData.user_activ_qlola" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">USER ACTIV QLOLA</th>
                    <th v-if="rmftColHasData.ph_program" class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]">PH PROGRAM</th>
                    <th class="p-4 border-b border-slate-200 text-right bg-blue-50/50 shadow-[0_1px_0_#e2e8f0] text-blue-800">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in rmftAchievementAnalysis" :key="idx" class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                    <td class="p-4 font-medium text-slate-800">{{ item.NAMA_RMFT || item.RMFT || item.rmft || item['Keterangan (Nama RMFT)'] || item.KETERANGAN || item.Keterangan || '-' }}</td>
                    <td v-if="rmftColHasData.avg_tab" class="p-4 text-right text-slate-600">{{ formatPercent(item.AVG_TAB ?? item.avg_tab) }}</td>
                    <td v-if="rmftColHasData.posisi_tab" class="p-4 text-right text-slate-600">{{ formatPercent(item.POSISI_TAB ?? item.posisi_tab) }}</td>
                    <td v-if="rmftColHasData.avg_giro" class="p-4 text-right text-slate-600">{{ formatPercent(item.AVG_GIRO ?? item.avg_giro) }}</td>
                    <td v-if="rmftColHasData.avg_dpk" class="p-4 text-right text-slate-600">{{ formatPercent(item.AVG_DPK ?? item.avg_dpk) }}</td>
                    <td v-if="rmftColHasData.fbi_pa" class="p-4 text-right text-slate-600">{{ formatPercent(item.FBI_PA ?? item.fbi_pa) }}</td>
                    <td v-if="rmftColHasData.edc_qris" class="p-4 text-right text-slate-600">{{ formatPercent(item.EDC_QRIS ?? item.edc_qris) }}</td>
                    <td v-if="rmftColHasData.dpk_merchant" class="p-4 text-right text-slate-600">{{ formatPercent(item.DPK_MERCHANT ?? item.dpk_merchant) }}</td>
                    <td v-if="rmftColHasData.sv" class="p-4 text-right text-slate-600">{{ formatPercent(item.SV ?? item.sv) }}</td>
                    <td v-if="rmftColHasData.new_payroll" class="p-4 text-right text-slate-600">{{ formatPercent(item.NEW_PAYROLL ?? item.new_payroll) }}</td>
                    <td v-if="rmftColHasData.prod_qlola" class="p-4 text-right text-slate-600">{{ formatPercent(item.PROD_QLOLA ?? item.prod_qlola) }}</td>
                    <td v-if="rmftColHasData.prog_kanwil" class="p-4 text-right text-slate-600">{{ formatPercent(item.PROG_KANWIL ?? item.prog_kanwil) }}</td>
                    <td v-if="rmftColHasData.prog_sgf" class="p-4 text-right text-slate-600">{{ formatPercent(item.PROG_SGF ?? item.prog_sgf) }}</td>
                    <td v-if="rmftColHasData.casa_me" class="p-4 text-right text-slate-600">{{ formatPercent(item.CASA_ME ?? item.casa_me) }}</td>
                    <td v-if="rmftColHasData.sv_edc" class="p-4 text-right text-slate-600">{{ formatPercent(item.SV_EDC ?? item.sv_edc) }}</td>
                    <td v-if="rmftColHasData.user_activ_b" class="p-4 text-right text-slate-600">{{ formatPercent(item.USER_ACTIV_B ?? item.user_activ_b) }}</td>
                    <td v-if="rmftColHasData.user_activ_qlola" class="p-4 text-right text-slate-600">{{ formatPercent(item.USER_ACTIV_QLOLA ?? item.user_activ_qlola) }}</td>
                    <td v-if="rmftColHasData.ph_program" class="p-4 text-right text-slate-600">{{ formatPercent(item.PH_PROGRAM ?? item.ph_program) }}</td>
                    <td class="p-4 text-right font-semibold text-blue-700 bg-blue-50/30">{{ formatPercent(item.TOTAL ?? item.total) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
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