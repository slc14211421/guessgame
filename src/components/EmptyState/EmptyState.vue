<!--
  空状态占位组件
  用于列表无数据时展示提示信息
-->
<template>
  <view class="empty-state">
    <text class="empty-state__title">{{ title }}</text>
    <text v-if="description" class="empty-state__description">{{ description }}</text>
  </view>
</template>

<script setup lang="ts">
interface Props {
  /** 主提示文本 */
  title: string
  /** 辅助描述文本（可选） */
  description?: string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.empty-state {
  box-sizing: border-box;
  padding: 64rpx 32rpx;
  border: 2rpx dashed #cfd8dc;
  border-radius: 14rpx;
  background: #ffffff;
  text-align: center;
}

.empty-state__title {
  display: block;
  color: #172026;
  font-size: 32rpx;
  font-weight: 700;
}

.empty-state__description {
  display: block;
  margin-top: 12rpx;
  color: #6a747c;
  font-size: 26rpx;
  line-height: 1.5;
}
</style>
