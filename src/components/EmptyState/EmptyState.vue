<template>
  <view class="empty-state">
    <text class="empty-state__title">{{ title }}</text>
    <text v-if="description" class="empty-state__description">{{ description }}</text>
  </view>
</template>

<script setup lang="ts">
interface Props {
  title: string
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
