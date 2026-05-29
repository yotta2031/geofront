<template>
  <el-card shadow="hover">
    <template #header>
      <span>单条发布媒体</span>
    </template>
    <el-form :model="form" label-width="120px" style="max-width: 640px">
      <el-form-item label="选择媒体" required>
        <el-select
          v-model="form.mediaId"
          filterable
          remote
          :remote-method="searchMedia"
          placeholder="搜索媒体名称"
          style="width: 100%"
          :loading="mediaLoading"
        >
          <el-option
            v-for="m in mediaOptions"
            :key="m.id"
            :label="`${m.name}（¥${m.price}）`"
            :value="m.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文章标题" required>
        <el-input v-model="form.title" placeholder="请输入文章标题" />
      </el-form-item>
      <el-form-item label="文章内容">
        <el-input v-model="form.content" type="textarea" :rows="8" placeholder="选填" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">提交投稿</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getWebMediaList, submitWebMedia } from '@/api/webmedia'

const form = reactive({
  mediaId: undefined as number | undefined,
  title: '',
  content: '',
})

const mediaOptions = ref<any[]>([])
const mediaLoading = ref(false)
const submitting = ref(false)

async function searchMedia(keyword: string) {
  mediaLoading.value = true
  try {
    const res = await getWebMediaList({ keyword, page: 1, pageSize: 30 })
    if (res.code === 1) {
      mediaOptions.value = res.data?.list || []
    }
  } finally {
    mediaLoading.value = false
  }
}

async function handleSubmit() {
  if (!form.mediaId || !form.title.trim()) {
    ElMessage.warning('请选择媒体并填写标题')
    return
  }
  submitting.value = true
  try {
    const res = await submitWebMedia({
      mediaId: form.mediaId,
      title: form.title,
      content: form.content,
    })
    if (res.code === 1) {
      ElMessage.success('投稿已提交')
      form.title = ''
      form.content = ''
    }
  } finally {
    submitting.value = false
  }
}

searchMedia('')
</script>
