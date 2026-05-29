<template>
  <div class="media-filter-panel">
    <FilterRow label="行业领域" :options="INDUSTRIES" v-model="local.industry" />
    <FilterRow label="综合门户" :options="PORTALS" v-model="local.portal" />
    <FilterRow label="所在地区" :options="REGIONS" v-model="local.region" />
    <FilterRow label="入口级别" :options="ENTRY_LEVELS" v-model="local.entryLevel" />
    <FilterRow label="网页收录" :options="INDEX_WEB" v-model="local.indexWeb" />
    <FilterRow label="资讯收录" :options="INDEX_NEWS" v-model="local.indexNews" />
    <FilterRow label="链接类型" :options="LINK_TYPES" v-model="local.linkType" />
    <FilterRow label="发稿速度" :options="PUBLISH_SPEEDS" v-model="local.publishSpeed" />
    <FilterRow label="特殊行业" :options="SPECIAL_INDUSTRIES" v-model="local.specialIndustry" />
    <div class="filter-row">
      <span class="filter-label">高级选项</span>
      <div class="filter-tags">
        <span
          v-for="opt in ADVANCED_OPTIONS"
          :key="opt.key"
          class="filter-tag"
          :class="{ active: local[opt.key] }"
          @click="toggleAdvanced(opt.key)"
        >{{ opt.label }}</span>
      </div>
    </div>
    <FilterRow label="价格排序" :options="PRICE_SORTS" v-model="priceSortLabel" />
    <FilterRow
      v-if="groups.length"
      label="收藏"
      :options="groupOptions"
      v-model="groupLabel"
    />
    <div class="filter-search">
      <el-input
        v-model="local.keyword"
        placeholder="请输入媒体查询，如：新浪"
        clearable
        @keyup.enter="emitSearch"
      />
      <el-button type="primary" @click="emitSearch">搜索</el-button>
      <el-button @click="emitReset">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import FilterRow from './FilterRow.vue'
import {
  INDUSTRIES, PORTALS, REGIONS, ENTRY_LEVELS, INDEX_WEB, INDEX_NEWS,
  LINK_TYPES, PUBLISH_SPEEDS, SPECIAL_INDUSTRIES, ADVANCED_OPTIONS, PRICE_SORTS,
  FILTER_ALL, priceSortValue, type AdvancedOptionKey,
} from '@/constants/webmedia'
import type { WebMediaFilters } from '@/api/webmedia'

const props = defineProps<{
  modelValue: WebMediaFilters
  groups?: { id: number; name: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [WebMediaFilters]
  search: []
  reset: []
}>()

const local = reactive<WebMediaFilters & Record<string, unknown>>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (v) => Object.assign(local, v),
  { deep: true }
)

const priceSortLabel = computed({
  get() {
    if (local.priceSort === 'asc') return '由低到高'
    if (local.priceSort === 'desc') return '由高到低'
    return FILTER_ALL
  },
  set(label: string) {
    local.priceSort = priceSortValue(label)
  },
})

const groupOptions = computed(() => [
  FILTER_ALL,
  ...(props.groups || []).map((g) => g.name),
])

const groupLabel = computed({
  get() {
    if (!local.groupId) return FILTER_ALL
    const g = props.groups?.find((x) => x.id === local.groupId)
    return g?.name || FILTER_ALL
  },
  set(name: string) {
    if (name === FILTER_ALL) {
      local.groupId = undefined
      return
    }
    const g = props.groups?.find((x) => x.name === name)
    local.groupId = g?.id
  },
})

function toggleAdvanced(key: AdvancedOptionKey) {
  local[key] = !local[key]
}

function syncEmit() {
  emit('update:modelValue', { ...local })
}

function emitSearch() {
  syncEmit()
  emit('search')
}

function emitReset() {
  Object.keys(local).forEach((k) => {
    if (typeof local[k] === 'boolean') local[k] = false
    else delete local[k]
  })
  local.page = 1
  syncEmit()
  emit('reset')
}
</script>

<style scoped>
.media-filter-panel {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px dashed #e8e8e8;
}

.filter-row:last-of-type {
  border-bottom: none;
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
}

.filter-tag:hover {
  color: #4b17d3;
}

.filter-tag.active {
  background: #4b17d3;
  color: #fff;
}

.filter-search {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.filter-search .el-input {
  flex: 1;
  max-width: 480px;
}
</style>
