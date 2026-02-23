<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 16px;">
      <el-form :model="queryParams" inline @submit.prevent>
        <el-form-item label="政策标题">
          <el-input
              v-model="queryParams.title"
              placeholder="请输入政策标题"
              clearable
              style="width: 200px;"
              @keyup.enter="getList"
          />
        </el-form-item>
        <el-form-item label="政策类型">
          <el-select
              v-model="queryParams.policyType"
              placeholder="请选择政策类型"
              clearable
              style="width: 150px;"
          >
            <el-option
                v-for="item in policyTypeOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发布人姓名">
          <el-input
              v-model="queryParams.publisherName"
              placeholder="请输入发布人姓名"
              clearable
              style="width: 200px;"
              @keyup.enter="getList"
          />
        </el-form-item>
        <el-form-item label="政策类型名称">
          <el-input
              v-model="queryParams.policyTypeName"
              placeholder="请输入政策类型名称"
              clearable
              style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="政策内容">
          <el-input
              v-model="queryParams.content"
              placeholder="请输入政策内容关键词"
              clearable
              style="width: 300px;"
              @keyup.enter="getList"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getList">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button type="primary" icon="Plus" @click="handleAdd">新增政策</el-button>
          <!-- 按钮文本中加入隐藏政策数量 -->
          <el-button type="success" icon="View" @click="handleBatchShowHidden">
            恢复已隐藏的 {{ hiddenPolicyCount }} 条政策
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <div class="list-container">
        <div
            v-for="item in policyList"
            :key="item.id"
            class="list-item"
        >
          <div class="item-left">
            <div class="item-images">
              <div
                  v-for="(img, idx) in getContentImages(item.content)"
                  :key="idx"
                  class="item-image"
              >
                <img :src="img" alt="政策配图"/>
              </div>
              <!-- 无图片时占位 -->
              <div v-if="!getContentImages(item.content).length" class="item-image placeholder">
                <i class="el-icon-picture-outline"></i>
              </div>
            </div>
          </div>
          <div class="item-right">
            <div class="item-header">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-tag-group">
                <el-tag size="small" type="primary">已发布</el-tag>
                <el-tag size="small" type="danger">{{ item.policyTypeName }}</el-tag>
                <el-tag size="small" type="success">{{ item.publisherName }}</el-tag>
              </div>
            </div>
            <div class="item-content" v-html="getContentPreview(item.content)"></div>
            <div class="item-meta">
              <span class="meta-item">👤 {{ item.publisherName }}</span>
              <span class="meta-item">🕒 {{ item.publishTime ? formatDate(item.publishTime) : '-' }}</span>
            </div>
            <div class="bottem">
              <div class="item-detail">
                <el-button link type="primary" @click="viewContentDetail(item)" size="small">预览</el-button>
              </div>
              <!-- 操作按钮固定右下角 - 新增预览按钮在置顶左侧 -->
              <div class="item-actions">
                <el-switch
                    v-model="item.isTop"
                    :active-value="1"
                    :inactive-value="0"
                    inactive-text="置顶"
                    @change="handleTopChange(item)"
                    size="small"
                    style="margin-right: 12px;"
                />
                <el-switch
                    v-model="item.isShow"
                    :active-value="1"
                    :inactive-value="0"
                    inactive-text="显示"
                    @change="handleShowChange(item)"
                    :disabled="item.delFlag === 1"
                    size="small"
                    style="margin-right: 8px;"
                />
                <el-button link type="primary" @click="handleUpdate(item)" size="small">修改</el-button>
                <el-button link type="danger" @click="handleDelete(item)" size="small">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-pagination
          v-show="total > 0"
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          style="margin-top: 20px; text-align: right;"
          background
      />
    </el-card>

    <el-dialog title="政策内容详情" v-model="contentDetailVisible" width="800px" append-to-body>
      <div class="content-detail" v-html="processedContent"></div>
      <template #footer>
        <el-button @click="contentDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="dialogTitle" v-model="open" width="850px" append-to-body>
      <el-form ref="policyFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="政策标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入政策标题" style="width: 100%;"/>
        </el-form-item>
        <el-form-item label="政策类型" prop="policyType">
          <el-select v-model="form.policyType" placeholder="请选择政策类型" style="width: 100%;">
            <el-option
                v-for="item in policyTypeOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发布人姓名" prop="publisherName">
          <el-input v-model="form.publisherName" readonly style="width: 100%;"/>
        </el-form-item>
        <el-form-item label="政策内容" prop="content">
          <Editor v-model="form.content"/>
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
              v-model="form.publishTime"
              type="datetime"
              placeholder="请选择发布时间"
              style="width: 100%;"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-radio-group v-model="form.isTop">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
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
import {ref, onMounted, nextTick} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import Editor from '@/components/Editor.vue';

