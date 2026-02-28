<template>
  <main class="login-content">
    <div class="portal-card">
      <h2>办事指南</h2>
      <el-tabs tab-position="left" style="height: 400px;" class="guide-tabs">
        <el-tab-pane label="企业开办">
          <div class="guide-detail">
            <h3>企业开办“一网通办”流程</h3>
            <el-steps :active="1" direction="vertical">
              <el-step title="在线名称核准" description="通过平台提交企业名称预先核准申请"></el-step>
              <el-step title="资料审核" description="准备营业执照、法人身份证等扫描件"></el-step>
              <el-step title="领取执照" description="前往窗口或邮寄领取纸质执照"></el-step>
            </el-steps>
          </div>
        </el-tab-pane>
        <el-tab-pane label="税务办理">暂无数据</el-tab-pane>
        <el-tab-pane label="融资申请">暂无数据</el-tab-pane>
      </el-tabs>
    </div>
  </main>
</template>

<style scoped lang="scss">
.login-content {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
}

.portal-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 30px;
}

.guide-tabs {
  margin-top: 20px;
}

.guide-detail {
  padding-left: 30px;

  h3 {
    color: #ff6a00;
  }
}
</style>