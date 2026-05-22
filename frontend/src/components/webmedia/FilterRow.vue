<template>
  <div class="filter-row">
    <span class="filter-label">{{ label }}</span>
    <div class="filter-tags">
      <span
        v-for="opt in options"
        :key="opt"
        class="filter-tag"
        :class="{ active: modelValue === opt }"
        @click="$emit('update:modelValue', opt)"
      >{{ opt }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  options: string[]
  modelValue?: string
}>()

defineEmits<{ 'update:modelValue': [string] }>()
</script>

<style scoped>
.filter-row {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px dashed #e8e8e8;
}

.filter-label {
  flex-shrink: 0;
  width: 80px;
  color: #606266;
  font-size: 14px;
  line-height: 28px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.filter-tag {
  padding: 4px 12px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-tag:hover {
  color: #4b17d3;
}

.filter-tag.active {
  background: #4b17d3;
  color: #fff;
}
</style>
