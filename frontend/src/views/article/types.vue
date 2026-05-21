<template>
  <div class="types-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文章分类</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>创建分类
          </el-button>
        </div>
      </template>

      <el-table :data="types" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editType(row)">编辑</el-button>
            <el-button type="danger" link @click="deleteType(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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
    </el-card>

    <!-- 添加/编辑弹窗 -->
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

function editType(row: any) {
  editingId.value = row.id
  form.name = row.name
  form.description = row.description || ''
  showAddDialog.value = true
}

async function deleteType(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？', '提示', { type: 'warning' })
    // TODO: 调用删除API
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 20px;
}
</style>