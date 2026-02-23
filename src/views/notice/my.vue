<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px;">
      <!-- 标签页切换：收到的通知 / 发送的通知 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="notice-tabs">
        <el-tab-pane label="我收到的通知" name="received"></el-tab-pane>
        <el-tab-pane label="我发送的通知" name="sent"></el-tab-pane>
      </el-tabs>

      <!-- 👉 我收到的通知区域 -->
      <div v-if="activeTab === 'received'" class="notice-content-wrapper">
        <!-- 统计信息移到这里 -->
        <div class="received-stats">
          <span class="stat-item unread">未读 {{ unreadCount }} 条</span>
          <span class="stat-item read">已读 {{ readCount }} 条</span>
        </div>

        <!-- 空状态 -->
        <div v-if="receivedNoticeList.length === 0" class="empty-wrapper">
          <el-empty description="暂无收到的通知"/>
        </div>

        <!-- 通知列表 -->
        <div v-else class="list-container">
          <div
              v-for="item in receivedNoticeList"
              :key="item.id"
              class="list-item"
              :class="{ 'list-item-unread': item.isRead === 0 }"
              @click="handleReceivedClick(item)"
          >
            <div class="item-left">
              <div class="item-images">
                <div
                    v-for="(img, idx) in getContentImages(item.content)"
                    :key="idx"
                    class="item-image"
                >
                  <img :src="img" alt="通知配图"/>
                </div>
                <!-- 无图片时占位 -->
                <div v-if="!getContentImages(item.content).length" class="item-image placeholder">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </div>
            </div>
            <div class="item-right">
              <div class="item-header">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-tag-group">
                  <el-tag
                      size="small"
                      :type="item.isRead === 0 ? 'danger' : 'success'"
                  >
                    {{ item.isRead === 0 ? '未读' : '已读' }}
                  </el-tag>
                  <el-tag size="small" type="primary">已发送</el-tag>
                </div>
              </div>
              <div class="item-content" v-html="getContentPreview(item.summary || item.content)"></div>
              <div class="item-meta">
                <span class="meta-item">🕒 {{ formatTime(item.publishTime || item.createTime) }}</span>
              </div>
              <div class="bottem">
                <div class="item-detail">
                  <el-button link type="primary" @click.stop="handleReceivedClick(item)" size="small">预览</el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <el-pagination
              v-show="receivedTotal > 0"
              :current-page="receivedQueryParams.pageNum"
              :page-size="receivedQueryParams.pageSize"
              :total="receivedTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleReceivedSizeChange"
              @current-change="handleReceivedPageChange"
              style="margin-top: 20px; text-align: right;"
              background
          />
        </div>
      </div>

      <!-- 👉 我发送的通知区域 -->
      <div v-if="activeTab === 'sent'" class="notice-content-wrapper">
        <!-- 搜索框 -->
        <div class="notice-search-header">
          <el-input
              v-model="searchTitle"
              placeholder="请输入通知标题搜索"
              style="width: 300px"
              clearable
              @keyup.enter="handleSentSearch"
          >
            <template #append>
              <el-button icon="Search" @click="handleSentSearch">
                查询
              </el-button>
            </template>
          </el-input>
          <div class="sent-stats">
            <span class="stat-item published">已发送 {{ sentTotal }} 条通知</span>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="sentNoticeList.length === 0" class="empty-wrapper">
          <el-empty description="暂无已发送的通知"/>
        </div>

        <!-- 通知列表 -->
        <div v-else class="list-container">
          <div
              v-for="item in sentNoticeList"
              :key="item.id"
              class="list-item"
              @click="handleSentClick(item)"
          >
            <div class="item-left">
              <div class="item-images">
                <div
                    v-for="(img, idx) in getContentImages(item.content)"
                    :key="idx"
                    class="item-image"
                >
                  <img :src="img" alt="通知配图"/>
                </div>
                <!-- 无图片时占位 -->
                <div v-if="!getContentImages(item.content).length" class="item-image placeholder">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </div>
            </div>
            <div class="item-right">
              <div class="item-header">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-tag-group">
                  <el-tag size="small" type="primary">已发送</el-tag>
                  <el-tag size="small" :type="item.targetType === 'ALL' ? 'danger' : 'success'">
                    {{ item.targetType === 'ALL' ? '全员通知' : '指定用户' }}
                  </el-tag>
                </div>
              </div>
              <div class="item-content" v-html="getContentPreview(item.summary || item.content)"></div>
              <div class="item-meta">
                <span class="meta-item">🕒 {{ formatTime(item.createTime) }}</span>
              </div>
              <div class="bottem">
                <div class="item-detail">
                  <el-button link type="primary" @click.stop="handleSentClick(item)" size="small">预览</el-button>
                </div>
                <!-- 操作按钮固定右下角 -->
                <div class="item-actions">
                  <el-button link type="primary" @click.stop="openEditDialog(item)" size="small">修改</el-button>
                  <el-button link type="danger" @click.stop="handleSentDelete(item.id)" size="small">删除</el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <el-pagination
              v-show="sentTotal > 0"
              :current-page="sentQueryParams.pageNum"
              :page-size="sentQueryParams.pageSize"
              :total="sentTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSentSizeChange"
              @current-change="handleSentPageChange"
              style="margin-top: 20px; text-align: right;"
              background
          />
        </div>
      </div>
    </el-card>

    <!-- 编辑弹窗：保留原有逻辑 -->
    <el-dialog
        v-model="editDialogVisible"
        title="编辑通知"
        width="800px"
        destroy-on-close
        @close="resetEditForm"
    >
      <el-form
          ref="editFormRef"
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

        <!-- 发送时间 -->
        <el-form-item label="发送时间" prop="publishTime">
          <el-date-picker
              v-model="formData.publishTime"
              type="datetime"
              placeholder="请选择发送时间"
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
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">确定修改</el-button>
      </template>
    </el-dialog>

    <!-- 选择接收用户对话框 -->
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
import {ref, reactive, onMounted, computed, getCurrentInstance, watch} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
// 复用发送页的API和组件
import Editor from '@/components/Editor.vue'
import {
  getMyNoticeList,
  markNoticeAsRead,
  getMySentNoticeList,
  deleteNotice,
  updateNotice,
  getNoticeDetail
} from '@/api/notice'
import {listDictItemByDictCode, selectItemList} from '@/api/dictItem'
import userApi from '@/api/user'
import { emit } from '@/utils/eventBus'

