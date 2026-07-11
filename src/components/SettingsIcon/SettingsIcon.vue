<template>
  <text class="settings-icon" :class="{ 'settings-icon--light': variant === 'light' }">⚙</text>
</template>

<script setup lang="ts">
interface Props {
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
