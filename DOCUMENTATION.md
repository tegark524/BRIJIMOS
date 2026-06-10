# Dokumentasi Lengkap Sistem BRIJIMOS

**(BRI Jemursari Monitoring System)**

Dokumentasi ini dirancang secara profesional untuk memberikan panduan komprehensif mengenai arsitektur sistem, alur penggunaan, detail fungsi sistem, skema basis data, serta seluruh kode sumber (source code) aplikasi BRIJIMOS tanpa pemangkasan.

---

## 1. Gambaran Umum Sistem

BRIJIMOS (BRI Jemursari Monitoring System) adalah aplikasi dashboard analisis data berbasis web yang dirancang untuk memonitor, menganalisis, dan mengelola data kinerja perbankan di BRI Kantor Cabang Jemursari. Sistem ini memfasilitasi visualisasi data secara real-time yang mencakup:

- **Dana RMFT**: Pemantauan portofolio dana kelolaan (Giro, Tabungan, Deposito) per Personal Number (PN) pegawai.
- **Unit Kerja**: Analisis pertumbuhan saldo per unit kerja (Kantor Cabang Pembantu dan Kantor Kas) untuk produk tertentu.
- **Keragaan**: Evaluasi pencapaian aktual (pencapaian bisnis cabang) terhadap target Rencana Kerja Anggaran (RKA).
- **Pipeline**: Pemantauan calon nasabah baru, nilai prospek, dan tingkat realisasi oleh Relationship Manager (RM).
- **Achievement RMFT**: Skor pencapaian KPI (Key Performance Indicators) dari RMFT per periode.

Sistem ini didesain agar user (Data Analyst / Management) dapat melakukan pengisian data dengan sangat cepat dari file Microsoft Excel menggunakan teknologi Smart Paste tanpa perlu mengunggah file.

---

## 2. Arsitektur dan Teknologi

BRIJIMOS mengadopsi arsitektur Serverless & Sheets-as-a-Database yang efisien, hemat biaya, dan mudah dalam pemeliharaan.

### 2.1 Frontend Layer

- Framework: Vue 3 (Single File Component dengan `<script setup>`).
- Build Tool: Vite.
- Styling: Tailwind CSS v4 dan PostCSS untuk interface premium, responsif, dan dinamis.
- Icons: Lucide Vue Next.
- Charts: ApexCharts dan Vue3 ApexCharts untuk visualisasi grafis interaktif.
- State Management: Reactive State Store terpusat (`src/store.js`) dengan fitur concurrency lock dan session caching.

### 2.2 Backend dan Database Layer

- Database: Google Sheets sebagai penyimpanan data relasional terstruktur.
- Backend API: Google Apps Script (GAS) yang dideploy sebagai Web App. GAS bertindak sebagai serverless RESTful API yang menerima permintaan HTTP GET (`doGet`) dan HTTP POST (`doPost`).

---

## 3. Skema dan Struktur Data Google Sheets

Sistem memetakan data ke 6 sheet di dalam file spreadsheet utama. Berikut adalah struktur kolom yang harus dipertahankan:

### 3.1 Sheet: Sheet1 (Dana RMFT / Pegawai)

- **PN**: Nomor Induk Pegawai (Personal Number).
- **Nama_Pegawai**: Nama Lengkap Pegawai.
- **Kelolaan_Giro**: Saldo kelolaan produk Giro.
- **Kelolaan_Tab**: Saldo kelolaan produk Tabungan.
- **Kelolaan_Depo**: Saldo kelolaan produk Deposito.
- **Tanggal_Data**: Tanggal pencatatan data (Format: YYYY-MM-DD).

### 3.2 Sheet: Data_Unit (Unit Kerja)

- **Unit_KC**: Kode Unit Kerja / Kantor Cabang.
- **Nama_Unit**: Nama Unit Kerja.
- **Produk**: Jenis Produk (Giro, Tabungan, Deposito).
- **Nilai**: Total Saldo Nominal.
- **Tanggal_Data**: Tanggal pencatatan data (Format: YYYY-MM-DD).

### 3.3 Sheet: Keragaan_Cabang (Keragaan Aktual)

- **Produk**: Nama produk/metrik (contoh: GIRO, TAB, CASA).
- **Nilai**: Total pencapaian aktual cabang.
- **Tanggal_Data**: Tanggal pencatatan data (Format: YYYY-MM-DD).

### 3.4 Sheet: RKA_Data (Target Rencana Kerja Anggaran)

- **Produk**: Nama produk/metrik target.
- **Nilai_RKA**: Nilai nominal target anggaran (RKA).
- **Bulan_Tahun**: Periode target anggaran (Format: YYYY-MM).

### 3.5 Sheet: Pipeline_Data (Pipeline Bisnis)

- **NAMA_RMFT**: Nama Relationship Manager pengelola.
- **NAMA_NASABAH**: Nama calon nasabah prospek.
- **PIPELINE**: Nilai nominal potensi bisnis.
- **KETERANGAN**: Klasifikasi produk (GIRO, TAB, DEPO).
- **NOMINAL**: Nominal transaksi yang telah direalisasikan.
- **TANGGAL**: Tanggal pencatatan target pipeline.

### 3.6 Sheet: Pencapaian_RMFT (Metrik Achievement RMFT)

Mendukung format dinamis parameter kinerja:

- NAMA_RMFT
- BULAN (Format: YYYY-MM)
- TANGGAL (Format: YYYY-MM-DD)
- AVG_TAB, posisi_tab, AVG_GIRO, AVG_DPK, FBI_PA, EDC_QRIS, DPK_MERCHANT, SV, NEW_PAYROLL, PROD_QLOLA, PROG_KANWIL, PROG_SGF, casa_me, sv_edc, user_activ_b, user_activ_qlola, ph_program, TOTAL.

---

## 4. Alur Penggunaan (User Workflow)

### 4.1 Alur Pemantauan & Analisis (Dashboard)

- Akses Halaman: Pengguna membuka dashboard utama yang memuat data visual.
- Pilih Kategori: Navigasi menggunakan sidebar kiri atau dropdown atas untuk memilih tab analisis data (Dana RMFT, Unit Kerja, Keragaan, Pipeline, atau Achievement).
- Interaksi & Filter: Pengguna dapat memfilter data berdasarkan rentang waktu baseline, jenis produk, pencarian nama/PN, serta mengubah ukuran skala tampilan tabel demi kenyamanan membaca data.

### 4.2 Alur Penginputan Data (Entry Center)

Aplikasi menyediakan fitur penginputan massal secara cerdas tanpa perlu upload file manual:

1. Buka menu Input Data.
2. Pilih jenis kategori data yang ingin dimasukkan (Dana RMFT, Unit Kerja, Keragaan, RKA, Pipeline, atau Achievement RMFT).
3. Tentukan tanggal pencatatan data pada input kalender.
4. Buka file spreadsheet Excel Anda, blok rentang data yang diinginkan, lalu salin (Ctrl+C).
5. Kembali ke BRIJIMOS, letakkan kursor pada kotak Excel Paste Zone, lalu tempelkan (Ctrl+V).
6. Sistem secara otomatis mengurai teks tabular (TSV) tersebut secara real-time dan menampilkan Live Preview di panel kanan.
7. Validasi Data: Jika format tidak sesuai atau kolom penting kosong, sistem memunculkan indikator peringatan berwarna merah secara detail di baris mana error terjadi.
8. Jika data sudah valid, klik tombol Kirim Data ke Database untuk menyimpan ke Google Sheets.

### 4.3 Alur Manajemen Data (Pembersihan / Pemeliharaan)

Untuk mencegah redundansi data atau menghapus kesalahan input:

1. Buka menu Management.
2. Pilih Kategori Laporan yang ingin dikelola.
3. Sistem akan menampilkan daftar periode tanggal/bulan yang saat ini tersimpan di Google Sheets secara dinamis.
4. Pilih periode tanggal/bulan yang ingin dihapus.
5. Klik tombol Hapus Permanen Data dan konfirmasi dialog. Data terkait periode tersebut akan segera dihapus secara bersih dari database Google Sheets.

---

## 5. Implementasi Kode Sumber (Full Source Code)

Bagian ini menyajikan seluruh kode sumber aplikasi BRIJIMOS secara utuh tanpa ada bagian yang dipotong atau disingkat.

### 5.1 Kode Entry Point Utama (src/main.js)

```javascript
import { createApp } from "vue";
import "./style.css"; // Pastikan Tailwind sudah terinstall di sini
import App from "./App.vue";
import { router } from "./router"; // Kita akan buat file ini di langkah 2
import VueApexCharts from "vue3-apexcharts";

const app = createApp(App);
app.use(router);
app.use(VueApexCharts);
app.mount("#app");
```

### 5.2 Konfigurasi Router (src/router/index.js)

```javascript
import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import InputData from "../views/InputData.vue";
import ManageData from "../views/ManageData.vue";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/input", component: InputData },
  { path: "/manage", component: ManageData },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
```

### 5.3 State Management (src/store.js)

```javascript
import { reactive } from "vue";

const apiUrl = import.meta.env.VITE_API_URL;

export const store = reactive({
  rawData: {
    pegawai: [],
    unit: [],
    keragaan: [],
    rka: [],
    pipeline: [],
    rmft_ach: [],
  },
  isLoading: false,
  isLoaded: false,
  lastUpdated: null,
  error: null,

  // Cache of filter states for Dashboard so selections are persistent across page changes
  dashboard: {
    activeTab: "pegawai",
    selectedProduct: "Giro",
    selectedDateUnit: "",
    selectedBaselineUnit: "",
    selectedBaseline: "",
    selectedLatest: "",
    selectedMonthRmft: "",
    searchQuery: "",
    tableScale: 1,
    selectedPegawaiProduct: "Giro",
    selectedUnitProduct: "Giro",
    pipelineSelectedMonth: "",
    pipelineSortOrder: "default",
  },

  // Cache of options for ManageData
  manage: {
    targetType: "unit",
    selectedDateToDelete: "",
  },
});

let fetchPromise = null;

export const fetchData = async (forceRefresh = false) => {
  // Concurrency lock
  if (store.isLoading && fetchPromise) {
    return fetchPromise;
  }

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();

  // Return cached memory state if fresh
  if (
    !forceRefresh &&
    store.isLoaded &&
    store.rawData &&
    store.lastUpdated &&
    now - store.lastUpdated < CACHE_DURATION
  ) {
    return store.rawData;
  }

  store.isLoading = true;
  store.error = null;

  fetchPromise = (async () => {
    try {
      const CACHE_KEY = "brijimos_data";
      const CACHE_TIME_KEY = "brijimos_data_timestamp";

      let data;
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      const cacheTime = sessionStorage.getItem(CACHE_TIME_KEY);

      if (
        !forceRefresh &&
        cachedData &&
        cacheTime &&
        now - Number(cacheTime) < CACHE_DURATION
      ) {
        data = JSON.parse(cachedData);
      } else {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch data from API");
        data = await response.json();
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
          sessionStorage.setItem(CACHE_TIME_KEY, now.toString());
        } catch (e) {
          console.warn("sessionStorage write failed", e);
        }
      }

      store.rawData = {
        pegawai: data.pegawai || [],
        unit: data.unit || [],
        keragaan: data.keragaan || [],
        rka: data.rka || [],
        pipeline: data.pipeline || [],
        rmft_ach: data.rmft_ach || [],
      };
      store.isLoaded = true;
      store.lastUpdated = now;
      return store.rawData;
    } catch (error) {
      console.error("Store Fetch Error:", error);
      store.error = error.message || "Koneksi API Gagal";
      throw error;
    } finally {
      store.isLoading = false;
      fetchPromise = null;
    }
  })();

  return fetchPromise;
};

export const clearCache = () => {
  sessionStorage.removeItem("brijimos_data");
  sessionStorage.removeItem("brijimos_data_timestamp");
  store.isLoaded = false;
  store.lastUpdated = null;
};
```

### 5.4 Layout & Shell Utama (src/App.vue)

```vue
<template>
  <div
    class="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative"
    style="font-family: 'Inter', 'Geist', sans-serif;"
  >
    <!-- Mobile Header -->
    <header
      class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-5 flex justify-between items-center z-50"
    >
      <div class="flex items-center space-x-3">
        <img src="/logo.png" alt="Logo BRI" class="w-8 h-8 object-contain" />
        <span class="font-bold text-lg text-blue-900 tracking-tight"
          >BRIJIMOS</span
        >
      </div>

      <button
        @click="isSidebarOpen = !isSidebarOpen"
        class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
      >
        <X v-if="isSidebarOpen" class="w-6 h-6" />
        <Menu v-else class="w-6 h-6" />
      </button>
    </header>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo Section -->
      <div class="h-20 flex items-center px-6 border-b border-slate-200">
        <div class="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo BRI" class="w-8 h-8 object-contain" />
          <div>
            <h1
              class="text-xl font-bold text-blue-900 tracking-tight leading-none"
            >
              BRIJIMOS
            </h1>
            <p
              class="text-[10px] text-slate-500 font-medium tracking-widest mt-1 uppercase"
            >
              BRI Jemursari Monitoring System
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        <!-- DASHBOARD -->
        <div>
          <button
            @click="toggleMenu('dashboard')"
            class="w-full flex items-center justify-between p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group"
          >
            <div class="flex items-center space-x-3">
              <LayoutDashboard
                class="w-5 h-5 group-hover:text-blue-600 transition-colors"
              />
              <span class="font-semibold text-sm">Dashboard</span>
            </div>
            <ChevronDown
              v-if="openMenus.dashboard"
              class="w-4 h-4 text-slate-400"
            />
            <ChevronRight v-else class="w-4 h-4 text-slate-400" />
          </button>

          <div
            v-show="openMenus.dashboard"
            class="mt-1 mb-2 ml-4 pl-4 border-l border-slate-200 space-y-1"
          >
            <router-link
              to="/?tab=pegawai"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Users class="w-4 h-4" />
              <span>Dana RMFT</span>
            </router-link>
            <router-link
              to="/?tab=unit"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Building2 class="w-4 h-4" />
              <span>Unit Kerja</span>
            </router-link>
            <router-link
              to="/?tab=keragaan"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Activity class="w-4 h-4" />
              <span>Keragaan</span>
            </router-link>
            <router-link
              to="/?tab=pipeline"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <TrendingUp class="w-4 h-4" />
              <span>Pipeline</span>
            </router-link>
            <router-link
              to="/?tab=rmft_ach"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Target class="w-4 h-4" />
              <span>Achievement RMFT</span>
            </router-link>
          </div>
        </div>

        <!-- INPUT DATA -->
        <div>
          <button
            @click="toggleMenu('input')"
            class="w-full flex items-center justify-between p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group"
          >
            <div class="flex items-center space-x-3">
              <PlusCircle
                class="w-5 h-5 group-hover:text-blue-600 transition-colors"
              />
              <span class="font-semibold text-sm">Input Data</span>
            </div>
            <ChevronDown
              v-if="openMenus.input"
              class="w-4 h-4 text-slate-400"
            />
            <ChevronRight v-else class="w-4 h-4 text-slate-400" />
          </button>

          <div
            v-show="openMenus.input"
            class="mt-1 mb-2 ml-4 pl-4 border-l border-slate-200 space-y-1"
          >
            <router-link
              to="/input?type=pegawai"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Users class="w-4 h-4" />
              <span>Dana RMFT</span>
            </router-link>
            <router-link
              to="/input?type=uker"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Building2 class="w-4 h-4" />
              <span>Unit Kerja</span>
            </router-link>
            <router-link
              to="/input?type=keragaan"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Activity class="w-4 h-4" />
              <span>Keragaan</span>
            </router-link>
            <router-link
              to="/input?type=rka"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <FileText class="w-4 h-4" />
              <span>RKA</span>
            </router-link>
            <router-link
              to="/input?type=pipeline"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <TrendingUp class="w-4 h-4" />
              <span>Pipeline</span>
            </router-link>
            <router-link
              to="/input?type=rmft_ach"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Target class="w-4 h-4" />
              <span>Achievement RMFT</span>
            </router-link>
          </div>
        </div>

        <!-- MANAGEMENT -->
        <div>
          <button
            @click="toggleMenu('management')"
            class="w-full flex items-center justify-between p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group"
          >
            <div class="flex items-center space-x-3">
              <Database
                class="w-5 h-5 group-hover:text-blue-600 transition-colors"
              />
              <span class="font-semibold text-sm">Management</span>
            </div>
            <ChevronDown
              v-if="openMenus.management"
              class="w-4 h-4 text-slate-400"
            />
            <ChevronRight v-else class="w-4 h-4 text-slate-400" />
          </button>

          <div
            v-show="openMenus.management"
            class="mt-1 mb-2 ml-4 pl-4 border-l border-slate-200 space-y-1"
          >
            <router-link
              to="/manage?type=pegawai"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Users class="w-4 h-4" />
              <span>Dana RMFT</span>
            </router-link>
            <router-link
              to="/manage?type=unit"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Building2 class="w-4 h-4" />
              <span>Unit Kerja</span>
            </router-link>
            <router-link
              to="/manage?type=keragaan"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Activity class="w-4 h-4" />
              <span>Keragaan</span>
            </router-link>
            <router-link
              to="/manage?type=rka"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <FileText class="w-4 h-4" />
              <span>RKA</span>
            </router-link>
            <router-link
              to="/manage?type=pipeline"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <TrendingUp class="w-4 h-4" />
              <span>Pipeline</span>
            </router-link>
            <router-link
              to="/manage?type=rmft_ach"
              @click="isSidebarOpen = false"
              class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium"
              active-class="bg-blue-50 text-blue-600 font-semibold"
            >
              <Target class="w-4 h-4" />
              <span>Achievement RMFT</span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Footer Sidebar -->
      <div class="p-4 border-t border-slate-200 bg-slate-50/50">
        <div class="flex items-center space-x-3 mb-2">
          <div class="relative flex h-2.5 w-2.5">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"
            ></span>
          </div>
          <span class="text-xs font-semibold text-slate-600"
            >Sistem Online</span
          >
        </div>
        <p class="text-[10px] text-slate-400 font-medium">
          By Tegar Satria Kirana <br />
          <span class="text-blue-600">UPN Veteran Jatim</span>
        </p>
      </div>
    </aside>

    <!-- Overlay Mobile -->
    <transition name="fade">
      <div
        v-if="isSidebarOpen"
        @click="isSidebarOpen = false"
        class="fixed inset-0 bg-slate-900/20 z-[55] lg:hidden backdrop-blur-sm"
      ></div>
    </transition>

    <!-- Main Content -->
    <main
      class="flex-1 flex flex-col h-full overflow-hidden relative pt-16 lg:pt-0"
    >
      <div class="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  LayoutDashboard,
  Database,
  PlusCircle,
  TrendingUp,
  Users,
  Building2,
  Activity,
  Target,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Settings,
  FileText,
} from "lucide-vue-next";

const isSidebarOpen = ref(false);

// State untuk dropdown menu
const openMenus = ref({
  dashboard: true,
  input: false,
  management: false,
});

const toggleMenu = (menu) => {
  openMenus.value[menu] = !openMenus.value[menu];
};
</script>

<style>
/* Reset Default */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Animasi Sidebar Overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Indikator Active Link */
.router-link-active {
}
</style>
```

