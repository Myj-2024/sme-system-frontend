<template>
  <main class="login-content" v-loading="loading">
    <div class="portal-card">
      <div class="card-header-modern">
        <div class="header-left">
          <div class="icon-circle">
            <i class="el-icon-document"></i>
          </div>
          <div class="title-text">
            <h2>政策通告</h2>
            <p>Policy Announcements</p>
          </div>
        </div>
        <div class="search-wrapper">
          <el-input
              v-model="queryParams.title"
              placeholder="搜索政策文件关键词..."
              class="modern-input"
              clearable
              @clear="getList"
              @keyup.enter="getList"
          >
            <template #prefix>
              <i class="el-icon-search"></i>
            </template>
            <template #append>
              <el-button @click="getList">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <div class="policy-grid" v-if="policyList.length > 0">
        <div
            v-for="item in policyList"
            :key="item.id"
            class="policy-card"
            @click="handleView(item)"
        >
          <div class="card-inner">
            <div class="card-left">
              <div class="img-box">
                <img v-if="getFirstImage(item.content)" :src="getFirstImage(item.content)" alt="policy">
                <div v-else class="img-placeholder">
                  <i class="el-icon-notebook-2"></i>
                </div>
              </div>
            </div>
            <div class="card-main">
              <div class="main-top">
                <el-tag v-if="item.isTop === 1" size="small" type="danger" effect="dark" class="top-badge">置顶</el-tag>
                <el-tag size="small" type="primary" effect="plain">{{ item.policyTypeName }}</el-tag>
                <span class="publish-date"><i class="el-icon-time"></i> {{ item.publishTime?.substring(0, 10) }}</span>
              </div>
              <h3 class="policy-title">{{ item.title }}</h3>
              <p class="policy-summary">{{ getPlainContent(item.content) }}</p>
              <div class="main-footer">
                <span class="publisher"><i class="el-icon-user"></i> {{ item.publisherName }}</span>
                <span class="view-more">阅读详情 <i class="el-icon-right"></i></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-else description="暂无相关政策数据" :image-size="200"></el-empty>

      <div class="pagination-modern" v-if="total > 0">
        <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            layout="prev, pager, next, total"
            :total="total"
            @current-change="getList"
            background
        />
      </div>
    </div>

    <el-drawer
        v-model="drawerVisible"
        :title="selectedPolicy.title"
        size="600px"
        direction="rtl"
        destroy-on-close
        :before-close="handleBeforeClose"
        custom-class="modern-drawer"
    >
      <div class="drawer-container" v-if="drawerVisible">
        <div class="detail-header">
          <h1>{{ selectedPolicy.title }}</h1>
          <div class="info-tags">
            <span class="info-item"><i class="el-icon-user"></i> 发布人：{{ selectedPolicy.publisherName }}</span>
            <span class="info-item"><i class="el-icon-collection-tag"></i> 类型：{{
                selectedPolicy.policyTypeName
              }}</span>
            <span class="info-item"><i class="el-icon-date"></i> 时间：{{ selectedPolicy.publishTime }}</span>
          </div>
        </div>
        <el-divider/>
        <div class="rich-content-area" v-html="selectedPolicy.content"></div>
      </div>
    </el-drawer>
  </main>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {pagePolicy} from '@/api/policy'
import {ElMessage} from 'element-plus'

const loading = ref(false)
const policyList = ref([])
const total = ref(0)
const drawerVisible = ref(false)
const selectedPolicy = ref({})

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  title: '',
  isShow: 1 // 初始化就传入isShow查询条件
})

// 提取第一张图
const getFirstImage = (html) => {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : null;
};

// 提取纯文本预览
const getPlainContent = (html) => {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, '');
  return text.length > 80 ? text.substring(0, 80) + '...' : text;
};

const getList = async () => {
  loading.value = true
  try {
    const res = await pagePolicy(queryParams.value)
    if (res.code === 200) {
      // ✅ 需求1：双重保险，前端再次过滤只显示 isShow === 1 的数据
      const rawRecords = res.data.records || []
      const filtered = rawRecords.filter(item => item.isShow === 1)

      policyList.value = filtered
      // 校准总数（如果后端未过滤，前端需减去差值）
      const diff = rawRecords.length - filtered.length
      total.value = (res.data.total || 0) - diff
    }
  } catch (error) {
    ElMessage.error('获取政策通告失败')
  } finally {
    loading.value = false
  }
}

const handleView = (row) => {
  selectedPolicy.value = row
  drawerVisible.value = true
}

const handleBeforeClose = (done) => {
  drawerVisible.value = false
  selectedPolicy.value = {}
  done()
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.login-content {
  flex: 1;
  display: flex;
  max-width: 1240px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 80vh;
}

.portal-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* 现代化头部 */
.card-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;

    .icon-circle {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #409EFF, #79bbff);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      box-shadow: 0 8px 15px rgba(64, 158, 255, 0.3);
    }

    .title-text {
      h2 {
        margin: 0;
        font-size: 24px;
        color: #303133;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #909399;
        letter-spacing: 1px;
      }
    }
  }

  .search-wrapper {
    .modern-input {
      :deep(.el-input__wrapper) {
        border-radius: 12px 0 0 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02) !important;
      }

      :deep(.el-input-group__append) {
        border-radius: 0 12px 12px 0;
        background-color: #409EFF;
        color: white;
        border: none;
        padding: 0 25px;
        cursor: pointer;
      }
    }
  }
}

/* 政策卡片网格 */
.policy-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.policy-card {
  background: white;
  border-radius: 18px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid #f0f2f5;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.06);
    border-color: #409EFF;

    .policy-title {
      color: #409EFF;
    }

    .img-box img {
      transform: scale(1.1);
    }
  }

  .card-inner {
    display: flex;
    gap: 25px;
  }

  .card-left {
    .img-box {
      width: 160px;
      height: 110px;
      border-radius: 12px;
      overflow: hidden;
      background: #f5f7fa;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: 0.5s;
      }

      .img-placeholder {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #C0C4CC;
        font-size: 30px;
      }
    }
  }

  .card-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .main-top {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;

      .publish-date {
        font-size: 13px;
        color: #909399;
        margin-left: auto;
      }
    }

    .policy-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #2c3e50;
      transition: 0.3s;
    }

    .policy-summary {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #606266;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.6;
    }

    .main-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #909399;

      .view-more {
        color: #409EFF;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
  }
}

.pagination-modern {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

/* 抽屉样式美化 */
.drawer-container {
  padding: 0 30px 40px;

  .detail-header {
    h1 {
      font-size: 24px;
      color: #303133;
      line-height: 1.4;
      margin-bottom: 20px;
    }

    .info-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      color: #909399;
      font-size: 14px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }

  .rich-content-area {
    margin-top: 30px;
    line-height: 2;
    color: #3f4e5e;
    font-size: 16px;

    :deep(img) {
      max-width: 100%;
      border-radius: 12px;
      margin: 20px 0;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    :deep(p) {
      margin-bottom: 15px;
    }
  }
}

:deep(.modern-drawer) {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 20px 30px;
    background: #f8faff;

    span {
      font-weight: bold;
    }
  }
}
</style>