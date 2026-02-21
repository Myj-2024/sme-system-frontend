// src/api/uploadApi.js
import request from '@/utils/request'

/**
 * 文件上传相关API
 */
export const uploadApi = {
    /**
     * 上传文件（头像专用）
     * @param {FormData} formData - 包含文件的FormData对象
     * @returns {Promise<string>} 返回图片URL
     */
    uploadFile: (formData) => {
        return new Promise((resolve, reject) => {
            request({
                url: '/upload',
                method: 'post',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(response => {
                console.log('Upload Response Context:', response);
                const res = response;
                // 1. 如果是直接返回的URL字符串
                if (typeof res === 'string' && res.startsWith('http')) {
                    return resolve(res);
                }
                // 2. 标准响应格式
                if (res && (res.code == 200 || res.code == 0)) {
                    const imageUrl = res.data || res.message;
                    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
                        resolve(imageUrl);
                    } else {
                        reject(new Error('上传成功但未获取到有效URL'));
                    }
                } else {
                    reject(new Error(res.message || '上传接口业务异常'));
                }
            }).catch(error => {
                console.error('Upload Request Error:', error);
                reject(new Error(error.message || '网络请求失败'));
            });
        });
    }
}

export default uploadApi