### 5.5 View: Dashboard (src/views/Dashboard.vue)

```vue
<script setup>
import { onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Users,
  Building2,
  Activity,
  TrendingUp,
  Target,
  Search,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw,
} from "lucide-vue-next";
import { store, fetchData as storeFetchData } from "../store";

// --- STATE / VARIABEL UTAMA ---
const route = useRoute();
const router = useRouter();

const activeTab = computed({
  get: () => store.dashboard.activeTab,
  set: (val) => {
    store.dashboard.activeTab = val;
  },
});
const selectedProduct = computed({
  get: () => store.dashboard.selectedProduct,
  set: (val) => {
    store.dashboard.selectedProduct = val;
  },
});
const selectedDateUnit = computed({
  get: () => store.dashboard.selectedDateUnit,
  set: (val) => {
    store.dashboard.selectedDateUnit = val;
  },
});
const selectedBaselineUnit = computed({
  get: () => store.dashboard.selectedBaselineUnit,
  set: (val) => {
    store.dashboard.selectedBaselineUnit = val;
  },
});
const searchQuery = computed({
  get: () => store.dashboard.searchQuery,
  set: (val) => {
    store.dashboard.searchQuery = val;
  },
});
const selectedBaseline = computed({
  get: () => store.dashboard.selectedBaseline,
  set: (val) => {
    store.dashboard.selectedBaseline = val;
  },
});
const selectedLatest = computed({
  get: () => store.dashboard.selectedLatest,
  set: (val) => {
    store.dashboard.selectedLatest = val;
  },
});
const selectedMonthRmft = computed({
  get: () => store.dashboard.selectedMonthRmft,
  set: (val) => {
    store.dashboard.selectedMonthRmft = val;
  },
});
const tableScale = computed({
  get: () => store.dashboard.tableScale,
  set: (val) => {
    store.dashboard.tableScale = val;
  },
});
const selectedPegawaiProduct = computed({
  get: () => store.dashboard.selectedPegawaiProduct,
  set: (val) => {
    store.dashboard.selectedPegawaiProduct = val;
  },
});
const selectedUnitProduct = computed({
  get: () => store.dashboard.selectedUnitProduct,
  set: (val) => {
    store.dashboard.selectedUnitProduct = val;
  },
});
const pipelineSelectedMonth = computed({
  get: () => store.dashboard.pipelineSelectedMonth,
  set: (val) => {
    store.dashboard.pipelineSelectedMonth = val;
  },
});
const pipelineSortOrder = computed({
  get: () => store.dashboard.pipelineSortOrder,
  set: (val) => {
    store.dashboard.pipelineSortOrder = val;
  },
});

const rawData = computed(() => store.rawData);
const isLoading = computed(() => store.isLoading);

if (route.query.tab) {
  store.dashboard.activeTab = route.query.tab;
}

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) store.dashboard.activeTab = newTab;
  },
);

watch(activeTab, (newVal) => {
  if (route.query.tab !== newVal) {
    router.replace({ query: { ...route.query, tab: newVal } });
  }
});

const menuTabs = [
  { id: "pegawai", l: "Dana RMFT", icon: Users },
  { id: "unit", l: "Unit Kerja", icon: Building2 },
  { id: "keragaan", l: "Keragaan", icon: Activity },
  { id: "pipeline", l: "Pipeline", icon: TrendingUp },
  { id: "rmft_ach", l: "Achievement", icon: Target },
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
  "MAU QLOLA",
];

// --- HELPERS ---
const formatToLocalWIB = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return `${wib.getUTCFullYear()}-${String(wib.getUTCMonth() + 1).padStart(2, "0")}-${String(wib.getUTCDate()).padStart(2, "0")}`;
};

const formatNum = (val) =>
  val === 0 || isNaN(val) ? "-" : val.toLocaleString("id-ID");

const formatPercent = (val) => {
  if (val === undefined || val === null || val === "") return "-";
  return val + "%";
};

const formatJuta = (val) => {
  const num = Number(val);
  if (num === 0 || isNaN(num)) return "-";
  return (num / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 });
};

const deltaClass = (val) => {
  if (val < 0) return "text-red-600 font-medium";
  if (val > 0) return "text-green-600 font-medium";
  return "text-slate-800 font-medium";
};

const cellBgClass = (val, threshold = 0) => {
  if (val < threshold) return "text-red-700 bg-red-50 font-medium";
  if (val > threshold) return "text-green-700 bg-green-50 font-medium";
  return "text-slate-800 bg-white font-medium";
};

// --- SET DEFAULT FILTERS ---
const setDefaultFilters = () => {
  const data = store.rawData;
  if (!data) return;

  if (data.keragaan && data.keragaan.length > 0) {
    const kDates = [
      ...new Set(
        data.keragaan.map((item) => formatToLocalWIB(item.Tanggal_Data)),
      ),
    ].sort();
    if (kDates.length > 0 && !store.dashboard.selectedDateUnit) {
      store.dashboard.selectedDateUnit = kDates[kDates.length - 1];
    }
  }

  if (data.unit && data.unit.length > 0) {
    const uDates = [
      ...new Set(data.unit.map((item) => formatToLocalWIB(item.Tanggal_Data))),
    ].sort();
    if (uDates.length > 0 && !store.dashboard.selectedBaselineUnit) {
      store.dashboard.selectedBaselineUnit = uDates[0];
    }
  }

  if (data.pegawai && data.pegawai.length > 0) {
    const pDates = [
      ...new Set(
        data.pegawai.map((item) => formatToLocalWIB(item.Tanggal_Data)),
      ),
    ].sort();
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
    const rmftMonths = [
      ...new Set(
        data.rmft_ach.map((i) => i.BULAN || i.bulan || "").filter(Boolean),
      ),
    ].sort();
    if (rmftMonths.length > 0 && !store.dashboard.selectedMonthRmft) {
      store.dashboard.selectedMonthRmft = rmftMonths[rmftMonths.length - 1];
    }
  }
};

// --- FETCH DATA ---
const fetchData = async (forceRefresh = false) => {
  if (forceRefresh) {
    store.dashboard.selectedDateUnit = "";
    store.dashboard.selectedBaselineUnit = "";
    store.dashboard.selectedBaseline = "";
    store.dashboard.selectedLatest = "";
    store.dashboard.selectedMonthRmft = "";
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
  const pns = [...new Set(data.map((i) => i.PN))];
  return pns
    .map((pn) => {
      const rows = data.filter((r) => r.PN === pn);
      const latest =
        rows.find(
          (r) => formatToLocalWIB(r.Tanggal_Data) === selectedLatest.value,
        ) || {};
      const comp =
        rows.find(
          (r) => formatToLocalWIB(r.Tanggal_Data) === selectedBaseline.value,
        ) || {};
      const n = (o, k) => Number(o[k] || 0);
      return {
        pn,
        nama: latest.Nama_Pegawai || comp.Nama_Pegawai || "Unknown",
        c_g: n(comp, "Kelolaan_Giro"),
        c_t: n(comp, "Kelolaan_Tab"),
        c_d: n(comp, "Kelolaan_Depo"),
        l_g: n(latest, "Kelolaan_Giro"),
        l_t: n(latest, "Kelolaan_Tab"),
        l_d: n(latest, "Kelolaan_Depo"),
        d_g: n(latest, "Kelolaan_Giro") - n(comp, "Kelolaan_Giro"),
        d_t: n(latest, "Kelolaan_Tab") - n(comp, "Kelolaan_Tab"),
        d_d: n(latest, "Kelolaan_Depo") - n(comp, "Kelolaan_Depo"),
        total_c:
          n(comp, "Kelolaan_Giro") +
          n(comp, "Kelolaan_Tab") +
          n(comp, "Kelolaan_Depo"),
        total_l:
          n(latest, "Kelolaan_Giro") +
          n(latest, "Kelolaan_Tab") +
          n(latest, "Kelolaan_Depo"),
      };
    })
    .filter(
      (i) =>
        String(i.nama)
          .toLowerCase()
          .includes(String(searchQuery.value).toLowerCase()) ||
        String(i.pn).includes(String(searchQuery.value)),
    );
});

const unitAnalysis = computed(() => {
  const allUnitData = rawData.value.unit;
  if (!allUnitData.length || !selectedDateUnit.value) return [];
  const data = allUnitData.filter((i) => i.Produk === selectedProduct.value);
  const units = [...new Set(data.map((i) => i.Unit_KC))];
  const tglPilih = selectedDateUnit.value;
  const allDates = [
    ...new Set(data.map((i) => formatToLocalWIB(i.Tanggal_Data))),
  ].sort();
  const idx = allDates.indexOf(tglPilih);
  const tglKemarin = idx > 0 ? allDates[idx - 1] : null;
  const bulanPilih = tglPilih.substring(0, 7);
  const tglAkhirBulanLalu = allDates.findLast((d) => d < bulanPilih);
  const tglAkhirTahunLalu = allDates.findLast(
    (d) => d < tglPilih.substring(0, 4),
  );

  return units.map((u) => {
    const rows = data.filter((r) => r.Unit_KC === u);
    const getVal = (d) =>
      d
        ? Number(
            rows.find((r) => formatToLocalWIB(r.Tanggal_Data) === d)?.Nilai ||
              0,
          )
        : 0;
    const valPilih = getVal(tglPilih);
    return {
      u,
      nama: rows[0]?.Nama_Unit || "Unit Kerja",
      tglKemarin,
      tglAkhirBulanLalu,
      tglAkhirTahunLalu,
      valPilih,
      valKemarin: getVal(tglKemarin),
      valBulanLalu: getVal(tglAkhirBulanLalu),
      valTahunLalu: getVal(tglAkhirTahunLalu),
      dtd: valPilih - getVal(tglKemarin),
      mtd: valPilih - getVal(tglAkhirBulanLalu),
      ytd: valPilih - getVal(tglAkhirTahunLalu),
    };
  });
});

const keragaanAnalysis = computed(() => {
  const realData = rawData.value.keragaan;
  const targetData = rawData.value.rka;
  if (!realData.length || !selectedDateUnit.value) return [];
  const tglPilih = selectedDateUnit.value;
  const bulanPilih = tglPilih.substring(0, 7);
  const allDates = [
    ...new Set(realData.map((i) => formatToLocalWIB(i.Tanggal_Data))),
  ].sort();
  const tglAkhirBulanLalu = allDates.findLast((d) => d < bulanPilih);
  const tglJan = allDates.find((d) => d.includes("-01-"));

  return fixedKeragaanProducts.map((prod) => {
    const rowsReal = realData.filter(
      (r) => r.Produk.toUpperCase() === prod.toUpperCase(),
    );
    let rowRka = targetData.find(
      (r) =>
        formatToLocalWIB(r.Bulan_Tahun).substring(0, 7) === bulanPilih &&
        r.Produk.toUpperCase() === prod.toUpperCase(),
    );
    if (!rowRka) {
      rowRka = [...targetData]
        .filter((r) => r.Produk.toUpperCase() === prod.toUpperCase())
        .sort((a, b) => new Date(b.Bulan_Tahun) - new Date(a.Bulan_Tahun))[0];
    }
    const getVal = (d) =>
      d
        ? Number(
            rowsReal.find((r) => formatToLocalWIB(r.Tanggal_Data) === d)
              ?.Nilai || 0,
          )
        : 0;
    const realSekarang = getVal(tglPilih);
    const rkaVal = Number(rowRka?.Nilai_RKA || 0);
    return {
      produk: prod,
      realSekarang,
      realJan: getVal(tglJan),
      rkaVal,
      pencPersen: rkaVal > 0 ? (realSekarang / rkaVal) * 100 : 0,
      pencRka: realSekarang - rkaVal,
      mtd: realSekarang - getVal(tglAkhirBulanLalu),
    };
  });
});

// --- PIPELINE ANALYSIS ---

const togglePipelineSort = () => {
  if (pipelineSortOrder.value === "default") pipelineSortOrder.value = "asc";
  else if (pipelineSortOrder.value === "asc") pipelineSortOrder.value = "desc";
  else pipelineSortOrder.value = "default";
};

const pipelineMonths = computed(() => {
  const data = rawData.value.pipeline || [];
  if (!data.length) return [];
  const months = data
    .map((i) => {
      const d = i.TANGGAL_TARGET || i.Tanggal || i.TANGGAL || "";
      if (!d) return null;
      const date = new Date(d);
      if (isNaN(date.getTime())) return null;
      return formatToLocalWIB(d).substring(0, 7);
    })
    .filter(Boolean);
  return [...new Set(months)].sort().reverse();
});

const pipelineAnalysis = computed(() => {
  let data = rawData.value.pipeline || [];
  if (!data.length) return [];
  const q = String(searchQuery.value).toLowerCase();
  const month = pipelineSelectedMonth.value;

  let filtered = data.filter((i) => {
    const rmft = String(i.NAMA_RMFT || i.RMFT || "").toLowerCase();
    const nasabah = String(
      i.NAMA_NASABAH || i.Nasabah || i.NASABAH || "",
    ).toLowerCase();
    const ket = String(i.KETERANGAN || i.Ket || "").toLowerCase();
    const matchQ = rmft.includes(q) || nasabah.includes(q) || ket.includes(q);

    let matchMonth = true;
    if (month) {
      const d = i.TANGGAL_TARGET || i.Tanggal || i.TANGGAL || "";
      const localD = formatToLocalWIB(d).substring(0, 7);
      matchMonth = localD === month;
    }
    return matchQ && matchMonth;
  });

  if (pipelineSortOrder.value === "asc" || pipelineSortOrder.value === "desc") {
    filtered.sort((a, b) => {
      const da = new Date(
        a.TANGGAL_TARGET || a.Tanggal || a.TANGGAL || 0,
      ).getTime();
      const db = new Date(
        b.TANGGAL_TARGET || b.Tanggal || b.TANGGAL || 0,
      ).getTime();
      return pipelineSortOrder.value === "asc" ? da - db : db - da;
    });
  } else {
    filtered.sort((a, b) => {
      const rmftA = String(a.NAMA_RMFT || a.RMFT || "");
      const rmftB = String(b.NAMA_RMFT || b.RMFT || "");
      return rmftA.localeCompare(rmftB);
    });
  }

  return filtered;
});

const rmftPipelineSummary = computed(() => {
  const data = rawData.value.pipeline || [];
  const summary = {};
  data.forEach((i) => {
    const rmft = String(i.NAMA_RMFT || i.RMFT || "Unknown RMFT");
    const valPipeline = Number(i.PIPELINE || i.Pipeline || i.pipeline || 0);
    const valRealisasi = Number(
      i.REALISASI || i.Nominal || i.NOMINAL || i.nominal || 0,
    );

    if (!summary[rmft]) summary[rmft] = { pipeline: 0, realisasi: 0 };
    summary[rmft].pipeline += valPipeline;
    summary[rmft].realisasi += valRealisasi;
  });

  return Object.keys(summary)
    .map((rmft) => ({
      rmft,
      totalPipeline: summary[rmft].pipeline,
      totalRealisasi: summary[rmft].realisasi,
    }))
    .sort((a, b) => b.totalPipeline - a.totalPipeline)
    .slice(0, 10);
});

// --- RMFT ACHIEVEMENT ANALYSIS ---
const achievementMonths = computed(() => {
  const data = rawData.value.rmft_ach || [];
  if (!data.length) return [];
  const months = data
    .map((i) => String(i.BULAN || i.bulan || ""))
    .filter(Boolean);
  return [...new Set(months)].sort().reverse();
});

const rmftAchievementAnalysis = computed(() => {
  const data = rawData.value.rmft_ach || [];
  if (!data.length) return [];
  const q = String(searchQuery.value).toLowerCase();
  const month = selectedMonthRmft.value;

  return data.filter((i) => {
    const m = String(i.BULAN || i.bulan || "");
    if (month && m !== month) return false;
    const rmft = String(
      i.NAMA_RMFT ||
        i.RMFT ||
        i.rmft ||
        i["Keterangan (Nama RMFT)"] ||
        i.KETERANGAN ||
        i.Keterangan ||
        "",
    ).toLowerCase();
    return rmft.includes(q);
  });
});

const rmftColHasData = computed(() => {
  const data = rmftAchievementAnalysis.value;
  if (!data.length) return {};

  const has = (key1, key2) =>
    data.some((item) => {
      const val = item[key1] ?? item[key2];
      return (
        val !== 0 &&
        val !== "0" &&
        val !== null &&
        val !== undefined &&
        val !== ""
      );
    });

  return {
    avg_tab: has("AVG_TAB", "avg_tab"),
    posisi_tab: has("POSISI_TAB", "posisi_tab"),
    avg_giro: has("AVG_GIRO", "avg_giro"),
    avg_dpk: has("AVG_DPK", "avg_dpk"),
    fbi_pa: has("FBI_PA", "fbi_pa"),
    edc_qris: has("EDC_QRIS", "edc_qris"),
    dpk_merchant: has("DPK_MERCHANT", "dpk_merchant"),
    sv: has("SV", "sv"),
    new_payroll: has("NEW_PAYROLL", "new_payroll"),
    prod_qlola: has("PROD_QLOLA", "prod_qlola"),
    prog_kanwil: has("PROG_KANWIL", "prog_kanwil"),
    prog_sgf: has("PROG_SGF", "prog_sgf"),
    casa_me: has("CASA_ME", "casa_me"),
    sv_edc: has("SV_EDC", "sv_edc"),
    user_activ_b: has("USER_ACTIV_B", "user_activ_b"),
    user_activ_qlola: has("USER_ACTIV_QLOLA", "user_activ_qlola"),
    ph_program: has("PH_PROGRAM", "ph_program"),
  };
});

// --- CHARTS LOGIC ---

const pegawaiChartOptions = computed(() => ({
  chart: {
    type: "bar",
    toolbar: { show: false },
    fontFamily: "Inter, sans-serif",
  },
  plotOptions: {
    bar: { horizontal: false, columnWidth: "45%", borderRadius: 4 },
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 4,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
  },
  stroke: { show: true, width: 2, colors: ["transparent"] },
  xaxis: {
    categories: pegawaiComparison.value
      .slice(0, 10)
      .map((i) => i.nama.split(" ")[0]),
    labels: { style: { fontSize: "11px", colors: "#64748b" } },
  },
  yaxis: {
    labels: {
      style: { fontSize: "11px", colors: "#64748b" },
      formatter: (v) => formatNum(v),
    },
  },
  colors: [
    "#64748b", // Abu tua untuk pembanding (Baseline)
    ({ dataPointIndex }) => {
      const item = pegawaiComparison.value[dataPointIndex];
      if (!item) return "#64748b";
      const map = {
        Giro: item.l_g - item.c_g,
        Tabungan: item.l_t - item.c_t,
        Deposito: item.l_d - item.c_d,
      };
      return map[selectedPegawaiProduct.value] >= 0 ? "#10b981" : "#ef4444"; // Hijau jika naik/sama, Merah jika turun
    },
  ],
  legend: {
    position: "top",
    horizontalAlign: "right",
    fontSize: "12px",
    customLegendItems: ["Baseline", "Latest (Naik/Sama)", "Latest (Turun)"],
    markers: { radius: 12, fillColors: ["#64748b", "#10b981", "#ef4444"] },
    onItemClick: { toggleDataSeries: false },
    onItemHover: { highlightDataSeries: false },
  },
  tooltip: { y: { formatter: (v) => formatNum(v) } },
}));

const pegawaiChartSeries = computed(() => {
  const map = {
    Giro: { c: "c_g", l: "l_g" },
    Tabungan: { c: "c_t", l: "l_t" },
    Deposito: { c: "c_d", l: "l_d" },
  };
  const key = map[selectedPegawaiProduct.value];
  return [
    {
      name: "Baseline",
      data: pegawaiComparison.value.slice(0, 10).map((i) => i[key.c]),
    },
    {
      name: "Latest",
      data: pegawaiComparison.value.slice(0, 10).map((i) => i[key.l]),
    },
  ];
});

const keragaanChartOptions = computed(() => ({
  chart: {
    type: "bar",
    toolbar: { show: false },
    fontFamily: "Inter, sans-serif",
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: "50%",
      borderRadius: 4,
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (v) => v.toFixed(1) + "%",
    style: { fontSize: "11px", colors: ["#ffffff"] },
  },
  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 4,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: keragaanAnalysis.value.map((i) => i.produk),
    labels: {
      formatter: (v) => v + "%",
      style: { fontSize: "11px", colors: "#64748b" },
    },
    max: 150,
  },
  yaxis: {
    labels: { style: { fontSize: "11px", colors: "#64748b" } },
  },
  annotations: {
    xaxis: [
      {
        x: 100,
        borderColor: "#94a3b8",
        strokeDashArray: 4,
        borderWidth: 1,
        label: {
          text: "TARGET (100%)",
          style: {
            color: "#64748b",
            background: "#f8fafc",
            fontSize: "10px",
            fontWeight: 500,
          },
        },
      },
    ],
  },
  colors: [({ value }) => (value >= 100 ? "#10b981" : "#ef4444")], // Hijau jika >= 100%, Merah jika di bawah
  legend: {
    show: true,
    position: "top",
    horizontalAlign: "right",
    fontSize: "12px",
    customLegendItems: ["Target Terpenuhi (≥100%)", "Belum Memenuhi (<100%)"],
    markers: { radius: 12, fillColors: ["#10b981", "#ef4444"] },
    onItemClick: { toggleDataSeries: false },
    onItemHover: { highlightDataSeries: false },
  },
  tooltip: {
    y: { formatter: (v) => v.toFixed(2) + "%" },
  },
}));

const keragaanChartSeries = computed(() => [
  {
    name: "Pencapaian RKA",
    data: keragaanAnalysis.value.map((i) =>
      i.rkaVal > 0
        ? parseFloat(((i.realSekarang / i.rkaVal) * 100).toFixed(2))
        : 0,
    ),
  },
]);

const unitDates = computed(() =>
  [
    ...new Set(
      rawData.value.unit
        .filter((i) => i.Produk === selectedUnitProduct.value)
        .map((i) => formatToLocalWIB(i.Tanggal_Data)),
    ),
  ].sort(),
);

const unitChartOptions = computed(() => ({
  chart: {
    type: "bar",
    toolbar: { show: false },
    fontFamily: "Inter, sans-serif",
  },
  plotOptions: { bar: { horizontal: true, barHeight: "50%", borderRadius: 4 } },
  dataLabels: {
    enabled: true,
    formatter: (v) => formatNum(v),
    style: { fontSize: "10px", colors: ["#ffffff"] },
  },
  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 4,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: unitChartData.value.map((i) => i.nama),
    labels: {
      formatter: (v) => formatNum(v),
      style: { fontSize: "11px", colors: "#64748b" },
    },
  },
  yaxis: {
    labels: { style: { fontSize: "11px", colors: "#64748b" } },
  },
  colors: [
    "#64748b", // Abu tua untuk pembanding (Baseline)
    ({ dataPointIndex }) => {
      const item = unitChartData.value[dataPointIndex];
      if (!item) return "#64748b";
      return item.latest >= item.baseline ? "#10b981" : "#ef4444"; // Hijau jika naik, Merah jika turun
    },
  ],
  legend: {
    position: "top",
    horizontalAlign: "right",
    fontSize: "12px",
    customLegendItems: ["Baseline", "Latest (Naik/Sama)", "Latest (Turun)"],
    markers: { radius: 12, fillColors: ["#64748b", "#10b981", "#ef4444"] },
    onItemClick: { toggleDataSeries: false },
    onItemHover: { highlightDataSeries: false },
  },
  tooltip: { y: { formatter: (v) => formatNum(v) } },
}));

const unitChartData = computed(() => {
  const data = rawData.value.unit.filter(
    (i) => i.Produk === selectedUnitProduct.value,
  );
  const units = [...new Set(data.map((i) => i.Unit_KC))];
  const baselineDate = selectedBaselineUnit.value || unitDates.value[0];
  const latestDate = selectedDateUnit.value;

  return units
    .map((u) => {
      const rows = data.filter((r) => r.Unit_KC === u);
      const getVal = (d) =>
        d
          ? Number(
              rows.find((r) => formatToLocalWIB(r.Tanggal_Data) === d)?.Nilai ||
                0,
            )
          : 0;
      return {
        unit: u,
        nama: rows[0]?.Nama_Unit || u,
        baseline: getVal(baselineDate),
        latest: getVal(latestDate),
      };
    })
    .sort((a, b) => b.latest - a.latest);
});

const unitChartSeries = computed(() => [
  { name: "Baseline", data: unitChartData.value.map((i) => i.baseline) },
  { name: "Latest", data: unitChartData.value.map((i) => i.latest) },
]);

const pipelineChartOptions = computed(() => ({
  chart: {
    type: "bar",
    toolbar: { show: false },
    fontFamily: "Inter, sans-serif",
  },
  plotOptions: { bar: { horizontal: true, barHeight: "60%", borderRadius: 4 } },
  dataLabels: {
    enabled: true,
    formatter: (v) => formatJuta(v) + " Jt",
    style: { fontSize: "10px", colors: ["#ffffff"] },
  },
  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 4,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: rmftPipelineSummary.value.map((i) => i.rmft),
    labels: {
      formatter: (v) => formatJuta(v),
      style: { fontSize: "11px", colors: "#64748b" },
    },
  },
  yaxis: { labels: { style: { fontSize: "11px", colors: "#64748b" } } },
  colors: [
    "#64748b", // Abu-abu tua untuk Target Pipeline
    ({ dataPointIndex }) => {
      const item = rmftPipelineSummary.value[dataPointIndex];
      if (!item) return "#64748b";
      return item.totalRealisasi >= item.totalPipeline ? "#10b981" : "#ef4444"; // Hijau jika tembus, Merah jika belum
    },
  ],
  legend: {
    position: "top",
    horizontalAlign: "right",
    fontSize: "12px",
    customLegendItems: [
      "Target Pipeline",
      "Realisasi (Tembus)",
      "Realisasi (Belum)",
    ],
    markers: { radius: 12, fillColors: ["#64748b", "#10b981", "#ef4444"] },
    onItemClick: { toggleDataSeries: false },
    onItemHover: { highlightDataSeries: false },
  },
  tooltip: { y: { formatter: (v) => formatJuta(v) + " Jt" } },
}));

const pipelineChartSeries = computed(() => [
  {
    name: "Target Pipeline",
    data: rmftPipelineSummary.value.map((i) => i.totalPipeline),
  },
  {
    name: "Realisasi",
    data: rmftPipelineSummary.value.map((i) => i.totalRealisasi),
  },
]);

const rmftChartOptions = computed(() => ({
  chart: {
    type: "bar",
    toolbar: { show: false },
    fontFamily: "Inter, sans-serif",
  },
  plotOptions: { bar: { horizontal: true, barHeight: "50%", borderRadius: 4 } },
  dataLabels: {
    enabled: true,
    formatter: (v) => v.toFixed(1) + "%",
    style: { fontSize: "10px", colors: ["#ffffff"] },
  },
  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 4,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: rmftAchievementAnalysis.value.map(
      (i) =>
        i.NAMA_RMFT ||
        i.RMFT ||
        i.rmft ||
        i["Keterangan (Nama RMFT)"] ||
        i.KETERANGAN ||
        i.Keterangan ||
        "-",
    ),
    labels: {
      formatter: (v) => v + "%",
      style: { fontSize: "11px", colors: "#64748b" },
    },
  },
  yaxis: { labels: { style: { fontSize: "11px", colors: "#64748b" } } },
  annotations: {
    xaxis: [
      {
        x: 100,
        borderColor: "#94a3b8",
        strokeDashArray: 4,
        borderWidth: 1,
        label: {
          text: "TARGET (100%)",
          style: {
            color: "#64748b",
            background: "#f8fafc",
            fontSize: "10px",
            fontWeight: 500,
          },
        },
      },
    ],
  },
  colors: [({ value }) => (value >= 100 ? "#10b981" : "#ef4444")], // Hijau jika >= 100%, Merah jika di bawah
  legend: {
    show: true,
    position: "top",
    horizontalAlign: "right",
    fontSize: "12px",
    customLegendItems: ["Target Terpenuhi (≥100%)", "Belum Memenuhi (<100%)"],
    markers: { radius: 12, fillColors: ["#10b981", "#ef4444"] },
    onItemClick: { toggleDataSeries: false },
    onItemHover: { highlightDataSeries: false },
  },
  tooltip: { y: { formatter: (v) => v.toFixed(2) + "%" } },
}));

const rmftChartSeries = computed(() => [
  {
    name: "Total Pencapaian",
    data: rmftAchievementAnalysis.value.map((i) =>
      Number(i.TOTAL || i.total || 0),
    ),
  },
]);

onMounted(fetchData);
</script>

<template>
  <div
    class="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-900 font-sans relative"
  >
    <!-- Main Content Header -->
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6"
    >
      <!-- Mobile Dropdown Tabs -->
      <div class="block lg:hidden w-full relative">
        <select
          v-model="activeTab"
          class="w-full border border-slate-200 p-3.5 rounded-xl bg-white font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer shadow-sm"
        >
          <option v-for="t in menuTabs" :key="t.id" :value="t.id">
            {{ t.l }}
          </option>
        </select>
        <div
          class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
        >
          ▼
        </div>
      </div>

      <!-- Desktop Tabs -->
      <div
        class="hidden lg:flex p-1.5 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto w-full lg:w-auto gap-1"
      >
        <button
          v-for="t in menuTabs"
          :key="t.id"
          @click="activeTab = t.id"
          :class="
            activeTab === t.id
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100/50'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
          "
          class="flex items-center px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap"
        >
          <component
            :is="t.icon"
            class="w-4 h-4 mr-2"
            :class="activeTab === t.id ? 'text-blue-600' : 'text-slate-400'"
          />
          {{ t.l }}
        </button>
      </div>

      <div
        class="flex items-center space-x-4 bg-white p-3 px-5 rounded-2xl border shadow-sm border-slate-200 w-full lg:w-auto justify-between lg:justify-start"
      >
        <button
          @click="fetchData(true)"
          :disabled="isLoading"
          class="flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw
            class="w-4 h-4 mr-1.5"
            :class="{ 'animate-spin': isLoading }"
          />
          Refresh
        </button>
        <div class="w-px h-6 bg-slate-200 hidden lg:block"></div>
        <span class="text-[10px] font-black uppercase text-slate-400"
          >Ukuran Tabel: {{ Math.round(tableScale * 100) }}%</span
        >
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          v-model="tableScale"
          class="w-32 accent-blue-600 cursor-pointer"
        />
      </div>
    </div>

    <!-- Alert Error Connection -->
    <div
      v-if="store.error"
      class="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-300"
    >
      <div class="flex items-start gap-4">
        <div class="p-3 bg-red-100 text-red-700 rounded-2xl shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h4
            class="font-black text-red-800 text-base uppercase tracking-tight"
          >
            Koneksi Database Gagal
          </h4>
          <p class="text-xs text-red-600 mt-1">
            Gagal menyinkronkan data dengan Google Apps Script API:
            <strong>{{ store.error }}</strong
            >. Silakan coba segarkan data.
          </p>
        </div>
      </div>
      <button
        @click="fetchData(true)"
        class="px-5 py-3 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 shrink-0"
      >
        Segarkan Ulang
      </button>
    </div>

    <div
      v-if="activeTab === 'pegawai'"
      class="animate-in fade-in duration-500 space-y-6"
    >
      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-[380px] flex flex-col justify-between"
          >
            <div class="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div class="flex-1 flex items-end justify-between px-2 gap-4 pb-4">
              <div
                v-for="i in 10"
                :key="i"
                class="w-full bg-slate-100 rounded-t"
                :style="{
                  height: `${[50, 75, 40, 90, 60, 45, 80, 55, 70, 65][i - 1]}%`,
                }"
              ></div>
            </div>
          </div>
          <div
            class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse flex flex-col justify-center space-y-6"
          >
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
        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse"
        >
          <div
            class="p-4 bg-slate-50 border-b border-slate-200 h-14 flex items-center justify-between"
          >
            <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div class="p-4 space-y-4">
            <div
              v-for="i in 5"
              :key="i"
              class="h-8 bg-slate-100 rounded w-full"
            ></div>
          </div>
        </div>
      </div>

      <!-- Real Content -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
          >
            <!-- Toggle Produk -->
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3"
            >
              <h3
                class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Kelolaan {{ selectedPegawaiProduct }}: Baseline vs Posisi Saat
                Ini
              </h3>
              <div
                class="flex p-1 bg-slate-100 rounded-lg gap-1 w-full sm:w-auto"
              >
                <button
                  v-for="p in ['Giro', 'Tabungan', 'Deposito']"
                  :key="p"
                  @click="selectedPegawaiProduct = p"
                  :class="
                    selectedPegawaiProduct === p
                      ? 'bg-white text-slate-800 shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-700'
                  "
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
                  :key="
                    selectedBaseline + selectedLatest + selectedPegawaiProduct
                  "
                  :options="pegawaiChartOptions"
                  :series="pegawaiChartSeries"
                ></apexchart>
              </div>
            </div>
          </div>
          <div
            class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-center"
          >
            <label
              class="block text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >Parameter Analisis</label
            >
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              />
              <input
                v-model="searchQuery"
                placeholder="Cari Nama/PN..."
                class="w-full border border-slate-200 pl-10 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div class="space-y-3">
              <div>
                <span class="text-xs font-medium text-slate-500 mb-1 block"
                  >Pilih Baseline</span
                >
                <select
                  v-model="selectedBaseline"
                  class="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option
                    v-for="d in [
                      ...new Set(
                        rawData.pegawai.map((i) =>
                          formatToLocalWIB(i.Tanggal_Data),
                        ),
                      ),
                    ].sort()"
                    :key="d"
                  >
                    {{ d }}
                  </option>
                </select>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 mb-1 block"
                  >Pilih Latest</span
                >
                <select
                  v-model="selectedLatest"
                  class="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option
                    v-for="d in [
                      ...new Set(
                        rawData.pegawai.map((i) =>
                          formatToLocalWIB(i.Tanggal_Data),
                        ),
                      ),
                    ].sort()"
                    :key="d"
                  >
                    {{ d }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div class="overflow-x-auto w-full scroll-custom">
            <div
              :style="{
                transform: `scale(${tableScale})`,
                transformOrigin: 'top left',
                width: `${100 / tableScale}%`,
              }"
            >
              <table
                class="w-full text-left text-sm whitespace-nowrap min-w-[1000px]"
              >
                <thead
                  class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider"
                >
                  <tr>
                    <th rowspan="2" class="p-4 border-b border-slate-200 w-64">
                      Dana RMFT / PN
                    </th>
                    <th
                      colspan="3"
                      class="p-4 border-b border-slate-200 text-center"
                    >
                      Baseline
                      <span
                        class="block text-[10px] font-normal text-slate-400 mt-1 lowercase capitalize"
                        >({{ selectedBaseline }})</span
                      >
                    </th>
                    <th
                      colspan="3"
                      class="p-4 border-b border-slate-200 text-center"
                    >
                      Posisi Latest
                      <span
                        class="block text-[10px] font-normal text-slate-400 mt-1 lowercase capitalize"
                        >({{ selectedLatest }})</span
                      >
                    </th>
                    <th
                      colspan="3"
                      class="p-4 border-b border-slate-200 text-center bg-blue-50/50 text-blue-800"
                    >
                      Delta Analysis
                    </th>
                  </tr>
                  <tr class="bg-slate-50 text-[11px] text-slate-500">
                    <th class="p-3 border-b border-slate-200 text-right">
                      Giro
                    </th>
                    <th class="p-3 border-b border-slate-200 text-right">
                      Tab
                    </th>
                    <th class="p-3 border-b border-slate-200 text-right">
                      Depo
                    </th>
                    <th class="p-3 border-b border-slate-200 text-right">
                      Giro
                    </th>
                    <th class="p-3 border-b border-slate-200 text-right">
                      Tab
                    </th>
                    <th class="p-3 border-b border-slate-200 text-right">
                      Depo
                    </th>
                    <th
                      class="p-3 border-b border-slate-200 text-right bg-blue-50/30"
                    >
                      Giro
                    </th>
                    <th
                      class="p-3 border-b border-slate-200 text-right bg-blue-50/30"
                    >
                      Tab
                    </th>
                    <th
                      class="p-3 border-b border-slate-200 text-right bg-blue-50/30"
                    >
                      Depo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in pegawaiComparison"
                    :key="item.pn"
                    class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <td class="p-4 font-medium text-slate-800">
                      {{ item.pn }} - {{ item.nama }}
                    </td>
                    <td class="p-3 text-right text-slate-500">
                      {{ formatNum(item.c_g) }}
                    </td>
                    <td class="p-3 text-right text-slate-500">
                      {{ formatNum(item.c_t) }}
                    </td>
                    <td class="p-3 text-right text-slate-500">
                      {{ formatNum(item.c_d) }}
                    </td>
                    <td class="p-3 text-right font-medium text-slate-800">
                      {{ formatNum(item.l_g) }}
                    </td>
                    <td class="p-3 text-right font-medium text-slate-800">
                      {{ formatNum(item.l_t) }}
                    </td>
                    <td class="p-3 text-right font-medium text-slate-800">
                      {{ formatNum(item.l_d) }}
                    </td>
                    <td class="p-3 text-right" :class="cellBgClass(item.d_g)">
                      {{ formatNum(item.d_g) }}
                    </td>
                    <td class="p-3 text-right" :class="cellBgClass(item.d_t)">
                      {{ formatNum(item.d_t) }}
                    </td>
                    <td class="p-3 text-right" :class="cellBgClass(item.d_d)">
                      {{ formatNum(item.d_d) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div
      v-else-if="activeTab === 'unit'"
      class="animate-in slide-in-from-bottom-2 duration-500 space-y-6"
    >
      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div
            class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse space-y-6"
          >
            <div class="h-4 bg-slate-200 rounded w-1/2"></div>
            <div class="space-y-3">
              <div
                v-for="i in 3"
                :key="i"
                class="h-10 bg-slate-50 rounded-lg w-full"
              ></div>
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
          <div
            class="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-[380px] flex flex-col justify-between"
          >
            <div class="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div class="flex-1 flex items-end justify-between px-2 gap-4 pb-4">
              <div
                v-for="i in 8"
                :key="i"
                class="w-full bg-slate-100 rounded-t"
                :style="{
                  height: `${[60, 45, 80, 55, 70, 65, 50, 75][i - 1]}%`,
                }"
              ></div>
            </div>
          </div>
        </div>
        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse"
        >
          <div
            class="p-4 bg-slate-50 border-b border-slate-200 h-14 flex items-center justify-between"
          >
            <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div class="p-4 space-y-4">
            <div
              v-for="i in 5"
              :key="i"
              class="h-8 bg-slate-100 rounded w-full"
            ></div>
          </div>
        </div>
      </div>

      <!-- Real Content -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div
            class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6"
          >
            <div class="flex flex-col gap-2">
              <label
                class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
                >Filter Produk</label
              >
              <button
                v-for="p in ['Giro', 'Tabungan', 'Deposito']"
                :key="p"
                @click="
                  selectedUnitProduct = p;
                  selectedProduct = p;
                "
                :class="
                  selectedUnitProduct === p
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                "
                class="p-2.5 rounded-lg border font-medium transition-all text-sm"
              >
                {{ p }}
              </button>
            </div>
            <div class="space-y-4 mt-4">
              <div>
                <label
                  class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
                  >Pilih Baseline</label
                >
                <select
                  v-model="selectedBaselineUnit"
                  class="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                >
                  <option
                    v-for="d in [
                      ...new Set(
                        rawData.unit.map((i) =>
                          formatToLocalWIB(i.Tanggal_Data),
                        ),
                      ),
                    ].sort()"
                    :key="d"
                    :value="d"
                  >
                    {{ d }}
                  </option>
                </select>
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
                  >Pilih Latest</label
                >
                <select
                  v-model="selectedDateUnit"
                  class="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                >
                  <option
                    v-for="d in [
                      ...new Set(
                        rawData.unit.map((i) =>
                          formatToLocalWIB(i.Tanggal_Data),
                        ),
                      ),
                    ]
                      .sort()
                      .reverse()"
                    :key="d"
                    :value="d"
                  >
                    {{ d }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div
            class="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <!-- Chart -->
            <div class="w-full overflow-x-auto custom-scrollbar pb-2">
              <div class="min-w-[600px] lg:min-w-full">
                <apexchart
                  type="bar"
                  :height="Math.max(300, unitChartData.length * 45)"
                  :key="
                    selectedBaselineUnit +
                    selectedDateUnit +
                    selectedUnitProduct
                  "
                  :options="unitChartOptions"
                  :series="unitChartSeries"
                ></apexchart>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div class="overflow-x-auto w-full scroll-custom">
            <div
              :style="{
                transform: `scale(${tableScale})`,
                transformOrigin: 'top left',
                width: `${100 / tableScale}%`,
              }"
            >
              <table
                class="w-full text-left text-sm whitespace-nowrap min-w-[1000px]"
              >
                <thead
                  class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider"
                >
                  <tr>
                    <th rowspan="2" class="p-4 border-b border-slate-200 w-72">
                      Unit / Cabang Kerja
                    </th>
                    <th
                      colspan="4"
                      class="p-4 border-b border-slate-200 text-center"
                    >
                      Posisi Saldo Riil
                    </th>
                    <th
                      colspan="3"
                      class="p-4 border-b border-slate-200 text-center bg-blue-50/50 text-blue-800"
                    >
                      Analisis Delta
                      <span
                        class="block text-[10px] font-normal text-blue-400 mt-1 capitalize"
                        >(DTD, MTD, YTD)</span
                      >
                    </th>
                  </tr>
                  <tr class="bg-slate-50 text-[11px] text-slate-500">
                    <th
                      class="p-3 border-b border-slate-200 text-right text-slate-700"
                    >
                      Dipilih ({{ selectedDateUnit }})
                    </th>
                    <th
                      class="p-3 border-b border-slate-200 text-right font-normal"
                    >
                      H-1 ({{ unitAnalysis[0]?.tglKemarin || "-" }})
                    </th>
                    <th
                      class="p-3 border-b border-slate-200 text-right font-normal"
                    >
                      Bln-L ({{ unitAnalysis[0]?.tglAkhirBulanLalu || "-" }})
                    </th>
                    <th
                      class="p-3 border-b border-slate-200 text-right font-normal"
                    >
                      Thn-L ({{ unitAnalysis[0]?.tglAkhirTahunLalu || "-" }})
                    </th>
                    <th
                      class="p-3 border-b border-slate-200 text-right bg-blue-50/30 text-blue-700"
                    >
                      DTD
                    </th>
                    <th
                      class="p-3 border-b border-slate-200 text-right bg-blue-50/30 text-blue-700"
                    >
                      MTD
                    </th>
                    <th
                      class="p-3 border-b border-slate-200 text-right bg-blue-50/30 text-blue-700"
                    >
                      YTD
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in unitAnalysis"
                    :key="item.u"
                    class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <td class="p-4 font-medium text-slate-800">
                      {{ item.u }} - {{ item.nama }}
                    </td>
                    <td class="p-4 text-right font-semibold text-slate-800">
                      {{ formatNum(item.valPilih) }}
                    </td>
                    <td class="p-4 text-right text-slate-500">
                      {{ formatNum(item.valKemarin) }}
                    </td>
                    <td class="p-4 text-right text-slate-500">
                      {{ formatNum(item.valBulanLalu) }}
                    </td>
                    <td class="p-4 text-right text-slate-500">
                      {{ formatNum(item.valTahunLalu) }}
                    </td>
                    <td class="p-4 text-right" :class="cellBgClass(item.dtd)">
                      {{ item.dtd > 0 ? "+" : "" }}{{ formatNum(item.dtd) }}
                    </td>
                    <td class="p-4 text-right" :class="cellBgClass(item.mtd)">
                      {{ item.mtd > 0 ? "+" : "" }}{{ formatNum(item.mtd) }}
                    </td>
                    <td class="p-4 text-right" :class="cellBgClass(item.ytd)">
                      {{ item.ytd > 0 ? "+" : "" }}{{ formatNum(item.ytd) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- TAB KERAGAAN -->
    <div
      v-else-if="activeTab === 'keragaan'"
      class="animate-in fade-in duration-500 space-y-6"
    >
      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-[380px] flex flex-col justify-between"
          >
            <div class="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div class="flex-1 flex items-end justify-between px-2 gap-4 pb-4">
              <div
                v-for="i in 8"
                :key="i"
                class="w-full bg-slate-100 rounded-t"
                :style="{
                  height: `${[50, 75, 40, 90, 60, 45, 80, 55][i - 1]}%`,
                }"
              ></div>
            </div>
          </div>
          <div
            class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse flex flex-col justify-center text-center space-y-4"
          >
            <div class="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
            <div class="h-12 bg-slate-50 rounded-xl w-full"></div>
          </div>
        </div>
        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse"
        >
          <div
            class="p-4 bg-slate-50 border-b border-slate-200 h-14 flex items-center justify-between"
          >
            <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div class="p-4 space-y-4">
            <div
              v-for="i in 5"
              :key="i"
              class="h-8 bg-slate-100 rounded w-full"
            ></div>
          </div>
        </div>
      </div>

      <!-- Real Content -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
          >
            <h3
              class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6"
            >
              Analisis Visual: Realisasi Saat Ini vs Target RKA
            </h3>
            <div class="w-full overflow-x-auto custom-scrollbar pb-2">
              <div class="min-w-[600px] lg:min-w-full">
                <apexchart
                  type="bar"
                  height="300"
                  :key="selectedDateUnit"
                  :options="keragaanChartOptions"
                  :series="keragaanChartSeries"
                ></apexchart>
              </div>
            </div>
          </div>
          <div
            class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center text-center"
          >
            <label
              class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4"
              >Pilih Hari Tinjauan</label
            >
            <select
              v-model="selectedDateUnit"
              class="w-full border border-slate-200 p-4 rounded-xl bg-slate-50 font-semibold text-lg text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-center cursor-pointer"
            >
              <option
                v-for="d in [
                  ...new Set(
                    rawData.keragaan.map((i) =>
                      formatToLocalWIB(i.Tanggal_Data),
                    ),
                  ),
                ]
                  .sort()
                  .reverse()"
                :key="d"
                :value="d"
              >
                {{ d }}
              </option>
            </select>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div class="overflow-x-auto w-full scroll-custom">
            <div
              :style="{
                transform: `scale(${tableScale})`,
                transformOrigin: 'top left',
                width: `${100 / tableScale}%`,
              }"
            >
              <table
                class="w-full text-left text-sm whitespace-nowrap min-w-[900px]"
              >
                <thead
                  class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider"
                >
                  <tr>
                    <th class="p-4 border-b border-slate-200 w-12 text-center">
                      NO
                    </th>
                    <th class="p-4 border-b border-slate-200 w-56">
                      PRODUK KERAGAAN
                    </th>
                    <th class="p-4 border-b border-slate-200 text-right">
                      Posisi {{ selectedDateUnit }}
                    </th>
                    <th
                      class="p-4 border-b border-slate-200 text-right text-slate-500"
                    >
                      Target RKA
                    </th>
                    <th class="p-4 border-b border-slate-200 text-center">
                      Penc (%)
                    </th>
                    <th class="p-4 border-b border-slate-200 text-right">
                      Penc RKA
                    </th>
                    <th
                      class="p-4 border-b border-slate-200 text-right bg-blue-50/50 text-blue-700"
                    >
                      MTD (Growth)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in keragaanAnalysis"
                    :key="item.produk"
                    class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <td class="p-4 text-center text-slate-400">
                      {{ idx + 1 }}
                    </td>
                    <td class="p-4 font-semibold text-slate-800">
                      {{ item.produk }}
                    </td>
                    <td class="p-4 text-right font-semibold text-slate-800">
                      {{ formatNum(item.realSekarang) }}
                    </td>
                    <td class="p-4 text-right text-slate-500">
                      {{ formatNum(item.rkaVal) }}
                    </td>
                    <td
                      class="p-4 text-center"
                      :class="cellBgClass(item.pencPersen, 100)"
                    >
                      {{ item.pencPersen.toFixed(1) }}%
                    </td>
                    <td
                      class="p-4 text-right"
                      :class="cellBgClass(item.pencRka)"
                    >
                      {{ item.pencRka > 0 ? "+" : ""
                      }}{{ formatNum(item.pencRka) }}
                    </td>
                    <td class="p-4 text-right" :class="cellBgClass(item.mtd)">
                      {{ item.mtd > 0 ? "+" : "" }}{{ formatNum(item.mtd) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- TAB PIPELINE -->
    <div
      v-else-if="activeTab === 'pipeline'"
      class="animate-in fade-in duration-500 space-y-6"
    >
      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-[380px] flex flex-col justify-between"
          >
            <div class="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div class="flex-1 flex items-end justify-between px-2 gap-4 pb-4">
              <div
                v-for="i in 8"
                :key="i"
                class="w-full bg-slate-100 rounded-t"
                :style="{
                  height: `${[70, 60, 45, 80, 55, 75, 50, 65][i - 1]}%`,
                }"
              ></div>
            </div>
          </div>
          <div
            class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse flex flex-col justify-center space-y-4"
          >
            <div class="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
            <div class="h-10 bg-slate-50 rounded-lg w-full"></div>
            <div class="h-4 bg-slate-200 rounded w-1/2 mx-auto mt-2"></div>
            <div class="h-10 bg-slate-50 rounded-lg w-full"></div>
          </div>
        </div>
        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse"
        >
          <div
            class="p-4 bg-slate-50 border-b border-slate-200 h-14 flex items-center justify-between"
          >
            <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div class="p-4 space-y-4">
            <div
              v-for="i in 5"
              :key="i"
              class="h-8 bg-slate-100 rounded w-full"
            ></div>
          </div>
        </div>
      </div>

      <!-- Real Content -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
          >
            <h3
              class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4"
            >
              Top 10 RMFT by Pipeline
            </h3>
            <div class="w-full overflow-x-auto custom-scrollbar pb-2">
              <div class="min-w-[600px] lg:min-w-full">
                <apexchart
                  type="bar"
                  :height="Math.max(350, rmftPipelineSummary.length * 45)"
                  :options="pipelineChartOptions"
                  :series="pipelineChartSeries"
                ></apexchart>
              </div>
            </div>
          </div>
          <div
            class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-4"
          >
            <label
              class="block text-xs font-semibold text-slate-500 uppercase tracking-wider text-center"
              >Pencarian Data</label
            >
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              />
              <input
                v-model="searchQuery"
                placeholder="Cari RMFT, Nasabah, Keterangan..."
                class="w-full border border-slate-200 pl-10 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            <label
              class="block text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mt-2"
              >Filter Bulan Target</label
            >
            <div class="relative">
              <Calendar
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              />
              <select
                v-model="pipelineSelectedMonth"
                class="w-full border border-slate-200 pl-10 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
              >
                <option value="">Semua Bulan</option>
                <option v-for="m in pipelineMonths" :key="m" :value="m">
                  {{ m }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div class="overflow-x-auto w-full scroll-custom">
            <div
              :style="{
                transform: `scale(${tableScale})`,
                transformOrigin: 'top left',
                width: `${100 / tableScale}%`,
              }"
            >
              <table
                class="w-full text-left text-sm whitespace-nowrap min-w-[900px]"
              >
                <thead
                  class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider"
                >
                  <tr>
                    <th class="p-4 border-b border-slate-200 w-48">
                      <Users
                        class="w-4 h-4 inline-block mr-1 mb-0.5 text-slate-400"
                      />
                      RMFT
                    </th>
                    <th class="p-4 border-b border-slate-200 w-48">Nasabah</th>
                    <th class="p-4 border-b border-slate-200 text-right">
                      Nominal Pipeline
                    </th>
                    <th class="p-4 border-b border-slate-200">Produk</th>
                    <th class="p-4 border-b border-slate-200 text-right">
                      Realisasi
                    </th>
                    <th
                      @click="togglePipelineSort"
                      class="p-4 border-b border-slate-200 text-center cursor-pointer hover:bg-slate-200/50 transition-colors select-none group"
                    >
                      <span class="inline-flex items-center">
                        <Calendar class="w-4 h-4 mr-1 text-slate-400" /> Target
                        Tanggal
                        <ArrowUp
                          v-if="pipelineSortOrder === 'asc'"
                          class="w-4 h-4 ml-1 text-blue-600"
                        />
                        <ArrowDown
                          v-else-if="pipelineSortOrder === 'desc'"
                          class="w-4 h-4 ml-1 text-blue-600"
                        />
                        <ArrowUpDown
                          v-else
                          class="w-4 h-4 ml-1 text-slate-300 group-hover:text-slate-400"
                        />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in pipelineAnalysis"
                    :key="idx"
                    class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <td class="p-4 font-bold text-slate-800 uppercase text-xs">
                      {{ item.NAMA_RMFT || item.RMFT || "-" }}
                    </td>
                    <td class="p-4 font-medium text-slate-600">
                      {{
                        item.NAMA_NASABAH || item.Nasabah || item.NASABAH || "-"
                      }}
                    </td>
                    <td class="p-4 text-right font-black text-blue-600">
                      {{
                        formatNum(
                          item.PIPELINE || item.Pipeline || item.pipeline || 0,
                        )
                      }}
                    </td>
                    <td class="p-4 text-slate-500 font-medium">
                      {{
                        item.KETERANGAN || item.Ket || item.KETERANGAN || "-"
                      }}
                    </td>
                    <td class="p-4 text-right font-bold text-emerald-600">
                      {{
                        formatNum(
                          item.REALISASI ||
                            item.Nominal ||
                            item.NOMINAL ||
                            item.nominal ||
                            0,
                        )
                      }}
                    </td>
                    <td class="p-4 text-center font-medium text-slate-500">
                      {{
                        formatToLocalWIB(
                          item.TANGGAL_TARGET ||
                            item.Tanggal ||
                            item.TANGGAL ||
                            "",
                        )
                      }}
                    </td>
                  </tr>
                  <tr v-if="!pipelineAnalysis.length">
                    <td
                      colspan="6"
                      class="p-8 text-center text-slate-500 font-medium"
                    >
                      Tidak ada data Pipeline ditemukan.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- TAB RMFT -->
    <div
      v-else-if="activeTab === 'rmft_ach'"
      class="animate-in fade-in duration-500 space-y-6"
    >
      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div
            class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse space-y-6"
          >
            <div class="h-4 bg-slate-200 rounded w-1/2"></div>
            <div class="h-10 bg-slate-50 rounded-lg w-full"></div>
            <div class="h-4 bg-slate-200 rounded w-1/2 mt-4"></div>
            <div class="h-10 bg-slate-50 rounded-lg w-full"></div>
          </div>
          <div
            class="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-[300px] flex flex-col justify-between"
          >
            <div class="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div class="flex-1 flex items-end justify-between px-2 gap-4 pb-4">
              <div
                v-for="i in 8"
                :key="i"
                class="w-full bg-slate-100 rounded-t"
                :style="{
                  height: `${[50, 75, 40, 90, 60, 45, 80, 55][i - 1]}%`,
                }"
              ></div>
            </div>
          </div>
        </div>
        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse"
        >
          <div
            class="p-4 bg-slate-50 border-b border-slate-200 h-14 flex items-center justify-between"
          >
            <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div class="p-4 space-y-4">
            <div
              v-for="i in 5"
              :key="i"
              class="h-8 bg-slate-100 rounded w-full"
            ></div>
          </div>
        </div>
      </div>

      <!-- Real Content -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div
            class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6"
          >
            <div class="flex flex-col gap-2">
              <label
                class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
                >Filter Bulan</label
              >
              <select
                v-model="selectedMonthRmft"
                class="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
              >
                <option v-for="m in achievementMonths" :key="m" :value="m">
                  {{ m }}
                </option>
              </select>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4"
                >Pencarian RMFT</label
              >
              <div class="relative">
                <Search
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                />
                <input
                  v-model="searchQuery"
                  placeholder="Cari Nama RMFT..."
                  class="w-full border border-slate-200 pl-10 p-2.5 rounded-lg bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          <div
            class="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <h3
              class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4"
            >
              Persentase Total Pencapaian RMFT
            </h3>
            <div class="w-full overflow-x-auto custom-scrollbar pb-2">
              <div class="min-w-[600px] lg:min-w-full">
                <apexchart
                  type="bar"
                  :height="Math.max(300, rmftAchievementAnalysis.length * 45)"
                  :key="selectedMonthRmft"
                  :options="rmftChartOptions"
                  :series="rmftChartSeries"
                ></apexchart>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div class="overflow-x-auto w-full scroll-custom max-h-[600px]">
            <div
              :style="{
                transform: `scale(${tableScale})`,
                transformOrigin: 'top left',
                width: `${100 / tableScale}%`,
              }"
            >
              <table
                class="w-full text-left text-sm whitespace-nowrap min-w-[1200px]"
              >
                <thead
                  class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider sticky top-0 z-10"
                >
                  <tr>
                    <th
                      class="p-4 border-b border-slate-200 w-56 bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      RMFT
                    </th>
                    <th
                      v-if="rmftColHasData.avg_tab"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      AVG TAB
                    </th>
                    <th
                      v-if="rmftColHasData.posisi_tab"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      POSISI TAB
                    </th>
                    <th
                      v-if="rmftColHasData.avg_giro"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      AVG GIRO
                    </th>
                    <th
                      v-if="rmftColHasData.avg_dpk"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      AVG DPK
                    </th>
                    <th
                      v-if="rmftColHasData.fbi_pa"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      FBI PA
                    </th>
                    <th
                      v-if="rmftColHasData.edc_qris"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      EDC/QRIS
                    </th>
                    <th
                      v-if="rmftColHasData.dpk_merchant"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      DPK MERCH
                    </th>
                    <th
                      v-if="rmftColHasData.sv"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      SV
                    </th>
                    <th
                      v-if="rmftColHasData.new_payroll"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      PAYROLL
                    </th>
                    <th
                      v-if="rmftColHasData.prod_qlola"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      QLOLA
                    </th>
                    <th
                      v-if="rmftColHasData.prog_kanwil"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      KANWIL
                    </th>
                    <th
                      v-if="rmftColHasData.prog_sgf"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      SGF
                    </th>
                    <th
                      v-if="rmftColHasData.casa_me"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      CASA ME
                    </th>
                    <th
                      v-if="rmftColHasData.sv_edc"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      SV EDC
                    </th>
                    <th
                      v-if="rmftColHasData.user_activ_b"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      USER ACTIV B
                    </th>
                    <th
                      v-if="rmftColHasData.user_activ_qlola"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      USER ACTIV QLOLA
                    </th>
                    <th
                      v-if="rmftColHasData.ph_program"
                      class="p-4 border-b border-slate-200 text-right bg-slate-100 shadow-[0_1px_0_#e2e8f0]"
                    >
                      PH PROGRAM
                    </th>
                    <th
                      class="p-4 border-b border-slate-200 text-right bg-blue-50/50 shadow-[0_1px_0_#e2e8f0] text-blue-800"
                    >
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in rmftAchievementAnalysis"
                    :key="idx"
                    class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <td class="p-4 font-medium text-slate-800">
                      {{
                        item.NAMA_RMFT ||
                        item.RMFT ||
                        item.rmft ||
                        item["Keterangan (Nama RMFT)"] ||
                        item.KETERANGAN ||
                        item.Keterangan ||
                        "-"
                      }}
                    </td>
                    <td
                      v-if="rmftColHasData.avg_tab"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.AVG_TAB ?? item.avg_tab) }}
                    </td>
                    <td
                      v-if="rmftColHasData.posisi_tab"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.POSISI_TAB ?? item.posisi_tab) }}
                    </td>
                    <td
                      v-if="rmftColHasData.avg_giro"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.AVG_GIRO ?? item.avg_giro) }}
                    </td>
                    <td
                      v-if="rmftColHasData.avg_dpk"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.AVG_DPK ?? item.avg_dpk) }}
                    </td>
                    <td
                      v-if="rmftColHasData.fbi_pa"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.FBI_PA ?? item.fbi_pa) }}
                    </td>
                    <td
                      v-if="rmftColHasData.edc_qris"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.EDC_QRIS ?? item.edc_qris) }}
                    </td>
                    <td
                      v-if="rmftColHasData.dpk_merchant"
                      class="p-4 text-right text-slate-600"
                    >
                      {{
                        formatPercent(item.DPK_MERCHANT ?? item.dpk_merchant)
                      }}
                    </td>
                    <td
                      v-if="rmftColHasData.sv"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.SV ?? item.sv) }}
                    </td>
                    <td
                      v-if="rmftColHasData.new_payroll"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.NEW_PAYROLL ?? item.new_payroll) }}
                    </td>
                    <td
                      v-if="rmftColHasData.prod_qlola"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.PROD_QLOLA ?? item.prod_qlola) }}
                    </td>
                    <td
                      v-if="rmftColHasData.prog_kanwil"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.PROG_KANWIL ?? item.prog_kanwil) }}
                    </td>
                    <td
                      v-if="rmftColHasData.prog_sgf"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.PROG_SGF ?? item.prog_sgf) }}
                    </td>
                    <td
                      v-if="rmftColHasData.casa_me"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.CASA_ME ?? item.casa_me) }}
                    </td>
                    <td
                      v-if="rmftColHasData.sv_edc"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.SV_EDC ?? item.sv_edc) }}
                    </td>
                    <td
                      v-if="rmftColHasData.user_activ_b"
                      class="p-4 text-right text-slate-600"
                    >
                      {{
                        formatPercent(item.USER_ACTIV_B ?? item.user_activ_b)
                      }}
                    </td>
                    <td
                      v-if="rmftColHasData.user_activ_qlola"
                      class="p-4 text-right text-slate-600"
                    >
                      {{
                        formatPercent(
                          item.USER_ACTIV_QLOLA ?? item.user_activ_qlola,
                        )
                      }}
                    </td>
                    <td
                      v-if="rmftColHasData.ph_program"
                      class="p-4 text-right text-slate-600"
                    >
                      {{ formatPercent(item.PH_PROGRAM ?? item.ph_program) }}
                    </td>
                    <td
                      class="p-4 text-right font-semibold text-blue-700 bg-blue-50/30"
                    >
                      {{ formatPercent(item.TOTAL ?? item.total) }}
                    </td>
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
.animate-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-custom::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.scroll-custom::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 10px;
}
.scroll-custom::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.scroll-custom::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
```

