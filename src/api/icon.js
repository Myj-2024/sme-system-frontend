import request from '@/utils/request'

/**
 * 图标管理相关API
 */
export const iconApi = {
    /**
     * 获取图标分页列表
     * @param {Object} params - 查询参数（包含分页和查询条件）
     */
    getIconPage: (params) => {
        return request({
            url: '/admin/icon/page',
            method: 'get',
            params
        })
    },

    /**
     * 根据ID获取图标详情
     * @param {number} id - 图标ID
     */
    getIconById: (id) => {
        return request({
            url: `/admin/icon/${id}`,
            method: 'get'
        })
    },

    /**
     * 新增图标
     * @param {Object} data - 图标信息
     */
    addIcon: (data) => {
        return request({
            url: '/admin/icon/add',
            method: 'post',
            data
        })
    },

    /**
     * 修改图标
     * @param {Object} data - 图标信息
     */
    updateIcon: (data) => {
        return request({
            url: '/admin/icon/update',
            method: 'put',
            data
        })
    },

    /**
     * 删除图标
     * @param {number} id - 图标ID
     */
    deleteIcon: (id) => {
        return request({
            url: `/admin/icon/delete/${id}`,
            method: 'delete'
        })
    },
}

/**
 * 图标上传
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
export default {
    ...iconApi
}