import {
  pagePolicy,
  addPolicy,
  updatePolicy,
  deletePolicy,
  changePolicyTopStatus,
  changePolicyShowStatus,
  getPolicyTypeOptions,
  batchShowPolicies,
  getHiddenPolicyIds
} from '@/api/policy';

// 基础状态
const loading = ref(false);
const open = ref(false);
const dialogTitle = ref('');
const policyFormRef = ref(null);
const policyTypeOptions = ref([]);

// 新增：隐藏政策数量
const hiddenPolicyCount = ref(0);

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  title: '',
  policyType: '',
  publisherName: '',
  content: '',
  policyTypeName: '',
});

// 列表数据
const policyList = ref([]);
const total = ref(0);

// 表单数据
const form = ref({
  id: '',
  title: '',
  policyType: '',
  publisherId: '',
  publisherName: '',
  content: '',
  publishTime: '',
  isTop: 0,
  isShow: 1,
});

// 详情弹窗
const contentDetailVisible = ref(false);
const processedContent = ref('');

// 自定义校验逻辑：判断富文本是否为空
const isEditorEmpty = (html) => {
  if (!html || html === '<p><br></p>' || html === '<p></p>' || html === '') return true;
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, '').trim();
  if (!text && html.includes('<img')) return false;
  return !text;
};

// 表单校验规则
const rules = {
  title: [{required: true, message: '政策标题不能为空', trigger: 'blur'}],
  policyType: [{required: true, message: '请选择政策类型', trigger: 'change'}],
  publisherName: [{required: true, message: '发布人姓名不能为空', trigger: 'blur'}],
  content: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (isEditorEmpty(value)) {
          callback(new Error('政策内容不能为空'));
        } else if (value.includes('data:image/')) {
          callback(new Error('存在未上传的本地图片，请等待上传完成或重新上传'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

// 工具：获取用户信息
const getCurrentUserInfo = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      return {
        id: user.id || user.userId || 1,
        name: user.realName || user.name || '管理员'
      };
    }
  } catch (e) {
    console.error("解析用户信息失败", e);
  }
  return {id: 1, name: '管理员'};
};

// 工具：格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return dateStr.substring(0, 19).replace('T', ' ');
};

// 提取富文本中的图片（优化图片提取逻辑）
const getContentImages = (htmlContent) => {
  if (!htmlContent) return [];
  const imgRegex = /<img[^>]+src="([^"]+)"/g;
  const images = [];
  let match;
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    images.push(match[1]);
    if (images.length >= 4) break; // 最多展示4张图
  }
  return images;
};

// 内容预览处理 - 新增处理HTML实体的逻辑
const getContentPreview = (htmlContent) => {
  if (!htmlContent) return '';

  // 1. 先创建一个临时div，将HTML实体转义为正常文本
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const text = tempDiv.textContent || tempDiv.innerText || '';

  const hasMedia = htmlContent.includes('<img') || htmlContent.includes('<video') || htmlContent.includes('<iframe');
  if (text.trim() === '' && hasMedia) {
    return '【包含图片/视频等媒体内容，点击查看详情】';
  }
  return text.length > 120 ? `${text.substring(0, 120)}...` : text.trim();
};

