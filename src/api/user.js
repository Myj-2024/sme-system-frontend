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
     * 编辑用户
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
            params: { id: id }
        })
    },

    /**
     * 获取用户拥有的角色ID列表
     * @param {number} userId
     */
    getUserRoleIds: (userId) => {
        return request({
            url: `/admin/user/${userId}/roles`,
            method: 'get'
        })
    },

    /**
     * 为用户分配角色
     * @param {number} userId
     * @param {Array} roleIds
     */
    assignRoles: (userId, roleIds) => {
        return request({
            url: `/admin/user/${userId}/roles`,
            method: 'post',
            data: roleIds
        })
    }
}

export default userApi