<template>
  <div class="enterprise-container">
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline @submit.prevent="getList">
        <el-form-item label="企业名称">
          <el-input v-model="searchForm.enterpriseName" placeholder="请输入企业名称" clearable/>
        </el-form-item>
        <el-form-item label="企业类型" style="width: 200px">
          <el-select
              v-model="searchForm.enterpriseType"
              placeholder="请选择企业类型"
              clearable
          >
            <el-option
                v-for="item in enterpriseTypeOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属乡镇" style="width: 200px">
          <el-select
              v-model="searchForm.townId"
              placeholder="请选择所属乡镇"
              clearable
          >
            <el-option
                v-for="item in townOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属行业" style="width: 200px">
          <el-select
              v-model="searchForm.industryId"
              placeholder="请选择所属行业"
              clearable
          >
            <el-option
                v-for="item in industryOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="经营状态" style="width: 200px">
          <el-select
              v-model="searchForm.businessStatus"
              placeholder="请选择经营状态"
              clearable
          >
            <el-option
                v-for="item in businessStatusOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getList">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
          <el-button type="primary" icon="Plus" @click="handleAdd">新增企业</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card" shadow="never">
      <el-table :data="enterpriseList" v-loading="loading" border stripe style="width: 100%; margin-top: 20px; font-size: 12px">
        <el-table-column prop="id" label="ID" align="center" width="50"/>
        <el-table-column prop="enterpriseName" label="企业名称" align="center" min-width="200"/>
        <el-table-column prop="creditCode" label="统一社会信用代码" align="center" min-width="160"/>
        <el-table-column prop="enterpriseType" label="企业类型" align="center" min-width="90">
          <template #default="{ row }">
            {{ getDictLabel(enterpriseTypeOptions, row.enterpriseType) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="businessAddr" label="注册地址" align="center" min-width="180"/>
        <el-table-column prop="legalPerson" label="法定代表人" align="center" min-width="70"/>
        <el-table-column prop="phone" label="联系电话" align="center" min-width="100"/>
        <el-table-column prop="regCapital" label="注册资本（万元）" align="center" min-width="80"/>
        <el-table-column prop="establishTime" label="成立时间" align="center" min-width="100">
          <template #default="{ row }">
            {{ row.establishTime ? formatDate(row.establishTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="townId" label="所属乡镇" align="center" min-width="80">
          <template #default="{ row }">
            {{ getDictLabel(townOptions, row.townId) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="industryId" label="所属行业" align="center" min-width="80">
          <template #default="{ row }">
            {{ getDictLabel(industryOptions, row.industryId) || '-' }}
          </template>
        </el-table-column>
        <!-- 新增：主要产品列（位于所属行业后） -->
        <el-table-column prop="mainProduct" label="主要产品" align="center" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.mainProduct || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="businessStatus" label="经营状态" align="center" min-width="90">
          <template #default="{ row }">
            <el-tag
                :type="getStatusTagType(row.businessStatus)"
                size="small"
            >
              {{ getDictLabel(businessStatusOptions, row.businessStatus) || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" min-width="90">
          <template #default="{ row }">
            {{ row.createTime ? formatDate(row.createTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" align="center" min-width="90">
          <template #default="{ row }">
            {{ row.updateTime ? formatDate(row.updateTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="130" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="Edit" @click="handleEdit(row)" size="small">修改</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(row)" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="filteredTotal"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination"
          style="margin-top: 20px; text-align: right;"
      />
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="700px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="enterpriseFormRef" label-width="120px">
        <el-form-item label="企业名称" prop="enterpriseName">
          <el-input v-model="form.enterpriseName" placeholder="请输入企业名称"/>
        </el-form-item>
        <el-form-item label="统一社会信用代码" prop="creditCode">
          <el-input v-model="form.creditCode" placeholder="请输入统一社会信用代码"/>
        </el-form-item>
        <el-form-item label="企业类型" prop="enterpriseType">
          <el-select
              v-model="form.enterpriseType"
              placeholder="请选择企业类型"
          >
            <el-option
                v-for="item in enterpriseTypeOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="注册地址" prop="businessAddr">
          <el-input v-model="form.businessAddr" placeholder="请输入注册地址"/>
        </el-form-item>
        <el-form-item label="法定代表人" prop="legalPerson">
          <el-input v-model="form.legalPerson" placeholder="请输入法定代表人"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="注册资本（万元）" prop="regCapital">
          <el-input v-model="form.regCapital" placeholder="请输入注册资本"/>
        </el-form-item>
        <el-form-item label="成立时间" prop="establishTime">
          <el-date-picker
              v-model="form.establishTime"
              type="date"
              placeholder="请选择成立时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="所属乡镇" prop="townId">
          <el-select
              v-model="form.townId"
              placeholder="请选择所属乡镇"
          >
            <el-option
                v-for="item in townOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属行业" prop="industryId">
          <el-select
              v-model="form.industryId"
              placeholder="请选择所属行业"
          >
            <el-option
                v-for="item in industryOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>
        <!-- 新增：主要产品表单项（位于所属行业下方） -->
        <el-form-item label="主要产品" prop="mainProduct">
          <el-input
              v-model="form.mainProduct"
              placeholder="请输入主要产品"
              type="textarea"
              :rows="3"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="经营状态" prop="businessStatus">
          <el-select
              v-model="form.businessStatus"
              placeholder="请选择经营状态"
          >
            <el-option
                v-for="item in businessStatusOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, reactive} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {formatDate} from '@/utils/dateUtil'
import {listDictItemByDictCode} from '@/api/dictItem'
import {
  pageEnterprise,
  getEnterpriseById,
  addEnterprise,
  updateEnterprise,
  deleteEnterprise,
  changeEnterpriseStatus
} from '@/api/enterprise'
import { checkEnterpriseBind } from '@/api/smeple.js'

// 分页相关
const pageNum = ref(1)          // 当前页码
const pageSize = ref(20)        // 每页条数
const filteredTotal = ref(0)    // 总条数（分页组件核心）
const loading = ref(false)      // 加载状态

// 数据存储
const enterpriseList = ref([])  // 企业列表数据
const dialogVisible = ref(false)// 弹窗显示状态
const dialogTitle = ref('')     // 弹窗标题
const enterpriseFormRef = ref(null) // 表单引用

// 字典项数据源
const enterpriseTypeOptions = ref([])   // 企业类型
const townOptions = ref([])             // 所属乡镇
const industryOptions = ref([])         // 所属行业
const businessStatusOptions = ref([])   // 经营状态

// 查询表单
const searchForm = reactive({
  enterpriseName: '',
  enterpriseType: '',
  townId: '',
  industryId: '',
  businessStatus: ''
})

// 新增/修改表单（新增mainProduct字段）
const form = reactive({
  id: undefined,
  enterpriseName: '',
  creditCode: '',
  enterpriseType: '',
  businessAddr: '',
  legalPerson: '',
  phone: '',
  regCapital: '',
  establishTime: '',
  townId: '',
  industryId: '',
  mainProduct: '', // 新增：主要产品字段
  businessStatus: 'NORMAL' // 默认正常经营
})

// 表单校验规则（新增mainProduct非必填，可根据需求调整）
const rules = {
  enterpriseName: [{required: true, message: '请输入企业名称', trigger: 'blur'}],
  creditCode: [{required: true, message: '请输入统一社会信用代码', trigger: 'blur'}],
  legalPerson: [{required: true, message: '请输入法定代表人', trigger: 'blur'}],
  phone: [{required: true, message: '请输入联系电话', trigger: 'blur'}],
  enterpriseType: [{required: true, message: '请选择企业类型', trigger: 'change'}],
  townId: [{required: true, message: '请选择所属乡镇', trigger: 'change'}],
  industryId: [{required: true, message: '请选择所属行业', trigger: 'change'}],
  businessStatus: [{required: true, message: '请选择经营状态', trigger: 'change'}],
  mainProduct: [{required: false, message: '请输入主要产品', trigger: 'blur'}] // 非必填，可改为required: true
}

// 获取字典项数据
const getDictOptions = async () => {
  try {
    const typeRes = await listDictItemByDictCode('enterprise_type')
    enterpriseTypeOptions.value = typeRes.data || []

    const townRes = await listDictItemByDictCode('town')
    townOptions.value = townRes.data || []

    const industryRes = await listDictItemByDictCode('industry')
    industryOptions.value = industryRes.data || []

    const statusRes = await listDictItemByDictCode('business_status')
    businessStatusOptions.value = statusRes.data || []
  } catch (e) {
    console.error("加载字典项失败:", e)
    ElMessage.error('加载字典数据失败，请刷新页面重试')
  }
}

// 通过字典编码获取标签名称
const getDictLabel = (options, code) => {
  if (!code) return '-'
  const matchItem = options.find(item => item.itemCode === code)
  return matchItem ? matchItem.itemName : '-'
}

// 根据经营状态获取标签类型
const getStatusTagType = (code) => {
  switch (code) {
    case 'NORMAL':
      return 'success'
    case 'STOP':
      return 'danger'
    case 'PREPARE':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取企业列表（核心：修复分页逻辑）
const getList = async () => {
  loading.value = true
  try {
    // 过滤空值查询条件
    const queryParams = {...searchForm}
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === '') {
        delete queryParams[key]
      }
    })

    // 组装分页参数 + 查询条件
    const pageParams = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      ...queryParams
    }

    // 调用分页接口
    const res = await pageEnterprise(pageParams)

    // 适配后端分页返回格式（根据实际后端返回调整）
    enterpriseList.value = res.data?.records || res.data || []
    filteredTotal.value = res.data?.total || 0
  } catch (e) {
    console.error("加载企业列表失败:", e)
    ElMessage.error('加载企业列表失败')
  } finally {
    loading.value = false
  }
}

// 提交表单（新增/修改）
const submitForm = () => {
  if (!enterpriseFormRef.value) return
  enterpriseFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          await updateEnterprise(form)
          ElMessage.success('修改企业成功')
        } else {
          await addEnterprise(form)
          ElMessage.success('新增企业成功')
        }
        dialogVisible.value = false
        getList() // 提交后刷新列表
      } catch (e) {
        console.error("保存企业信息失败:", e)
        ElMessage.error('保存企业信息失败')
      }
    }
  })
}

// 修改企业状态
const handleStatusChange = async (row) => {
  try {
    await changeEnterpriseStatus(row.id, row.businessStatus)
    ElMessage.success('经营状态更新成功')
  } catch (e) {
    row.businessStatus = row.businessStatus === 'NORMAL' ? 'STOP' : 'NORMAL'
    ElMessage.error('经营状态更新失败')
  }
}

// 新增企业
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增企业'
  dialogVisible.value = true
}

// 修改企业
const handleEdit = async (row) => {
  resetForm()
  try {
    const res = await getEnterpriseById(row.id)
    const enterpriseData = res.data || res
    Object.assign(form, enterpriseData) // 自动赋值mainProduct字段
    dialogTitle.value = '修改企业'
    dialogVisible.value = true
  } catch (e) {
    console.error("获取企业详情失败:", e)
    ElMessage.error('获取企业详情失败')
  }
}

// 删除企业
const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除企业 "${row.enterpriseName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      // 检查企业是否被包抓联引用
      const checkRes = await checkEnterpriseBind(row.id)
      if (checkRes.data?.hasBind) {
        ElMessage.error('该企业已被包抓联关联，无法删除！')
        return
      }
      await deleteEnterprise(row.id)
      ElMessage.success('删除企业成功')
      getList()
    } catch (e) {
      console.error("删除企业失败:", e)
      ElMessage.error('删除企业失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 重置查询表单
const resetSearch = () => {
  Object.assign(searchForm, {
    enterpriseName: '',
    enterpriseType: '',
    townId: '',
    industryId: '',
    businessStatus: ''
  })
  pageNum.value = 1 // 重置查询回到第一页
  getList()
}

// 重置表单（新增mainProduct重置）
const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    enterpriseName: '',
    creditCode: '',
    enterpriseType: '',
    businessAddr: '',
    legalPerson: '',
    phone: '',
    regCapital: '',
    establishTime: '',
    townId: '',
    industryId: '',
    mainProduct: '', // 重置主要产品
    businessStatus: 'NORMAL'
  })
  if (enterpriseFormRef.value) {
    enterpriseFormRef.value.resetFields()
  }
}

// 分页大小变化
const handleSizeChange = val => {
  pageSize.value = val
  pageNum.value = 1 // 页大小变化回到第一页
  getList() // 重新查询数据
}

// 页码变化
const handleCurrentChange = val => {
  pageNum.value = val
  getList() // 重新查询数据
}

// 页面挂载初始化
onMounted(async () => {
  await getDictOptions()
  getList()
})
</script>

<style scoped>
.filter-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>