<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { store, fetchData as storeFetchData } from '../store';
import { Star, Users, TrendingUp, DollarSign, Search, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Building2, Activity, Target } from 'lucide-vue-next';
import CustomSelect from '../components/CustomSelect.vue';

// --- PALETTE WARNA BERSAMA (bar & donut sinkron) ---
const colorPalette = [
  '#1d4ed8','#7c3aed','#0891b2','#059669','#d97706',
  '#dc2626','#9333ea','#0284c7','#16a34a','#ea580c',
  '#64748b','#be185d','#0f766e','#b45309','#4338ca',
];

// --- STATE ---
const searchQuery = ref('');
const sortKey = ref('Volume');
const sortOrder = ref('desc');
const chartLimit = ref(0); // 0 = semua, 5 = top 5, 10 = top 10
const rightTab = ref('radial'); // 'radial' | 'donut'
const selectedNasabahName = ref('');
const isLoading = computed(() => store.isLoading);
const tableScale = ref(1.0);

const router = useRouter();
const activeMobileTab = ref('/nasabah');
watch(activeMobileTab, (newVal) => {
  if (newVal !== '/nasabah') {
    router.push(newVal);
  }
});

const menuTabs = [
  { id: 'pegawai', l: 'Dana RMFT', icon: Users, to: '/?tab=pegawai' },
  { id: 'unit', l: 'Unit Kerja', icon: Building2, to: '/?tab=unit' },
  { id: 'keragaan', l: 'Keragaan', icon: Activity, to: '/?tab=keragaan' },
  { id: 'pipeline', l: 'Pipeline', icon: TrendingUp, to: '/?tab=pipeline' },
  { id: 'rmft_ach', l: 'Achievement', icon: Target, to: '/?tab=rmft_ach' }
];

// --- DATA ---
const rawNasabah = computed(() => store.rawData.nasabah || []);

// --- HELPERS ---
const toNum = (v) => {
  const s = String(v || '').replace(/[^0-9.-]/g, '');
  return parseFloat(s) || 0;
};
const parsePercent = (v) => {
  if (v === undefined || v === null || v === '') return 0;
  if (typeof v === 'number') return v;
  let str = String(v).trim();
  str = str.replace(/%/g, '');
  if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(/,/g, '.');
  }
  return parseFloat(str) || 0;
};
const formatJuta = (v) => {
  const n = toNum(v);
  if (n === 0) return '-';
  return (n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Jt';
};
const formatRibuan = (v) => {
  const n = toNum(v);
  if (n === 0) return '-';
  return n.toLocaleString('id-ID');
};

// --- COMPUTED DATA ---
const processedData = computed(() =>
  rawNasabah.value.map((r) => {
    const vol = toNum(r.Volume);
    const parsedPct = parsePercent(r.Presentase || r['Presentase'] || r.presentase || 0);
    // Fallback if Presentase is missing or 0: Volume / 1000
    const finalPct = parsedPct || (vol / 1000);
    return {
      Nama_Nasabah: r.Nama_Nasabah || r['Nama Nasabah'] || '-',
      Jenis_Usaha: r.Jenis_Usaha || r['Jenis Usaha'] || '-',
      Omset: toNum(r.Omset),
      Produk_BRI: (r.Produk_BRI || r['Produk BRI'] || 'TAB').toUpperCase(),
      Volume: vol,
      Presentase: finalPct,
    };
  })
);

const totalNasabah = computed(() => processedData.value.length);
const totalVolume = computed(() => processedData.value.reduce((a, r) => a + r.Volume, 0));
const totalOmset = computed(() => processedData.value.reduce((a, r) => a + r.Omset, 0));


const filteredData = computed(() => {
  const q = searchQuery.value.toLowerCase();
  let data = processedData.value.filter(
    (r) =>
      r.Nama_Nasabah.toLowerCase().includes(q) ||
      r.Jenis_Usaha.toLowerCase().includes(q) ||
      r.Produk_BRI.toLowerCase().includes(q)
  );
  data = [...data].sort((a, b) => {
    const va = a[sortKey.value];
    const vb = b[sortKey.value];
    if (typeof va === 'number') return sortOrder.value === 'asc' ? va - vb : vb - va;
    return sortOrder.value === 'asc'
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });
  return data;
});

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'desc';
  }
};

// --- CHART DATA dengan filter limit ---
const sortedByVolume = computed(() =>
  [...processedData.value].sort((a, b) => b.Volume - a.Volume)
);
const chartDisplayData = computed(() =>
  chartLimit.value > 0 ? sortedByVolume.value.slice(0, chartLimit.value) : sortedByVolume.value
);

