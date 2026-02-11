<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px;">
      <!-- 查询条件区域 + 按钮组（查询、重置、新增字典） -->
      <el-form :model="queryParams" inline @submit.prevent>
        <el-form-item label="字典名称">
          <el-input
              v-model="queryParams.dictName"
              placeholder="请输入字典名称"
              clearable
              style="width: 200px;"
              @keyup.enter="getList"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
              v-model="queryParams.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px;"
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getList">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <!-- 新增字典按钮移动到重置按钮右侧 -->
          <el-button type="primary" icon="Plus" @click="handleAdd">新增字典</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table :data="dictList" border v-loading="loading">
      <el-table-column label="字典名称" prop="dictName" />
      <el-table-column label="字典编码" prop="dictCode" />
      <el-table-column label="状态">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="success" @click="handleViewItem(scope.row)">字典项</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
        v-show="total > 0"
        :current-page="queryParams.pageNum"
        :page-size="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; text-align: right;"
    />

    <el-dialog :title="dialogTitle" v-model="open" width="500px">
      <el-form ref="dictFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" />
        </el-form-item>
        <el-form-item label="字典编码" prop="dictCode">
          <el-input v-model="form.dictCode" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="open = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listDict, addDict, updateDict, delDict, changeDictStatus } from '@/api/dict'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const dictList = ref([])
const loading = ref(false)
const open = ref(false)
const dialogTitle = ref('')
const dictFormRef = ref(null)

// 查询参数：包含分页+字典名称+状态
const queryParams = ref({
  pageNum: 1,      // 当前页码
  pageSize: 10,    // 每页条数
  dictName: '',    // 字典名称（模糊查询）
  status: ''       // 状态（1=启用，0=禁用）
})
const total = ref(0) // 总记录数

const form = ref({
  dictName: '',
  dictCode: '',
  sort: 0,
  status: 1,
  remark: ''
})

const rules = {
  dictName: [{ required: true, message: '不能为空', trigger: 'blur' }],
  dictCode: [{ required: true, message: '不能为空', trigger: 'blur' }]
}

// 查询字典列表（带分页+查询条件）
const getList = async () => {
  loading.value = true
  try {
    const res = await listDict(queryParams.value)
    dictList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('查询字典列表失败')
  } finally {
    loading.value = false
  }
}

// 重置查询条件
const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    dictName: '',
    status: ''
  }
  getList()
}

// 分页：每页条数改变
const handleSizeChange = (val) => {
  queryParams.value.pageSize = val
  getList()
}

// 分页：当前页码改变
const handleCurrentChange = (val) => {
  queryParams.value.pageNum = val
  getList()
}

// 新增字典
const handleAdd = () => {
  form.value = { dictName: '', dictCode: '', sort: 0, status: 1, remark: '' }
  dialogTitle.value = '添加字典'
  open.value = true
}

// 修改字典
const handleUpdate = (row) => {
  form.value = { ...row }
  dialogTitle.value = '修改字典'
  open.value = true
}

// 修改字典状态
const handleStatusChange = async (row) => {
  const res = await changeDictStatus(row.id, row.status)
  ElMessage.success(res.message)
}

// 提交新增/修改表单
const submitForm = async () => {
  await dictFormRef.value.validate()
  const res = form.value.id
      ? await updateDict(form.value)
      : await addDict(form.value)

  if (res.code === 200) {
    ElMessage.success(res.message)
    open.value = false
    getList()
  } else {
    ElMessage.error(res.message)
  }
}

// 删除字典
const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确认删除字典【${row.dictName}】？其下所有字典项将一并删除！`,
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    const res = await delDict(row.id)
    if (res.code === 200) {
      ElMessage.success(res.message)
      getList()
    } else {
      ElMessage.error(res.message)
    }
  }).catch(() => {})
}

// 查看字典项
const handleViewItem = (row) => {
  router.push(`/dict/data/${row.dictCode}?dictId=${row.id}`)
}

// 页面加载时查询列表
onMounted(getList)
</script>