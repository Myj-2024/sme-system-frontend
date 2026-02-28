<template>
  <main class="login-content" v-loading="loading">
    <div class="portal-card">
      <div class="card-header-modern">
        <div class="header-left">
          <div class="icon-circle">
            <i class="el-icon-office-building"></i>
          </div>
          <div class="title-text">
            <h2>企业风采</h2>
            <p>Enterprise Showcase</p>
          </div>
        </div>
      </div>

      <el-row :gutter="25" v-if="pagedList.length > 0">
        <el-col
            :span="8"
            v-for="item in pagedList"
            :key="item.id"
            style="margin-bottom: 30px"
        >
          <el-card :body-style="{ padding: '0px' }" class="ent-card" shadow="hover">
            <div class="ent-img-container">
              <template v-if="extractImages(item.enterpriseIntro).length > 1">
                <el-carousel height="200px" indicator-position="none">
                  <el-carousel-item v-for="(img, index) in extractImages(item.enterpriseIntro)" :key="index">
                    <el-image :src="img" fit="cover" class="ent-cover-img"/>
                  </el-carousel-item>
                </el-carousel>
              </template>
              <template v-else-if="extractImages(item.enterpriseIntro).length === 1">
                <el-image :src="extractImages(item.enterpriseIntro)[0]" fit="cover" class="ent-cover-img"/>
              </template>
              <div v-else class="ent-img-placeholder">
                <div class="logo-circle">{{ item.enterpriseName?.substring(0, 2) }}</div>
                <span>企业形象展示</span>
              </div>
            </div>

            <div style="padding: 20px">
              <div class="ent-name-row">
                <span class="ent-name">{{ item.enterpriseName }}</span>
              </div>

              <div class="ent-tags">
                <el-tag size="small" effect="plain" type="primary" v-if="item.enterpriseTypeLabel">
                  {{ item.enterpriseTypeLabel }}
                </el-tag>
                <el-tag size="small" effect="plain" type="success" v-if="item.industryLabel">
                  {{ item.industryLabel }}
                </el-tag>
              </div>

              <div class="ent-info-body">
                <p class="ent-desc">
                  <i class="el-icon-goods"></i>
                  主要产品：{{ item.mainProduct || '暂无详细产品介绍' }}
                </p>
              </div>

              <div class="card-footer">
                <div class="status-box">
                  <span :class="['status-dot', item.businessStatus === 'NORMAL' ? 'dot-online' : 'dot-offline']"></span>
                  <span class="status-text">{{ item.businessStatusLabel || '未知状态' }}</span>
                </div>
                <el-button type="primary" plain size="small" class="view-btn" @click="handleViewDetail(item)">
                 企业简介 <i class="el-icon-right"></i>
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-else description="暂无相关企业风采展示" :image-size="200"/>

      <div class="pagination-modern" v-if="total > pageSize">
        <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            v-model:current-page="pageNum"
            :page-size="pageSize"
            @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-drawer
        v-model="detailVisible"
        :title="currentEnterprise.enterpriseName"
        size="650px"
        direction="rtl"
        destroy-on-close
        custom-class="modern-drawer"
    >
      <div class="drawer-container" v-if="detailVisible">
        <div class="detail-header">
          <h1>{{ currentEnterprise.enterpriseName }}</h1>
          <div class="info-tags">
            <span class="info-item"><i class="el-icon-map-location"></i> 属地：{{ currentEnterprise.townLabel }}</span>
            <span class="info-item"><i class="el-icon-pie-chart"></i> 行业：{{ currentEnterprise.industryLabel }}</span>
            <span class="info-item"><i class="el-icon-collection-tag"></i> 类型：{{
                currentEnterprise.enterpriseTypeLabel
              }}</span>
          </div>
        </div>
        <el-divider/>
        <div class="rich-content-area" v-html="currentEnterprise.enterpriseIntro || '暂无详细介绍'"></div>
      </div>
    </el-drawer>
  </main>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import {ElMessage} from 'element-plus'
