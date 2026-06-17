<script setup lang="ts">
import { useCollectionStore } from '@/stores/collection'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

const store = useCollectionStore()
const router = useRouter()

function formatPrice(price: number) {
  return `¥${price.toFixed(2)}`
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="stats-page">
    <header class="page-header">
      <div class="header-text">
        <h1>收藏统计</h1>
        <p>查看你的黑胶收藏数据概览</p>
      </div>
      <Button label="返回首页" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
    </header>

    <section class="stats-cards">
      <Card class="stat-card">
        <div class="stat-content">
          <i class="pi pi-disc stat-icon" />
          <div class="stat-info">
            <p class="stat-label">收藏总张数</p>
            <p class="stat-value">{{ store.personalTotalCount }}</p>
          </div>
        </div>
      </Card>

      <Card class="stat-card">
        <div class="stat-content">
          <i class="pi pi-wallet stat-icon" />
          <div class="stat-info">
            <p class="stat-label">购入总金额</p>
            <p class="stat-value">{{ formatPrice(store.personalTotalAmount) }}</p>
          </div>
        </div>
      </Card>
    </section>

    <section class="genre-section">
      <Card>
        <template #title>
          <h2>按音乐风格分组</h2>
        </template>
        <DataTable :value="store.genreStats" :paginator="false" stripedRows>
          <Column field="genre" header="音乐风格">
            <template #body="slotProps">
              <Tag :value="slotProps.data.genre" severity="primary" />
            </template>
          </Column>
          <Column field="count" header="数量" style="width: 10rem;">
            <template #body="slotProps">
              <span class="genre-count">{{ slotProps.data.count }} 张</span>
            </template>
          </Column>
        </DataTable>
        <div v-if="store.genreStats.length === 0" class="empty-genres">
          <i class="pi pi-inbox" />
          <p>暂无风格数据</p>
        </div>
      </Card>
    </section>
  </div>
</template>

<style scoped>
.stats-page {
  max-width: 900px;
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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  border-radius: var(--p-border-radius-lg);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
  color: var(--p-primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  margin: 0;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.stat-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.genre-section h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.genre-count {
  font-weight: 600;
}

.empty-genres {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--p-text-muted-color);
}

.empty-genres .pi {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
