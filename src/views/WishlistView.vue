<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '@/stores/wishlist'
import { searchWishlist } from '@/utils/wishlistSearch'
import { transferToCollection } from '@/utils/wishlistTransfer'
import type { WishlistItem, WishlistItemForm } from '@/types/wishlist'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import InputGroup from 'primevue/inputgroup'
import InputIcon from 'primevue/inputicon'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

const store = useWishlistStore()
const router = useRouter()
const confirm = useConfirm()

const searchQuery = ref('')

const displayItems = computed(() => {
  return searchWishlist(store.items, searchQuery.value)
})

const dialogVisible = ref(false)
const dialogMode = ref<'view' | 'create'>('view')
const selectedItem = ref<WishlistItem | null>(null)

const emptyForm = (): WishlistItemForm => ({
  title: '',
  artist: '',
  catalogNumber: '',
  expectedPrice: null,
})

const form = ref<WishlistItemForm>(emptyForm())

const dialogHeader = computed(() => {
  if (dialogMode.value === 'create') return '添加心愿'
  return selectedItem.value?.title ?? '心愿详情'
})

const isFormValid = computed(() => {
  return (
    form.value.title.trim() !== '' &&
    form.value.artist.trim() !== '' &&
    form.value.catalogNumber.trim() !== '' &&
    form.value.expectedPrice !== null &&
    form.value.expectedPrice >= 0
  )
})

function openView(item: WishlistItem) {
  selectedItem.value = item
  dialogMode.value = 'view'
  dialogVisible.value = true
}

function openCreate() {
  selectedItem.value = null
  form.value = emptyForm()
  dialogMode.value = 'create'
  dialogVisible.value = true
}

function submitForm() {
  if (!isFormValid.value) return

  const item = store.addItem(form.value)
  selectedItem.value = item
  dialogMode.value = 'view'
}

function handleTransfer(item?: WishlistItem | Event) {
  let target: WishlistItem | null | undefined
  if (item && 'id' in item) {
    target = item
  } else {
    target = selectedItem.value
  }
  if (!target) return

  confirm.require({
    message: `确定将「${target.title}」转入个人收藏吗？心愿单中将移除该条目。`,
    header: '转入收藏',
    icon: 'pi pi-arrow-right',
    rejectLabel: '取消',
    acceptLabel: '转入',
    rejectProps: { label: '取消', severity: 'secondary', outlined: true },
    acceptProps: { label: '转入', severity: 'success' },
    accept: () => {
      transferToCollection(target)
      if (selectedItem.value?.id === target.id) {
        dialogVisible.value = false
        selectedItem.value = null
      }
    },
  })
}

function confirmDelete() {
  if (!selectedItem.value) return

  confirm.require({
    message: `确定要删除心愿「${selectedItem.value.title}」吗？`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: '取消',
    acceptLabel: '删除',
    rejectProps: { label: '取消', severity: 'secondary', outlined: true },
    acceptProps: { label: '删除', severity: 'danger' },
    accept: () => {
      store.removeItem(selectedItem.value!.id)
      dialogVisible.value = false
      selectedItem.value = null
    },
  })
}

