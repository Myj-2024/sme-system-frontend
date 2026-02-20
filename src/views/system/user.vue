<template>
  <div class="user-list-page">
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline @submit.prevent >
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable/>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入用户姓名" clearable/>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable/>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.deptCode" placeholder="请选择部门" clearable style="width: 150px">
            <el-option v-for="dept in deptList" :key="dept.itemCode" :label="dept.itemName" :value="dept.itemCode"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="启用" :value="'1'"/>
            <el-option label="禁用" :value="'0'"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <!-- 新增按钮：判断是否有权限新增用户（至少能创建最低权限角色） -->
          <el-button
              type="primary"
              @click="handleAdd"
              style="margin-left: 8px;"
              :disabled="!hasAddUserPermission"
          >
            <el-icon>
              <Plus/>
            </el-icon>
            新增用户
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card" shadow="never">
      <el-table style="width: 100%; font-size: 12px" :data="userList" border stripe v-loading="loading" fit >
        <el-table-column type="selection" width="50" align="center"/>
        <el-table-column prop="id" label="ID" width="50" align="center"/>
        <el-table-column prop="username" label="用户名" width="90" align="center"/>
        <el-table-column prop="realName" label="姓名" width="80" align="center"/>
        <el-table-column prop="phone" label="手机号" width="110" align="center"/>
        <el-table-column label="所属部门" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getDeptName(row.deptCode) === '未分配' ? 'info' : ''">
              {{ getDeptName(row.deptCode) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色名称" width="95" align="center">
          <template #default="{ row }">
            <el-tag type="success" v-if="row.roleName">{{ row.roleName }}</el-tag>
            <el-tag type="info" v-else>未分配</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="130" align="center" >
          <template #default="{ row }">
            <el-switch
                v-model="row.status"
                active-value="1"
                inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
                @change="handleStatusChange(row)"
                size="small"
                :disabled="row.id === currentUserId || !canOperateUser(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="130" align="center">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="280" align="center" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <!-- 编辑按钮：判断是否有权限编辑该用户 -->
              <el-button
                  type="primary"
                  size="small"
                  plain
                  @click="handleEdit(row)"
                  :disabled="row.id === currentUserId || !canOperateUser(row)"
              >
                <el-icon>
                  <Edit/>
                </el-icon>
                编辑
              </el-button>
              <!-- 角色按钮：判断是否有权限修改该用户的角色 -->
              <el-button
                  type="warning"
                  size="small"
                  plain
                  @click="handleRole(row)"
                  :disabled="row.id === currentUserId || !canChangeUserRole(row)"
              >
                <el-icon>
                  <UserFilled/>
                </el-icon>
                角色
              </el-button>
              <!-- 重置密码按钮：判断是否有权限操作该用户 -->
              <el-button
                  type="info"
                  size="small"
                  plain
                  @click="handleResetPwd(row)"
                  :disabled="row.id === currentUserId || !canOperateUser(row)"
              >
                <el-icon>
                  <Lock/>
                </el-icon>
                重置密码
              </el-button>
              <!-- 删除按钮：判断是否有权限删除该用户 -->
              <el-button
                  type="danger"
                  size="small"
                  plain
                  @click="handleDelete(row)"
                  :disabled="row.id === currentUserId || !canOperateUser(row)"
              >
                <el-icon>
                  <Delete/>
                </el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
                     :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
                     @size-change="handleSizeChange" @current-change="handleCurrentChange" class="pagination"/>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <el-form :model="form" ref="formRef" label-width="120px" :rules="rules">
        <!-- 用户名编辑：保留原有权限控制 -->
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :disabled="!canEditUsername"
          />
          <div v-if="!canEditUsername" style="color: #909399; font-size: 12px; margin-top: 4px;">
            <template v-if="form.id === currentUserId.value">
              不可修改自己的用户名
            </template>
            <template v-else>
              无权限修改该用户的用户名
            </template>
          </div>
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入用户姓名"/>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号"/>
        </el-form-item>
        <el-form-item label="所属部门" prop="deptCode">
          <el-select v-model="form.deptCode" placeholder="请选择所属部门" clearable>
            <el-option v-for="dept in deptList" :key="dept.itemCode" :label="dept.itemName" :value="dept.itemCode"/>
          </el-select>
        </el-form-item>
        <!-- 角色选择：只显示当前用户有权限分配的角色 -->
        <el-form-item label="角色" prop="roleId">
          <el-select
              v-model="form.roleId"
              placeholder="请选择角色"
              clearable
              :disabled="!canChangeCurrentUserRole"
          >
            <el-option
                v-for="role in accessibleRoles"
                :key="role.id"
                :label="role.roleName"
                :value="role.id"
            />
          </el-select>
          <div v-if="!canChangeCurrentUserRole" style="color: #909399; font-size: 12px; margin-top: 4px;">
            无权限修改该用户的角色
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
              v-model="form.status"
              active-value="1"
              inactive-value="0"
              :disabled="form.id === currentUserId || !canOperateUser(form)"
          />
        </el-form-item>
        <template v-if="isAdd">
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password autocomplete="new-password"
                      placeholder="请输入密码"/>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" show-password autocomplete="new-password"
                      placeholder="请再次输入密码"/>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="handleSubmit"
            :disabled="!canSubmitForm"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="roleDialog.visible" title="分配角色" width="500px">
      <div v-loading="roleDialog.loading" style="padding: 10px 20px">
        <p style="margin-bottom: 15px; color: #606266;">
          为用户 <b style="color: #409EFF">{{ roleDialog.username }}</b> 分配角色：
        </p>
        <!-- 角色分配：只显示当前用户有权限分配的角色 -->
        <el-radio-group v-model="roleDialog.selectedRoleId">
          <el-radio
              v-for="role in accessibleRoles"
              :key="role.id"
              :label="role.id"
              border
              style="margin-bottom: 10px; margin-left: 0; margin-right: 10px; display: block;"
          >
            {{ role.roleName }}
          </el-radio>
        </el-radio-group>
        <el-empty
            v-if="accessibleRoles.length === 0 && !roleDialog.loading"
            description="无权限分配任何角色"
        />
      </div>
      <template #footer>
        <el-button @click="roleDialog.visible = false">取消</el-button>
        <el-button
            type="primary"
            :loading="roleDialog.submitting"
            @click="submitRoleAssign"
            :disabled="accessibleRoles.length === 0"
        >
          保存修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import userApi from '@/api/user.js'
import { selectItemList } from '@/api/dictItem.js'
import { roleApi } from '@/api/role.js'
import { Edit, Delete, Plus, UserFilled, Lock } from '@element-plus/icons-vue'

// 响应式数据
const currentUserId = ref('')
const currentUserInfo = ref({}) // 当前用户完整信息
const deptList = ref([])
const userList = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const isAdd = ref(true)
const formRef = ref(null)
const roleList = ref([])

// 角色分配弹窗
const roleDialog = reactive({
  visible: false,
  loading: false,
  submitting: false,
  userId: null,
  username: '',
  selectedRoleId: '',
  allRoles: []
})

// 搜索表单
const searchForm = reactive({
  username: '',
  realName: '',
  phone: '',
  deptCode: '',
  status: ''
})

// 表单数据 - 保留roleCode属性
const form = reactive({
  id: '',
  username: '',
  realName: '',
  phone: '',
  deptCode: '',
  roleId: '',
  roleCode: '', // 直接接收行数据的roleCode
  status: '1',
  password: '',
  confirmPassword: ''
})

// 核心配置：角色权限优先级（数值越小，权限越高）
const rolePriority = {
  'ADMIN': 1,   // 管理员（最高权限）
  'DEPT': 2,    // 部门管理员（中间权限）
  'USER': 3     // 普通用户（最低权限）
}

// 计算属性：当前登录用户的角色优先级
const currentUserPriority = computed(() => {
  const currentUserRoleCode = currentUserInfo.value.user?.roleCode || 'USER'
  return rolePriority[currentUserRoleCode] || 3
})

// 计算属性：当前用户可操作的角色列表（只能分配比自己权限低的角色）
const accessibleRoles = computed(() => {
  if (roleList.value.length === 0) return []

  return roleList.value.filter(role => {
    const roleCode = role.roleCode || 'USER'
    const rolePrio = rolePriority[roleCode] || 3
    // 只能操作优先级数值更大的角色（权限更低）
    return rolePrio > currentUserPriority.value
  })
})

// 计算属性：是否有权限新增用户（至少能创建一个角色）
const hasAddUserPermission = computed(() => {
  return accessibleRoles.value.length > 0
})

// 计算属性：是否有权限编辑当前用户的用户名
const canEditUsername = computed(() => {
  // 新增用户：始终可编辑
  if (isAdd.value) return true
  // 编辑自己：不可编辑
  if (form.id === currentUserId.value) return false
  // 编辑他人：判断权限
  const editedUserRoleCode = form.roleCode || 'USER'
  const editedPriority = rolePriority[editedUserRoleCode] || 3
  return currentUserPriority.value < editedPriority
})

// 计算属性：是否有权限修改当前表单用户的角色
const canChangeCurrentUserRole = computed(() => {
  // 新增用户：判断是否有可分配的角色
  if (isAdd.value) return accessibleRoles.value.length > 0
  // 编辑自己：不可修改角色
  if (form.id === currentUserId.value) return false
  // 编辑他人：判断权限
  const editedUserRoleCode = form.roleCode || 'USER'
  const editedPriority = rolePriority[editedUserRoleCode] || 3
  return currentUserPriority.value < editedPriority
})

// 计算属性：是否有权限提交表单
const canSubmitForm = computed(() => {
  // 新增用户：必须有可分配的角色
  if (isAdd.value) return accessibleRoles.value.length > 0
  // 编辑用户：至少有权限操作该用户
  return canOperateUser(form)
})

// 方法：判断是否有权限操作指定用户（编辑/删除/重置密码/修改状态）
const canOperateUser = (user) => {
  // 自己不能操作自己
  if (user.id === currentUserId.value) return false
  // 无角色信息默认无权限
  if (!user.roleCode) return false
  // 判断权限优先级
  const userPriority = rolePriority[user.roleCode] || 3
  return currentUserPriority.value < userPriority
}

// 方法：判断是否有权限修改指定用户的角色
const canChangeUserRole = (user) => {
  // 自己不能修改自己的角色
  if (user.id === currentUserId.value) return false
  // 无角色信息默认无权限
  if (!user.roleCode) return false
  // 判断权限优先级
  const userPriority = rolePriority[user.roleCode] || 3
  return currentUserPriority.value < userPriority
}

// 工具函数：时间格式化
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 工具函数：获取部门名称
const getDeptName = (deptCode) => {
  if (!deptCode) return '未分配'
  const dept = deptList.value.find(d => d.itemCode === deptCode)
  return dept ? dept.itemName : '未分配'
}

// 自定义校验：两次密码一致
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 校验规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
  deptCode: [{ required: true, message: '请选择部门', trigger: 'change' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    // 1. 获取部门列表
    const deptRes = await selectItemList({
      dictId: 10,
      pageNum: 1,
      pageSize: 999,
      status: 1
    })
    deptList.value = deptRes.data?.records || []

    // 2. 获取角色列表
    const roleRes = await roleApi.getAllRoles()
    roleList.value = roleRes.data || []

    // 3. 获取当前用户信息
    const userRes = await userApi.getCurrentUser()
    currentUserInfo.value = userRes.data || {}
    currentUserId.value = currentUserInfo.value.user?.id || ''

    // 4. 获取用户列表
    await getUserList()
  } catch (e) {
    console.error('初始化数据失败:', e)
    ElMessage.error('初始化数据失败')
  } finally {
    loading.value = false
  }
}

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      username: searchForm.username,
      realName: searchForm.realName,
      phone: searchForm.phone,
      status: searchForm.status ? parseInt(searchForm.status) : undefined,
      deptCode: searchForm.deptCode || undefined
    }
    const res = await userApi.getUserPage(params)
    userList.value = res.data?.records || []
    total.value = res.data?.total || 0
    // 转换状态为字符串
    userList.value = userList.value.map(u => ({ ...u, status: u.status?.toString() }))
  } catch (e) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageNum.value = 1
  getUserList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, { username: '', realName: '', phone: '', deptCode: '', status: '' })
  pageNum.value = 1
  getUserList()
}

