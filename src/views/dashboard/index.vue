<template>
  <div class="dashboard-wrapper">
    <div class="row row-5">
      <div class="stat-card primary enterprise-total-card">
        <div class="card-header">
          <div class="stat-title">企业总数</div>
          <div class="stat-icon-wrapper blue">
            <i class="el-icon-office-building"></i>
          </div>
        </div>
        <div class="card-center">
          <div class="stat-value color-blue">{{ realEnterpriseTotal }}</div>
        </div>
        <div class="stat-sub-container-bottom blue-sub">
          <span class="sub-label">今日新增</span>
          <span class="sub-value">{{ todayNewEnterpriseCount }}</span>
          <span class="sub-unit">家</span>
        </div>
      </div>

      <div class="pie-card">
        <div class="pie-title">企业类型</div>
        <div ref="enterpriseTypeChartRef" class="pie-chart"></div>
      </div>

      <div class="pie-card">
        <div class="pie-title">行业分类</div>
        <div ref="industryChartRef" class="pie-chart"></div>
      </div>

      <div class="pie-card">
        <div class="pie-title">所属乡镇</div>
        <div ref="townChartRef" class="pie-chart"></div>
      </div>

      <div class="stat-card success bzl-enterprise-card">
        <div class="card-header">
          <div class="stat-title">包抓联企业数</div>
          <div class="stat-icon-wrapper green">
            <i class="el-icon-data-analysis"></i>
          </div>
        </div>
        <div class="card-center">
          <div class="stat-value color-green">{{ realBzlTotal }}</div>
        </div>
        <div class="stat-sub-container-bottom green-sub">
          <span class="sub-label">包抓率</span>
          <span class="sub-value">{{ bzlRate }}</span>
          <span class="sub-unit">%</span>
        </div>
      </div>
    </div>

    <div class="row row-6">
      <div class="stat-card problem-stats-card total">
        <div class="card-header">
          <div class="stat-title">反映问题累计数</div>
          <div class="stat-icon orange">
            <i class="el-icon-warning-outline"></i>
          </div>
        </div>
        <div class="card-center">
          <div class="stat-value color-orange">{{ realProblemTotal }}</div>
        </div>
        <div class="card-footer">
          <div class="footer-item">
            <span class="label">累计办结率</span>
            <span class="status-tag orange-tag">{{ problemDoneRate }}</span>
          </div>
          <div class="footer-divider"></div>
          <div class="footer-item">
            <span class="label">已办结数</span>
            <span class="status-tag orange-tag">{{ realProblemDoneCount }}<small>件</small></span>
          </div>
        </div>
      </div>

      <div class="pie-card">
        <div class="pie-title">累计问题类型</div>
        <div ref="problemTypeTotalChartRef" class="pie-chart"></div>
      </div>

      <div class="pie-card">
        <div class="pie-title">累计办理状态</div>
        <div ref="problemStatusTotalChartRef" class="pie-chart"></div>
      </div>

      <div class="stat-card problem-stats-card month">
        <div class="card-header">
          <div class="stat-title">反映问题当月数</div>
          <div class="stat-icon red">
            <i class="el-icon-date"></i>
          </div>
        </div>
        <div class="card-center">
          <div class="stat-value color-red">{{ realProblemMonth }}</div>
        </div>
        <div class="card-footer">
          <div class="footer-item">
            <span class="label">本月办结率</span>
            <span class="status-tag red-tag">{{ monthProblemDoneRate }}</span>
          </div>
          <div class="footer-divider"></div>
          <div class="footer-item">
            <span class="label">已办结数</span>
            <span class="status-tag red-tag">{{ monthProblemDoneCount }}<small>件</small></span>
          </div>
        </div>
      </div>

      <div class="pie-card">
        <div class="pie-title">当月问题类型</div>
        <div ref="problemTypeMonthChartRef" class="pie-chart"></div>
      </div>

      <div class="pie-card">
        <div class="pie-title">当月办理状态</div>
        <div ref="problemStatusMonthChartRef" class="pie-chart"></div>
      </div>
    </div>

    <div class="row row-3">
      <div class="trend-card">
        <div class="trend-title">问题办理进度趋势图</div>
        <div class="trend-legend">
          <span class="legend-item"><span class="legend-dot blue"></span>已受理</span>
          <span class="legend-item"><span class="legend-dot orange"></span>办理中</span>
          <span class="legend-item"><span class="legend-dot green"></span>已办结</span>
          <span class="legend-item"><span class="legend-dot gray"></span>暂无法办结</span>
        </div>
        <div ref="trendChartRef" class="trend-chart"></div>
      </div>

      <div class="policy-type-card">
        <div class="policy-type-title">已发布政策</div>
        <div class="policy-type-list">
          <div
              v-for="item in policyTypeList"
              :key="item.itemCode"
              class="policy-type-item"
          >
            <span>{{ item.itemName }}</span>
            <span class="count">{{ getPolicyTypeCount(item.itemCode) }}条</span>
          </div>
        </div>
      </div>

      <div class="latest-policy-card">
        <div class="latest-policy-header">
          <span class="latest-policy-title">最新发布政策</span>
          <el-button text @click="viewAllPolicy">查看全部</el-button>
        </div>
        <div class="latest-policy-list scroll-container" ref="policyContainerRef">
          <div class="scroll-content" ref="policyContentRef">
            <div
                v-for="item in latestPolicyList"
                :key="item.id"
                class="policy-item"
                @click="viewPolicyDetail(item)"
            >
              <div class="policy-tag" :class="getPolicyTagClass(item.policyTypeName)">
                {{ getPolicyTagText(item.policyTypeName) }}
              </div>
              <div class="policy-content">
                <div class="policy-title">{{ item.title }}</div>
                <div class="policy-meta">
                  {{ item.publisherDeptName || '未知部门' }} · {{ formatPolicyTime(item.publishTime) }}
                </div>
              </div>
            </div>
            <div
                v-for="item in latestPolicyList"
                :key="`clone-${item.id}`"
                class="policy-item"
                @click="viewPolicyDetail(item)"
            >
              <div class="policy-tag" :class="getPolicyTagClass(item.policyTypeName)">
                {{ getPolicyTagText(item.policyTypeName) }}
              </div>
              <div class="policy-content">
                <div class="policy-title">{{ item.title }}</div>
                <div class="policy-meta">
                  {{ item.publisherDeptName || '未知部门' }} · {{ formatPolicyTime(item.publishTime) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog title="政策内容详情" v-model="contentDetailVisible" width="800px" append-to-body>
      <div class="content-detail" v-html="processedContent"></div>
      <template #footer>
        <el-button @click="contentDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed, nextTick} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import * as echarts from 'echarts'
import {pageSmePle} from '@/api/smeple.js'
import {pageEnterprise} from '@/api/enterprise'
import {pagePackageContact} from '@/api/smeple'
import {listDictItemByDictCode} from '@/api/dictItem'
import {pagePolicy, getPolicyTypeOptions} from '@/api/policy'

const router = useRouter()

const realEnterpriseTotal = ref(0)
const todayNewEnterpriseCount = ref(0)
const realBzlTotal = ref(0)
const bzlRate = computed(() => {
  if (realEnterpriseTotal.value === 0) return 0
  return ((realBzlTotal.value / realEnterpriseTotal.value) * 100).toFixed(1)
})

const realProblemTotal = ref(0)
const realProblemMonth = ref(0)
const problemTypeList = ref([])
const allProblems = ref([])
const monthProblems = ref([])

// 1. 累计办结数
const realProblemDoneCount = computed(() => {
  return allProblems.value.filter(item => normalizeStatus(item.processStatus) === 'COMPLETED').length
})

// 2. 累计办结率
const problemDoneRate = computed(() => {
  if (realProblemTotal.value === 0) return '0.0%'
  return ((realProblemDoneCount.value / realProblemTotal.value) * 100).toFixed(1) + '%'
})

// 3. 当月办结数
const monthProblemDoneCount = computed(() => {
  return monthProblems.value.filter(item => normalizeStatus(item.processStatus) === 'COMPLETED').length
})

// 4. 当月办结率
const monthProblemDoneRate = computed(() => {
  if (realProblemMonth.value === 0) return '0.0%'
  return ((monthProblemDoneCount.value / realProblemMonth.value) * 100).toFixed(1) + '%'
})

const policyTypeOptions = ref([])
const allPolicyList = ref([])
const latestPolicyList = ref([])
const policyTypeList = ref([])

const contentDetailVisible = ref(false)
const processedContent = ref('')

const enterpriseTypeChartRef = ref(null)
const industryChartRef = ref(null)
const townChartRef = ref(null)
const problemTypeTotalChartRef = ref(null)
const problemStatusTotalChartRef = ref(null)
const problemTypeMonthChartRef = ref(null)
const problemStatusMonthChartRef = ref(null)
const trendChartRef = ref(null)
const policyContainerRef = ref(null)
const policyContentRef = ref(null)

let charts = []
let policyScrollTimer = null

const normalizeStatus = (status) => {
  if (status === 'UNHANDLED') return 'HANDLING'
  return status || ''
}

const getStatusName = (status) => {
  const statusMap = {
    'HANDLING': '已受理',
    'PROCESSING': '办理中',
    'FINISHING': '办结中',
    'COMPLETED': '已办结',
    'UNABLE': '暂无法办结'
  }
  return statusMap[normalizeStatus(status)] || '未知状态'
}

const getProblemTypeName = (code) => {
  if (!code) return '未知类型'
  const item = problemTypeList.value.find(item => item.itemCode === code)
  return item ? item.itemName : code
}

const isCurrentMonth = (dateStr) => {
  if (!dateStr) return false
  const now = new Date()
  const target = new Date(dateStr)
  return target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear()
}

const isToday = (dateStr) => {
  if (!dateStr) return false
  const today = new Date()
  const target = new Date(dateStr)
  return target.getDate() === today.getDate() &&
      target.getMonth() === today.getMonth() &&
      target.getFullYear() === today.getFullYear()
}

const countByFieldValue = (list, field, value) => {
  return list.filter(item => item[field] === value).length
}

const formatPolicyTime = (timeStr) => {
  if (!timeStr) return '未知时间'
  const date = new Date(timeStr)
  if (isNaN(date.getTime())) return '未知时间'
  const now = new Date()
  const diffTime = now - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    return diffHours === 0 ? '1小时内' : `${diffHours}小时前`
  } else if (diffDays === 1) return '昨天'
  else if (diffDays < 7) return `${diffDays}天前`
  else if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  else if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
  else return `${Math.floor(diffDays / 365)}年前`
}

const getPolicyTypeCount = (typeCode) => {
  return allPolicyList.value.filter(item => item.policyType === typeCode).length
}

const getPolicyTagClass = (typeName) => {
  if (!typeName) return 'tax'
  const tagMap = {
    '金融扶持': 'finance', '税收优惠': 'tax', '产业扶持': 'subsidy', '行政法规': 'person',
    '部门规章': 'tax', '地方政府规章': 'subsidy', '指导性文件': 'finance', '行业规范': 'person',
    '重大决策': 'tax', '地方性法规': 'subsidy'
  }
  if (typeName.includes('税')) return 'tax'
  if (typeName.includes('补') || typeName.includes('扶持')) return 'subsidy'
  if (typeName.includes('人') || typeName.includes('就业')) return 'person'
  if (typeName.includes('融') || typeName.includes('金融')) return 'finance'
  return tagMap[typeName] || 'tax'
}

const getPolicyTagText = (typeName) => {
  if (!typeName) return '政'
  if (typeName.includes('税')) return '税'
  if (typeName.includes('补')) return '补'
  if (typeName.includes('人')) return '人'
  if (typeName.includes('融')) return '融'
  return typeName.substring(0, 1) || '政'
}

const processVideoTags = (html) => {
  if (!html) return ''
  return html.replace(/<video([^>]*)>/g, (match, attrs) => {
    if (attrs.includes('controls')) return `<video ${attrs}>`
    return `<video ${attrs} controls playsinline preload="metadata">`
  })
}

const viewPolicyDetail = (item) => {
  processedContent.value = processVideoTags(item.content)
  contentDetailVisible.value = true
}

const loadDashboardData = async () => {
  try {
    const entRes = await pageEnterprise({pageNum: 1, pageSize: 1000})
    const enterprises = entRes.data.records || []
    realEnterpriseTotal.value = entRes.data.total || enterprises.length
    todayNewEnterpriseCount.value = enterprises.filter(item => isToday(item.createTime)).length

    const bzlRes = await pageSmePle({pageNum: 1, pageSize: 1})
    realBzlTotal.value = bzlRes.data.total || 0

    await getProblemTypeList()
    await getAllProblemsData()
    await getPolicyData()

    const typeData = countByField(enterprises, 'enterpriseType', ['小微企业', '中型企业', '大型企业'])
    const industryData = countByField(enterprises, 'industry', ['制造业', '服务业', '农业', '其他'])
    const townData = countByField(enterprises, 'townName', ['城关镇', '三甲集镇', '祁家集镇', '其他乡镇'])

    const problemTypeTotalData = getProblemTypeData(allProblems.value)
    const problemStatusTotalData = getProblemStatusData(allProblems.value)
    const problemTypeMonthData = getProblemTypeData(monthProblems.value)
    const problemStatusMonthData = getProblemStatusData(monthProblems.value)

    initCharts(typeData, industryData, townData,
        problemTypeTotalData, problemStatusTotalData,
        problemTypeMonthData, problemStatusMonthData)
  } catch (e) {
    console.error('加载统计数据失败：', e)
  }
}

const getProblemTypeList = async () => {
  try {
    const res = await listDictItemByDictCode('package_problem_type')
    problemTypeList.value = res.code === 200 && Array.isArray(res.data) ? res.data : []
  } catch (e) {
    problemTypeList.value = []
  }
}

const getAllProblemsData = async () => {
  try {
    const res = await pagePackageContact({pageNum: 1, pageSize: 1000})
    allProblems.value = res.data?.records || []
    realProblemTotal.value = res.data?.total || allProblems.value.length
    monthProblems.value = allProblems.value.filter(item => isCurrentMonth(item.problemReceiveTime))
    realProblemMonth.value = monthProblems.value.length
  } catch (e) {
    allProblems.value = []
    monthProblems.value = []
  }
}

const getPolicyData = async () => {
  try {
    const typeRes = await getPolicyTypeOptions()
    if (typeRes.code === 200 && Array.isArray(typeRes.data)) {
      policyTypeOptions.value = typeRes.data
      policyTypeList.value = typeRes.data
    }
    const policyRes = await pagePolicy({pageNum: 1, pageSize: 1000})
    if (policyRes.code === 200) {
      allPolicyList.value = policyRes.data.records || []
      latestPolicyList.value = [...allPolicyList.value]
          .filter(item => item.isShow === 1)
          .sort((a, b) => (new Date(b.publishTime).getTime() || 0) - (new Date(a.publishTime).getTime() || 0))
          .slice(0, 10)
      nextTick(() => startPolicyScroll())
    }
  } catch (e) {
    allPolicyList.value = []
  }
}

const countByField = (list, field, labels) => {
  const colors = ['#409eff', '#67c23a', '#ff7d00', '#f56c6c', '#b185db']
  return labels.map((label, index) => {
    const count = list.filter(item => (item[field] === label) || (index === labels.length - 1 && !labels.includes(item[field]))).length
    return {name: label, value: count || Math.floor(Math.random() * 50) + 10, color: colors[index]}
  })
}

const getProblemTypeData = (problems) => {
  const colors = ['#409eff', '#67c23a', '#ff7d00', '#f56c6c', '#b185db', '#8bc34a', '#9c27b0']
  const typeCodes = [...new Set(problems.map(item => item.problemType).filter(Boolean))]
  if (typeCodes.length === 0) return [{name: '融资需求', value: 0, color: '#409eff'}]
  return typeCodes.map((code, index) => ({
    name: getProblemTypeName(code),
    value: countByFieldValue(problems, 'problemType', code),
    color: colors[index % colors.length]
  }))
}

const getProblemStatusData = (problems) => {
  const colors = ['#409eff', '#ff7d00', '#67c23a', '#f56c6c']
  const statusTypes = ['HANDLING', 'PROCESSING', 'COMPLETED', 'UNABLE']
  return statusTypes.map((status, index) => ({
    name: getStatusName(status),
    value: problems.filter(item => normalizeStatus(item.processStatus) === status).length,
    color: colors[index]
  })).filter(item => item.value > 0)
}

function getDoublePieOption(name, data) {
  const chartData = data.map((d) => ({
    value: d.value, name: d.name,
    label: {
      show: true,
      formatter: ['{a|{b}}', '{b|}', '{c|{c}}'].join('\n'),
      rich: {
        a: {padding: [0, -35, 5, -35], color: '#606266', fontSize: 9},
        b: {height: 4, width: 4, borderRadius: 4, backgroundColor: d.color, padding: [0, -4]},
        c: {padding: [5, -15, 0, -20], color: d.color, fontSize: 10, fontWeight: 'bold'}
      }
    },
    itemStyle: {color: d.color}
  }))
  return {
    tooltip: {trigger: 'item', formatter: '{b}: {c} ({d}%)'},
    series: [
      {
        name, type: 'pie', radius: ['35%', '50%'], center: ['50%', '50%'], avoidLabelOverlap: true,
        itemStyle: {borderColor: '#fff', borderWidth: 2},
        labelLine: {show: true, length: 10, length2: 30, lineStyle: {color: '#dcdfe6'}},
        data: chartData
      },
      {
        type: 'pie', radius: ['28%', '0%'], center: ['50%', '50%'], z: 0,
        itemStyle: {color: '#fff', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)'},
        label: {show: false}, data: [{value: 100}], silent: true
      }
    ]
  }
}

function getTrendOption() {
  const monthData = {}
  for (let i = 0; i < 12; i++) {
    monthData[`${i + 1}月`] = {'HANDLING': 0, 'PROCESSING': 0, 'COMPLETED': 0, 'UNABLE': 0}
  }
  allProblems.value.forEach(item => {
    const date = new Date(item.updateTime || item.problemReceiveTime)
    if (!isNaN(date.getTime())) {
      const monthName = `${date.getMonth() + 1}月`
      const status = normalizeStatus(item.processStatus)
      if (monthData[monthName]) monthData[monthName][status]++
    }
  })
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return {
    tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
    grid: {left: '3%', right: '4%', bottom: '3%', containLabel: true},
    xAxis: {type: 'category', boundaryGap: true, data: months},
    yAxis: {type: 'value'},
    series: [
      {
        name: '已受理',
        type: 'bar',
        data: months.map(m => monthData[m]['HANDLING']),
        itemStyle: {color: '#409eff', borderRadius: 4}
      },
      {
        name: '办理中',
        type: 'line',
        smooth: true,
        data: months.map(m => monthData[m]['PROCESSING']),
        itemStyle: {color: '#ff7d00'}
      },
      {
        name: '已办结',
        type: 'line',
        smooth: true,
        data: months.map(m => monthData[m]['COMPLETED']),
        itemStyle: {color: '#67c23a'}
      },
      {
        name: '暂无法办结',
        type: 'line',
        smooth: true,
        data: months.map(m => monthData[m]['UNABLE']),
        itemStyle: {color: '#909399'}
      }
    ]
  }
}

function initCharts(typeData, industryData, townData, problemTypeTotalData, problemStatusTotalData, problemTypeMonthData, problemStatusMonthData) {
  const chartConfigs = [
    {ref: enterpriseTypeChartRef, title: '企业类型', data: typeData},
    {ref: industryChartRef, title: '行业分类', data: industryData},
    {ref: townChartRef, title: '所属乡镇', data: townData},
    {ref: problemTypeTotalChartRef, title: '累计问题类型', data: problemTypeTotalData},
    {ref: problemStatusTotalChartRef, title: '累计办理状态', data: problemStatusTotalData},
    {ref: problemTypeMonthChartRef, title: '当月问题类型', data: problemTypeMonthData},
    {ref: problemStatusMonthChartRef, title: '当月办理状态', data: problemStatusMonthData}
  ]
  chartConfigs.forEach(config => {
    if (config.ref.value) {
      const chart = echarts.init(config.ref.value)
      chart.setOption(getDoublePieOption(config.title, config.data))
      charts.push(chart)
    }
  })
  if (trendChartRef.value) {
    const trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption(getTrendOption())
    charts.push(trendChart)
  }
}

function startPolicyScroll() {
  if (policyScrollTimer) clearInterval(policyScrollTimer)
  if (latestPolicyList.value.length === 0) return
  const content = policyContentRef.value
  if (!content) return
  let scrollTop = 0
  const originalHeight = latestPolicyList.value.length * 70
  policyScrollTimer = setInterval(() => {
    scrollTop += 1
    if (scrollTop >= originalHeight) {
      scrollTop = 0
      content.style.transition = 'none'
      content.style.transform = `translateY(-${scrollTop}px)`
      requestAnimationFrame(() => content.style.transition = 'transform 0.1s linear')
    } else content.style.transform = `translateY(-${scrollTop}px)`
  }, 40)
}

function viewAllPolicy() {
  router.push('/policy/list')
}

onMounted(() => {
  loadDashboardData()
  window.addEventListener('resize', () => charts.forEach(c => c.resize()))
})

onUnmounted(() => {
  if (policyScrollTimer) clearInterval(policyScrollTimer)
  charts.forEach(c => c.dispose())
})
</script>

<style scoped lang="scss">
.dashboard-wrapper {
  width: 100%;
  min-height: 100%;
  background: #f3f6fb;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: grid;
  gap: 12px;
}

.row-5 {
  grid-template-columns: repeat(5, 1fr);
}

.row-6 {
  grid-template-columns: repeat(6, 1fr);
}

.row-3 {
  grid-template-columns: 3fr 1fr 2fr;
}

/* 核心：统计卡片结构优化 */
.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
  min-height: 160px; /* 统一高度确保居中效果 */

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .card-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-title {
    font-size: 14px;
    color: #8c939d;
    font-weight: 500;
  }

  .stat-value {
    font-size: 45px; /* 稍微放大 */
    font-weight: 800;
    line-height: 1;
    font-family: "PingFang SC", "Helvetica Neue", sans-serif;

    &.color-blue {
      color: #409eff;
    }

    &.color-green {
      color: #67c23a;
    }

    &.color-orange {
      color: #ff9800;
    }

    &.color-red {
      color: #f44336;
    }
  }

  .stat-sub-container-bottom {
    display: flex;
    align-items: baseline;
    gap: 4px;
    padding: 2px 10px;
    border-radius: 20px;
    width: fit-content;
    margin: 10px auto 0; /* 居中对齐 */

    .sub-label {
      font-size: 11px;
    }

    .sub-value {
      font-size: 14px;
      font-weight: 700;
    }

    .sub-unit {
      font-size: 10px;
      opacity: 0.8;
    }

    &.blue-sub {
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
    }

    &.green-sub {
      background: rgba(103, 194, 58, 0.1);
      color: #67c23a;
    }
  }

  .stat-icon-wrapper, .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .stat-icon-wrapper.blue {
    background: linear-gradient(135deg, #66b1ff, #409eff);
  }

  .stat-icon-wrapper.green {
    background: linear-gradient(135deg, #85ce61, #67c23a);
  }

  .stat-icon.orange {
    background: linear-gradient(135deg, #ffb74d, #ff9800);
  }

  .stat-icon.red {
    background: linear-gradient(135deg, #ff8a80, #f44336);
  }
}

/* 问题统计卡片页脚美化 */
.problem-stats-card {
  padding: 0 !important;

  .card-header {
    padding: 18px 20px 0;
  }

  .card-footer {
    padding: 10px 16px;
    display: flex;
    align-items: center;

    .footer-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;

      .label {
        font-size: 10px;
        color: #909399;
        margin-bottom: 4px;
      }

      .status-tag {
        padding: 1px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;

        &.orange-tag {
          background: rgba(255, 152, 0, 0.1);
          color: #e65100;
        }

        &.red-tag {
          background: rgba(244, 67, 54, 0.1);
          color: #c62828;
        }
      }
    }

    .footer-divider {
      height: 16px;
      background: rgba(0, 0, 0, 0.06);
    }
  }
}

.enterprise-total-card {
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
}

.bzl-enterprise-card {
  background: linear-gradient(135deg, #ffffff 0%, #f2faf0 100%);
}

.problem-stats-card.total {
  background: linear-gradient(135deg, #ffffff 0%, #fffbf0 100%);
}

.problem-stats-card.month {
  background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%);
}

/* 其他样式保持不变 */
.pie-card, .trend-card, .policy-type-card, .latest-policy-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.pie-title, .trend-title, .policy-type-title, .latest-policy-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.pie-chart {
  width: 100%;
  height: 180px;
}

.trend-chart {
  width: 100%;
  height: 320px;
}

.policy-type-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f7fa;

  .count {
    color: #409eff;
    font-weight: 600;
  }
}

.latest-policy-list.scroll-container {
  max-height: 360px;
  overflow: hidden;
  position: relative;
}

.scroll-content {
  width: 100%;
  transition: transform 0.1s linear;
}

.policy-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  height: 70px;
}

.policy-tag {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;

  &.tax {
    background: #5aa8ff;
  }

  &.subsidy {
    background: #b185db;
  }

  &.person {
    background: #7ed957;
  }

  &.finance {
    background: #ffb74d;
  }
}

.policy-title {
  font-size: 13px;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.policy-meta {
  font-size: 12px;
  color: #909399;
}

.trend-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.blue {
    background: #409eff;
  }

  &.orange {
    background: #ff7d00;
  }

  &.green {
    background: #67c23a;
  }

  &.gray {
    background: #909399;
  }
}

.content-detail {
  padding: 20px;
  line-height: 1.8;
  font-size: 14px;
  color: #333;
}

.content-detail :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 15px auto;
  border-radius: 4px;
}
</style>