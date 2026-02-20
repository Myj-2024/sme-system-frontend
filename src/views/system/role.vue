<template>
  <div class="role-list-page">
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline @submit.prevent>
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="searchForm.description" placeholder="请输入角色描述" clearable style="width: 200px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleAdd" style="margin-left: 8px;">
            <el-icon><Plus /></el-icon> 新增角色
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card" shadow="never">
      <el-table
          style="width: 100%; font-size: 12px"
          :data="roleList"
          border
          stripe
          v-loading="loading"
          fit
      >
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column prop="id" label="ID" width="60" align="center"/>
        <el-table-column prop="roleName" label="角色名称" align="center"/>
        <el-table-column prop="roleCode" label="角色编码" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.roleCode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" align="center" show-overflow-tooltip/>
        <el-table-column label="操作" width="280" align="center">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button type="primary" size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
              <el-button type="success" size="small" @click="handleAssignPermission(row)">分配权限</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="角色编码" prop="roleCode">
          <!-- 移除冗余的@blur事件，只保留输入框 -->
          <el-input
              v-model="form.roleCode"
              placeholder="如: ADMIN"
          />
          <div style="font-size: 12px; color: #909399;">编码修改后请确保唯一性</div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="permDialogVisible" title="分配权限" width="800px">
      <div style="margin-bottom: 12px; display: flex; gap: 8px;">
        <el-button type="primary" size="small" @click="handleCheckAll">全选</el-button>
        <el-button size="small" @click="handleUncheckAll">取消全选</el-button>
        <el-button type="success" size="small" @click="handleInvertCheck">反选</el-button>
      </div>

      <el-tree
          :data="permissionTree"
          show-checkbox
          node-key="id"
          default-expand-all
          :checked-keys="checkedPermissions"
          ref="treeRef"
          :props="treeProps"
          check-strictly
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <span class="menu-name">{{ data.name }}</span>
            <span class="menu-code" v-if="data.code">[{{ data.code }}]</span>
            <span class="menu-path" v-if="data.path">{{ data.path }}</span>
          </div>
        </template>
      </el-tree>

      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api/role.js'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(20)
const roleList = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const permDialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formRef = ref(null)
const treeRef = ref(null)
const isAdd = ref(true)
const currentRoleId = ref(null)

// 搜索条件
const searchForm = reactive({
  roleName: '',
  description: ''
})

// 角色表单（确保id始终为数字类型，避免后端接收为字符串）
const form = reactive({
  id: 0, // 改为数字类型，避免空字符串
  roleName: '',
  roleCode: '',
  description: ''
})

const permissionTree = ref([])
const checkedPermissions = ref([])

// 树形结构转换
const buildPermissionTree = (list) => {
  return list.map(item => ({
    id: Number(item.id),
    name: item.name,
    code: item.code,
    path: item.path,
    children: []
  }))
}

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    await getRoleList()
    const permRes = await api.listPermission()
    if (permRes.code === 200) {
      const flatPermissions = permRes.data.records || []
      permissionTree.value = buildPermissionTree(flatPermissions)
    }
  } catch (e) {
    console.error('初始化失败:', e)
    ElMessage.error('初始化数据失败')
  } finally {
    loading.value = false
  }
}

// 角色分页查询
const getRoleList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      roleName: searchForm.roleName,
      description: searchForm.description
    }
    const res = await api.getRolePage(params)
    if (res.code === 200) {
      roleList.value = res.data?.records || []
      total.value = res.data?.total || 0
    } else {
      ElMessage.error(res.message || '获取角色列表失败')
      roleList.value = []
      total.value = 0
    }
  } catch (e) {
    ElMessage.error('获取角色列表失败')
    roleList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => { initData() })

// 查询/重置/分页方法
const handleSearch = () => {
  pageNum.value = 1
  getRoleList()
}
const handleReset = () => {
  searchForm.roleName = ''
  searchForm.description = ''
  pageNum.value = 1
  getRoleList()
}
const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
  getRoleList()
}
const handleCurrentChange = (val) => {
  pageNum.value = val
  getRoleList()
}

// 新增角色
const handleAdd = () => {
  isAdd.value = true
  dialogTitle.value = '新增角色'
  resetForm()
  dialogVisible.value = true
}

