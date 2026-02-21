<template>
  <div class="notice-form-container">
    <el-card shadow="never">
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
      >
        <!-- 通知标题 -->
        <el-form-item label="通知标题" prop="title">
          <el-input
              v-model="formData.title"
              placeholder="请输入通知标题"
              maxlength="255"
              show-word-limit
          />
        </el-form-item>

        <!-- 通知类型 - 从字典项API获取 -->
        <el-form-item label="通知类型" prop="noticeType">
          <el-select v-model="formData.noticeType" placeholder="请选择通知类型">
            <el-option
                v-for="item in noticeTypeOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>

        <!-- 是否置顶 -->
        <el-form-item label="是否置顶" prop="isTop">
          <el-radio-group v-model="formData.isTop">
            <el-radio label="0">否</el-radio>
            <el-radio label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 发布时间 -->
        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker
              v-model="formData.publishTime"
              type="datetime"
              placeholder="请选择发布时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
          />
        </el-form-item>

        <!-- 接收范围 -->
        <el-form-item label="接收范围" prop="targetType">
          <el-radio-group v-model="formData.targetType" @change="handleTargetTypeChange">
            <el-radio label="ALL">全员发送</el-radio>
            <el-radio label="SPECIFIC_USER">指定用户</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 指定用户-->
        <el-form-item
            label="已选择"
            prop="targetUserIds"
            v-if="formData.targetType === 'SPECIFIC_USER'"
        >
          <div class="selected-users" v-if="formData.targetUserIds.length > 0">
            <el-tag
                v-for="userId in formData.targetUserIds"
                :key="userId"
                closable
                @close="removeUser(userId)"
                class="user-tag"
            >
              <span class="user-tag-text">{{ getUserNameById(userId) }}</span>
            </el-tag>
          </div>
        </el-form-item>

        <!-- 通知内容 -->
        <el-form-item label="通知内容" prop="content">
          <Editor v-model="formData.content"/>
        </el-form-item>

        <el-form-item label="" class="form-btn-group">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 选择接收用户对话框（移到此处，确保始终可渲染） -->
    <el-dialog
        v-model="userDialogVisible"
        title="选择接收用户"
        width="700px"
        @close="userDialogVisible = false"
    >
      <el-input
          v-model="userSearchQuery"
          placeholder="请输入用户名/姓名搜索"
          clearable
          style="margin-bottom: 10px;"
          @input="filterUserList"
      />

      <el-table
          :data="filteredUserList"
          border
          stripe
          style="width: 100%"
          :selectable="(row) => true"
          @selection-change="handleUserSelectionChange"
          ref="userTableRef"
      >
        <el-table-column type="selection" width="50"/>
        <el-table-column prop="id" label="ID" width="60" align="center"/>
        <el-table-column prop="username" label="用户名" width="120" align="center"/>
        <el-table-column prop="realName" label="姓名" width="120" align="center"/>
        <el-table-column prop="phone" label="手机号" width="150" align="center"/>
        <el-table-column prop="deptCode" label="所属部门" min-width="150" align="center">
          <template #default="{ row }">
            {{ getDeptName(row.deptCode) }}
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUserSelection">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import Editor from '@/components/Editor.vue'
import { saveNotice, updateNotice, getNoticeDetail } from '@/api/notice'
// 导入你已有的API
import {listDictItemByDictCode, selectItemList} from '@/api/dictItem'
import userApi from '@/api/user'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const isEdit = ref(!!route.params.id)

const userDialogVisible = ref(false)
const userSearchQuery = ref('')
const selectedUserRows = ref([])
const userTableRef = ref(null)

// 通知类型选项：从字典项API获取
const noticeTypeOptions = ref([])
// 部门列表：从字典项API获取
const deptList = ref([])
// 用户列表：从用户API获取
const userList = ref([])

const formatCurrentDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formData = reactive({
  id: '',
  title: '',
  noticeType: '',
  isTop: '0',
  publishTime: formatCurrentDate(),
  targetType: 'ALL',
  targetUserIds: [],
  content: ''
})

const formRules = reactive({
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  noticeType: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  publishTime: [{ required: true, message: '请选择发布时间', trigger: 'change' }],
  targetType: [{ required: true, message: '请选择接收范围', trigger: 'change' }],
  targetUserIds: [
    {
      required: () => formData.targetType === 'SPECIFIC_USER',
      message: '请选择接收用户',
      trigger: 'change'
    }
  ],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }]
})

// 筛选用户列表（基于用户列表）
const filteredUserList = computed(() => {
  if (userSearchQuery.value === '') {
    return userList.value
  }
  return userList.value.filter(user => {
    const usernameMatch = user.username && user.username.toLowerCase().includes(userSearchQuery.value.toLowerCase())
    const realNameMatch = user.realName && user.realName.toLowerCase().includes(userSearchQuery.value.toLowerCase())
    return usernameMatch || realNameMatch
  })
})

// 根据用户ID获取用户名（基于用户列表）
const getUserNameById = (userId) => {
  const user = userList.value.find(u => u.id === userId)
  return user ? `${user.username}（${user.realName || '未填写'}）` : '未知用户'
}

// 根据部门编码获取部门名称（基于部门字典）
const getDeptName = (deptCode) => {
  if (!deptCode) return '未分配'
  const dept = deptList.value.find(d => d.itemCode === deptCode)
  return dept ? dept.itemName : '未分配'
}

const removeUser = (userId) => {
  formData.targetUserIds = formData.targetUserIds.filter(id => id !== userId)
}

