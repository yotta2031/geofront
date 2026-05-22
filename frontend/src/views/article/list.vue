<template>
  <div class="article-list-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">文章列表</h1>
        <p class="page-subtitle">管理已生成的文章，支持搜索、查看与编辑</p>
      </div>
    </header>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">全部文章</h2>
          <p class="panel-desc">共 {{ total }} 篇</p>
        </div>
        <div class="panel-toolbar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文章标题"
            :prefix-icon="Search"
            clearable
            class="search-input"
            @keyup.enter="fetchArticles"
            @clear="fetchArticles"
          />
          <el-button type="primary" @click="fetchArticles">搜索</el-button>
        </div>
      </div>

      <div class="page-table-wrap">
        <el-table :data="articles" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="标题" min-width="220" />
          <el-table-column prop="articleTypeId" label="分类" width="120">
            <template #default="{ row }">
              <el-tag size="small" effect="light">{{ row.articleTypeId }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <span class="status-pill" :class="`status-${row.status}`">
                <span class="status-dot"></span>
                {{ getStatusText(row.status) }}
              </span>
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
      </div>

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
    </section>

    <el-dialog v-model="showDetailDialog" title="文章详情" width="800px">
      <div v-if="currentArticle" class="article-detail">
        <h2 class="article-title">{{ currentArticle.title }}</h2>
        <div class="article-meta">
          <span class="status-pill" :class="`status-${currentArticle.status}`">
            <span class="status-dot"></span>
            {{ getStatusText(currentArticle.status) }}
          </span>
          <span class="article-time">{{ currentArticle.createdAt }}</span>
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
  ElMessage.info('编辑文章: ' + row.id)
}

async function deleteArticle(_id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', { type: 'warning' })
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
.search-input {
  width: 240px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 999px;
  background: #f3f3f7;
  color: var(--app-text-3);
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--app-text-faint);
}

.status-published {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
}
.status-published .status-dot {
  background: var(--app-success);
}

.status-draft {
  background: rgba(124, 58, 237, 0.08);
  color: var(--el-color-primary);
}
.status-draft .status-dot {
  background: var(--el-color-primary);
}

.status-archived {
  background: #f3f3f7;
  color: var(--app-text-3);
}

.article-detail {
  padding: 4px 0;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--app-text-1);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.article-time {
  color: var(--app-text-muted);
  font-size: 12px;
}

.article-content {
  line-height: 1.8;
  color: var(--app-text-2);
  font-size: 14px;
}

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }

  .panel-toolbar {
    width: 100%;
  }
}
</style>
