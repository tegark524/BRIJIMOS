<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Database, 
  Users, 
  Building2, 
  Activity, 
  FileText, 
  TrendingUp, 
  Target,
  Calendar,
  SearchX,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-vue-next';
import { store, fetchData as storeFetchData, clearCache } from '../store';

const route = useRoute();
const router = useRouter();

const targetType = computed({
  get: () => store.manage.targetType,
  set: (val) => { store.manage.targetType = val; }
});

const selectedDateToDelete = computed({
  get: () => store.manage.selectedDateToDelete,
  set: (val) => { store.manage.selectedDateToDelete = val; }
});

const rawData = computed(() => store.rawData);
const isLoading = computed(() => store.isLoading);
const isProcessing = ref(false);

const categories = [
  {id:'pegawai', n:'Dana RMFT', i: Users},
  {id:'unit', n:'Unit Kerja', i: Building2},
  {id:'keragaan', n:'Keragaan', i: Activity},
  {id:'rka', n:'RKA', i: FileText},
  {id:'pipeline', n:'Pipeline', i: TrendingUp},
  {id:'rmft_ach', n:'RMFT', i: Target}
];

// State untuk Custom Toast Notification
const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 4000);
};

const apiUrl = import.meta.env.VITE_API_URL; 

const fetchData = async (forceRefresh = false) => {
  try {
    await storeFetchData(forceRefresh);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
};

watch(() => route.query.type, (newType) => {
  if (newType && newType !== targetType.value) {
    targetType.value = newType;
    selectedDateToDelete.value = '';
  }
});

watch(targetType, (newVal) => {
  if (route.query.type !== newVal) {
    router.replace({ query: { ...route.query, type: newVal } });
  }
  selectedDateToDelete.value = '';
});

const availableDates = computed(() => {
  const data = rawData.value[targetType.value] || [];
  if (data.length === 0) return [];

  const dates = data.map(item => {
    let val;
    if (targetType.value === 'rka') val = item.Bulan_Tahun;
    else if (targetType.value === 'pipeline') val = item.TANGGAL_TARGET || item.Tanggal || item.TANGGAL || item.tanggal;
    else if (targetType.value === 'rmft_ach') val = item.BULAN || item.bulan || item.Tanggal_Data || item.TANGGAL || item.tanggal;
    else val = item.Tanggal_Data;

    if (!val) return null;
    
    const str = val.toString().trim();
    return (targetType.value === 'rka' || targetType.value === 'rmft_ach' || targetType.value === 'pipeline') ? str.substring(0, 7) : str.substring(0, 10);
  }).filter(d => d && d.length >= 7);

  return [...new Set(dates)].sort().reverse();
});

const deleteData = async () => {
  if (!selectedDateToDelete.value) return showToast('Silakan pilih periode tanggal terlebih dahulu.', 'error');
  
  const confirmMsg = `KONFIRMASI PENGHAPUSAN\n\nKategori: ${targetType.value.toUpperCase()}\nPeriode: ${selectedDateToDelete.value}\n\nData akan dihapus permanen. Lanjutkan?`;
  
  if (!confirm(confirmMsg)) return;

  isProcessing.value = true;
  try {
    const payload = {
      action: 'delete',
      type: targetType.value === 'unit' ? 'uker' : targetType.value,
      targetDate: selectedDateToDelete.value
    };

    const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify(payload) });
    const res = await response.json();

    if (res.status === 'success') {
      showToast(`Berhasil! Data ${targetType.value.toUpperCase()} periode ${selectedDateToDelete.value} telah dihapus.`, 'success');
      clearCache();
      await fetchData(true); // Sinkronkan ulang daftar tanggal
    } else {
      showToast('Gagal: ' + res.message, 'error');
    }
  } catch (error) {
    showToast('Koneksi Error: ' + error.message, 'error');
  } finally {
    isProcessing.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in duration-500 font-sans" style="font-family: 'Inter', sans-serif;">
    
    <!-- Toast Notification Overlay -->
    <transition name="slide-down">
      <div v-if="toast.show" class="fixed top-6 right-6 z-[200] flex items-center p-4 rounded-xl shadow-lg border" :class="toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'">
        <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 mr-3 text-emerald-600 shrink-0" />
        <XCircle v-else class="w-5 h-5 mr-3 text-rose-600 shrink-0" />
        <p class="font-medium text-sm">{{ toast.message }}</p>
        <button @click="toast.show = false" class="ml-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition>

    <div class="flex items-center space-x-4 mb-8">
      <Database class="w-10 h-10 text-blue-600" />
      <div>
        <h1 class="text-3xl font-bold text-slate-800 tracking-tight leading-none">Manajemen Data</h1>
        <p class="text-sm text-slate-500 mt-1">Pembersihan dan Pemeliharaan Database BRIJIMOS</p>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-6 md:p-8 space-y-8">
        
        <!-- STEP 1 -->
        <div class="space-y-3">
          <label class="text-sm font-semibold text-slate-700 block">1. Pilih Kategori Laporan</label>
          
          <!-- Mobile Dropdown -->
          <div class="block md:hidden relative">
            <select v-model="targetType" :disabled="isLoading" class="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
              <option v-for="t in categories" :key="t.id" :value="t.id">{{ t.n }}</option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>

          <!-- Desktop Grid -->
          <div class="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <button v-for="t in categories" 
              :key="t.id" @click="targetType = t.id"
              :disabled="isLoading"
              :class="[
                targetType === t.id ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
                isLoading ? 'opacity-60 cursor-not-allowed' : ''
              ]"
              class="p-3 flex flex-col items-center justify-center gap-2 rounded-xl border transition-all active:scale-[0.98]"
            >
              <component :is="t.i" class="w-5 h-5" :class="targetType === t.id ? 'text-blue-600' : 'text-slate-400'" />
              <span class="font-semibold text-xs text-center">{{ t.n }}</span>
            </button>
          </div>
        </div>

        <!-- STEP 2 -->
        <div class="space-y-3">
          <label class="text-sm font-semibold text-slate-700 block">2. Pilih Periode yang Ingin Dihapus</label>
          <div v-if="isLoading" class="animate-pulse">
            <div class="h-12 bg-slate-50 rounded-lg w-full border border-slate-200/50 flex items-center px-4">
              <div class="h-4 bg-slate-200 rounded w-1/3"></div>
            </div>
          </div>
          <div v-else-if="availableDates.length > 0">
            <div class="relative">
              <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <select v-model="selectedDateToDelete" class="w-full border border-slate-200 pl-10 p-3 rounded-lg bg-slate-50 font-medium text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer">
                <option value="" disabled>-- Pilih Tanggal / Bulan --</option>
                <option v-for="date in availableDates" :key="date" :value="date">{{ date }}</option>
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
            </div>
          </div>
          <div v-else class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <SearchX class="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <p class="text-slate-500 font-medium text-sm">Tidak ada riwayat data pada kategori ini.</p>
          </div>
        </div>

        <!-- ACTION -->
        <div v-if="selectedDateToDelete" class="pt-4 animate-in fade-in duration-300">
          <div class="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-3 mb-4">
            <AlertCircle class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 class="text-sm font-semibold text-rose-800">Peringatan Penghapusan</h4>
              <p class="text-xs text-rose-600 mt-1">Anda akan menghapus secara permanen semua data <strong class="uppercase">{{ targetType }}</strong> untuk periode <strong>{{ selectedDateToDelete }}</strong>. Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </div>

          <button 
            @click="deleteData"
            :disabled="isProcessing"
            class="w-full bg-rose-500 text-white font-semibold py-3.5 rounded-lg hover:bg-rose-600 shadow-sm shadow-rose-200 transition-all active:scale-[0.98] flex justify-center items-center space-x-2 disabled:bg-slate-300 disabled:shadow-none"
          >
            <span v-if="!isProcessing" class="flex items-center gap-2"><Trash2 class="w-5 h-5" /> Hapus Permanen Data</span>
            <div v-else class="flex items-center space-x-3">
               <div class="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
               <span>Sedang Menghapus...</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-20px); }
</style>