const openUserSelectDialog = () => {
  userDialogVisible.value = true
  setTimeout(() => {
    if (userTableRef.value) {
      userTableRef.value.clearSelection()
    }
    selectedUserRows.value = []
    userList.value.forEach(user => {
      if (formData.targetUserIds.includes(user.id)) {
        selectedUserRows.value.push(user)
        if (userTableRef.value) {
          userTableRef.value.toggleRowSelection(user, true)
        }
      }
    })
  }, 100)
}

const handleUserSelectionChange = (val) => {
  selectedUserRows.value = val
}

const confirmUserSelection = () => {
  formData.targetUserIds = selectedUserRows.value.map(user => user.id)
  userDialogVisible.value = false
}

const filterUserList = () => {}

const handleTargetTypeChange = (val) => {
  if (val === 'ALL') {
    formData.targetUserIds = []
    formRef.value.clearValidate('targetUserIds')
  } else if (val === 'SPECIFIC_USER') {
    // 切换到指定用户时，直接弹出选择用户对话框
    openUserSelectDialog()
  }
}

// 获取通知类型字典项（按字典编码查询）
const getNoticeTypeOptions = async () => {
  try {
    // 使用字典编码 notice_type 来获取字典项
    const res = await listDictItemByDictCode('notice_type')
    noticeTypeOptions.value = res.data || []
  } catch (error) {
    console.error('获取通知类型字典项失败：', error)
    // 兜底：如果接口调用失败，保留原有硬编码值，防止页面异常
    noticeTypeOptions.value = [
      { itemCode: 'NOTICE', itemName: '普通' },
      { itemCode: 'WARNING', itemName: '警告' },
      { itemCode: 'URGENT', itemName: '紧急' }
    ]
  }
}

// 获取部门字典项
const getDeptList = async () => {
  try {
    const res = await selectItemList({
      dictId: 10, // 部门字典ID
      pageNum: 1,
      pageSize: 999,
      status: 1
    })
    deptList.value = res.data?.records || []
  } catch (error) {
    console.error('获取部门列表失败：', error)
  }
}

// 获取用户列表
const getUserList = async () => {
  try {
    const res = await userApi.getUserPage({
      pageNum: 1,
      pageSize: 999
    })
    if (res && res.code === 200 && Array.isArray(res.data?.records)) {
      userList.value = res.data.records || []
      // 转换状态为字符串，适配前端el-switch
      userList.value = userList.value.map(u => ({...u, status: u.status?.toString()}))
    } else {
      userList.value = []
      ElMessage.warning('用户列表数据为空')
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error('获取用户列表异常：', error)
    userList.value = []
  }
}

const getEditData = async () => {
  try {
    const res = await getNoticeDetail(route.params.id)
    const data = res.data
    if (!data) {
      ElMessage.error('通知详情不存在')
      router.push('/notice/index')
      return
    }
    formData.id = data.id
    formData.title = data.title || ''
    formData.noticeType = data.noticeType || ''
    formData.isTop = (data.isTop || 0).toString()
    formData.publishTime = data.publishTime || formatCurrentDate()
    formData.targetType = data.targetType || 'ALL'
    if (data.targetType === 'SPECIFIC_USER' && data.targetValue) {
      formData.targetUserIds = data.targetValue
          .split(',')
          .filter(item => item && !isNaN(Number(item)))
          .map(Number)
    } else {
      formData.targetUserIds = []
    }
    formData.content = data.content || ''
  } catch (error) {
    ElMessage.error('获取通知详情失败')
    console.error('获取通知详情异常：', error)
  }
}

const resetForm = () => {
  ElMessageBox.confirm('确定要重置表单吗？重置后已填写的内容将清空', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
    formData.isTop = '0'
    formData.targetType = 'ALL'
    formData.publishTime = formatCurrentDate()
    formData.targetUserIds = []
    ElMessage.success('表单已重置')
  }).catch(() => {
    ElMessage.info('已取消重置')
  })
}

const submitForm = async () => {
  try {
    await formRef.value.validate()

    const submitData = {
      ...formData,
      isTop: Number(formData.isTop),
      targetValue: formData.targetType === 'SPECIFIC_USER'
          ? formData.targetUserIds.join(',')
          : ''
    }

    if (!isEdit.value) {
      delete submitData.id
    }

    if (isEdit.value) {
      await updateNotice(submitData)
      ElMessage.success('编辑通知成功')
    } else {
      await saveNotice(submitData)
      ElMessage.success('发布通知成功')
    }

    router.push('/notice/index')
  } catch (error) {
    if (error.name !== 'ValidationError') {
      ElMessage.error(isEdit.value ? '编辑通知失败' : '发布通知失败')
      console.error('提交表单异常：', error)
    }
  }
}

onMounted(async () => {
  try {
    // 初始化时获取字典和用户数据
    await getNoticeTypeOptions()
    await getDeptList()
    await getUserList()
    // 编辑场景获取通知详情
    if (isEdit.value) {
      await getEditData()
    }
  } catch (error) {
    ElMessage.error('页面初始化失败，请刷新重试')
    console.error('初始化异常：', error)
  }
})
</script>

<style scoped>
.notice-form-container {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.form-btn-group {
  text-align: center;
  margin-top: 20px;
}

.selected-users {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.user-tag {
  background-color: #ecf5ff !important;
  border-color: #b3d8ff !important;
  color: #409eff !important;
  border-radius: 4px;
  padding: 4px 8px;
  transition: all 0.2s ease;
}

.user-tag:hover {
  background-color: #d9ecff !important;
  border-color: #8cc0ff !important;
}

.user-tag-text {
  font-size: 13px;
  font-weight: 500;
}

:deep(.tox-tinymce) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
}

:deep(.tox-editor-header) {
  border-bottom: 1px solid #dcdfe6;
}
</style>