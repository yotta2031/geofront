<template>
  <div class="types-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">文章分类</h1>
        <p class="page-subtitle">管理文章分类标签，便于内容归类与生成</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">创建分类</el-button>
    </header>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">分类列表</h2>
          <p class="panel-desc">共 {{ total }} 个分类</p>
        </div>
      </div>

      <div class="page-table-wrap">
        <el-table :data="types" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="分类名称" min-width="140" />
          <el-table-column prop="description" label="描述" min-width="200" />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <span class="status-pill" :class="row.status === 1 ? 'status-on' : 'status-off'">
                <span class="status-dot"></span>
                {{ row.status === 1 ? '启用' : '禁用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="editType(row)">编辑</el-button>
              <el-button type="danger" link @click="deleteType(row.id)">删除</el-button>
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
        @size-change="fetchTypes"
        @current-change="fetchTypes"
      />
    </section>

    <el-dialog v-model="showAddDialog" :title="editingId ? '编辑分类' : '创建分类'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
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
import { getArticleTypes, createArticleType } from '@/api/article'

const loading = ref(false)
const submitting = ref(false)
const types = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAddDialog = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  name: '',
  description: ''
})

function resetForm() {
  form.name = ''
  form.description = ''
  editingId.value = null
}

function openCreate() {
  resetForm()
  showAddDialog.value = true
}

function editType(row: any) {
  editingId.value = row.id
  form.name = row.name
  form.description = row.description || ''
  showAddDialog.value = true
}

async function deleteType(_id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？', '提示', { type: 'warning' })
    ElMessage.success('删除成功')
    fetchTypes()
  } catch {
    // 用户取消
  }
}

async function submitForm() {
  if (!form.name) {
    ElMessage.warning('请输入分类名称')
    return
  }

  submitting.value = true
  try {
    const res = await createArticleType(form)
    if (res.code === 1) {
      ElMessage.success(editingId.value ? '更新成功' : '创建成功')
      showAddDialog.value = false
      resetForm()
      fetchTypes()
    }
  } finally {
    submitting.value = false
  }
}

async function fetchTypes() {
  loading.value = true
  try {
    const res = await getArticleTypes({ page: page.value, pageSize: pageSize.value })
    if (res.code === 1) {
      types.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTypes()
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