// 处理视频标签兼容性
const processVideoTags = (html) => {
  if (!html) return '';
  return html.replace(/<video([^>]*)>/g, (match, attrs) => {
    if (attrs.includes('controls')) return `<video ${attrs}>`;
    return `<video ${attrs} controls playsinline preload="metadata">`;
  });
};

// 获取列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await pagePolicy(queryParams.value);
    if (res.code === 200) {
      policyList.value = res.data.records || [];
      total.value = res.data.total || 0;
    }
  } catch (error) {
    ElMessage.error(`获取列表失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// 新增：获取隐藏政策数量
const getHiddenPolicyCount = async () => {
  try {
    const ids = await getHiddenPolicyIds().then(res => res.data || []);
    hiddenPolicyCount.value = ids.length;
  } catch (e) {
    console.error('获取隐藏政策数量失败:', e);
    hiddenPolicyCount.value = 0;
  }
};

// 重置查询
const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    title: '',
    policyType: '',
    publisherName: '',
    content: '',
    policyTypeName: ''
  };
  getList();
};

const handleSizeChange = (val) => {
  queryParams.value.pageSize = val;
  getList();
};
const handleCurrentChange = (val) => {
  queryParams.value.pageNum = val;
  getList();
};

// 新增
const handleAdd = () => {
  const user = getCurrentUserInfo();
  form.value = {
    id: '',
    title: '',
    policyType: '',
    publisherId: user.id,
    publisherName: user.name,
    content: '',
    publishTime: '',
    isTop: 0,
    isShow: 1
  };
  dialogTitle.value = '新增政策';
  open.value = true;
  nextTick(() => {
    if (policyFormRef.value) policyFormRef.value.clearValidate();
  });
};

// 修改
const handleUpdate = (row) => {
  form.value = {...row, publishTime: row.publishTime ? formatDate(row.publishTime) : ''};
  dialogTitle.value = '修改政策';
  open.value = true;
  nextTick(() => {
    if (policyFormRef.value) policyFormRef.value.clearValidate();
  });
};

// 置顶状态切换 - 新增实时刷新列表和隐藏数量逻辑
const handleTopChange = async (row) => {
  const oldTopStatus = row.isTop;
  try {
    const res = await changePolicyTopStatus(row.id, row.isTop);
    if (res.code === 200) {
      ElMessage.success('置顶状态修改成功');
      // 实时刷新列表
      await getList();
      // 同时刷新隐藏政策数量
      await getHiddenPolicyCount();
    } else {
      row.isTop = oldTopStatus;
      ElMessage.error(res.message || '置顶状态修改失败');
    }
  } catch (e) {
    row.isTop = oldTopStatus;
    ElMessage.error('网络异常，置顶状态修改失败');
    console.error('置顶状态修改异常：', e);
  }
};

// 显示状态切换 - 新增实时刷新列表和隐藏数量逻辑
const handleShowChange = async (row) => {
  const oldShowStatus = row.isShow;
  try {
    const res = await changePolicyShowStatus(row.id, row.isShow);
    if (res.code === 200) {
      ElMessage.success('显示状态修改成功');
      // 实时刷新列表
      await getList();
      // 同时刷新隐藏政策数量
      await getHiddenPolicyCount();
    } else {
      row.isShow = oldShowStatus;
      ElMessage.error(res.message || '显示状态修改失败');
    }
  } catch (e) {
    row.isShow = oldShowStatus;
    ElMessage.error('网络异常，显示状态修改失败');
    console.error('显示状态修改异常：', e);
  }
};

// 删除 - 新增实时刷新隐藏数量逻辑
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除政策【${row.title}】吗？`, '警告', {type: 'warning'}).then(async () => {
    const res = await deletePolicy(row.id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      getList();
      // 同时刷新隐藏政策数量
      await getHiddenPolicyCount();
    }
  });
};

