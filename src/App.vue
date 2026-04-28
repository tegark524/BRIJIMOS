<template>
  <div class="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative" style="font-family: 'Inter', 'Geist', sans-serif;">
    
    <!-- Mobile Header -->
    <header class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-5 flex justify-between items-center z-50">
      <div class="flex items-center space-x-3">
        <img src="/logo.png" alt="Logo BRI" class="w-8 h-8 object-contain" />
        <span class="font-bold text-lg text-blue-900 tracking-tight">BRIJIMOS</span>
      </div>
      
      <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors active:scale-95">
        <X v-if="isSidebarOpen" class="w-6 h-6" />
        <Menu v-else class="w-6 h-6" />
      </button>
    </header>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed lg:static inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo Section -->
      <div class="h-20 flex items-center px-6 border-b border-slate-200">
        <div class="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo BRI" class="w-8 h-8 object-contain" />
          <div>
            <h1 class="text-xl font-bold text-blue-900 tracking-tight leading-none">BRIJIMOS</h1>
            <p class="text-[10px] text-slate-500 font-medium tracking-widest mt-1 uppercase">BRI Jemursari Monitoring System</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        
        <!-- DASHBOARD -->
        <div>
          <button @click="toggleMenu('dashboard')" class="w-full flex items-center justify-between p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group">
            <div class="flex items-center space-x-3">
              <LayoutDashboard class="w-5 h-5 group-hover:text-blue-600 transition-colors" />
              <span class="font-semibold text-sm">Dashboard</span>
            </div>
            <ChevronDown v-if="openMenus.dashboard" class="w-4 h-4 text-slate-400" />
            <ChevronRight v-else class="w-4 h-4 text-slate-400" />
          </button>
          
          <div v-show="openMenus.dashboard" class="mt-1 mb-2 ml-4 pl-4 border-l border-slate-200 space-y-1">
            <router-link to="/?tab=pegawai" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <Users class="w-4 h-4" />
              <span>Pegawai</span>
            </router-link>
            <router-link to="/?tab=unit" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <Building2 class="w-4 h-4" />
              <span>Unit Kerja</span>
            </router-link>
            <router-link to="/?tab=keragaan" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <Activity class="w-4 h-4" />
              <span>Keragaan</span>
            </router-link>
            <router-link to="/?tab=pipeline" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <TrendingUp class="w-4 h-4" />
              <span>Pipeline</span>
            </router-link>
            <router-link to="/?tab=rmft_ach" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <Target class="w-4 h-4" />
              <span>Achievement RMFT</span>
            </router-link>
          </div>
        </div>

        <!-- INPUT DATA -->
        <div>
          <button @click="toggleMenu('input')" class="w-full flex items-center justify-between p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group">
            <div class="flex items-center space-x-3">
              <PlusCircle class="w-5 h-5 group-hover:text-blue-600 transition-colors" />
              <span class="font-semibold text-sm">Input Data</span>
            </div>
            <ChevronDown v-if="openMenus.input" class="w-4 h-4 text-slate-400" />
            <ChevronRight v-else class="w-4 h-4 text-slate-400" />
          </button>
          
          <div v-show="openMenus.input" class="mt-1 mb-2 ml-4 pl-4 border-l border-slate-200 space-y-1">
            <router-link to="/input?type=pegawai" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <Users class="w-4 h-4" />
              <span>Pegawai</span>
            </router-link>
            <router-link to="/input?type=uker" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <Building2 class="w-4 h-4" />
              <span>Unit Kerja</span>
            </router-link>
            <router-link to="/input?type=keragaan" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <Activity class="w-4 h-4" />
              <span>Keragaan</span>
            </router-link>
            <router-link to="/input?type=rka" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <FileText class="w-4 h-4" />
              <span>RKA</span>
            </router-link>
            <router-link to="/input?type=pipeline" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <TrendingUp class="w-4 h-4" />
              <span>Pipeline</span>
            </router-link>
            <router-link to="/input?type=rmft_ach" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <Target class="w-4 h-4" />
              <span>Achievement RMFT</span>
            </router-link>
          </div>
        </div>

        <!-- MANAGEMENT -->
        <div>
          <button @click="toggleMenu('management')" class="w-full flex items-center justify-between p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group">
            <div class="flex items-center space-x-3">
              <Database class="w-5 h-5 group-hover:text-blue-600 transition-colors" />
              <span class="font-semibold text-sm">Management</span>
            </div>
            <ChevronDown v-if="openMenus.management" class="w-4 h-4 text-slate-400" />
            <ChevronRight v-else class="w-4 h-4 text-slate-400" />
          </button>
          
          <div v-show="openMenus.management" class="mt-1 mb-2 ml-4 pl-4 border-l border-slate-200 space-y-1">
            <router-link to="/manage?type=pegawai" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <Users class="w-4 h-4" />
              <span>Pegawai</span>
            </router-link>
            <router-link to="/manage?type=unit" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <Building2 class="w-4 h-4" />
              <span>Unit Kerja</span>
            </router-link>
            <router-link to="/manage?type=keragaan" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <Activity class="w-4 h-4" />
              <span>Keragaan</span>
            </router-link>
            <router-link to="/manage?type=rka" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <FileText class="w-4 h-4" />
              <span>RKA</span>
            </router-link>
            <router-link to="/manage?type=pipeline" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
              <TrendingUp class="w-4 h-4" />
              <span>Pipeline</span>
            </router-link>
            <router-link to="/manage?type=rmft_ach" @click="isSidebarOpen = false" class="flex items-center space-x-3 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-sm font-medium" active-class="bg-blue-50 text-blue-600 font-semibold">
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
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </div>
          <span class="text-xs font-semibold text-slate-600">Sistem Online</span>
        </div>
        <p class="text-[10px] text-slate-400 font-medium">
          By Tegar Satria Kirana <br> 
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
    <main class="flex-1 flex flex-col h-full overflow-hidden relative pt-16 lg:pt-0">
      <div class="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
        <router-view />
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref } from 'vue';
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
  FileText
} from 'lucide-vue-next';

const isSidebarOpen = ref(false);

// State untuk dropdown menu
const openMenus = ref({
  dashboard: true,
  input: false,
  management: false
});

const toggleMenu = (menu) => {
  openMenus.value[menu] = !openMenus.value[menu];
};
</script>

<style>
/* Reset Default */
* { -webkit-tap-highlight-color: transparent; }

/* Animasi Sidebar Overlay */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* Indikator Active Link */
.router-link-active {
}
</style>