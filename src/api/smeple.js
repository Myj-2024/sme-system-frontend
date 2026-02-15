/**
 * 包抓联管理 + 问题办理 统一API
 * 模块1：包抓联基础管理（原smePle.js）
 * 模块2：包抓联问题办理（原handle.js）
 * 核心规则：新增问题即受理，默认状态为HANDLING（受理中）
 */
import request from '@/utils/request'

// ======================== 模块1：包抓联基础管理 API ========================
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
        url: '/admin/smeple',
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

/**
 * 检查企业是否被包抓联引用
 * @param {number} enterpriseId - 企业ID
 * @returns {Promise}
 */
export function checkEnterpriseBind(enterpriseId) {
    return request({
        url: `/admin/smeple/check/enterprise/${enterpriseId}`,
        method: 'get'
    })
}

/**
 * 检查部门是否被包抓联引用
 * @param {number} deptId - 部门ID
 * @returns {Promise}
 */
export function checkDeptBind(deptId) {
    return request({
        url: `/admin/smeple/check/dept/${deptId}`,
        method: 'get'
    })
}

// ======================== 模块2：包抓联问题办理 API（原handle.js） ========================
/**
 * 分页查询问题办理列表
 * @param {Object} params - 查询参数（包含分页+筛选条件）
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
 * 根据企业ID查询包抓联配置（核心：自动填充用）
 * @param {number} enterpriseId - 企业ID
 * @returns {Promise}
 */
export function getSmeLpeByEnterpriseId(enterpriseId) {
    return request({
        url: `/admin/smePackageContact/lpe/${enterpriseId}`,
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
 * @param {string} [completeTime] - 办结时间
 * @param {string} [unableReason] - 无法办理说明
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

/**
 * 新增包抓联问题
 * @param {Object} data - 包抓联问题数据
 * @returns {Promise}
 */
export function addPackageContact(data) {
    return request({
        url: '/admin/smePackageContact/add',
        method: 'post',
        data
    })
}

/**
 * 上传文件到MinIO
 * @param {FormData} formData - 包含file的表单数据
 * @returns {Promise}
 */
export function uploadFile(formData) {
    return request({
        url: '/upload', // 替换为你实际的上传接口地址
        method: 'post',
        data: formData,
        // 关键：上传文件时需要设置Content-Type为multipart/form-data（让浏览器自动处理）
        headers: {
            'Content-Type': undefined
        },
        // 禁止转换FormData（axios默认会转换，导致上传失败）
        transformRequest: [data => data]
    })
}

/**
 * 受理问题（插入受理记录+更新状态）
 * @param {number} packageId - 问题ID
 * @param {Object} data - 受理数据（调查情况、附件等）
 * @returns {Promise}
 */
export function acceptProblem(packageId, data) {
    return request({
        url: `/admin/smePackageContact/accept/${packageId}`,
        method: 'post',
        data
    })
}

/**
 * 办结问题（插入办结记录+更新状态）
 * @param {number} packageId - 问题ID
 * @param {Object} data - 办结数据（办结说明、附件等）
 * @returns {Promise}
 */
export function completeProblem(packageId, data) {
    return request({
        url: `/admin/smePackageContact/complete/${packageId}`,
        method: 'post',
        data
    })
}

/**
 * 标记无法办结（插入记录+更新状态）
 * @param {number} packageId - 问题ID
 * @param {Object} data - 无法办结数据（原因、附件等）
 * @returns {Promise}
 */
export function unableProblem(packageId, data) {
    return request({
        url: `/admin/smePackageContact/unable/${packageId}`,
        method: 'post',
        data
    })
}

/**
 * 重新办理（暂无法办结→办理中）
 * @param {number} id - 包抓联主表ID
 * @returns {Promise}
 */
export function reopenProcess(id) {
    return request({
        url: `/admin/smePackageContact/status/${id}`,
        method: 'put',
        data: {
            processStatus: 'PROCESSING',
            completeTime: '',
            unableReason: ''
        }
    })
}