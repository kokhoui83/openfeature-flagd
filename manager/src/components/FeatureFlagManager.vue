<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import FlagCard from './FlagCard.vue';
import FlagForm from './FlagForm.vue';
import { flagService } from '../services/flagService';
import type { Flag, FlagConfig } from '../types/flag';

const flags = ref<FlagConfig>({ flags: {} });
const showForm = ref(false);
const editingFlag = ref<{ key: string; flag: Flag } | null>(null);
const searchQuery = ref('');
const filterState = ref<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
const showExportModal = ref(false);
const showImportModal = ref(false);
const importJson = ref('');

const filteredFlags = computed(() => {
  const flagEntries = Object.entries(flags.value.flags);
  
  return flagEntries.filter(([key, flag]) => {
    const matchesSearch = key.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         (flag.description || '').toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesState = filterState.value === 'ALL' || flag.state === filterState.value;
    
    return matchesSearch && matchesState;
  });
});

const flagCount = computed(() => ({
  total: Object.keys(flags.value.flags).length,
  enabled: Object.values(flags.value.flags).filter(f => f.state === 'ENABLED').length,
  disabled: Object.values(flags.value.flags).filter(f => f.state === 'DISABLED').length
}));

const loadFlags = () => {
  flags.value = flagService.getAllFlags();
};

const handleCreateFlag = () => {
  editingFlag.value = null;
  showForm.value = true;
};

const handleEditFlag = (key: string) => {
  const flag = flagService.getFlag(key);
  if (flag) {
    editingFlag.value = { key, flag };
    showForm.value = true;
  }
};

const handleDeleteFlag = (key: string) => {
  flagService.deleteFlag(key);
  loadFlags();
};

const handleToggleState = (key: string) => {
  const flag = flagService.getFlag(key);
  if (flag) {
    const newFlag = { ...flag, state: flag.state === 'ENABLED' ? 'DISABLED' as const : 'ENABLED' as const };
    flagService.updateFlag(key, newFlag);
    loadFlags();
  }
};

const handleSaveFlag = (key: string, flag: Flag) => {
  const isEdit = editingFlag.value !== null;
  
  if (isEdit) {
    flagService.updateFlag(key, flag);
  } else {
    if (!flagService.createFlag(key, flag)) {
      alert('A flag with this key already exists!');
      return;
    }
  }
  
  showForm.value = false;
  editingFlag.value = null;
  loadFlags();
};

const handleCancelForm = () => {
  showForm.value = false;
  editingFlag.value = null;
};

