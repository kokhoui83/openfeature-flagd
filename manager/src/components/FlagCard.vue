<script setup lang="ts">
import { computed } from 'vue';
import type { Flag } from '../types/flag';

interface Props {
  flagKey: string;
  flag: Flag;
}

interface Emits {
  edit: [key: string];
  delete: [key: string];
  toggleState: [key: string];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const stateClass = computed(() => {
  return props.flag.state === 'ENABLED' ? 'enabled' : 'disabled';
});

const variantEntries = computed(() => {
  return Object.entries(props.flag.variants);
});

const handleEdit = () => {
  emit('edit', props.flagKey);
};

const handleDelete = () => {
  if (confirm(`Are you sure you want to delete flag "${props.flagKey}"?`)) {
    emit('delete', props.flagKey);
  }
};

const handleToggleState = () => {
  emit('toggleState', props.flagKey);
};

const formatVariantValue = (value: string | number | boolean): string => {
  if (typeof value === 'boolean') {
    return value ? '✓ true' : '✗ false';
  }
  return String(value);
};

const getVariantType = (value: string | number | boolean): string => {
  return typeof value;
};
</script>

<template>
  <div class="flag-card">
    <div class="flag-header">
      <div class="flag-title">
        <h3>{{ flagKey }}</h3>
        <div class="flag-state" :class="stateClass">
          {{ flag.state }}
        </div>
      </div>
      <div class="flag-actions">
        <button @click="handleToggleState" class="toggle-btn" :class="stateClass">
          {{ flag.state === 'ENABLED' ? 'Disable' : 'Enable' }}
        </button>
        <button @click="handleEdit" class="edit-btn">Edit</button>
        <button @click="handleDelete" class="delete-btn">Delete</button>
      </div>
    </div>

    <div v-if="flag.description" class="flag-description">
      <p>{{ flag.description }}</p>
    </div>

    <div class="flag-details">
      <div class="detail-section">
        <h4>Default Variant</h4>
        <span class="default-variant">{{ flag.defaultVariant }}</span>
      </div>

      <div class="detail-section">
        <h4>Variants</h4>
        <div class="variants-list">
          <div 
            v-for="[name, value] in variantEntries" 
            :key="name"
            class="variant-item"
            :class="{ 'is-default': name === flag.defaultVariant }"
          >
            <span class="variant-name">{{ name }}</span>
            <span class="variant-type">{{ getVariantType(value) }}</span>
            <span class="variant-value">{{ formatVariantValue(value) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flag-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.flag-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.flag-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.flag-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.flag-title h3 {
  margin: 0;
  color: #333;
  font-family: 'Monaco', 'Consolas', monospace;
}

.flag-state {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.flag-state.enabled {
  background: #d4edda;
  color: #155724;
}

.flag-state.disabled {
  background: #f8d7da;
  color: #721c24;
}

.flag-actions {
  display: flex;
  gap: 0.5rem;
}

.flag-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.toggle-btn.enabled {
  background: #dc3545;
  color: white;
}

.toggle-btn.disabled {
  background: #28a745;
  color: white;
}

.toggle-btn:hover {
  opacity: 0.8;
}

.edit-btn {
  background: #007bff;
  color: white;
}

.edit-btn:hover {
  background: #0056b3;
}

.delete-btn {
  background: #6c757d;
  color: white;
}

.delete-btn:hover {
  background: #545b62;
}

.flag-description {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.flag-description p {
  margin: 0;
  color: #666;
  font-style: italic;
}

.flag-details {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
}

.detail-section h4 {
  margin: 0 0 0.75rem 0;
  color: #495057;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.default-variant {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #e9ecef;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
}

.variants-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.variant-item {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.variant-item.is-default {
  background: #e7f3ff;
  border-color: #007bff;
  font-weight: 600;
}

.variant-name {
  font-family: 'Monaco', 'Consolas', monospace;
  color: #495057;
}

.variant-type {
  font-size: 0.75rem;
  color: #6c757d;
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  text-align: center;
}

.variant-value {
  font-family: 'Monaco', 'Consolas', monospace;
  color: #333;
  text-align: right;
}

@media (max-width: 768px) {
  .flag-header {
    flex-direction: column;
    gap: 1rem;
  }

  .flag-actions {
    width: 100%;
    justify-content: stretch;
  }

  .flag-actions button {
    flex: 1;
  }

  .flag-details {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .variant-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .variant-value {
    text-align: left;
  }
}
</style>