<template>
  <div class="icon-management-container">
    <!-- 查询区域 -->
    <el-card class="query-card" shadow="never">
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="图标名称">
          <el-input
              v-model="queryForm.iconName"
              placeholder="请输入图标名称"
              clearable
              @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="图标编码">
          <el-input
              v-model="queryForm.iconCode"
              placeholder="请输入图标编码"
              clearable
              @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增图标</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图标展示区域 -->
    <el-card class="icon-card" shadow="never">
      <div class="icon-grid">
        <div
            v-for="item in iconList"
            :key="item.id"
            class="icon-item"
        >
          <div class="icon-preview-wrapper">
            <el-image
                :src="item.iconUrl"
                class="icon-preview"
                :preview-src-list="[item.iconUrl]"
                fit="contain"
                @error="handleImageError(item)"
            >
              <template #error>
                <span class="img-fallback">图片加载失败</span>
              </template>
            </el-image>
          </div>

          <div class="icon-info">
            <div class="icon-name">{{ item.iconName }}</div>
            <div class="icon-code">{{ item.iconCode }}</div>
          </div>

          <div class="icon-actions">
            <el-button text type="primary" @click="handleEdit(item)">编辑</el-button>
            <el-button text type="danger" @click="handleDelete(item)">删除</el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="pagination.pageNum"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[30]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleQuery"
            @current-change="handleQuery"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="500px"
        :before-close="handleClose"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="80px"
      >
        <el-form-item label="图标名称" prop="iconName">
          <el-input v-model="formData.iconName" placeholder="请输入图标名称"/>
        </el-form-item>

        <el-form-item label="图标编码" prop="iconCode">
          <el-input v-model="formData.iconCode" placeholder="请输入图标编码"/>
        </el-form-item>

        <el-form-item label="图标预览" prop="iconUrl">
          <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="handleUpload"
          >
            <div v-if="formData.iconUrl" class="avatar-wrapper">
              <el-image
                  :src="formData.iconUrl"
                  class="avatar"
                  fit="contain"
                  @error="handleImageError(formData)"
              >
                <template #error>
                  <span class="img-fallback">图片加载失败</span>
                </template>
              </el-image>
            </div>
            <div v-else class="avatar-uploader-icon">
              <el-icon>
                <Plus/>
              </el-icon>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, nextTick} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'
import {iconApi, uploadFile} from '@/api/icon'

const queryForm = reactive({
  iconName: '',
  iconCode: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 30,
  total: 0
})

const iconList = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()

const formData = reactive({
  id: null,
  iconName: '',
  iconCode: '',
  iconUrl: ''
})

const formRules = {
  iconName: [{required: true, message: '图标名称不能为空', trigger: 'blur'}],
  iconCode: [{required: true, message: '图标编码不能为空', trigger: 'blur'}],
  iconUrl: [{required: true, message: '请上传图标', trigger: 'change'}]
}

const getIconList = async () => {
  const params = {
    ...queryForm,
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize
  }
  const res = await iconApi.getIconPage(params)
  iconList.value = res.data.records || res.data.data || []
  pagination.total = res.data.total || 0
}

const handleQuery = () => {
  pagination.pageNum = 1
  getIconList()
}

const handleReset = () => {
  queryForm.iconName = ''
  queryForm.iconCode = ''
  handleQuery()
}

const handleAdd = () => {
  dialogTitle.value = '新增图标'
  dialogVisible.value = true
  nextTick(() => {
    resetForm()
  })
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑图标'
  dialogVisible.value = true
  Object.assign(formData, row)
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定要删除图标【${row.iconName}】吗？`, '提示')
  await iconApi.deleteIcon(row.id)
  ElMessage.success('删除成功')
  getIconList()
}

const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  formData.id = null
  formData.iconName = ''
  formData.iconCode = ''
  formData.iconUrl = ''
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (formData.id) {
      await iconApi.updateIcon(formData)
      ElMessage.success('修改成功')
    } else {
      await iconApi.addIcon(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getIconList()
  })
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  return true
}

const handleUpload = async (options) => {
  const form = new FormData()
  form.append('file', options.file)
  const url = await uploadFile(form)
  formData.iconUrl = url
  ElMessage.success('上传成功')
}

const handleImageError = (item) => {
  console.warn('图片加载失败:', item.iconUrl)
}

getIconList()
</script>

<style scoped>

.query-card {
  margin-bottom: 10px;
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.icon-card {
  min-height: 580px;
}

/* 每行展示5个图标 */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  padding: 10px 0;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: all 0.3s;
}

.icon-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.icon-preview-wrapper {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s;
}

.icon-preview-wrapper:hover {
  transform: scale(1.5);
  z-index: 10;
}

.icon-preview {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  object-fit: contain;
  overflow: hidden;
}

:deep(.icon-preview .el-image__inner),
:deep(.icon-preview img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
}

:deep(.icon-preview .el-image),
:deep(.icon-preview .el-image__wrapper) {
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

.icon-info {
  text-align: center;
  margin-bottom: 8px;
}

.icon-name {
  font-size: 12px;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.icon-code {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.icon-actions {
  display: flex;
  gap: 5px;
}

.pagination-wrapper {
  margin-top: 10px;
  text-align: right;
}

.avatar-uploader {
  :deep(.el-upload) {
    border: none;
  }

  /* 已上传图片的预览框 */
  .avatar-wrapper {
    width: 100px;
    height: 100px;
    overflow: hidden;
    position: relative;
    border: 1px solid #dcdfe6; /* 边框 */
    border-radius: 6px;
  }

  /* 未上传时的“+”号区域，添加边框 */
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    border: 1px solid #dcdfe6; /* 新增边框 */
    border-radius: 6px; /* 圆角 */
  }

  .avatar {
    width: 100px !important;
    height: 100px !important;
    overflow: hidden !important;
  }

  :deep(.avatar .el-image__inner),
  :deep(.avatar img),
  :deep(.avatar .el-image),
  :deep(.avatar .el-image__wrapper) {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    overflow: hidden !important;
  }

  .img-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    color: #999;
    font-size: 12px;
    border-radius: 4px;
  }
}

.img-fallback {
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
</style>