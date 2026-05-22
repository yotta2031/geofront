<template>
  <div class="favorites-page">
    <el-card shadow="hover" class="mb-4">
      <template #header>
        <div class="card-header">
          <span>收藏分组</span>
          <el-button type="primary" size="small" @click="showAdd = true">新建分组</el-button>
        </div>
      </template>
      <el-table :data="groups" v-loading="loading">
        <el-table-column prop="name" label="分组名称" />
        <el-table-column prop="mediaCount" label="媒体数量" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewGroup(row)">查看媒体</el-button>
            <el-button type="danger" link @click="removeGroup(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAdd" title="新建收藏分组" width="400px">
      <el-input v-model="newGroupName" placeholder="分组名称" />
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="addGroup">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFavoriteGroups, createFavoriteGroup, deleteFavoriteGroup } from '@/api/webmedia'

const router = useRouter()
const loading = ref(false)
const groups = ref<any[]>([])
const showAdd = ref(false)
const newGroupName = ref('')

async function fetchGroups() {
  loading.value = true
  try {
    const res = await getFavoriteGroups()
    if (res.code === 1) {
      groups.value = res.data?.list || []
    }
  } finally {
    loading.value = false
  }
}

async function addGroup() {
  if (!newGroupName.value.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }
  const res = await createFavoriteGroup(newGroupName.value.trim())
  if (res.code === 1) {
    ElMessage.success('创建成功')
    showAdd.value = false
    newGroupName.value = ''
    fetchGroups()
  }
}

function viewGroup(row: { id: number }) {
  router.push({ path: '/publish/webmedia', query: { groupId: String(row.id) } })
}

async function removeGroup(id: number) {
  await ElMessageBox.confirm('删除分组将清空该分组下的收藏，是否继续？', '提示', { type: 'warning' })
  const res = await deleteFavoriteGroup(id)
  if (res.code === 1) {
    ElMessage.success('已删除')
    fetchGroups()
  }
}

onMounted(fetchGroups)
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
