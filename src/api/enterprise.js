import request from '@/utils/request'

// 分页查询企业列表
export function pageEnterprise(params) {
    return request({url: '/admin/enterprise/page', method: 'get', params})
}

// 根据ID查询企业详情
export function getEnterpriseById(id) {
    return request({url: `/admin/enterprise/${id}`, method: 'get'})
}

// 新增企业（关键修改：路径从 /admin/enterprise/add 改为 /admin/enterprise）
export function addEnterprise(data) {
    return request({url: '/admin/enterprise', method: 'post', data})
}

// 修改企业
export function updateEnterprise(data) {
    return request({url: '/admin/enterprise/update', method: 'put', data})
}

// 删除企业（路径未变，无需修改）
export function deleteEnterprise(id) {
    return request({url: `/admin/enterprise/${id}`, method: 'delete'})
}

// 修改企业状态
export function changeEnterpriseStatus(id, status) {
    return request({
        url: `/admin/enterprise/${id}/status`,
        method: 'put',
        params: {status}
    })
}