<template>
  <div class="dashboard-wrapper">
    <!-- 第一行：企业统计 -->
    <div class="row row-5">
      <div class="stat-card primary">
        <div class="stat-header">
          <div class="stat-title">企业总数</div>
          <div class="stat-icon blue">
            <i class="el-icon-office-building"></i>
          </div>
        </div>
        <div class="stat-value">{{ mockEnterpriseTotal }}</div>
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
        <div class="stat-value">{{ mockBzlTotal }}</div>
        <div class="stat-sub green-text">包抓率 {{ mockBzlRate }}%</div>
      </div>
    </div>

    <!-- 第二行：问题统计 -->
    <div class="row row-6">
      <div class="stat-card warning">
        <div class="stat-header">
          <div class="stat-title">企业反映问题累计数</div>
          <div class="stat-icon orange">
            <i class="el-icon-warning-outline"></i>
          </div>
        </div>
        <div class="stat-value">{{ mockProblemTotal }}</div>
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
        <div class="stat-value">{{ mockProblemMonth }}</div>
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

    <!-- 第三行 -->
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
              v-for="item in mockPolicyTypeList"
              :key="item.type"
              class="policy-type-item"
          >
            <span>{{ item.type }}</span>
            <span class="count">{{ item.count }}条</span>
          </div>
        </div>
      </div>

      <div class="latest-policy-card">
        <div class="latest-policy-header">
          <span class="latest-policy-title">最新发布政策</span>
          <el-button text @click="viewAllPolicy">查看全部</el-button>
        </div>
        <div class="latest-policy-list" ref="policyListRef">
          <div
              v-for="item in mockLatestPolicyList"
              :key="item.id"
              class="policy-item"
          >
            <div class="policy-tag" :class="item.tagClass">
              {{ item.tag }}
            </div>
            <div class="policy-content">
              <div class="policy-title">{{ item.title }}</div>
              <div class="policy-meta">
                {{ item.department }} · {{ item.time }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useUserStore} from '@/store/userStore'
import userApi from '@/api/user'
import * as echarts from 'echarts'

const router = useRouter()
const userStore = useUserStore()
const mockEnterpriseTotal = 350
const mockBzlTotal = 280
const mockBzlRate = 80
const mockProblemTotal = 122
const mockProblemMonth = 18
const mockPolicyTypeList = [{type: '金融扶持', count: 12}, {type: '税收优惠', count: 8}, {
  type: '产业扶持',
  count: 15
}, {type: '行政法规', count: 5}, {type: '部门规章', count: 7}, {type: '地方政府规章', count: 3}, {
  type: '指导性文件',
  count: 10
}, {type: '行业规范', count: 4}, {type: '重大决策', count: 2}, {type: '地方性法规', count: 6}]
const mockLatestPolicyList = [{
  id: 1,
  tag: '税',
  tagClass: 'tax',
  title: '关于小微企业税收减免政策',
  department: '广河县税务局',
  time: '2小时前'
}, {
  id: 2,
  tag: '补',
  tagClass: 'subsidy',
  title: '2024年度科技创新补贴申报',
  department: '广河县科工局',
  time: '昨天'
}, {
  id: 3,
  tag: '人',
  tagClass: 'person',
  title: '高校毕业生就业见习补贴通知',
  department: '广河县人社局',
  time: '3天前'
}, {
  id: 4,
  tag: '融',
  tagClass: 'finance',
  title: '银企对接会邀请函',
  department: '广河县金融办',
  time: '1周前'
}, {
  id: 5,
  tag: '税',
  tagClass: 'tax',
  title: '个体工商户所得税优惠细则',
  department: '广河县税务局',
  time: '2周前'
}, {
  id: 6,
  tag: '补',
  tagClass: 'subsidy',
  title: '农业产业化项目扶持资金公示',
  department: '广河县农业农村局',
  time: '3周前'
}, {
  id: 7,
  tag: '人',
  tagClass: 'person',
  title: '灵活就业人员社保补贴政策',
  department: '广河县人社局',
  time: '1个月前'
}, {
  id: 8,
  tag: '融',
  tagClass: 'finance',
  title: '中小微企业贷款贴息政策',
  department: '广河县金融办',
  time: '1个月前'
}, {
  id: 9,
  tag: '税',
  tagClass: 'tax',
  title: '研发费用加计扣除政策解读',
  department: '广河县税务局',
  time: '2个月前'
}, {
  id: 10,
  tag: '补',
  tagClass: 'subsidy',
  title: '数字经济企业专项补贴',
  department: '广河县科工局',
  time: '2个月前'
}]
const enterpriseTypeChartRef = ref(null)
const industryChartRef = ref(null)
const townChartRef = ref(null)
const problemTypeTotalChartRef = ref(null)
const problemStatusTotalChartRef = ref(null)
const problemTypeMonthChartRef = ref(null)
const problemStatusMonthChartRef = ref(null)
const trendChartRef = ref(null)
const policyListRef = ref(null)
let enterpriseTypeChart = null
let industryChart = null
let townChart = null
let problemTypeTotalChart = null
let problemStatusTotalChart = null
let problemTypeMonthChart = null
let problemStatusMonthChart = null
let trendChart = null
let policyScrollTimer = null

