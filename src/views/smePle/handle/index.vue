<template>
  <div class="sme-package-handle-container">
    <!-- 筛选卡片 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline @submit.prevent="getList">
        <el-form-item label="办理状态" style="width: 200px">
          <el-select v-model="searchForm.processStatus" placeholder="请选择办理状态" clearable>
            <el-option label="受理中" value="HANDLING"></el-option>
            <el-option label="办理中" value="PROCESSING"></el-option>
            <el-option label="办结中" value="FINISHING"></el-option>
            <el-option label="完全办结" value="COMPLETED"></el-option>
            <el-option label="暂无法办结" value="UNABLE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="包抓领导">
          <el-input v-model="searchForm.leaderName" placeholder="请输入包抓领导姓名" clearable/>
        </el-form-item>
        <el-form-item label="企业名称">
          <el-input v-model="searchForm.enterpriseName" placeholder="请输入企业名称" clearable/>
        </el-form-item>
        <el-form-item label="专班班长">
          <el-input v-model="searchForm.classMonitor" placeholder="请输入专班班长姓名" clearable/>
        </el-form-item>
        <el-form-item label="专班负责单位">
          <el-input v-model="searchForm.classDeptName" placeholder="请输入专班负责单位名称" clearable/>
        </el-form-item>
        <el-form-item label="问题类型" style="width: 200px">
          <el-select v-model="searchForm.problemType" placeholder="请选择问题类型" clearable>
            <el-option
                v-for="item in problemTypeList"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getList">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
          <el-button
              type="primary"
              icon="Plus"
              @click="handleAddPackageContact"
          >
            新增包抓联问题
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表卡片 -->
    <el-card class="list-card" shadow="never">
      <el-table
          :data="packageContactList"
          v-loading="loading"
          border
          stripe
          style="width: 100%; margin-top: 20px; font-size: 12px;"
          :default-sort="{prop: 'updateTime', order: 'descending'}"
      >
        <!-- 序号列 -->
        <el-table-column
            label="序号"
            align="center"
            width="50"
            type="index"
            :index="(index) => (pageNum - 1) * pageSize + index + 1"
        />
        <!-- 问题编号 -->
        <el-table-column
            prop="packageNo"
            label="问题编号"
            align="center"
            width="110"
        >
          <template #default="{ row }">
            {{ row.packageNo || '-' }}
          </template>
        </el-table-column>
        <!-- 包联企业反映的问题（点击弹窗查看全部） -->
        <el-table-column
            prop="enterpriseProblem"
            label="企业反映的问题"
            align="center"
            min-width="170"
        >
          <template #default="{ row }">
            <div
                class="problem-content"
                @click="handleShowFullProblem(row)"
                v-if="row.enterpriseProblem && row.enterpriseProblem.length > 10"
            >
              {{ row.enterpriseProblem.substring(0, 10) }}...
            </div>
            <div v-else>
              {{ row.enterpriseProblem || '-' }}
            </div>
          </template>
        </el-table-column>
        <!-- 包抓领导 -->
        <el-table-column
            prop="leaderName"
            label="包抓领导"
            align="center"
            min-width="80"
        >
          <template #default="{ row }">
            {{ row.leaderName || '-' }}
          </template>
        </el-table-column>
        <!-- 企业名称 -->
        <el-table-column
            prop="enterpriseName"
            label="企业名称"
            align="center"
            min-width="150"
        >
          <template #default="{ row }">
            {{ row.enterpriseName || '-' }}
          </template>
        </el-table-column>
        <!-- 企业负责人 -->
        <el-table-column
            prop="enterpriseLeader"
            label="企业负责人"
            align="center"
            min-width="80"
        >
          <template #default="{ row }">
            {{ row.enterpriseLeader || '-' }}
          </template>
        </el-table-column>
        <!-- 企业联系电话 -->
        <el-table-column
            prop="enterprisePhone"
            label="企业联系电话"
            align="center"
            min-width="100"
        >
          <template #default="{ row }">
            {{ row.enterprisePhone || '-' }}
          </template>
        </el-table-column>
        <!-- 专班负责单位 -->
        <el-table-column
            prop="classDeptName"
            label="专班负责单位"
            align="center"
            min-width="100"
        >
          <template #default="{ row }">
            {{ row.classDeptName || '-' }}
          </template>
        </el-table-column>
        <!-- 专班班长 -->
        <el-table-column
            prop="classMonitor"
            label="专班班长"
            align="center"
            min-width="80"
        >
          <template #default="{ row }">
            {{ row.classMonitor || '-' }}
          </template>
        </el-table-column>
        <!-- 专班班长联系电话 -->
        <el-table-column
            prop="classPhone"
            label="班长联系电话"
            align="center"
            min-width="100"
        >
          <template #default="{ row }">
            {{ row.classPhone || '-' }}
          </template>
        </el-table-column>
        <!-- 问题类型（显示字典标签） -->
        <el-table-column
            prop="problemType"
            label="问题类型"
            align="center"
            min-width="100"
        >
          <template #default="{ row }">
            <el-tag type="primary" size="small">
              {{ getProblemTypeName(row.problemType) || row.problemType }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 办理状态（添加点击事件） -->
        <el-table-column
            prop="processStatus"
            label="办理状态"
            align="center"
            width="105"
        >
          <template #default="{ row }">
            <el-tag
                v-if="normalizeStatus(row.processStatus) === 'HANDLING'"
                type="warning"
                size="small"
                @click="handleViewProcess(row)"
                style="cursor: pointer;"
            >受理中
            </el-tag>
            <el-tag
                v-else-if="normalizeStatus(row.processStatus) === 'PROCESSING'"
                type="primary"
                size="small"
                @click="handleViewProcess(row)"
                style="cursor: pointer;"
            >办理中
            </el-tag>
            <el-tag
                v-else-if="normalizeStatus(row.processStatus) === 'FINISHING'"
                type="info"
                size="small"
                @click="handleViewProcess(row)"
                style="cursor: pointer;"
            >办结中
            </el-tag>
            <el-tag
                v-else-if="normalizeStatus(row.processStatus) === 'COMPLETED'"
                type="success"
                size="small"
                @click="handleViewProcess(row)"
                style="cursor: pointer;"
            >完全办结
            </el-tag>
            <el-tag
                v-else
                type="danger"
                size="small"
                @click="handleViewProcess(row)"
                style="cursor: pointer;"
            >暂无法办结
            </el-tag>
          </template>
        </el-table-column>
        <!-- 问题接收时间 -->
        <el-table-column
            prop="problemReceiveTime"
            label="接收时间"
            align="center"
            min-width="100"
        >
          <template #default="{ row }">
            {{ row.problemReceiveTime ? formatDate(row.problemReceiveTime) : '-' }}
          </template>
        </el-table-column>
        <!-- 更新时间 -->
        <el-table-column
            prop="updateTime"
            label="更新时间"
            align="center"
            min-width="100"
        >
          <template #default="{ row }">
            {{ row.updateTime ? formatDate(row.updateTime) : '-' }}
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template #default="{ row }">
            <!-- 办理进度按钮 -->
            <el-button
                link
                type="primary"
                icon="Clock"
                size="small"
                @click="handleViewProcess(row)"
                title="查看办理进度">
              办理进度
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination"
          style="margin-top: 20px; text-align: right; font-size: 13px;"
      />
    </el-card>

    <!-- 查看全部问题内容弹窗 -->
    <el-dialog
        v-model="fullProblemDialogVisible"
        title="企业反映的问题详情"
        width="700px"
        append-to-body
        destroy-on-close
    >
      <div style="white-space: pre-wrap; word-break: break-all; font-size: 13px;">
        {{ fullProblemContent }}
      </div>
      <template #footer>
        <el-button @click="fullProblemDialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增包抓联问题弹窗 -->
    <el-dialog
        v-model="addPackageContactDialogVisible"
        title="新增包抓联问题"
        width="800px"
        destroy-on-close
        style="font-size: 13px;"
    >
      <el-form :model="packageContactForm" label-width="120px" ref="packageContactFormRef" :rules="packageContactRules"
               style="font-size: 13px;">
        <!-- 问题编号：禁用，系统自动生成 -->
        <el-form-item label="问题编号" prop="packageNo">
          <el-input
              v-model="packageContactForm.packageNo"
              placeholder="系统自动生成"
              style="font-size: 13px;"
              disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="办理状态" prop="processStatus">
          <el-select v-model="packageContactForm.processStatus" placeholder="请选择办理状态" style="font-size: 13px;"
                     disabled>
            <el-option label="受理中" value="HANDLING"></el-option>
          </el-select>
        </el-form-item>
        <!-- 企业选择下拉框（远程搜索） -->
        <el-form-item label="企业名称" prop="enterpriseId">
          <el-select
              v-model="packageContactForm.enterpriseId"
              placeholder="请选择企业"
              style="width: 100%; font-size: 13px;"
              @change="handleEnterpriseChange"
              filterable
              remote
              :remote-method="remoteSearchEnterprise"
              :loading="enterpriseLoading"
          >
            <el-option
                v-for="item in enterpriseList"
                :key="item.id"
                :label="item.enterpriseName"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
        <!-- 包抓领导：自动填充，禁用 -->
        <el-form-item label="包抓领导" prop="leaderName">
          <el-input
              v-model="packageContactForm.leaderName"
              placeholder="选择企业后自动填充"
              style="font-size: 13px;"
              readonly
              disabled
          ></el-input>
        </el-form-item>
        <!-- 企业全称：自动填充，禁用 -->
        <el-form-item label="企业全称" prop="enterpriseName">
          <el-input
              v-model="packageContactForm.enterpriseName"
              placeholder="选择企业后自动填充"
              style="font-size: 13px;"
              readonly
              disabled
          ></el-input>
        </el-form-item>
        <!-- 企业负责人：自动填充，禁用 -->
        <el-form-item label="企业负责人" prop="enterpriseLeader">
          <el-input
              v-model="packageContactForm.enterpriseLeader"
              placeholder="选择企业后自动填充"
              style="font-size: 13px;"
              readonly
              disabled
          ></el-input>
        </el-form-item>
        <!-- 企业联系电话：自动填充，禁用 -->
        <el-form-item label="企业联系电话" prop="enterprisePhone">
          <el-input
              v-model="packageContactForm.enterprisePhone"
              placeholder="选择企业后自动填充"
              style="font-size: 13px;"
              readonly
              disabled
          ></el-input>
        </el-form-item>
        <!-- 专班班长：自动填充，禁用 -->
        <el-form-item label="专班班长" prop="classMonitor">
          <el-input
              v-model="packageContactForm.classMonitor"
              placeholder="选择企业后自动填充"
              style="font-size: 13px;"
              readonly
              disabled
          ></el-input>
        </el-form-item>
        <!-- 专班负责单位：自动填充，禁用 -->
        <el-form-item label="专班负责单位" prop="classDeptName">
          <el-input
              v-model="packageContactForm.classDeptName"
              placeholder="选择企业后自动填充"
              style="font-size: 13px;"
              readonly
              disabled
          ></el-input>
        </el-form-item>
        <!-- 专班班长联系电话：自动填充，禁用 -->
        <el-form-item label="专班班长联系电话" prop="classPhone">
          <el-input
              v-model="packageContactForm.classPhone"
              placeholder="选择企业后自动填充"
              style="font-size: 13px;"
              readonly
              disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="企业反映的问题" prop="enterpriseProblem">
          <el-input
              v-model="packageContactForm.enterpriseProblem"
              placeholder="请输入企业反映的问题"
              type="textarea"
              :rows="5"
              style="font-size: 13px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="问题接收时间" prop="problemReceiveTime">
          <el-date-picker
              v-model="packageContactForm.problemReceiveTime"
              type="datetime"
              placeholder="请选择问题接收时间"
              style="width: 100%; font-size: 13px;"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              default-time="12:00:00"
              :locale="zhCn"
              :default-value="new Date()"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="问题类型" prop="problemType">
          <el-select v-model="packageContactForm.problemType" placeholder="请选择问题类型" style="font-size: 13px;">
            <el-option
                v-for="item in problemTypeList"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
              v-model="packageContactForm.remark"
              placeholder="请输入备注信息"
              type="textarea"
              :rows="3"
              style="font-size: 13px;"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addPackageContactDialogVisible = false" style="font-size: 13px;">取 消</el-button>
        <el-button type="primary" @click="submitPackageContactForm" style="font-size: 13px;">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, onUnmounted} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {formatDate} from '@/utils/dateUtil'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import request from '@/utils/request'

