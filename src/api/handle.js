/**
 * 包抓联问题办理相关API
 * 注释规范：符合Vue/JS文档注释要求，清晰说明接口用途、参数、返回值
 */
import request from '@/utils/request'

/**
 * 分页查询问题办理列表
 * @param {Object} params - 查询参数（包含分页+筛选条件）
 * @param {number} params.pageNum - 当前页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} [params.processStatus] - 流程状态（UNHANDLED/HANDLING/COMPLETED/UNABLE）
 * @param {string} [params.leaderName] - 包抓领导姓名（模糊查询）
 * @param {string} [params.enterpriseName] - 企业名称（模糊查询）
 * @param {string} [params.classMonitor] - 专班班长（模糊查询）
 * @param {string} [params.classDeptName] - 专班负责单位名称（模糊查询）
 * @param {string} [params.problemType] - 问题类型（精准匹配字典编码）
 * @returns {Promise}
 */
export function pagePackageContact(params) {
    return request({
        url: '/admin/smePackageContact/page',
        method: 'post',
        data: params
    })
}

/**
 * 根据ID查询包抓联问题详情
 * @param {number} id - 包抓联问题记录ID
 * @returns {Promise}
 */
export function getPackageContactById(id) {
    return request({
        url: `/admin/smePackageContact/${id}`,
        method: 'get'
    })
}

/**
 * 查询问题办理记录列表
 * @param {number} packageId - 包抓联主表ID
 * @returns {Promise}
 */
export function listHandleRecord(packageId) {
    return request({
        url: `/admin/smePackageContact/handleRecord/list/${packageId}`,
        method: 'get'
    })
}

/**
 * 新增问题办理记录
 * @param {Object} data - 办理记录数据
 * @param {number} data.packageId - 包抓联主表ID
 * @param {string} data.handleLeader - 本次办理领导
 * @param {string} data.handleContent - 本次办理内容
 * @param {string} data.handleType - 办理类型（字典编码）
 * @param {string} [data.attachUrl] - 附件URL
 * @returns {Promise}
 */
export function addHandleRecord(data) {
    return request({
        url: '/admin/smePackageContact/handleRecord',
        method: 'post',
        data
    })
}

/**
 * 修改问题办理记录
 * @param {Object} data - 办理记录数据（含ID）
 * @returns {Promise}
 */
export function updateHandleRecord(data) {
    return request({
        url: '/admin/smePackageContact/handleRecord',
        method: 'put',
        data
    })
}

/**
 * 删除问题办理记录
 * @param {number} id - 办理记录ID
 * @returns {Promise}
 */
export function deleteHandleRecord(id) {
    return request({
        url: `/admin/smePackageContact/handleRecord/${id}`,
        method: 'delete'
    })
}

/**
 * 更新问题办理状态
 * @param {number} id - 包抓联主表ID
 * @param {string} processStatus - 流程状态
 * @param {string} [completeTime] - 办结时间（仅COMPLETED状态需要）
 * @param {string} [unableReason] - 无法办理说明（仅UNABLE状态需要）
 * @returns {Promise}
 */
export function updateProcessStatus(id, processStatus, completeTime, unableReason) {
    return request({
        url: `/admin/smePackageContact/status/${id}`,
        method: 'put',
        data: {
            processStatus,
            completeTime,
            unableReason
        }
    })
}