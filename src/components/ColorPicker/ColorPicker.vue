<template>
  <view class="color-picker">
    <view
      v-for="color in colors"
      :key="color"
      class="color-picker__swatch"
      :class="{ 'color-picker__swatch--selected': color === modelValue }"
      :style="{ backgroundColor: color }"
      @click="handleSelect(color)"
    />
  </view>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  colors: string[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [color: string]
}>()

function handleSelect(color: string) {
  emit('update:modelValue', color)
}
</script>

<style scoped lang="scss">
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.color-picker__swatch {
  width: 64rpx;
  height: 64rpx;
  border: 3rpx solid #dfe5e8;
  border-radius: 12rpx;
}

.color-picker__swatch--selected {
  border-color: #256f6c;
  box-shadow: 0 0 0 6rpx rgba(37, 111, 108, 0.14);
}
</style>