function formatPrice(price: number) {
  return `¥${price.toFixed(2)}`
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('zh-CN')
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="wishlist-page">
    <header class="page-header">
      <div class="header-text">
        <h1>心愿单</h1>
        <p>记录你想购入的黑胶专辑</p>
      </div>
      <div class="header-actions">
        <Button label="返回首页" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
        <Button label="添加心愿" icon="pi pi-heart" @click="openCreate" />
      </div>
    </header>

    <section class="summary-cards">
      <div class="summary-card">
        <i class="pi pi-heart summary-icon" />
        <div class="summary-info">
          <p class="summary-label">心愿总数</p>
          <p class="summary-value">{{ store.totalCount }}</p>
        </div>
      </div>
      <div class="summary-card">
        <i class="pi pi-wallet summary-icon" />
        <div class="summary-info">
          <p class="summary-label">预期总金额</p>
          <p class="summary-value">{{ formatPrice(store.totalExpectedAmount) }}</p>
        </div>
      </div>
    </section>

    <section class="toolbar">
      <InputGroup class="search-box">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchQuery"
          placeholder="搜索专辑名、艺人、编号..."
          class="search-input"
        />
      </InputGroup>
    </section>

    <p class="result-count">共 {{ displayItems.length }} 条心愿</p>

    <div v-if="displayItems.length > 0" class="wishlist-grid">
      <div
        v-for="item in displayItems"
        :key="item.id"
        class="wishlist-card"
        @click="openView(item)"
      >
        <div class="card-cover">
          <i class="pi pi-heart cover-icon" />
        </div>
        <div class="card-info">
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-artist">{{ item.artist }}</p>
          <div class="card-meta">
            <Tag :value="item.catalogNumber" severity="secondary" />
            <span class="expected-price">{{ formatPrice(item.expectedPrice) }}</span>
          </div>
          <Button
            label="转入收藏"
            icon="pi pi-arrow-right"
            severity="success"
            size="small"
            class="card-transfer-btn"
            @click.stop="handleTransfer(item)"
          />
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-heart" />
      <p>暂无心愿，点击上方按钮添加</p>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      :header="dialogHeader"
      modal
      :style="{ width: '32rem' }"
      :breakpoints="{ '640px': '95vw' }"
    >
      <template v-if="dialogMode === 'view' && selectedItem">
        <dl class="detail-list">
          <dt>专辑名</dt>
          <dd>{{ selectedItem.title }}</dd>
          <dt>艺人</dt>
          <dd>{{ selectedItem.artist }}</dd>
          <dt>编号</dt>
          <dd>{{ selectedItem.catalogNumber }}</dd>
          <dt>预期价格</dt>
          <dd>{{ formatPrice(selectedItem.expectedPrice) }}</dd>
          <dt>添加时间</dt>
          <dd>{{ formatDate(selectedItem.createdAt) }}</dd>
        </dl>
      </template>

      <template v-else>
        <div class="form-grid">
          <div class="field">
            <label for="wl-title">专辑名 <span class="required">*</span></label>
            <InputText id="wl-title" v-model="form.title" class="w-full" />
          </div>
          <div class="field">
            <label for="wl-artist">艺人 <span class="required">*</span></label>
            <InputText id="wl-artist" v-model="form.artist" class="w-full" />
          </div>
          <div class="field">
            <label for="wl-catalog">编号 <span class="required">*</span></label>
            <InputText id="wl-catalog" v-model="form.catalogNumber" class="w-full" />
          </div>
          <div class="field">
            <label for="wl-price">预期价格 <span class="required">*</span></label>
            <InputNumber
              id="wl-price"
              v-model="form.expectedPrice"
              mode="currency"
              currency="CNY"
              locale="zh-CN"
              class="w-full"
              :min="0"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <template v-if="dialogMode === 'view' && selectedItem">
          <Button
            label="删除"
            icon="pi pi-trash"
            severity="danger"
            outlined
            @click="confirmDelete"
          />
          <Button
            label="转入收藏"
            icon="pi pi-arrow-right"
            severity="success"
            @click="handleTransfer"
          />
          <Button label="关闭" severity="secondary" @click="dialogVisible = false" />
        </template>
        <template v-else>
          <Button
            label="取消"
            severity="secondary"
            outlined
            @click="dialogVisible = false"
          />
          <Button
            label="保存"
            icon="pi pi-check"
            :disabled="!isFormValid"
            @click="submitForm"
          />
        </template>
      </template>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<style scoped>
.wishlist-page {
  max-width: 1200px;
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

.header-actions {
  display: flex;
  gap: 0.75rem;
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

.summary-icon {
  font-size: 2rem;
  color: var(--p-primary-color);
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
}

.search-input {
  width: 100%;
}

.result-count {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.wishlist-card {
  cursor: pointer;
  border-radius: var(--p-border-radius-lg);
  border: 1px solid var(--p-content-border-color);
  background: var(--p-content-background);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}

.wishlist-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(145deg, #3a1c3a 0%, #2a1a2a 50%, #1a0d1a 100%);
  position: relative;
  overflow: hidden;
}

.card-cover::before {
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
  color: #c084fc;
  z-index: 1;
}

.card-info {
  padding: 0.75rem;
}

.card-title {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-artist {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.expected-price {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-primary-color);
}

.card-transfer-btn {
  width: 100%;
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

.detail-list {
  display: grid;
  grid-template-columns: 5rem 1fr;
  gap: 0.5rem 1rem;
  margin: 0;
}

.detail-list dt {
  font-weight: 600;
  color: var(--p-text-muted-color);
}

.detail-list dd {
  margin: 0;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.375rem;
  font-weight: 500;
}

.required {
  color: var(--p-red-500);
}

.w-full {
  width: 100%;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .wishlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
