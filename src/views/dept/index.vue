<template>
  <div class="dept-user-page">
    <!-- 查询表单 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline @submit.prevent>
        <el-form-item label="部门名称">
          <el-input v-model="searchForm.deptName" placeholder="请输入部门名称" clearable />
        </el-form-item>
        <el-form-item label="部门编码">
          <el-input v-model="searchForm.deptCode" placeholder="请输入部门编码" clearable />
        </el-form-item>
        <el-form-item label="人员姓名">
          <el-input v-model="searchForm.userName" placeholder="请输入人员姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" icon="User" @click="openAddUserDialog" style="margin-left: 8px;">
            新增部门人员
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 部门人员列表（从deptApi获取） -->
    <el-card class="list-card" shadow="never">
      <el-table
          style="width: 100%"
          :data="deptUserList"
          border
          stripe
          :loading="loading"
          fit
      >
        <el-table-column prop="id" label="ID" width="60" align="center"/>
        <el-table-column prop="deptCode" label="部门编码" width="120" align="center"/>
        <el-table-column prop="deptName" label="部门名称" width="180" align="center"/>
        <el-table-column prop="leader" label="人员姓名" width="120" align="center"/>
        <el-table-column prop="phone" label="联系电话" width="150" align="center"/>
        <el-table-column prop="position" label="职务" width="120" align="center"/>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="200" align="center">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 空数据提示 -->
      <div v-if="!loading && deptUserList.length === 0" class="empty-tip">
        <el-empty description="暂无部门人员数据" />
      </div>
    </el-card>

    <!-- 新增部门人员弹窗（使用deptApi.insertDept） -->
    <el-dialog v-model="addUserDialogVisible" title="新增部门人员" width="500px" @close="resetUserForm">
      <el-form :model="userForm" ref="userFormRef" label-width="100px" :rules="userRules">
        <!-- 部门名称：从字典选择 -->
        <el-form-item label="部门名称" prop="deptName">
          <el-select v-model="userForm.deptName" placeholder="请选择部门名称" clearable>
            <el-option
                v-for="item in deptDictItems"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemName"
            />
          </el-select>
        </el-form-item>

        <!-- 部门编码：自动填充 -->
        <el-form-item label="部门编码" prop="deptCode">
          <el-input v-model="userForm.deptCode" disabled placeholder="选择部门后自动填充" />
        </el-form-item>

        <!-- 人员信息（对应dept表的leader/phone/position） -->
        <el-form-item label="人员姓名" prop="leader">
          <el-input v-model="userForm.leader" placeholder="请输入人员姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="职务" prop="position">
          <el-input v-model="userForm.position" placeholder="请输入职务" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddUser">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElEmpty, ElTag } from 'element-plus'
import dictApi from '@/api/dict'
// 使用你提供的deptApi
import deptApi from '@/api/dept'

// 时间格式化
const formatTime = (time) => {
  if (!time) return '-'
  let date = new Date(time)
  if (isNaN(date.getTime())) date = new Date(parseInt(time))
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 搜索表单
const searchForm = reactive({
  deptName: '',
  deptCode: '',
  userName: ''
})

// 数据列表（从deptApi获取）
const deptUserList = ref([]) // 对应dept表数据
const deptDictItems = ref([]) // 部门字典项
const loading = ref(false)

// 获取部门字典项
const getDeptDictItems = async () => {
  try {
    const res = await dictApi.getDictItemByCode('dept_type')
    deptDictItems.value = res.data?.list || res.data || []
  } catch (error) {
    ElMessage.warning('获取部门字典项失败')
  }
}

// 获取部门列表（使用deptApi.getDeptList）
const getDeptUserList = async () => {
  loading.value = true
  try {
    const res = await deptApi.getDeptList()
    // 适配deptApi返回格式（假设返回[{id:1, deptName:'xxx', leader:'xxx', ...}]）
    deptUserList.value = res.data?.code === 200 ? res.data.data : (Array.isArray(res.data) ? res.data : [])
    // 格式化状态为数字
    deptUserList.value = deptUserList.value.map(item => ({
      ...item,
      status: item.status ? parseInt(item.status) : 1,
      position: item.position || '无' // 兼容空职务
    }))
  } catch (error) {
    ElMessage.error('获取部门列表失败：' + error.message)
    deptUserList.value = []
  } finally {
    loading.value = false
  }
}

// 页面加载
onMounted(async () => {
  await getDeptDictItems()
  await getDeptUserList()
})

// 新增表单
const addUserDialogVisible = ref(false)
const userFormRef = ref(null)
const userForm = reactive({
  deptName: '',
  deptCode: '',
  leader: '', // 对应dept表的leader字段（人员姓名）
  phone: '',
  position: '',
  status: 1
})

// 自动填充部门编码
watch(() => userForm.deptName, (newName) => {
  if (!newName) {
    userForm.deptCode = ''
    return
  }
  const matchItem = deptDictItems.value.find(item => item.itemName === newName)
  userForm.deptCode = matchItem ? matchItem.itemCode : ''
})

// 表单校验规则
const userRules = {
  deptName: [{ required: true, message: '请选择部门名称', trigger: 'change' }],
  deptCode: [{ required: true, message: '部门编码自动填充', trigger: 'change' }],
  leader: [{ required: true, message: '请输入人员姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 打开新增弹窗
const openAddUserDialog = () => {
  resetUserForm()
  addUserDialogVisible.value = true
}

// 提交新增（使用deptApi.insertDept）
const handleAddUser = async () => {
  if (!userFormRef.value) return
  await userFormRef.value.validate()

  try {
    // 调用deptApi.insertDept（对应dept表的新增）
    const res = await deptApi.insertDept({
      deptName: userForm.deptName,
      deptCode: userForm.deptCode,
      leader: userForm.leader,
      phone: userForm.phone,
      position: userForm.position,
      status: userForm.status,
      // 补全dept表所需的默认字段
      parentId: 0,
      delFlag: 0,
      createTime: new Date(),
      updateTime: new Date()
    })

    if (res.data?.code === 200 || res.data) {
      ElMessage.success('新增部门人员成功')
      addUserDialogVisible.value = false
      resetUserForm()
      await getDeptUserList() // 刷新列表
    } else {
      ElMessage.error('新增失败：' + res.data?.msg || '系统异常')
    }
  } catch (error) {
    ElMessage.error('新增失败：' + error.message)
  }
}

// 重置表单
const resetUserForm = () => {
  userForm.deptName = ''
  userForm.deptCode = ''
  userForm.leader = ''
  userForm.phone = ''
  userForm.position = ''
  userForm.status = 1
  if (userFormRef.value) userFormRef.value.resetFields()
}

// 查询/重置
const handleSearch = () => {
  getDeptUserList().then(() => {
    deptUserList.value = deptUserList.value.filter(item => {
      const deptNameMatch = !searchForm.deptName || item.deptName.includes(searchForm.deptName)
      const deptCodeMatch = !searchForm.deptCode || item.deptCode.includes(searchForm.deptCode)
      const userNameMatch = !searchForm.userName || item.leader.includes(searchForm.userName)
      return deptNameMatch && deptCodeMatch && userNameMatch
    })
  })
}
const handleReset = () => {
  searchForm.deptName = ''
  searchForm.deptCode = ''
  searchForm.userName = ''
  getDeptUserList()
}
</script>

<style scoped lang="scss">
.dept-user-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}
.filter-card { margin-bottom: 20px; }
.list-card { border-radius: 4px; }
.empty-tip { text-align: center; padding: 40px 0; }
:deep(.el-tag) { font-size: 12px; padding: 2px 8px; }
</style>