// 分页大小变更
const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
  getUserList()
}

// 页码变更
const handleCurrentChange = (val) => {
  pageNum.value = val
  getUserList()
}

// 新增用户
const handleAdd = () => {
  isAdd.value = true
  dialogTitle.value = '新增用户'
  // 清空表单
  form.id = ''
  form.username = ''
  form.realName = ''
  form.phone = ''
  form.deptCode = ''
  form.roleId = ''
  form.roleCode = ''
  form.status = '1'
  form.password = ''
  form.confirmPassword = ''
  // 重置校验
  formRef.value?.resetFields()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  isAdd.value = false
  dialogTitle.value = '编辑用户'
  // 复制行数据到表单
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  // 清空密码相关
  form.password = ''
  form.confirmPassword = ''
  dialogVisible.value = true
}

// 打开角色分配弹窗
const handleRole = async (row) => {
  roleDialog.userId = row.id
  roleDialog.username = row.username
  roleDialog.visible = true
  roleDialog.loading = true
  roleDialog.selectedRoleId = row.roleId || ''

  try {
    const allRolesRes = await roleApi.getAllRoles()
    roleDialog.allRoles = allRolesRes.data || []
  } catch (e) {
    ElMessage.error('加载角色信息失败')
  } finally {
    roleDialog.loading = false
  }
}

