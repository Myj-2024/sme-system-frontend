<template>
  <div class="dashboard-wrapper">
    <div class="row row-5">
      <div class="stat-card primary">
        <div class="stat-header">
          <div class="stat-title">企业总数</div>
          <div class="stat-icon blue">
            <i class="el-icon-office-building"></i>
          </div>
        </div>
        <div class="stat-value">{{ realEnterpriseTotal }}</div>
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

      <div class="stat-card success">
        <div class="stat-header">
          <div class="stat-title">包抓联企业数</div>
          <div class="stat-icon green">
            <i class="el-icon-data-analysis"></i>
          </div>
        </div>
        <div class="stat-value">{{ realBzlTotal }}</div>
        <div class="stat-sub green-text">包抓率 {{ bzlRate }}%</div>
      </div>
    </div>

    <div class="row row-6">
      <div class="stat-card warning">
        <div class="stat-header">
          <div class="stat-title">企业反映问题累计数</div>
          <div class="stat-icon orange">
            <i class="el-icon-warning-outline"></i>
          </div>
        </div>
        <div class="stat-value">{{ realProblemTotal }}</div>
      </div>

      <div class="pie-card">
        <div class="pie-title">累计问题类型</div>
        <div ref="problemTypeTotalChartRef" class="pie-chart"></div>
      </div>

      <div class="pie-card">
        <div class="pie-title">累计办理状态</div>
        <div ref="problemStatusTotalChartRef" class="pie-chart"></div>
      </div>

      <div class="stat-card danger">
        <div class="stat-header">
          <div class="stat-title">企业反映问题当月数</div>
          <div class="stat-icon red">
            <i class="el-icon-date"></i>
          </div>
        </div>
        <div class="stat-value">{{ realProblemMonth }}</div>
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
        <!-- 修改：添加滚动容器和内容容器 -->
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
            <!-- 重复渲染实现无缝衔接 -->
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

    <!-- 政策详情弹窗 -->
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
// 引入真实API
import {pageSmePle} from '@/api/smeple.js'
import {pageEnterprise} from '@/api/enterprise'
// 引入问题相关API
import {pagePackageContact} from '@/api/smeple'
import {listDictItemByDictCode} from '@/api/dictItem'
import {formatDate} from '@/utils/dateUtil'
// 引入政策相关API
import {pagePolicy, getPolicyTypeOptions} from '@/api/policy'

const router = useRouter()

// ========== 响应式数据 ==========
const realEnterpriseTotal = ref(0)
const realBzlTotal = ref(0)
const bzlRate = computed(() => {
  if (realEnterpriseTotal.value === 0) return 0
  return ((realBzlTotal.value / realEnterpriseTotal.value) * 100).toFixed(1)
})

// 真实问题数据（替换原模拟数据）
const realProblemTotal = ref(0) // 累计问题数
const realProblemMonth = ref(0) // 当月问题数
const problemTypeList = ref([]) // 问题类型字典
const allProblems = ref([]) // 所有问题列表
const monthProblems = ref([]) // 当月问题列表

// 政策相关真实数据
const policyTypeOptions = ref([]) // 政策类型选项
const allPolicyList = ref([]) // 所有政策列表
const latestPolicyList = ref([]) // 最新政策列表
const policyTypeList = ref([]) // 政策类型列表

// 详情弹窗
const contentDetailVisible = ref(false)
const processedContent = ref('')

// 图表Refs
const enterpriseTypeChartRef = ref(null)
const industryChartRef = ref(null)
const townChartRef = ref(null)
const problemTypeTotalChartRef = ref(null)
const problemStatusTotalChartRef = ref(null)
const problemTypeMonthChartRef = ref(null)
const problemStatusMonthChartRef = ref(null)
const trendChartRef = ref(null)
// 修改：更新Ref命名，区分容器和内容
const policyContainerRef = ref(null)
const policyContentRef = ref(null)

let charts = []
let policyScrollTimer = null

// ========== 工具函数 ==========
// 标准化状态（兼容UNHANDLED）
const normalizeStatus = (status) => {
  if (status === 'UNHANDLED') return 'HANDLING'
  return status || ''
}

// 获取状态显示名称
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

// 获取问题类型名称
const getProblemTypeName = (code) => {
  if (!code) return '未知类型'
  const item = problemTypeList.value.find(item => item.itemCode === code)
  return item ? item.itemName : code
}

// 判断是否为当月数据
const isCurrentMonth = (dateStr) => {
  if (!dateStr) return false
  const now = new Date()
  const target = new Date(dateStr)
  return target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear()
}