const handleExport = () => {
  const config = flagService.exportConfig();
  const blob = new Blob([config], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flags.json';
  a.click();
  URL.revokeObjectURL(url);
  showExportModal.value = false;
};

const handleImport = () => {
  if (flagService.importConfig(importJson.value)) {
    loadFlags();
    showImportModal.value = false;
    importJson.value = '';
    alert('Flags imported successfully!');
  } else {
    alert('Failed to import flags. Please check the JSON format.');
  }
};

onMounted(() => {
  loadFlags();
});
</script>

<template>
  <div class="flag-manager">
    <header class="manager-header">
      <h1>Feature Flag Manager</h1>
      <p class="subtitle">Manage your feature flags and configurations</p>
    </header>

    <div class="manager-stats">
      <div class="stat-card">
        <div class="stat-value">{{ flagCount.total }}</div>
        <div class="stat-label">Total Flags</div>
      </div>
      <div class="stat-card enabled">
        <div class="stat-value">{{ flagCount.enabled }}</div>
        <div class="stat-label">Enabled</div>
      </div>
      <div class="stat-card disabled">
        <div class="stat-value">{{ flagCount.disabled }}</div>
        <div class="stat-label">Disabled</div>
      </div>
    </div>

    <div class="manager-controls">
      <div class="search-filter">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search flags..."
          class="search-input"
        />
        <select v-model="filterState" class="filter-select">
          <option value="ALL">All States</option>
          <option value="ENABLED">Enabled Only</option>
          <option value="DISABLED">Disabled Only</option>
        </select>
      </div>
      
      <div class="action-buttons">
        <button @click="showExportModal = true" class="export-btn">
          📤 Export
        </button>
        <button @click="showImportModal = true" class="import-btn">
          📥 Import
        </button>
        <button @click="handleCreateFlag" class="create-btn">
          ➕ Create Flag
        </button>
      </div>
    </div>

    <div v-if="showForm" class="form-modal">
      <div class="form-overlay" @click="handleCancelForm"></div>
      <div class="form-container">
        <FlagForm
          :flag="editingFlag?.flag"
          :flag-key="editingFlag?.key"
          :is-edit="!!editingFlag"
          @save="handleSaveFlag"
          @cancel="handleCancelForm"
        />
      </div>
    </div>

    <div v-if="showExportModal" class="modal">
      <div class="modal-overlay" @click="showExportModal = false"></div>
      <div class="modal-content">
        <h3>Export Configuration</h3>
        <p>Download your current flag configuration as a JSON file.</p>
        <div class="modal-actions">
          <button @click="handleExport" class="confirm-btn">Download JSON</button>
          <button @click="showExportModal = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="showImportModal" class="modal">
      <div class="modal-overlay" @click="showImportModal = false"></div>
      <div class="modal-content">
        <h3>Import Configuration</h3>
        <p>Paste your JSON configuration below to import flags:</p>
        <textarea 
          v-model="importJson"
          placeholder="Paste your JSON configuration here..."
          rows="10"
          class="import-textarea"
        ></textarea>
        <div class="modal-actions">
          <button @click="handleImport" class="confirm-btn" :disabled="!importJson.trim()">
            Import Flags
          </button>
          <button @click="showImportModal = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <main class="flags-list">
      <div v-if="filteredFlags.length === 0" class="empty-state">
        <div class="empty-icon">🏁</div>
        <h3>{{ searchQuery ? 'No matching flags found' : 'No flags yet' }}</h3>
        <p>{{ searchQuery ? 'Try adjusting your search or filter criteria.' : 'Create your first feature flag to get started.' }}</p>
        <button v-if="!searchQuery" @click="handleCreateFlag" class="create-btn">
          Create Your First Flag
        </button>
      </div>

      <FlagCard
        v-for="[key, flag] in filteredFlags"
        :key="key"
        :flag-key="key"
        :flag="flag"
        @edit="handleEditFlag"
        @delete="handleDeleteFlag"
        @toggle-state="handleToggleState"
      />
    </main>
  </div>
</template>

<style scoped>
.flag-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.manager-header {
  text-align: center;
  margin-bottom: 2rem;
}

.manager-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.manager-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card.enabled {
  border-left: 4px solid #28a745;
}

.stat-card.disabled {
  border-left: 4px solid #dc3545;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.manager-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-filter {
  display: flex;
  gap: 1rem;
  flex: 1;
  max-width: 500px;
}

.search-input,
.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input {
  flex: 2;
}

.filter-select {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.export-btn {
  background: #17a2b8;
  color: white;
}

.export-btn:hover {
  background: #138496;
}

.import-btn {
  background: #6f42c1;
  color: white;
}

.import-btn:hover {
  background: #5a2d91;
}

.create-btn {
  background: #28a745;
  color: white;
}

.create-btn:hover {
  background: #218838;
}

.form-modal,
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-overlay,
.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.form-container {
  position: relative;
  max-width: 600px;
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1001;
}

.modal-content {
  position: relative;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90vw;
  z-index: 1001;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.import-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  resize: vertical;
  margin: 1rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.confirm-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.confirm-btn:hover:not(:disabled) {
  background: #0056b3;
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn:hover {
  background: #545b62;
}

.flags-list {
  margin-top: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .flag-manager {
    padding: 1rem;
  }

  .manager-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-filter {
    max-width: none;
  }

  .action-buttons {
    justify-content: stretch;
  }

  .action-buttons button {
    flex: 1;
  }
}
</style>