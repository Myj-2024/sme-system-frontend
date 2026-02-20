<template>
  <div class="notice-my-container">
    <el-card shadow="never">
      <div class="notice-header">
        <span class="title">我的通知</span>
      </div>

      <!-- 空状态 -->
      <div v-if="noticeList.length === 0" class="empty-wrapper">
        <el-empty description="暂无通知"/>
      </div>

      <!-- 通知列表 -->
      <div v-else>
        <el-card
            v-for="item in noticeList"
            :key="item.id"
            class="notice-card"
            shadow="hover"
            @click="handleClick(item)"
        >
          <div class="card-header">
            <!-- 未读红点 -->
            <el-badge is-dot v-if="item.isRead === 0">
              <span class="notice-title">{{ item.title }}</span>
            </el-badge>
            <span v-else class="notice-title">{{ item.title }}</span>

            <span class="notice-time">
              {{ formatTime(item.publishTime) }}
            </span>
          </div>

          <div class="notice-content">
            {{ item.summary || '无摘要' }}
          </div>
        </el-card>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
              background
              layout="total, prev, pager, next"
              :total="total"
              :page-size="queryParams.pageSize"
              :current-page="queryParams.pageNum"
              @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {ref, onMounted, getCurrentInstance} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {getMyNoticeList, markNoticeAsRead} from '@/api/notice'

const router = useRouter()
// 获取父组件（layout）实例
const instance = getCurrentInstance()
const parentInstance = instance?.parent?.parent

const noticeList = ref([])
const total = ref(0)

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

// 格式化时间
const formatTime = (time) => {
  if (!time) return '未知'
  return time.replace('T', ' ').substring(0, 19)
}

// 获取我的通知列表
const getList = async () => {
  try {
    const res = await getMyNoticeList(queryParams.value)
    noticeList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('加载我的通知失败，请重试')
    console.error('加载我的通知失败:', error)
  }
}

// 点击通知（标记已读并跳转详情）
const handleClick = async (row) => {
  try {
    if (row.isRead === 0) {
      await markNoticeAsRead(row.id)
      // 本地更新状态，列表红点立即消失
      row.isRead = 1
      // 调用layout的getUnreadCount方法刷新右上角红点
      if (parentInstance && parentInstance.exposed?.getUnreadCount) {
        await parentInstance.exposed.getUnreadCount()
      }
      // 移除：ElMessage.success('通知已标记为已读') 这行提示代码
    }
    router.push(`/notice/detail/${row.id}`)
  } catch (error) {
    ElMessage.error('操作失败，请重试')
    console.error('通知操作失败:', error)
  }
}

// 分页切换
const handlePageChange = (page) => {
  queryParams.value.pageNum = page
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.notice-my-container {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.notice-header {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.notice-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  border-radius: 8px;
  padding: 16px;
}

.notice-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notice-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.notice-time {
  font-size: 12px;
  color: #999;
}

.notice-content {
  margin-top: 8px;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.empty-wrapper {
  padding: 40px 0;
  text-align: center;
}
</style>