<template>
  <div class="user-list-page">
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
          <el-select v-model="searchForm.deptId" placeholder="请选择部门" clearable style="width: 150px">
            <el-option
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.deptName"
                :value="dept.id"
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

    <el-card class="list-card" shadow="never">
      <el-table
          style="width: 100%"
          :data="filteredUserList"
          border
          stripe
          v-loading="loading"
          fit
      >
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column prop="id" label="ID" width="60" align="center"/>
        <el-table-column prop="username" label="用户名" width="120" align="center"/>
        <el-table-column prop="realName" label="真实姓名" width="120" align="center"/>
        <el-table-column prop="phone" label="手机号" width="150" align="center"/>

        <el-table-column label="所属部门" width="200" align="center">
          <template #default="{ row }">
            <el-tag :type="getDeptName(row.deptId) === '未分配' ? 'info' : ''">
              {{ getDeptName(row.deptId) }}
            </el-tag>
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
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="200" align="center">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
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
              >编辑</el-button>
              <el-button
                  type="danger"
                  size="small"
                  icon="Delete"
                  @click="handleDelete(row)"
                  :disabled="row.id === currentUserId"
              >删除</el-button>
            </div>
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
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!isAdd" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="所属部门" prop="deptId">
          <el-select v-model="form.deptId" placeholder="请选择所属部门" clearable style="width: 100%">
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
        </el-form-item>
        <el-form-item label="密码" prop="password" :rules="isAdd ? rules.password : editPasswordRules">
          <el-input
              v-model="form.password"
              type="password"
              show-password
              autocomplete="new-password"
              :placeholder="isAdd ? '请输入密码' : '不修改请留空'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import userApi from '@/api/user'
// 修正：解构引入 listDept，因为 dept.js 没有 default export
import { listDept } from '@/api/dept'

// --- 状态变量 ---
const currentUserId = ref('')
const deptList = ref([])
const userList = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(20)
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const isAdd = ref(true)
const formRef = ref(null)

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

// 核心逻辑：获取部门名称
const getDeptName = (deptId) => {
  if (!deptId || deptList.value.length === 0) return '未分配'
  const dept = deptList.value.find(d => d.id === deptId || d.id === Number(deptId))
  return dept ? dept.deptName : '未分配'
}

// --- 数据获取 ---
const initData = async () => {
  loading.value = true
  try {
    // 1. 获取部门列表（先获取部门，方便用户列表匹配名称）
    const deptRes = await listDept()
    deptList.value = deptRes.data || []

    // 2. 获取当前用户
    const userRes = await userApi.getCurrentUser()
    currentUserId.value = userRes.data?.id || ''

    // 3. 获取用户数据
    await getUserList()
  } catch (error) {
    console.error('初始化失败:', error)
  } finally {
    loading.value = false
  }
}

const getUserList = async () => {
  try {
    const res = await userApi.getUserPage({ pageNum: 1, pageSize: 9999 })
    const list = res.data?.list || []
    userList.value = list.map(item => ({
      ...item,
      status: item.status?.toString() // 统一转字符串供 switch 使用
    }))
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

onMounted(() => {
  initData()
})

// --- 计算属性 (前端过滤与分页) ---
const filteredUserList = computed(() => {
  let result = userList.value.filter(item => {
    const matchUser = !searchForm.username || item.username.toLowerCase().includes(searchForm.username.toLowerCase())
    const matchRealName = !searchForm.realName || item.realName.toLowerCase().includes(searchForm.realName.toLowerCase())
    const matchPhone = !searchForm.phone || item.phone.includes(searchForm.phone)
    const matchDept = !searchForm.deptId || item.deptId === searchForm.deptId
    const matchStatus = searchForm.status === '' || item.status === searchForm.status.toString()
    return matchUser && matchRealName && matchPhone && matchDept && matchStatus
  })
  const start = (pageNum.value - 1) * pageSize.value
  return result.slice(start, start + pageSize.value)
})

const filteredTotal = computed(() => {
  return userList.value.filter(item => {
    const matchUser = !searchForm.username || item.username.toLowerCase().includes(searchForm.username.toLowerCase())
    const matchDept = !searchForm.deptId || item.deptId === searchForm.deptId
    const matchStatus = searchForm.status === '' || item.status === searchForm.status.toString()
    return matchUser && matchDept && matchStatus
  }).length
})

// --- 行为处理 ---
const handleSearch = () => { pageNum.value = 1 }
const handleReset = () => {
  Object.assign(searchForm, { username: '', realName: '', phone: '', deptId: '', status: '' })
  pageNum.value = 1
}
const handleSizeChange = (val) => { pageSize.value = val; pageNum.value = 1 }
const handleCurrentChange = (val) => { pageNum.value = val }

const handleAdd = () => {
  isAdd.value = true
  dialogTitle.value = '新增用户'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isAdd.value = false
  dialogTitle.value = '编辑用户'
  resetForm()
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  form.password = '' // 编辑时不显示原密码
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '警告', { type: 'warning' })
    await userApi.deleteUser(row.id)
    ElMessage.success('删除成功')
    getUserList()
  } catch (e) { /* 取消删除 */ }
}

const handleStatusChange = async (row) => {
  try {
    const status = parseInt(row.status)
    await userApi.updateUserStatus(status, row.id)
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === '1' ? '0' : '1' // 失败回滚
    ElMessage.error('状态更新失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const data = { ...form, status: parseInt(form.status) }

    // 如果是编辑且密码为空，则不传密码字段
    if (!isAdd.value && !data.password) delete data.password

    if (isAdd.value) {
      await userApi.addUser(data)
      ElMessage.success('新增成功')
    } else {
      await userApi.updateUser(form.id, data)
      ElMessage.success('编辑成功')
    }
    dialogVisible.value = false
    getUserList()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const resetForm = () => {
  Object.assign(form, { id: '', username: '', realName: '', phone: '', deptId: '', status: '1', password: '' })
  formRef.value?.resetFields()
}
const handleDialogClose = () => { resetForm() }

// --- 校验规则 ---
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '长度不能少于6位', trigger: 'blur' }]
}
const editPasswordRules = [{ min: 6, message: '长度不能少于6位', trigger: 'blur' }]
</script>

<style scoped lang="scss">
.user-list-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}
.filter-card { margin-bottom: 20px; }
.pagination { margin-top: 20px; text-align: right; }
.operation-buttons { display: flex; gap: 8px; justify-content: center; }
</style>