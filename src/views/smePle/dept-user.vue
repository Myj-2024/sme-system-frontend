<template>
  <div class="dept-container">
    <el-card class="filter-card" shadow="never">
      <el-form :model="queryForm" inline style="margin-left: 20px">
        <el-form-item label="部门名称">
          <el-input
              v-model="queryForm.deptName"
              placeholder="请输入部门名称"
              clearable
              style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input
              v-model="queryForm.leader"
              placeholder="请输入负责人"
              clearable
              style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="职务">
          <el-input
              v-model="queryForm.position"
              placeholder="请输入职务"
              clearable
              style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
              v-model="queryForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
          >
            <el-option label="启用" value="1" />
            <el-option label="停用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getList">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Plus" @click="handleAdd">新增部门</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <el-table :data="deptList" v-loading="loading" border stripe style="width: 100%; margin-top: 20px; font-size: 12px;">
        <el-table-column prop="deptCode" label="部门编码" align="center" width="150" />
        <el-table-column prop="deptName" label="部门名称" align="center" />
        <el-table-column prop="leader" label="负责人" align="center" />
        <el-table-column prop="position" label="职务" align="center" />
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

      <div style="margin-top: 20px; text-align: right">
        <el-pagination
            v-model:current-page="queryForm.pageNum"
            v-model:page-size="queryForm.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="getList"
            @current-change="getList"
        />
      </div>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="deptFormRef" label-width="100px">
        <el-form-item label="部门名称" prop="deptName">
          <el-select
              v-model="form.deptName"
              placeholder="请选择部门"
              style="width: 100%"
              @change="handleDeptNameChange"
              :readonly="form.id !== undefined"
              :disabled="form.id !== undefined"
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

        <el-form-item label="职务" prop="position">
          <el-input v-model="form.position" placeholder="请输入职务" />
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
import request from '@/utils/request.js'
import { listDept, addDept, updateDept, deleteDept, changeDeptStatus, pageDept } from '@/api/dept.js'
import { checkDeptBind } from '@/api/smeple.js'

const loading = ref(false)
const deptList = ref([])
const deptOptions = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const deptFormRef = ref(null)
const total = ref(0)

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  deptName: '',
  leader: '',
  position: '',
  status: ''
})

const form = reactive({
  id: undefined,
  parentId: 0,
  deptName: '',
  deptCode: '',
  leader: '',
  position: '',
  phone: '',
  status: 1
})

const rules = {
  deptName: [{ required: true, message: '请选择部门名称', trigger: 'change' }]
}

// 移除：删除编码唯一性校验函数

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

const handleDeptNameChange = (val) => {
  const selected = deptOptions.value.find(i => i.itemName === val)
  form.deptCode = selected ? selected.itemCode : ''
}

const resetQuery = () => {
  queryForm.pageNum = 1
  queryForm.pageSize = 10
  queryForm.deptName = ''
  queryForm.leader = ''
  queryForm.position = ''
  queryForm.status = ''
  getList()
}

const getList = async () => {
  loading.value = true
  try {
    const res = await pageDept(queryForm)
    deptList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (e) {
    console.error("加载列表失败:", e)
  } finally {
    loading.value = false
  }
}

const submitForm = () => {
  if (!deptFormRef.value) return
  deptFormRef.value.validate(async (valid) => {
    if (valid) {
      // 移除：删除新增时的编码唯一性校验逻辑
      try {
        if (form.id) {
          await updateDept(form)
          ElMessage.success('修改成功')
        } else {
          await addDept(form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        getList()
      } catch (e) {
        console.error("保存失败:", e)
        // 优化：保留异常提示，但不阻断流程
        ElMessage.error('操作失败：' + (e.response?.data?.msg || '新增/修改失败'))
      }
    }
  })
}

const handleStatusChange = async (row) => {
  try {
    await changeDeptStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (e) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
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
  ElMessageBox.confirm(`确定要删除部门 "${row.deptName}" 下的 "${row.leader}" 记录吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      // 检查部门是否被包抓联引用
      const checkRes = await checkDeptBind(row.id)
      if (checkRes.data?.hasBind) {
        ElMessage.error('该部门已被包抓联关联，无法删除！')
        return
      }
      await deleteDept(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (e) {
      console.error("删除失败:", e)
      ElMessage.error('删除失败，请重试')
    }
  }).catch(() => {})
}

const reset = () => {
  Object.assign(form, {
    id: undefined,
    parentId: 0,
    deptName: '',
    deptCode: '',
    leader: '',
    position: '',
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
.filter-card {
  margin-bottom: 20px;
}
</style>