<template>
  <div class="keywords-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">关键词管理</h1>
        <p class="page-subtitle">维护核心词、长尾词与命中规则</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">添加关键词</el-button>
    </header>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">关键词列表</h2>
          <p class="panel-desc">共 {{ total }} 条记录</p>
        </div>
      </div>

      <div class="page-table-wrap">
        <el-table :data="keywords" style="width: 100%" v-loading="loading">
          <el-table-column prop="keyword" label="关键词" min-width="140" />
          <el-table-column prop="hitWord" label="命中词" min-width="120" />
          <el-table-column prop="preKeywords" label="前置词" min-width="120" />
          <el-table-column prop="nextKeywords" label="后置词" min-width="120" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag size="small" effect="light">{{ getTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <span class="status-pill" :class="row.status === 1 ? 'status-on' : 'status-off'">
                <span class="status-dot"></span>
                {{ row.status === 1 ? '启用' : '禁用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="editKeyword(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-pagination
        class="mt-4"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchKeywords"
        @current-change="fetchKeywords"
      />
    </section>

    <el-dialog v-model="showAddDialog" :title="editingId ? '编辑关键词' : '添加关键词'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="关键词">
          <el-input v-model="form.keyword" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item label="命中词">
          <el-input v-model="form.hitWord" placeholder="请输入命中词" />
        </el-form-item>
        <el-form-item label="前置词">
          <el-input v-model="form.preKeywords" placeholder="请输入前置词" />
        </el-form-item>
        <el-form-item label="后置词">
          <el-input v-model="form.nextKeywords" placeholder="请输入后置词" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="默认" value="default" />
            <el-option label="核心" value="core" />
            <el-option label="长尾" value="longtail" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getKeywords, createKeyword, updateKeyword, deleteKeyword as deleteKeywordApi } from '@/api/article'

const loading = ref(false)
const submitting = ref(false)
const keywords = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAddDialog = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  keyword: '',
  hitWord: '',
  preKeywords: '',
  nextKeywords: '',
  type: 'default'
})

function resetForm() {
  form.keyword = ''
  form.hitWord = ''
  form.preKeywords = ''
  form.nextKeywords = ''
  form.type = 'default'
  editingId.value = null
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    default: '默认',
    core: '核心',
    longtail: '长尾'
  }
  return map[type] || type
}

function openCreate() {
  resetForm()
  showAddDialog.value = true
}

function editKeyword(row: any) {
  editingId.value = row.id
  form.keyword = row.keyword
  form.hitWord = row.hitWord || ''
  form.preKeywords = row.preKeywords || ''
  form.nextKeywords = row.nextKeywords || ''
  form.type = row.type || 'default'
  showAddDialog.value = true
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这个关键词吗？', '提示', { type: 'warning' })
    const res = await deleteKeywordApi(id)
    if (res.code === 1) {
      ElMessage.success('删除成功')
      fetchKeywords()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch {
    // 用户取消
  }
}

async function submitForm() {
  if (!form.keyword) {
    ElMessage.warning('请输入关键词')
    return
  }

  submitting.value = true
  try {
    let res
    if (editingId.value) {
      res = await updateKeyword(editingId.value, form)
    } else {
      res = await createKeyword(form)
    }
    if (res.code === 1) {
      ElMessage.success(editingId.value ? '更新成功' : '添加成功')
      showAddDialog.value = false
      resetForm()
      fetchKeywords()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

async function fetchKeywords() {
  loading.value = true
  try {
    const res = await getKeywords({ page: page.value, pageSize: pageSize.value })
    if (res.code === 1) {
      keywords.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchKeywords()
})
</script>

<style scoped>
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 999px;
  font-weight: 500;
  background: #f3f3f7;
  color: var(--app-text-3);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--app-text-faint);
}

.status-on {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
}
.status-on .status-dot {
  background: var(--app-success);
}

.status-off {
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
}
.status-off .status-dot {
  background: var(--app-danger);
}
</style>