const router = useRouter()
// // 获取父组件（layout）实例
// const instance = getCurrentInstance()
// const parentInstance = instance?.parent?.parent

// ========== 基础变量 ==========
const activeTab = ref('received')
const loginFailedTick = ref(0)

// ========== 我收到的通知 - 变量 ==========
const receivedNoticeList = ref([])
const receivedTotal = ref(0)
const receivedQueryParams = ref({
  pageNum: 1,
  pageSize: 10
})

// 新增：已读/未读统计
const unreadCount = computed(() => {
  return receivedNoticeList.value.filter(item => item.isRead === 0).length
})
const readCount = computed(() => {
  return receivedNoticeList.value.filter(item => item.isRead === 1).length
})

// ========== 我发送的通知 - 变量 ==========
const searchTitle = ref('')
const sentNoticeList = ref([])
const sentTotal = ref(0)
const sentQueryParams = ref({
  pageNum: 1,
  pageSize: 10,
  title: ''
})

// ========== 编辑弹窗 + 复用发送页的核心变量 ==========
const editDialogVisible = ref(false)
const editFormRef = ref(null)

// 表单数据结构
const formData = reactive({
  id: '',
  title: '',
  noticeType: '',
  isTop: '0',
  publishTime: '',
  targetType: 'ALL',
  targetUserIds: [],
  content: ''
})

