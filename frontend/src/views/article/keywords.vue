<template>
  <div class="keywords-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>关键词管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>添加关键词
          </el-button>
        </div>
      </template>

      <el-table :data="keywords" style="width: 100%" v-loading="loading">
        <el-table-column prop="keyword" label="关键词" />
        <el-table-column prop="hitWord" label="命中词" />
        <el-table-column prop="preKeywords" label="前置词" />
        <el-table-column prop="nextKeywords" label="后置词" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editKeyword(row)">编辑</el-button>
            <el-button type="danger" link @click="deleteKeyword(row.id)">删除</el-button>
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
        @size-change="fetchKeywords"
        @current-change="fetchKeywords"
      />
    </el-card>

    <!-- 添加/编辑弹窗 -->
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
import { getKeywords, createKeyword } from '@/api/article'

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

function editKeyword(row: any) {
  editingId.value = row.id
  form.keyword = row.keyword
  form.hitWord = row.hitWord || ''
  form.preKeywords = row.preKeywords || ''
  form.nextKeywords = row.nextKeywords || ''
  form.type = row.type || 'default'
  showAddDialog.value = true
}

async function deleteKeyword(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这个关键词吗？', '提示', { type: 'warning' })
    // TODO: 调用删除API
    ElMessage.success('删除成功')
    fetchKeywords()
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
    const res = await createKeyword(form)
    if (res.code === 1) {
      ElMessage.success(editingId.value ? '更新成功' : '添加成功')
      showAddDialog.value = false
      resetForm()
      fetchKeywords()
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 20px;
}
</style>