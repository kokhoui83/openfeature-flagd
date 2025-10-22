<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Flag, FlagFormData } from '../types/flag';

interface Props {
  flag?: Flag;
  flagKey?: string;
  isEdit?: boolean;
}

interface Emits {
  save: [key: string, flag: Flag];
  cancel: [];
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
});

const emit = defineEmits<Emits>();

const formData = reactive<FlagFormData>({
  key: props.flagKey || '',
  description: props.flag?.description || '',
  state: props.flag?.state || 'ENABLED',
  defaultVariant: props.flag?.defaultVariant || '',
  variants: []
});

// Initialize variants from existing flag
if (props.flag?.variants) {
  Object.entries(props.flag.variants).forEach(([name, value]) => {
    const type = typeof value as 'string' | 'number' | 'boolean';
    formData.variants.push({ name, value, type });
  });
}

// Add initial variant if none exist
if (formData.variants.length === 0) {
  formData.variants.push({ name: 'default', value: true, type: 'boolean' });
}

const addVariant = () => {
  formData.variants.push({ name: '', value: '', type: 'string' });
};

const removeVariant = (index: number) => {
  if (formData.variants.length > 1) {
    formData.variants.splice(index, 1);
  }
};

const convertVariantValue = (variant: typeof formData.variants[0]) => {
  switch (variant.type) {
    case 'boolean':
      return variant.value === 'true' || variant.value === true;
    case 'number':
      return Number(variant.value) || 0;
    default:
      return String(variant.value);
  }
};

const validateForm = (): boolean => {
  if (!formData.key.trim()) return false;
  if (formData.variants.length === 0) return false;
  if (!formData.variants.some(v => v.name === formData.defaultVariant)) return false;
  
  return formData.variants.every(v => v.name.trim() !== '');
};

const handleSubmit = () => {
  if (!validateForm()) return;

  const variants: Record<string, string | number | boolean> = {};
  formData.variants.forEach(variant => {
    if (variant.name.trim()) {
      variants[variant.name] = convertVariantValue(variant);
    }
  });

  const flag: Flag = {
    state: formData.state,
    variants,
    defaultVariant: formData.defaultVariant,
    description: formData.description || undefined
  };

  emit('save', formData.key, flag);
};

const handleCancel = () => {
  emit('cancel');
};

// Update default variant when variants change
watch(() => formData.variants, (newVariants) => {
  if (!newVariants.some(v => v.name === formData.defaultVariant)) {
    formData.defaultVariant = newVariants[0]?.name || '';
  }
}, { deep: true });
</script>

<template>
  <div class="flag-form">
    <h3>{{ isEdit ? 'Edit Flag' : 'Create New Flag' }}</h3>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="flag-key">Flag Key:</label>
        <input 
          id="flag-key"
          v-model="formData.key" 
          type="text" 
          :disabled="isEdit"
          placeholder="my-feature-flag"
          required 
        />
      </div>

      <div class="form-group">
        <label for="description">Description:</label>
        <textarea 
          id="description"
          v-model="formData.description" 
          placeholder="Describe what this flag controls..."
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="state">State:</label>
        <select id="state" v-model="formData.state">
          <option value="ENABLED">ENABLED</option>
          <option value="DISABLED">DISABLED</option>
        </select>
      </div>

      <div class="form-group">
        <label>Variants:</label>
        <div class="variants-section">
          <div 
            v-for="(variant, index) in formData.variants" 
            :key="index" 
            class="variant-row"
          >
            <input 
              v-model="variant.name" 
              type="text" 
              placeholder="Variant name"
              required 
            />
            <select v-model="variant.type">
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
            </select>
            <input 
              v-if="variant.type === 'boolean'"
              v-model="variant.value"
              type="checkbox"
              :checked="variant.value === 'true' || variant.value === true"
              @change="variant.value = ($event.target as HTMLInputElement).checked"
            />
            <input 
              v-else-if="variant.type === 'number'"
              v-model="variant.value"
              type="number"
              placeholder="Value"
              required
            />
            <input 
              v-else
              v-model="variant.value"
              type="text"
              placeholder="Value"
              required
            />
            <button 
              type="button" 
              @click="removeVariant(index)"
              :disabled="formData.variants.length <= 1"
              class="remove-btn"
            >
              ✕
            </button>
          </div>
          <button type="button" @click="addVariant" class="add-variant-btn">
            + Add Variant
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="default-variant">Default Variant:</label>
        <select id="default-variant" v-model="formData.defaultVariant" required>
          <option v-for="variant in formData.variants" :key="variant.name" :value="variant.name">
            {{ variant.name }}
          </option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="save-btn" :disabled="!validateForm()">
          {{ isEdit ? 'Update Flag' : 'Create Flag' }}
        </button>
        <button type="button" @click="handleCancel" class="cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.flag-form {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.variants-section {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  background: white;
}

.variant-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.variant-row input,
.variant-row select {
  margin: 0;
}

.variant-row input[type="text"]:first-child {
  flex: 2;
}

.variant-row select {
  flex: 1;
}

.variant-row input:not(:first-child) {
  flex: 2;
}

.variant-row input[type="checkbox"] {
  width: auto;
  flex: none;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  flex: none;
}

.remove-btn:hover:not(:disabled) {
  background: #c82333;
}

.remove-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.add-variant-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

.add-variant-btn:hover {
  background: #218838;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.save-btn,
.cancel-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.save-btn {
  background: #007bff;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #0056b3;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #545b62;
}
</style>