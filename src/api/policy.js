import request from '@/utils/request'

/**
 * 政策发布-分页查询（带条件）
 * @param {Object} params - 查询参数（对应PolicyPageQueryDTO）
 */
export function pagePolicy(params) {
    return request({
        url: '/admin/policy/page',
        method: 'post',
        data: {
            ...params,
            showHidden: false // 默认不显示已隐藏，如需显示则传true
        }
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

// @/api/policy.js 中的 uploadFile 函数


/**
 * 政策发布-文件上传
 * @param {FormData} formData
 */
export function uploadFile(formData) {
    return new Promise((resolve, reject) => {
        request({
            url: '/upload',
            method: 'post',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(response => {
            // 调试打印：请在浏览器控制台查看这个输出，确认 res 的真实模样
            console.log('Upload Response Context:', response);

            // 1. 兼容性提取：response 可能是原始响应，也可能是被拦截器处理后的结果
            const res = response;

            // 2. 如果 res 直接就是 URL 字符串 (拦截器直接返回了 res.data.data)
            if (typeof res === 'string' && res.startsWith('http')) {
                return resolve(res);
            }

            // 3. 如果 res 是标准的结果对象
            if (res && (res.code == 200 || res.code == 0)) {
                // 优先取 data，data 为空取 message
                const imageUrl = res.data || res.message;
                if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
                    resolve(imageUrl);
                } else {
                    reject(new Error('上传成功但未获取到有效URL'));
                }
            } else {
                // 4. 处理业务错误
                reject(new Error(res.message || '上传接口业务异常'));
            }
        }).catch(error => {
            // 5. 处理网络错误或拦截器抛出的 Promise.reject
            console.error('Upload Request Error:', error);
            reject(new Error(error.message || '网络请求失败'));
        });
    });
}

/**
 * 政策发布-批量显示选中的已隐藏数据（保持不变，已正确传递ID数组）
 */
export function batchShowPolicies(data) {
    return request({
        url: '/admin/policy/batch/show',
        method: 'put',
        data: data // 直接把入参作为请求体（data）传递
    })
}

/**
 * 新增：查询所有已隐藏政策ID
 */
export function getHiddenPolicyIds() {
    return request({
        url: '/admin/policy/hidden/ids',
        method: 'get'
    })
}