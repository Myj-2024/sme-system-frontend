import request from '@/utils/request'

// 用户登录
export const login = (data) => {
    return request({
        url: '/admin/auth/login',
        method: 'post',
        data
    })
}

// 刷新Token
export const refreshToken = (token) => {
    return request({
        url: '/admin/auth/refresh',
        method: 'post',
        headers: {
            Authorization: token
        }
    })
}