function getDoublePieOption(name, data) {
  return {
    tooltip: {trigger: 'item', formatter: '{b}: {c} ({d}%)'},
    legend: {show: false},
    series: [{
      name,
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '55%'],
      avoidLabelOverlap: false,
      itemStyle: {borderRadius: 6, borderColor: '#fff', borderWidth: 2},
      label: {
        show: true,
        fontSize: 11,
        formatter: '{b|{b}}\n{c|{c}}',
        rich: {
          b: {fontSize: 11, color: '#606266', lineHeight: 16},
          c: {fontSize: 12, color: '#303133', fontWeight: 'bold'}
        }
      },
      emphasis: {label: {show: true, fontSize: 13, fontWeight: 'bold'}},
      labelLine: {show: false},
      data: data.map(d => ({value: d.value, name: d.name, itemStyle: {color: d.color}}))
    }]
  }
}

function getTrendOption() {
  return {
    tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
    legend: {show: false},
    grid: {left: '3%', right: '4%', bottom: '3%', containLabel: true},
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {type: 'value'},
    series: [{
      name: '已受理',
      type: 'bar',
      data: [32, 45, 38, 52, 48, 65, 58, 72, 68, 80, 75, 90],
      itemStyle: {color: '#409eff', borderRadius: 4}
    }, {
      name: '办理中',
      type: 'line',
      smooth: true,
      data: [10, 15, 12, 18, 16, 22, 20, 25, 23, 28, 26, 30],
      itemStyle: {color: '#ff7d00'},
      lineStyle: {width: 2},
      symbolSize: 4
    }, {
      name: '已办结',
      type: 'line',
      smooth: true,
      data: [20, 28, 25, 32, 30, 38, 35, 42, 40, 48, 45, 52],
      itemStyle: {color: '#67c23a'},
      lineStyle: {width: 2},
      symbolSize: 4
    }, {
      name: '暂无法办结',
      type: 'line',
      smooth: true,
      data: [2, 3, 1, 4, 2, 5, 3, 6, 4, 7, 5, 8],
      itemStyle: {color: '#909399'},
      lineStyle: {width: 2},
      symbolSize: 4
    }]
  }
}

