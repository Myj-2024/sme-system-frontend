<template>
  <div ref="editorRef" class="tinymce-editor"></div>
</template>

<script setup>
import {ref, watch, onMounted, onUnmounted, nextTick} from 'vue'
import {ElMessage} from 'element-plus'

// 导入上传API
import {uploadFile} from '@/api/policy'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
    required: false
  }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
// 这里保存真正的编辑器实例
let tinymceInstance = null

const loadTinymceScript = () => {
  return new Promise((resolve, reject) => {
    if (window.tinymce) {
      resolve(window.tinymce)
      return
    }
    const script = document.createElement('script')
    script.src = '/tinymce/tinymce.min.js'
    script.async = true
    script.onload = () => resolve(window.tinymce)
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })
}

// 自定义图片上传函数
const customImageUpload = async () => {
  // 核心：使用保存的实例
  if (!tinymceInstance) {
    ElMessage.warning('编辑器尚未就绪');
    return;
  }

  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    try {
      ElMessage.info('正在上传图片...');
      const formData = new FormData();
      formData.append('file', file);

      const imageUrl = await uploadFile(formData);

      // 成功插入
      tinymceInstance.insertContent(`<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%;" />`);
      ElMessage.success('图片上传成功');
    } catch (error) {
      console.error('图片上传失败详情:', error);
      ElMessage.error(`图片上传失败：${error.message}`);
    }
  };

  input.click();
};

// 自定义视频上传函数
const customVideoUpload = async () => {
  if (!tinymceInstance) return;

  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'video/*');

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    try {
      ElMessage.info('正在上传视频...');
      const formData = new FormData();
      formData.append('file', file);

      const videoUrl = await uploadFile(formData);

      tinymceInstance.insertContent(`
        <p>
          <video controls style="max-width: 100%; height: auto;">
            <source src="${videoUrl}" type="${file.type}">
            您的浏览器不支持视频播放
          </video>
        </p>
      `);
      ElMessage.success('视频上传成功');
    } catch (error) {
      console.error('视频上传失败详情:', error);
      ElMessage.error(`视频上传失败：${error.message}`);
    }
  };

  input.click();
};

const initEditor = async () => {
  try {
    await loadTinymceScript()

    // 销毁旧实例
    if (window.tinymce.activeEditor) {
      window.tinymce.activeEditor.destroy();
    }

    window.tinymce.init({
      target: editorRef.value,
      language: 'zh-Hans',
      language_url: '/tinymce/langs/zh_CN.js',
      skin_url: '/tinymce/skins/ui/oxide',
      content_css: '/tinymce/skins/content/default/content.min.css',
      menubar: false,
      toolbar_mode: 'sliding',
      autoresize_bottom_margin: 50,
      max_height: 500,
      min_height: 300,
      height: 300,
      plugins: 'advlist anchor autolink autoresize charmap code codesample directionality fullscreen image insertdatetime link lists media nonbreaking pagebreak preview quickbars searchreplace table visualblocks visualchars wordcount',
      toolbar: 'undo redo | fontselect fontsizeselect | forecolor backcolor | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist | link customImage customVideo table | code preview fullscreen',
      content_style: 'p {margin: 5px 0; font-size: 14px; line-height: 1.6;} img {max-width: 100%; height: auto;}',
      fontsize_formats: '12px 14px 16px 18px 24px 36px 48px',
      font_formats: '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;宋体=SimSun,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif',
      branding: false,
      elementpath: false,
      resize: false,
      statusbar: true,
      paste_data_images: true,

      // 粘贴上传逻辑保持不变
      images_upload_handler: async (blobInfo, progress) => {
        try {
          const formData = new FormData();
          formData.append('file', blobInfo.blob(), blobInfo.filename());
          const imageUrl = await uploadFile(formData);
          return imageUrl;
        } catch (error) {
          ElMessage.error(`图片上传失败：${error.message}`);
          throw error;
        }
      },

      setup: (editor) => {
        // 关键修复：当编辑器初始化完成时，获取真正的实例
        editor.on('init', () => {
          tinymceInstance = editor;
          editor.setContent(props.modelValue || '');
        });

        editor.on('Change Input Undo Redo', () => {
          emit('update:modelValue', editor.getContent());
        });

        editor.ui.registry.addButton('customImage', {
          icon: 'image',
          tooltip: '上传图片',
          onAction: () => customImageUpload()
        });

        editor.ui.registry.addButton('customVideo', {
          icon: 'video',
          tooltip: '上传视频',
          onAction: () => customVideoUpload()
        });
      }
    })
  } catch (error) {
    console.error('TinyMCE 初始化失败:', error)
    ElMessage.error('富文本编辑器加载失败')
  }
}

watch(
    () => props.modelValue,
    (newVal) => {
      if (tinymceInstance && newVal !== tinymceInstance.getContent()) {
        tinymceInstance.setContent(newVal || '')
      }
    }
)

onMounted(() => {
  nextTick(() => {
    initEditor()
  })
})

onUnmounted(() => {
  if (tinymceInstance) {
    tinymceInstance.destroy()
    tinymceInstance = null
  }
})
</script>

<style scoped>
.tinymce-editor {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  min-height: 300px;
}

:deep(.tox-tinymce-aux) {
  z-index: 9999 !important;
}
</style>