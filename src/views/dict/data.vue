<template>
  <div class="app-container">
    <el-card shadow="never" class="filter-card">
        <el-form :model="searchForm" inline @submit.prevent="getList">
          <el-form-item label="项目标签">
            <el-input
                v-model="searchForm.itemName"
                placeholder="请输入项目标签关键词"
                clearable
                style="width: 200px;"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 150px;"
            >
              <el-option label="正常" value="1" />
              <el-option label="停用" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="getList">查询</el-button>
            <el-button icon="Refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
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

      <!-- 新增：分页组件 -->
      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          style="margin-top: 20px; text-align: right;"
      />
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
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import {
  getItemByCode,
  addDictItem,
  updateDictItem,
  delDictItem,
  selectItemList // 新增：导入分页查询接口
} from '@/api/dictItem'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const dictId = route.query.dictId
const dictCode = route.params.dictCode

// 分页相关变量
const pageNum = ref(1)        // 当前页码
const pageSize = ref(10)      // 每页条数
const total = ref(0)          // 总记录数

const itemList = ref([])
const loading = ref(false)
const open = ref(false)
const dialogTitle = ref('')
const itemFormRef = ref(null)

// 新增：查询表单参数
const searchForm = reactive({
  itemName: '',  // 项目标签关键词
  status: ''     // 状态筛选
})

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

// 重构：分页查询列表（支持项目标签+状态筛选）
const getList = async () => {
  loading.value = true
  try {
    // 构造查询参数（匹配后端selectItemList的参数）
    const queryParams = {
      dictId: dictId,                // 字典ID（必传）
      itemName: searchForm.itemName, // 项目标签模糊查询
      status: searchForm.status ? Number(searchForm.status) : null, // 状态筛选（转数字）
      pageNum: pageNum.value,        // 页码
      pageSize: pageSize.value       // 每页条数
    }

    // 调用分页查询接口（替换原getItemByCode）
    const res = await selectItemList(queryParams)

    // 适配后端分页返回格式（records:列表数据, total:总条数）
    itemList.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error('查询字典项失败:', error)
    ElMessage.error('查询字典项失败')
    itemList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 新增：重置查询条件
const resetSearch = () => {
  searchForm.itemName = ''
  searchForm.status = ''
  pageNum.value = 1 // 重置页码
  getList()
}

// 新增：分页大小变化处理
const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1 // 页大小变化回到第一页
  getList()
}

// 新增：页码变化处理
const handleCurrentChange = (val) => {
  pageNum.value = val
  getList()
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
  try {
    const res = form.value.id
        ? await updateDictItem(form.value)
        : await addDictItem(form.value)

    if (res.code === 200) {
      ElMessage.success(res.message)
      open.value = false
      getList() // 提交后刷新列表
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    console.error('保存字典项失败:', error)
    ElMessage.error('保存字典项失败')
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
    try {
      const res = await delDictItem(row.id)
      if (res.code === 200) {
        ElMessage.success(res.message)
        getList() // 删除后刷新列表
      } else {
        ElMessage.error(res.message)
      }
    } catch (error) {
      console.error('删除字典项失败:', error)
      ElMessage.error('删除字典项失败')
    }
  }).catch(() => {})
}

onMounted(getList)
</script>

<style scoped>
.filter-card {
  margin-bottom: 15px;
}
</style>