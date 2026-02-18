<template>
  <div class="role-list-page">
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline @submit.prevent>
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <!-- 新增：描述查询输入框 -->
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
          style="width: 100%"
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
          <el-input
              v-model="form.roleCode"
              placeholder="如: ROLE_ADMIN"
              :disabled="!isAdd"
          />
          <div v-if="isAdd" style="font-size: 12px; color: #909399;">创建后编码通常不可修改</div>
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

    <el-dialog v-model="permDialogVisible" title="分配权限" width="600px">
      <el-tree
          :data="permissionTree"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="checkedPermissions"
          ref="treeRef"
          :props="treeProps"
      />
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import roleApi from '@/api/role.js'
import permissionApi from '@/api/permission.js'
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

// 新增：description 查询条件
const searchForm = reactive({
  roleName: '',
  description: ''
})

const form = reactive({
  id: '',
  roleName: '',
  roleCode: '',
  description: ''
})

const permissionTree = ref([])
const checkedPermissions = ref([])

// 初始化
const initData = async () => {
  loading.value = true
  try {
    await getRoleList()
    const permRes = await permissionApi.listPermission()
    permissionTree.value = permRes.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// 核心修改：传递 description 查询条件给后端
const getRoleList = async () => {
  loading.value = true
  try {
    // 构造包含角色名称、描述的分页查询参数
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      roleName: searchForm.roleName,
      description: searchForm.description  // 新增：传递描述查询条件
    }
    const res = await roleApi.getRolePage(params)
    roleList.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (e) {
    ElMessage.error('获取角色列表失败')
    roleList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => { initData() })

// 查询按钮：携带描述条件查询
const handleSearch = () => {
  pageNum.value = 1
  getRoleList()
}

// 重置按钮：清空描述条件
const handleReset = () => {
  searchForm.roleName = ''
  searchForm.description = ''  // 新增：清空描述
  pageNum.value = 1
  getRoleList()
}

// 分页相关方法（无需修改）
const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
  getRoleList()
}
const handleCurrentChange = (val) => {
  pageNum.value = val
  getRoleList()
}

// 以下业务逻辑完全保留，无修改
const handleAdd = () => {
  isAdd.value = true
  dialogTitle.value = '新增角色'
  resetForm()
  dialogVisible.value = true
}
const handleEdit = (row) => {
  isAdd.value = false
  dialogTitle.value = '编辑角色'
  form.id = row.id
  form.roleName = row.roleName
  form.roleCode = row.roleCode
  form.description = row.description
  dialogVisible.value = true
}
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色 [${row.roleName}] 吗？`, '警告', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await roleApi.deleteRole(row.id)
    ElMessage.success('删除成功')
    getRoleList()
  } catch (e) {}
}
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    if (isAdd.value) {
      await roleApi.addRole(form)
    } else {
      await roleApi.updateRole(form.id, form)
    }
    ElMessage.success(isAdd.value ? '新增成功' : '编辑成功')
    dialogVisible.value = false
    getRoleList()
  } catch (e) {
    console.error('提交失败:', e)
  }
}
const resetForm = () => {
  form.id = ''
  form.roleName = ''
  form.roleCode = ''
  form.description = ''
}
const handleDialogClose = () => {
  if (formRef.value) formRef.value.clearValidate()
  resetForm()
}
const handleAssignPermission = async (row) => {
  form.id = row.id
  permDialogVisible.value = true
  try {
    const res = await roleApi.getRolePermissions(row.id)
    checkedPermissions.value = res.data || []
  } catch (e) {
    ElMessage.error('获取权限失败')
  }
}
const handleSavePermissions = async () => {
  try {
    const checked = treeRef.value.getCheckedKeys()
    await roleApi.updateRolePermissions(form.id, checked)
    ElMessage.success('权限保存成功')
    permDialogVisible.value = false
  } catch (e) {
    ElMessage.error('保存失败')
  }
}
const treeProps = { children: 'children', label: 'name' }
const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '编码建议使用大写字母和下划线', trigger: 'blur' }
  ]
}
</script>

<style scoped lang="scss">
.role-list-page {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}
.filter-card { margin-bottom: 20px; }
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
</style>