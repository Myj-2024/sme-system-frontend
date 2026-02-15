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

    <el-dialog :title="dialogTitle" v-model="open" width="800px" append-to-body>
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
          <div class="editor-container">
            <quill-editor
                ref="quillRef"
                v-model:content="form.content"
                content-type="html"
                :options="editorOption"
                style="height:300px"
                @update:content="handleEditorChange"
                @init="handleQuillInit"
            />
          </div>
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
        <el-form-item label="是否显示">
          <el-radio-group v-model="form.isShow">
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
import {QuillEditor} from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

// 导入 API
import {
  pagePolicy,
  addPolicy,
  updatePolicy,
  deletePolicy,
  changePolicyTopStatus,
  changePolicyShowStatus,
  getPolicyTypeOptions,
  uploadFile, // 必须导入你定义的上传接口
} from '@/api/policy';

// ========== 基础状态 ==========
const loading = ref(false);
const open = ref(false);
const dialogTitle = ref('');
const policyFormRef = ref(null);
const policyTypeOptions = ref([]);
let quillInstance = null;

// ========== 查询参数 ==========
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  title: '',
  policyType: '',
  publisherName: '',
  content: '',
  policyTypeName: '',
});

// ========== 列表数据 ==========
const policyList = ref([]);
const total = ref(0);

// ========== 表单数据 ==========
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

// ========== 详情弹窗 ==========
const contentDetailVisible = ref(false);
const currentContent = ref('');

// ========== 表单校验规则 ==========
const rules = {
  title: [{required: true, message: '政策标题不能为空', trigger: 'blur'}],
  policyType: [{required: true, message: '请选择政策类型', trigger: 'change'}],
  publisherName: [{required: true, message: '发布人姓名不能为空', trigger: 'blur'}],
  content: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (!value || isEditorEmpty(value)) {
          callback(new Error('政策内容不能为空'));
        } else if (value.includes('data:image/')) {
          // 这里是核心：如果提交时还包含 Base64，拦截并提示
          callback(new Error('内容包含未成功上传的本地图片，请尝试重新粘贴或使用工具栏上传'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

// ========== 工具方法 ==========
/**
 * 手动触发校验，确保富文本输入时错误提示消失
 */
const handleEditorChange = () => {
  nextTick(() => {
    if (policyFormRef.value) {
      policyFormRef.value.validateField('content');
    }
  });
};

/**
 * 将HTML转为纯文本
 */
const getPlainTextFromHtml = (html) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText.replace(/\s+/g, '').trim();
};

/**
 * 判断富文本是否为空
 */
const isEditorEmpty = (html) => {
  if (!html || html === '<p><br></p>') return true;
  return !getPlainTextFromHtml(html);
};

/**
 * 获取当前用户完整信息
 */
const getCurrentUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    return {id: 1, name: '系统管理员'};
  }
  const user = JSON.parse(userInfo);
  return {
    id: user.id || user.userId || 1,
    name: user.realName || user.trueName || user.name || user.nickname || user.username || '系统管理员'
  };
};

/**
 * 格式化日期
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return dateStr.substring(0, 19).replace('T', ' ');
};

/**
 * 获取纯文本长度
 */
const getContentTextLength = (htmlContent) => {
  if (!htmlContent) return 0;
  const text = htmlContent.replace(/<[^>]*>/g, '');
  return text.replace(/\s+/g, '').length;
};

/**
 * 政策内容预览（截断）
 */
const getContentPreview = (htmlContent) => {
  if (!htmlContent) return '';
  const text = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
  return text.length > 20 ? `${text.substring(0, 20)}...` : text;
};

// ========== 文件上传逻辑 (对接后端接口) ==========
/**
 * 核心逻辑：直接调用后端 /upload 接口上传原始文件
 */
const uploadToMinIO = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await uploadFile(formData);
    if (res.code === 200) {
      // res.data 是后端返回的 MinIO 访问链接
      return res.data;
    } else {
      throw new Error(res.message || '文件上传失败');
    }
  } catch (error) {
    ElMessage.error(`上传失败：${error.message}`);
    throw error;
  }
};