// 表单校验规则
const formRules = reactive({
  title: [{required: true, message: '请输入通知标题', trigger: 'blur'}],
  noticeType: [{required: true, message: '请选择通知类型', trigger: 'change'}],
  publishTime: [{required: true, message: '请选择发送时间', trigger: 'change'}],
  targetType: [{required: true, message: '请选择接收范围', trigger: 'change'}],
  targetUserIds: [
    {
      required: () => formData.targetType === 'SPECIFIC_USER',
      message: '请选择接收用户',
      trigger: 'change'
    }
  ],
  content: [{required: true, message: '请输入通知内容', trigger: 'blur'}]
})

// 用户选择弹窗变量
const userDialogVisible = ref(false)
const userSearchQuery = ref('')
const selectedUserRows = ref([])
const userTableRef = ref(null)

// 字典/用户数据变量
const noticeTypeOptions = ref([])
const deptList = ref([])
const userList = ref([])

// ========== 通用方法 ==========
// 格式化当前时间
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

// 格式化时间
const formatTime = (time) => {
  if (!time) return '未知'
  return time.replace('T', ' ').substring(0, 19)
}

// 内容预览处理
const getContentPreview = (htmlContent) => {
  if (!htmlContent) return ''
  // 创建临时div解析HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  const text = tempDiv.textContent || tempDiv.innerText || ''
  // 截取前120个字符
  return text.length > 120 ? `${text.substring(0, 120)}...` : text.trim()
}

// 用户筛选逻辑
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

// 根据ID获取用户名
const getUserNameById = (userId) => {
  const user = userList.value.find(u => u.id === userId)
  return user ? `${user.username}（${user.realName || '未填写'}）` : '未知用户'
}

// 根据部门编码获取名称
const getDeptName = (deptCode) => {
  if (!deptCode) return '未分配'
  const dept = deptList.value.find(d => d.itemCode === deptCode)
  return dept ? dept.itemName : '未分配'
}

// 移除用户逻辑
const removeUser = (userId) => {
  formData.targetUserIds = formData.targetUserIds.filter(id => id !== userId)
}

// 打开用户选择弹窗逻辑
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

// 用户选择变更逻辑
const handleUserSelectionChange = (val) => {
  selectedUserRows.value = val
}

// 确认用户选择逻辑
const confirmUserSelection = () => {
  formData.targetUserIds = selectedUserRows.value.map(user => user.id)
  userDialogVisible.value = false
}

// 筛选用户列表（空方法）
const filterUserList = () => {
}

// 接收范围变更逻辑
const handleTargetTypeChange = (val) => {
  if (val === 'ALL') {
    formData.targetUserIds = []
    if (editFormRef.value) {
      editFormRef.value.clearValidate('targetUserIds')
    }
  } else if (val === 'SPECIFIC_USER') {
    openUserSelectDialog()
  }
}

// ========== 初始化数据方法 ==========
// 获取通知类型字典项
const getNoticeTypeOptions = async () => {
  try {
    const res = await listDictItemByDictCode('notice_type')
    noticeTypeOptions.value = res.data || []
  } catch (error) {
    console.error('获取通知类型字典项失败：', error)
    noticeTypeOptions.value = [
      {itemCode: 'NOTICE', itemName: '普通'},
      {itemCode: 'WARNING', itemName: '警告'},
      {itemCode: 'URGENT', itemName: '紧急'}
    ]
  }
}

// 提取富文本中的图片（优化图片提取逻辑）
const getContentImages = (htmlContent) => {
  if (!htmlContent) return [];
  const imgRegex = /<img[^>]+src="([^"]+)"/g;
  const images = [];
  let match;
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    images.push(match[1]);
    if (images.length >= 4) break; // 最多展示4张图
  }
  return images;
}

