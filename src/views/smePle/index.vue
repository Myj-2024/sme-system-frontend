<template>
  <div class="sme-ple-container">
    <!-- 筛选卡片 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline @submit.prevent="getList">
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
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getList">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
          <!-- 解锁新增按钮 -->
          <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表卡片 -->
    <el-card class="list-card" shadow="never">
      <el-table
          :data="smePleList"
          v-loading="loading"
          border
          stripe
          style="width: 100%; margin-top: 20px"
          :default-sort="{prop: 'createTime', order: 'descending'}"
      >
        <!-- 序号列 -->
        <el-table-column
            label="序号"
            align="center"
            width="80"
            type="index"
            :index="(index) => (pageNum - 1) * pageSize + index + 1"
        />
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
        <!-- 电话 -->
        <el-table-column
            prop="enterprisePhone"
            label="电话"
            align="center"
            min-width="120"
        >
          <template #default="{ row }">
            {{ row.enterprisePhone || '-' }}
          </template>
        </el-table-column>
        <!-- 注册地址 -->
        <el-table-column
            prop="regAddr"
            label="注册地址"
            align="center"
            min-width="200"
            show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.regAddr || '-' }}
          </template>
        </el-table-column>
        <!-- 主要产品 -->
        <el-table-column
            prop="mainProduct"
            label="主要产品"
            align="center"
            min-width="200"
            show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.mainProduct || '-' }}
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
        <!-- 联系电话 -->
        <el-table-column
            prop="classPhone"
            label="联系电话"
            align="center"
            min-width="120"
        >
          <template #default="{ row }">
            {{ row.classPhone || '-' }}
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
        <!-- 备注 -->
        <el-table-column
            prop="remark"
            label="备注"
            align="center"
            min-width="150"
            show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <!-- 创建时间 -->
        <el-table-column
            prop="createTime"
            label="创建时间"
            align="center"
            min-width="180"
        >
          <template #default="{ row }">
            {{ row.createTime ? formatDate(row.createTime) : '-' }}
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
        <!-- 操作列（完善编辑/删除按钮，新增样式和交互） -->
        <el-table-column label="操作" align="center" width="200">
          <template #default="{ row }">
            <!-- 编辑按钮 -->
            <el-button
                link
                type="primary"
                icon="Edit"
                size="small"
                @click="handleEdit(row)"
                title="编辑">
              编辑
            </el-button>
            <!-- 删除按钮 -->
            <el-button
                link
                type="danger"
                icon="Delete"
                size="small"
                @click="handleDelete(row)"
                title="删除">
              删除
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
          style="margin-top: 20px; text-align: right;"
      />
    </el-card>

    <!-- 新增/编辑弹窗（移除两个只读输入框） -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="800px" destroy-on-close>
      <el-form :model="form" label-width="120px" ref="formRef" :rules="rules">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="包抓领导" prop="leaderName">
              <el-input v-model="form.leaderName" placeholder="请输入包抓领导姓名"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 企业ID下拉选择框 -->
            <el-form-item label="企业名称" prop="enterpriseId">
              <el-select
                  v-model="form.enterpriseId"
                  placeholder="请选择企业"
                  style="width: 100%"
                  @change="handleEnterpriseChange"
              >
                <el-option
                    v-for="item in enterpriseList"
                    :key="item.id"
                    :label="item.enterpriseName"
                    :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业负责人">
              <el-input v-model="form.enterpriseLeader" placeholder="选择企业后自动填充" readonly disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业联系电话">
              <el-input v-model="form.enterprisePhone" placeholder="选择企业后自动填充" readonly disabled/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册地址">
              <el-input v-model="form.regAddr" placeholder="选择企业后自动填充" readonly disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主要产品">
              <el-input v-model="form.mainProduct" placeholder="选择企业后自动填充" readonly disabled/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 专班负责单位下拉选择框 -->
            <el-form-item label="专班负责单位" prop="classDeptId">
              <el-select
                  v-model="form.classDeptId"
                  placeholder="请选择专班负责单位"
                  style="width: 100%"
                  @change="handleDeptChange"
              >
                <el-option
                    v-for="item in uniqueDeptList"
                    :key="item.id"
                    :label="item.deptName"
                    :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 专班班长下拉选择框 -->
            <el-form-item label="专班班长" prop="classMonitor">
              <el-select
                  v-model="form.classMonitor"
                  placeholder="请选择专班班长"
                  style="width: 100%"
                  :disabled="!form.classDeptId"
                  @change="handleMonitorChange"
              >
                <el-option
                    v-for="item in monitorOptions"
                    :key="item.id"
                    :label="item.leader"
                    :value="item.leader"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="专班联系电话">
              <el-input v-model="form.classPhone" placeholder="选择专班班长后自动填充" readonly disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="form.remark" placeholder="请输入备注" type="textarea"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 包抓联管理列表页面
 * 功能：分页查询、筛选、新增、编辑、删除（逻辑删除）
 * 依赖：Element Plus、自定义request、日期格式化工具
 */
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/dateUtil'
// 引入包抓联API
import {
  pageSmePle,
  getSmePleById,
  addSmePle,
  updateSmePle,
  deleteSmePle
} from '@/api/smePle'
// 引入企业和部门API
import { pageEnterprise, getEnterpriseById } from '@/api/enterprise'
import { listDept } from '@/api/dept'