### 5.6 View: Entry Center (src/views/InputData.vue)

```vue
<script setup>
import { ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { clearCache } from "../store";
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
  AlertCircle,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

// --- STATE / VARIABEL ---
const inputType = ref(route.query.tab || route.query.type || "pegawai");
const selectedProduct = ref("Giro");
const rawPaste = ref("");
const parsedData = ref([]);
const tanggalInput = ref(new Date().toISOString().split("T")[0]);
const isSaving = ref(false);

// --- DATA CONTOH & STRUKTUR STATIC ---
const rmftAchFormat = ref("terbaru"); // 'terbaru' | 'dasar'

const sampleDataStatic = {
  pegawai: {
    title: "Dana RMFT",
    columns: ["PN - Nama", "Saldo Giro", "Saldo Tabungan", "Saldo Deposito"],
    raw: `9012345 - Budi Santoso	150.000.000	250.000.000	500.000.000
9012346 - Siti Aminah	75.000.000	120.000.000	0
9012347 - Andi Wijaya	0	450.000.000	1.000.000.000`,
    desc: "Pastikan 3 kolom setelahnya adalah nilai Saldo Giro, Tabungan, dan Deposito secara berurutan. Format PN - Nama bisa dalam satu kolom atau dipisah dalam dua kolom.",
  },
  uker: {
    title: "Unit Kerja",
    columns: ["Kode Uker - Nama Uker", "Nilai Saldo"],
    raw: `0123 - KC Jakarta Central	50.000.000.000
