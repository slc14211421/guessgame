<!--
  设置图标组件
  支持深色/浅色两种变体
-->
<template>
  <text class="settings-icon" :class="{ 'settings-icon--light': variant === 'light' }">⚙</text>
</template>

<script setup lang="ts">
interface Props {
  /** 图标颜色变体：dark 深色（默认）/ light 浅色 */
  variant?: 'dark' | 'light'
}

withDefaults(defineProps<Props>(), {
  variant: 'dark'
})
</script>

<style scoped lang="scss">
.settings-icon {
  display: block;
  color: #172026;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1;
}

.settings-icon--light {
  color: #ffffff;
}
</style>