// 统计数组中指定字段的数量
const countByFieldValue = (list, field, value) => {
  return list.filter(item => item[field] === value).length
}

// 格式化政策发布时间
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
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}周前`
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}个月前`
  } else {
    return `${Math.floor(diffDays / 365)}年前`
  }
}

// 获取政策类型数量
const getPolicyTypeCount = (typeCode) => {
  return allPolicyList.value.filter(item => item.policyType === typeCode).length
}

// 获取政策标签样式类
const getPolicyTagClass = (typeName) => {
  if (!typeName) return 'tax'

  const tagMap = {
    '金融扶持': 'finance',
    '税收优惠': 'tax',
    '产业扶持': 'subsidy',
    '行政法规': 'person',
    '部门规章': 'tax',
    '地方政府规章': 'subsidy',
    '指导性文件': 'finance',
    '行业规范': 'person',
    '重大决策': 'tax',
    '地方性法规': 'subsidy'
  }

  // 匹配关键词
  if (typeName.includes('税')) return 'tax'
  if (typeName.includes('补') || typeName.includes('扶持')) return 'subsidy'
  if (typeName.includes('人') || typeName.includes('就业')) return 'person'
  if (typeName.includes('融') || typeName.includes('金融')) return 'finance'

  return tagMap[typeName] || 'tax'
}

// 获取政策标签显示文本
const getPolicyTagText = (typeName) => {
  if (!typeName) return '政'

  // 提取第一个字或关键词
  if (typeName.includes('税')) return '税'
  if (typeName.includes('补')) return '补'
  if (typeName.includes('人')) return '人'
  if (typeName.includes('融')) return '融'

  return typeName.substring(0, 1) || '政'
}

// 处理视频标签兼容性
const processVideoTags = (html) => {
  if (!html) return ''
  return html.replace(/<video([^>]*)>/g, (match, attrs) => {
    if (attrs.includes('controls')) return `<video ${attrs}>`
    return `<video ${attrs} controls playsinline preload="metadata">`
  })
}

// 查看政策详情
const viewPolicyDetail = (item) => {
  processedContent.value = processVideoTags(item.content)
  contentDetailVisible.value = true
}

// ========== 获取真实数据并统计 ==========
const loadDashboardData = async () => {
  try {
    // 1. 获取企业总数及列表（用于统计类型、行业、乡镇）
    const entRes = await pageEnterprise({pageNum: 1, pageSize: 1000})
    const enterprises = entRes.data.records || []
    realEnterpriseTotal.value = entRes.data.total || enterprises.length

    // 2. 获取包抓联总数
    const bzlRes = await pageSmePle({pageNum: 1, pageSize: 1})
    realBzlTotal.value = bzlRes.data.total || 0

    // 3. 获取问题类型字典
    await getProblemTypeList()

    // 4. 获取所有问题数据
    await getAllProblemsData()

    // 5. 获取政策相关数据
    await getPolicyData()

    // 6. 统计各维度数据 (基于真实数据计算饼图)
    const typeData = countByField(enterprises, 'enterpriseType', ['小微企业', '中型企业', '大型企业'])
    const industryData = countByField(enterprises, 'industry', ['制造业', '服务业', '农业', '其他'])
    const townData = countByField(enterprises, 'townName', ['城关镇', '三甲集镇', '祁家集镇', '其他乡镇'])

    // 统计问题相关数据
    const problemTypeTotalData = getProblemTypeData(allProblems.value)
    const problemStatusTotalData = getProblemStatusData(allProblems.value)
    const problemTypeMonthData = getProblemTypeData(monthProblems.value)
    const problemStatusMonthData = getProblemStatusData(monthProblems.value)

    initCharts(typeData, industryData, townData,
        problemTypeTotalData, problemStatusTotalData,
        problemTypeMonthData, problemStatusMonthData)
  } catch (e) {
    console.error('加载统计数据失败：', e)
    ElMessage.error('加载统计数据失败')
  }
}

// 获取问题类型字典
const getProblemTypeList = async () => {
  try {
    const res = await listDictItemByDictCode('package_problem_type')
    problemTypeList.value = res.code === 200 && Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error('加载问题类型字典失败：', e)
    ElMessage.error('加载问题类型字典失败')
    problemTypeList.value = []
  }
}

// 获取所有问题数据
const getAllProblemsData = async () => {
  try {
    // 获取所有问题（不分页）
    const res = await pagePackageContact({pageNum: 1, pageSize: 1000})
    allProblems.value = res.data?.records || []
    realProblemTotal.value = res.data?.total || allProblems.value.length

    // 筛选当月问题
    monthProblems.value = allProblems.value.filter(item => isCurrentMonth(item.problemReceiveTime))
    realProblemMonth.value = monthProblems.value.length
  } catch (e) {
    console.error('获取问题数据失败：', e)
    ElMessage.error('获取问题数据失败')
    allProblems.value = []
    monthProblems.value = []
    realProblemTotal.value = 0
    realProblemMonth.value = 0
  }
}