// 编辑角色：确保id为数字类型
const handleEdit = async (row) => {
  isAdd.value = false
  dialogTitle.value = '编辑角色'
  currentRoleId.value = Number(row.id) // 强制转为数字
  try {
    const res = await api.getRoleById(row.id)
    if (res.code === 200) {
      const data = res.data
      form.id = Number(data.id) // 确保id是数字
      form.roleName = data.roleName
      form.roleCode = data.roleCode
      form.description = data.description
    } else {
      form.id = Number(row.id) // 兜底转为数字
      form.roleName = row.roleName
      form.roleCode = row.roleCode
      form.description = row.description
    }
    dialogVisible.value = true
  } catch (e) {
    ElMessage.error('获取角色详情失败')
    console.error(e)
  }
}

// 删除角色
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色 [${row.roleName}] 吗？`, '警告', {
      type: 'warning'
    })
    const res = await api.deleteRole(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getRoleList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    console.error('删除角色失败:', e)
  }
}

// 提交表单：只做表单校验，然后传完整form给后端，接收后端提示
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    // 表单校验
    await formRef.value.validate()

    // 打印form，确认id是否正确（调试用，可删除）
    console.log('提交的表单数据：', form)

    let res
    if (isAdd.value) {
      res = await api.addRole(form)
    } else {
      // 关键：传递包含数字类型id的完整form
      res = await api.updateRole(form)
    }

    // 只接收后端返回的提示，不做任何前端校验
    if (res.code === 200) {
      ElMessage.success(isAdd.value ? '新增成功' : '编辑成功')
      dialogVisible.value = false
      getRoleList() // 刷新列表
    } else {
      ElMessage.error(res.message || (isAdd.value ? '新增失败' : '编辑失败'))
    }
  } catch (e) {
    console.error('提交失败:', e)
    ElMessage.error('提交失败，请检查输入')
  }
}

// 重置表单：id重置为0（数字类型）
const resetForm = () => {
  form.id = 0
  form.roleName = ''
  form.roleCode = ''
  form.description = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 关闭弹窗
const handleDialogClose = () => {
  resetForm()
}

// 分配权限
const handleAssignPermission = async (row) => {
  currentRoleId.value = row.id
  permDialogVisible.value = true
  try {
    const res = await api.getRolePermissions(row.id)
    if (res.code === 200) {
      checkedPermissions.value = (res.data || []).map(id => Number(id))
      nextTick(() => {
        if (treeRef.value) {
          treeRef.value.setCheckedKeys(checkedPermissions.value)
        }
      })
    } else {
      ElMessage.error(res.message || '获取权限失败')
      checkedPermissions.value = []
    }
  } catch (e) {
    ElMessage.error('获取权限失败')
    console.error(e)
    checkedPermissions.value = []
  }
}

// 保存权限
const handleSavePermissions = async () => {
  if (!currentRoleId.value) {
    ElMessage.warning('请选择要分配权限的角色')
    return
  }
  try {
    const checked = treeRef.value.getCheckedKeys()
    const res = await api.updateRolePermissions(currentRoleId.value, checked)
    if (res.code === 200) {
      ElMessage.success('权限保存成功')
      permDialogVisible.value = false
    } else {
      ElMessage.error(res.message || '保存权限失败')
    }
  } catch (e) {
    ElMessage.error('保存权限失败')
    console.error(e)
  }
}

// 权限树一键操作
const handleCheckAll = () => {
  if (!treeRef.value || !permissionTree.value.length) return
  const allKeys = permissionTree.value.map(item => item.id)
  treeRef.value.setCheckedKeys(allKeys)
}
const handleUncheckAll = () => {
  if (!treeRef.value) return
  treeRef.value.setCheckedKeys([])
}
const handleInvertCheck = () => {
  if (!treeRef.value || !permissionTree.value.length) return
  const currentChecked = treeRef.value.getCheckedKeys()
  const allKeys = permissionTree.value.map(item => item.id)
  const newChecked = allKeys.filter(id => !currentChecked.includes(id))
  treeRef.value.setCheckedKeys(newChecked)
}

// 树形配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 表单校验规则
const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[A-Z0-9:_]+$/, message: '编码建议使用大写字母、数字、冒号和下划线', trigger: 'blur' }
  ]
}
</script>

<style scoped lang="scss">
.role-list-page {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}
.filter-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

:deep(.el-tree) {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
}
:deep(.el-tree-node__content) {
  height: auto !important;
  padding: 8px 0;
}
:deep(.el-checkbox__inner) {
  width: 16px;
  height: 16px;
}
.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
}
.menu-name {
  font-weight: 500;
  color: #303133;
}
.menu-code {
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  padding: 1px 4px;
  border-radius: 2px;
}
.menu-path {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}
</style>