// ========== 分页相关 ==========
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)

// ========== 数据存储 ==========
const smePleList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
// 企业和部门下拉列表数据
const enterpriseList = ref([])
const deptList = ref([])
const uniqueDeptList = ref([])
const monitorOptions = ref([])

// ========== 筛选表单 ==========
const searchForm = reactive({
  leaderName: '',
  enterpriseName: '',
  classMonitor: '',
  classDeptName: ''
})

// ========== 新增/编辑表单 ==========
const form = reactive({
  id: undefined,
  leaderName: '',
  enterpriseId: '',
  enterpriseName: '',
  enterpriseLeader: '',
  enterprisePhone: '',
  regAddr: '',
  mainProduct: '',
  classMonitor: '',
  classPhone: '',
  classDeptId: null,
  classDeptName: '',
  remark: ''
})

// ========== 表单校验规则 ==========
const rules = reactive({
  leaderName: [
    { required: true, message: '请输入包抓领导姓名', trigger: 'blur' }
  ],
  enterpriseId: [
    { required: true, message: '请选择企业', trigger: 'change' }
  ],
  classDeptId: [
    { required: true, message: '请选择专班负责单位', trigger: 'change' }
  ],
  classMonitor: [
    { required: true, message: '请选择专班班长', trigger: 'change' }
  ]
})

// ========== 加载企业和部门下拉数据 ==========
const getEnterpriseList = async () => {
  try {
    const res = await pageEnterprise({ pageNum: 1, pageSize: 100 })
    enterpriseList.value = res.data.records || []
  } catch (e) {
    console.error('加载企业列表失败：', e)
    ElMessage.error('加载企业列表失败')
  }
}

const getDeptList = async () => {
  try {
    const res = await listDept()
    deptList.value = res.data || []
    // 按部门名称去重
    const seenNames = new Set()
    uniqueDeptList.value = deptList.value.filter(item => {
      if (!seenNames.has(item.deptName)) {
        seenNames.add(item.deptName)
        return true
      }
      return false
    })
  } catch (e) {
    console.error('加载部门列表失败：', e)
    ElMessage.error('加载部门列表失败')
  }
}

// ========== 企业选择变更事件 ==========
const handleEnterpriseChange = async (enterpriseId) => {
  if (!enterpriseId) {
    form.enterpriseName = ''
    form.enterpriseLeader = ''
    form.enterprisePhone = ''
    form.regAddr = ''
    form.mainProduct = ''
    return
  }
  try {
    const res = await getEnterpriseById(enterpriseId)
    if (res.code === 200 && res.data) {
      form.enterpriseName = res.data.enterpriseName || ''
      form.enterpriseLeader = res.data.legalPerson || ''
      form.enterprisePhone = res.data.phone || ''
      form.regAddr = res.data.businessAddr || ''
      form.mainProduct = res.data.mainProduct || ''
    }
  } catch (e) {
    console.error('获取企业详情失败：', e)
    ElMessage.error('获取企业详情失败')
  }
}

