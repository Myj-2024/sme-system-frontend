<template>
  <div class="package-process-detail-container">
    <el-page-header
        content="问题办理进度详情"
        @back="handleBack"
        style="margin-bottom: 20px;"
    ></el-page-header>

    <el-card shadow="never" v-loading="loading">
      <div v-if="currentPackageContact" class="process-detail">
        <el-descriptions :column="2" border style="margin-bottom: 20px; font-size: 13px;">
          <el-descriptions-item label="问题编号">{{ currentPackageContact.packageNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="企业名称">{{
              currentPackageContact.enterpriseName || '-'
            }}
          </el-descriptions-item>
          <el-descriptions-item label="包抓领导">{{ currentPackageContact.leaderName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="专班负责单位">{{
              currentPackageContact.classDeptName || '-'
            }}
          </el-descriptions-item>
          <el-descriptions-item label="问题类型">
            <el-tag type="primary" size="small">
              {{ getProblemTypeName(currentPackageContact.problemType) || currentPackageContact.problemType }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="流程状态">
            <el-tag v-if="normalizedStatus === 'HANDLING'" type="warning" size="small">受理中</el-tag>
            <el-tag v-else-if="normalizedStatus === 'PROCESSING'" type="primary" size="small">办理中</el-tag>
            <el-tag v-else-if="normalizedStatus === 'FINISHING'" type="info" size="small">办结中</el-tag>
            <el-tag v-else-if="normalizedStatus === 'COMPLETED'" type="success" size="small">完全办结</el-tag>
            <el-tag v-else type="danger" size="small">暂无法办结</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="问题接收时间" :span="2">
            {{ currentPackageContact.problemReceiveTime ? formatDate(currentPackageContact.problemReceiveTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="企业反映的问题" :span="2">
            <div style="white-space: pre-wrap; word-break: break-all;">{{
                currentPackageContact.enterpriseProblem || '-'
              }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="暂无法办结说明" v-if="normalizedStatus === 'UNABLE'" :span="2">
            {{ currentPackageContact.unableReason || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="办结时间" v-if="normalizedStatus === 'COMPLETED'" :span="2">
            {{
              currentPackageContact.completeTime ? formatDate(currentPackageContact.completeTime, 'YYYY-MM-DD HH:mm:ss') : '-'
            }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="process-progress" style="margin: 30px 0;">
          <h4 style="margin-bottom: 15px; font-size: 13px;">办理进度</h4>
          <el-steps :active="getProcessStep()" :finish-status="getFinishStatus()" :process-status="getProcessStatus()" align-center style="font-size: 13px;">
            <el-step title="问题受理" description="已接收企业反馈问题并受理"></el-step>
            <el-step title="办理中" description="正在处理企业问题"></el-step>
            <el-step title="办结中" description="问题进入办结流程"></el-step>
            <el-step title="最终状态" description="完全办结/暂无法办结"></el-step>
          </el-steps>
        </div>

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
            ></el-table-column>
            <el-table-column
                prop="handleTime"
                label="办理时间"
                align="center"
                min-width="180"
            >
              <template #default="{ row }">
                {{ row.handleTime ? formatDate(row.handleTime, 'YYYY-MM-DD HH:mm:ss') : '-' }}
              </template>
            </el-table-column>
            <el-table-column
                prop="handleType"
                label="操作类型"
                align="center"
                min-width="100"
            >
              <template #default="{ row }">
                <el-tag
                    :type="getHandleTypeTagType(row.handleType)"
                    size="small">
                  {{ getHandleTypeName(row.handleType) || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
                prop="handleContent"
                label="办理内容"
                align="center"
                min-width="200"
                show-overflow-tooltip
            ></el-table-column>
            <el-table-column
                prop="attachUrl"
                label="附件"
                align="center"
                min-width="150"
            >
              <template #default="{ row }">
                <el-button
                    v-if="row.attachUrl"
                    link
                    type="primary"
                    size="small"
                    @click="viewAttach(row.attachUrl)"
                >
                  查看附件
                </el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column
                label="操作"
                align="center"
                width="150"
                v-if="normalizedStatus !== 'COMPLETED'"
            >
              <template #default="{ row }">
                <el-button
                    link
                    type="primary"
                    icon="Edit"
                    size="small"
                    @click="handleEditRecord(row)"
                    v-if="['ACCEPT', 'PROCESS', 'COMPLETE'].includes(row.handleType)"
                >
                  编辑
                </el-button>
                <el-button
                    link
                    type="danger"
                    icon="Delete"
                    size="small"
                    @click="handleDeleteRecord(row)"
                    v-if="['ACCEPT', 'PROCESS', 'COMPLETE'].includes(row.handleType)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-button
              v-if="normalizedStatus !== 'COMPLETED'"
              type="primary"
              icon="Plus"
              @click="handleAddRecord"
              style="margin-bottom: 10px; font-size: 13px;"
          >
            {{
              normalizedStatus === 'HANDLING' ? '添加核实记录' :
                  normalizedStatus === 'PROCESSING' ? '添加办理记录' :
                      (normalizedStatus === 'FINISHING' ? '添加办结记录' :
                          (normalizedStatus === 'UNABLE' ? '添加办理记录' : '添加记录'))
            }}
          </el-button>
        </div>
      </div>

      <div style="text-align: right; margin-top: 20px;" v-if="currentPackageContact">
        <template v-if="normalizedStatus === 'HANDLING'">
          <el-button type="primary" @click="handleNextStep(currentPackageContact)">下一步</el-button>
        </template>

        <template v-else-if="normalizedStatus === 'PROCESSING'">
          <el-button @click="handlePrevStep(currentPackageContact)">上一步</el-button>
          <el-button type="primary" @click="handleNextStep(currentPackageContact)" style="margin-left: 10px;">下一步</el-button>
        </template>

        <template v-else-if="normalizedStatus === 'FINISHING'">
          <el-button @click="handlePrevStep(currentPackageContact)">上一步</el-button>
          <el-button type="primary" @click="handleFinalComplete(currentPackageContact)" style="margin-left: 10px;">完全办结</el-button>
          <el-button type="warning" @click="handleMarkAsUnable(currentPackageContact)" style="margin-left: 10px;">暂无法办结</el-button>
        </template>

        <template v-else-if="normalizedStatus === 'COMPLETED'">
          <el-button @click="handleBack" style="font-size: 13px;">返 回</el-button>
        </template>

        <template v-else-if="normalizedStatus === 'UNABLE'">
          <el-button @click="handleReopenProcess(currentPackageContact)">重新办理</el-button>
        </template>
      </div>
    </el-card>

    <el-dialog
        v-model="attachDialogVisible"
        title="附件列表"
        width="600px"
        destroy-on-close
    >
      <el-table :data="attachList" border style="width: 100%;">
        <el-table-column prop="name" label="文件名" min-width="200"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="downloadAttach(row.url)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="attachDialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
        v-model="recordDialogVisible"
        :title="recordDialogTitle"
        width="700px"
        destroy-on-close
        style="font-size: 13px;"
    >
      <el-form :model="recordForm" label-width="120px" ref="recordFormRef" :rules="recordRules"
               style="font-size: 13px;">
        <el-form-item label="办理时间" prop="handleTime">
          <el-date-picker
              v-model="recordForm.handleTime"
              type="datetime"
              placeholder="请选择办理时间"
              style="width: 100%; font-size: 13px;"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :locale="zhCn"
              :default-value="new Date()"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="操作类型">
          <el-input
              v-model="recordForm.handleTypeText"
              style="font-size: 13px;"
              readonly
              disabled
          ></el-input>
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
        <el-form-item label="附件上传">
          <el-upload
              :action="''"
              :http-request="(options) => {
                options.actionType = 'record'
                handleCustomUpload(options)
              }"
              :file-list="recordFileList"
              multiple
              style="font-size: 13px;"
          >
            <el-button type="primary" size="small">上传附件</el-button>
            <div slot="tip" class="el-upload__tip">支持多文件上传，格式不限</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false" style="font-size: 13px;">取 消</el-button>
        <el-button type="primary" @click="submitRecordForm" style="font-size: 13px;">确 定</el-button>
      </template>
    </el-dialog>

    <el-dialog
        v-model="finalCompleteDialogVisible"
        title="完全办结确认"
        width="500px"
        destroy-on-close
    >
      <div style="font-size: 13px; margin-bottom: 20px;">
        确认将该问题标记为<b>完全办结</b>？标记后将<b>不支持修改</b>，仅可查看！
      </div>
      <el-form :model="finalCompleteForm" label-width="100px" ref="finalCompleteFormRef" :rules="finalCompleteRules">
        <el-form-item label="办结说明" prop="completeContent">
          <el-input
              v-model="finalCompleteForm.completeContent"
              placeholder="请填写最终办结说明"
              type="textarea"
              :rows="3"
              style="font-size: 13px;"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="finalCompleteDialogVisible = false" style="font-size: 13px;">取 消</el-button>
        <el-button type="primary" @click="submitFinalCompleteForm" style="font-size: 13px;">确认完全办结</el-button>
      </template>
    </el-dialog>

    <el-dialog
        v-model="unableDialogVisible"
        title="标记为暂无法办结"
        width="700px"
        destroy-on-close
        style="font-size: 13px;"
    >
      <el-form :model="unableForm" label-width="120px" ref="unableFormRef" :rules="unableRules">
        <el-form-item label="暂无法办结说明" prop="unableReason">
          <el-input
              v-model="unableForm.unableReason"
              type="textarea"
              :rows="5"
              placeholder="请填写暂无法办结的原因"
              style="font-size: 13px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload
              :action="''"
              :http-request="(options) => {
                options.actionType = 'unable'
                handleCustomUpload(options)
              }"
              :file-list="unableFileList"
              multiple
              style="font-size: 13px;"
          >
            <el-button type="primary" size="small">上传附件</el-button>
            <div slot="tip" class="el-upload__tip">支持多文件上传，格式不限</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="unableDialogVisible = false" style="font-size: 13px;">取 消</el-button>
        <el-button type="primary" @click="submitUnableForm" style="font-size: 13px;">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {formatDate} from '@/utils/dateUtil'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import request from '@/utils/request'

// 引入API
import {
  getPackageContactById,
  listHandleRecord,
  addHandleRecord,
  updateHandleRecord,
  deleteHandleRecord,
  updateProcessStatus,
  completeProblem,
  unableProblem,
  uploadFile
} from '@/api/smeple'
import {listDictItemByDictCode} from '@/api/dictItem'

// 路由相关
const route = useRoute()
const router = useRouter()
const packageId = route.query.id || route.query.packageId // 兼容两种参数名

// 加载状态
const loading = ref(false)
const recordLoading = ref(false)

// 数据存储
const currentPackageContact = ref(null)
const handleRecordList = ref([])
const problemTypeList = ref([])
const attachList = ref([])

// 计算属性：标准化状态（兼容后端UNHANDLED）
const normalizedStatus = computed(() => {
  if (!currentPackageContact.value) return ''
  const status = currentPackageContact.value.processStatus
  if (status === 'UNHANDLED') return 'HANDLING'
  return status?.trim().toUpperCase() || ''
})

// 弹窗控制
const attachDialogVisible = ref(false)
const recordDialogVisible = ref(false)
const finalCompleteDialogVisible = ref(false)
const unableDialogVisible = ref(false)
const recordDialogTitle = ref('')

// 表单引用
const recordFormRef = ref(null)
const finalCompleteFormRef = ref(null)
const unableFormRef = ref(null)

// 办理记录表单
const recordForm = reactive({
  id: undefined,
  packageId: '',
  handleTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'), // 新增办理时间
  handleType: '', // 存储实际提交的类型编码（ACCEPT/PROCESS/COMPLETE）
  handleTypeText: '', // 存储显示的类型文本
  handleContent: '',
  attachUrl: ''
})
const recordFileList = ref([])

// 完全办结表单
const finalCompleteForm = reactive({
  packageId: '',
  completeContent: '',
  isFinal: true // 标记完全办结
})

// 暂无法办结表单
const unableForm = reactive({
  packageId: '',
  unableReason: '',
  attachUrl: ''
})
const unableFileList = ref([])

// 表单校验规则
const recordRules = reactive({
  handleTime: [{required: true, message: '请选择办理时间', trigger: 'change'}],
  // 【核心修改2】移除handleType的校验规则
  handleContent: [{required: true, message: '请输入办理内容', trigger: 'blur'}]
})

const finalCompleteRules = reactive({
  completeContent: [{required: true, message: '请填写办结说明', trigger: 'blur'}]
})

const unableRules = reactive({
  unableReason: [{required: true, message: '请填写暂无法办结说明', trigger: 'blur'}]
})

// ========== 工具方法 ==========
// 获取问题类型名称
const getProblemTypeName = (code) => {
  if (!code) return ''
  const item = problemTypeList.value.find(item => item.itemCode === code)
  return item ? item.itemName : code
}

// 获取操作类型名称
const getHandleTypeName = (code) => {
  const typeMap = {
    'ACCEPT': '受理',
    'PROCESS': '办理',
    'COMPLETE': '办结',
    'UNABLE': '暂无法办结'
  }
  return typeMap[code] || code
}

// 获取操作类型标签样式
const getHandleTypeTagType = (code) => {
  const typeMap = {
    'ACCEPT': 'info',
    'PROCESS': 'warning',
    'COMPLETE': 'success',
    'UNABLE': 'danger'
  }
  return typeMap[code] || 'primary'
}

// 获取办理进度步骤（适配4步进度条）
// 1. 获取办理进度步骤：Element Plus 索引从 0 开始
const getProcessStep = () => {
  if (!currentPackageContact.value) return 0
  const status = normalizedStatus.value

  if (status === 'HANDLING') return 0    // 第一步：问题受理
  if (status === 'PROCESSING') return 1  // 第二步：办理中
  if (status === 'FINISHING') return 2   // 第三步：办结中
  if (status === 'COMPLETED' || status === 'UNABLE') return 4 // 已完成，active 设为超过总数的索引，使所有步骤变绿
  return 0
}

// 2. 设置完成后的状态样式：完全办结时显示绿色对号
const getFinishStatus = () => {
  return 'success'
}

// 3. 强制指定当前步骤样式为蓝色 (process)
const getProcessStatus = () => {
  const status = normalizedStatus.value
  // 如果是完全办结，当前步骤状态也设为 success，确保最后一步也是绿色
  if (status === 'COMPLETED') {
    return 'success'
  }
  // 处于其他状态时，当前激活步骤强制显示为蓝色 (process)
  return 'process'
}


// 【核心工具方法】根据当前状态获取操作类型编码和文本
const getHandleTypeByStatus = (status) => {
  const typeMap = {
    'HANDLING': { code: 'ACCEPT', text: '受理' },
    'PROCESSING': { code: 'PROCESS', text: '办理' },
    'FINISHING': { code: 'COMPLETE', text: '办结' },
    'UNABLE': { code: 'PROCESS', text: '办理' } // 暂无法办结状态添加的记录仍为办理类型
  }
  return typeMap[status] || { code: 'PROCESS', text: '办理' }
}

// 自定义文件上传方法
const handleCustomUpload = async (options) => {
  // 1. 前端文件大小校验（单位：字节，这里限制为100MB）
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (options.file.size > maxSize) {
    ElMessage.error(`文件大小不能超过100MB，当前文件大小：${(options.file.size / 1024 / 1024).toFixed(2)}MB`);
    options.onError(new Error('文件大小超出限制'));
    return;
  }

  const formData = new FormData()
  formData.append('file', options.file)

  try {
    const res = await uploadFile(formData)
    // ========== 关键修复：适配后端返回格式 ==========
    // 后端code=200表示成功，文件URL在message字段中
    if (res.code === 200 && res.message) {
      // 根据不同类型拼接附件URL
      if (options.actionType === 'record') {
        recordForm.attachUrl += (recordForm.attachUrl ? ',' : '') + res.message
      } else if (options.actionType === 'unable') {
        unableForm.attachUrl += (unableForm.attachUrl ? ',' : '') + res.message
      }
      options.onSuccess(res)
      ElMessage.success('文件上传成功') // 新增：友好提示
    } else {
      ElMessage.error('文件上传失败：' + (res.msg || res.message || '未知错误'))
      options.onError(res)
    }
  } catch (e) {
    console.error('文件上传失败：', e)
    // 后端返回大小超限的友好提示
    if (e.response?.data?.msg?.includes('Maximum upload size exceeded')) {
      ElMessage.error('文件大小超出服务器限制，请上传更小的文件');
    } else {
      ElMessage.error('文件上传失败：' + (e.message || '网络异常'));
    }
    options.onError(e)
  }
}

// ========== 核心业务方法 ==========
// 获取问题详情
const getPackageContactDetail = async () => {
  if (!packageId) {
    ElMessage.error('缺少问题ID参数')
    handleBack()
    return
  }

  loading.value = true
  try {
    const res = await getPackageContactById(packageId)
    if (res.code === 200 && res.data) {
      currentPackageContact.value = res.data
      await getHandleRecordList() // 加载办理记录
    } else {
      ElMessage.error('获取问题详情失败')
      handleBack()
    }
  } catch (e) {
    console.error('获取问题详情失败：', e)
    ElMessage.error('获取问题详情失败')
    handleBack()
  } finally {
    loading.value = false
  }
}

// 获取办理记录列表
const getHandleRecordList = async () => {
  recordLoading.value = true
  try {
    const res = await listHandleRecord(packageId)
    handleRecordList.value = res.code === 200 ? (res.data || []) : []
  } catch (e) {
    console.error('获取办理记录失败：', e)
    ElMessage.error('获取办理记录失败')
    handleRecordList.value = []
  } finally {
    recordLoading.value = false
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

// 返回上一页
const handleBack = () => {
  router.back() // 返回到列表页
}

// 返回上一步状态
const handlePrevStep = async (row) => {
  try {
    await ElMessageBox.confirm(
        '确定返回上一步吗？',
        '返回确认',
        {type: 'warning'}
    )
    let targetStatus = ''
    // 办结中返回办理中
    if (normalizedStatus.value === 'FINISHING') {
      targetStatus = 'PROCESSING'
    }
    // 办理中返回受理中
    else if (normalizedStatus.value === 'PROCESSING') {
      targetStatus = 'HANDLING'
    }

    const res = await updateProcessStatus(row.id, targetStatus, '', '')
    if (res.code === 200) {
      ElMessage.success('已返回上一步')
      await getPackageContactDetail() // 刷新详情
    } else {
      ElMessage.error('状态更新失败：' + (res.msg || '未知错误'))
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('返回上一步失败：', e)
      ElMessage.error('返回失败，请重试')
    }
  }
}

// 下一步状态
const handleNextStep = async (row) => {
  try {
    let targetStatus = ''
    // 受理中到办理中
    if (normalizedStatus.value === 'HANDLING') {
      targetStatus = 'PROCESSING'
    }
    // 办理中到办结中
    else if (normalizedStatus.value === 'PROCESSING') {
      targetStatus = 'FINISHING'
    }

    const res = await updateProcessStatus(row.id, targetStatus, '', '')
    if (res.code === 200) {
      ElMessage.success('已进入下一步')
      await getPackageContactDetail() // 刷新详情
    } else {
      ElMessage.error('状态更新失败：' + (res.msg || '未知错误'))
    }
  } catch (e) {
    console.error('下一步失败：', e)
    ElMessage.error('操作失败，请重试')
  }
}

// 完全办结（二次确认）
const handleFinalComplete = (row) => {
  finalCompleteFormRef.value?.resetFields()
  Object.assign(finalCompleteForm, {
    packageId: row.id,
    completeContent: ''
  })
  finalCompleteDialogVisible.value = true
}

// 在submitFinalCompleteForm函数中修改时间格式
const submitFinalCompleteForm = async () => {
  try {
    await finalCompleteFormRef.value.validate()
    // 核心优化：格式化时间为YYYY-MM-DD HH:mm:ss，避免传递ISO格式
    const now = new Date();
    const formattedTime = formatDate(now, 'YYYY-MM-DD HH:mm:ss');

    // 1. 更新状态为完全办结
    const statusRes = await updateProcessStatus(finalCompleteForm.packageId, 'COMPLETED', formattedTime, '')
    if (statusRes.code !== 200) {
      ElMessage.error('状态更新失败：' + (statusRes.msg || '未知错误'))
      return
    }
    // 2. 提交办结记录
    const res = await completeProblem(finalCompleteForm.packageId, {
      completeContent: finalCompleteForm.completeContent,
      completeTime: formattedTime, // 使用格式化后的时间
      isFinal: true,
      handleType: 'COMPLETE'
    })
    if (res.code === 200) {
      ElMessage.success('完全办结成功，该记录将不可修改')
      finalCompleteDialogVisible.value = false
      await getPackageContactDetail()
    } else {
      ElMessage.error('办结失败：' + (res.msg || '未知错误'))
    }
  } catch (e) {
    if (e.name !== 'ValidationError') {
      console.error('完全办结失败：', e)
      ElMessage.error('操作失败，请重试')
    }
  }
}

// ========== 办理记录相关 ==========
// 新增办理记录
const handleAddRecord = () => {
  recordFormRef.value?.resetFields()
  recordFileList.value = []

  // 【核心修改3】根据当前状态自动设置操作类型
  const currentStatus = normalizedStatus.value
  const { code, text } = getHandleTypeByStatus(currentStatus)

  Object.assign(recordForm, {
    id: undefined,
    packageId: packageId,
    handleTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    handleType: code, // 自动赋值编码
    handleTypeText: text, // 自动赋值显示文本
    handleContent: '',
    attachUrl: ''
  })

  // 根据当前状态显示不同的标题
  if (currentStatus === 'HANDLING') {
    recordDialogTitle.value = '添加核实记录'
  } else if (currentStatus === 'PROCESSING') {
    recordDialogTitle.value = '添加办理记录'
  } else if (currentStatus === 'FINISHING') {
    recordDialogTitle.value = '添加办结记录'
  } else {
    recordDialogTitle.value = '添加记录'
  }
  recordDialogVisible.value = true
}

// 编辑办理记录
const handleEditRecord = (row) => {
  recordFormRef.value?.resetFields()
  recordFileList.value = []

  if (row.attachUrl) {
    const urls = row.attachUrl.split(',')
    recordFileList.value = urls.map(url => ({
      name: url.substring(url.lastIndexOf('/') + 1),
      url: url
    }))
  }

  // 【核心修改4】编辑时保留原有操作类型
  const typeText = getHandleTypeName(row.handleType)

  Object.assign(recordForm, {
    id: row.id,
    packageId: row.packageId,
    handleTime: row.handleTime ? formatDate(row.handleTime, 'YYYY-MM-DD HH:mm:ss') : formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    handleType: row.handleType || '', // 保留原编码
    handleTypeText: typeText, // 显示原类型文本
    handleContent: row.handleContent || '',
    attachUrl: row.attachUrl || ''
  })
  recordDialogTitle.value = '编辑办理记录'
  recordDialogVisible.value = true
}

// 删除办理记录
const handleDeleteRecord = (row) => {
  ElMessageBox.confirm(
      '确定删除该办理记录？',
      '删除确认',
      {type: 'warning', draggable: true}
  ).then(async () => {
    try {
      const res = await deleteHandleRecord(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        await getHandleRecordList()
      } else {
        ElMessage.error('删除失败：' + (res.msg || '未知错误'))
      }
    } catch (e) {
      console.error('删除办理记录失败：', e)
      ElMessage.error('删除失败，请重试')
    }
  }).catch(() => ElMessage.info('已取消删除'))
}

// 提交办理记录
const submitRecordForm = async () => {
  try {
    await recordFormRef.value.validate()
    const res = recordForm.id
        ? await updateHandleRecord(recordForm)
        : await addHandleRecord(recordForm)
    if (res.code === 200) {
      ElMessage.success(recordForm.id ? '修改成功' : '新增成功')
      recordDialogVisible.value = false
      await getHandleRecordList()
    } else {
      ElMessage.error(recordForm.id ? '修改失败' : '新增失败' + (res.msg || ''))
    }
  } catch (e) {
    if (e.name !== 'ValidationError') {
      console.error('提交办理记录失败：', e)
      ElMessage.error('提交失败，请重试')
    }
  }
}

// ========== 状态流转相关 ==========
// 重新办理（暂无法办结→办理中）
const handleReopenProcess = async (row) => {
  try {
    await ElMessageBox.confirm(
        '确定要重新办理该问题吗？状态将改为办理中',
        '重新办理确认',
        {type: 'warning'}
    )
    const res = await updateProcessStatus(
        row.id,
        'PROCESSING',
        '',
        ''
    )
    if (res.code === 200) {
      ElMessage.success('已改为办理中状态')
      await getPackageContactDetail() // 刷新详情
    } else {
      ElMessage.error('状态更新失败：' + (res.msg || '未知错误'))
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('重新办理失败：', e)
      ElMessage.error('重新办理失败，请重试')
    }
  }
}

// 标记暂无法办结
const handleMarkAsUnable = (row) => {
  unableFormRef.value?.resetFields()
  unableFileList.value = []
  Object.assign(unableForm, {
    packageId: row.id,
    unableReason: '',
    attachUrl: ''
  })
  unableDialogVisible.value = true
}

// 提交暂无法办结
const submitUnableForm = async () => {
  try {
    await unableFormRef.value.validate()
    // 1. 更新状态为暂无法办结
    const statusRes = await updateProcessStatus(unableForm.packageId, 'UNABLE', '', unableForm.unableReason)
    if (statusRes.code !== 200) {
      ElMessage.error('状态更新失败：' + (statusRes.msg || '未知错误'))
      return
    }
    // 2. 提交暂无法办结记录
    const res = await unableProblem(unableForm.packageId, {
      unableReason: unableForm.unableReason,
      attachUrl: unableForm.attachUrl,
      handleType: 'UNABLE'
    })
    if (res.code === 200) {
      ElMessage.success('标记成功，状态已改为暂无法办结')
      unableDialogVisible.value = false
      await getPackageContactDetail()
    } else {
      ElMessage.error('标记失败：' + (res.msg || '未知错误'))
    }
  } catch (e) {
    if (e.name !== 'ValidationError') {
      console.error('标记暂无法办结失败：', e)
      ElMessage.error('标记失败，请重试')
    }
  }
}

// ========== 附件相关 ==========
// 查看附件
const viewAttach = (urlStr) => {
  if (!urlStr) return
  const urls = urlStr.split(',')
  attachList.value = urls.map(url => ({
    name: url.substring(url.lastIndexOf('/') + 1),
    url: url
  }))
  attachDialogVisible.value = true
}

// 下载附件
const downloadAttach = (url) => {
  const link = document.createElement('a')
  link.href = url
  link.download = url.substring(url.lastIndexOf('/') + 1)
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ========== 初始化 ==========
onMounted(async () => {
  await getProblemTypeList()
  await getPackageContactDetail()
})
</script>

<style scoped>
.package-process-detail-container {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

/* 核心修改：通过 CSS 穿透强制覆盖 Element Plus 步骤条样式 */

/* 1. 强制当前步骤的圆圈/数字为蓝色 */
:deep(.el-step__head.is-process) {
  color: #409eff !important;
  border-color: #409eff !important;
}

/* 2. 强制当前步骤的标题文字为蓝色 */
:deep(.el-step__title.is-process) {
  color: #409eff !important;
  font-weight: bold;
}

/* 3. 强制当前步骤的描述文字为蓝色 */
:deep(.el-step__description.is-process) {
  color: #409eff !important;
}

/* 4. 如果是完成状态（success），保持绿色（默认即为绿色） */
:deep(.el-step__head.is-success) {
  color: #67c23a !important;
  border-color: #67c23a !important;
}
:deep(.el-step__title.is-success), :deep(.el-step__description.is-success) {
  color: #67c23a !important;
}
</style>