// --- CHART: Horizontal Bar (Volume per Nasabah) ---
const barChartSeries = computed(() => [
  {
    name: 'Volume',
    data: chartDisplayData.value.map((r) => r.Volume),
  },
]);


const barChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    background: 'transparent',
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '60%',
      borderRadius: 5,
      distributed: true,
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (v) => formatRibuan(v),
    style: { fontSize: '10px', colors: ['#fff'] },
    offsetX: -4,
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: chartDisplayData.value.map((r) => r.Nama_Nasabah),
    labels: { style: { fontSize: '11px', colors: '#64748b' } },
  },
  yaxis: {
    labels: { style: { fontSize: '11px', colors: '#334155' } },
  },
  colors: getBarColors.value,
  legend: { show: false },
  tooltip: {
    y: { formatter: (v) => formatRibuan(v) + ' unit' },
  },
}));

// --- CHART: Donut (Distribusi Jenis Usaha) ---
const donutData = computed(() => {
  const grouped = {};
  processedData.value.forEach((r) => {
    const key = r.Jenis_Usaha === '-' || !r.Jenis_Usaha ? 'Lainnya' : r.Jenis_Usaha;
    grouped[key] = (grouped[key] || 0) + r.Volume;
  });
  return grouped;
});

const donutSeries = computed(() => Object.values(donutData.value));
const donutLabels = computed(() => Object.keys(donutData.value));

// --- COLOR MAP: Jenis Usaha → warna (sinkron antara bar & donut) ---
const jenisColorMap = computed(() => {
  const map = {};
  let idx = 0;
  Object.keys(donutData.value).forEach((key) => {
    map[key] = colorPalette[idx % colorPalette.length];
    idx++;
  });
  return map;
});

const getBarColors = computed(() =>
  chartDisplayData.value.map((r) => {
    const key = r.Jenis_Usaha === '-' || !r.Jenis_Usaha ? 'Lainnya' : r.Jenis_Usaha;
    return jenisColorMap.value[key] || colorPalette[0];
  })
);

const donutChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    background: 'transparent',
  },
  labels: donutLabels.value,
  colors: donutLabels.value.map((lbl) => jenisColorMap.value[lbl] || colorPalette[0]),
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Volume',
            fontSize: '11px',
            fontWeight: 600,
            color: '#64748b',
            formatter: () => formatRibuan(totalVolume.value),
          },
        },
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => val.toFixed(1) + '%',
    style: { fontSize: '10px' },
    dropShadow: { enabled: false },
  },
  legend: {
    position: 'bottom',
    fontSize: '11px',
    fontWeight: 500,
    labels: { colors: '#475569' },
    markers: { radius: 4 },
    itemMargin: { horizontal: 6, vertical: 4 },
  },
  stroke: { width: 2, colors: ['#fff'] },
  tooltip: {
    y: { formatter: (v) => formatRibuan(v) + ' unit' },
  },
}));

// --- STATE WATCH FOR DEFAULT SELECTED NASABAH ---
watch(processedData, (newVal) => {
  if (newVal && newVal.length > 0 && !selectedNasabahName.value) {
    selectedNasabahName.value = newVal[0].Nama_Nasabah;
  }
}, { immediate: true });

const selectedNasabahObj = computed(() => {
  return processedData.value.find(r => r.Nama_Nasabah === selectedNasabahName.value) || processedData.value[0];
});

const radialSeries = computed(() => {
  return [selectedNasabahObj.value ? selectedNasabahObj.value.Presentase : 0];
});

const radialChartOptions = computed(() => {
  const pct = selectedNasabahObj.value ? selectedNasabahObj.value.Presentase : 0;
  const color = pct >= 100 ? '#10b981' : (pct >= 50 ? '#3b82f6' : '#f97316');
  return {
    chart: {
      type: 'radialBar',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif'
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 15,
          size: '65%',
          background: 'transparent',
        },
        track: {
          background: '#f1f5f9',
          strokeWidth: '97%',
          margin: 5,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '11px',
            color: '#64748b',
            offsetY: -10
          },
          value: {
            show: true,
            fontSize: '24px',
            fontWeight: 800,
            color: '#1e293b',
            offsetY: 5,
            formatter: (val) => val.toFixed(1) + '%'
          }
        }
      }
    },
    fill: {
      type: 'solid',
    },
    colors: [color],
    stroke: {
      lineCap: 'round'
    },
    labels: ['Pencapaian Target'],
  };
});

