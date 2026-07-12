<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown, Search } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: '' },
  options: { type: Array, required: true }, // Array of strings or { label, value, sublabel }
  placeholder: { type: String, default: 'Pilih opsi...' },
  searchable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  class: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const search = ref('');
const rootRef = ref(null);

const formattedOptions = computed(() => {
  return props.options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        label: opt.label !== undefined ? opt.label : opt.value,
        value: opt.value,
        sublabel: opt.sublabel || ''
      };
    }
    return { label: String(opt), value: opt, sublabel: '' };
  });
});

const filteredOptions = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return formattedOptions.value;
  return formattedOptions.value.filter(opt => 
    String(opt.label).toLowerCase().includes(q) || 
    String(opt.sublabel).toLowerCase().includes(q)
  );
});

const selectedOption = computed(() => {
  return formattedOptions.value.find(opt => opt.value === props.modelValue) || null;
});

const selectOption = (val) => {
  emit('update:modelValue', val);
  emit('change', val);
  isOpen.value = false;
  search.value = '';
};

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (e) => {
  if (rootRef.value && !rootRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="relative w-full" ref="rootRef">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      class="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-left font-bold text-slate-700 shadow-sm flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      :class="props.class"
    >
      <span class="truncate">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <ChevronDown 
        class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-2" 
        :class="{ 'rotate-180': isOpen }" 
      />
    </button>

    <!-- Dropdown Popover -->
    <transition name="pop-in">
      <div 
        v-if="isOpen" 
        class="absolute left-0 z-[110] mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
      >
        <!-- Search Input -->
        <div v-if="searchable" class="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Search class="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
          <input
            type="text"
            v-model="search"
            placeholder="Cari opsi..."
            class="w-full bg-transparent text-xs text-slate-700 outline-none p-1.5"
            @click.stop
          />
          <button 
            v-if="search"
            @click.stop="search = ''" 
            class="text-[10px] text-slate-400 hover:text-slate-600 font-bold px-1.5"
          >
            Reset
          </button>
        </div>

        <!-- Options -->
        <div class="max-h-56 overflow-y-auto divide-y divide-slate-50 scroll-smooth">
          <div
            v-for="opt in filteredOptions"
            :key="String(opt.value)"
            @click="selectOption(opt.value)"
            :class="modelValue === opt.value ? 'bg-blue-50 text-blue-700 font-black' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'"
            class="px-4 py-2.5 text-xs cursor-pointer transition-colors flex items-center justify-between"
          >
            <div class="flex flex-col min-w-0 pr-2">
              <span class="font-bold truncate">{{ opt.label }}</span>
              <span v-if="opt.sublabel" class="text-[9px] text-slate-400 font-semibold truncate">{{ opt.sublabel }}</span>
            </div>
            <span v-if="modelValue === opt.value" class="text-blue-600 font-black text-xs shrink-0">✓</span>
          </div>
          <div v-if="filteredOptions.length === 0" class="p-4 text-center text-xs text-slate-400">
            Tidak ada opsi ditemukan
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
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
