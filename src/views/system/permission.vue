<template>
  <div class="permission-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="权限名称">
          <el-input
              v-model="searchForm.name"
              placeholder="请输入权限名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="权限编码">
          <el-input
              v-model="searchForm.code"
              placeholder="请输入权限编码"
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
          style="width: 100%"
          highlight-current-row
      >
        <!-- 核心修改：计算全局序号 -->
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">
            {{ (pagination.currentPage - 1) * pagination.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="权限名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="code" label="权限编码" min-width="150" show-overflow-tooltip />
        <el-table-column prop="type" label="权限类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="150" show-overflow-tooltip />
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="{ row }">
            <!-- 容错处理：显示图标名称而非动态组件 -->
            <span v-if="row.icon" class="icon-display">{{ row.icon }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.createTime ? formatTime(row.createTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" align="center">
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
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入权限名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入权限编码（如：ADMIN:DEPT:USER）" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择权限类型" style="width: 100%">
            <el-option label="菜单" :value="1" />
            <el-option label="按钮" :value="2" />
            <el-option label="接口" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="formData.path" placeholder="请输入路径（如：/system/user）" maxlength="200" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标名称（如：User）" maxlength="50" />
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

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  code: '',
  type: '',
  path: '',
  icon: '',
  sort: 0
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9:_]+$/, message: '编码只能包含字母、数字、冒号和下划线', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  path: [
    { required: true, message: '请输入路径', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 时间格式化（处理后端返回的UTC时间）
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

// 获取权限类型标签颜色（适配数字类型）
const getTypeTagType = (type) => {
  const typeMap = {
    1: 'primary',   // 菜单
    2: 'success',   // 按钮
    3: 'warning'    // 接口
  }
  return typeMap[type] || 'info'
}

// 获取权限类型标签文字（适配数字类型）
const getTypeLabel = (type) => {
  const labelMap = {
    1: '菜单',
    2: '按钮',
    3: '接口'
  }
  return labelMap[type] || '未知'
}

// 加载表格数据（核心修复：1. 改用records字段 2. 保留原有逻辑结构）
const loadTableData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    const res = await pagePermission(params)
    // 适配后端实际返回格式：{code:200, data:{total:数字, records:[]}}
    if (res && res.code === 200 && res.data) {
      tableData.value = res.data.records || []  // 关键修复：list → records
      pagination.total = res.data.total || 0
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('加载权限列表失败:', error)
    ElMessage.error('加载权限列表失败')
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
  dialogTitle.value = '新增权限'
  resetForm()
  dialogVisible.value = true
}

// 编辑（适配数字类型的type）
const handleEdit = async (row) => {
  dialogTitle.value = '编辑权限'
  resetForm()
  try {
    const res = await getPermissionById(row.id)
    if (res && res.data) {
      const data = res.data
      Object.assign(formData, {
        id: data.id,
        name: data.name,
        code: data.code,
        type: data.type,  // 直接赋值数字类型
        path: data.path,
        icon: data.icon,
        sort: data.sort
      })
    } else if (res) {
      Object.assign(formData, res)
    }
    dialogVisible.value = true
  } catch (error) {
    console.error('获取权限详情失败:', error)
    ElMessage.error('获取权限详情失败')
  }
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除权限"${row.name}"吗？`,
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
      console.error('删除权限失败:', error)
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
      console.error('保存权限失败:', error)
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
  formData.icon = ''
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

// 初始化
onMounted(() => {
  loadTableData()
})
</script>

<style scoped>
.permission-container {
  padding: 20px;
}

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

/* 图标显示样式 */
.icon-display {
  font-size: 16px;
  color: #606266;
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