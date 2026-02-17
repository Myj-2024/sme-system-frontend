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
        url: '/admin/notice/page', // 后端路径：/admin/notice/page ✔️ 无需修改
        method: 'get',
        params // GET请求参数通过params传递 ✔️ 正确
    })
}

/**
 * 2. 根据ID查询详情
 * @param {Number} id 通知ID
 */
export function getNoticeDetail(id) {
    return request({
        url: `/admin/notice/${id}`, // 后端路径：/admin/notice/{id} ✔️ 无需修改
        method: 'get'
    })
}

/**
 * 3. 新增通知（支持全员/指定用户）
 */
export function saveNotice(data) {
    return request({
        url: '/admin/notice/save', // 后端路径：/admin/notice/save ✔️ 无需修改
        method: 'post',
        data // POST请求JSON体通过data传递 ✔️ 正确
    })
}

/**
 * 4. 修改通知
 * @param {Object} data 同新增参数（需包含id）
 */
export function updateNotice(data) {
    return request({
        url: '/admin/notice/update', // 后端路径：/admin/notice/update ✔️ 无需修改
        method: 'post', // 后端用的是post ✔️ 无需修改（注意：RESTful规范建议用put，若需调整可改后端为@PutMapping）
        data
    })
}

/**
 * 5. 删除通知（逻辑删除）
 * @param {Number} id 通知ID
 */
export function deleteNotice(id) {
    return request({
        url: `/admin/notice/delete/${id}`, // 后端路径：/admin/notice/delete/{id} ✔️ 无需修改
        method: 'post', // 后端用的是post ✔️ 无需修改
        // 无参数（路径参数已包含id）
    })
}

/**
 * 6. 获取当前登录用户的未读数量（修正路径：匹配后端 /admin/noticeUser/unreadCount）
 */
export function getUnreadCount() {
    return request({
        url: '/admin/noticeUser/unreadCount', // 必须和后端一致，删除所有 /notice/unread/count 引用
        method: 'get'
    })
}

/**
 * 7. 标记通知已读（路径正确，但需增加登录校验）
 */
export function markNoticeAsRead(noticeId) {
    // 前端提前校验参数
    if (!noticeId || noticeId <= 0) {
        return Promise.reject(new Error('通知ID必须为正整数'));
    }
    return request({
        url: '/admin/noticeUser/read', // 后端正确路径
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
        url: '/admin/notice/my', // 后端路径：/admin/notice/my ✔️ 无需修改
        method: 'get',
        params // GET请求参数通过params传递 ✔️ 正确
    })
}