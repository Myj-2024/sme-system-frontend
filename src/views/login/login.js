// src/views/login/login.js
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
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

    const loginFailedTick = ref(0)

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

    /**
     * 登录核心逻辑
     * 流程：校验 -> 获取Token -> 存Token -> 拉取用户信息(含权限/菜单) -> 跳转
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

            // 2. 发送登录请求
            const res = await service.post('/admin/auth/login', {
                username: form.value.username,
                password: form.value.password
            })

            // 3. 核心修复：适配你 userStore.js 中的方法名
            // 第一步：存储 Token（这会自动写入 sessionStorage）
            userStore.setToken(res.data.token)

            // 第二步：异步拉取完整的用户信息、菜单树、按钮权限标识
            // 这一步非常重要，它会填充 userStore 里的 menus，从而让路由和侧边栏工作
            await userStore.fetchUserInfo()

            // 4. 提示+跳转首页
            ElMessage.success('登录成功！')
            router.push('/dashboard')

        } catch (error) {
            // 错误处理
            console.error('登录失败：', error)
            sliderSuccess.value = false
            loginFailedTick.value++
            // 错误信息通常在拦截器中已经 ElMessage.error 过了，这里仅作打印
        }
    }

    // 返回供模板使用的变量/方法
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