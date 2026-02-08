import request from '@/utils/request'

// 部门管理相关接口
const deptApi = {
    // 获取所有部门列表
    getDeptList: () => request({
        url: '/admin/dept/list',
        method: 'get'
    }),
    // 分页查询部门
    getDeptPage: (params) => request({
        url: '/admin/dept/page',
        method: 'get',
        params
    }),
    // 新增部门
    insertDept: (data) => request({
        url: '/admin/dept',
        method: 'post',
        data
    })
}

export default deptApi