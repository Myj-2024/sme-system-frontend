<template>
  <div class="app-container">
    <!-- 查询区域 -->
    <el-card shadow="never" style="margin-bottom: 16px;">
      <el-form :model="queryParams" inline @submit.prevent>
        <el-form-item label="通知标题">
          <el-input
              v-model="queryParams.title"
              placeholder="请输入通知标题"
              clearable
              style="width: 200px;"
              @keyup.enter="loadNoticeList"
          />
        </el-form-item>
        <el-form-item label="通知类型">
          <el-select
              v-model="queryParams.noticeType"
              placeholder="请选择通知类型"
              clearable
              style="width: 150px;"
          >
            <el-option
                v-for="item in noticeTypeOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发送人姓名">
          <el-input
              v-model="queryParams.publisherName"
              placeholder="请输入发送人姓名"
              clearable
              style="width: 200px;"
              @keyup.enter="loadNoticeList"
          />
        </el-form-item>
        <el-form-item label="通知内容">
          <el-input
              v-model="queryParams.content"
              placeholder="请输入通知内容关键词"
              clearable
              style="width: 300px;"
              @keyup.enter="loadNoticeList"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="loadNoticeList">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表区域 -->
    <el-card shadow="hover" class="table-card">
      <div class="list-container">
        <div
            v-for="item in noticeList"
            :key="item.id"
            class="list-item"
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
              <div class="item-title" @click="goToDetail(item)">{{ item.title }}</div>
              <div class="item-tag-group">
                <el-tag size="small" type="primary">已发送</el-tag>
                <el-tag size="small" type="danger">{{ formatNoticeType(item.noticeType) }}</el-tag>
                <!-- 核心修改：调用getPublisherName方法获取正确的发布人姓名 -->
                <el-tag size="small" type="success">{{ getPublisherName(item) }}</el-tag>
              </div>
            </div>
            <div class="item-content" @click="goToDetail(item)" v-html="getContentPreview(item.content)"></div>
            <div class="item-meta">
              <!-- 同步修改：使用getPublisherName方法 -->
              <span class="meta-item">👤 {{ getPublisherName(item) }}</span>
              <span class="meta-item">🕒 {{ formatTime(item.publishTime) || '-' }}</span>
            </div>
            <div class="bottem">
              <div class="item-detail">
                <el-button link type="primary" @click="goToDetail(item)" size="small">预览</el-button>
              </div>
              <!-- 操作按钮固定右下角 -->
              <div class="item-actions">
                <el-button link type="primary" @click="openEditDialog(item)" size="small">修改</el-button>
                <el-button link type="danger" @click="handleDelete(item)" size="small">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <el-pagination
          v-show="total > 0"
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          style="margin-top: 20px; text-align: right;"
          background
      />
    </el-card>

    <!-- 编辑弹窗（保留原有逻辑） -->
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
        <el-form-item label="通知标题" prop="title">
          <el-input
              v-model="formData.title"
              placeholder="请输入通知标题"
              maxlength="255"
              show-word-limit
          />
        </el-form-item>
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
        <!--        <el-form-item label="是否置顶" prop="isTop">-->
        <!--          <el-radio-group v-model="formData.isTop">-->
        <!--            <el-radio label="0">否</el-radio>-->
        <!--            <el-radio label="1">是</el-radio>-->
        <!--          </el-radio-group>-->
        <!--        </el-form-item>-->
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
        <el-form-item label="接收范围" prop="targetType">
          <el-radio-group v-model="formData.targetType" @change="handleTargetTypeChange">
            <el-radio label="ALL">全员发送</el-radio>
            <el-radio label="SPECIFIC_USER">指定用户</el-radio>
          </el-radio-group>
        </el-form-item>
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
        <el-form-item label="通知内容" prop="content">
          <editor v-model="formData.content"/>
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

<script>
import {getNoticePage, deleteNotice, updateNotice, getNoticeDetail} from '@/api/notice'
import {listDictItemByDictCode, selectItemList} from '@/api/dictItem'
import userApi from '@/api/user'
import Editor from '@/components/Editor.vue'

