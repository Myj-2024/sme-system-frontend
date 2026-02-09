import request from '@/utils/request'

// 查询字典列表（分页查询）
export function listDict(query) {
    return request({
        url: '/admin/dict/list',
        method: 'get',
        params: query
    })
}

// 查询字典详细
export function getDict(id) {
    return request({
        url: '/admin/dict/' + id,
        method: 'get'
    })
}

// 新增字典
export function addDict(data) {
    return request({
        url: '/admin/dict',
        method: 'post',
        data: data
    })
}

// 修改字典
export function updateDict(data) {
    return request({
        url: '/admin/dict',
        method: 'put',
        data: data
    })
}

// 删除字典
export function delDict(ids) {
    return request({
        url: '/admin/dict/' + ids,
        method: 'delete'
    })
}

// 修改字典状态
export function changeDictStatus(id, status) {
    return request({
        url: '/admin/dict/' + status,
        method: 'put',
        params: { id } // 这会将 id 挂在 URL 参数后：?id=xxx
    })
}

// 获取全部字典（下拉选择）
export function optionSelect() {
    return request({
        url: '/admin/dict/optionSelect',
        method: 'get'
    })
}