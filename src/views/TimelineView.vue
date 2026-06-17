<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSightingStore } from '@/stores/sighting'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

const router = useRouter()
const store = useSightingStore()

const allSightings = computed(() => store.getAllSightingsSorted())

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function goToSpecies(speciesId: string) {
  router.push({ name: 'species-detail', params: { id: speciesId } })
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="timeline-page">
    <header class="page-header">
      <div class="header-text">
        <h1>目击时间线</h1>
        <p>按日期浏览全部鸟种目击记录</p>
      </div>
      <Button label="返回首页" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
    </header>

    <section class="timeline-summary">
      <div class="summary-card">
        <i class="pi pi-eye summary-icon" />
        <div class="summary-info">
          <p class="summary-label">目击记录总数</p>
          <p class="summary-value">{{ allSightings.length }} 条</p>
        </div>
      </div>
      <div class="summary-card">
        <i class="pi pi-compass summary-icon" style="color: var(--p-green-500)" />
        <div class="summary-info">
          <p class="summary-label">涉及鸟种数</p>
          <p class="summary-value">{{ store.allSpecies.length }} 种</p>
        </div>
      </div>
    </section>

    <section class="timeline-section">
      <Card>
        <template #title>
          <h2>全部目击记录</h2>
        </template>
        <template #content>
          <DataTable
            v-if="allSightings.length > 0"
            :value="allSightings"
            :paginator="allSightings.length > 10"
            :rows="10"
            stripedRows
          >
            <Column field="date" header="日期" style="min-width: 7rem;">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.date) }}
              </template>
            </Column>
            <Column field="speciesName" header="鸟种名称" style="min-width: 9rem;">
              <template #body="slotProps">
                <span class="species-link" @click="goToSpecies(slotProps.data.speciesId)">
                  {{ slotProps.data.speciesName }}
                </span>
                <p class="species-scientific">{{ slotProps.data.scientificName }}</p>
              </template>
            </Column>
            <Column field="location" header="地点" style="min-width: 10rem;" />
            <Column field="count" header="数量" style="width: 6rem;">
              <template #body="slotProps">
                <Tag :value="`${slotProps.data.count} 只`" severity="info" />
              </template>
            </Column>
            <Column field="notes" header="备注" style="min-width: 14rem;" />
          </DataTable>
          <div v-else class="empty-timeline">
            <i class="pi pi-inbox" />
            <p>暂无目击记录</p>
          </div>
        </template>
      </Card>
    </section>
  </div>
</template>

<style scoped>
.timeline-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-text h1 {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
  font-weight: 700;
}

.header-text p {
  margin: 0;
  color: var(--p-text-muted-color);
}

.timeline-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--p-content-background);
  border-radius: var(--p-border-radius-lg);
  border: 1px solid var(--p-content-border-color);
}

.summary-icon {
  font-size: 2rem;
  color: var(--p-primary-color);
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.summary-label {
  margin: 0;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

.summary-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.timeline-section h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.species-link {
  display: block;
  color: var(--p-primary-color);
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: text-decoration 0.15s;
}

.species-link:hover {
  text-decoration: underline;
}

.species-scientific {
  margin: 0.125rem 0 0;
  font-size: 0.75rem;
  font-style: italic;
  color: var(--p-text-muted-color);
}

.empty-timeline {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--p-text-muted-color);
}

.empty-timeline .pi {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .summary-value {
    font-size: 1.25rem;
  }
}
</style>