// 引入API - 修正导入路径
import {
  pagePackageContact,
  addPackageContact,
  getSmeLpeByEnterpriseId
} from '@/api/smeple'
import {listDictItemByDictCode} from '@/api/dictItem'
import {pageEnterprise, getEnterpriseById} from '@/api/enterprise'

// 路由
const router = useRouter()

// ========== 分页配置 ==========
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)

// ========== 数据存储 ==========
const packageContactList = ref([])
const problemTypeList = ref([])
const fullProblemDialogVisible = ref(false)
const fullProblemContent = ref('')
const enterpriseList = ref([])
const enterpriseLoading = ref(false)
let enterpriseSearchTimer = null

// ========== 弹窗控制 ==========
const addPackageContactDialogVisible = ref(false)

// ========== 表单引用 ==========
const packageContactFormRef = ref(null)

// ========== 筛选表单 ==========
const searchForm = reactive({
  processStatus: '',
  leaderName: '',
  enterpriseName: '',
  classMonitor: '',
  classDeptName: '',
  problemType: ''
})

// ========== 新增问题表单 ==========
const packageContactForm = reactive({
  packageNo: '',
  processStatus: 'HANDLING', // 新增默认受理中
  leaderName: '',
  enterpriseId: '',
  enterpriseName: '',
  enterpriseLeader: '',
  enterprisePhone: '',
  classMonitor: '',
  classDeptName: '',
  classPhone: '',
  enterpriseProblem: '',
  problemReceiveTime: '',
  problemType: '',
  remark: ''
})

