<template>
  <div class="dept-container">
    <el-card shadow="never">
      <div class="operator-wrapper">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增部门</el-button>
      </div>

      <el-table :data="deptList" v-loading="loading" border stripe style="width: 100%; margin-top: 20px">
        <el-table-column prop="deptCode" label="部门编码" align="center" width="150" />
        <el-table-column prop="deptName" label="部门名称" align="center" />
        <el-table-column prop="leader" label="负责人" align="center" />
        <el-table-column prop="phone" label="联系电话" align="center" />
        <el-table-column prop="status" label="状态" align="center" width="100">
          <template #default="{ row }">
            <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template #default="{ row }">
            <el-button link type="primary" icon="Edit" @click="handleEdit(row)">修改</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="deptFormRef" label-width="100px">

        <el-form-item label="部门名称" prop="deptName">
          <el-select
              v-model="form.deptName"
              placeholder="请选择部门"
              style="width: 100%"
              @change="handleDeptNameChange"
          >
            <el-option
                v-for="dict in deptOptions"
                :key="dict.itemCode"
                :label="dict.itemName"
                :value="dict.itemName"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="部门编码" prop="deptCode">
          <el-input v-model="form.deptCode" placeholder="选择名称后自动填充" readonly disabled />
        </el-form-item>

        <el-form-item label="负责人" prop="leader">
          <el-input v-model="form.leader" placeholder="请输入负责人姓名" />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { listDept, addDept, updateDept, deleteDept, changeDeptStatus } from '@/api/dept'

const loading = ref(false)
const deptList = ref([])
const deptOptions = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const deptFormRef = ref(null)

// 重点：增加 parentId 字段，初始化为 0
const form = reactive({
  id: undefined,
  parentId: 0,
  deptName: '',
  deptCode: '',
  leader: '',
  phone: '',
  status: 1
})

const rules = {
  deptName: [{ required: true, message: '请选择部门名称', trigger: 'change' }]
}

// 获取字典项
const getDeptDicts = async () => {
  try {
    const res = await request({
      url: '/admin/dict/item/type/dept_type',
      method: 'get'
    })
    deptOptions.value = res.data || []
  } catch (error) {
    console.error("字典加载失败:", error)
  }
}

// 下拉选中后自动填充编码
const handleDeptNameChange = (val) => {
  const selected = deptOptions.value.find(i => i.itemName === val)
  form.deptCode = selected ? selected.itemCode : ''
}

// 查询部门列表
const getList = async () => {
  loading.value = true
  try {
    const res = await listDept()
    // 自动兼容 res.data 或 res (取决于拦截器是否已经脱壳)
    deptList.value = res.data || res || []
  } catch (e) {
    console.error("加载列表失败:", e)
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = () => {
  if (!deptFormRef.value) return
  deptFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          await updateDept(form)
          ElMessage.success('修改成功')
        } else {
          // 新增时，form 对象里已经携带了 parentId: 0
          await addDept(form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        getList()
      } catch (e) {
        console.error("保存失败:", e)
      }
    }
  })
}

// 修改状态
const handleStatusChange = async (row) => {
  try {
    await changeDeptStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (e) {
    row.status = row.status === 1 ? 0 : 1
  }
}

const handleAdd = () => {
  reset()
  dialogTitle.value = '新增部门'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  reset()
  Object.assign(form, row)
  dialogTitle.value = '修改部门'
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除部门 "${row.deptName}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    await deleteDept(row.id)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const reset = () => {
  Object.assign(form, {
    id: undefined,
    parentId: 0, // 重置确保不会为 null
    deptName: '',
    deptCode: '',
    leader: '',
    phone: '',
    status: 1
  })
  if (deptFormRef.value) deptFormRef.value.resetFields()
}

onMounted(() => {
  getList()
  getDeptDicts()
})
</script>

<style scoped>
.operator-wrapper { margin-bottom: 15px; }
</style>