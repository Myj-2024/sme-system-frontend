<template>
  <div class="notice-detail-container">
    <el-card shadow="never" class="detail-card">
      <!-- 顶部标题栏：返回按钮 + 页面标题 -->
      <div class="detail-header">
        <div class="header-left">
          <el-button
              :icon="ArrowLeft"
              type="text"
              @click="handleBack"
              class="back-btn"
          >
            返回
          </el-button>
          <span class="page-title">通知详情</span>
        </div>
      </div>

      <!-- 通知详情内容 -->
      <div class="notice-content-wrapper" v-if="noticeDetail.id">
        <h2 class="notice-title">{{ noticeDetail.title }}</h2>
        <div class="notice-meta">
          <span class="publisher">发布人：{{ noticeDetail.publisherName || '未知' }}</span>
          <span class="publish-time">发布时间：{{ formatTime(noticeDetail.publishTime) }}</span>
        </div>
        <el-divider />
        <div class="notice-content" v-html="noticeDetail.content"></div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-wrapper">
        <el-empty description="暂无通知详情" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getNoticeDetail } from '@/api/notice'

const router = useRouter()
const route = useRoute()

const noticeDetail = ref({})

// 返回按钮逻辑
const handleBack = () => {
  router.push('/notice/my')
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '未知'
  return time.replace('T', ' ').substring(0, 19)
}

// 获取通知详情
const getDetail = async () => {
  try {
    const noticeId = route.params.id
    if (!noticeId) {
      ElMessage.error('通知ID不存在')
      return
    }
    const res = await getNoticeDetail(noticeId)
    noticeDetail.value = res.data || {}
  } catch (error) {
    ElMessage.error('加载通知详情失败，请重试')
    console.error('加载详情失败:', error)
  }
}

onMounted(() => {
  getDetail()
})
</script>

<style scoped>
.notice-detail-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.detail-card {
  border-radius: 8px;
  padding: 24px;
}

/* 顶部标题栏 */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  color: #409eff;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #66b1ff;
  background-color: #ecf5ff;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 通知内容区域 */
.notice-content-wrapper {
  padding: 0 8px;
}

.notice-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  line-height: 1.4;
}

.notice-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #909399;
  margin-bottom: 20px;
}

.publisher,
.publish-time {
  display: inline-flex;
  align-items: center;
}

.notice-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  padding: 12px 0;
}

/* 空状态 */
.empty-wrapper {
  padding: 40px 0;
  text-align: center;
}
</style>