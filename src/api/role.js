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
            url: '/admin/role/list', // 适配后端接口路径
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
            url: '/admin/role/add',
            method: 'post',
            data
        })
    },

    /**
     * 编辑角色
     * @param {Object} data
     */
    updateRole: ( data) => {
        return request({
            url: `/admin/role/update`,
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
            url: `/admin/role/delete/${id}`,
            method: 'delete'
        })
    },

    /**
     * 获取角色已分配的权限ID列表（适配后端接口）
     * @param {number} roleId
     */
    getRolePermissions: (roleId) => {
        return request({
            url: `/admin/role-permission/permission-ids/${roleId}`, // 适配后端路径
            method: 'get'
        })
    },

    /**
     * 更新角色权限（适配后端接口）
     * @param {number} roleId
     * @param {Array} permissionIds
     */
    updateRolePermissions: (roleId, permissionIds) => {
        return request({
            url: '/admin/role-permission/assign', // 适配后端路径
            method: 'post',
            data: {
                roleId: roleId,
                permissionIds: permissionIds // 适配后端DTO结构
            }
        })
    }
}

/**
 * 权限管理相关API
 */
export const permissionApi = {
    /**
     * 获取所有权限列表（扁平结构）
     */
    listPermission: () => {
        return request({
            url: '/admin/permission/page', // 后端权限分页接口，不传分页参数返回全部
            method: 'post',
            data: {
                pageNum: 1,
                pageSize: 1000 // 一次性获取所有权限
            }
        })
    },

    /**
     * 获取角色可访问的完整权限列表
     * @param {number} roleId
     */
    getPermissionsByRoleId: (roleId) => {
        return request({
            url: `/admin/role-permission/permissions/${roleId}`,
            method: 'get'
        })
    }
}

export default {
    ...roleApi,
    ...permissionApi
}