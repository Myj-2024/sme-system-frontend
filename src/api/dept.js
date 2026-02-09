import request from '@/utils/request'

// 列表查询
export function listDept() {
    return request({ url: '/admin/dept/list', method: 'get' })
}

// 新增
export function addDept(data) {
    return request({ url: '/admin/dept', method: 'post', data })
}

// 修改
export function updateDept(data) {
    return request({ url: '/admin/dept', method: 'put', data })
}

// 删除 (匹配 @DeleteMapping("/{id}"))
export function deleteDept(id) {
    return request({ url: `/admin/dept/${id}`, method: 'delete' })
}

// 修改状态 (匹配 @PutMapping("/{id}/status"))
export function changeDeptStatus(id, status) {
    return request({
        url: `/admin/dept/${id}/status`, // 注意这里的顺序
        method: 'put',
        params: { status }
    })
}