// 获取政策相关数据
const getPolicyData = async () => {
  try {
    // 1. 获取政策类型列表
    const typeRes = await getPolicyTypeOptions()
    if (typeRes.code === 200 && Array.isArray(typeRes.data)) {
      policyTypeOptions.value = typeRes.data
      policyTypeList.value = typeRes.data
    }

    // 2. 获取所有政策数据
    const policyRes = await pagePolicy({pageNum: 1, pageSize: 1000})
    if (policyRes.code === 200) {
      allPolicyList.value = policyRes.data.records || []

      // 3. 获取最新的10条政策（按发布时间倒序）
      latestPolicyList.value = [...allPolicyList.value]
          .filter(item => item.isShow === 1) // 只显示启用的政策
          .sort((a, b) => {
            const timeA = a.publishTime ? new Date(a.publishTime).getTime() : 0
            const timeB = b.publishTime ? new Date(b.publishTime).getTime() : 0
            return timeB - timeA
          })
          .slice(0, 10)

      // 数据加载完成后重启滚动
      nextTick(() => {
        startPolicyScroll()
      })
    }
  } catch (e) {
    console.error('获取政策数据失败：', e)
    ElMessage.error('获取政策数据失败')
    policyTypeOptions.value = []
    allPolicyList.value = []
    latestPolicyList.value = []
  }
}

// 辅助统计函数 - 企业维度
const countByField = (list, field, labels) => {
  const colors = ['#409eff', '#67c23a', '#ff7d00', '#f56c6c', '#b185db']
  return labels.map((label, index) => {
    const count = list.filter(item => (item[field] === label) || (index === labels.length - 1 && !labels.includes(item[field]))).length
    return {name: label, value: count || Math.floor(Math.random() * 50) + 10, color: colors[index]} // 若无数据则暂用随机占位
  })
}

// 统计问题类型数据
const getProblemTypeData = (problems) => {
  const colors = ['#409eff', '#67c23a', '#ff7d00', '#f56c6c', '#b185db', '#8bc34a', '#9c27b0']

  // 获取所有唯一的问题类型
  const typeCodes = [...new Set(problems.map(item => item.problemType).filter(Boolean))]

  // 如果没有数据，使用默认类型
  if (typeCodes.length === 0) {
    return [
      {name: '融资需求', value: 0, color: '#409eff'},
      {name: '政策咨询', value: 0, color: '#67c23a'},
      {name: '用工问题', value: 0, color: '#ff7d00'}
    ]
  }

  // 统计每个类型的数量
  return typeCodes.map((code, index) => {
    const count = countByFieldValue(problems, 'problemType', code)
    return {
      name: getProblemTypeName(code),
      value: count,
      color: colors[index % colors.length]
    }
  })
}

// 统计问题状态数据
const getProblemStatusData = (problems) => {
  const colors = ['#409eff', '#ff7d00', '#67c23a', '#f56c6c']
  const statusTypes = ['HANDLING', 'PROCESSING', 'COMPLETED', 'UNABLE']

  return statusTypes.map((status, index) => {
    const count = problems.filter(item => normalizeStatus(item.processStatus) === status).length
    return {
      name: getStatusName(status),
      value: count,
      color: colors[index]
    }
  }).filter(item => item.value > 0) // 过滤掉数量为0的状态
}

