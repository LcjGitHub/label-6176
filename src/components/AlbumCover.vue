<script setup lang="ts">
defineProps<{
  title: string
  starred?: boolean
}>()
</script>

<template>
  <div class="album-cover" :title="title">
    <i class="pi pi-compact-disc cover-icon" />
    <span class="cover-label">VINYL</span>
    <i v-if="starred" class="pi pi-star-fill star-badge" />
  </div>
</template>

<style scoped>
.album-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0d0d0d 100%);
  border-radius: 4px;
  border: 1px solid #3a3a3a;
  position: relative;
  overflow: hidden;
}

.album-cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-radial-gradient(
    circle at center,
    transparent 0,
    transparent 8px,
    rgba(255, 255, 255, 0.03) 8px,
    rgba(255, 255, 255, 0.03) 9px
  );
}

.cover-icon {
  font-size: 3rem;
  color: #888;
  z-index: 1;
}

.cover-label {
  margin-top: 0.5rem;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: #666;
  z-index: 1;
}

.star-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 0.85rem;
  color: #f59e0b;
  z-index: 2;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}
</style>
