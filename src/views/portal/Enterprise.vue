<template>
  <main class="login-content" v-loading="loading">
    <div class="portal-card">
      <div class="card-header">
        <h2>企业风采</h2>
      </div>

      <el-row :gutter="20" v-if="pagedList.length > 0">
        <el-col
            :span="8"
            v-for="item in pagedList"
            :key="item.id"
            style="margin-bottom: 25px"
        >
          <el-card :body-style="{ padding: '0px' }" class="ent-card" shadow="hover">
            <div class="ent-img-container">
              <template v-if="extractImages(item.enterpriseIntro).length > 1">
                <el-carousel height="180px" indicator-position="none">
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

            <div style="padding: 18px">
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
                <el-tag size="small" effect="plain" type="warning" v-if="item.townLabel">
                  {{ item.townLabel }}
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
                <el-button type="primary" plain size="small" @click="handleViewDetail(item)">
                  查看详情
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-else description="暂无相关企业风采展示" :image-size="200"/>

      <div class="pagination-container" v-if="total > pageSize">
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

    <el-dialog
        v-model="detailVisible"
        :title="currentEnterprise.enterpriseName"
        width="800px"
        destroy-on-close
    >
      <div class="detail-container">
        <div class="detail-intro" v-html="currentEnterprise.enterpriseIntro || '暂无详细介绍'"></div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import {ElMessage} from 'element-plus'
import {getShowEnterpriseList} from '@/api/enterprise' // 修改为新的API方法
import {listDictItemByDictCode} from '@/api/dictItem'

const allEnterpriseList = ref([]) // 存储接口返回的所有企业
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

// 计算当前页面要显示的数据
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
    // 1. 并发加载字典
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

    // 2. 调用后端 getShowList 对应的 API
    const res = await getShowEnterpriseList()
    const records = res.data || []

    // 3. 映射字典标签
    allEnterpriseList.value = records.map(item => ({
      ...item,
      enterpriseTypeLabel: getLabel(dicts.type, item.enterpriseType),
      industryLabel: getLabel(dicts.industry, item.industryId),
      townLabel: getLabel(dicts.town, item.townId),
      businessStatusLabel: getLabel(dicts.status, item.businessStatus)
    }))

    // 4. 根据数组长度设置总数
    total.value = allEnterpriseList.value.length

  } catch (e) {
    console.error("加载数据失败:", e)
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
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

  .card-header {
    margin-bottom: 30px;

    h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 40px;
        height: 4px;
        background: #ff6a00;
        border-radius: 2px;
      }
    }
  }
}

.ent-card {
  border-radius: 16px;
  border: none;
  transition: all 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(255, 106, 0, 0.1) !important;
  }

  .ent-img-container {
    height: 180px;
    overflow: hidden;
    border-radius: 16px 16px 0 0;

    .ent-cover-img {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }
  }

  .ent-img-placeholder {
    height: 180px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    gap: 12px;

    .logo-circle {
      width: 60px;
      height: 60px;
      background: #ff6a00;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 20px;
    }
  }

  .ent-name {
    font-weight: bold;
    font-size: 17px;
    color: #2c3e50;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .ent-tags {
    margin-bottom: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .ent-info-body {
    .ent-desc {
      font-size: 13.5px;
      color: #606266;
      height: 40px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 10px;
    }
  }

  .card-footer {
    margin-top: 15px;
    border-top: 1px solid #f2f6fc;
    padding-top: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .status-box {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #909399;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .dot-online {
        background: #67c23a;
        box-shadow: 0 0 4px #67c23a;
      }

      .dot-offline {
        background: #909399;
      }
    }
  }
}

.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.detail-container {
  padding: 10px;
  max-height: 60vh;
  overflow-y: auto;

  .detail-intro {
    line-height: 1.8;
    color: #333;

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
  }
}
</style>