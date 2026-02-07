// src/views/login/login.js
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
// 移除不存在的 @/api/login 导入
import service from '@/utils/request'

export function useLoginLogic() {
    const router = useRouter()
    const userStore = useUserStore()

    // 表单数据
    const form = ref({
        username: '',
        password: '',
        remember: false
    })

    // 滑块验证状态
    const sliderSuccess = ref(false)
    // 表单ref
    const loginFormRef = ref(null)

    // 表单校验规则
    const rules = ref({
        username: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' }
        ]
    })

    // 滑块验证成功
    const onSliderSuccess = (value) => {
        if (value === 100) {
            sliderSuccess.value = true
            ElMessage.success('验证成功')
        } else {
            sliderSuccess.value = false
            ElMessage.warning('请拖动滑块到最右侧完成验证')
        }
    }

    // 登录核心逻辑（修复接口路径为 /admin/auth/login）
    const handleLogin = async () => {
        try {
            // 1. 表单校验
            if (!loginFormRef.value) {
                ElMessage.warning('表单初始化失败，请刷新页面')
                return
            }
            const valid = await loginFormRef.value.validate()
            if (!valid) return

            // 2. 发送登录请求（使用正确的接口路径）
            const res = await service.post('/admin/auth/login', {
                username: form.value.username,
                password: form.value.password
            })

            // 3. 存储用户信息到store（适配后端的realName字段）
            userStore.setUserInfo({
                token: res.data.token,
                userInfo: {
                    real_name: res.data.realName,
                    username: res.data.username,
                    id: res.data.id
                }
            })

            // 4. 提示+跳转首页
            ElMessage.success('登录成功！')
            router.push('/dashboard')

        } catch (error) {
            // 错误处理
            console.error('登录失败：', error)
            sliderSuccess.value = false
            // 仅在拦截器未提示时补充提示
            if (!error.message) {
                ElMessage.error('登录失败，请检查账号密码或网络')
            }
        }
    }

    // 返回供模板使用的变量/方法
    return {
        form,
        sliderSuccess,
        rules,
        loginFormRef,
        handleLogin,
        onSliderSuccess
    }
}