function initCharts() {
  enterpriseTypeChart = echarts.init(enterpriseTypeChartRef.value)
  enterpriseTypeChart.setOption(getDoublePieOption('企业类型', [{
    name: '小微企业',
    value: 220,
    color: '#409eff'
  }, {name: '中型企业', value: 100, color: '#67c23a'}, {
    name: '大型企业',
    value: 30,
    color: '#ff7d00'
  }]))
  industryChart = echarts.init(industryChartRef.value)
  industryChart.setOption(getDoublePieOption('行业分类', [{
    name: '制造业',
    value: 150,
    color: '#409eff'
  }, {name: '服务业', value: 120, color: '#67c23a'}, {name: '农业', value: 50, color: '#ff7d00'}, {
    name: '其他',
    value: 30,
    color: '#f56c6c'
  }]))
  townChart = echarts.init(townChartRef.value)
  townChart.setOption(getDoublePieOption('所属乡镇', [{name: '城关镇', value: 120, color: '#409eff'}, {
    name: '三甲集镇',
    value: 80,
    color: '#67c23a'
  }, {name: '祁家集镇', value: 70, color: '#ff7d00'}, {
    name: '其他乡镇',
    value: 80,
    color: '#f56c6c'
  }]))
  problemTypeTotalChart = echarts.init(problemTypeTotalChartRef.value)
  problemTypeTotalChart.setOption(getDoublePieOption('累计问题类型', [{
    name: '融资需求',
    value: 45,
    color: '#409eff'
  }, {name: '政策咨询', value: 35, color: '#67c23a'}, {name: '用工问题', value: 25, color: '#ff7d00'}, {
    name: '其他',
    value: 17,
    color: '#f56c6c'
  }]))
  problemStatusTotalChart = echarts.init(problemStatusTotalChartRef.value)
  problemStatusTotalChart.setOption(getDoublePieOption('累计办理状态', [{
    name: '已办结',
    value: 85,
    color: '#67c23a'
  }, {name: '办理中', value: 28, color: '#ff7d00'}, {name: '已受理', value: 7, color: '#409eff'}, {
    name: '暂无法办结',
    value: 2,
    color: '#f56c6c'
  }]))
  problemTypeMonthChart = echarts.init(problemTypeMonthChartRef.value)
  problemTypeMonthChart.setOption(getDoublePieOption('当月问题类型', [{
    name: '融资需求',
    value: 8,
    color: '#409eff'
  }, {name: '政策咨询', value: 6, color: '#67c23a'}, {name: '用工问题', value: 3, color: '#ff7d00'}, {
    name: '其他',
    value: 1,
    color: '#f56c6c'
  }]))
  problemStatusMonthChart = echarts.init(problemStatusMonthChartRef.value)
  problemStatusMonthChart.setOption(getDoublePieOption('当月办理状态', [{
    name: '已办结',
    value: 12,
    color: '#67c23a'
  }, {name: '办理中', value: 5, color: '#ff7d00'}, {
    name: '已受理',
    value: 1,
    color: '#409eff'
  }]))
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption(getTrendOption())
}

function startPolicyScroll() {
  if (!policyListRef.value) return
  let scrollTop = 0
  const itemHeight = 70
  const totalHeight = mockLatestPolicyList.length * itemHeight
  const visibleHeight = policyListRef.value.clientHeight
  if (totalHeight <= visibleHeight) return policyScrollTimer = setInterval(() => {
    scrollTop += 1
    if (scrollTop >= totalHeight - visibleHeight) {
      scrollTop = 0
    }
    policyListRef.value.scrollTop = scrollTop
  }, 50)
}

function stopPolicyScroll() {
  if (policyScrollTimer) {
    clearInterval(policyScrollTimer)
    policyScrollTimer = null
  }
}

function viewAllPolicy() {
  router.push('/policy/list')
}

onMounted(() => {
  initCharts()
  startPolicyScroll()
  window.addEventListener('resize', () => {
    enterpriseTypeChart?.resize()
    industryChart?.resize()
    townChart?.resize()
    problemTypeTotalChart?.resize()
    problemStatusTotalChart?.resize()
    problemTypeMonthChart?.resize()
    problemStatusMonthChart?.resize()
    trendChart?.resize()
  })
})
onUnmounted(() => {
  stopPolicyScroll()
  enterpriseTypeChart?.dispose()
  industryChart?.dispose()
  townChart?.dispose()
  problemTypeTotalChart?.dispose()
  problemStatusTotalChart?.dispose()
  problemTypeMonthChart?.dispose()
  problemStatusMonthChart?.dispose()
  trendChart?.dispose()
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

.stat-card {
  background: linear-gradient(135deg, #ffffff, #f9fbff);
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
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
}

.stat-icon.blue {
  background: linear-gradient(135deg, #5aa8ff, #3f8cff);
}

.stat-icon.green {
  background: linear-gradient(135deg, #7ed957, #4caf50);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #ffb74d, #ff9800);
}

.stat-icon.red {
  background: linear-gradient(135deg, #ff8a80, #f44336);
}

.pie-card,
.trend-card,
.policy-type-card,
.latest-policy-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.pie-card:hover,
.trend-card:hover,
.policy-type-card:hover,
.latest-policy-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

.pie-title,
.trend-title,
.policy-type-title,
.latest-policy-title {
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
}

.policy-type-item .count {
  color: #409eff;
  font-weight: 400;
}

.latest-policy-list {
  max-height: 360px;
  overflow: hidden;
}

.policy-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
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
}

.policy-tag.tax {
  background: #5aa8ff;
}

.policy-tag.subsidy {
  background: #b185db;
}

.policy-tag.person {
  background: #7ed957;
}

.policy-tag.finance {
  background: #ffb74d;
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
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  flex: 3;
  min-width: 500px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.trend-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 16px;
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
</style>