// --- PRODUK BADGE COLOR ---
const produkBadge = (p) => {
  const map = {
    TAB: 'bg-blue-100 text-blue-700 border-blue-200',
    GIRO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    DEP: 'bg-orange-100 text-orange-700 border-orange-200',
    DEPOSITO: 'bg-orange-100 text-orange-700 border-orange-200',
    TABUNGAN: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return map[p] || 'bg-slate-100 text-slate-700 border-slate-200';
};

// --- FETCH ---
const fetchData = async (force = false) => {
  try { await storeFetchData(force); } catch (e) { console.error(e); }
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">

    <!-- Main Content Header -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
      
      <!-- Mobile Dropdown Tabs -->
      <div class="block lg:hidden w-full relative">
        <CustomSelect 
          v-model="activeMobileTab" 
          :options="[...menuTabs.map(t => ({ label: t.l, value: t.to })), { label: '⭐ Nasabah Pareto', value: '/nasabah' }]" 
        />
      </div>

      <!-- Desktop Tabs -->
      <div class="hidden lg:flex p-1.5 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto w-full lg:w-auto gap-1">
        <router-link v-for="t in menuTabs" 
          :key="t.id" :to="t.to"
          class="flex items-center px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
        >
          <component :is="t.icon" class="w-4 h-4 mr-2 text-slate-400" />
          {{ t.l }}
        </router-link>
        
        <!-- Tab Nasabah Pareto (Aktif) -->
        <router-link
          to="/nasabah"
          class="flex items-center px-4 py-2 rounded-lg transition-all text-sm bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100/50 whitespace-nowrap"
        >
          <Star class="w-4.5 h-4.5 mr-2 text-blue-600" />
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

    <!-- Skeleton Loading -->
    <template v-if="isLoading">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse h-28" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div class="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse h-96" />
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse h-96" />
      </div>
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse h-64" />
    </template>

    <!-- Real Content -->
    <template v-else-if="processedData.length > 0">

      <!-- ─── SUMMARY CARDS ─── -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <!-- Total Nasabah -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="p-3 rounded-xl bg-blue-50">
            <Users class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total Nasabah</p>
            <p class="text-3xl font-black text-slate-800">{{ totalNasabah }}</p>
            <p class="text-xs text-slate-400 mt-0.5">nasabah terdaftar</p>
          </div>
        </div>

        <!-- Total Volume -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="p-3 rounded-xl bg-emerald-50">
            <TrendingUp class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total Volume</p>
            <p class="text-3xl font-black text-slate-800">{{ formatRibuan(totalVolume) }}</p>
            <p class="text-xs text-slate-400 mt-0.5">unit tabungan</p>
          </div>
        </div>

        <!-- Total Omset -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="p-3 rounded-xl bg-violet-50">
            <DollarSign class="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total Omset</p>
            <p class="text-3xl font-black text-slate-800">{{ formatJuta(totalOmset) }}</p>
            <p class="text-xs text-slate-400 mt-0.5">gabungan semua nasabah</p>
          </div>
        </div>
      </div>

      <!-- ─── CHARTS ROW ─── -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">

        <!-- Bar Chart: Volume per Nasabah -->
        <div class="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div class="flex items-start justify-between mb-4 gap-3">
            <div>
              <h3 class="text-sm font-bold text-slate-700">Volume per Nasabah</h3>
              <p class="text-xs text-slate-400 mt-0.5">
                Menampilkan
                <span class="font-semibold text-slate-600">
                  {{ chartLimit === 0 ? 'semua ' + chartDisplayData.length : chartLimit }}
                </span>
                nasabah, diurutkan dari tertinggi
              </p>
            </div>
            <!-- Toggle All / Top 5 / Top 10 -->
            <div class="flex p-1 bg-slate-100 rounded-lg gap-1 shrink-0">
              <button
                v-for="opt in [{label:'All', val:0},{label:'Top 5',val:5},{label:'Top 10',val:10}]"
                :key="opt.val"
                @click="chartLimit = opt.val"
                :class="chartLimit === opt.val
                  ? 'bg-white text-slate-800 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-700'"
                class="px-3 py-1.5 rounded-md text-xs transition-all whitespace-nowrap"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div class="w-full overflow-x-auto">
            <div class="min-w-full">
              <apexchart
                type="bar"
                :height="Math.max(200, chartDisplayData.length * 32)"
                :key="chartLimit"
                :options="barChartOptions"
                :series="barChartSeries"
              />
            </div>
          </div>
        </div>

        <!-- Donut / Radial Gauge Chart -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <h3 class="text-sm font-bold text-slate-700">Analisis Usaha & Target</h3>
            <div class="flex p-1 bg-slate-100 rounded-lg gap-1 shrink-0">
              <button
                @click="rightTab = 'radial'"
                :class="rightTab === 'radial' ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'"
                class="px-2.5 py-1 rounded-md text-xs transition-all whitespace-nowrap"
              >
                Target Capaian
              </button>
              <button
                @click="rightTab = 'donut'"
                :class="rightTab === 'donut' ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'"
                class="px-2.5 py-1 rounded-md text-xs transition-all whitespace-nowrap"
              >
                Distribusi Usaha
              </button>
            </div>
          </div>

          <!-- Tab Donut -->
          <div v-show="rightTab === 'donut'" class="flex-1 flex flex-col justify-center">
            <div class="mb-2">
              <p class="text-xs text-slate-400">Proporsi volume berdasarkan jenis usaha nasabah</p>
            </div>
            <apexchart
              type="donut"
              height="300"
              :options="donutChartOptions"
              :series="donutSeries"
            />
          </div>

          <!-- Tab Radial Target Progress -->
          <div v-show="rightTab === 'radial'" class="flex-1 flex flex-col justify-between">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Nasabah Pareto</label>
              <CustomSelect
                v-model="selectedNasabahName"
                :options="processedData.map(r => ({ label: r.Nama_Nasabah, value: r.Nama_Nasabah, sublabel: r.Jenis_Usaha }))"
                searchable
              />
            </div>

            <div class="flex justify-center items-center py-2">
              <apexchart
                type="radialBar"
                height="220"
                :key="selectedNasabahName + (selectedNasabahObj ? selectedNasabahObj.Presentase : 0)"
                :options="radialChartOptions"
                :series="radialSeries"
              />
            </div>

            <div v-if="selectedNasabahObj" class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-[11px] leading-tight">
              <div class="flex justify-between">
                <span class="text-slate-500">Usaha & Produk:</span>
                <span class="font-bold text-slate-700">
                  {{ selectedNasabahObj.Jenis_Usaha }} ({{ selectedNasabahObj.Produk_BRI }})
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Volume & Omset:</span>
                <span class="font-bold text-slate-800">
                  {{ formatRibuan(selectedNasabahObj.Volume) }} unit | {{ formatJuta(selectedNasabahObj.Omset) }}
                </span>
              </div>
              <div class="flex justify-between items-center pt-1 border-t border-slate-200">
                <span class="text-slate-500">Status Target:</span>
                <span
                  class="px-2 py-0.5 rounded font-black text-[9px] uppercase border"
                  :class="selectedNasabahObj.Presentase >= 100 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                    : (selectedNasabahObj.Presentase >= 50 ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200')"
                >
                  {{ selectedNasabahObj.Presentase >= 100 ? 'Tercapai (100%++)' : 'Dalam Progress' }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ─── TABEL DETAIL ─── -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <!-- Tabel Header / Toolbar -->
        <div class="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 class="text-sm font-bold text-slate-700">Detail Nasabah</h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Menampilkan <span class="font-semibold text-slate-600">{{ filteredData.length }}</span> dari {{ totalNasabah }} nasabah
            </p>
          </div>
          <div class="relative w-full sm:w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="searchQuery"
              placeholder="Cari nama / jenis usaha..."
              class="w-full border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto scroll-custom">
          <div :style="{ transform: `scale(${tableScale})`, transformOrigin: 'top left', width: `${100/tableScale}%` }">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">No</th>
                  <th
                    class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none"
                    @click="toggleSort('Nama_Nasabah')"
                  >
                    <div class="flex items-center gap-1">
                      Nama Nasabah
                      <component
                        :is="sortKey === 'Nama_Nasabah' ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                        class="w-3.5 h-3.5"
                        :class="sortKey === 'Nama_Nasabah' ? 'text-blue-500' : 'text-slate-300'"
                      />
                    </div>
                  </th>
                  <th
                    class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none"
                    @click="toggleSort('Jenis_Usaha')"
                  >
                    <div class="flex items-center gap-1">
                      Jenis Usaha
                      <component
                        :is="sortKey === 'Jenis_Usaha' ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                        class="w-3.5 h-3.5"
                        :class="sortKey === 'Jenis_Usaha' ? 'text-blue-500' : 'text-slate-300'"
                      />
                    </div>
                  </th>
                  <th
                    class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none"
                    @click="toggleSort('Omset')"
                  >
                    <div class="flex items-center justify-end gap-1">
                      Omset
                      <component
                        :is="sortKey === 'Omset' ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                        class="w-3.5 h-3.5"
                        :class="sortKey === 'Omset' ? 'text-blue-500' : 'text-slate-300'"
                      />
                    </div>
                  </th>
                  <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">Produk BRI</th>
                  <th
                    class="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none"
                    @click="toggleSort('Volume')"
                  >
                    <div class="flex items-center justify-end gap-1">
                      Volume
                      <component
                        :is="sortKey === 'Volume' ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                        class="w-3.5 h-3.5"
                        :class="sortKey === 'Volume' ? 'text-blue-500' : 'text-slate-300'"
                      />
                    </div>
                  </th>
                  <th
                    class="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none"
                    @click="toggleSort('Presentase')"
                  >
                    <div class="flex items-center justify-end gap-1">
                      Presentase
                      <component
                        :is="sortKey === 'Presentase' ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                        class="w-3.5 h-3.5"
                        :class="sortKey === 'Presentase' ? 'text-blue-500' : 'text-slate-300'"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr
                  v-for="(row, idx) in filteredData"
                  :key="idx"
                  class="hover:bg-blue-50/40 transition-colors"
                >
                  <td class="px-5 py-3.5 text-xs text-slate-400 font-medium">{{ idx + 1 }}</td>
                  <td class="px-4 py-3.5">
                    <span class="font-semibold text-slate-800">{{ row.Nama_Nasabah }}</span>
                  </td>
                  <td class="px-4 py-3.5">
                    <span
                      v-if="row.Jenis_Usaha && row.Jenis_Usaha !== '-'"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {{ row.Jenis_Usaha }}
                    </span>
                    <span v-else class="text-slate-300 text-xs">—</span>
                  </td>
                  <td class="px-4 py-3.5 text-right">
                    <span class="text-slate-700 font-medium tabular-nums">{{ formatJuta(row.Omset) }}</span>
                  </td>
                  <td class="px-4 py-3.5 text-center">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                      :class="produkBadge(row.Produk_BRI)"
                    >
                      {{ row.Produk_BRI }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-right">
                    <span class="font-bold text-slate-800 tabular-nums">{{ formatRibuan(row.Volume) }}</span>
                  </td>
                  <td class="px-5 py-3.5 text-right">
                    <span
                      class="font-black tabular-nums"
                      :class="row.Presentase >= 100 ? 'text-emerald-600' : (row.Presentase >= 50 ? 'text-blue-600' : 'text-rose-600')"
                    >
                      {{ row.Presentase.toFixed(1) }}%
                    </span>
                  </td>
                </tr>
                <tr v-if="filteredData.length === 0">
                  <td colspan="7" class="px-5 py-12 text-center text-slate-400 text-sm">
                    Tidak ada data yang cocok dengan pencarian "<span class="font-semibold">{{ searchQuery }}</span>"
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table Footer -->
        <div class="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <p class="text-xs text-slate-400">Total volume: <span class="font-bold text-slate-600">{{ formatRibuan(filteredData.reduce((a,r) => a + r.Volume, 0)) }}</span> unit</p>
          <p class="text-xs text-slate-400">Total omset: <span class="font-bold text-slate-600">{{ formatJuta(filteredData.reduce((a,r) => a + r.Omset, 0)) }}</span></p>
        </div>
      </div>

    </template>

    <!-- Empty State -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-32 text-center">
        <div class="p-6 bg-blue-50 rounded-3xl mb-6">
          <Star class="w-12 h-12 text-blue-300" />
        </div>
        <h3 class="text-lg font-bold text-slate-700 mb-2">Belum Ada Data Nasabah Pareto</h3>
        <p class="text-sm text-slate-400 max-w-sm mb-6">
          Pastikan sheet <code class="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs">Nasabah_Prioritas</code> sudah dibuat di Google Sheets dan GAS sudah di-redeploy.
        </p>
        <button
          @click="fetchData(true)"
          class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          Coba Muat Ulang
        </button>
      </div>
    </template>

  </div>
</template>

<style scoped>
/* Pop-in Dropdown Transition */
.pop-in-enter-active,
.pop-in-leave-active {
  transition: all 0.15s ease-out;
}
.pop-in-enter-from,
.pop-in-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
