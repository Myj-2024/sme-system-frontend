import request from '@/utils/request'

/**
 * 用户管理相关API
 */
export const userApi = {
    /**
     * 分页查询用户列表
     * @param {Object} params - 查询参数
     */
    getUserPage: (params) => {
        return request({
            url: '/admin/user/page',
            method: 'get',
            params
        })
    },
    /**
     * 获取所有用户列表
     */
    getAllUsers: () => {
        return request({
            url: '/admin/user',
            method: 'get'
        })
    },
    /**
     * 根据ID查询用户
     */
    getUserById: (id) => {
        return request({
            url: `/admin/user/${id}`,
            method: 'get'
        })
    },
    /**
     * 获取当前登录用户信息
     */
    getCurrentUser: () => {
        return request({
            url: '/admin/user/info',
            method: 'get'
        })
    },
    /**
     * 新增用户
     */
    addUser: (data) => {
        return request({
            url: '/admin/user',
            method: 'post',
            data
        })
    },
    /**
     * 编辑用户（通用接口）
     */
    updateUser: (id, data) => {
        return request({
            url: `/admin/user/${id}`,
            method: 'put',
            data
        })
    },
    /**
     * 删除用户
     */
    deleteUser: (id) => {
        return request({
            url: `/admin/user/${id}`,
            method: 'delete'
        })
    },
    /**
     * 修改用户状态
     */
    updateUserStatus: (status, id) => {
        return request({
            url: `/admin/user/status/${status}`,
            method: 'post',
            params: {id: id}
        })
    },
    /**
     * 获取用户拥有的角色ID（一对一）
     * @param {number} userId
     */
    getUserRoleId: (userId) => {
        return request({
            url: `/admin/user/${userId}`, // 直接查询用户信息获取roleId
            method: 'get'
        })
    },
    /**
     * 为用户分配角色（一对一）
     * @param {number} userId
     * @param {number} roleId
     */
    assignRole: (userId, roleId) => {
        return request({
            url: `/admin/user/${userId}/role`,
            method: 'put',
            data: {roleId: roleId}
        })
    },
    /**
     * 重置用户密码
     * @param {number} userId
     */
    resetPassword: (userId) => {
        return request({
            url: `/admin/user/resetPwd/${userId}`,
            method: 'post'
        })
    },
    /**
     * 修改用户密码（专门的密码修改接口）
     * @param {number} userId - 用户ID
     * @param {string} password - 新密码
     */
    updateUserPassword: (userId, password) => {
        return request({
            url: `/admin/user/${userId}/password`,
            method: 'put',
            data: { password: password }
        })
    },
    /**
     * 新增：修改个人资料（仅更新姓名、手机号、头像）
     * @param {number} userId - 用户ID
     * @param {Object} profile - 个人资料对象（realName/phone/avatar）
     */
    updateUserProfile: (userId, profile) => {
        return request({
            url: `/admin/user/${userId}/profile`,
            method: 'put',
            data: profile
        })
    }
}

export default userApi