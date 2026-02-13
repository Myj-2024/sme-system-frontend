/**
 * 包抓联管理相关API
 * 注释规范：符合Vue/JS文档注释要求，清晰说明接口用途、参数、返回值
 */
import request from '@/utils/request'

/**
 * 分页查询包抓联列表
 * @param {Object} params - 查询参数（包含分页+筛选条件）
 * @param {number} params.pageNum - 当前页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} [params.leaderName] - 包抓领导姓名（模糊查询）
 * @param {string} [params.enterpriseName] - 企业名称（模糊查询）
 * @param {string} [params.classMonitor] - 专班班长（模糊查询）
 * @param {string} [params.classDeptName] - 专班负责单位名称（模糊查询）
 * @returns {Promise}
 */
export function pageSmePle(params) {
    return request({
        url: '/admin/smeple/page',
        method: 'post',
        data: params
    })
}

/**
 * 根据ID查询包抓联详情
 * @param {number} id - 包抓联记录ID
 * @returns {Promise}
 */
export function getSmePleById(id) {
    return request({
        url: `/admin/smeple/${id}`,
        method: 'get'
    })
}

/**
 * 新增包抓联记录
 * @param {Object} data - 新增数据
 * @returns {Promise}
 */
export function addSmePle(data) {
    return request({
        url: '/admin/smeple',
        method: 'post',
        data
    })
}

/**
 * 修改包抓联记录
 * @param {Object} data - 修改数据（含ID）
 * @returns {Promise}
 */
export function updateSmePle(data) {
    return request({
        url: '/admin/smeple',   // ← 修改这里
        method: 'put',
        data
    })
}

/**
 * 删除包抓联记录
 * @param {number} id - 包抓联记录ID
 * @returns {Promise}
 */
export function deleteSmePle(id) {
    return request({
        url: `/admin/smeple/${id}`,
        method: 'delete'
    })
}
