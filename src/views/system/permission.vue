<template>
  <div class="permission-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="菜单名称">
          <el-input
              v-model="searchForm.name"
              placeholder="请输入菜单名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="菜单编码">
          <el-input
              v-model="searchForm.code"
              placeholder="请输入菜单编码"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="never">
      <el-table
          v-loading="loading"
          :data="tableData"
          border
          stripe
          style="width: 100%; font-size: 12px"
          highlight-current-row
      >
        <!-- 核心修改：计算全局序号 -->
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">
            {{ (pagination.currentPage - 1) * pagination.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="菜单名称" min-width="120" show-overflow-tooltip align="center"/>
        <el-table-column prop="code" label="菜单编码" min-width="150" show-overflow-tooltip align="center"/>
        <el-table-column prop="type" label="菜单类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="150" show-overflow-tooltip align="center"/>
        <el-table-column label="图标" width="80" align="center">
          <template #default="{ row }">
            <!-- 修改：显示图标图片而非文字 -->
            <div v-if="row.iconUrl" class="icon-preview-table">
              <el-image
                  :src="row.iconUrl"
                  fit="contain"
                  @error="handleImageError(row)"
              >
                <template #error>
                  <span class="img-fallback-table">图标加载失败</span>
                </template>
              </el-image>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="60" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="140" align="center">
          <template #default="{ row }">
            {{ row.createTime ? formatTime(row.createTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="140" align="center">
          <template #default="{ row }">
            {{ row.updateTime ? formatTime(row.updateTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        :close-on-click-modal="false"
        @close="handleDialogClose"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
          class="permission-form"
      >
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="菜单编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入菜单编码（如：ADMIN:DEPT:USER）" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择菜单类型" style="width: 100%">
            <el-option label="菜单" :value="1" />
            <el-option label="按钮" :value="2" />
            <el-option label="接口" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="formData.path" placeholder="请输入路径（如：/system/user）" maxlength="200" />
        </el-form-item>
        <!-- 核心修改：图标下拉选择（纯代码布局实现） -->
        <el-form-item label="图标" prop="iconId">
          <el-select
              v-model="formData.iconId"
              placeholder="请选择图标"
              style="width: 100%"
              popper-class="icon-select-dropdown"
              :popper-append-to-body="true"
          >
            <!-- 网格容器：纯CSS实现5列布局 -->
            <div class="icon-select-grid">
              <el-option
                  v-for="icon in iconList"
                  :key="icon.id"
                  :label="icon.iconName"
                  :value="icon.id"
                  class="icon-select-option"
              >
                <!-- 选项内容：上图标下名称 -->
                <div class="icon-option-content">
                  <div class="icon-option-img">
                    <el-image
                        :src="icon.iconUrl"
                        fit="contain"
                        @error="handleImageError(icon)"
                    >
                      <template #error>
                        <span class="img-fallback">加载失败</span>
                      </template>
                    </el-image>
                  </div>
                  <div class="icon-option-text">{{ icon.iconName }}</div>
                </div>
              </el-option>
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Plus, Edit, Delete
} from '@element-plus/icons-vue'
import {
  pagePermission,
  getPermissionById,
  addPermission,
  updatePermission,
  deletePermission
} from '@/api/permission'
// 引入图标API
import { iconApi } from '@/api/icon'

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 搜索表单
const searchForm = reactive({
  name: '',
  code: ''
})

// 表格数据
const tableData = ref([])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

// 图标列表
const iconList = ref([])

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  code: '',
  type: '',
  path: '',
  iconId: '',
  sort: 0
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入菜单编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9:_]+$/, message: '编码只能包含字母、数字、冒号和下划线', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择菜单类型', trigger: 'change' }
  ],
  path: [
    { required: true, message: '请输入路径', trigger: 'blur' }
  ],
  iconId: [
    { required: false, message: '请选择图标', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 时间格式化
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取菜单类型标签颜色
const getTypeTagType = (type) => {
  const typeMap = {
    1: 'primary',
    2: 'success',
    3: 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取菜单类型标签文字
const getTypeLabel = (type) => {
  const labelMap = {
    1: '菜单',
    2: '按钮',
    3: '接口'
  }
  return labelMap[type] || '未知'
}

// 加载图标列表
const loadIconList = async () => {
  try {
    const params = {
      pageNum: 1,
      pageSize: 1000
    }
    const res = await iconApi.getIconPage(params)
    iconList.value = res.data.records || res.data.data || []
  } catch (error) {
    console.error('加载图标列表失败:', error)
    ElMessage.error('加载图标列表失败')
  }
}

// 加载表格数据
const loadTableData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    const res = await pagePermission(params)
    if (res && res.code === 200 && res.data) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('加载菜单列表失败:', error)
    ElMessage.error('加载菜单列表失败')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadTableData()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  pagination.currentPage = 1
  loadTableData()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增菜单'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑菜单'
  resetForm()
  try {
    const res = await getPermissionById(row.id)
    if (res && res.data) {
      const data = res.data
      Object.assign(formData, {
        id: data.id,
        name: data.name,
        code: data.code,
        type: data.type,
        path: data.path,
        iconId: data.iconId || '',
        sort: data.sort
      })
    } else if (res) {
      Object.assign(formData, res)
    }
    dialogVisible.value = true
  } catch (error) {
    console.error('获取菜单详情失败:', error)
    ElMessage.error('获取菜单详情失败')
  }
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除菜单"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await deletePermission(row.id)
      ElMessage.success('删除成功')
      loadTableData()
    } catch (error) {
      console.error('删除菜单失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (formData.id) {
        await updatePermission(formData)
        ElMessage.success('修改成功')
      } else {
        await addPermission(formData)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      loadTableData()
    } catch (error) {
      console.error('保存菜单失败:', error)
      ElMessage.error(error.response?.data?.message || '保存失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.name = ''
  formData.code = ''
  formData.type = ''
  formData.path = ''
  formData.iconId = ''
  formData.sort = 0
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 分页-每页条数变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadTableData()
}

// 分页-页码变化
const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadTableData()
}

// 图片加载失败处理
const handleImageError = (item) => {
  console.warn('图片加载失败:', item.iconUrl || item.icon)
}

// 初始化
onMounted(() => {
  loadIconList()
  loadTableData()
})
</script>

<style scoped>

.search-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.search-form .el-form-item {
  margin-right: 16px;
  margin-bottom: 0;
}

.table-card {
  min-height: 500px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.permission-form {
  padding: 10px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 表格中图标预览样式 */
.icon-preview-table {
  width: 32px;
  height: 32px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 4px;
}

:deep(.icon-preview-table .el-image) {
  width: 100%;
  height: 100%;
}

.img-fallback-table {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  font-size: 10px;
  border-radius: 4px;
}

/* 核心修改：图标下拉选择纯CSS布局 */
:deep(.icon-select-dropdown) {
  width: 500px !important; /* 适配5列布局的宽度 */
  padding: 10px !important;
  box-sizing: border-box !important;
}

/* 网格容器：实现每行5个图标 */
.icon-select-grid {
  display: grid !important;
  grid-template-columns: repeat(5, 1fr) !important;
  gap: 10px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* 单个选项样式 */
:deep(.icon-select-option) {
  width: 100% !important;
  height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  background: transparent !important;
}

/* 选项内容容器：上图标下名称 */
.icon-option-content {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 8px 5px !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  height: 80px !important;
  box-sizing: border-box !important;
}

.icon-option-content:hover {
  background-color: #f0f8ff !important;
}

/* 图标容器 */
.icon-option-img {
  width: 40px !important;
  height: 40px !important;
  margin-bottom: 5px !important;
  border-radius: 4px !important;
  overflow: hidden !important;
}

:deep(.icon-option-img .el-image) {
  width: 100% !important;
  height: 100% !important;
}

/* 图标名称 */
.icon-option-text {
  font-size: 12px !important;
  color: #666 !important;
  text-align: center !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  width: 100% !important;
}

/* 图片加载失败兜底 */
.img-fallback {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: #f5f5f5 !important;
  color: #999 !important;
  font-size: 10px !important;
  border-radius: 4px !important;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-pagination) {
  font-size: 14px;
}
</style>