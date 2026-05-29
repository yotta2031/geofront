<template>
  <div class="webmedia-index" v-loading="loading">
    <MediaFilterPanel
      v-model="filters"
      :groups="groups"
      @search="fetchList"
      @reset="onReset"
    />

    <div class="media-list-wrap">
      <MediaListItem
        v-for="item in list"
        :key="item.id"
        :item="item"
        @favorite="onFavorite(item)"
        @publish="onPublish(item)"
        @case="onCase(item)"
      />
      <el-empty v-if="!loading && list.length === 0" description="暂无匹配的媒体" />
    </div>

    <el-pagination
      v-if="total > 0"
      class="pagination"
      v-model:current-page="filters.page"
      v-model:page-size="filters.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @size-change="fetchList"
      @current-change="fetchList"
    />

    <el-dialog v-model="publishVisible" title="发布到网站媒体" width="560px">
      <el-form label-width="100px">
        <el-form-item label="目标媒体">
          <el-tag>{{ currentMedia?.name }}</el-tag>
          <span class="price-hint">消耗 {{ currentMedia?.price }} 点</span>
        </el-form-item>
        <el-form-item label="文章标题" required>
          <el-input v-model="publishForm.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="文章内容">
          <el-input v-model="publishForm.content" type="textarea" :rows="6" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="publishVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmPublish">确认投稿</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import MediaFilterPanel from '@/components/webmedia/MediaFilterPanel.vue'
import MediaListItem from '@/components/webmedia/MediaListItem.vue'
import {
  getWebMediaList,
  toggleWebMediaFavorite,
  submitWebMedia,
  getFavoriteGroups,
  type WebMediaFilters,
} from '@/api/webmedia'

const route = useRoute()
const loading = ref(false)
const submitting = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const groups = ref<{ id: number; name: string }[]>([])
const filters = reactive<WebMediaFilters>({ page: 1, pageSize: 20 })

const publishVisible = ref(false)
const currentMedia = ref<any>(null)
const publishForm = reactive({ title: '', content: '' })

async function fetchList() {
  loading.value = true
  try {
    const res = await getWebMediaList(filters)
    if (res.code === 1) {
      list.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

async function fetchGroups() {
  const res = await getFavoriteGroups()
  if (res.code === 1) {
    groups.value = res.data?.list || []
  }
}

function onReset() {
  filters.page = 1
  fetchList()
}

async function onFavorite(item: any) {
  const res = await toggleWebMediaFavorite(item.id)
  if (res.code === 1) {
    item.isFavorite = res.data?.favorited
    ElMessage.success(res.msg)
  }
}

function onPublish(item: any) {
  currentMedia.value = item
  publishForm.title = ''
  publishForm.content = ''
  publishVisible.value = true
}

function onCase(item: any) {
  if (item.caseUrl) {
    window.open(item.caseUrl, '_blank')
  } else {
    ElMessage.info('暂无案例链接')
  }
}

async function confirmPublish() {
  if (!publishForm.title.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }
  submitting.value = true
  try {
    const res = await submitWebMedia({
      mediaId: currentMedia.value.id,
      title: publishForm.title,
      content: publishForm.content,
    })
    if (res.code === 1) {
      ElMessage.success('投稿已提交')
      publishVisible.value = false
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  const gid = route.query.groupId
  if (gid) filters.groupId = Number(gid)
  fetchGroups()
  fetchList()
})
</script>

<style scoped>
.webmedia-index {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.media-list-wrap {
  min-height: 200px;
}

.pagination {
  justify-content: flex-end;
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
}

.price-hint {
  margin-left: 12px;
  color: #f56c6c;
  font-size: 13px;
}
</style>
