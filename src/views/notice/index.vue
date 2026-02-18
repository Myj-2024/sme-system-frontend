<template>
  <div class="policy-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span>首页 / 通知管理 / 通知发布列表</span>
    </div>

    <!-- 查询区域 -->
    <div class="search-form">
      <el-form :model="queryParams" inline>
        <el-form-item label="通知标题">
          <el-input
              v-model="queryParams.title"
              placeholder="请输入通知标题"
              clearable
              size="small"
          />
        </el-form-item>

        <el-form-item label="通知类型">
          <el-select
              v-model="queryParams.noticeType"
              placeholder="请选择通知类型"
              clearable
              size="small"
              style="width: 120px"
          >
            <!-- 动态渲染通知类型字典项 -->
            <el-option
                v-for="item in noticeTypeOptions"
                :key="item.itemCode"
                :label="item.itemName"
                :value="item.itemCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="发布人姓名">
          <el-input
              v-model="queryParams.publisherName"
              placeholder="请输入发布人姓名"
              clearable
              size="small"
          />
        </el-form-item>

        <el-form-item label="通知内容">
          <el-input
              v-model="queryParams.content"
              placeholder="请输入通知内容关键词"
              clearable
              size="small"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="small" @click="loadNoticeList">
            <i class="el-icon-search"></i> 查询
          </el-button>
          <el-button size="small" @click="resetQuery">
            <i class="el-icon-refresh-left"></i> 重置
          </el-button>
          <!-- 删除：一键显示已隐藏通知按钮 -->
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <el-table
          :data="noticeList"
          border
          stripe
          style="width: 100%"
          size="small"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <!-- 通知标题列添加点击事件 -->
        <el-table-column prop="title" label="通知标题" min-width="200" align="center">
          <template #default="{ row }">
            <span
                class="clickable-cell"
                @click="goToDetail(row)"
            >
              {{ row.title }}
            </span>
          </template>
        </el-table-column>

        <!-- 修改处：通知类型列增加模板以显示中文 -->
        <el-table-column prop="noticeType" label="通知类型" width="90" align="center">
          <template #default="{ row }">
            {{ formatNoticeType(row.noticeType) }}
          </template>
        </el-table-column>

        <el-table-column prop="publisherName" label="发布人" width="100" align="center" />
        <!-- 通知内容列添加点击事件 -->
        <el-table-column prop="content" label="通知内容" min-width="260" align="center">
          <template #default="{ row }">
            <div
                class="content-cell clickable-cell"
                @click="goToDetail(row)"
            >
              {{ row.content }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="120" align="center">
          <template #default="{ row }">
            {{ formatTime(row.publishTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="120" align="center">
          <template #default="{ row }">
            {{ formatTime(row.updateTime) }}
          </template>
        </el-table-column>
        <!-- 删除：状态列 -->
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <!-- 删除：置顶和显示开关按钮 -->
            <el-button
                link type="primary"
                @click="handleEdit(row)"
                size="small"
            >
              修改
            </el-button>
            <el-button
                link type="danger"
                @click="handleDelete(row)"
                size="small"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <span>共 {{ total }} 条</span>
      <el-select
          v-model="pageSize"
          size="small"
          @change="loadNoticeList"
          style="width: 120px; margin: 0 10px;"
      >
        <el-option label="10条/页" :value="10" />
        <el-option label="20条/页" :value="20" />
        <el-option label="50条/页" :value="50" />
      </el-select>
      <el-pagination
          :current-page.sync="pageNum"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, jumper"
          @current-change="loadNoticeList"
      />
    </div>
  </div>
</template>

<script>
import { getNoticePage, deleteNotice, updateNotice } from '@/api/notice'
// 导入字典项查询接口
import { listDictItemByDictCode } from '@/api/dictItem'

export default {
  name: 'NoticeIndex',
  data() {
    return {
      noticeList: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      queryParams: {
        title: '',
        noticeType: '',
        publisherName: '',
        content: ''
      },
      // 通知类型字典选项列表
      noticeTypeOptions: [],
      // 通知类型映射表（从字典动态生成）
      noticeTypeMap: {}
    }
  },
  mounted() {
    // 先加载字典数据，再加载通知列表
    this.loadNoticeTypeDict().then(() => {
      this.loadNoticeList()
    })
  },
  methods: {
    // 新增：跳转到通知详情页
    goToDetail(row) {
      if (row.id) {
        // 跳转到详情页路由，无需新增路由配置，复用已有路由
        this.$router.push(`/notice/detail/${row.id}`)
      } else {
        this.$message.warning('通知ID不存在，无法查看详情')
      }
    },

    // 加载通知类型字典数据
    async loadNoticeTypeDict() {
      try {
        // 注意：这里的 'NOTICE_TYPE' 请替换为你实际的通知类型字典编码
        const res = await listDictItemByDictCode('NOTICE_TYPE')
        // 过滤出正常状态的字典项
        this.noticeTypeOptions = res.data?.filter(item => item.status === 1) || []

        // 构建通知类型映射表（用于格式化显示）
        this.noticeTypeMap = {}
        this.noticeTypeOptions.forEach(item => {
          this.noticeTypeMap[item.itemCode] = item.itemName
        })
      } catch (error) {
        console.error('加载通知类型字典失败:', error)
        this.$message.error('加载通知类型字典失败')
      }
    },

    // 格式化通知类型
    formatNoticeType(type) {
      if (!type) return '';
      // 优先使用字典映射，没有则显示原始值
      return this.noticeTypeMap[type] || type;
    },

    // 加载通知列表
    async loadNoticeList() {
      try {
        const res = await getNoticePage({
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          ...this.queryParams
        })
        this.noticeList = res.data.records || res.data.list || []
        this.total = res.data.total || this.noticeList.length
        // 删除：isShow相关的本地状态初始化逻辑
        this.noticeList.forEach(item => {
          if (item.isTop === undefined) item.isTop = false
        })
      } catch (error) {
        console.error('加载通知列表失败:', error)
        this.$message.error('加载通知列表失败')
      }
    },

    // 重置查询
    resetQuery() {
      this.queryParams = {
        title: '',
        noticeType: '',
        publisherName: '',
        content: ''
      }
      this.pageNum = 1
      this.loadNoticeList()
    },

    // 新增通知
    handleAdd() {
      this.$router.push('/notice/add')
    },

    // 删除：一键显示已隐藏通知方法

    // 删除：置顶开关变化方法

    // 删除：显示开关变化方法

    // 修改通知
    handleEdit(row) {
      this.$router.push(`/notice/edit/${row.id}`)
    },

    // 删除通知
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除这条通知吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteNotice(row.id)
        this.$message.success('删除成功')
        this.loadNoticeList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除通知失败:', error)
          this.$message.error('删除通知失败')
        }
      }
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      return time.replace('T', ' ').substring(0, 19)
    }
  }
}
</script>

<style scoped>
.policy-container {
  padding: 16px;
  background: #fff;
  border-radius: 4px;
}

.breadcrumb {
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.search-form {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}

.table-wrapper {
  margin-bottom: 16px;
}

.content-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 新增：可点击单元格样式 */
.clickable-cell {
  color: #409eff; /* 蓝色文字，提示可点击 */
  cursor: pointer; /* 鼠标悬浮显示手型 */
}

.clickable-cell:hover {
  text-decoration: underline; /* 悬浮时下划线，增强交互提示 */
}
</style>