// 批量恢复隐藏 - 带统计数量并实时刷新
const handleBatchShowHidden = async () => {
  try {
    const ids = await getHiddenPolicyIds().then(res => res.data || []);
    if (ids.length === 0) return ElMessage.info('暂无隐藏政策');
    await ElMessageBox.confirm(`确定恢复 **${ids.length}** 条已隐藏政策吗？`, '提示');
    const res = await batchShowPolicies(ids);
    if (res.code === 200) {
      ElMessage.success(`已成功恢复 ${ids.length} 条政策`);
      getList();
      // 同时刷新隐藏政策数量
      await getHiddenPolicyCount();
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败');
  }
};

// 提交表单 - 新增实时刷新隐藏数量逻辑
const submitForm = async () => {
  if (!policyFormRef.value) return;
  await policyFormRef.value.validate(async (valid) => {
    if (valid) {
      const res = form.value.id ? await updatePolicy(form.value) : await addPolicy(form.value);
      if (res.code === 200) {
        ElMessage.success('保存成功');
        open.value = false;
        getList();
        // 同时刷新隐藏政策数量
        await getHiddenPolicyCount();
      } else {
        ElMessage.error(res.message);
      }
    }
  });
};

// 查看详情（预览）
const viewContentDetail = (row) => {
  processedContent.value = processVideoTags(row.content);
  contentDetailVisible.value = true;
};

// 获取政策类型列表
const getPolicyTypeList = async () => {
  const res = await getPolicyTypeOptions();
  if (res.code === 200) policyTypeOptions.value = res.data || [];
};

onMounted(() => {
  getPolicyTypeList();
  getList();
  // 页面初始化时获取隐藏政策数量
  getHiddenPolicyCount();
});
</script>

<style scoped>
.app-container {
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

/* 列表容器样式 */
.list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 单条数据项样式 - 卡片化 */
.list-item {
  display: flex;
  border: rgba(213, 213, 213, 0.56) 1px solid;
  gap: 16px;
  padding: 15px;
  background-color: #fff;
  transition: box-shadow 0.2s ease;
  border-radius: 8px;
}

.list-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 左侧图片区域 - 修复图片显示不完整问题 */
.item-left {
  flex-shrink: 0;
  width: 92px;
  margin-right: 10px;
  margin-left: 5px;
}

.item-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  height: 140px;
  overflow: hidden;
}

.item-image {
  width: 90px; /* 固定宽度，避免变形 */
  height: 90px; /* 固定高度，避免变形 */
  background-color: #f8f9fa;
  overflow: hidden;
  border: #bababa 1px solid;
  border-radius: 4px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 覆盖模式，保证图片完整显示 */
  display: block; /* 去除图片默认间隙 */
}

/* 无图片占位 */
.item-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 24px;
}

/* 右侧内容区域 */
.item-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 140px; /* 保证容器高度，避免按钮错位 */
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  max-width: 70%;
}

.item-tag-group {
  display: flex;
  gap: 10px;
}

.item-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  word-break: break-all;
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 20px; /* 预留按钮空间 */
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bottem {
  border-top: rgba(209, 209, 209, 0.57) 1px solid;
}

.item-detail {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
}

/* 操作按钮 - 固定右下角，预览按钮在置顶左侧 */
.item-actions {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 详情弹窗样式 */
.content-detail {
  padding: 16px;
  line-height: 1.8;
  font-size: 14px;
}

.content-detail :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px auto;
}

.content-detail :deep(video),
.content-detail :deep(iframe) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px auto;
}

/* 表格卡片样式 */
.table-card {
  background-color: #fff;
  padding: 10px;
}

/* 分页样式 */
:deep(.el-pagination) {
  margin-top: 20px;
}

/* 开关样式优化 */
:deep(.el-switch) {
  margin: 0;
}

:deep(.el-switch__label) {
  font-size: 12px;
}

/* 按钮样式优化 */
:deep(.el-button--link) {
  font-size: 12px;
  padding: 4px 8px;
}
</style>