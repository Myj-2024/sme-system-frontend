import request from '@/utils/request'

// 字典管理相关接口
const dictApi = {
    // 分页查询字典
    getDictPage: (params) => request({
        url: '/admin/dict/page',
        method: 'get',
        params
    }),
    // 根据ID查询字典详情
    getDictById: (id) => request({
        url: `/admin/dict/${id}`,
        method: 'get'
    }),
    // 新增字典
    addDict: (data) => request({
        url: '/admin/dict',
        method: 'post',
        data
    }),
    // 编辑字典
    updateDict: (data) => request({
        url: '/admin/dict',
        method: 'put',
        data
    }),
    // 删除字典
    deleteDict: (id) => request({
        url: `/admin/dict/${id}`,
        method: 'delete'
    }),
    // 更新字典状态
    updateDictStatus: (id, status) => request({
        url: `/admin/dict/status/${id}`,
        method: 'put',
        data: { status }
    }),
    // 根据字典编码查询字典项
    getDictItemByCode: (dictCode) => request({
        url: `/admin/dict/items/${dictCode}`,
        method: 'get'
    })
}

export default dictApi