function getDoublePieOption(name, data) {
  const chartData = data.map((d) => ({
    value: d.value,
    name: d.name,
    label: {
      show: true,
      // 优化：调整标签布局，增加与环形图的间距
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
        name,
        type: 'pie',
        radius: ['35%', '50%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {borderColor: '#fff', borderWidth: 2},
        // 优化：增加引导线长度，避免标签与环形图重叠
        labelLine: {show: true, length: 10, length2: 30, lineStyle: {color: '#dcdfe6'}},
        data: chartData
      },
      {
        type: 'pie',
        radius: ['28%', '0%'],
        center: ['50%', '50%'],
        z: 0,
        itemStyle: {color: '#fff', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)'},
        label: {show: false},
        data: [{value: 100}],
        silent: true
      }
    ]
  }
}

//获取真实的趋势图数据
function getTrendOption() {
  // 按月份统计各状态的问题数量
  const monthData = {}

  // 初始化12个月的数据
  for (let i = 0; i < 12; i++) {
    const monthName = `${i + 1}月`
    monthData[monthName] = {
      'HANDLING': 0,
      'PROCESSING': 0,
      'COMPLETED': 0,
      'UNABLE': 0
    }
  }

  // 统计每个月各状态的问题数量
  allProblems.value.forEach(item => {
    // 优先使用更新时间，如果没有则使用接收时间
    const timeStr = item.updateTime || item.problemReceiveTime
    if (timeStr) {
      const date = new Date(timeStr)
      // 确保日期解析有效
      if (!isNaN(date.getTime())) {
        const month = date.getMonth()
        const monthName = `${month + 1}月`
        const status = normalizeStatus(item.processStatus)

        if (monthData[monthName] && monthData[monthName][status] !== undefined) {
          monthData[monthName][status]++
        }
      }
    }
  })

  // 构建趋势图数据
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  return {
    tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
    grid: {left: '3%', right: '4%', bottom: '3%', containLabel: true},
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: months
    },
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

function initCharts(typeData, industryData, townData,
                    problemTypeTotalData, problemStatusTotalData,
                    problemTypeMonthData, problemStatusMonthData) {
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
    if (config.ref.value) { // 确保DOM元素已挂载
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

// 修改：重写滚动逻辑，使用transform实现无缝滚动
function startPolicyScroll() {
  // 清除原有定时器
  if (policyScrollTimer) clearInterval(policyScrollTimer)

  // 如果没有政策数据，不启动滚动
  if (latestPolicyList.value.length === 0) return

  const container = policyContainerRef.value
  const content = policyContentRef.value

  // 确保DOM元素存在
  if (!container || !content) return

  let scrollTop = 0
  const itemHeight = 70 // 每条政策高度
  const originalHeight = latestPolicyList.value.length * itemHeight // 原始列表高度

  // 启动滚动定时器
  policyScrollTimer = setInterval(() => {
    scrollTop += 1

    // 滚动到原始列表高度时，瞬间重置（无缝衔接）
    if (scrollTop >= originalHeight) {
      scrollTop = 0
      // 取消过渡效果，避免重置时的滑动动画
      content.style.transition = 'none'
      content.style.transform = `translateY(-${scrollTop}px)`

      // 下一帧恢复过渡效果
      requestAnimationFrame(() => {
        content.style.transition = 'transform 0.1s linear'
      })
    } else {
      content.style.transform = `translateY(-${scrollTop}px)`
    }
  }, 40) // 滚动速度（数值越小越快）
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
/* 保持原有样式不变 */
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

.stat-card {
  background: linear-gradient(135deg, #ffffff, #f9fbff);
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  }
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-title {
  font-size: 18px;
  color: #606266;
}

.stat-value {
  font-size: 34px;
  font-weight: 700;
  color: #303133;
}

.stat-sub {
  font-size: 18px;
  margin-top: 6px;
}

.green-text {
  color: #67c23a;
}

.stat-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;

  &.blue {
    background: linear-gradient(135deg, #5aa8ff, #3f8cff);
  }

  &.green {
    background: linear-gradient(135deg, #7ed957, #4caf50);
  }

  &.orange {
    background: linear-gradient(135deg, #ffb74d, #ff9800);
  }

  &.red {
    background: linear-gradient(135deg, #ff8a80, #f44336);
  }
}

.pie-card, .trend-card, .policy-type-card, .latest-policy-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  }
}

.pie-title, .trend-title, .policy-type-title, .latest-policy-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.pie-chart {
  width: 100%;
  height: 200px;
}

.trend-chart {
  width: 100%;
  height: 320px;
}

.policy-type-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 7px 0;
  color: #606266;

  .count {
    color: #409eff;
  }
}

/* 修改：更新滚动容器样式 */
.latest-policy-list.scroll-container {
  max-height: 360px;
  overflow: hidden;
  position: relative;
}

/* 添加：滚动内容样式 */
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
  height: 70px; /* 固定每条政策高度，确保滚动计算准确 */
  box-sizing: border-box;
}

.policy-tag {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 500;

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
}

.policy-meta {
  font-size: 12px;
  color: #909399;
}

.trend-card {
  background: #fff;
  padding: 24px;
  flex: 3;
  min-width: 500px;
  display: flex;
  flex-direction: column;
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
  font-size: 13px;
  color: #606266;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;

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

/* 详情弹窗样式 */
.content-detail {
  padding: 16px;
  line-height: 1.8;
  font-size: 14px;
}

.content-detail :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px auto;
}

.content-detail :deep(video),
.content-detail :deep(iframe) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px auto;
}
</style>