<template>
  <div class="user-list-page">
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable/>
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入真实姓名" clearable/>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable/>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.deptId" placeholder="请选择部门" clearable style="width: 150px">
            <el-option v-for="dept in deptList" :key="dept.id" :label="dept.deptName" :value="dept.id"/>
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
          <el-button type="primary" @click="handleAdd" style="margin-left: 8px;">
            <el-icon>
              <Plus/>
            </el-icon>
            新增用户
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card" shadow="never">
      <el-table style="width: 100%" :data="userList" border stripe v-loading="loading" fit>
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column prop="id" label="ID" width="60" align="center"/>
        <el-table-column prop="username" label="用户名" width="120" align="center"/>
        <el-table-column prop="realName" label="真实姓名" width="120" align="center"/>
        <el-table-column prop="phone" label="手机号" width="150" align="center"/>
        <el-table-column label="所属部门" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="getDeptName(row.deptId) === '未分配' ? 'info' : ''">
              {{ getDeptName(row.deptId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="160" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="1" inactive-value="0" active-text="启用" inactive-text="禁用"
                       @change="handleStatusChange(row)" :disabled="row.id === currentUserId"/>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="260" align="center" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button type="primary" size="small" plain @click="handleEdit(row)"
                         :disabled="row.id === currentUserId">
                <el-icon>
                  <Edit/>
                </el-icon>
                编辑
              </el-button>
              <el-button type="warning" size="small" plain @click="handleRole(row)"
                         :disabled="row.id === currentUserId">
                <el-icon>
                  <UserFilled/>
                </el-icon>
                角色
              </el-button>
              <el-button type="danger" size="small" plain @click="handleDelete(row)"
                         :disabled="row.id === currentUserId">
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
      <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!isAdd"/>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名"/>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号"/>
        </el-form-item>
        <el-form-item label="所属部门" prop="deptId">
          <el-select v-model="form.deptId" placeholder="请选择所属部门" clearable>
            <el-option v-for="dept in deptList" :key="dept.id" :label="dept.deptName" :value="dept.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" active-value="1" inactive-value="0" :disabled="form.id === currentUserId"/>
        </el-form-item>
        <el-form-item label="密码" prop="password" :rules="isAdd ? rules.password : editPasswordRules">
          <el-input v-model="form.password" type="password" show-password autocomplete="new-password"
                    :placeholder="isAdd ? '请输入密码' : '不修改请留空'"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="roleDialog.visible" title="分配角色" width="500px">
      <div v-loading="roleDialog.loading" style="padding: 10px 20px">
        <p style="margin-bottom: 15px; color: #606266;">
          正在为用户 <b style="color: #409EFF">{{ roleDialog.username }}</b> 分配角色：
        </p>
        <el-checkbox-group v-model="roleDialog.selectedRoleIds">
          <el-checkbox v-for="role in roleDialog.allRoles" :key="role.id" :label="role.id" border
                       style="margin-bottom: 10px; margin-left: 0; margin-right: 10px;">
            {{ role.roleName }}
          </el-checkbox>
        </el-checkbox-group>
        <el-empty v-if="roleDialog.allRoles.length === 0 && !roleDialog.loading" description="暂无可分配角色"/>
      </div>
      <template #footer>
        <el-button @click="roleDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="roleDialog.submitting" @click="submitRoleAssign">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, computed} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import userApi from '@/api/user'
import {listDept} from '@/api/dept'
import {roleApi} from '@/api/role' // 请确保有此 API 文件或定义
import {Edit, Delete, Plus, UserFilled} from '@element-plus/icons-vue'

const currentUserId = ref('')
const deptList = ref([])
const userList = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0) // 新增：总记录数
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const isAdd = ref(true)
const formRef = ref(null)

// 角色分配相关响应式数据
const roleDialog = reactive({
  visible: false,
  loading: false,
  submitting: false,
  userId: null,
  username: '',
  selectedRoleIds: [],
  allRoles: []
})

const searchForm = reactive({
  username: '',
  realName: '',
  phone: '',
  deptId: '',
  status: ''
})

const form = reactive({
  id: '',
  username: '',
  realName: '',
  phone: '',
  deptId: '',
  status: '1',
  password: ''
})

// --- 工具函数 ---
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const getDeptName = (deptId) => {
  if (!deptId) return '未分配'
  const dept = deptList.value.find(d => d.id === deptId || d.id === Number(deptId))
  return dept ? dept.deptName : '未分配'
}

// --- 数据获取 ---
const initData = async () => {
  loading.value = true
  try {
    const deptRes = await listDept()
    deptList.value = deptRes.data || []
    const userRes = await userApi.getCurrentUser()
    currentUserId.value = userRes.data?.id || ''
    await getUserList()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const getUserList = async () => {
  loading.value = true
  try {
    // 构造分页查询参数
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      username: searchForm.username,
      realName: searchForm.realName,
      phone: searchForm.phone,
      status: searchForm.status ? parseInt(searchForm.status) : undefined,
      deptId: searchForm.deptId ? (typeof searchForm.deptId === 'string' ? parseInt(searchForm.deptId) : searchForm.deptId) : undefined // 新增：传递部门ID
    }
    const res = await userApi.getUserPage(params)
    // 适配后端返回的PageResult结构
    userList.value = res.data?.records || []
    total.value = res.data?.total || 0
    // 转换状态为字符串，适配前端el-switch
    userList.value = userList.value.map(u => ({...u, status: u.status?.toString()}))
  } catch (e) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initData()
})

// --- 行为处理 ---
const handleSearch = () => {
  pageNum.value = 1
  getUserList() // 查询时重新调用后端接口
}

const handleReset = () => {
  Object.assign(searchForm, {username: '', realName: '', phone: '', deptId: '', status: ''})
  pageNum.value = 1
  getUserList() // 重置后重新调用后端接口
}

const handleSizeChange = val => {
  pageSize.value = val
  pageNum.value = 1
  getUserList() // 页大小变化时重新调用后端接口
}

const handleCurrentChange = val => {
  pageNum.value = val
  getUserList() // 页码变化时重新调用后端接口
}

const handleAdd = () => {
  isAdd.value = true
  dialogTitle.value = '新增用户'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isAdd.value = false
  dialogTitle.value = '编辑用户'
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  form.password = ''
  dialogVisible.value = true
}

// 角色分配入口
const handleRole = async (row) => {
  roleDialog.userId = row.id
  roleDialog.username = row.username
  roleDialog.visible = true
  roleDialog.loading = true
  roleDialog.selectedRoleIds = []
  try {
    // 1. 获取所有可选角色（假设你有一个 roleApi.getAllRoles 方法）
    // 如果没有，可以临时用 listRole() 代替，具体看你 roleApi 的定义
    const allRolesRes = await roleApi.getAllRoles()
    roleDialog.allRoles = allRolesRes.data || []
    // 2. 获取该用户当前拥有的角色ID
    const userRoleIdsRes = await userApi.getUserRoleIds(row.id)
    roleDialog.selectedRoleIds = userRoleIdsRes.data || []
  } catch (e) {
    ElMessage.error('加载角色信息失败')
  } finally {
    roleDialog.loading = false
  }
}

// 角色分配提交
const submitRoleAssign = async () => {
  roleDialog.submitting = true
  try {
    await userApi.assignRoles(roleDialog.userId, roleDialog.selectedRoleIds)
    ElMessage.success('角色分配成功')
    roleDialog.visible = false
  } catch (e) {
    ElMessage.error('角色分配失败')
  } finally {
    roleDialog.submitting = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '警告', {type: 'warning'})
    await userApi.deleteUser(row.id)
    ElMessage.success('删除成功')
    getUserList() // 删除后重新获取列表
  } catch (e) {
  }
}

const handleStatusChange = async (row) => {
  try {
    await userApi.updateUserStatus(parseInt(row.status), row.id)
    ElMessage.success('状态更新成功')
    // 状态修改后重新获取列表，保证数据一致性
    getUserList()
  } catch (e) {
    row.status = row.status === '1' ? '0' : '1'
    ElMessage.error('状态更新失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const data = {...form, status: parseInt(form.status)}
    if (!isAdd.value && !data.password) delete data.password
    if (isAdd.value) await userApi.addUser(data)
    else await userApi.updateUser(form.id, data)
    ElMessage.success(isAdd.value ? '新增成功' : '编辑成功')
    dialogVisible.value = false
    getUserList() // 提交后重新获取列表
  } catch (e) {
    console.error(e)
  }
}

const resetForm = () => {
  Object.assign(form, {id: '', username: '', realName: '', phone: '', deptId: '', status: '1', password: ''})
  formRef.value?.resetFields()
}

const handleDialogClose = () => {
  resetForm()
}

// --- 校验 ---
const rules = {
  username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
  realName: [{required: true, message: '请输入真实姓名', trigger: 'blur'}],
  deptId: [{required: true, message: '请选择部门', trigger: 'change'}],
  password: [{required: true, message: '请输入密码', trigger: 'blur'}, {
    min: 6,
    message: '密码至少6位',
    trigger: 'blur'
  }]
}

const editPasswordRules = [{min: 6, message: '密码至少6位', trigger: 'blur'}]
</script>

<style scoped lang="scss">
.user-list-page {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.filter-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

:deep(.el-table__fixed-right) {
  height: 100% !important;
}
</style>