4567 - KCP Mangga Dua	12.500.000.000
8901 - KCP Sudirman	8.750.000.000`,
    desc: "Pilih jenis produk di dropdown kiri terlebih dahulu, kemudian paste kode & nama uker beserta nilai saldonya.",
  },
  keragaan: {
    title: "Keragaan",
    columns: ["Nama Produk", "Nilai Pencapaian"],
    raw: `TOTAL DANA	125.400.000.000
GIRO	45.200.000.000
TAB	60.100.000.000
DEP	20.100.000.000
SALES VOLUME QRIS	1.250.000.000`,
    desc: "Nama produk harus sesuai dengan daftar produk sistem (misal: TOTAL DANA, GIRO, TAB, DEP, SALES VOLUME QRIS, dll).",
  },
  rka: {
    title: "RKA",
    columns: ["Nama Produk", "Target RKA"],
    raw: `TOTAL DANA	130.000.000.000
GIRO	50.000.000.000
TAB	65.000.000.000
DEP	15.000.000.000`,
    desc: "Nama produk harus sesuai dengan daftar produk sistem (misal: TOTAL DANA, GIRO, TAB, DEP, dll).",
  },
  pipeline: {
    title: "Pipeline",
    columns: [
      "RMFT",
      "Nama Nasabah",
      "Nominal Pipeline",
      "Tanggal (DD/MM/YYYY)",
      "Jenis",
      "Nominal Realisasi",
    ],
    raw: `Budi Santoso	PT Selalu Jaya	150.000.000	09/06/2026	Giro	120.000.000
