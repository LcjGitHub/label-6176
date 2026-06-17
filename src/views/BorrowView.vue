<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBorrowStore } from '@/stores/borrow'
import type { BorrowRecord } from '@/types/borrow'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import InputIcon from 'primevue/inputicon'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

const store = useBorrowStore()
const router = useRouter()
const confirm = useConfirm()

const searchQuery = ref('')

const displayRecords = computed(() => {
  const records = store.activeRecords
  if (!searchQuery.value.trim()) return records
  const query = searchQuery.value.toLowerCase().trim()
  return records.filter(
    (r) =>
      r.albumTitle.toLowerCase().includes(query) ||
      r.albumArtist.toLowerCase().includes(query) ||
      r.albumCatalogNumber.toLowerCase().includes(query) ||
      r.borrowerName.toLowerCase().includes(query)
  )
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function getDaysOverdue(expectedReturnDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expected = new Date(expectedReturnDate)
  expected.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function handleReturn(record: BorrowRecord) {
  confirm.require({
    message: `确定「${record.albumTitle}」已归还吗？`,
    header: '确认归还',
    icon: 'pi pi-check-circle',
    rejectLabel: '取消',
    acceptLabel: '确认归还',
    rejectProps: { label: '取消', severity: 'secondary', outlined: true },
    acceptProps: { label: '确认归还', severity: 'success' },
    accept: () => {
      store.markReturned(record.id)
    },
  })
}

function goBack() {
  router.push('/')
}

function statusSeverity(status: string) {
  if (status === 'overdue') return 'danger'
  if (status === 'borrowed') return 'warning'
  return 'success'
}

function statusLabel(status: string) {
  if (status === 'overdue') return '已逾期'
  if (status === 'borrowed') return '借出中'
  return '已归还'
}

function rowClass(data: BorrowRecord) {
  if (data.status === 'overdue') return 'overdue-row'
  return ''
}

onMounted(() => {
  store.refreshStatus()
})
</script>

<template>
  <div class="borrow-page">
    <header class="page-header">
      <div class="header-text">
        <h1>在借列表</h1>
        <p>管理你的黑胶专辑借阅记录</p>
      </div>
      <Button label="返回首页" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
    </header>

    <section class="summary-cards">
      <div class="summary-card">
        <i class="pi pi-book summary-icon" />
        <div class="summary-info">
          <p class="summary-label">在借总数</p>
          <p class="summary-value">{{ store.activeCount }}</p>
        </div>
      </div>
      <div class="summary-card overdue">
        <i class="pi pi-exclamation-triangle summary-icon" />
        <div class="summary-info">
          <p class="summary-label">逾期数量</p>
          <p class="summary-value">{{ store.overdueCount }}</p>
        </div>
      </div>
    </section>

    <section class="toolbar">
      <InputGroup class="search-box">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchQuery"
          placeholder="搜索专辑名、艺人、编号、借阅人..."
          class="search-input"
        />
      </InputGroup>
    </section>

    <p class="result-count">共 {{ displayRecords.length }} 条在借记录</p>

    <div v-if="displayRecords.length > 0" class="records-table">
      <DataTable :value="displayRecords" :paginator="false" stripedRows :rowClass="rowClass">
        <Column field="albumTitle" header="专辑">
          <template #body="slotProps">
            <div class="album-cell">
              <div class="album-cover-mini">
                <i class="pi pi-compact-disc" />
              </div>
              <div class="album-info">
                <p class="album-title">{{ slotProps.data.albumTitle }}</p>
                <p class="album-artist">{{ slotProps.data.albumArtist }}</p>
              </div>
            </div>
          </template>
        </Column>
        <Column field="albumCatalogNumber" header="编号" style="width: 8rem;">
          <template #body="slotProps">
            <Tag :value="slotProps.data.albumCatalogNumber" severity="secondary" />
          </template>
        </Column>
        <Column field="borrowerName" header="借阅人" style="width: 8rem;" />
        <Column field="borrowDate" header="借出日期" style="width: 9rem;">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.borrowDate) }}
          </template>
        </Column>
        <Column field="expectedReturnDate" header="预计归还" style="width: 9rem;">
          <template #body="slotProps">
            <div class="return-date-cell">
              {{ formatDate(slotProps.data.expectedReturnDate) }}
              <span
                v-if="slotProps.data.status === 'overdue'"
                class="overdue-days"
              >
                逾期 {{ getDaysOverdue(slotProps.data.expectedReturnDate) }} 天
              </span>
            </div>
          </template>
        </Column>
        <Column field="status" header="状态" style="width: 7rem;">
          <template #body="slotProps">
            <Tag :value="statusLabel(slotProps.data.status)" :severity="statusSeverity(slotProps.data.status)" />
          </template>
        </Column>
        <Column style="width: 8rem;">
          <template #body="slotProps">
            <Button
              label="归还"
              icon="pi pi-check"
              severity="success"
              size="small"
              @click="handleReturn(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-book" />
      <p>暂无在借记录</p>
    </div>

    <ConfirmDialog />
  </div>
</template>

<style scoped>
.borrow-page {
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: var(--p-border-radius-lg);
  border: 1px solid var(--p-content-border-color);
  background: var(--p-content-background);
}

.summary-card.overdue {
  border-color: var(--p-red-200);
  background: var(--p-red-50);
}

.summary-icon {
  font-size: 2rem;
  color: var(--p-primary-color);
}

.summary-card.overdue .summary-icon {
  color: var(--p-red-500);
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  margin: 0;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.summary-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.search-box {
  flex: 1;
  min-width: 220px;
  max-width: 400px;
}

.search-input {
  width: 100%;
}

.result-count {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.records-table {
  border-radius: var(--p-border-radius-lg);
  overflow: hidden;
  border: 1px solid var(--p-content-border-color);
}

.records-table :deep(.overdue-row) {
  background-color: var(--p-red-50) !important;
}

.records-table :deep(.overdue-row td) {
  background-color: var(--p-red-50) !important;
}

.records-table :deep(.p-datatable-striped .p-datatable-tbody > tr.overdue-row:nth-child(even) td) {
  background-color: var(--p-red-100) !important;
}

.album-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.album-cover-mini {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 4px;
  flex-shrink: 0;
}

.album-cover-mini .pi {
  font-size: 1.5rem;
  color: #888;
}

.album-info {
  min-width: 0;
}

.album-title {
  margin: 0;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  margin: 0;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.return-date-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.overdue-days {
  font-size: 0.75rem;
  color: var(--p-red-500);
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--p-text-muted-color);
}

.empty-state .pi {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>