export default {
  name: 'NoticeIndex',
  components: {
    Editor
  },
  data() {
    return {
      noticeList: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      queryParams: {
        title: '',
        noticeType: '',
        publisherName: '',
        content: ''
      },
      noticeTypeOptions: [],
      noticeTypeMap: {},
      // 编辑弹窗相关
      editDialogVisible: false,
      editFormRef: null,
      formData: {
        id: '',
        title: '',
        noticeType: '',
        isTop: '0',
        publishTime: '',
        targetType: 'ALL',
        targetUserIds: [],
        content: ''
      },
      formRules: {
        title: [{required: true, message: '请输入通知标题', trigger: 'blur'}],
        noticeType: [{required: true, message: '请选择通知类型', trigger: 'change'}],
        publishTime: [{required: true, message: '请选择发送时间', trigger: 'change'}],
        targetType: [{required: true, message: '请选择接收范围', trigger: 'change'}],
        targetUserIds: [
          {
            required: () => this.formData.targetType === 'SPECIFIC_USER',
            message: '请选择接收用户',
            trigger: 'change'
          }
        ],
        content: [{required: true, message: '请输入通知内容', trigger: 'blur'}]
      },
      // 用户选择弹窗相关
      userDialogVisible: false,
      userSearchQuery: '',
      selectedUserRows: [],
      userTableRef: null,
      deptList: [],
      userList: []
    }
  },
  computed: {
    filteredUserList() {
      if (this.userSearchQuery === '') {
        return this.userList
      }
      return this.userList.filter(user => {
        const usernameMatch = user.username && user.username.toLowerCase().includes(this.userSearchQuery.toLowerCase())
        const realNameMatch = user.realName && user.realName.toLowerCase().includes(this.userSearchQuery.toLowerCase())
        return usernameMatch || realNameMatch
      })
    }
  },
  mounted() {
    this.loadNoticeTypeDict().then(() => {
      this.loadNoticeList()
    })
    this.getDeptList()
    this.getUserList()
  },
  methods: {
    // 新增：获取发布人姓名（兼容多种字段命名）
    getPublisherName(item) {
      // 1. 优先读取直接返回的发布人姓名字段
      if (item.publisherName && item.publisherName.trim()) {
        return item.publisherName.trim()
      }
      if (item.publishUserName && item.publishUserName.trim()) {
        return item.publishUserName.trim()
      }
      if (item.createUserName && item.createUserName.trim()) {
        return item.createUserName.trim()
      }

      // 2. 通过发布人ID转换为姓名（核心修复逻辑）
      let publisherId = null
      if (item.publisherId) {
        publisherId = item.publisherId
      } else if (item.createBy) {
        publisherId = item.createBy
      } else if (item.publishBy) {
        publisherId = item.publishBy
      }

      if (publisherId) {
        const user = this.userList.find(u => u.id == publisherId)
        if (user) {
          return user.realName || user.username || '未知用户'
        }
      }

      // 3. 兜底显示
      return '未知发布人'
    },
    // 跳转到通知详情页
    goToDetail(row) {
      if (row.id) {
        this.$router.push(`/notice/detail/${row.id}`)
      } else {
        this.$message.warning('通知ID不存在，无法查看详情')
      }
    },
    // 加载通知类型字典数据
    async loadNoticeTypeDict() {
      try {
        const res = await listDictItemByDictCode('NOTICE_TYPE')
        this.noticeTypeOptions = res.data?.filter(item => item.status === 1) || []
        this.noticeTypeMap = {}
        this.noticeTypeOptions.forEach(item => {
          this.noticeTypeMap[item.itemCode] = item.itemName
        })
      } catch (error) {
        console.error('加载通知类型字典失败:', error)
        this.$message.error('加载通知类型字典失败')
      }
    },
    // 格式化通知类型
    formatNoticeType(type) {
      if (!type) return '';
      return this.noticeTypeMap[type] || type;
    },
    // 加载通知列表
    async loadNoticeList() {
      try {
        const res = await getNoticePage({
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          ...this.queryParams
        })
        this.noticeList = res.data.records || res.data.list || []
        this.total = res.data.total || this.noticeList.length
        this.noticeList.forEach(item => {
          if (item.isTop === undefined) item.isTop = false
        })
      } catch (error) {
        console.error('加载通知列表失败:', error)
        this.$message.error('加载通知列表失败')
      }
    },
    // 重置查询
    resetQuery() {
      this.queryParams = {
        title: '',
        noticeType: '',
        publisherName: '',
        content: ''
      }
      this.pageNum = 1
      this.loadNoticeList()
    },
    // 打开编辑弹窗
    async openEditDialog(row) {
      try {
        this.resetEditForm()
        const res = await getNoticeDetail(row.id)
        const data = res.data
        if (!data) {
          this.$message.error('通知详情不存在')
          return
        }
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
        // 填充表单
        this.formData = {
          id: data.id,
          title: data.title || '',
          noticeType: data.noticeType || '',
          isTop: (data.isTop || 0).toString(),
          publishTime: data.publishTime || formatCurrentDate(),
          targetType: data.targetType || 'ALL',
          targetUserIds: data.targetType === 'SPECIFIC_USER' && data.targetValue
              ? data.targetValue.split(',').filter(item => item && !isNaN(Number(item))).map(Number)
              : [],
          content: data.content || ''
        }
        this.editDialogVisible = true
      } catch (error) {
        this.$message.error('加载通知详情失败，请重试')
        console.error('加载通知详情失败:', error)
      }
    },
    // 重置编辑表单
    resetEditForm() {
      if (this.editFormRef) {
        this.editFormRef.clearValidate()
      }
      this.formData = {
        id: '',
        title: '',
        noticeType: '',
        isTop: '0',
        publishTime: '',
        targetType: 'ALL',
        targetUserIds: [],
        content: ''
      }
    },
    // 提交编辑表单
    async submitEditForm() {
      try {
        await this.editFormRef.validate()
        const submitData = {
          ...this.formData,
          isTop: Number(this.formData.isTop),
          targetValue: this.formData.targetType === 'SPECIFIC_USER'
              ? this.formData.targetUserIds.join(',')
              : ''
        }
        await updateNotice(submitData)
        this.$message.success('通知修改成功')
        this.editDialogVisible = false
        this.loadNoticeList()
      } catch (error) {
        if (error.name !== 'ValidationError') {
          this.$message.error('修改通知失败')
          console.error('修改通知失败:', error)
        }
      }
    },
    // 获取部门列表
    async getDeptList() {
      try {
        const res = await selectItemList({
          dictId: 10,
          pageNum: 1,
          pageSize: 999,
          status: 1
        })
        this.deptList = res.data?.records || []
      } catch (error) {
        console.error('获取部门列表失败：', error)
      }
    },
    // 获取用户列表
    async getUserList() {
      try {
        const res = await userApi.getUserPage({
          pageNum: 1,
          pageSize: 999
        })
        if (res && res.code === 200 && Array.isArray(res.data?.records)) {
          this.userList = res.data.records || []
          this.userList = this.userList.map(u => ({...u, status: u.status?.toString()}))
        } else {
          this.userList = []
          this.$message.warning('用户列表数据为空')
        }
      } catch (error) {
        this.$message.error('获取用户列表失败')
        console.error('获取用户列表异常：', error)
        this.userList = []
      }
    },
    // 根据用户ID获取用户名
    getUserNameById(userId) {
      const user = this.userList.find(u => u.id === userId)
      return user ? `${user.username}（${user.realName || '未填写'}）` : '未知用户'
    },
    // 根据部门编码获取名称
    getDeptName(deptCode) {
      if (!deptCode) return '未分配'
      const dept = this.deptList.find(d => d.itemCode === deptCode)
      return dept ? dept.itemName : '未分配'
    },
    // 移除用户
    removeUser(userId) {
      this.formData.targetUserIds = this.formData.targetUserIds.filter(id => id !== userId)
    },
    // 打开用户选择弹窗
    openUserSelectDialog() {
      this.userDialogVisible = true
      setTimeout(() => {
        if (this.userTableRef) {
          this.userTableRef.clearSelection()
        }
        this.selectedUserRows = []
        this.userList.forEach(user => {
          if (this.formData.targetUserIds.includes(user.id)) {
            this.selectedUserRows.push(user)
            if (this.userTableRef) {
              this.userTableRef.toggleRowSelection(user, true)
            }
          }
        })
      }, 100)
    },
    // 用户选择变更
    handleUserSelectionChange(val) {
      this.selectedUserRows = val
    },
    // 确认用户选择
    confirmUserSelection() {
      this.formData.targetUserIds = this.selectedUserRows.map(user => user.id)
      this.userDialogVisible = false
    },
    // 接收范围变更
    handleTargetTypeChange(val) {
      if (val === 'ALL') {
        this.formData.targetUserIds = []
        if (this.editFormRef) {
          this.editFormRef.clearValidate('targetUserIds')
        }
      } else if (val === 'SPECIFIC_USER') {
        this.openUserSelectDialog()
      }
    },
    // 过滤用户列表
    filterUserList() {
    },
    // 删除通知
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除这条通知吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteNotice(row.id)
        this.$message.success('删除成功')
        this.loadNoticeList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除通知失败:', error)
          this.$message.error('删除通知失败')
        }
      }
    },
    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      return time.replace('T', ' ').substring(0, 19)
    },

    getContentImages(htmlContent) {
      if (!htmlContent) return [];
      const imgRegex = /<img[^>]+src="([^"]+)"/g;
      const images = [];
      let match;
      while ((match = imgRegex.exec(htmlContent)) !== null) {
        images.push(match[1]);
        if (images.length >= 4) break; // 最多展示4张图
      }
      return images;
    },

    // 内容预览处理
    getContentPreview(htmlContent) {
      if (!htmlContent) return ''
      // 创建临时div解析HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent
      const text = tempDiv.textContent || tempDiv.innerText || ''
      // 截取前120个字符
      return text.length > 120 ? `${text.substring(0, 120)}...` : text.trim()
    },
    // 分页大小变更
    handleSizeChange(val) {
      this.pageSize = val
      this.loadNoticeList()
    },
    // 当前页变更
    handleCurrentChange(val) {
      this.pageNum = val
      this.loadNoticeList()
    }
  }
}
</script>

<style scoped>
.app-container {
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
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

/* 表格卡片样式 */
.table-card {
  background-color: #fff;
  padding: 10px;
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