Siti Aminah	PT Sukses Abadi	250.000.000	10/06/2026	Tabungan	200.000.000
Andi Wijaya	UD Makmur	50.000.000	11/06/2026	Deposito	50.000.000`,
    desc: "Sistem mendeteksi format secara dinamis dengan melacak kolom tanggal. Bisa menggunakan format Tanggal di kolom 3 atau 4.",
  },
};

// --- DATA CONTOH AKTIF (COMPUTED DYNAMIC) ---
const activeSample = computed(() => {
  if (inputType.value === "rmft_ach") {
    if (rmftAchFormat.value === "terbaru") {
      return {
        title: "Achievement RMFT (Format Terbaru)",
        columns: [
          "RMFT",
          "AVG TAB",
          "POSISI TAB",
          "AVG GIRO",
          "AVG DPK",
          "EDC/QRIS",
          "PAYROLL",
          "CASA ME",
          "SV EDC",
          "USER ACTIV B",
          "USER ACTIV QLOLA",
          "PH PROGRAM",
          "TOTAL",
        ],
        raw: `RMFT	AVG TAB	POSISI TAB	AVG GIRO	AVG DPK	EDC/QRIS	PAYROLL	CASA ME	SV EDC	USER ACTIV B	USER ACTIV QLOLA	PH PROGRAM	TOTAL
