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

// 新增：修改企业展示状态（is_show）- 修复路径参数传递问题
export function updateEnterpriseIsShow(id, isShow) {
    return request({
        // 关键修改：将isShow拼接到URL路径中，作为PathVariable传递
        url: `/admin/enterprise/${id}/show/${isShow}`,
        method: 'put'
        // 移除params参数，因为isShow已作为路径参数传递
    })
}

/**
 * 获取已显示的企业列表
 */
export function getShowEnterpriseList() {
    return request({
        url: '/admin/enterprise/show/list',
        method: 'get'
    })
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
            headers: {'Content-Type': 'multipart/form-data'}
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