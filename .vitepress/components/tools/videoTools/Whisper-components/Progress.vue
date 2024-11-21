<template>
    <div class="w-full bg-gray-100 dark:bg-gray-700 text-left rounded-lg overflow-hidden mb-0.5">
      <div
        class="bg-blue-400 whitespace-nowrap px-1 text-sm"
        :style="{ width: `${percentage}%` }"
      >
        {{ text }} ({{ percentage.toFixed(2) }}%
        <span v-if="!isNaN(total)"> of {{ formatBytes(total) }}</span>)
      </div>
    </div>
  </template>
  
<script setup lang="ts">
  
  const props = defineProps({
    text: String,
    percentage: Number,
    total: Number
  });
  
  const formatBytes = (size) => {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (
      +(size / Math.pow(1024, i)).toFixed(2) * 1 +
      ["B", "kB", "MB", "GB", "TB"][i]
    );
  };
  
  const percentage = computed(() => props.percentage ?? 0);
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  