Budi Santoso	85%	90%	75%	80%	70%	95%	85%	90%	65%	60%	80%	82%
Siti Aminah	90%	95%	80%	88%	75%	90%	80%	85%	70%	65%	85%	85%`,
        desc: "Achievement RMFT menggunakan FORMAT TERBARU. Pastikan baris header disertakan agar pemetaan kolom terdeteksi secara dinamis oleh parser.",
      };
    } else {
      return {
        title: "Achievement RMFT (Format Dasar)",
        columns: [
          "RMFT",
          "AVG TAB",
          "AVG GIRO",
          "AVG DPK",
          "FBI PA",
          "EDC/QRIS",
          "DPK MERCH",
          "SV",
          "PAYROLL",
          "QLOLA",
          "KANWIL",
          "SGF",
          "TOTAL",
        ],
        raw: `RMFT	AVG TAB	AVG GIRO	AVG DPK	FBI PA	EDC/QRIS	DPK MERCH	SV	PAYROLL	QLOLA	KANWIL	SGF	TOTAL
Budi Santoso	85%	75%	80%	90%	70%	65%	85%	95%	60%	80%	75%	78%
Siti Aminah	90%	80%	88%	85%	75%	70%	80%	90%	65%	85%	80%	82%`,
        desc: "Achievement RMFT menggunakan FORMAT DASAR (Lama). Pastikan baris header disertakan agar pemetaan kolom terdeteksi secara dinamis oleh parser.",
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
    handlePaste();
  }
};

const copySample = async () => {
  const sample = activeSample.value;
  if (sample) {
    try {
      await navigator.clipboard.writeText(sample.raw);
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    } catch (err) {
      alert("Gagal menyalin: " + err.message);
    }
  }
};

const apiUrl = import.meta.env.VITE_API_URL;

const validationErrors = computed(() => {
  const errors = [];
  if (!parsedData.value || parsedData.value.length === 0) return errors;

  parsedData.value.forEach((row, index) => {
    const rowNum = index + 1;
    if (inputType.value === "pegawai") {
      if (!row.pn || String(row.pn).trim() === "")
        errors.push(`Baris ${rowNum}: PN Pegawai kosong.`);
      if (!row.nama || String(row.nama).trim() === "")
        errors.push(`Baris ${rowNum}: Nama Pegawai kosong.`);
    } else if (inputType.value === "uker") {
      if (!row.unit || String(row.unit).trim() === "")
        errors.push(`Baris ${rowNum}: Kode Unit Kerja kosong.`);
      if (
        !row.nama ||
        String(row.nama).trim() === "" ||
        row.nama === "Unit Kerja"
      )
        errors.push(`Baris ${rowNum}: Nama Unit Kerja tidak valid.`);
    } else if (inputType.value === "keragaan" || inputType.value === "rka") {
      if (!row.produk || String(row.produk).trim() === "")
        errors.push(`Baris ${rowNum}: Produk kosong.`);
    } else if (inputType.value === "pipeline") {
      if (
        !row.NAMA_RMFT ||
        String(row.NAMA_RMFT).trim() === "" ||
        row.NAMA_RMFT === "Unknown RMFT"
      ) {
        errors.push(`Baris ${rowNum}: Nama RMFT tidak valid.`);
      }
      if (!row.TANGGAL || String(row.TANGGAL).trim() === "") {
        errors.push(
          `Baris ${rowNum}: Tanggal target pipeline kosong atau format tanggal tidak terdeteksi.`,
        );
      }
    } else if (inputType.value === "rmft_ach") {
      if (
        !row.NAMA_RMFT ||
        String(row.NAMA_RMFT).trim() === "" ||
        row.NAMA_RMFT === "Unknown RMFT"
      ) {
        errors.push(`Baris ${rowNum}: Nama RMFT tidak valid.`);
      }
    }
  });
  return errors;
});

const fixedProducts = [
  "SALES VOLUME QRIS",
  "SALES VOLUME EDC",
  "CASA MERCHANT",
  "EDC MERCHANT",
  "PRODUKTIVITAS EDC",
  "QRIS PRODUKTIF",
  "TOTAL DANA",
  "MAU QLOLA",
  "USER QRIS",
  "GIRO",
  "TAB",
  "DEP",
  "CASA",
];

const formatDateIndo = (dateStr) => {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const menuTabs = [
  { id: "pegawai", l: "Dana RMFT", icon: Users },
  { id: "uker", l: "Unit Kerja", icon: Building2 },
  { id: "keragaan", l: "Keragaan", icon: BarChart3 },
  { id: "rka", l: "RKA", icon: FileText },
  { id: "pipeline", l: "Pipeline", icon: TrendingUp },
  { id: "rmft_ach", l: "Achievement RMFT", icon: Target },
];

watch(
  () => route.query.tab || route.query.type,
  (newTab) => {
    if (newTab) {
      inputType.value = newTab;
    }
  },
);

watch(inputType, (newVal) => {
  rawPaste.value = "";
  parsedData.value = [];
  if (route.query.tab !== newVal && route.query.type !== newVal) {
    router.replace({ query: { ...route.query, tab: newVal } });
  }
});

const cleanNum = (val) => {
  if (!val || val === "-" || val === "") return 0;
  let cleaned = val
    .toString()
    .replace(/[^0-9.,%\-]/g, "")
    .trim();
  cleaned = cleaned
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/%/g, "")
    .trim();
  return isNaN(parseFloat(cleaned)) ? 0 : parseFloat(cleaned);
};

const parseIndoDate = (dateStr) => {
  if (!dateStr) return null;
  let cleanStr = dateStr
    .toString()
    .trim()
    .replace(/[-–—\/.,]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

  const months = {
    januari: "01",
    jan: "01",
    februari: "02",
    feb: "02",
    febuari: "02",
    maret: "03",
    mar: "03",
    april: "04",
    apr: "04",
    mei: "05",
    may: "05",
    juni: "06",
    jun: "06",
    juli: "07",
    jul: "07",
    agustus: "08",
    agu: "08",
    agt: "08",
    aug: "08",
    september: "09",
    sep: "09",
    oktober: "10",
    okt: "10",
    oct: "10",
    november: "11",
    nov: "11",
    desember: "12",
    des: "12",
    dec: "12",
  };

  const parts = cleanStr.split(" ");
  if (parts.length >= 3) {
    if (parts[0].length === 4 && !isNaN(parts[0])) {
      let y = parts[0];
      let mRaw = parts[1];
      let m = months[mRaw];
      if (!m && /^\d+$/.test(mRaw)) {
        let mNum = parseInt(mRaw, 10);
        if (mNum >= 1 && mNum <= 12) m = mRaw.padStart(2, "0");
      }
      let dNum = parseInt(parts[2], 10);
      if (m && dNum >= 1 && dNum <= 31) {
        return `${y}-${m}-${parts[2].replace(/\D/g, "").padStart(2, "0")}`;
      }
    } else {
      let d = parts[0].replace(/\D/g, "").padStart(2, "0");
      let mRaw = parts[1];
      let m = months[mRaw];
      if (!m && /^\d+$/.test(mRaw)) {
        let mNum = parseInt(mRaw, 10);
        if (mNum >= 1 && mNum <= 12) m = mRaw.padStart(2, "0");
      }
      let y = parts[2].replace(/\D/g, "");

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
  if (!k) return "-";
  const up = k.trim().toUpperCase();
  if (up === "G" || up === "GIRO") return "GIRO";
  if (up === "T" || up === "TAB" || up === "TABUNGAN") return "TAB";
  if (up === "D" || up === "DEP" || up === "DEPO" || up === "DEPOSITO")
    return "DEPO";
  return up;
};

const activeVersion = ref("new");

// --- LOGIKA SMART PASTE ---
const handlePaste = () => {
  setTimeout(() => {
    const rows = rawPaste.value.split("\n");
    const result = [];
    let lastRMFT = ""; // Untuk menyimpan nama RMFT jika baris bawahnya kosong
    let lastFormatIndex = -1; // Menyimpan letak kolom tanggal dari baris sebelumnya

    // --- SETUP SMART MAPPING UNTUK RMFT_ACH ---
    let rmftMap = {};
    let isNewVersion = false;

    if (inputType.value === "rmft_ach") {
      const headerRow = rows.find((r) => {
        const up = r.trim().toUpperCase();
        return (
          up.includes("RMFT") ||
          up.includes("TAB") ||
          up.includes("GIRO") ||
          up.includes("KETERANGAN") ||
          up.includes("POSISI")
        );
      });

      if (headerRow) {
        const upHeader = headerRow.toUpperCase();
        if (
          upHeader.includes("POSISI TAB") ||
          upHeader.includes("USER ACTIV") ||
          upHeader.includes("CASA") ||
          upHeader.includes("PH")
        ) {
          isNewVersion = true;
        }

        let headerCols = headerRow.trim().split("\t");
        if (headerCols.length === 1) {
          headerCols = headerRow.trim().split(/\s{2,}/);
        }
        headerCols = headerCols.map((c) => c.trim().toUpperCase());

        if (isNewVersion) {
          headerCols.forEach((col, idx) => {
            if (col === "KETERANGAN" || col.includes("RMFT"))
              rmftMap.rmft = idx;
            else if (col.includes("AVG TAB")) rmftMap.avg_tab = idx;
            else if (col.includes("POSISI TAB") || col.includes("POSISI"))
              rmftMap.posisi_tab = idx;
            else if (col.includes("AVG GIRO")) rmftMap.avg_giro = idx;
            else if (col.includes("AVG DPK")) rmftMap.avg_dpk = idx;
            else if (col.includes("PAYROLL")) rmftMap.new_payroll = idx;
            else if (col.includes("SV EDC")) rmftMap.sv_edc = idx;
            else if (col.includes("EDC") || col.includes("QRIS PROC"))
              rmftMap.edc_qris = idx;
            else if (col.includes("CASA")) rmftMap.casa_me = idx;
            else if (
              col.includes("ACTIV B") ||
              (col.includes("ACTIV") && col.includes("B"))
            )
              rmftMap.user_activ_b = idx;
            else if (
              col.includes("ACTIV QLOLA") ||
              (col.includes("ACTIV") && col.includes("QLOLA"))
            )
              rmftMap.user_activ_qlola = idx;
            else if (col.includes("PH")) rmftMap.ph_program = idx;
            else if (col.includes("TOTAL")) rmftMap.total = idx;
          });
        } else {
          headerCols.forEach((col, idx) => {
            if (col.includes("RMFT") || col.includes("KETERANGAN"))
              rmftMap.rmft = idx;
            else if (col.includes("TAB")) rmftMap.avg_tab = idx;
            else if (col.includes("GIRO")) rmftMap.avg_giro = idx;
            else if (col.includes("MERCHANT") || col.includes("MERCH"))
              rmftMap.dpk_merchant = idx;
            else if (col.includes("DPK")) rmftMap.avg_dpk = idx;
            else if (col.includes("FBI")) rmftMap.fbi_pa = idx;
            else if (col.includes("EDC") || col.includes("QRIS"))
              rmftMap.edc_qris = idx;
            else if (col.includes("SV") || col.includes("SALES"))
              rmftMap.sv = idx;
            else if (col.includes("PAYROLL")) rmftMap.new_payroll = idx;
            else if (col.includes("QLOLA")) rmftMap.prod_qlola = idx;
            else if (col.includes("KANWIL")) rmftMap.prog_kanwil = idx;
            else if (col.includes("SGF")) rmftMap.prog_sgf = idx;
            else if (col.includes("TOTAL")) rmftMap.total = idx;
          });
        }
      }

      if (Object.keys(rmftMap).length === 0) {
        rmftMap = {
          rmft: 0,
          avg_tab: 1,
          posisi_tab: 2,
          avg_giro: 3,
          avg_dpk: 4,
          new_payroll: 5,
          edc_qris: 6,
          casa_me: 7,
          sv_edc: 8,
          user_activ_b: 9,
          user_activ_qlola: 10,
          ph_program: 11,
          total: 12,
        };
        isNewVersion = true;
      }
      if (rmftMap.rmft === undefined && Object.keys(rmftMap).length > 0) {
        rmftMap.rmft = 0;
      }
      activeVersion.value = isNewVersion ? "new" : "old";
    }

    rows.forEach((row) => {
      const text = row.trim();
      const upText = text.toUpperCase();
      if (
        text === "" ||
        upText.includes("RMFT") ||
        upText.includes("NASABAH") ||
        upText.includes("KETERANGAN") ||
        upText.includes("POSISI TAB") ||
        upText.includes("AVG TAB")
      )
        return;
      let cols = text.split("\t");
      if (cols.length === 1) {
        cols = text.split(/\s{2,}/);
      }

      if (inputType.value === "pegawai") {
        let pn = "",
          nama = "",
          g,
          t,
          d;
        if (cols.length > 1) {
          pn = cols[0].includes(" - ") ? cols[0].split(" - ")[0] : cols[0];
          nama = cols[0].includes(" - ") ? cols[0].split(" - ")[1] : cols[1];
          g = cols[cols.length - 3];
          t = cols[cols.length - 2];
          d = cols[cols.length - 1];
        }
        result.push({
          pn,
          nama,
          giro: cleanNum(g),
          tab: cleanNum(t),
          depo: cleanNum(d),
          tanggal: tanggalInput.value,
        });
      } else if (inputType.value === "uker") {
        const regexAngka = /(.*?)\s+([\d.,-]+)$/;
        const match = text.match(regexAngka);
        let unit = "",
          namaUker = "",
          nilai = 0;

        if (match) {
          nilai = cleanNum(match[2]);
          let id = match[1].trim();
          unit = id.split(/ -- | - /)[0];
          namaUker = id.split(/ -- | - /)[1] || "Unit Kerja";
        }
        result.push({
          unit,
          nama: namaUker,
          produk: selectedProduct.value,
          nilai,
          tanggal: tanggalInput.value,
        });
      } else if (inputType.value === "pipeline") {
        if (cols.length >= 3) {
          let currentRMFT = cols[0].trim();

          if (!currentRMFT && lastRMFT) {
            currentRMFT = lastRMFT;
          } else if (currentRMFT) {
            lastRMFT = currentRMFT;
          }

          let rowDate = tanggalInput.value;
          let pPipeline = 0,
            pNominal = 0,
            pKet = "-";

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
            return [
              "T",
              "G",
              "D",
              "TAB",
              "GIRO",
              "DEPO",
              "TABUNGAN",
              "DEPOSITO",
            ].includes(up);
          };

          if (dateMatch) {
            rowDate = dateMatch.date;
            usedIndex = dateMatch.index;
            lastFormatIndex = usedIndex;
          } else if (lastFormatIndex !== -1) {
            usedIndex = lastFormatIndex;
            rowDate = "";
          } else {
            if (isProd(cols[3])) {
              usedIndex = 2;
              rowDate = "";
            } else if (isProd(cols[4])) {
              usedIndex = 3;
              rowDate = "";
            }
          }

          if (usedIndex === 3) {
            pPipeline = cleanNum(cols[2]);
            pKet = mapJenisProduct(cols[4]);
            pNominal = cleanNum(cols[5]) || 0;
          } else if (usedIndex === 2) {
            pKet = mapJenisProduct(cols[3]);
            pPipeline = cleanNum(cols[4]);
            pNominal = cleanNum(cols[5]);
          } else if (usedIndex > 3) {
            pPipeline = cleanNum(cols[2]);
            pKet = cols[3]?.trim() || "-";
            pNominal = cleanNum(cols[4]);
          } else {
            pPipeline = cleanNum(cols[2]);
            pKet = cols[3]?.trim() || "-";
            pNominal = cleanNum(cols[4]);
            if (!dateMatch && lastFormatIndex === -1 && usedIndex === -1) {
              rowDate = tanggalInput.value;
            }
          }

          result.push({
            NAMA_RMFT: currentRMFT || "Unknown RMFT",
            NAMA_NASABAH: cols[1]?.trim() || "Nasabah Umum",
            PIPELINE: pPipeline,
            KETERANGAN: pKet,
            NOMINAL: pNominal,
            TANGGAL: rowDate,
          });
        }
      } else if (inputType.value === "rmft_ach") {
        if (cols.length > 1) {
          result.push({
            NAMA_RMFT: cols[rmftMap.rmft]?.trim() || "Unknown RMFT",
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
            TANGGAL: tanggalInput.value,
          });
        }
      } else if (inputType.value === "keragaan" || inputType.value === "rka") {
        const inputRowText = text.toUpperCase();
        const foundProd = fixedProducts.find((p) => inputRowText.includes(p));

        if (foundProd) {
          const nilaiRaw = cols[cols.length - 1];
          result.push({
            produk: foundProd,
            nilai: cleanNum(nilaiRaw),
            tanggal: tanggalInput.value,
            bulan: tanggalInput.value.substring(0, 7),
          });
        }
      }
    });
    parsedData.value = result;
  }, 100);
};

const saveData = async () => {
  if (parsedData.value.length === 0) return alert("Preview masih kosong, bre!");
  if (!confirm(`Kirim ${parsedData.value.length} data ke database?`)) return;

  isSaving.value = true;
  try {
    const payload = {
      action: "insert",
      type: inputType.value,
      data: parsedData.value,
    };
    const response = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const res = await response.json();
    if (res.status === "success") {
      alert(
        `Berhasil!\n${parsedData.value.length} data ${inputType.value} periode ${formatDateIndo(tanggalInput.value)} sudah masuk.`,
      );
      clearCache();
      parsedData.value = [];
      rawPaste.value = "";
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    alert("Gagal Simpan: " + error.message);
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
    <div class="flex items-center space-x-5 mb-10">
      <div
        class="p-5 bg-blue-600 rounded-[2.5rem] shadow-2xl text-white rotate-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div>
        <h1
          class="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none"
        >
          Entry Center
        </h1>
        <p
          class="text-[10px] font-bold text-slate-400 tracking-[0.3em] mt-2 uppercase"
        >
          Input Data Cepat via Smart-Paste
        </p>
      </div>
    </div>

    <!-- Mobile Dropdown -->
    <div class="block lg:hidden w-full mb-8 relative">
      <select
        v-model="inputType"
        class="w-full border border-slate-200 p-3.5 rounded-xl bg-white font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer shadow-sm"
      >
        <option v-for="m in menuTabs" :key="m.id" :value="m.id">
          {{ m.l }}
        </option>
      </select>
      <div
        class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
      >
        ▼
      </div>
    </div>

    <!-- Desktop Tabs -->
    <div
      class="hidden lg:flex flex-wrap gap-2 p-1.5 bg-white rounded-xl w-full lg:w-fit mb-8 border border-slate-200 shadow-sm"
    >
      <button
        v-for="m in menuTabs"
        :key="m.id"
        @click="inputType = m.id"
        :class="
          inputType === m.id
            ? 'bg-blue-50 text-blue-700 shadow-sm'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        "
        class="flex items-center px-4 py-2 rounded-lg font-semibold transition-all text-sm"
      >
        <component :is="m.icon" class="w-4 h-4 mr-2" />
        {{ m.l }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div class="lg:col-span-4 space-y-8">
        <div
          class="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100"
        >
          <div class="space-y-6">
            <div>
              <label
                class="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2"
                ><Calendar class="w-4 h-4" /> Tanggal Data</label
              >
              <input
                type="date"
                v-model="tanggalInput"
                @change="handlePaste"
                class="w-full border-4 border-slate-50 p-4 rounded-3xl bg-slate-50 font-black text-lg focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner"
              />
              <p
                class="mt-2 text-[9px] text-blue-500 font-bold uppercase tracking-widest ml-2 italic"
              >
                * Pastikan tanggal sesuai data Excel
              </p>
            </div>

            <div v-if="inputType === 'uker'">
              <label
                class="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2"
                ><ListChecks class="w-4 h-4" /> Pilih Produk Unit</label
              >
              <select
                v-model="selectedProduct"
                @change="handlePaste"
                class="w-full border-4 border-slate-50 p-4 rounded-3xl bg-slate-50 font-black focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner"
              >
                <option value="Giro">Giro</option>
                <option value="Tabungan">Tabungan</option>
                <option value="Deposito">Deposito</option>
              </select>
            </div>

            <div>
              <label
                class="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2"
                ><FilePlus2 class="w-4 h-4" /> Excel Paste Zone</label
              >
              <textarea
                v-model="rawPaste"
                @input="handlePaste"
                :placeholder="
                  inputType === 'pegawai'
                    ? 'Paste PN - Nama & Saldo...'
                    : 'Copy dari Excel lalu Paste di sini...'
                "
                class="w-full h-96 p-6 border-4 border-slate-50 bg-slate-50 rounded-[2.5rem] focus:bg-white focus:border-blue-500 outline-none font-mono text-xs transition-all leading-relaxed shadow-inner"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Panduan Struktur & Contoh Data -->
        <div
          class="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden"
        >
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Info class="w-5 h-5" />
            </div>
            <div>
              <h4
                class="font-black text-slate-700 text-sm tracking-tight uppercase"
              >
                Panduan Struktur Kolom
              </h4>
              <p
                class="text-[9px] text-slate-400 font-bold uppercase tracking-wider"
              >
                Format Data & Contoh Untuk {{ activeSample?.title }}
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Deskripsi -->
            <p class="text-xs text-slate-500 leading-relaxed">
              {{ activeSample?.desc }}
            </p>

            <!-- Format Toggle (Hanya untuk Achievement RMFT) -->
            <div
              v-if="inputType === 'rmft_ach'"
              class="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-2xl"
            >
              <button
                @click="rmftAchFormat = 'terbaru'"
                :class="
                  rmftAchFormat === 'terbaru'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                "
                class="flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all"
              >
                Format Terbaru
              </button>
              <button
                @click="rmftAchFormat = 'dasar'"
                :class="
                  rmftAchFormat === 'dasar'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                "
                class="flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all"
              >
                Format Dasar
              </button>
            </div>

            <!-- Struktur Kolom Badges -->
            <div>
              <label
                class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2"
                >Struktur Kolom Excel:</label
              >
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
                <label
                  class="text-[9px] font-black text-slate-400 uppercase tracking-widest"
                  >Contoh Data Excel:</label
                >
                <button
                  @click="copySample"
                  class="flex items-center gap-1 text-[9px] text-blue-600 font-black uppercase tracking-wider hover:text-blue-700 transition-colors"
                >
                  <component :is="isCopied ? Check : Copy" class="w-3 h-3" />
                  {{ isCopied ? "Tersalin!" : "Salin Contoh" }}
                </button>
              </div>
              <pre
                class="bg-slate-50 border border-slate-100 rounded-2xl p-4 font-mono text-[10px] text-slate-600 overflow-x-auto whitespace-pre leading-relaxed shadow-inner max-h-40"
                >{{ activeSample?.raw }}</pre
              >
            </div>

            <!-- Load Button -->
            <button
              @click="loadSample"
              class="w-full py-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl text-[10px] font-black text-slate-600 hover:text-blue-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-sm active:scale-[0.98]"
            >
              <Sparkles class="w-3.5 h-3.5 text-blue-500" />
              Gunakan Data Contoh
            </button>
          </div>
        </div>
      </div>

      <div class="lg:col-span-8 flex flex-col">
        <div
          class="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-full min-h-[600px]"
        >
          <div
            class="p-8 border-b flex justify-between items-center bg-slate-50/50 backdrop-blur-sm"
          >
            <div>
              <h3
                class="font-black text-slate-700 text-xl tracking-tight uppercase"
              >
                Live Preview
              </h3>
              <div class="flex items-center space-x-3 mt-1">
                <p
                  class="text-[10px] text-blue-600 font-bold uppercase tracking-widest"
                >
                  {{ parsedData.length }} Baris Terdeteksi
                </p>
                <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                <p
                  class="flex items-center gap-1 text-[10px] text-red-600 font-black uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-lg border border-red-100"
                >
                  <Calendar class="w-3 h-3" /> Periode:
                  {{ formatDateIndo(tanggalInput) }}
                </p>
              </div>
            </div>
            <div
              class="px-5 py-2 bg-blue-100 text-blue-700 rounded-2xl font-black text-[10px] uppercase border border-blue-200"
            >
              {{ inputType === "pegawai" ? "DANA" : inputType }} MODE
            </div>
          </div>

          <div class="flex-1 overflow-auto p-4">
            <!-- Alert Warning Validasi Data -->
            <div
              v-if="validationErrors.length > 0"
              class="mb-6 p-6 bg-red-50 border-2 border-red-100 rounded-3xl space-y-3 animate-in fade-in duration-300"
            >
              <div class="flex items-center gap-2.5 text-red-800">
                <AlertCircle class="w-5 h-5 shrink-0" />
                <h4 class="font-black text-xs uppercase tracking-wider">
                  Terdeteksi {{ validationErrors.length }} Masalah Data
                </h4>
              </div>
              <ul
                class="list-disc pl-5 text-[10px] text-red-600 font-bold space-y-1.5 max-h-32 overflow-y-auto"
              >
                <li
                  v-for="(err, idx) in validationErrors.slice(0, 10)"
                  :key="idx"
                >
                  {{ err }}
                </li>
                <li
                  v-if="validationErrors.length > 10"
                  class="italic text-red-400 mt-1"
                >
                  ... dan {{ validationErrors.length - 10 }} baris bermasalah
                  lainnya. Silakan periksa kembali spreadsheet Anda.
                </li>
              </ul>
            </div>

            <table
              v-if="parsedData.length > 0"
              class="w-full text-left border-separate border-spacing-0"
            >
              <thead
                class="bg-slate-800 text-white sticky top-0 z-10 uppercase text-[10px] tracking-widest text-center"
              >
                <tr v-if="inputType === 'pipeline'">
                  <th
                    class="p-5 rounded-tl-2xl border-b border-slate-700 text-left"
                  >
                    RMFT & Nasabah
                  </th>
                  <th class="p-5 border-b border-slate-700 text-right">
                    Pipeline
                  </th>
                  <th class="p-5 border-b border-slate-700 text-right">
                    Nominal
                  </th>
                  <th class="p-5 border-b border-slate-700 text-center">
                    Tanggal
                  </th>
                  <th
                    class="p-5 border-b border-slate-700 text-left rounded-tr-2xl"
                  >
                    Ket
                  </th>
                </tr>
                <tr
                  v-else-if="
                    inputType === 'rmft_ach' && activeVersion === 'new'
                  "
                >
                  <th
                    class="p-4 rounded-tl-2xl border-b border-slate-700 whitespace-nowrap"
                  >
                    RMFT
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    AVG TAB
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    POSISI TAB
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    AVG GIRO
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    AVG DPK
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    PAYROLL
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    EDC & QRIS
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    CASA ME
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    SV EDC
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    USER ACTIV B
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    USER ACTIV QLOLA
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    PH PROGRAM
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right rounded-tr-2xl whitespace-nowrap"
                  >
                    TOTAL
                  </th>
                </tr>
                <tr
                  v-else-if="
                    inputType === 'rmft_ach' && activeVersion === 'old'
                  "
                >
                  <th
                    class="p-4 rounded-tl-2xl border-b border-slate-700 whitespace-nowrap"
                  >
                    RMFT
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    AVG TAB
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    AVG GIRO
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    AVG DPK
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    FBI PA
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    EDC/QRIS
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    DPK MERCH
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    SV
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    PAYROLL
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    QLOLA
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    KANWIL
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right whitespace-nowrap"
                  >
                    SGF
                  </th>
                  <th
                    class="p-4 border-b border-slate-700 text-right rounded-tr-2xl whitespace-nowrap"
                  >
                    TOTAL
                  </th>
                </tr>
                <tr v-else>
                  <th class="p-5 rounded-tl-2xl border-b border-slate-700">
                    Data Utama
                  </th>
                  <th
                    v-if="inputType === 'pegawai'"
                    v-for="h in ['Giro', 'Tab', 'Depo']"
                    :key="h"
                    class="p-5 text-right border-b border-slate-700"
                  >
                    {{ h }}
                  </th>
                  <th
                    v-if="inputType === 'uker'"
                    class="p-5 border-b border-slate-700 text-center"
                  >
                    Produk
                  </th>
                  <th
                    v-if="inputType !== 'pegawai'"
                    class="p-5 text-right border-b border-slate-700 rounded-tr-2xl"
                  >
                    Nilai
                  </th>
                </tr>
              </thead>
              <tbody class="text-sm">
                <tr
                  v-for="(d, i) in parsedData"
                  :key="i"
                  class="hover:bg-blue-50/50 transition-colors"
                >
                  <template v-if="inputType === 'pipeline'">
                    <td class="p-4 border-b border-slate-100">
                      <div
                        class="font-black text-blue-900 uppercase text-[11px]"
                      >
                        {{ d.NAMA_RMFT || "-" }}
                      </div>
                      <div class="font-bold text-slate-400 text-[9px] mt-1">
                        {{ d.NAMA_NASABAH || "-" }}
                      </div>
                    </td>
                    <td
                      class="p-4 text-right font-black text-amber-600 border-b border-slate-100"
                    >
                      {{ d.PIPELINE.toLocaleString("id-ID") }}
                    </td>
                    <td
                      class="p-4 text-right font-black text-green-700 border-b border-slate-100"
                    >
                      {{ d.NOMINAL.toLocaleString("id-ID") }}
                    </td>
                    <td
                      class="p-4 text-center font-bold text-slate-400 border-b border-slate-100"
                    >
                      {{ formatDateIndo(d.TANGGAL) }}
                    </td>
                    <td
                      class="p-4 text-slate-400 font-bold border-b border-slate-100 italic"
                    >
                      {{ d.KETERANGAN }}
                    </td>
                  </template>
                  <template
                    v-else-if="
                      inputType === 'rmft_ach' && activeVersion === 'new'
                    "
                  >
                    <td
                      class="p-4 border-b border-slate-100 font-black text-blue-900 uppercase text-[10px] whitespace-nowrap"
                    >
                      {{ d.NAMA_RMFT }}
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.AVG_TAB }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.posisi_tab }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.AVG_GIRO }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.AVG_DPK }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.NEW_PAYROLL }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.EDC_QRIS }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.casa_me }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.sv_edc }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.user_activ_b }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.user_activ_qlola }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.ph_program }}%
                    </td>
                    <td
                      class="p-4 text-right font-black text-green-700 border-b border-slate-100"
                    >
                      {{ d.TOTAL }}%
                    </td>
                  </template>
                  <template
                    v-else-if="
                      inputType === 'rmft_ach' && activeVersion === 'old'
                    "
                  >
                    <td
                      class="p-4 border-b border-slate-100 font-black text-blue-900 uppercase text-[10px] whitespace-nowrap"
                    >
                      {{ d.NAMA_RMFT }}
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.AVG_TAB }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.AVG_GIRO }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.AVG_DPK }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.FBI_PA }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.EDC_QRIS }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.DPK_MERCHANT }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.SV }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.NEW_PAYROLL }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.PROD_QLOLA }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.PROG_KANWIL }}%
                    </td>
                    <td
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.PROG_SGF }}%
                    </td>
                    <td
                      class="p-4 text-right font-black text-green-700 border-b border-slate-100"
                    >
                      {{ d.TOTAL }}%
                    </td>
                  </template>
                  <template v-else>
                    <td
                      class="p-5 font-black text-slate-700 border-b border-slate-100 uppercase"
                    >
                      {{ d.pn || d.unit || d.produk }}
                      <span
                        class="block font-medium text-slate-400 text-[10px] mt-1"
                        >{{ d.nama || "" }}</span
                      >
                    </td>
                    <td
                      v-if="inputType === 'pegawai'"
                      class="p-5 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.giro.toLocaleString("id-ID") }}
                    </td>
                    <td
                      v-if="inputType === 'pegawai'"
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.tab.toLocaleString("id-ID") }}
                    </td>
                    <td
                      v-if="inputType === 'pegawai'"
                      class="p-4 text-right font-mono text-slate-500 border-b border-slate-100"
                    >
                      {{ d.depo.toLocaleString("id-ID") }}
                    </td>
                    <td
                      v-if="inputType === 'uker'"
                      class="p-5 text-center border-b border-slate-100"
                    >
                      <span
                        class="px-3 py-1 bg-slate-100 rounded-lg font-black text-[10px] text-slate-500"
                        >{{ d.produk }}</span
                      >
                    </td>
                    <td
                      v-if="inputType === 'uker'"
                      class="p-5 text-right font-black text-blue-900 text-xl border-b border-slate-100"
                    >
                      {{ d.nilai.toLocaleString("id-ID") }}
                    </td>
                    <td
                      v-if="inputType === 'keragaan' || inputType === 'rka'"
                      class="p-5 text-right font-black text-blue-900 text-2xl italic border-b border-slate-100"
                    >
                      {{ d.nilai.toLocaleString("id-ID") }}
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
            <div
              v-else
              class="flex flex-col items-center justify-center h-full opacity-30 py-20"
            >
              <UploadCloud class="w-24 h-24 mb-6 text-slate-500" />
              <p class="font-black uppercase tracking-widest text-xs">
                Siap Menerima Paste Tabel {{ inputType }}...
              </p>
            </div>
          </div>

          <div class="p-8 bg-slate-50/80 border-t border-slate-200">
            <button
              @click="saveData"
              :disabled="
                isSaving ||
                parsedData.length === 0 ||
                validationErrors.length > 0
              "
              :class="{
                'bg-rose-600 hover:bg-rose-700 shadow-rose-200':
                  validationErrors.length > 0 && !isSaving,
              }"
              class="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all disabled:bg-slate-300 disabled:shadow-none active:scale-95 flex flex-col items-center justify-center space-y-1 uppercase tracking-widest"
            >
              <template v-if="!isSaving">
                <template v-if="validationErrors.length > 0">
                  <span class="flex items-center gap-2 text-base"
                    ><AlertCircle class="w-5 h-5" /> PERBAIKI
                    {{ validationErrors.length }} MASALAH DATA</span
                  >
                  <span class="text-[9px] opacity-70 tracking-[0.2em]"
                    >TIDAK BISA MENGIRIM DATA CACAT</span
                  >
                </template>
                <template v-else>
                  <span class="flex items-center gap-2 text-base"
                    ><Send class="w-5 h-5" /> KIRIM
                    {{ parsedData.length }} DATA</span
                  >
                  <span class="text-[9px] opacity-70 tracking-[0.2em]"
                    >UNTUK PERIODE {{ formatDateIndo(tanggalInput) }}</span
                  >
                </template>
              </template>
              <template v-else>
                <div class="flex items-center space-x-3">
                  <div
                    class="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"
                  ></div>
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
.animate-in {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
```

