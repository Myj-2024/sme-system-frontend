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
              @keyup.enter="getList"
          />
        </el-form-item>
        <el-form-item label="政策内容">
          <!-- 保留：查询区使用普通el-input -->
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
          <el-button type="success" icon="View" @click="handleBatchShowHidden">一键显示已隐藏政策</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table
          :data="policyList"
          border
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#f8f9fa', color: '#303133', fontWeight: '500' }"
          :row-style="{ height: '60px' }"
          :cell-style="{ padding: '10px 0' }"
          stripe
          highlight-current-row
      >
        <el-table-column label="ID" prop="id" width="80" align="center"/>
        <el-table-column label="政策标题" prop="title" min-width="150" align="center"/>
        <el-table-column label="政策类型" prop="policyTypeName" width="100" align="center">
          <template #default="scope">
            <el-tag size="small" type="info">{{ scope.row.policyTypeName || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布人" prop="publisherName" width="90" align="center"/>
        <el-table-column label="政策内容" prop="content" min-width="200" align="center">
          <template #default="scope">
            <div
                class="content-wrapper"
                @click="viewContentDetail(scope.row)"
                :class="{ 'clickable-content': getContentTextLength(scope.row.content) > 20 }"
            >
              <div class="content-ellipsis" v-html="getContentPreview(scope.row.content)"></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" prop="publishTime" width="120" align="center">
          <template #default="scope">
            {{ scope.row.publishTime ? formatDate(scope.row.publishTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="updateTime" width="120" align="center">
          <template #default="scope">
            {{ scope.row.updateTime ? formatDate(scope.row.updateTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.delFlag === 1 && scope.row.isShow === 0" type="danger">已隐藏</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center">
          <template #default="scope">
            <el-switch
                v-model="scope.row.isTop"
                :active-value="1"
                :inactive-value="0"
                active-text="置顶"
                @change="handleTopChange(scope.row)"
                style="margin-right: 8px;"
            />
            <el-switch
                v-model="scope.row.isShow"
                :active-value="1"
                :inactive-value="0"
                active-text="显示"
                @change="handleShowChange(scope.row)"
                style="margin-right: 8px;"
                :disabled="scope.row.delFlag === 1"
            />
            <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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
      <div class="content-detail" v-html="currentContent"></div>
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
          <!-- 保留：对话框中正常使用富文本编辑器 -->
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
import {ref, onMounted, watch, nextTick} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';

// 导入封装好的 Editor 组件
import Editor from '@/components/Editor.vue';

// 导入 API
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
const currentContent = ref('');

// 自定义校验逻辑：判断富文本是否为空
const isEditorEmpty = (html) => {
  if (!html || html === '<p><br></p>' || html === '<p></p>' || html === '') return true;
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, '').trim();
  // 如果没有文字但有图片，也不算空
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
        name: user.realName || user.name || '系统管理员'
      };
    }
  } catch (e) {
    console.error("解析用户信息失败", e);
  }
  return {id: 1, name: '系统管理员'};
};

// 工具：格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return dateStr.substring(0, 19).replace('T', ' ');
};

// 工具：预览长度
const getContentTextLength = (htmlContent) => {
  if (!htmlContent) return 0;
  return htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, '').length;
};

const getContentPreview = (htmlContent) => {
  if (!htmlContent) return '';
  const text = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
  return text.length > 25 ? `${text.substring(0, 25)}...` : text;
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

// 状态切换：置顶（核心优化：仅更新当前行，不刷新全量列表）
const handleTopChange = async (row) => {
  // 保存原始状态，用于异常回滚
  const oldTopStatus = row.isTop;
  try {
    const res = await changePolicyTopStatus(row.id, row.isTop);
    if (res.code === 200) {
      ElMessage.success('置顶状态修改成功');
      // 仅更新当前行数据，表格只重渲染这一行
      const targetIndex = policyList.value.findIndex(item => item.id === row.id);
      if (targetIndex !== -1) {
        // 深拷贝避免直接修改响应式数据导致的异常
        policyList.value[targetIndex] = {
          ...policyList.value[targetIndex],
          isTop: row.isTop,
          updateTime: new Date().toISOString() // 可选：更新修改时间
        };
      }
    } else {
      // 接口失败时回滚开关状态
      row.isTop = oldTopStatus;
      ElMessage.error(res.message || '置顶状态修改失败');
    }
  } catch (e) {
    // 网络异常时回滚开关状态
    row.isTop = oldTopStatus;
    ElMessage.error('网络异常，置顶状态修改失败');
    console.error('置顶状态修改异常：', e);
  }
};

// 状态切换：显示（核心优化：仅更新当前行，不刷新全量列表）
const handleShowChange = async (row) => {
  // 保存原始状态，用于异常回滚
  const oldShowStatus = row.isShow;
  try {
    const res = await changePolicyShowStatus(row.id, row.isShow);
    if (res.code === 200) {
      ElMessage.success('显示状态修改成功');
      // 仅更新当前行数据，表格只重渲染这一行
      const targetIndex = policyList.value.findIndex(item => item.id === row.id);
      if (targetIndex !== -1) {
        policyList.value[targetIndex] = {
          ...policyList.value[targetIndex],
          isShow: row.isShow,
          delFlag: row.isShow === 0 ? 1 : 0, // 同步状态标签的关联字段
          updateTime: new Date().toISOString() // 可选：更新修改时间
        };
      }
    } else {
      // 接口失败时回滚开关状态
      row.isShow = oldShowStatus;
      ElMessage.error(res.message || '显示状态修改失败');
    }
  } catch (e) {
    // 网络异常时回滚开关状态
    row.isShow = oldShowStatus;
    ElMessage.error('网络异常，显示状态修改失败');
    console.error('显示状态修改异常：', e);
  }
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除政策【${row.title}】吗？`, '警告', {type: 'warning'}).then(async () => {
    const res = await deletePolicy(row.id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      // 删除操作仍需刷新列表，因为行数据要移除
      getList();
    }
  });
};

// 批量恢复隐藏
const handleBatchShowHidden = async () => {
  try {
    const ids = await getHiddenPolicyIds().then(res => res.data || []);
    if (ids.length === 0) return ElMessage.info('暂无隐藏政策');
    await ElMessageBox.confirm(`确定恢复 ${ids.length} 条政策吗？`, '提示');
    const res = await batchShowPolicies(ids);
    if (res.code === 200) {
      ElMessage.success('恢复成功');
      // 批量操作涉及多行变更，仍需刷新列表
      getList();
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败');
  }
};

// 提交表单
const submitForm = async () => {
  if (!policyFormRef.value) return;
  await policyFormRef.value.validate(async (valid) => {
    if (valid) {
      const res = form.value.id ? await updatePolicy(form.value) : await addPolicy(form.value);
      if (res.code === 200) {
        ElMessage.success('保存成功');
        open.value = false;
        // 新增/修改操作仍需刷新列表，确保数据最新
        getList();
      } else {
        ElMessage.error(res.message);
      }
    }
  });
};

const viewContentDetail = (row) => {
  if (getContentTextLength(row.content) > 20) {
    currentContent.value = row.content;
    contentDetailVisible.value = true;
  }
};

const getPolicyTypeList = async () => {
  const res = await getPolicyTypeOptions();
  if (res.code === 200) policyTypeOptions.value = res.data || [];
};

onMounted(() => {
  getPolicyTypeList();
  getList();
});
</script>

<style scoped>
.app-container {
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.content-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.content-wrapper {
  padding: 8px;
  border-radius: 4px;
}

.clickable-content {
  cursor: pointer;
  background-color: #ecf5ff;
}

.clickable-content:hover {
  background-color: #d9ecff;
}

.content-detail :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px auto;
}

.table-card {
  margin-top: 10px;
}

:deep(.el-table__header) {
  th {
    background-color: #f8f9fa !important;
  }
}

/* 可选：优化开关切换时的视觉体验 */
:deep(.el-switch) {
  transition: all 0.2s ease;
}
</style>