// 提交角色分配
const submitRoleAssign = async () => {
  if (!roleDialog.selectedRoleId) {
    ElMessage.warning('请选择角色')
    return
  }

  roleDialog.submitting = true
  try {
    await userApi.assignRole(roleDialog.userId, roleDialog.selectedRoleId)
    ElMessage.success('角色分配成功')
    roleDialog.visible = false
    getUserList()
  } catch (e) {
    ElMessage.error('角色分配失败')
  } finally {
    roleDialog.submitting = false
  }
}

// 重置密码
const handleResetPwd = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定要重置用户「${row.username}」的密码吗？重置后密码为默认值「123456」`,
        '警告',
        { type: 'warning' }
    )
    await userApi.resetPassword(row.id)
    ElMessage.success('密码重置成功')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('密码重置失败')
    }
  }
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '警告', { type: 'warning' })
    await userApi.deleteUser(row.id)
    ElMessage.success('删除成功')
    getUserList()
  } catch (e) {}
}

// 修改用户状态
const handleStatusChange = async (row) => {
  try {
    await userApi.updateUserStatus(parseInt(row.status), row.id)
    ElMessage.success('状态更新成功')
    getUserList()
  } catch (e) {
    // 回滚状态
    row.status = row.status === '1' ? '0' : '1'
    ElMessage.error('状态更新失败')
  }
}

// 提交表单（新增/编辑）
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 构造提交数据
    const submitData = { ...form, status: parseInt(form.status) }
    if (!isAdd.value) {
      // 编辑时移除密码字段
      delete submitData.password
      delete submitData.confirmPassword
    }

    // 提交请求
    if (isAdd.value) {
      await userApi.addUser(submitData)
      ElMessage.success('新增成功')
    } else {
      await userApi.updateUser(form.id, submitData)
      ElMessage.success('编辑成功')
    }

    // 关闭弹窗并刷新列表
    dialogVisible.value = false
    getUserList()
  } catch (e) {
    console.error('提交失败:', e)
    if (e !== 'cancel') {
      ElMessage.error('操作失败，请重试')
    }
  }
}

// 重置表单
const resetForm = () => {
  form.id = ''
  form.username = ''
  form.realName = ''
  form.phone = ''
  form.deptCode = ''
  form.roleId = ''
  form.roleCode = ''
  form.status = '1'
  form.password = ''
  form.confirmPassword = ''
  formRef.value?.resetFields()
}

// 关闭弹窗
const handleDialogClose = () => {
  resetForm()
}

// 初始化
onMounted(() => {
  initData()
})
</script>

<style scoped lang="scss">
.user-list-page {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.filter-card {
  margin-bottom: 20px;
}

.list-card {
  .el-table {
    --el-table-header-text-color: #606266;
    --el-table-row-hover-bg-color: #f8f9fa;
  }

  .pagination {
    margin-top: 20px;
    text-align: right;
  }
}

.operation-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;

  .el-button {
    padding: 5px 8px;
  }
}

:deep(.el-table__fixed-right) {
  height: 100% !important;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>