### 5.7 View: Management (src/views/ManageData.vue)

```vue
<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
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
} from "lucide-vue-next";
import { store, fetchData as storeFetchData, clearCache } from "../store";

const route = useRoute();
const router = useRouter();

const targetType = computed({
  get: () => store.manage.targetType,
  set: (val) => {
    store.manage.targetType = val;
  },
});

const selectedDateToDelete = computed({
  get: () => store.manage.selectedDateToDelete,
  set: (val) => {
    store.manage.selectedDateToDelete = val;
  },
});

const rawData = computed(() => store.rawData);
const isLoading = computed(() => store.isLoading);
const isProcessing = ref(false);

const categories = [
  { id: "pegawai", n: "Dana RMFT", i: Users },
  { id: "unit", n: "Unit Kerja", i: Building2 },
  { id: "keragaan", n: "Keragaan", i: Activity },
  { id: "rka", n: "RKA", i: FileText },
  { id: "pipeline", n: "Pipeline", i: TrendingUp },
  { id: "rmft_ach", n: "RMFT", i: Target },
];

const toast = ref({ show: false, message: "", type: "success" });
const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 4000);
};

const apiUrl = import.meta.env.VITE_API_URL;

const fetchData = async (forceRefresh = false) => {
  try {
    await storeFetchData(forceRefresh);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
};

watch(
  () => route.query.type,
  (newType) => {
    if (newType && newType !== targetType.value) {
      targetType.value = newType;
      selectedDateToDelete.value = "";
    }
  },
);

watch(targetType, (newVal) => {
  if (route.query.type !== newVal) {
    router.replace({ query: { ...route.query, type: newVal } });
  }
  selectedDateToDelete.value = "";
});

const availableDates = computed(() => {
  const data = rawData.value[targetType.value] || [];
  if (data.length === 0) return [];

  const dates = data
    .map((item) => {
      let val;
      if (targetType.value === "rka") val = item.Bulan_Tahun;
      else if (targetType.value === "pipeline")
        val =
          item.TANGGAL_TARGET || item.Tanggal || item.TANGGAL || item.tanggal;
      else if (targetType.value === "rmft_ach")
        val =
          item.BULAN ||
          item.bulan ||
          item.Tanggal_Data ||
          item.TANGGAL ||
          item.tanggal;
      else val = item.Tanggal_Data;

      if (!val) return null;

      const str = val.toString().trim();
      return targetType.value === "rka" ||
        targetType.value === "rmft_ach" ||
        targetType.value === "pipeline"
        ? str.substring(0, 7)
        : str.substring(0, 10);
    })
    .filter((d) => d && d.length >= 7);

  return [...new Set(dates)].sort().reverse();
});

const deleteData = async () => {
  if (!selectedDateToDelete.value)
    return showToast("Silakan pilih periode tanggal terlebih dahulu.", "error");

  const confirmMsg = `KONFIRMASI PENGHAPUSAN\n\nKategori: ${targetType.value.toUpperCase()}\nPeriode: ${selectedDateToDelete.value}\n\nData akan dihapus permanen. Lanjutkan?`;

  if (!confirm(confirmMsg)) return;

  isProcessing.value = true;
  try {
    const payload = {
      action: "delete",
      type: targetType.value === "unit" ? "uker" : targetType.value,
      targetDate: selectedDateToDelete.value,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const res = await response.json();

    if (res.status === "success") {
      showToast(
        `Berhasil! Data ${targetType.value.toUpperCase()} periode ${selectedDateToDelete.value} telah dihapus.`,
        "success",
      );
      clearCache();
      await fetchData(true); // Sinkronkan ulang daftar tanggal
    } else {
      showToast("Gagal: " + res.message, "error");
    }
  } catch (error) {
    showToast("Koneksi Error: " + error.message, "error");
  } finally {
    isProcessing.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div
    class="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in duration-500 font-sans"
    style="font-family: 'Inter', sans-serif;"
  >
    <!-- Toast Notification Overlay -->
    <transition name="slide-down">
      <div
        v-if="toast.show"
        class="fixed top-6 right-6 z-[200] flex items-center p-4 rounded-xl shadow-lg border"
        :class="
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        "
      >
        <CheckCircle2
          v-if="toast.type === 'success'"
          class="w-5 h-5 mr-3 text-emerald-600 shrink-0"
        />
        <XCircle v-else class="w-5 h-5 mr-3 text-rose-600 shrink-0" />
        <p class="font-medium text-sm">{{ toast.message }}</p>
        <button
          @click="toast.show = false"
          class="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition>

    <div class="flex items-center space-x-4 mb-8">
      <Database class="w-10 h-10 text-blue-600" />
      <div>
        <h1
          class="text-3xl font-bold text-slate-800 tracking-tight leading-none"
        >
          Manajemen Data
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Pembersihan dan Pemeliharaan Database BRIJIMOS
        </p>
      </div>
    </div>

    <div
      class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div class="p-6 md:p-8 space-y-8">
        <!-- STEP 1 -->
        <div class="space-y-3">
          <label class="text-sm font-semibold text-slate-700 block"
            >1. Pilih Kategori Laporan</label
          >

          <!-- Mobile Dropdown -->
          <div class="block md:hidden relative">
            <select
              v-model="targetType"
              :disabled="isLoading"
              class="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option v-for="t in categories" :key="t.id" :value="t.id">
                {{ t.n }}
              </option>
            </select>
            <div
              class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
            >
              ▼
            </div>
          </div>

          <!-- Desktop Grid -->
          <div
            class="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2"
          >
            <button
              v-for="t in categories"
              :key="t.id"
              @click="targetType = t.id"
              :disabled="isLoading"
              :class="[
                targetType === t.id
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
                isLoading ? 'opacity-60 cursor-not-allowed' : '',
              ]"
              class="p-3 flex flex-col items-center justify-center gap-2 rounded-xl border transition-all active:scale-[0.98]"
            >
              <component
                :is="t.i"
                class="w-5 h-5"
                :class="
                  targetType === t.id ? 'text-blue-600' : 'text-slate-400'
                "
              />
              <span class="font-semibold text-xs text-center">{{ t.n }}</span>
            </button>
          </div>
        </div>

        <!-- STEP 2 -->
        <div class="space-y-3">
          <label class="text-sm font-semibold text-slate-700 block"
            >2. Pilih Periode yang Ingin Dihapus</label
          >
          <div v-if="isLoading" class="animate-pulse">
            <div
              class="h-12 bg-slate-50 rounded-lg w-full border border-slate-200/50 flex items-center px-4"
            >
              <div class="h-4 bg-slate-200 rounded w-1/3"></div>
            </div>
          </div>
          <div v-else-if="availableDates.length > 0">
            <div class="relative">
              <Calendar
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
              />
              <select
                v-model="selectedDateToDelete"
                class="w-full border border-slate-200 pl-10 p-3 rounded-lg bg-slate-50 font-medium text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>-- Pilih Tanggal / Bulan --</option>
                <option
                  v-for="date in availableDates"
                  :key="date"
                  :value="date"
                >
                  {{ date }}
                </option>
              </select>
              <div
                class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              >
                ▼
              </div>
            </div>
          </div>
          <div
            v-else
            class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300"
          >
            <SearchX class="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <p class="text-slate-500 font-medium text-sm">
              Tidak ada riwayat data pada kategori ini.
            </p>
          </div>
        </div>

        <!-- ACTION -->
        <div
          v-if="selectedDateToDelete"
          class="pt-4 animate-in fade-in duration-300"
        >
          <div
            class="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-3 mb-4"
          >
            <AlertCircle class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 class="text-sm font-semibold text-rose-800">
                Peringatan Penghapusan
              </h4>
              <p class="text-xs text-rose-600 mt-1">
                Anda akan menghapus secara permanen semua data
                <strong class="uppercase">{{ targetType }}</strong> untuk
                periode <strong>{{ selectedDateToDelete }}</strong
                >. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>

          <button
            @click="deleteData"
            :disabled="isProcessing"
            class="w-full bg-rose-500 text-white font-semibold py-3.5 rounded-lg hover:bg-rose-600 shadow-sm shadow-rose-200 transition-all active:scale-[0.98] flex justify-center items-center space-x-2 disabled:bg-slate-300 disabled:shadow-none"
          >
            <span v-if="!isProcessing" class="flex items-center gap-2"
              ><Trash2 class="w-5 h-5" /> Hapus Permanen Data</span
            >
            <div v-else class="flex items-center space-x-3">
              <div
                class="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"
              ></div>
              <span>Sedang Menghapus...</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
```

