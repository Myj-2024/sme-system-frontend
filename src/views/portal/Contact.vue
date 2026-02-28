<template>
  <main class="login-content">
    <div class="portal-card">
      <div class="contact-layout">
        <div class="info-side">
          <h2>联系我们</h2>
          <p>您可以在地图上点击选择您的精确位置，或参考以下默认信息：</p>
          <ul class="contact-list">
            <li><strong>当前选中：</strong> <span class="highlight-text">{{ selectedAddress || '正在定位中...' }}</span>
            </li>
            <li><strong>经纬度：</strong>
              <el-tag size="small" type="info" v-if="selectedLngLat">{{ selectedLngLat }}</el-tag>
            </li>
            <el-divider/>
            <li><strong>服务地址：</strong> 甘肃省广河县中小微企业服务中心</li>
            <li><strong>咨询电话：</strong> 0930-XXXXXXX</li>
            <li><strong>办公时间：</strong> 周一至周五 9:00 - 18:00</li>
          </ul>
        </div>
        <div class="map-side">
          <div class="map-header-tip">提示：点击地图可重新标注您的精确位置</div>
          <div id="amap-container" class="map-canvas"></div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue'

// --- 关键配置 ---
const amapConfig = {
  key: '44f0ed613243cb8061af74b2a7fbe0ec',
  securityJsCode: '94c5c8e277897fe5b7af231d3581f087',
  // 修改为指定的默认经纬度
  defaultLngLat: [103.550173, 35.485621],
  defaultAddress: '甘肃省广河县中小微企业服务中心'
}

const selectedAddress = ref('')
const selectedLngLat = ref('')
let map = null
let marker = null
let geocoder = null

const initMap = () => {
  // 1. 设置安全密钥
  window._AMapSecurityConfig = {
    securityJsCode: amapConfig.securityJsCode,
  }

  // 2. 动态加载脚本
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapConfig.key}&plugin=AMap.Geocoder,AMap.ToolBar`

  script.onload = () => {
    // 3. 初始化地图
    map = new window.AMap.Map('amap-container', {
      viewMode: '3D',
      zoom: 16, // 稍微调高缩放级别以更清晰看到位置
      center: amapConfig.defaultLngLat // 默认中心点
    })

    geocoder = new window.AMap.Geocoder()

    // 4. 初始打点：直接使用经纬度坐标
    const initPoint = new window.AMap.LngLat(amapConfig.defaultLngLat[0], amapConfig.defaultLngLat[1])

    // 获取初始位置的详细地址描述（逆地理编码）
    geocoder.getAddress(initPoint, (status, result) => {
      const addr = (status === 'complete' && result.regeocode)
          ? result.regeocode.formattedAddress
          : amapConfig.defaultAddress
      updateMarker(initPoint, addr)
    })

    // 5. 绑定地图点击事件：手动设置位置
    map.on('click', (e) => {
      const lnglat = e.lnglat
      geocoder.getAddress(lnglat, (status, result) => {
        if (status === 'complete' && result.regeocode) {
          const address = result.regeocode.formattedAddress
          updateMarker(lnglat, address)
        }
      })
    })

    // 6. 添加工具条
    map.addControl(new window.AMap.ToolBar())
  }
  document.head.appendChild(script)
}

// 更新标记点和数据
const updateMarker = (lnglat, address) => {
  selectedAddress.value = address
  selectedLngLat.value = `${lnglat.lng.toFixed(6)}, ${lnglat.lat.toFixed(6)}`

  if (!marker) {
    marker = new window.AMap.Marker({
      position: lnglat,
      map: map,
      draggable: true
    })

    marker.on('dragend', (e) => {
      geocoder.getAddress(e.lnglat, (status, result) => {
        if (status === 'complete') updateMarker(e.lnglat, result.regeocode.formattedAddress)
      })
    })
  } else {
    marker.setPosition(lnglat)
  }
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) map.destroy()
})
</script>

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
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.contact-layout {
  display: flex;
  gap: 50px;
}

.info-side {
  flex: 1;

  .highlight-text {
    color: #409EFF;
    font-weight: bold;
  }

  .contact-list {
    list-style: none;
    padding: 0;

    li {
      margin: 18px 0;
      font-size: 15px;
      color: #606266;
    }
  }
}

.map-side {
  flex: 1.2;
  display: flex;
  flex-direction: column;

  .map-header-tip {
    font-size: 13px;
    color: #909399;
    margin-bottom: 10px;
    padding-left: 5px;
    border-left: 3px solid #409EFF;
  }

  .map-canvas {
    height: 400px;
    background: #f5f7fa;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e4e7ed;
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
  }
}

:deep(.amap-logo), :deep(.amap-copyright) {
  display: none !important;
}
</style>