// 获取部门字典项
const getDeptList = async () => {
  try {
    const res = await selectItemList({
      dictId: 10,
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

// ========== 编辑弹窗专属方法 ==========
// 打开编辑弹窗并加载数据
const openEditDialog = async (row) => {
  try {
    // 初始化基础数据（首次打开时）
    if (noticeTypeOptions.value.length === 0) {
      await Promise.all([
        getNoticeTypeOptions(),
        getDeptList(),
        getUserList()
      ])
    }

    // 重置表单
    resetEditForm()
    // 获取通知详情
    const res = await getNoticeDetail(row.id)
    const data = res.data
    if (!data) {
      ElMessage.error('通知详情不存在')
      return
    }

    // 填充表单
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

    // 打开弹窗
    editDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载通知详情失败，请重试')
    console.error('加载通知详情失败:', error)
  }
}

// 重置编辑表单
const resetEditForm = () => {
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
  formData.id = ''
  formData.title = ''
  formData.noticeType = ''
  formData.isTop = '0'
  formData.publishTime = formatCurrentDate()
  formData.targetType = 'ALL'
  formData.targetUserIds = []
  formData.content = ''
}

// 提交编辑表单
const submitEditForm = async () => {
  try {
    // 表单校验
    await editFormRef.value.validate()

    // 组装参数
    const submitData = {
      ...formData,
      isTop: Number(formData.isTop),
      targetValue: formData.targetType === 'SPECIFIC_USER'
          ? formData.targetUserIds.join(',')
          : ''
    }

    // 调用修改接口
    await updateNotice(submitData)
    ElMessage.success('通知修改成功')

    // 关闭弹窗 + 刷新列表
    editDialogVisible.value = false
    getSentList()
  } catch (error) {
    if (error.name !== 'ValidationError') {
      ElMessage.error('修改通知失败')
      console.error('修改通知失败:', error)
    }
  }
}

// ========== 原有方法 ==========
// 获取收到的通知列表
const getReceivedList = async () => {
  try {
    const res = await getMyNoticeList(receivedQueryParams.value)
    receivedNoticeList.value = res.data.records || []
    receivedTotal.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('加载我的通知失败，请重试')
    console.error('加载我的通知失败:', error)
  }
}

// 点击收到的通知（添加实时刷新）
const handleReceivedClick = async (row) => {
  try {
    // 1. 如果是未读通知，先标记为已读
    let isUnread = row.isRead === 0
    if (isUnread) {
      await markNoticeAsRead(row.id)
    }

    // 2. 刷新当前列表（更新未读/已读统计）
    await getReceivedList()

    // 3. 🔥 触发全局事件，通知Layout刷新未读角标（核心修改）
    emit('refreshUnreadNotice')

    // 4. 跳转到详情页
    await router.push(`/notice/detail/${row.id}`)

    // 5. 监听路由返回，兜底刷新
    const removeListener = router.afterEach((to) => {
      if (to.path.includes('/notice/my-notice')) { // 你的通知列表页路由
        getReceivedList()
        emit('refreshUnreadNotice') // 再次触发刷新
      }
      removeListener()
    })
  } catch (error) {
    ElMessage.error('操作失败，请重试')
    console.error('通知操作失败:', error)
  }
}

// 额外：路由更新时刷新
import { onBeforeRouteUpdate } from 'vue-router'
onBeforeRouteUpdate((to) => {
  if (to.path.includes('/notice/my-notice')) {
    getReceivedList()
    emit('refreshUnreadNotice')
  }
})


// 收到的通知分页切换
const handleReceivedPageChange = (page) => {
  receivedQueryParams.value.pageNum = page
  getReceivedList()
}

// 收到的通知分页大小变更
const handleReceivedSizeChange = (val) => {
  receivedQueryParams.value.pageSize = val
  getReceivedList()
}

// 获取发送的通知列表
const getSentList = async () => {
  try {
    const res = await getMySentNoticeList(sentQueryParams.value)
    sentNoticeList.value = res.data.records || []
    sentTotal.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('加载我发送的通知失败，请重试')
    console.error('加载我发送的通知失败:', error)
  }
}

// 搜索发送的通知
const handleSentSearch = () => {
  sentQueryParams.value.pageNum = 1
  sentQueryParams.value.title = searchTitle.value
  getSentList()
}

// 发送的通知分页切换
const handleSentPageChange = (page) => {
  sentQueryParams.value.pageNum = page
  getSentList()
}

// 发送的通知分页大小变更
const handleSentSizeChange = (val) => {
  sentQueryParams.value.pageSize = val
  getSentList()
}

// 点击发送的通知
const handleSentClick = (row) => {
  router.push(`/notice/detail/${row.id}`)
}

// 删除发送的通知
const handleSentDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除这条通知吗？删除后将无法恢复',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
    await deleteNotice(id)
    ElMessage.success('通知删除成功')
    getSentList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
      console.error('删除通知失败:', error)
    }
  }
}

// 标签页切换
const handleTabChange = (tab) => {
  if (tab === 'received') {
    getReceivedList()
  } else if (tab === 'sent') {
    getSentList()
  }
}

// ========== 初始化 ==========
onMounted(() => {
  getReceivedList()
  // 提前加载字典/用户数据
  Promise.all([
    getNoticeTypeOptions(),
    getDeptList(),
    getUserList()
  ]).catch(error => {
    console.error('初始化基础数据失败:', error)
  })
})

// 登录失败监听
watch(loginFailedTick, () => {
})
</script>

<style scoped>
.app-container {
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

/* 标签页样式 */
.notice-tabs {
  margin-bottom: 2px;
}

/* 收到的通知统计样式 */
.received-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 14px;
}

.stat-item {
  padding: 4px 8px;
  border-radius: 4px;
}

.stat-item.unread {
  color: #f56c6c;
  background-color: #fef0f0;
}

.stat-item.read {
  color: #67c23a;
  background-color: #f0f9eb;
}

/* 发送通知统计样式 */
.notice-search-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.sent-stats {
  font-size: 13px;
  color: #409eff;
}

.stat-item.published {
  padding: 6px 8px;
  background-color: #ecf5ff;
  border-radius: 4px;
}

/* 内容容器 */
.notice-content-wrapper {
  width: 100%;
}

/* 头部标题/搜索 */
.notice-search-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

/* 列表容器样式 */
.list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 单条数据项样式 - 卡片化 */
.list-item {
  display: flex;
  border: rgba(213, 213, 213, 0.56) 1px solid;
  gap: 16px;
  padding: 15px;
  background-color: #fff;
  transition: box-shadow 0.2s ease;
  border-radius: 8px;
  cursor: pointer;
}

.list-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 未读卡片样式 */
.list-item-unread {
  border-left: 4px solid #f56c6c;
  background-color: #fef9f9;
}

.list-item-unread:hover {
  box-shadow: 0 4px 16px rgba(245, 108, 108, 0.15);
}

/* 左侧图片区域 */
.item-left {
  flex-shrink: 0;
  width: 92px;
  margin-right: 10px;
  margin-left: 5px;
}

.item-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  height: 140px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.item-image {
  border: #bababa 1px solid;
  width: 90px;
  height: 90px;
  background-color: #f8f9fa;
  overflow: hidden;
  border-radius: 4px;
}

/* 无图片占位（通知图标） */
.item-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 24px;
}

/* 右侧内容区域 */
.item-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 140px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  max-width: 70%;
  transition: color 0.2s;
}

.item-title:hover {
  color: #409eff;
}

.item-tag-group {
  display: flex;
  gap: 10px;
}

.item-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  word-break: break-all;
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bottem {
  border-top: rgba(209, 209, 209, 0.57) 1px solid;
  padding-top: 8px;
}

.item-detail {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
}

/* 操作按钮 - 固定右下角 */
.item-actions {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 空状态 */
.empty-wrapper {
  padding: 40px 0;
  text-align: center;
}

/* 分页样式 */
:deep(.el-pagination) {
  margin-top: 20px;
}

/* 按钮样式优化 */
:deep(.el-button--link) {
  font-size: 12px;
  padding: 4px 8px;
}

/* 编辑弹窗用户标签样式 */
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