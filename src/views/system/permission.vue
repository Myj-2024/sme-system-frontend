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
            <el-icon>
              <Search/>
            </el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <Refresh/>
            </el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon>
              <Plus/>
            </el-icon>
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
        <!-- 修改：序号列改为展示ID -->
        <el-table-column prop="id" label="ID" width="60" align="center"/>
        <el-table-column prop="name" label="菜单名称" min-width="120" show-overflow-tooltip align="center"/>
        <el-table-column prop="code" label="菜单编码" min-width="150" show-overflow-tooltip align="center"/>
        <el-table-column prop="type" label="菜单类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 修改：路由名称列移到路由路径前面 -->
        <el-table-column prop="routeName" label="路由名称" min-width="120" show-overflow-tooltip align="center">
          <template #default="{ row }">
            {{ row.routeName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="150" show-overflow-tooltip align="center"/>
        <el-table-column prop="componentPath" label="组件路径" min-width="180" show-overflow-tooltip align="center">
          <template #default="{ row }">
            {{ row.componentPath || '-' }}
          </template>
        </el-table-column>
        <!-- 新增：父级菜单列 -->
        <el-table-column label="父级菜单" min-width="120" show-overflow-tooltip align="center">
          <template #default="{ row }">
            {{ getParentMenuName(row.parentId) || '顶级菜单' }}
          </template>
        </el-table-column>
        <!-- 新增：高亮菜单路径列 -->
        <el-table-column prop="activeMenu" label="高亮菜单路径" min-width="150" show-overflow-tooltip align="center">
          <template #default="{ row }">
            {{ row.activeMenu || '-' }}
          </template>
        </el-table-column>
        <!-- 新增：是否为路由节点列 -->
        <el-table-column prop="isRoute" label="是否为路由节点" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isRoute === 1 ? 'success' : 'warning'" size="small">
              {{ row.isRoute === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isHidden" label="是否隐藏" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isHidden === 1 ? 'warning' : 'success'" size="small">
              {{ row.isHidden === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图标" width="80" align="center">
          <template #default="{ row }">
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
        <el-table-column prop="sort" label="排序" width="60" align="center"/>
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
              <el-icon>
                <Edit/>
              </el-icon>
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon>
                <Delete/>
              </el-icon>
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
        width="800px"
        :close-on-click-modal="false"
        @close="handleDialogClose"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          class="permission-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入菜单名称" maxlength="50" show-word-limit/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入菜单编码（如：ADMIN:DEPT:USER）" maxlength="100"
                        show-word-limit/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择菜单类型" style="width: 100%">
                <el-option label="菜单" :value="1"/>
                <el-option label="按钮/详情" :value="2"/>
                <el-option label="接口" :value="3"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="父菜单" prop="parentId">
              <el-select v-model="formData.parentId" placeholder="请选择父菜单（顶级菜单请留空）" style="width: 100%">
                <el-option label="顶级菜单" :value="0"/>
                <el-option
                    v-for="menu in parentMenuList"
                    :key="menu.id"
                    :label="menu.name"
                    :value="menu.id"
                    :disabled="formData.id && menu.id === formData.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="路由名称" prop="routeName">
              <el-input v-model="formData.routeName" placeholder="请输入路由名称（如：SystemUser）" maxlength="64"
                        show-word-limit/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路由路径" prop="path">
              <el-input v-model="formData.path" placeholder="请输入路径（如：/system/user）" maxlength="200"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="组件路径" prop="componentPath">
              <el-input v-model="formData.componentPath" placeholder="请输入组件路径（如：system/user 或 Layout）"
                        maxlength="255" show-word-limit/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重定向路径" prop="redirectPath">
              <el-input v-model="formData.redirectPath" placeholder="请输入重定向路径（可选）" maxlength="255"
                        show-word-limit/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="高亮菜单路径" prop="activeMenu">
              <el-input v-model="formData.activeMenu" placeholder="请输入高亮菜单路径（可选）" maxlength="255"
                        show-word-limit/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 新增：是否为路由节点 -->
            <el-form-item label="是否为路由节点" prop="isRoute">
              <el-select v-model="formData.isRoute" placeholder="请选择是否为路由节点" style="width: 100%">
                <el-option label="是" :value="1"/>
                <el-option label="否" :value="0"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否隐藏" prop="isHidden">
              <el-select v-model="formData.isHidden" placeholder="请选择是否隐藏路由" style="width: 100%">
                <el-option label="显示" :value="0"/>
                <el-option label="隐藏" :value="1"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="formData.sort" :min="0" :max="999" style="width: 100%"/>
            </el-form-item>
          </el-col>
        </el-row>
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
import {ref, reactive, onMounted, computed} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
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
import {iconApi} from '@/api/icon'

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
// 父菜单列表
const parentMenuList = ref([])

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
  sort: 0,
  // 原有新增字段
  parentId: 0,
  componentPath: '',
  redirectPath: '',
  activeMenu: '',
  routeName: '',
  isHidden: 0,
  // 新增：是否为路由节点
  isRoute: 1
})

// 表单验证规则
const formRules = {
  name: [
    {required: true, message: '请输入菜单名称', trigger: 'blur'},
    {min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur'}
  ],
  code: [
    {required: true, message: '请输入菜单编码', trigger: 'blur'},
    {pattern: /^[a-zA-Z0-9:_]+$/, message: '编码只能包含字母、数字、冒号和下划线', trigger: 'blur'}
  ],
  type: [
    {required: true, message: '请选择菜单类型', trigger: 'change'}
  ],
  path: [
    {required: true, message: '请输入路由路径', trigger: 'blur'}
  ],
  routeName: [
    {required: true, message: '请输入路由名称', trigger: 'blur'},
    {pattern: /^[A-Za-z0-9]+$/, message: '路由名称只能包含字母和数字', trigger: 'blur'}
  ],
  componentPath: [
    {required: true, message: '请输入组件路径', trigger: 'blur'}
  ],
  isHidden: [
    {required: true, message: '请选择是否隐藏', trigger: 'change'}
  ],
  // 新增：是否为路由节点验证
  isRoute: [
    {required: true, message: '请选择是否为路由节点', trigger: 'change'}
  ],
  iconId: [
    {required: false, message: '请选择图标', trigger: 'change'}
  ],
  sort: [
    {required: true, message: '请输入排序值', trigger: 'blur'}
  ],
  parentId: [
    {required: false, message: '请选择父菜单', trigger: 'change'}
  ],
  redirectPath: [
    {required: false, message: '请输入重定向路径', trigger: 'blur'}
  ],
  activeMenu: [
    {required: false, message: '请输入高亮菜单路径', trigger: 'blur'}
  ]
}

// 新增：权限更新提醒弹窗
const showPermissionReminder = () => {
  ElMessageBox.alert(
      `
      <div style="text-align: left; line-height: 1.8;">
        <p>✨ 温馨提示</p>
        <p>您已完成菜单权限的${formData.id ? '修改' : '新增/删除'}操作，为确保权限生效，请：</p>
        <ol style="padding-left: 20px; margin: 10px 0;">
          <li>前往【角色管理】页面更新对应角色的菜单权限</li>
          <li>刷新当前页面，使最新的菜单配置生效</li>
        </ol>
        <p style="color: #666; font-size: 12px;">注：未更新角色权限可能导致部分功能无法正常访问</p>
      </div>
    `,
      '权限更新提醒',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '我知道了',
        type: 'info',
        draggable: true,
        center: true,
        confirmButtonClass: 'permission-reminder-btn'
      }
  ).then(() => {
    // 用户确认后的可选操作，比如自动刷新（如需开启可取消注释）
    // window.location.reload()
  })
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
    2: '按钮/详情',
    3: '接口'
  }
  return labelMap[type] || '未知'
}

// 新增：根据父菜单ID获取父菜单名称
const getParentMenuName = (parentId) => {
  if (!parentId || parentId === 0) return ''
  const parentMenu = parentMenuList.value.find(menu => menu.id === parentId)
  return parentMenu ? parentMenu.name : '未知'
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

// 加载父菜单列表
const loadParentMenuList = async () => {
  try {
    const params = {
      pageNum: 1,
      pageSize: 1000
    }
    const res = await pagePermission(params)
    if (res && res.code === 200 && res.data) {
      parentMenuList.value = res.data.records || []
    }
  } catch (error) {
    console.error('加载父菜单列表失败:', error)
    ElMessage.error('加载父菜单列表失败')
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
        sort: data.sort || 0,
        // 原有新增字段赋值
        parentId: data.parentId || 0,
        componentPath: data.componentPath || '',
        redirectPath: data.redirectPath || '',
        activeMenu: data.activeMenu || '',
        routeName: data.routeName || '',
        isHidden: data.isHidden !== undefined ? data.isHidden : 0,
        // 新增：是否为路由节点赋值
        isRoute: data.isRoute !== undefined ? data.isRoute : 1
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

// 删除 - 增强二次确认提醒
const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除菜单【${row.name}】吗？\n删除后该菜单下的子菜单也将无法正常使用，请谨慎操作！`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true,
        center: true
      }
  ).then(async () => {
    try {
      const res = await deletePermission(row.id)
      if (res && res.code === 200) {
        ElMessage.success('删除成功')
        loadTableData()
        // 新增：删除成功后显示权限提醒
        showPermissionReminder()
      } else {
        ElMessage.error(res?.message || '删除失败')
      }
    } catch (error) {
      console.error('删除菜单失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败，该菜单可能包含子菜单')
    }
  }).catch(() => {
    ElMessage.info('已取消删除操作')
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      // 处理父菜单ID（0转为null）
      const submitData = {...formData}
      if (submitData.parentId === 0) {
        submitData.parentId = null
      }

      if (submitData.id) {
        await updatePermission(submitData)
        ElMessage.success('修改成功')
      } else {
        await addPermission(submitData)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      loadTableData()
      // 新增：新增/修改成功后显示权限提醒
      showPermissionReminder()
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
  // 原有新增字段重置
  formData.parentId = 0
  formData.componentPath = ''
  formData.redirectPath = ''
  formData.activeMenu = ''
  formData.routeName = ''
  formData.isHidden = 0
  // 新增：是否为路由节点重置
  formData.isRoute = 1

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
  loadParentMenuList()
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

/* 新增：提醒弹窗按钮样式优化 */
:deep(.permission-reminder-btn) {
  background-color: #409eff !important;
  border-color: #409eff !important;
}
</style>