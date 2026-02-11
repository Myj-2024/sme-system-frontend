// src/api/dictItem.js
import request from '@/utils/request'

/**
 * 根据字典编码获取字典项列表
 * @param {string} dictCode 字典编码
 */
export function listDictItemByDictCode(dictCode) {
    return request({
        url: `/admin/dict/item/type/${dictCode}`,
        method: 'get'
    })
}

/**
 * 获取单个字典项（根据编码，可根据需要扩展）
 * @param {string} dictCode
 */
export function getItemByCode(dictCode) {
    return request({
        url: `/admin/dict/item/type/${dictCode}`,
        method: 'get'
    })
}

/**
 * 新增字典项
 * @param {Object} data
 */
export function addDictItem(data) {
    return request({
        url: '/admin/dict/item',
        method: 'post',
        data
    })
}

/**
 * 修改字典项
 * @param {Object} data
 */
export function updateDictItem(data) {
    return request({
        url: '/admin/dict/item',
        method: 'put',
        data
    })
}

/**
 * 删除字典项
 * @param {number|string} id
 */
export function delDictItem(id) {
    return request({
        url: `/admin/dict/item/${id}`,
        method: 'delete'
    })
}

// dictItem.js 中新增
/**
 * 字典项分页查询
 * @param {Object} params - 查询参数
 */
export const selectItemList = (params) => {
    return request({
        url: '/admin/dict/item/list', // 对应后端接口路径
        method: 'get',
        params
    })
}
