import request from '@/utils/request'

/**
 * 1. 分页查询通知（管理员视角，查所有通知）
 * @param params
 * {
 *   pageNum,
 *   pageSize,
 *   title,
 *   noticeType,
 *   publisherId,
 *   isTop
 * }
 */
export function getNoticePage(params) {
    return request({
        url: '/admin/notice/page',
        method: 'get',
        params
    })
}

/**
 * 2. 根据ID查询详情
 * @param {Number} id 通知ID
 */
export function getNoticeDetail(id) {
    return request({
        url: `/admin/notice/${id}`,
        method: 'get'
    })
}

/**
 * 3. 新增通知（支持全员/指定用户）
 */
export function saveNotice(data) {
    return request({
        url: '/admin/notice/save',
        method: 'post',
        data
    })
}

/**
 * 4. 修改通知
 * @param {Object} data 同新增参数（需包含id）
 */
export function updateNotice(data) {
    return request({
        url: '/admin/notice/update',
        method: 'post',
        data
    })
}

/**
 * 5. 删除通知（逻辑删除）
 * @param {Number} id 通知ID
 */
export function deleteNotice(id) {
    return request({
        url: `/admin/notice/delete/${id}`,
        method: 'post',
    })
}

/**
 * 6. 获取当前登录用户的未读数量
 */
export function getUnreadCount() {
    return request({
        url: '/admin/noticeUser/unreadCount',
        method: 'get'
    })
}

/**
 * 7. 标记通知已读
 */
export function markNoticeAsRead(noticeId) {
    if (!noticeId || noticeId <= 0) {
        return Promise.reject(new Error('通知ID必须为正整数'));
    }
    return request({
        url: '/admin/noticeUser/read',
        method: 'post',
        params: { noticeId }
    })
}

/**
 * 8. 获取当前登录用户的通知列表（我的通知）
 * @param params { pageNum, pageSize }
 */
export function getMyNoticeList(params) {
    return request({
        url: '/admin/notice/my',
        method: 'get',
        params
    })
}