// ========== 部门选择变更事件（核心修复：按名称筛选） ==========
const handleDeptChange = (deptId) => {
  if (!deptId) {
    form.classDeptName = ''
    form.classMonitor = ''
    form.classPhone = ''
    monitorOptions.value = []
    return
  }
  // 1. 获取选中的部门名称
  const selectedDept = uniqueDeptList.value.find(item => item.id === deptId)
  form.classDeptName = selectedDept ? selectedDept.deptName : ''

  // 2. 核心修改：按部门名称筛选所有人员，不再按ID
  const deptRecords = deptList.value.filter(item => item.deptName === form.classDeptName)
  monitorOptions.value = deptRecords.map(item => ({
    id: item.id,
    leader: item.leader,
    phone: item.phone
  }))

  // 3. 清空之前的班长和电话
  form.classMonitor = ''
  form.classPhone = ''
}

// ========== 班长选择变更事件 ==========
const handleMonitorChange = (monitorName) => {
  if (!monitorName) {
    form.classPhone = ''
    return
  }
  const selectedMonitor = monitorOptions.value.find(item => item.leader === monitorName)
  form.classPhone = selectedMonitor ? selectedMonitor.phone : ''
}

// ========== 核心方法 - 获取列表 ==========
const getList = async () => {
  loading.value = true
  try {
    const queryParams = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      ...(searchForm.leaderName && { leaderName: searchForm.leaderName }),
      ...(searchForm.enterpriseName && { enterpriseName: searchForm.enterpriseName }),
      ...(searchForm.classMonitor && { classMonitor: searchForm.classMonitor }),
      ...(searchForm.classDeptName && { classDeptName: searchForm.classDeptName })
    }

    const res = await pageSmePle(queryParams)
    if (res.code === 200 && res.data) {
      smePleList.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      smePleList.value = []
      total.value = 0
      ElMessage.warning('暂无包抓联数据')
    }
  } catch (e) {
    console.error('加载包抓联列表失败：', e)
    ElMessage.error('加载包抓联列表失败，请刷新页面重试')
    smePleList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ========== 新增/编辑/删除方法 ==========
const handleAdd = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: undefined,
    leaderName: '',
    enterpriseId: '',
    enterpriseName: '',
    enterpriseLeader: '',
    enterprisePhone: '',
    regAddr: '',
    mainProduct: '',
    classMonitor: '',
    classPhone: '',
    classDeptId: null,
    classDeptName: '',
    remark: ''
  })
  dialogTitle.value = '新增包抓联联系表'
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  try {
    formRef.value?.resetFields()
    const res = await getSmePleById(row.id)
    if (res.code === 200 && res.data) {
      const formData = {
        ...res.data,
        classDeptId: res.data.classDeptId || null
      }
      Object.assign(form, formData)
      // 编辑时重新加载班长列表
      if (form.classDeptId) {
        handleDeptChange(form.classDeptId)
      }
      dialogTitle.value = '修改包抓联联系表'
      dialogVisible.value = true
    } else {
      ElMessage.error('获取包抓联详情失败')
    }
  } catch (e) {
    console.error('获取包抓联详情失败：', e)
    ElMessage.error('获取包抓联详情失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除包抓联记录【${row.leaderName} - ${row.enterpriseName}】吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true
      }
  ).then(async () => {
    try {
      const res = await deleteSmePle(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        getList()
      } else {
        ElMessage.error('删除失败：' + (res.msg || '未知错误'))
      }
    } catch (e) {
      console.error('删除包抓联记录失败：', e)
      ElMessage.error('删除失败，请重试')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    const submitData = {
      ...form,
      classDeptId: form.classDeptId || null
    }
    let res
    if (form.id) {
      res = await updateSmePle(submitData)
    } else {
      res = await addSmePle(submitData)
    }
    if (res.code === 200) {
      ElMessage.success(form.id ? '修改成功' : '新增成功')
      dialogVisible.value = false
      getList()
    } else {
      ElMessage.error(form.id ? '修改失败' : '新增失败' + (res.msg || ''))
    }
  } catch (e) {
    if (e.name !== 'ValidationError') {
      console.error('保存包抓联记录失败：', e)
      ElMessage.error('保存失败，请重试')
    }
  }
}

// ========== 分页/筛选辅助方法 ==========
const resetSearch = () => {
  Object.assign(searchForm, {
    leaderName: '',
    enterpriseName: '',
    classMonitor: '',
    classDeptName: ''
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
  getList()
  getEnterpriseList()
  getDeptList()
})
</script>

<style scoped>
.sme-ple-container {
  height: 100%;
  padding: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.list-card {
  height: calc(100% - 100px);
  overflow: auto;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.el-form {
  padding: 10px 0;
}

:deep(.el-table-column--operation .el-button) {
  margin: 0 2px;
}
</style>