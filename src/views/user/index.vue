<template>
  <div class="user-list-page">
    <!-- 查询表单 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入真实姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.deptId" placeholder="请选择部门" clearable style="width: 120px">
            <el-option
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.deptName"
                :value="dept.id.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" icon="Plus" @click="handleAdd" style="margin-left: 8px;">新增用户</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="list-card" shadow="never">
      <el-table style="width: 100%"
                :data="filteredUserList"
                border
                stripe
                :loading="loading"
                @selection-change="handleSelectionChange"
                fit
      >
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column prop="id" label="ID" width="60" align="center"/>
        <el-table-column prop="username" label="用户名" width="120" align="center"/>
        <el-table-column prop="realName" label="真实姓名" width="120" align="center"/>
        <el-table-column prop="phone" label="手机号" width="150" align="center"/>
        <!-- 替换部门ID为部门名称 -->
        <el-table-column label="所属部门" width="200" align="center">
          <template #default="{ row }">
            {{ row.deptName || '未分配' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="180" align="center">
          <template #default="{ row }">
            <el-switch
                v-model="row.status"
                active-value="1"
                inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
                @change="handleStatusChange(row)"
                :disabled="row.id === currentUserId"
            />
            <el-tooltip v-if="row.id === currentUserId" content="不允许修改自身状态" placement="top">
              <i class="el-icon-info" style="margin-left: 5px; color: #909399;"></i>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="200" align="center">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="200" align="center">
          <template #default="{ row }">
            {{ formatTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button
                  type="primary"
                  size="small"
                  icon="Edit"
                  @click="handleEdit(row)"
                  :disabled="row.id === currentUserId"
              >
                编辑
              </el-button>
              <el-button
                  type="danger"
                  size="small"
                  icon="Delete"
                  @click="handleDelete(row)"
                  :disabled="row.id === currentUserId"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="filteredTotal"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!isAdd && form.id === currentUserId" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <!-- 修复部门下拉框显示问题 -->
        <el-form-item label="所属部门" prop="deptId">
          <el-select v-model="form.deptId" placeholder="请选择所属部门" clearable>
            <el-option
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.deptName"
                :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
              v-model="form.status"
              active-value="1"
              inactive-value="0"
              :disabled="form.id === currentUserId"
          />
          <el-tooltip v-if="form.id === currentUserId" content="不允许修改自身状态" placement="right">
            <i class="el-icon-info" style="margin-left: 5px; color: #909399;"></i>
          </el-tooltip>
        </el-form-item>
        <!-- 强制显示密码字段（新增/编辑都显示） -->
        <el-form-item
            label="密码"
            prop="password"
            :rules="isAdd ? rules.password : editPasswordRules"
        >
          <el-input
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              :placeholder="isAdd ? '请输入密码' : '不修改请留空'"
          />
          <div v-if="!isAdd" class="password-tip">
            <i class="el-icon-info"></i> 留空则不修改密码
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="handleSubmit"
            :disabled="!isAdd && form.id === currentUserId"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import userApi from '@/api/user'
import deptApi from '@/api/dept'  // 引入部门API

// 缓存当前登录用户ID
const currentUserId = ref('')
// 部门列表
const deptList = ref([])

// 时间格式化工具函数
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 搜索表单（新增部门ID筛选）
const searchForm = reactive({
  username: '',
  realName: '',
  phone: '',
  deptId: '',  // 新增部门ID筛选条件
  status: ''
})

// 表格数据
const userList = ref([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)

// 过滤方法（新增部门筛选）
const filterUserList = () => {
  if (userList.value.length === 0) return []

  return userList.value.filter(item => {
    // 用户名模糊匹配
    if (searchForm.username && !item.username.toLowerCase().includes(searchForm.username.toLowerCase())) {
      return false
    }
    // 真实姓名模糊匹配
    if (searchForm.realName && !item.realName.toLowerCase().includes(searchForm.realName.toLowerCase())) {
      return false
    }
    // 手机号模糊匹配
    if (searchForm.phone && !item.phone.includes(searchForm.phone)) {
      return false
    }
    // 部门筛选
    if (searchForm.deptId && item.deptId.toString() !== searchForm.deptId) {
      return false
    }
    // 状态精确匹配
    if (searchForm.status !== '' && item.status !== searchForm.status.toString()) {
      return false
    }
    return true
  })
}

// 计算过滤后的总条数
const filteredTotal = computed(() => {
  return filterUserList().length
})

// 计算当前页显示的过滤后数据
const filteredUserList = computed(() => {
  const list = filterUserList()
  const startIndex = (pageNum.value - 1) * pageSize.value
  return list.slice(startIndex, startIndex + pageSize.value)
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const isAdd = ref(true)
const formRef = ref(null)
const form = reactive({
  id: '',
  username: '',
  realName: '',
  phone: '',
  deptId: '',
  status: '1',
  password: ''
})

// 表单校验规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [{
    required: true,
    message: '请输入手机号',
    trigger: 'blur'
  }, {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号格式',
    trigger: 'blur'
  }],
  deptId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  // 新增时密码必填
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 编辑时密码非必填规则
const editPasswordRules = [{
  validator: (rule, value, callback) => {
    // 留空则通过校验，有值则检查长度
    if (value && value.length < 6) {
      callback(new Error('密码长度不能少于6位'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}]

// 获取部门列表
const getDeptList = async () => {
  try {
    const res = await deptApi.getDeptList()
    deptList.value = res.data || []
  } catch (error) {
    ElMessage.error('获取部门列表失败：' + (error.msg || error.message || '网络异常'))
    console.error('获取部门列表错误详情：', error)
  }
}

// 页面加载时获取数据
onMounted(async () => {
  // 获取部门列表
  await getDeptList()
  // 获取当前登录用户信息
  await getCurrentUserInfo()
  // 获取用户列表
  getUserList()
})

// 获取当前登录用户信息
const getCurrentUserInfo = async () => {
  try {
    const res = await userApi.getCurrentUser()
    if (res.data && res.data.id) {
      currentUserId.value = res.data.id
    }
  } catch (error) {
    console.error('获取当前用户信息失败', error)
    ElMessage.warning('获取当前用户信息失败，部分功能可能受限')
  }
}

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    const queryParams = {
      pageNum: 1,
      pageSize: 9999,
      username: '',
      realName: '',
      phone: '',
      status: ''
    }

    const res = await userApi.getUserPage(queryParams)
    const list = res.data.list || []
    userList.value = list.map(item => ({
      ...item,
      status: item.status.toString()
    }))
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取用户列表失败：' + (error.msg || error.message || '网络异常'))
    console.error('获取用户列表错误详情：', error)
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pageNum.value = 1
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    realName: '',
    phone: '',
    deptId: '',  // 重置部门筛选
    status: ''
  })
  pageNum.value = 1
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
}

// 页码变化
const handleCurrentChange = (val) => {
  pageNum.value = val
}

// 新增用户
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  isAdd.value = true
  resetForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  if (row.id === currentUserId.value) {
    ElMessage.warning('不允许编辑当前登录用户自身信息！')
    return
  }

  dialogTitle.value = '编辑用户'
  isAdd.value = false
  // 编辑时清空密码字段，避免回显（密码是加密存储的）
  const formData = JSON.parse(JSON.stringify(row))
  formData.password = ''
  Object.assign(form, formData)
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row) => {
  if (row.id === currentUserId.value) {
    ElMessage.warning('不允许删除当前登录用户自身！')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await userApi.deleteUser(row.id)
    ElMessage.success('删除成功')
    getUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.info('已取消删除')
    }
  }
}

// 状态切换
const handleStatusChange = async (row) => {
  if (row.id === currentUserId.value) {
    ElMessage.warning('不允许修改当前登录用户自身的状态！')
    row.status = row.status === '1' ? '1' : '0'
    return
  }

  try {
    const status = parseInt(row.status)
    await userApi.updateUserStatus(status, row.id)
    ElMessage.success(status === 1 ? '启用成功' : '禁用成功')
    getUserList()
  } catch (error) {
    ElMessage.error(`状态更新失败：${error.msg || error.message || '操作异常'}`)
    row.status = row.status === '1' ? '0' : '1'
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!isAdd.value && form.id === currentUserId.value) {
    ElMessage.warning('不允许修改当前登录用户自身信息！')
    return
  }

  if (!formRef.value) return
  try {
    await formRef.value.validate()

    const submitData = {
      ...form,
      status: parseInt(form.status)
    }

    // 编辑模式下：密码为空则删除该字段（不修改密码）
    if (!isAdd.value && !submitData.password) {
      delete submitData.password
    }

    if (isAdd.value) {
      await userApi.addUser(submitData)
      ElMessage.success('新增用户成功')
    } else {
      await userApi.updateUser(form.id, submitData)
      ElMessage.success('编辑用户成功')
    }

    dialogVisible.value = false
    getUserList()
  } catch (error) {
    if (error.fields) {
      return
    }
    ElMessage.error((isAdd.value ? '新增' : '编辑') + '失败：' + (error.msg || error.message || '操作异常'))
    console.error('提交表单错误详情：', error)
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: '',
    username: '',
    realName: '',
    phone: '',
    deptId: '',
    status: '1',
    password: ''
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 关闭弹窗
const handleDialogClose = () => {
  resetForm()
}

// 多选事件
const handleSelectionChange = (val) => {
  console.log('选中的数据：', val)
}
</script>

<style scoped lang="scss">
.user-list-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 4px;
  .el-form {
    margin: 0;
    padding: 16px;
  }
}

.list-card {
  border-radius: 4px;
  .el-table {
    --el-table-header-text-color: #606266;
    --el-table-row-hover-bg-color: #f5f7fa;
  }
  .pagination {
    margin-top: 20px;
    text-align: right;
    padding-right: 10px;
  }
}

.operation-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  .el-button {
    flex-shrink: 0;
  }
}

:deep(.el-table__fixed-right) {
  border-left: 1px solid #ebeef5;
}

:deep(.el-switch.is-disabled) {
  opacity: 0.6;
}

// 密码提示样式
.password-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  .el-icon-info {
    margin-right: 4px;
    font-size: 12px;
  }
}

:deep(.el-dialog .el-input__inner[type="password"]) {
  background-color: transparent !important;
}
:deep(.el-dialog input:-webkit-autofill),
:deep(.el-dialog input:-webkit-autofill:hover),
:deep(.el-dialog input:-webkit-autofill:focus) {
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  box-shadow: 0 0 0px 1000px transparent inset !important;
  -webkit-text-fill-color: inherit !important;
  transition: background-color 5000s ease-in-out 0s !important;
}
</style>