### 5.8 Backend API Google Apps Script (GAS)

```javascript
// --- KONFIGURASI NAMA SHEET ---
const SHEET_MAP = {
  pegawai: "Sheet1",
  unit: "Data_Unit",
  keragaan: "Keragaan_Cabang",
  rka: "RKA_Data",
  pipeline: "Pipeline_Data",
  rmft_ach: "Pencapaian_RMFT",
};

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  function getSheetData(name) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return [];
    const data = sheet.getDataRange().getDisplayValues();
    const headers = data[0];
    return data.slice(1).map((row) => {
      let obj = {};
      headers.forEach((header, i) => {
        let val = row[i].toString().trim();
        if (val.includes("/")) {
          let parts = val.split("/");
          if (parts.length === 3 && parts[2].length === 4) {
            val =
              parts[2] +
              "-" +
              parts[1].padStart(2, "0") +
              "-" +
              parts[0].padStart(2, "0");
          }
        }
        obj[header] = val;
      });
      return obj;
    });
  }
  return ContentService.createTextOutput(
    JSON.stringify({
      pegawai: getSheetData(SHEET_MAP.pegawai),
      unit: getSheetData(SHEET_MAP.unit),
      keragaan: getSheetData(SHEET_MAP.keragaan),
      rka: getSheetData(SHEET_MAP.rka),
      pipeline: getSheetData(SHEET_MAP.pipeline),
      rmft_ach: getSheetData(SHEET_MAP.rmft_ach),
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const type = body.type;
    const key = type === "uker" ? "unit" : type;
    const sheet = ss.getSheetByName(SHEET_MAP[key]);
    if (!sheet) throw new Error("Sheet tidak ditemukan!");

    // --- LOGIKA HAPUS ---
    if (action === "delete") {
      const targetDate = body.targetDate.toString().trim();
      const data = sheet.getDataRange().getDisplayValues();
      const headers = data[0];
      const dateColIdx = headers.findIndex(
        (h) =>
          h.toLowerCase().includes("tanggal") ||
          h.toLowerCase().includes("bulan"),
      );
      let deletedCount = 0;
      for (let i = data.length - 1; i >= 1; i--) {
        let rowDate = data[i][dateColIdx].toString().trim();
        if (rowDate.includes("/")) {
          let parts = rowDate.split("/");
          rowDate =
            parts[2] +
            "-" +
            parts[1].padStart(2, "0") +
            "-" +
            parts[0].padStart(2, "0");
        }
        if (rowDate.includes(targetDate)) {
          sheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
      return response({
        status: "success",
        message: deletedCount + " baris dihapus",
      });
    }

    // --- LOGIKA SIMPAN (DYNAMIC MAPPING) ---
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const dataArray = body.data;
    const rowsToInsert = dataArray.map((item) => {
      return headers.map((header) => {
        // GAS akan otomatis mencocokkan key JSON dengan Nama Kolom di Sheet
        return item[header] !== undefined ? item[header] : "";
      });
    });

    sheet
      .getRange(sheet.getLastRow() + 1, 1, rowsToInsert.length, headers.length)
      .setValues(rowsToInsert);
    return response({
      status: "success",
      message: rowsToInsert.length + " data berhasil masuk",
    });
  } catch (err) {
    return response({ status: "error", message: err.message });
  }
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
```

---

## 6. Panduan Konfigurasi dan Deployment

### 6.1 Backend API Deployment (Google Apps Script)

1. Buka spreadsheet database Anda di Google Sheets.
2. Klik menu Ekstensi lalu pilih Apps Script.
3. Tempelkan seluruh kode backend Apps Script ke dalam editor Apps Script.
4. Klik tombol Simpan.
5. Klik tombol Terapkan (Deploy) lalu pilih Penerapan Baru (New Deployment).
6. Atur konfigurasi penerapan sebagai Aplikasi Web (Web App), pastikan akses diatur ke Siapa saja (Anyone), kemudian klik Terapkan.
7. Salin URL Aplikasi Web yang dihasilkan sebagai endpoint API Anda.

### 6.2 Frontend Project Setup

1. Pastikan Node.js telah terinstal pada komputer Anda.
2. Buat file `.env` di root directory project Anda dengan isi sebagai berikut:
   ```env
   VITE_API_URL=URL_API_WEB_APP_APPS_SCRIPT_ANDA
   ```
3. Unduh seluruh dependensi yang diperlukan:
   ```bash
   npm install
   ```
4. Untuk menjalankan project dalam mode pengembangan lokal:
   ```bash
   npm run dev
   ```
5. Untuk membuild berkas statis teroptimasi yang siap di-deploy ke hosting (GitHub Pages, Netlify, Vercel):
   ```bash
   npm run build
   ```
   Folder `dist/` yang dihasilkan siap di-host pada platform hosting pilihan Anda.