// ========== 表单校验规则 ==========
const packageContactRules = reactive({
  enterpriseId: [{required: true, message: '请选择企业', trigger: 'change'}],
  enterpriseProblem: [{required: true, message: '请输入企业反映的问题', trigger: 'blur'}],
  problemReceiveTime: [{required: true, message: '请选择问题接收时间', trigger: 'change'}],
  problemType: [{required: true, message: '请选择问题类型', trigger: 'change'}]
})

// ========== 企业远程搜索 ==========
const remoteSearchEnterprise = (query) => {
  if (enterpriseSearchTimer) clearTimeout(enterpriseSearchTimer)
  enterpriseSearchTimer = setTimeout(async () => {
    try {
      enterpriseLoading.value = true
      const res = await pageEnterprise({
        pageNum: 1,
        pageSize: 50,
        enterpriseName: query || ''
      })
      enterpriseList.value = res.data?.records || []
    } catch (e) {
      console.error('企业搜索失败：', e)
      ElMessage.error('加载企业列表失败')
      enterpriseList.value = []
    } finally {
      enterpriseLoading.value = false
    }
  }, 300)
}

// ========== 企业选择变更 ==========
const handleEnterpriseChange = async (enterpriseId) => {
  if (!enterpriseId) {
    Object.assign(packageContactForm, {
      leaderName: '', enterpriseName: '', enterpriseLeader: '', enterprisePhone: '',
      classMonitor: '', classDeptName: '', classPhone: ''
    })
    return
  }
  try {
    const enterpriseRes = await getEnterpriseById(enterpriseId)
    if (enterpriseRes.code === 200 && enterpriseRes.data) {
      packageContactForm.enterpriseName = enterpriseRes.data.enterpriseName || ''
      packageContactForm.enterpriseLeader = enterpriseRes.data.legalPerson || ''
      packageContactForm.enterprisePhone = enterpriseRes.data.phone || ''
    }
    const smeLpeRes = await getSmeLpeByEnterpriseId(enterpriseId)
    if (smeLpeRes.code === 200 && smeLpeRes.data) {
      packageContactForm.leaderName = smeLpeRes.data.leaderName || ''
      packageContactForm.classMonitor = smeLpeRes.data.classMonitor || ''
      packageContactForm.classDeptName = smeLpeRes.data.classDeptName || ''
      packageContactForm.classPhone = smeLpeRes.data.classPhone || ''
    } else {
      ElMessage.warning('该企业暂无包抓联配置，请先配置后再新增问题')
      packageContactForm.enterpriseId = ''
    }
  } catch (e) {
    console.error('获取企业关联信息失败：', e)
    ElMessage.error('获取企业关联信息失败')
    packageContactForm.enterpriseId = ''
  }
}

