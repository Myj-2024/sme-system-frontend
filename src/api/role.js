import request from '@/utils/request'

/**
 * 角色管理相关API
 */
export const roleApi = {
    /**
     * 获取角色分页列表
     * @param {Object} params - 查询参数
     */
    getRolePage: (params) => {
        return request({
            url: '/admin/role/page',
            method: 'get',
            params
        })
    },

    /**
     * 获取所有角色列表
     */
    getAllRoles: () => {
        return request({
            url: '/admin/role',
            method: 'get'
        })
    },

    /**
     * 获取角色详情
     * @param {number} id - 角色ID
     */
    getRoleById: (id) => {
        return request({
            url: `/admin/role/${id}`,
            method: 'get'
        })
    },

    /**
     * 新增角色
     * @param {Object} data
     */
    addRole: (data) => {
        return request({
            url: '/admin/role',
            method: 'post',
            data
        })
    },

    /**
     * 编辑角色
     * @param {number} id
     * @param {Object} data
     */
    updateRole: (id, data) => {
        return request({
            url: `/admin/role/${id}`,
            method: 'put',
            data
        })
    },

    /**
     * 删除角色
     * @param {number} id
     */
    deleteRole: (id) => {
        return request({
            url: `/admin/role/${id}`,
            method: 'delete'
        })
    },

    /**
     * 获取角色权限树
     * @param {number} roleId
     */
    getRolePermissions: (roleId) => {
        return request({
            url: `/admin/role/${roleId}/permissions`,
            method: 'get'
        })
    },

    /**
     * 更新角色权限
     * @param {number} roleId
     * @param {Array} permissions
     */
    updateRolePermissions: (roleId, permissions) => {
        return request({
            url: `/admin/role/${roleId}/permissions`,
            method: 'post',
            data: permissions
        })
    }
}

export default roleApi
