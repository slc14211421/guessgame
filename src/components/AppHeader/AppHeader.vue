<!--
  页面头部组件
  统一的标题栏布局：左侧标题区 + 右侧操作插槽
-->
<template>
  <view class="app-header">
    <view class="app-header__main">
      <text class="app-title">{{ title }}</text>
      <text v-if="subtitle" class="app-subtitle">{{ subtitle }}</text>
    </view>
    <view v-if="$slots.action" class="app-header__action">
      <slot name="action" />
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  /** 页面主标题 */
  title: string
  /** 页面副标题（可选） */
  subtitle?: string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.app-header__main {
  flex: 1;
  min-width: 0;
}

.app-header__action {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
}
</style>
