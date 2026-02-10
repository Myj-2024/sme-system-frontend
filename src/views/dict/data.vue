<template>
  <div class="app-container">
    <el-card shadow="never">
      <div style="margin-bottom: 15px;">
        <el-button @click="$router.back()">返回</el-button>
        <el-button type="primary" @click="handleAdd">新增项</el-button>
      </div>

      <el-table :data="itemList" border v-loading="loading">
        <el-table-column label="项目标签" prop="itemName" />
        <el-table-column label="项目编码" prop="itemCode" />
        <el-table-column label="排序" prop="sort" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="open" width="500px">
      <el-form ref="itemFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="项目标签" prop="itemName">
          <el-input v-model="form.itemName" />
        </el-form-item>
        <el-form-item label="项目编码" prop="itemCode">
          <el-input v-model="form.itemCode" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
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
import { useRoute } from 'vue-router'
import { getItemByCode, addDictItem, updateDictItem, delDictItem } from '@/api/dictItem'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const dictId = route.query.dictId
const dictCode = route.params.dictCode

const itemList = ref([])
const loading = ref(false)
const open = ref(false)
const dialogTitle = ref('')
const itemFormRef = ref(null)

const form = ref({
  dictId,
  itemName: '',
  itemCode: '',
  sort: 0,
  status: 1
})

const rules = {
  itemName: [{ required: true, message: '不能为空', trigger: 'blur' }],
  itemCode: [{ required: true, message: '不能为空', trigger: 'blur' }]
}

const getList = async () => {
  loading.value = true
  const res = await getItemByCode(dictCode)
  itemList.value = res.data || []
  loading.value = false
}

const handleAdd = () => {
  form.value = { dictId, itemName: '', itemCode: '', sort: 0, status: 1 }
  dialogTitle.value = '添加字典项'
  open.value = true
}

const handleUpdate = (row) => {
  form.value = { ...row }
  dialogTitle.value = '修改字典项'
  open.value = true
}

const submitForm = async () => {
  await itemFormRef.value.validate()
  const res = form.value.id
      ? await updateDictItem(form.value)
      : await addDictItem(form.value)

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
      `确认删除字典项【${row.itemName}】？删除后不可恢复！`,
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    const res = await delDictItem(row.id)
    if (res.code === 200) {
      ElMessage.success(res.message)
      getList()
    } else {
      ElMessage.error(res.message)
    }
  }).catch(() => {})
}

onMounted(getList)
</script>
