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
  X,
  Star
} from 'lucide-vue-next';
import { store, fetchData as storeFetchData, clearCache } from '../store';
import CustomSelect from '../components/CustomSelect.vue';

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
  {id:'rmft_ach', n:'RMFT', i: Target},
  {id:'nasabah', n:'Nasabah Pareto', i: Star}
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

const deleteSingleRow = async (key, value, label) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus "${label}" secara permanen?`)) return;

  isProcessing.value = true;
  try {
    const payload = {
      action: 'delete',
      type: targetType.value,
      deleteKey: key,
      deleteValue: value
    };

    const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify(payload) });
    const res = await response.json();

    if (res.status === 'success') {
      showToast(`Berhasil! Data "${label}" telah dihapus dari database.`, 'success');
      clearCache();
      await fetchData(true); // reload store data
    } else {
      showToast('Gagal: ' + res.message, 'error');
    }
  } catch (error) {
    showToast('Koneksi Error: ' + error.message, 'error');
  } finally {
    isProcessing.value = false;
  }
};

const clearAllCategoryData = async () => {
  const confirmFirst = confirm(`⚠️ PERINGATAN KERAS!\n\nAnda akan menghapus SELURUH data pada kategori "${targetType.value.toUpperCase()}" secara permanen.\n\nApakah Anda yakin?`);
  if (!confirmFirst) return;

  const confirmSecond = confirm(`APAKAH ANDA BENAR-BENAR YAKIN?\nTindakan ini akan mengosongkan seluruh isi tabel di Google Sheets.\n\nKlik OK jika Anda yakin.`);
  if (!confirmSecond) return;

  isProcessing.value = true;
  try {
    const payload = {
      action: 'delete',
      type: targetType.value === 'unit' ? 'uker' : targetType.value,
      deleteAll: true
    };

    const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify(payload) });
    const res = await response.json();

    if (res.status === 'success') {
      showToast(`Berhasil! Seluruh data ${targetType.value.toUpperCase()} telah dikosongkan.`, 'success');
      clearCache();
      await fetchData(true); // reload store data
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
            <CustomSelect 
              v-model="targetType" 
              :options="categories.map(t => ({ label: t.n, value: t.id }))" 
              :disabled="isLoading" 
            />
          </div>

          <!-- Desktop Grid -->
          <div class="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-2">
            <button v-for="t in categories" 
              :key="t.id" @click="targetType = t.id"
              :disabled="isLoading"
              :class="[
                targetType === t.id ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
                isLoading ? 'opacity-60 cursor-not-allowed' : ''
              ]"
              class="p-4 flex flex-col items-center justify-center gap-2.5 rounded-xl border transition-all active:scale-[0.98]"
            >
              <component :is="t.i" class="w-5 h-5" :class="targetType === t.id ? 'text-blue-600' : 'text-slate-400'" />
              <span class="font-semibold text-xs text-center leading-tight">{{ t.n }}</span>
            </button>
          </div>
        </div>

        <!-- STEP 2 (Untuk data periodik) -->
        <div v-if="targetType !== 'nasabah'" class="space-y-3">
          <label class="text-sm font-semibold text-slate-700 block">2. Pilih Periode yang Ingin Dihapus</label>
          <div v-if="isLoading" class="animate-pulse">
            <div class="h-12 bg-slate-50 rounded-lg w-full border border-slate-200/50 flex items-center px-4">
              <div class="h-4 bg-slate-200 rounded w-1/3"></div>
            </div>
          </div>
          <div v-else-if="availableDates.length > 0">
            <div class="relative">
              <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none z-10" />
              <CustomSelect 
                v-model="selectedDateToDelete" 
                :options="availableDates" 
                placeholder="-- Pilih Tanggal / Bulan --"
                class="pl-10"
              />
            </div>
          </div>
          <div v-else class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <SearchX class="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <p class="text-slate-500 font-medium text-sm">Tidak ada riwayat data pada kategori ini.</p>
          </div>
        </div>

        <!-- STEP 2 (Untuk data statis Nasabah Pareto) -->
        <div v-else class="space-y-3">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-1">
            <label class="text-sm font-bold text-slate-700">2. Kelola Data Nasabah Pareto (Hapus Per Baris)</label>
            <button
              @click="clearAllCategoryData"
              :disabled="isProcessing"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-[10px] font-black text-rose-600 hover:bg-rose-100 hover:text-rose-700 active:scale-95 transition-all w-fit disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 class="w-3.5 h-3.5" /> Kosongkan Semua Data
            </button>
          </div>
          
          <div v-if="isLoading" class="animate-pulse space-y-2">
            <div v-for="i in 3" :key="i" class="h-12 bg-slate-50 rounded-xl w-full border border-slate-200/50" />
          </div>
          
          <div v-else-if="rawData.nasabah && rawData.nasabah.length > 0" class="overflow-hidden border border-slate-200 rounded-xl">
            <div class="max-h-96 overflow-y-auto">
              <table class="w-full text-xs text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th class="p-3 w-10 text-center">No</th>
                    <th class="p-3">Nama Nasabah</th>
                    <th class="p-3">Jenis Usaha</th>
                    <th class="p-3 text-right">Volume</th>
                    <th class="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="(row, idx) in rawData.nasabah" :key="idx" class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-3 text-center text-slate-400">{{ idx + 1 }}</td>
                    <td class="p-3 font-semibold text-slate-800">{{ row.Nama_Nasabah || row['Nama Nasabah'] || '-' }}</td>
                    <td class="p-3 text-slate-600">{{ row.Jenis_Usaha || row['Jenis Usaha'] || '-' }}</td>
                    <td class="p-3 text-right font-semibold text-slate-700 tabular-nums">
                      {{ (Number(row.Volume) || 0).toLocaleString('id-ID') }}
                    </td>
                    <td class="p-3 text-center">
                      <button
                        @click="deleteSingleRow('Nama_Nasabah', row.Nama_Nasabah || row['Nama Nasabah'], row.Nama_Nasabah || row['Nama Nasabah'])"
                        :disabled="isProcessing"
                        class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                        title="Hapus Nasabah"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <SearchX class="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <p class="text-slate-500 font-medium text-sm">Tidak ada data Nasabah Pareto di database.</p>
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