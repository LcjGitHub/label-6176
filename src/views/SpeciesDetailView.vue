<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSightingStore } from '@/stores/sighting'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

const route = useRoute()
const router = useRouter()
const store = useSightingStore()

const speciesId = computed(() => route.params.id as string)
const species = computed(() => store.getSpeciesById(speciesId.value))
const sightings = computed(() => store.getSightingsBySpeciesId(speciesId.value))
const totalCount = computed(() => store.getTotalCountBySpeciesId(speciesId.value))

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="species-detail-page">
    <header class="page-header">
      <Button label="返回" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
    </header>

    <template v-if="species">
      <section class="species-hero">
        <div class="species-image-wrapper">
          <img :src="species.imageUrl" :alt="species.name" class="species-image" />
        </div>
        <div class="species-info">
          <h1 class="species-name">{{ species.name }}</h1>
          <p class="species-scientific-name">{{ species.scientificName }}</p>
          <div class="species-stats">
            <div class="stat-item">
              <span class="stat-number">{{ sightings.length }}</span>
              <span class="stat-label">目击次数</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ totalCount }}</span>
              <span class="stat-label">累计数量</span>
            </div>
          </div>
        </div>
      </section>

      <section class="sightings-section">
        <Card>
          <template #title>
            <h2>历史目击记录</h2>
          </template>
          <template #content>
            <DataTable
              v-if="sightings.length > 0"
              :value="sightings"
              :paginator="sightings.length > 10"
              :rows="10"
              stripedRows
            >
              <Column field="date" header="日期" style="min-width: 7rem;">
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.date) }}
                </template>
              </Column>
              <Column field="location" header="地点" style="min-width: 10rem;" />
              <Column field="count" header="数量" style="width: 6rem;">
                <template #body="slotProps">
                  <Tag :value="`${slotProps.data.count} 只`" severity="info" />
                </template>
              </Column>
              <Column field="notes" header="备注" style="min-width: 12rem;" />
            </DataTable>
            <div v-else class="empty-sightings">
              <i class="pi pi-inbox" />
              <p>暂无目击记录</p>
            </div>
          </template>
        </Card>
      </section>
    </template>

    <div v-else class="not-found">
      <i class="pi pi-exclamation-circle" />
      <p>未找到该鸟种信息</p>
      <Button label="返回首页" icon="pi pi-home" @click="router.push('/')" />
    </div>
  </div>
</template>

<style scoped>
.species-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.species-hero {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--p-content-background);
  border-radius: var(--p-border-radius-lg);
  border: 1px solid var(--p-content-border-color);
}

.species-image-wrapper {
  flex-shrink: 0;
  width: 320px;
  border-radius: var(--p-border-radius);
  overflow: hidden;
}

.species-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.species-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  min-width: 0;
}

.species-name {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.species-scientific-name {
  margin: 0;
  font-size: 1.1rem;
  font-style: italic;
  color: var(--p-text-muted-color);
}

.species-stats {
  display: flex;
  gap: 2rem;
  margin-top: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--p-primary-color);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

.sightings-section h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-sightings {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--p-text-muted-color);
}

.empty-sightings .pi {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.not-found {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--p-text-muted-color);
}

.not-found .pi {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.not-found p {
  margin: 0 0 1.5rem;
  font-size: 1.1rem;
}

@media (max-width: 640px) {
  .species-hero {
    flex-direction: column;
    padding: 1rem;
  }

  .species-image-wrapper {
    width: 100%;
    max-height: 220px;
  }

  .species-name {
    font-size: 1.5rem;
  }

  .species-stats {
    gap: 1.5rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }
}
</style>
