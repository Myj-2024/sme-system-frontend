import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore.js'
import service from '@/utils/request.js'

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

    const loginFailedTick = ref(0)

    // 滑块验证成功
    const onSliderSuccess = (value) => {
        if (value === 100) {
            sliderSuccess.value = true
            ElMessage.success('验证成功')
        } else {
            sliderSuccess.value = false
            // ElMessage.warning('请拖动滑块到最右侧完成验证')
        }
    }

    /**
     * 登录核心逻辑
     */
    const handleLogin = async () => {
        try {
            // 1. 表单校验
            if (!loginFormRef.value) {
                ElMessage.warning('表单初始化失败，请刷新页面')
                return
            }
            const valid = await loginFormRef.value.validate()
            if (!valid) return

            // 新增：校验滑块
            if (!sliderSuccess.value) {
                ElMessage.warning('请先完成安全验证')
                return
            }

            // 2. 发送登录请求
            const res = await service.post('/admin/auth/login', {
                username: form.value.username,
                password: form.value.password
            })

            // 3. 存储 Token
            userStore.setToken(res.data.token)

            // 4. 拉取用户信息和菜单
            await userStore.fetchUserInfo()

            // 5. 跳转逻辑修正：必须匹配 router/index.js 中的父路径 /admin
            ElMessage.success('登录成功！')
            router.push('/admin/dashboard')

        } catch (error) {
            console.error('登录失败：', error)
            sliderSuccess.value = false
            loginFailedTick.value++
        }
    }

    return {
        form,
        sliderSuccess,
        rules,
        loginFormRef,
        handleLogin,
        onSliderSuccess,
        loginFailedTick
    }
}