// ========== 富文本编辑器配置 ==========
const editorOption = {
  theme: 'snow',
  placeholder: '请输入政策内容...',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{header: 1}, {header: 2}],
      [{list: 'ordered'}, {list: 'bullet'}],
      [{script: 'sub'}, {script: 'super'}],
      [{indent: '-1'}, {indent: '+1'}],
      [{direction: 'rtl'}],
      [{size: ['small', false, 'large', 'huge']}],
      [{header: [1, 2, 3, 4, 5, 6, false]}],
      [{color: []}, {background: []}],
      [{font: []}],
      [{align: []}],
      ['clean'],
      ['link', 'image', 'video'],
    ],
  },
};

/**
 * 核心函数：编辑器初始化
 * 包含了：工具栏点击拦截、粘贴拦截、拖拽拦截
 */
const handleQuillInit = (editor) => {
  quillInstance = editor;
  const toolbar = editor.getModule('toolbar');

  // 1. 拦截工具栏【图片】按钮
  toolbar.addHandler('image', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        ElMessage.info('正在上传图片...');
        const url = await uploadToMinIO(file);
        const range = editor.getSelection() || {index: editor.getLength()};
        editor.insertEmbed(range.index, 'image', url);
        editor.setSelection(range.index + 1);
        ElMessage.success('图片上传成功');
      } catch (err) {
        console.error('图片上传异常', err);
      }
    };
    input.click();
  });

  // 2. 拦截工具栏【视频】按钮
  toolbar.addHandler('video', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        ElMessage.info('正在上传视频...');
        const url = await uploadToMinIO(file);
        const range = editor.getSelection() || {index: editor.getLength()};
        editor.insertEmbed(range.index, 'video', url);
        editor.setSelection(range.index + 1);
        ElMessage.success('视频上传成功');
      } catch (err) {
        console.error('视频上传异常', err);
      }
    };
    input.click();
  });

  // 3. 拦截【粘贴】行为 (解决 Base64 的根源)
  editor.root.addEventListener('paste', async (evt) => {
    const clipboardData = evt.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        // 关键：阻止浏览器默认的 Base64 插入行为
        evt.preventDefault();
        const file = items[i].getAsFile();
        try {
          ElMessage.info('正在处理粘贴的图片...');
          const url = await uploadToMinIO(file);
          const range = editor.getSelection() || {index: editor.getLength()};
          editor.insertEmbed(range.index, 'image', url);
          editor.setSelection(range.index + 1);
          ElMessage.success('图片已自动上传至服务器');
        } catch (err) {
          console.error('粘贴上传失败', err);
        }
      }
    }
  }, false);

  // 4. 拦截【拖拽】行为
  editor.root.addEventListener('drop', async (evt) => {
    const files = evt.dataTransfer.files;
    if (files.length > 0) {
      evt.preventDefault();
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          try {
            const url = await uploadToMinIO(file);
            const range = editor.getSelection() || {index: editor.getLength()};
            editor.insertEmbed(range.index, 'image', url);
          } catch (err) {
            console.error('拖拽上传失败', err);
          }
        }
      }
    }
  }, false);

  // 链接处理器（保持原样）
  toolbar.addHandler('link', () => {
    const range = editor.getSelection();
    if (!range || range.length === 0) {
      ElMessage.warning('请先选中要添加链接的文本');
      return;
    }
    const url = prompt('请输入链接地址（以http/https开头）：');
    if (!url) return;
    const reg = /^(http|https):\/\/.+/;
    if (!reg.test(url)) {
      ElMessage.error('链接格式错误，请输入以http/https开头的地址');
      return;
    }
    editor.format('link', url);
  });
};


// ========== 业务逻辑 ==========
/**
 * 获取政策列表
 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await pagePolicy(queryParams.value);
    if (res.code === 200) {
      policyList.value = res.data.records || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.message || '查询政策列表失败');
    }
  } catch (error) {
    ElMessage.error(`查询失败：${error.message}`);
  } finally {
    loading.value = false;
  }
};

/**
 * 重置查询条件
 */
const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    title: '',
    policyType: '',
    publisherName: '',
    content: '',
    policyTypeName: '',
  };
  getList();
};

/**
 * 分页处理
 */
const handleSizeChange = (val) => {
  queryParams.value.pageSize = val;
  getList();
};
const handleCurrentChange = (val) => {
  queryParams.value.pageNum = val;
  getList();
};

