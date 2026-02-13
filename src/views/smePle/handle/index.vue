<template>
  <div class="sme-package-handle-container">
    <!-- 筛选卡片 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline @submit.prevent="getList">
        <el-form-item label="流程状态" style="width: 200px">
          <el-select v-model="searchForm.processStatus" placeholder="请选择流程状态" clearable>
            <el-option label="未受理" value="UNHANDLED"></el-option>
            <el-option label="办理中" value="HANDLING"></el-option>
            <el-option label="已办结" value="COMPLETED"></el-option>
            <el-option label="无法办理" value="UNABLE"></el-option>
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
          style="width: 100%; margin-top: 20px; font-size: 13px;"
          :default-sort="{prop: 'updateTime', order: 'descending'}"
      >
        <!-- 序号列 -->
        <el-table-column
            label="序号"
            align="center"
            width="80"
            type="index"
            :index="(index) => (pageNum - 1) * pageSize + index + 1"
        />
        <!-- 包抓联编号 -->
        <el-table-column
            prop="packageNo"
            label="包抓联编号"
            align="center"
            min-width="150"
        >
          <template #default="{ row }">
            {{ row.packageNo || '-' }}
          </template>
        </el-table-column>
        <!-- 包联企业反映的问题（修改为点击弹窗查看全部） -->
        <el-table-column
            prop="enterpriseProblem"
            label="包联企业反映的问题"
            align="center"
            min-width="200"
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
            min-width="100"
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
            min-width="100"
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
            min-width="120"
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
            min-width="150"
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
            min-width="100"
        >
          <template #default="{ row }">
            {{ row.classMonitor || '-' }}
          </template>
        </el-table-column>
        <!-- 专班班长联系电话 -->
        <el-table-column
            prop="classPhone"
            label="专班班长联系电话"
            align="center"
            min-width="120"
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
        <!-- 流程状态 -->
        <el-table-column
            prop="processStatus"
            label="流程状态"
            align="center"
            min-width="100"
        >
          <template #default="{ row }">
            <el-tag v-if="row.processStatus === 'UNHANDLED'" type="info" size="small">未受理</el-tag>
            <el-tag v-else-if="row.processStatus === 'HANDLING'" type="warning" size="small">办理中</el-tag>
            <el-tag v-else-if="row.processStatus === 'COMPLETED'" type="success" size="small">已办结</el-tag>
            <el-tag v-else type="danger" size="small">无法办理</el-tag>
          </template>
        </el-table-column>
        <!-- 问题接收时间 -->
        <el-table-column
            prop="problemReceiveTime"
            label="问题接收时间"
            align="center"
            min-width="180"
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
            min-width="180"
        >
          <template #default="{ row }">
            {{ row.updateTime ? formatDate(row.updateTime) : '-' }}
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" align="center" width="200">
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
            <!-- 状态更新按钮 -->
            <el-button
                link
                type="success"
                icon="Edit"
                size="small"
                @click="handleUpdateStatus(row)"
                title="更新办理状态">
              更新状态
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

    <!-- 办理进度弹窗 -->
    <el-dialog
        v-model="processDialogVisible"
        title="问题办理进度详情"
        width="900px"
        destroy-on-close
        append-to-body
        style="font-size: 13px;"
    >
      <div v-if="currentPackageContact" class="process-detail">
        <!-- 基础信息 -->
        <el-descriptions :column="2" border style="margin-bottom: 20px; font-size: 13px;">
          <el-descriptions-item label="包抓联编号">{{ currentPackageContact.packageNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="企业名称">{{ currentPackageContact.enterpriseName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="包抓领导">{{ currentPackageContact.leaderName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="专班负责单位">{{ currentPackageContact.classDeptName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="问题类型">
            <el-tag type="primary" size="small">
              {{ getProblemTypeName(currentPackageContact.problemType) || currentPackageContact.problemType }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="流程状态">
            <el-tag v-if="currentPackageContact.processStatus === 'UNHANDLED'" type="info" size="small">未受理</el-tag>
            <el-tag v-else-if="currentPackageContact.processStatus === 'HANDLING'" type="warning" size="small">办理中</el-tag>
            <el-tag v-else-if="currentPackageContact.processStatus === 'COMPLETED'" type="success" size="small">已办结</el-tag>
            <el-tag v-else type="danger" size="small">无法办理</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="问题接收时间" :span="2">
            {{ currentPackageContact.problemReceiveTime ? formatDate(currentPackageContact.problemReceiveTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="企业反映的问题" :span="2">
            <div style="white-space: pre-wrap; word-break: break-all;">{{ currentPackageContact.enterpriseProblem || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="无法办理说明" v-if="currentPackageContact.processStatus === 'UNABLE'" :span="2">
            {{ currentPackageContact.unableReason || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="办结时间" v-if="currentPackageContact.processStatus === 'COMPLETED'" :span="2">
            {{ currentPackageContact.completeTime ? formatDate(currentPackageContact.completeTime) : '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 办理进度条 -->
        <div class="process-progress" style="margin: 30px 0;">
          <h4 style="margin-bottom: 15px; font-size: 13px;">办理进度</h4>
          <el-steps :active="getProcessStep()" finish-status="success" align-center style="font-size: 13px;">
            <el-step title="问题接收" description="已接收企业反馈问题"></el-step>
            <el-step title="办理中" description="正在处理企业问题"></el-step>
            <el-step title="办理完成" description="问题已办结"></el-step>
          </el-steps>
        </div>

        <!-- 办理记录列表 -->
        <div class="process-record-list">
          <h4 style="margin-bottom: 15px; font-size: 13px;">办理记录</h4>
          <el-table
              :data="handleRecordList"
              border
              stripe
              style="width: 100%; margin-bottom: 20px; font-size: 13px;"
              v-loading="recordLoading"
          >
            <el-table-column
                label="序号"
                align="center"
                width="80"
                type="index"
            />
            <el-table-column
                prop="handleLeader"
                label="办理领导"
                align="center"
                min-width="100"
            />
            <el-table-column
                prop="handleTime"
                label="办理时间"
                align="center"
                min-width="180"
            >
              <template #default="{ row }">
                {{ row.handleTime ? formatDate(row.handleTime) : '-' }}
              </template>
            </el-table-column>
            <el-table-column
                prop="handleType"
                label="办理类型"
                align="center"
                min-width="100"
            >
              <template #default="{ row }">
                <el-tag type="primary" size="small">{{ row.handleType || '-' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
                prop="handleContent"
                label="办理内容"
                align="center"
                min-width="200"
                show-overflow-tooltip
            />
            <el-table-column
                label="操作"
                align="center"
                width="120"
            >
              <template #default="{ row }">
                <el-button
                    link
                    type="primary"
                    icon="Edit"
                    size="small"
                    @click="handleEditRecord(row)"
                >
                  编辑
                </el-button>
                <el-button
                    link
                    type="danger"
                    icon="Delete"
                    size="small"
                    @click="handleDeleteRecord(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 新增办理记录按钮（仅办理中状态显示） -->
          <el-button
              v-if="currentPackageContact.processStatus === 'HANDLING'"
              type="primary"
              icon="Plus"
              @click="handleAddRecord"
              style="margin-bottom: 10px; font-size: 13px;"
          >
            新增办理记录
          </el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="processDialogVisible = false" style="font-size: 13px;">关 闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑办理记录弹窗 -->
    <el-dialog
        v-model="recordDialogVisible"
        :title="recordDialogTitle"
        width="700px"
        destroy-on-close
        style="font-size: 13px;"
    >
      <el-form :model="recordForm" label-width="120px" ref="recordFormRef" :rules="recordRules" style="font-size: 13px;">
        <el-form-item label="办理领导" prop="handleLeader">
          <el-input v-model="recordForm.handleLeader" placeholder="请输入本次办理领导姓名" style="font-size: 13px;"></el-input>
        </el-form-item>
        <el-form-item label="办理类型" prop="handleType">
          <el-select v-model="recordForm.handleType" placeholder="请选择办理类型" style="font-size: 13px;">
            <el-option label="跟进" value="FOLLOW"></el-option>
            <el-option label="沟通" value="COMMUNICATE"></el-option>
            <el-option label="提交材料" value="SUBMIT"></el-option>
            <el-option label="回复企业" value="REPLY"></el-option>
            <el-option label="其他" value="OTHER"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="办理内容" prop="handleContent">
          <el-input
              v-model="recordForm.handleContent"
              placeholder="请输入本次办理内容/跟进情况"
              type="textarea"
              :rows="5"
              style="font-size: 13px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="附件URL">
          <el-input v-model="recordForm.attachUrl" placeholder="多个附件用逗号分隔" style="font-size: 13px;"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false" style="font-size: 13px;">取 消</el-button>
        <el-button type="primary" @click="submitRecordForm" style="font-size: 13px;">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 更新办理状态弹窗 -->
    <el-dialog
        v-model="statusDialogVisible"
        title="更新办理状态"
        width="600px"
        destroy-on-close
        style="font-size: 13px;"
    >
      <el-form :model="statusForm" label-width="120px" ref="statusFormRef" :rules="statusRules" style="font-size: 13px;">
        <el-form-item label="流程状态" prop="processStatus">
          <el-select v-model="statusForm.processStatus" placeholder="请选择流程状态" style="font-size: 13px;">
            <el-option label="未受理" value="UNHANDLED"></el-option>
            <el-option label="办理中" value="HANDLING"></el-option>
            <el-option label="已办结" value="COMPLETED"></el-option>
            <el-option label="无法办理" value="UNABLE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
            label="无法办理说明"
            prop="unableReason"
            v-if="statusForm.processStatus === 'UNABLE'"
        >
          <el-input
              v-model="statusForm.unableReason"
              placeholder="请输入无法办理的原因"
              type="textarea"
              :rows="3"
              style="font-size: 13px;"
          ></el-input>
        </el-form-item>
        <el-form-item
            label="办结时间"
            prop="completeTime"
            v-if="statusForm.processStatus === 'COMPLETED'"
        >
          <el-date-picker
              v-model="statusForm.completeTime"
              type="datetime"
              placeholder="请选择办结时间"
              style="width: 100%; font-size: 13px;"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false" style="font-size: 13px;">取 消</el-button>
        <el-button type="primary" @click="submitStatusForm" style="font-size: 13px;">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 新增：查看全部问题内容弹窗 -->
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
  </div>
</template>

<script setup>
/**
 * 包抓联问题办理页面
 * 功能：分页查询问题列表、查看办理进度、新增/编辑/删除办理记录、更新办理状态
 * 依赖：Element Plus、自定义request、日期格式化工具
 */
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/dateUtil'
// 引入问题办理API（路径改为/api/handle）
import {
  pagePackageContact,
  getPackageContactById,
  listHandleRecord,
  addHandleRecord,
  updateHandleRecord,
  deleteHandleRecord,
  updateProcessStatus
} from '@/api/handle'
// 引入字典相关API（适配实际项目的字典接口）
import { listDictItemByDictCode } from '@/api/dictItem'

// ========== 分页相关 ==========
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)

// ========== 数据存储 ==========
const packageContactList = ref([])
const currentPackageContact = ref(null) // 当前选中的问题记录
const handleRecordList = ref([]) // 办理记录列表
const recordLoading = ref(false)
const problemTypeList = ref([]) // 仅存储问题类型字典项
const fullProblemDialogVisible = ref(false) // 新增：查看全部问题弹窗控制
const fullProblemContent = ref('') // 新增：弹窗中显示的完整问题内容

// ========== 弹窗控制 ==========
const processDialogVisible = ref(false) // 办理进度弹窗
const recordDialogVisible = ref(false) // 办理记录弹窗
const statusDialogVisible = ref(false) // 状态更新弹窗
const recordDialogTitle = ref('') // 办理记录弹窗标题

// ========== 表单引用 ==========
const recordFormRef = ref(null)
const statusFormRef = ref(null)

// ========== 筛选表单 ==========
const searchForm = reactive({
  processStatus: '',
  leaderName: '',
  enterpriseName: '',
  classMonitor: '',
  classDeptName: '',
  problemType: ''
})

// ========== 办理记录表单 ==========
const recordForm = reactive({
  id: undefined,
  packageId: '',
  handleLeader: '',
  handleType: '',
  handleContent: '',
  attachUrl: ''
})

// ========== 状态更新表单 ==========
const statusForm = reactive({
  id: '',
  processStatus: '',
  completeTime: '',
  unableReason: ''
})

// ========== 表单校验规则 ==========
const recordRules = reactive({
  handleLeader: [
    { required: true, message: '请输入办理领导姓名', trigger: 'blur' }
  ],
  handleType: [
    { required: true, message: '请选择办理类型', trigger: 'change' }
  ],
  handleContent: [
    { required: true, message: '请输入办理内容', trigger: 'blur' }
  ]
})

const statusRules = reactive({
  processStatus: [
    { required: true, message: '请选择流程状态', trigger: 'change' }
  ],
  unableReason: [
    { required: true, message: '请输入无法办理说明', trigger: 'blur' }
  ],
  completeTime: [
    { required: true, message: '请选择办结时间', trigger: 'change' }
  ]
})

// ========== 新增：点击查看全部问题内容 ==========
const handleShowFullProblem = (row) => {
  fullProblemContent.value = row.enterpriseProblem || '-'
  fullProblemDialogVisible.value = true
}

// ========== 修复：使用项目实际的字典项接口获取问题类型 ==========
const getProblemTypeList = async () => {
  try {
    // 直接调用项目中已实现的：根据字典编码获取字典项列表接口
    const res = await listDictItemByDictCode('package_problem_type')

    if (res.code === 200 && res.data) {
      // 适配返回格式（根据你字典项接口的实际返回结构）
      problemTypeList.value = Array.isArray(res.data) ? res.data : (res.data.records || [])
      console.log('加载的问题类型字典项:', problemTypeList.value)
    } else {
      ElMessage.warning('未查询到问题类型字典项，请检查字典配置')
      problemTypeList.value = []
    }
  } catch (e) {
    console.error('加载问题类型字典失败：', e)
    ElMessage.error('加载问题类型字典失败')
    problemTypeList.value = []
  }
}

// ========== 根据编码获取问题类型名称 ==========
const getProblemTypeName = (code) => {
  if (!code) return ''
  const item = problemTypeList.value.find(item => item.itemCode === code)
  return item ? item.itemName : code
}

// ========== 核心方法 - 获取问题列表 ==========
const getList = async () => {
  loading.value = true
  try {
    const queryParams = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      ...(searchForm.processStatus && { processStatus: searchForm.processStatus }),
      ...(searchForm.leaderName && { leaderName: searchForm.leaderName }),
      ...(searchForm.enterpriseName && { enterpriseName: searchForm.enterpriseName }),
      ...(searchForm.classMonitor && { classMonitor: searchForm.classMonitor }),
      ...(searchForm.classDeptName && { classDeptName: searchForm.classDeptName }),
      ...(searchForm.problemType && { problemType: searchForm.problemType })
    }

    const res = await pagePackageContact(queryParams)
    if (res.code === 200 && res.data) {
      packageContactList.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      packageContactList.value = []
      total.value = 0
      ElMessage.warning('暂无问题办理数据')
    }
  } catch (e) {
    console.error('加载问题办理列表失败：', e)
    ElMessage.error('加载问题办理列表失败，请刷新页面重试')
    packageContactList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ========== 查看办理进度 ==========
const handleViewProcess = async (row) => {
  try {
    // 获取问题详情
    const res = await getPackageContactById(row.id)
    if (res.code === 200 && res.data) {
      currentPackageContact.value = res.data
      // 获取办理记录
      await getHandleRecordList(row.id)
      processDialogVisible.value = true
    } else {
      ElMessage.error('获取问题详情失败')
    }
  } catch (e) {
    console.error('获取问题详情失败：', e)
    ElMessage.error('获取问题详情失败')
  }
}

// ========== 获取办理记录列表 ==========
const getHandleRecordList = async (packageId) => {
  recordLoading.value = true
  try {
    const res = await listHandleRecord(packageId)
    if (res.code === 200 && res.data) {
      handleRecordList.value = res.data || []
    } else {
      handleRecordList.value = []
    }
  } catch (e) {
    console.error('加载办理记录失败：', e)
    ElMessage.error('加载办理记录失败')
    handleRecordList.value = []
  } finally {
    recordLoading.value = false
  }
}

// ========== 新增办理记录 ==========
const handleAddRecord = () => {
  recordFormRef.value?.resetFields()
  Object.assign(recordForm, {
    id: undefined,
    packageId: currentPackageContact.value.id,
    handleLeader: '',
    handleType: '',
    handleContent: '',
    attachUrl: ''
  })
  recordDialogTitle.value = '新增办理记录'
  recordDialogVisible.value = true
}

// ========== 编辑办理记录 ==========
const handleEditRecord = (row) => {
  recordFormRef.value?.resetFields()
  Object.assign(recordForm, {
    id: row.id,
    packageId: row.packageId,
    handleLeader: row.handleLeader || '',
    handleType: row.handleType || '',
    handleContent: row.handleContent || '',
    attachUrl: row.attachUrl || ''
  })
  recordDialogTitle.value = '编辑办理记录'
  recordDialogVisible.value = true
}

// ========== 删除办理记录 ==========
const handleDeleteRecord = (row) => {
  ElMessageBox.confirm(
      `确定要删除该办理记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true
      }
  ).then(async () => {
    try {
      const res = await deleteHandleRecord(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        await getHandleRecordList(row.packageId)
      } else {
        ElMessage.error('删除失败：' + (res.msg || '未知错误'))
      }
    } catch (e) {
      console.error('删除办理记录失败：', e)
      ElMessage.error('删除失败，请重试')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// ========== 提交办理记录 ==========
const submitRecordForm = async () => {
  try {
    await recordFormRef.value.validate()
    let res
    if (recordForm.id) {
      res = await updateHandleRecord(recordForm)
    } else {
      res = await addHandleRecord(recordForm)
    }
    if (res.code === 200) {
      ElMessage.success(recordForm.id ? '修改成功' : '新增成功')
      recordDialogVisible.value = false
      await getHandleRecordList(recordForm.packageId)
    } else {
      ElMessage.error(recordForm.id ? '修改失败' : '新增失败' + (res.msg || ''))
    }
  } catch (e) {
    if (e.name !== 'ValidationError') {
      console.error('保存办理记录失败：', e)
      ElMessage.error('保存失败，请重试')
    }
  }
}

// ========== 更新办理状态 ==========
const handleUpdateStatus = (row) => {
  statusFormRef.value?.resetFields()
  Object.assign(statusForm, {
    id: row.id,
    processStatus: row.processStatus || '',
    completeTime: row.completeTime ? formatDate(row.completeTime) : '',
    unableReason: row.unableReason || ''
  })
  statusDialogVisible.value = true
}

// ========== 提交状态更新（修复表单校验引用错误） ==========
const submitStatusForm = async () => {
  try {
    // 动态校验：仅当状态为UNABLE时校验unableReason，仅当状态为COMPLETED时校验completeTime
    let validatePass = true
    if (statusForm.processStatus === 'UNABLE') {
      const result = await statusFormRef.value.validateField('unableReason')
      if (result) validatePass = false
    }
    if (statusForm.processStatus === 'COMPLETED') {
      const result = await statusFormRef.value.validateField('completeTime')
      if (result) validatePass = false
    }
    if (!validatePass) return

    const res = await updateProcessStatus(
        statusForm.id,
        statusForm.processStatus,
        statusForm.completeTime,
        statusForm.unableReason
    )
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
      statusDialogVisible.value = false
      getList()
    } else {
      ElMessage.error('状态更新失败：' + (res.msg || '未知错误'))
    }
  } catch (e) {
    console.error('更新办理状态失败：', e)
    ElMessage.error('更新失败，请重试')
  }
}

// ========== 获取进度步骤 ==========
const getProcessStep = () => {
  if (!currentPackageContact.value) return 0
  const status = currentPackageContact.value.processStatus
  switch (status) {
    case 'UNHANDLED':
      return 0
    case 'HANDLING':
      return 1
    case 'COMPLETED':
    case 'UNABLE':
      return 2
    default:
      return 0
  }
}

// ========== 分页/筛选辅助方法 ==========
const resetSearch = () => {
  Object.assign(searchForm, {
    processStatus: '',
    leaderName: '',
    enterpriseName: '',
    classMonitor: '',
    classDeptName: '',
    problemType: ''
  })
  pageNum.value = 1
  getList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
  getList()
}

const handleCurrentChange = (val) => {
  pageNum.value = val
  getList()
}

// ========== 页面初始化 ==========
onMounted(() => {
  getProblemTypeList() // 先加载问题类型字典
  getList()
})
</script>

<style scoped>
.sme-package-handle-container {
  height: 100%;
  padding: 10px;
  font-size: 13px; /* 全局字体缩小 */
}

.filter-card {
  margin-bottom: 20px;
  font-size: 13px;
}

.list-card {
  height: calc(100% - 100px);
  overflow: auto;
  font-size: 13px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
  font-size: 13px;
}

.el-form {
  padding: 10px 0;
  font-size: 13px;
}

.process-detail {
  max-height: 70vh;
  overflow-y: auto;
  font-size: 13px;
}

.process-progress {
  margin: 20px 0;
  font-size: 13px;
}

.process-record-list {
  margin-top: 20px;
  font-size: 13px;
}

:deep(.el-table-column--operation .el-button) {
  margin: 0 2px;
  font-size: 13px;
}

:deep(.el-descriptions) {
  --el-descriptions-item-label-width: 120px;
  font-size: 13px;
}

/* 统一所有Element组件字体大小 */
:deep(.el-input),
:deep(.el-select),
:deep(.el-button),
:deep(.el-table),
:deep(.el-pagination),
:deep(.el-dialog),
:deep(.el-form-item),
:deep(.el-tag),
:deep(.el-steps),
:deep(.el-date-picker) {
  font-size: 13px !important;
}

:deep(.el-table th),
:deep(.el-table td) {
  font-size: 13px !important;
  padding: 8px 0 !important;
}

:deep(.el-dialog__title) {
  font-size: 14px !important; /* 弹窗标题稍大一点 */
}

/* 新增：问题内容点击查看全部样式 */
.problem-content {
  cursor: pointer;
  color: #409eff;
}
</style>