import request from '@/utils/request'

/**
 * 权限管理相关API (对应后端 PermissionController)
 */
export const permissionApi = {
    /**
     * 获取所有权限树 (用于权限管理页面的树形展示/分配)
     */
    listPermission: () => {
        return request({
            url: '/admin/permission/tree',
            method: 'get'
        })
    },

    /**
     * 新增权限
     */
    addPermission: (data) => {
        return request({
            url: '/admin/permission',
            method: 'post',
            data
        })
    },

    /**
     * 修改权限
     */
    updatePermission: (data) => {
        return request({
            url: `/admin/permission/${data.id}`,
            method: 'put',
            data
        })
    },

    /**
     * 删除权限
     */
    deletePermission: (id) => {
        return request({
            url: `/admin/permission/${id}`,
            method: 'delete'
        })
    }
}

// 导出默认对象
export default permissionApi