// ========== 查看完整问题内容 ==========
const handleShowFullProblem = (row) => {
  fullProblemContent.value = row.enterpriseProblem || '-'
  fullProblemDialogVisible.value = true
}

// ========== 获取问题类型字典 ==========
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

// ========== 字典值转换 ==========
const getProblemTypeName = (code) => {
  if (!code) return ''
  const item = problemTypeList.value.find(item => item.itemCode === code)
  return item ? item.itemName : code
}

// ========== 查询问题列表 ==========
const getList = async () => {
  loading.value = true
  try {
    const queryParams = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      ...(searchForm.processStatus && {processStatus: searchForm.processStatus}),
      ...(searchForm.leaderName && {leaderName: searchForm.leaderName}),
      ...(searchForm.enterpriseName && {enterpriseName: searchForm.enterpriseName}),
      ...(searchForm.classMonitor && {classMonitor: searchForm.classMonitor}),
      ...(searchForm.classDeptName && {classDeptName: searchForm.classDeptName}),
      ...(searchForm.problemType && {problemType: searchForm.problemType})
    }
    const res = await pagePackageContact(queryParams)
    if (res.code === 200 && res.data) {
      packageContactList.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      packageContactList.value = []
      total.value = 0
      ElMessage.warning('暂无包抓联问题数据')
    }
  } catch (e) {
    console.error('查询问题列表失败：', e)
    ElMessage.error('查询失败，请刷新页面重试')
    packageContactList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ========== 分页事件处理 ==========
const handleSizeChange = (val) => {
  pageSize.value = val
  getList()
}

const handleCurrentChange = (val) => {
  pageNum.value = val
  getList()
}

// ========== 重置筛选表单 ==========
const resetSearch = () => {
  Object.assign(searchForm, {
    processStatus: '',
    leaderName: '',
    enterpriseName: '',
    classMonitor: '',
    classDeptName: '',
    problemType: ''
  })
  getList()
}

// 状态标准化：兼容后端UNHANDLED（未处理）映射为HANDLING（受理中）
const normalizeStatus = (status) => {
  if (status === 'UNHANDLED') return 'HANDLING'
  return status
}

// ========== 查看办理进度（跳转到详情页） ==========
const handleViewProcess = (row) => {
  router.push({
    path: '/smeple/handle/detail',
    query: { id: row.id }
  })
}

// ========== 打开新增问题弹窗 ==========
const handleAddPackageContact = () => {
  packageContactFormRef.value?.resetFields()
  Object.assign(packageContactForm, {
    packageNo: '',
    processStatus: 'HANDLING', // 新增默认受理中
    leaderName: '',
    enterpriseId: '',
    enterpriseName: '',
    enterpriseLeader: '',
    enterprisePhone: '',
    classMonitor: '',
    classDeptName: '',
    classPhone: '',
    enterpriseProblem: '',
    problemReceiveTime: '',
    problemType: '',
    remark: ''
  })
  addPackageContactDialogVisible.value = true
}

// ========== 提交新增问题 ==========
const submitPackageContactForm = async () => {
  try {
    await packageContactFormRef.value.validate()
    const submitData = {...packageContactForm}
    delete submitData.packageNo
    delete submitData.leaderName
    delete submitData.enterpriseName
    delete submitData.enterpriseLeader
    delete submitData.enterprisePhone
    delete submitData.classMonitor
    delete submitData.classDeptName
    delete submitData.classPhone
    const res = await addPackageContact(submitData)
    if (res.code === 200) {
      ElMessage.success('新增包抓联问题成功')
      addPackageContactDialogVisible.value = false
      getList()
    } else {
      ElMessage.error('新增失败：' + (res.msg || '未知错误'))
    }
  } catch (e) {
    if (e.name !== 'ValidationError') {
      console.error('新增问题失败：', e)
      ElMessage.error('新增问题失败，请重试')
    }
  }
}

// ========== 初始化 ==========
onMounted(async () => {
  await getProblemTypeList()
  await getList()
})

// ========== 清理定时器 ==========
onUnmounted(() => {
  if (enterpriseSearchTimer) clearTimeout(enterpriseSearchTimer)
})
</script>

<style scoped>
.sme-package-handle-container {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.filter-card {
  margin-bottom: 20px;
  background-color: #fff;
}

.list-card {
  background-color: #fff;
}

.problem-content {
  cursor: pointer;
  color: #409eff;
}

.pagination {
  margin-top: 15px;
  text-align: right;
}
</style>