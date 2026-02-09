<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px;">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增字典</el-button>
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

const getList = async () => {
  loading.value = true
  const res = await listDict({ pageNum: 1, pageSize: 100 })
  dictList.value = res.data.list
  loading.value = false
}

const handleAdd = () => {
  form.value = { dictName: '', dictCode: '', sort: 0, status: 1, remark: '' }
  dialogTitle.value = '添加字典'
  open.value = true
}

const handleUpdate = (row) => {
  form.value = { ...row }
  dialogTitle.value = '修改字典'
  open.value = true
}

const handleStatusChange = async (row) => {
  const res = await changeDictStatus(row.id, row.status)
  ElMessage.success(res.message)
}

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

const handleViewItem = (row) => {
  router.push(`/dict/data/${row.dictCode}?dictId=${row.id}`)
}

onMounted(getList)
</script>