/**
 * 新增政策
 */
const handleAdd = () => {
  const userInfo = getCurrentUserInfo();
  form.value = {
    id: '',
    title: '',
    policyType: '',
    publisherId: userInfo.id,
    publisherName: userInfo.name,
    content: '',
    publishTime: '',
    isTop: 0,
    isShow: 1,
  };
  dialogTitle.value = '新增政策';
  open.value = true;
  nextTick(() => {
    if (policyFormRef.value) policyFormRef.value.clearValidate();
  });
};

/**
 * 修改政策
 */
const handleUpdate = (row) => {
  const userInfo = getCurrentUserInfo();
  form.value = {
    id: row.id,
    title: row.title,
    policyType: row.policyType,
    publisherId: row.publisherId || userInfo.id,
    publisherName: row.publisherName || userInfo.name,
    content: row.content,
    publishTime: row.publishTime ? formatDate(row.publishTime) : '',
    isTop: row.isTop,
    isShow: row.isShow,
  };
  dialogTitle.value = '修改政策';
  open.value = true;
};

/**
 * 修改置顶状态
 */
const handleTopChange = async (row) => {
  try {
    const res = await changePolicyTopStatus(row.id, row.isTop);
    if (res.code === 200) {
      ElMessage.success(row.isTop ? '置顶成功' : '取消置顶成功');
    } else {
      ElMessage.error(res.message || '操作失败');
      row.isTop = row.isTop === 1 ? 0 : 1;
    }
  } catch (error) {
    ElMessage.error('修改失败');
    row.isTop = row.isTop === 1 ? 0 : 1;
  }
};

/**
 * 修改显示状态
 */
const handleShowChange = async (row) => {
  try {
    const res = await changePolicyShowStatus(row.id, row.isShow);
    if (res.code === 200) {
      ElMessage.success(row.isShow ? '显示成功' : '隐藏成功');
    } else {
      ElMessage.error(res.message || '操作失败');
      row.isShow = row.isShow === 1 ? 0 : 1;
    }
  } catch (error) {
    ElMessage.error('修改失败');
    row.isShow = row.isShow === 1 ? 0 : 1;
  }
};

/**
 * 删除政策
 */
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除政策【${row.title}】？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const res = await deletePolicy(row.id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      getList();
    }
  });
};

/**
 * 提交表单 (新增或更新)
 */
const submitForm = async () => {
  if (!policyFormRef.value) return;

  // 提交前最后同步一次编辑器 HTML 到 form.content
  if (quillInstance) {
    form.value.content = quillInstance.root.innerHTML;
  }

  try {
    await policyFormRef.value.validate();

    // 提交数据
    const submitData = {...form.value};
    const res = submitData.id ? await updatePolicy(submitData) : await addPolicy(submitData);

    if (res.code === 200) {
      ElMessage.success('保存成功');
      open.value = false;
      getList();
    } else {
      ElMessage.error(res.message || '保存失败');
    }
  } catch (error) {
    console.warn('校验不通过', error);
  }
};

/**
 * 查看详情
 */
const viewContentDetail = (row) => {
  if (getContentTextLength(row.content) > 20) {
    currentContent.value = row.content;
    contentDetailVisible.value = true;
  }
};

/**
 * 获取下拉框选项
 */
const getPolicyTypeList = async () => {
  const res = await getPolicyTypeOptions();
  if (res.code === 200) {
    policyTypeOptions.value = res.data || [];
  }
};

onMounted(() => {
  getPolicyTypeList();
  getList();
});
</script>

<style scoped>
/* 列表内容省略 */
.content-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
  font-size: 13px;
  color: #4b5563;
}

/* 编辑器容器样式 */
.editor-container {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.editor-container :deep(.ql-editor) {
  min-height: 300px;
}

.editor-container :deep(.ql-container) {
  font-size: 14px;
}

/* 可点击样式 */
.content-wrapper {
  padding: 5px;
  transition: all 0.2s;
}

.clickable-content {
  cursor: pointer;
  color: #409eff;
}

/* 详情弹窗图片视频自适应 */
.content-detail :deep(img),
.content-detail :deep(video) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px 0;
}
</style>