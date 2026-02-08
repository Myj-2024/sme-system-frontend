<template>
  <div class="dict-list-page">
    <!-- 查询表单 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline @submit.prevent>
        <el-form-item label="字典编码">
          <el-input v-model="searchForm.dictCode" placeholder="请输入字典编码" clearable />
        </el-form-item>
        <el-form-item label="字典名称">
          <el-input v-model="searchForm.dictName" placeholder="请输入字典名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" icon="Plus" @click="handleAdd" style="margin-left: 8px;">新增字典</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 字典列表 -->
    <el-card class="list-card" shadow="never">
      <el-table style="width: 100%"
                :data="filteredDictList"
                border
                stripe
                :loading="loading"
                fit
      >
        <el-table-column prop="id" label="ID" width="60" align="center"/>
        <el-table-column prop="dictCode" label="字典编码" width="220" align="center"/>
        <el-table-column prop="dictName" label="字典名称" width="220" align="center"/>
        <el-table-column prop="sort" label="排序" width="80" align="center"/>
        <el-table-column prop="status" label="状态" width="200" align="center">
          <template #default="{ row }">
            <el-switch
                v-model="row.status"
                active-value="1"
                inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
                @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="200" align="center">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="200" align="center">
          <template #default="{ row }">
            {{ formatTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button
                  type="primary"
                  size="small"
                  icon="Edit"
                  @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                  type="danger"
                  size="small"
                  icon="Delete"
                  @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="filteredTotal"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="1000px" @close="handleDialogClose">
      <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
        <el-form-item label="字典编码" prop="dictCode">
          <el-input v-model="form.dictCode" placeholder="请输入字典编码" :disabled="!isAdd" />
        </el-form-item>
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort" >
          <el-input-number v-model="form.sort" min="0" placeholder="请输入排序值" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
              v-model="form.status"
              active-value="1"
              inactive-value="0"
          />
        </el-form-item>

        <!-- 字典项列表 - 新增修改按钮 -->
        <el-form-item label="字典项">
          <div class="dict-item-container">
            <el-table :data="form.dictItems" border fit style="width: 100%">
              <el-table-column label="项编码" width="180">
                <template #default="{ row, $index }">
                  <el-input
                      v-model="row.itemCode"
                      placeholder="请输入项编码"
                      :disabled="row.id && !row.isEditing"
                  />
                </template>
              </el-table-column>
              <el-table-column label="项名称" width="180">
                <template #default="{ row, $index }">
                  <el-input
                      v-model="row.itemName"
                      placeholder="请输入项名称"
                      :disabled="row.id && !row.isEditing"
                  />
                </template>
              </el-table-column>
              <el-table-column label="排序" width="180">
                <template #default="{ row, $index }">
                  <el-input-number
                      v-model="row.sort"
                      min="0"
                      :disabled="row.id && !row.isEditing"
                  />
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row, $index }">
                  <el-switch
                      v-model="row.status"
                      active-value="1"
                      inactive-value="0"
                      :disabled="row.id && !row.isEditing"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" align="center">
                <template #default="{ row, $index }">
                  <div class="item-operation">
                    <!-- 已有项显示修改按钮，新增项直接显示删除 -->
                    <el-button
                        v-if="row.id && !row.isEditing"
                        type="primary"
                        size="small"
                        icon="Edit"
                        @click="startEditItem($index)"
                    >
                      修改
                    </el-button>
                    <el-button
                        v-if="row.id && row.isEditing"
                        type="success"
                        size="small"
                        icon="Check"
                        @click="confirmEditItem($index)"
                    >
                      确认
                    </el-button>
                    <el-button
                        type="danger"
                        size="small"
                        icon="Delete"
                        @click="removeDictItem($index)"
                    >
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="text" icon="Plus" @click="addDictItem">添加字典项</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dictApi from '@/api/dict'

// 时间格式化工具函数
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 搜索表单
const searchForm = reactive({
  dictCode: '',
  dictName: '',
  status: ''
})

// 表格数据
const dictList = ref([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)

// 过滤方法
const filterDictList = () => {
  if (dictList.value.length === 0) return []

  return dictList.value.filter(item => {
    // 字典编码模糊匹配
    if (searchForm.dictCode && !item.dictCode.toLowerCase().includes(searchForm.dictCode.toLowerCase())) {
      return false
    }
    // 字典名称模糊匹配
    if (searchForm.dictName && !item.dictName.toLowerCase().includes(searchForm.dictName.toLowerCase())) {
      return false
    }
    // 状态精确匹配
    if (searchForm.status !== '' && item.status !== searchForm.status.toString()) {
      return false
    }
    return true
  })
}

// 计算过滤后的总条数
const filteredTotal = computed(() => {
  return filterDictList().length
})

// 计算当前页显示的过滤后数据
const filteredDictList = computed(() => {
  const list = filterDictList()
  const startIndex = (pageNum.value - 1) * pageSize.value
  return list.slice(startIndex, startIndex + pageSize.value)
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增字典')
const isAdd = ref(true)
const formRef = ref(null)
const form = reactive({
  id: '',
  dictCode: '',
  dictName: '',
  sort: 0,
  status: '1',
  dictItems: [{
    id: '', // 新增：保留字典项ID，用于编辑时识别原有项
    itemCode: '',
    itemName: '',
    sort: 0,
    status: '1',
    isEditing: false, // 新增：是否正在编辑
    isModified: false // 新增：是否已修改
  }]
})

// 记录原始表单数据（用于判断是否有变化）
const originalFormData = ref({})

// 表单校验规则
const rules = {
  dictCode: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 页面加载时获取数据
onMounted(() => {
  getDictList()
})

// 获取字典列表
const getDictList = async () => {
  loading.value = true
  try {
    const queryParams = {
      pageNum: 1,
      pageSize: 9999,
      dictCode: '',
      dictName: '',
      status: ''
    }

    const res = await dictApi.getDictPage(queryParams)
    const list = res.data.list || []
    dictList.value = list.map(item => ({
      ...item,
      status: item.status.toString()
    }))
    total.value = res.data.total || 0
  } catch (error) {
    // 适配后端返回的详细提示（含已删除不可重复）
    const errMsg = error.response?.data?.msg || error.msg || error.message || '网络异常'
    ElMessage.error('获取字典列表失败：' + errMsg)
    console.error('获取字典列表错误详情：', error)
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pageNum.value = 1
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    dictCode: '',
    dictName: '',
    status: ''
  })
  pageNum.value = 1
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
}

// 页码变化
const handleCurrentChange = (val) => {
  pageNum.value = val
}

// 开始编辑字典项
const startEditItem = (index) => {
  // 保存当前项的原始数据
  const item = form.dictItems[index]
  item.originalData = { ...item }
  item.isEditing = true
}

// 确认编辑字典项
const confirmEditItem = (index) => {
  const item = form.dictItems[index]
  item.isEditing = false
  item.isModified = true // 标记为已修改

  // 简单校验
  if (!item.itemCode?.trim()) {
    ElMessage.error('字典项编码不能为空')
    item.isEditing = true
    return
  }
  if (!item.itemName?.trim()) {
    ElMessage.error('字典项名称不能为空')
    item.isEditing = true
    return
  }
}

// 新增字典
const handleAdd = () => {
  dialogTitle.value = '新增字典'
  isAdd.value = true
  resetForm()
  // 新增时默认添加一个可编辑的空项
  form.dictItems = [{
    id: '',
    itemCode: '',
    itemName: '',
    sort: 0,
    status: '1',
    isEditing: true, // 新增项默认可编辑
    isModified: true
  }]
  dialogVisible.value = true
}

// 编辑字典
const handleEdit = async (row) => {
  dialogTitle.value = '编辑字典'
  isAdd.value = false

  try {
    // 查询字典详情（含字典项）
    const res = await dictApi.getDictById(row.id)
    const detail = res.data || {}
    // 转换状态为字符串，保留字典项ID
    const formData = {
      ...detail,
      status: detail.status.toString(),
      dictItems: detail.dictItems ? detail.dictItems.map(item => ({
        ...item,
        id: item.id || '', // 关键：保留原有字典项ID
        status: item.status.toString(),
        isEditing: false,
        isModified: false
      })) : [{ id: '', itemCode: '', itemName: '', sort: 0, status: '1', isEditing: false, isModified: false }]
    }
    Object.assign(form, formData)
    // 保存原始数据
    originalFormData.value = JSON.parse(JSON.stringify(formData))
    dialogVisible.value = true
  } catch (error) {
    // 适配后端详细提示
    const errMsg = error.response?.data?.msg || error.msg || error.message || '操作异常'
    ElMessage.error('获取字典详情失败：' + errMsg)
  }
}

// 删除字典
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该字典吗？删除后不可恢复！', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await dictApi.deleteDict(row.id)
    ElMessage.success('删除成功')
    getDictList()
  } catch (error) {
    if (error !== 'cancel') {
      // 适配后端删除失败提示（如关联数据存在）
      const errMsg = error.response?.data?.msg || error.msg || error.message || '操作异常'
      ElMessage.error('删除失败：' + errMsg)
    } else {
      ElMessage.info('已取消删除')
    }
  }
}

// 状态切换
const handleStatusChange = async (row) => {
  try {
    const status = parseInt(row.status)
    await dictApi.updateDictStatus(row.id, status)
    ElMessage.success(status === 1 ? '启用成功' : '禁用成功')
    getDictList()
  } catch (error) {
    // 适配后端状态修改失败提示
    const errMsg = error.response?.data?.msg || error.msg || error.message || '操作异常'
    ElMessage.error(`状态更新失败：${errMsg}`)
    // 回滚状态
    row.status = row.status === '1' ? '0' : '1'
  }
}

// 添加字典项
const addDictItem = () => {
  form.dictItems.push({
    id: '', // 新增项ID为空
    itemCode: '',
    itemName: '',
    sort: 0,
    status: '1',
    isEditing: true, // 新增项默认处于编辑状态
    isModified: true // 新增项标记为已修改
  })
}

// 删除字典项
const removeDictItem = (index) => {
  const item = form.dictItems[index]
  // 如果是已有项且被删除，标记为需要删除
  if (item.id) {
    item.needDelete = true
  } else {
    form.dictItems.splice(index, 1)
  }

  // 保证至少有一个字典项
  if (form.dictItems.length === 0) {
    addDictItem()
  }
}

// 检查是否有数据变化
const hasDataChanged = () => {
  // 新增模式下默认有变化
  if (isAdd.value) return true

  // 检查基础信息是否变化
  if (
      form.dictName !== originalFormData.value.dictName ||
      form.sort !== originalFormData.value.sort ||
      form.status !== originalFormData.value.status
  ) {
    return true
  }

  // 检查字典项是否有变化（新增/修改/删除）
  const hasItemChanged = form.dictItems.some((item, index) => {
    // 新增项
    if (!item.id) return true
    // 已修改的项
    if (item.isModified) return true
    // 标记为删除的项
    if (item.needDelete) return true

    // 原始数据中是否存在该项
    const originalItem = originalFormData.value.dictItems.find(i => i.id === item.id)
    return !originalItem // 原始项被删除
  })

  return hasItemChanged
}

// 前端校验字典项唯一性（仅校验提交项内部的重复）
const validateDictItemsUniqueness = (items) => {
  const codes = []
  const names = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const code = item.itemCode?.trim()
    const name = item.itemName?.trim()

    if (!code) {
      ElMessage.error(`第${i + 1}行字典项编码不能为空`)
      return false
    }

    if (!name) {
      ElMessage.error(`第${i + 1}行字典项名称不能为空`)
      return false
    }

    if (codes.includes(code)) {
      ElMessage.error(`字典项编码【${code}】重复`)
      return false
    }

    if (names.includes(name)) {
      ElMessage.error(`字典项名称【${name}】重复`)
      return false
    }

    codes.push(code)
    names.push(name)
  }

  return true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  // 1. 检查是否有数据变化，无变化直接关闭弹窗
  if (!hasDataChanged()) {
    dialogVisible.value = false
    return
  }

  try {
    // 2. 表单基础校验
    await formRef.value.validate()

    // 3. 筛选需要提交的项（新增/修改/删除）
    const submitItems = []
    const deleteIds = []

    form.dictItems.forEach(item => {
      // 跳过空项
      if (!item.itemCode?.trim() || !item.itemName?.trim()) return

      // 标记为删除的项
      if (item.needDelete && item.id) {
        deleteIds.push(item.id)
        return
      }

      // 新增项或已修改的项
      if (!item.id || item.isModified) {
        submitItems.push({
          id: item.id || undefined,
          itemCode: item.itemCode.trim(),
          itemName: item.itemName.trim(),
          sort: parseInt(item.sort) || 0,
          status: parseInt(item.status) || 1
        })
      }
    })

    // 4. 前端唯一性校验（仅校验提交项内部）
    if (!validateDictItemsUniqueness(submitItems)) {
      return
    }

    // 5. 后端唯一性校验（区分新增/编辑场景）
    try {
      if (isAdd.value) {
        // 新增字典：校验整个系统内是否重复
        await dictApi.checkDictItemUnique({
          items: submitItems.map(item => ({
            itemCode: item.itemCode,
            itemName: item.itemName
          }))
        })
      } else {
        // 编辑字典：仅校验当前字典内的重复（排除自身原始数据）
        await dictApi.checkDictItemUnique({
          dictId: form.id,
          items: submitItems.map(item => ({
            itemCode: item.itemCode,
            itemName: item.itemName,
            id: item.id // 携带ID，后端排除自身
          }))
        })
      }
    } catch (error) {
      const errMsg = error.response?.data?.msg || '字典项编码/名称已存在'
      ElMessage.error(errMsg)
      return
    }

    // 6. 构建提交数据
    const submitData = {
      id: form.id,
      dictCode: form.dictCode,
      dictName: form.dictName.trim(),
      sort: parseInt(form.sort) || 0,
      status: parseInt(form.status) || 1,
      dictItems: submitItems,
      deleteIds: deleteIds
    }

    // 7. 提交数据
    if (isAdd.value) {
      await dictApi.addDict(submitData)
      ElMessage.success('新增字典成功')
    } else {
      await dictApi.updateDict(submitData)
      ElMessage.success('编辑字典成功')
    }

    dialogVisible.value = false
    getDictList()
  } catch (error) {
    if (error.fields) {
      return
    }
    // 适配后端唯一性校验提示（含已删除不可重复）
    const errMsg = error.response?.data?.msg || error.msg || error.message || '操作异常'
    ElMessage.error((isAdd.value ? '新增' : '编辑') + '失败：' + errMsg)
    console.error('提交表单错误详情：', error)
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: '',
    dictCode: '',
    dictName: '',
    sort: 0,
    status: '1',
    dictItems: [{
      id: '',
      itemCode: '',
      itemName: '',
      sort: 0,
      status: '1',
      isEditing: false,
      isModified: false
    }]
  })
  originalFormData.value = {}
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 关闭弹窗
const handleDialogClose = () => {
  resetForm()
}
</script>

<style scoped lang="scss">
.dict-list-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 4px;
  .el-form {
    margin: 0;
    padding: 16px;
  }
}

.list-card {
  border-radius: 4px;
  .el-table {
    --el-table-header-text-color: #606266;
    --el-table-row-hover-bg-color: #f5f7fa;
  }
  .pagination {
    margin-top: 20px;
    text-align: right;
    padding-right: 10px;
  }
}

.operation-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  .el-button {
    flex-shrink: 0;
  }
}

:deep(.el-table__fixed-right) {
  border-left: 1px solid #ebeef5;
}

.dict-item-container {
  margin-top: 10px;
  .el-button {
    margin-top: 10px;
  }
}

.item-operation {
  display: flex;
  gap: 4px;
  justify-content: center;
}
</style>