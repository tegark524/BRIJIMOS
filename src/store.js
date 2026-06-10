import { reactive } from 'vue';

const apiUrl = import.meta.env.VITE_API_URL;

export const store = reactive({
  rawData: { pegawai: [], unit: [], keragaan: [], rka: [], pipeline: [], rmft_ach: [] },
  isLoading: false,
  isLoaded: false,
  lastUpdated: null,
  error: null,
  
  // Cache of filter states for Dashboard so selections are persistent across page changes
  dashboard: {
    activeTab: 'pegawai',
    selectedProduct: 'Giro',
    selectedDateUnit: '',
    selectedBaselineUnit: '',
    selectedBaseline: '',
    selectedLatest: '',
    selectedMonthRmft: '',
    searchQuery: '',
    tableScale: 1,
    selectedPegawaiProduct: 'Giro',
    selectedUnitProduct: 'Giro',
    pipelineSelectedMonth: '',
    pipelineSortOrder: 'default'
  },
  
  // Cache of options for ManageData
  manage: {
    targetType: 'unit',
    selectedDateToDelete: ''
  }
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
  if (!forceRefresh && store.isLoaded && store.rawData && store.lastUpdated && (now - store.lastUpdated < CACHE_DURATION)) {
    return store.rawData;
  }
  
  store.isLoading = true;
  store.error = null;
  
  fetchPromise = (async () => {
    try {
      const CACHE_KEY = 'brijimos_data';
      const CACHE_TIME_KEY = 'brijimos_data_timestamp';
      
      let data;
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      const cacheTime = sessionStorage.getItem(CACHE_TIME_KEY);
      
      if (!forceRefresh && cachedData && cacheTime && (now - Number(cacheTime)) < CACHE_DURATION) {
        data = JSON.parse(cachedData);
      } else {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch data from API');
        data = await response.json();
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
          sessionStorage.setItem(CACHE_TIME_KEY, now.toString());
        } catch (e) {
          console.warn('sessionStorage write failed', e);
        }
      }
      
      store.rawData = {
        pegawai: data.pegawai || [],
        unit: data.unit || [],
        keragaan: data.keragaan || [],
        rka: data.rka || [],
        pipeline: data.pipeline || [],
        rmft_ach: data.rmft_ach || []
      };
      store.isLoaded = true;
      store.lastUpdated = now;
      return store.rawData;
    } catch (error) {
      console.error("Store Fetch Error:", error);
      store.error = error.message || 'Koneksi API Gagal';
      throw error;
    } finally {
      store.isLoading = false;
      fetchPromise = null;
    }
  })();
  
  return fetchPromise;
};

export const clearCache = () => {
  sessionStorage.removeItem('brijimos_data');
  sessionStorage.removeItem('brijimos_data_timestamp');
  store.isLoaded = false;
  store.lastUpdated = null;
};
