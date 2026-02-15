import request from '@/utils/request'

/**
 * 政策发布-分页查询（带条件）
 * @param {Object} params - 查询参数（对应PolicyPageQueryDTO）
 */
export function pagePolicy(params) {
    return request({
        url: '/admin/policy/page',
        method: 'post', // 匹配后端@PostMapping("/page")
        data: params    // POST请求用data传递参数
    })
}

/**
 * 政策发布-新增
 * @param {Object} data - 政策发布表单数据
 */
export function addPolicy(data) {
    return request({
        url: '/admin/policy/add',
        method: 'post',
        data: data
    })
}

/**
 * 政策发布-修改
 * @param {Object} data - 政策发布表单数据
 */
export function updatePolicy(data) {
    return request({
        url: '/admin/policy',
        method: 'put',
        data: data
    })
}

/**
 * 政策发布-删除
 * @param {number|string} id - 政策ID
 */
export function deletePolicy(id) {
    return request({
        url: `/admin/policy/${id}`,
        method: 'delete'
    })
}

/**
 * 政策发布-修改是否置顶状态
 * @param {number|string} id - 政策ID
 * @param {number} isTop - 是否置顶（0-否/1-是）
 */
export function changePolicyTopStatus(id, isTop) {
    return request({
        url: `/admin/policy/${id}/top`,
        method: 'put',
        params: { isTop }
    })
}

/**
 * 政策发布-修改是否显示状态
 * @param {number|string} id - 政策ID
 * @param {number} isShow - 是否显示（0-隐藏/1-显示）
 */
export function changePolicyShowStatus(id, isShow) {
    return request({
        url: `/admin/policy/${id}/show`,
        method: 'put',
        params: { isShow }
    })
}

/**
 * 获取政策类型字典项（从字典表获取policy_type编码的字典项）
 */
export function getPolicyTypeOptions() {
    return request({
        url: '/admin/dict/item/type/policy_type',
        method: 'get'
    })
}

/**
 * 文件上传到MinIO
 * @param {FormData} formData - 包含file和fileType的表单数据
 */
export function uploadFile(formData) {
    return request({
        url: '/upload', // 你的upload接口地址
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data' // 必须指定表单格式
        },
        // 可选：上传进度回调
        onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(`上传进度：${percent}%`)
        }
    })
}