import {getShowEnterpriseList} from '@/api/enterprise'
import {listDictItemByDictCode} from '@/api/dictItem'

const allEnterpriseList = ref([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(9)

const detailVisible = ref(false)
const currentEnterprise = ref({})

const dicts = {
  type: [],
  town: [],
  industry: [],
  status: []
}

const pagedList = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allEnterpriseList.value.slice(start, end)
})

const getLabel = (options, code) => {
  if (!code) return ''
  const match = options.find(i => String(i.itemCode) === String(code))
  return match ? match.itemName : ''
}

const getList = async () => {
  loading.value = true
  try {
    if (dicts.type.length === 0) {
      const [t, tw, ind, st] = await Promise.all([
        listDictItemByDictCode('enterprise_type'),
        listDictItemByDictCode('town'),
        listDictItemByDictCode('industry'),
        listDictItemByDictCode('business_status')
      ])
      dicts.type = t.data || []
      dicts.town = tw.data || []
      dicts.industry = ind.data || []
      dicts.status = st.data || []
    }

    const res = await getShowEnterpriseList()
    const records = res.data || []

    allEnterpriseList.value = records.map(item => ({
      ...item,
      enterpriseTypeLabel: getLabel(dicts.type, item.enterpriseType),
      industryLabel: getLabel(dicts.industry, item.industryId),
      townLabel: getLabel(dicts.town, item.townId),
      businessStatusLabel: getLabel(dicts.status, item.businessStatus)
    }))

    total.value = allEnterpriseList.value.length

  } catch (e) {
    ElMessage.error('加载企业风采失败')
  } finally {
    loading.value = false
  }
}

const extractImages = (html) => {
  if (!html) return []
  const imgReg = /<img [^>]*src=['"]([^'"]+)[^>]*>/gi
  const arr = []
  let match
  while ((match = imgReg.exec(html)) !== null) {
    arr.push(match[1])
  }
  return arr
}

const handleViewDetail = (row) => {
  currentEnterprise.value = row
  detailVisible.value = true
}

const handlePageChange = (val) => {
  pageNum.value = val
  window.scrollTo({top: 0, behavior: 'smooth'})
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
  width: 100%;
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
      background: linear-gradient(135deg, #ff6a00, #ff9d5c);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      box-shadow: 0 8px 15px rgba(255, 106, 0, 0.2);
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
        text-transform: uppercase;
      }
    }
  }
}

.ent-card {
  background: white;
  border-radius: 18px;
  border: 1px solid #f0f2f5;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08) !important;
    border-color: #ff6a00;

    .ent-name {
      color: #ff6a00;
    }
  }

  .ent-img-container {
    height: 200px;
    overflow: hidden;
    background: #f5f7fa;

    .ent-cover-img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      transition: 0.5s;
    }
  }

  .ent-img-placeholder {
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #C0C4CC;
    gap: 15px;

    .logo-circle {
      width: 65px;
      height: 65px;
      background: linear-gradient(135deg, #ff6a00, #ff9d5c);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 22px;
      box-shadow: 0 5px 15px rgba(255, 106, 0, 0.2);
    }
  }

  .ent-name {
    font-weight: bold;
    font-size: 18px;
    color: #2c3e50;
    transition: 0.3s;
    display: block;
    margin-bottom: 12px;
  }

  .ent-tags {
    margin-bottom: 15px;
    height: 28px;
    overflow: hidden;
  }

  .ent-desc {
    font-size: 14px;
    color: #606266;
    height: 42px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-footer {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #f5f7fa;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .status-box {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #909399;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.dot-online {
          background: #67c23a;
          box-shadow: 0 0 6px #67c23a;
        }

        &.dot-offline {
          background: #909399;
        }
      }
    }
  }
}

.pagination-modern {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

/* 抽屉容器美化 - 1:1 参照政策模块 */
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
        gap: 8px;
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
  }
}

:deep(.modern-drawer) {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 20px 30px;
    background: #fff9f5;

    span {
      font-weight: bold;
    }
  }
}
</style>