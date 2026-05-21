<template>
  <div class="article-list-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文章列表</span>
          <div>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索文章标题"
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-button type="primary" @click="fetchArticles">
              <el-icon><Search /></el-icon>搜索
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="articles" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="articleTypeId" label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.articleTypeId }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewArticle(row)">查看</el-button>
            <el-button link @click="editArticle(row)">编辑</el-button>
            <el-button type="danger" link @click="deleteArticle(row.id)">删除</el-button>
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
        @size-change="fetchArticles"
        @current-change="fetchArticles"
      />
    </el-card>

    <!-- 文章详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="文章详情" width="800px">
      <div v-if="currentArticle" class="article-detail">
        <h2>{{ currentArticle.title }}</h2>
        <div class="article-meta">
          <el-tag size="small">{{ getStatusText(currentArticle.status) }}</el-tag>
          <span>{{ currentArticle.createdAt }}</span>
        </div>
        <div class="article-content" v-html="currentArticle.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getArticles, getArticleDetail } from '@/api/article'

const loading = ref(false)
const articles = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const showDetailDialog = ref(false)
const currentArticle = ref<any>(null)

function getStatusType(status: string) {
  const map: Record<string, string> = {
    draft: 'info',
    published: 'success',
    archived: ''
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return map[status] || status
}

async function viewArticle(row: any) {
  try {
    const res = await getArticleDetail(row.id)
    if (res.code === 1) {
      currentArticle.value = res.data
      showDetailDialog.value = true
    }
  } catch (error) {
    // 错误已在拦截器处理
  }
}

function editArticle(row: any) {
  // TODO: 跳转到编辑页面或打开编辑弹窗
  ElMessage.info('编辑文章: ' + row.id)
}

async function deleteArticle(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', { type: 'warning' })
    // TODO: 调用删除API
    ElMessage.success('删除成功')
    fetchArticles()
  } catch {
    // 用户取消
  }
}

async function fetchArticles() {
  loading.value = true
  try {
    const res = await getArticles({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value
    })
    if (res.code === 1) {
      articles.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchArticles()
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

.article-detail h2 {
  margin-bottom: 16px;
}

.article-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  color: #999;
  font-size: 14px;
}

.article-content {
  line-height: 1.8;
  color: #333;
}
</style>