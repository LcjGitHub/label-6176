<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--p-font-family);
  background: var(--p-surface-50);
  color: var(--p-text-color);
  -webkit-font-smoothing: antialiased;
}
</style>
