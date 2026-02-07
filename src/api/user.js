import request from '@/utils/request'

/**
 * 用户管理相关API
 */
export const userApi = {
    /**
     * 分页查询用户列表
     * @param {Object} params - 查询参数
     * @param {number} params.pageNum - 页码
     * @param {number} params.pageSize - 页大小
     * @param {string} [params.username] - 用户名
     * @param {string} [params.realName] - 真实姓名
     * @param {string} [params.phone] - 手机号
     * @param {number} [params.status] - 状态（0-禁用，1-启用）
     * @returns {Promise}
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
     * @returns {Promise}
     */
    getAllUsers: () => {
        return request({
            url: '/admin/user',
            method: 'get'
        })
    },

    /**
     * 根据ID查询用户
     * @param {number} id - 用户ID
     * @returns {Promise}
     */
    getUserById: (id) => {
        return request({
            url: `/admin/user/${id}`,
            method: 'get'
        })
    },

    /**
     * 获取当前登录用户信息
     * @returns {Promise}
     */
    getCurrentUser: () => {
        return request({
            url: '/admin/user/info',
            method: 'get'
        })
    },

    /**
     * 新增用户
     * @param {Object} data - 用户信息
     * @returns {Promise}
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
     * @param {number} id - 用户ID
     * @param {Object} data - 用户信息
     * @returns {Promise}
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
     * @param {number} id - 用户ID
     * @returns {Promise}
     */
    deleteUser: (id) => {
        return request({
            url: `/admin/user/${id}`,
            method: 'delete'
        })
    },

    /**
     * 修改用户状态
     * @param {number} status - 状态数据 { status: 0/1 }
     * @returns {Promise}
     */
    updateUserStatus: (status, id) => {
        return request({
            url: `/admin/user/${ status }`,
            method: 'post',
            params: { id: id }
        })
    }
}

// 导出默认对象（兼容不同导入方式）
export default userApi