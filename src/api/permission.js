import request from '@/utils/request'

/**
 * 权限-分页查询（带条件）
 * @param {Object} params - 查询参数（对应PermissionPageQueryDTO）
 */
// 修复：简化参数传递，统一接收分页参数，匹配页面传递格式
export function pagePermission(params) {
    return request({
        url: '/admin/permission/page',
        method: 'post',
        data: params
    })
}

/**
 * 权限-根据ID查询
 * 新增：编辑功能依赖的方法
 */
export function getPermissionById(id) {
    return request({
        url: `/admin/permission/${id}`,
        method: 'get'
    })
}

/**
 * 权限-删除
 * @param {number|string} id - 权限ID
 */
export function deletePermission(id) {
    return request({
        url: `/admin/permission/${id}`,
        method: 'delete'
    })
}

/**
 * 权限-新增
 * @param {Object} data - 权限表单数据
 */
export function addPermission(data) {
    return request({
        url: '/admin/permission/add',
        method: 'post',
        data: data
    })
}

/**
 * 权限-修改
 * @param {Object} data - 权限表单数据
 */
export function updatePermission(data) {
    return request({
        url: '/admin/permission/update',
        method: 'post',
        data: data
    })
}