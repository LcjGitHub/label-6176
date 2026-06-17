<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCollectionStore } from '@/stores/collection'
import { filterBySource, searchAlbums } from '@/utils/search'
import type { Album, AlbumSource, FilterType, PersonalAlbumForm } from '@/types/album'
import DataView from 'primevue/dataview'
import SelectButton from 'primevue/selectbutton'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import AlbumCover from '@/components/AlbumCover.vue'

const store = useCollectionStore()
const confirm = useConfirm()

const searchQuery = ref('')
const filterType = ref<FilterType>('all')

const filterOptions = [
  { label: '全部', value: 'all' as FilterType },
  { label: '示例专辑', value: 'mock' as FilterType },
  { label: '我的收藏', value: 'personal' as FilterType },
]

/** 筛选并搜索后的专辑列表 */
const displayAlbums = computed(() => {
  const filtered = filterBySource(store.allAlbums, filterType.value)
  return searchAlbums(filtered, searchQuery.value)
})

/** Dialog 状态 */
const dialogVisible = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
const selectedAlbum = ref<Album | null>(null)

const emptyForm = (): PersonalAlbumForm => ({
  title: '',
  artist: '',
  catalogNumber: '',
  purchasePrice: null,
})

const form = ref<PersonalAlbumForm>(emptyForm())

const dialogHeader = computed(() => {
  if (dialogMode.value === 'create') return '添加收藏'
  if (dialogMode.value === 'edit') return '编辑收藏'
  return selectedAlbum.value?.title ?? '专辑详情'
})

const isPersonal = computed(() => selectedAlbum.value?.source === 'personal')
const isFormMode = computed(() => dialogMode.value === 'create' || dialogMode.value === 'edit')

const isFormValid = computed(() => {
  return (
    form.value.title.trim() !== '' &&
    form.value.artist.trim() !== '' &&
    form.value.catalogNumber.trim() !== '' &&
    form.value.purchasePrice !== null &&
    form.value.purchasePrice >= 0
  )
})

/**
 * 打开详情 Dialog
 */
function openView(album: Album) {
  selectedAlbum.value = album
  dialogMode.value = 'view'
  dialogVisible.value = true
}

/**
 * 打开新建 Dialog
 */
function openCreate() {
  selectedAlbum.value = null
  form.value = emptyForm()
  dialogMode.value = 'create'
  dialogVisible.value = true
}

/**
 * 打开编辑 Dialog
 */
function openEdit() {
  if (!selectedAlbum.value || selectedAlbum.value.source !== 'personal') return
  form.value = {
    title: selectedAlbum.value.title,
    artist: selectedAlbum.value.artist,
    catalogNumber: selectedAlbum.value.catalogNumber,
    purchasePrice: selectedAlbum.value.purchasePrice ?? 0,
  }
  dialogMode.value = 'edit'
}

/**
 * 提交表单（新建或编辑）
 */
function submitForm() {
  if (!isFormValid.value) return

  if (dialogMode.value === 'create') {
    const album = store.addAlbum(form.value)
    selectedAlbum.value = album
    dialogMode.value = 'view'
  } else if (dialogMode.value === 'edit' && selectedAlbum.value) {
    store.updateAlbum(selectedAlbum.value.id, form.value)
    selectedAlbum.value = store.getAlbumById(selectedAlbum.value.id) ?? null
    dialogMode.value = 'view'
  }
}

/**
 * 确认删除
 */
function confirmDelete() {
  if (!selectedAlbum.value || selectedAlbum.value.source !== 'personal') return

  confirm.require({
    message: `确定要删除「${selectedAlbum.value.title}」吗？`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: '取消',
    acceptLabel: '删除',
    rejectProps: { label: '取消', severity: 'secondary', outlined: true },
    acceptProps: { label: '删除', severity: 'danger' },
    accept: () => {
      store.removeAlbum(selectedAlbum.value!.id)
      dialogVisible.value = false
      selectedAlbum.value = null
    },
  })
}

/**
 * 来源标签样式
 */
function sourceSeverity(source: AlbumSource) {
  return source === 'personal' ? 'success' : 'info'
}

function sourceLabel(source: AlbumSource) {
  return source === 'personal' ? '我的收藏' : '示例'
}

function formatPrice(price?: number) {
  if (price === undefined || price === null) return '—'
  return `¥${price.toFixed(2)}`
}
</script>

<template>
  <div class="home-page">
    <header class="page-header">
      <div class="header-text">
        <h1>黑胶收藏管理</h1>
        <p>浏览示例专辑，管理你的个人黑胶收藏</p>
      </div>
      <Button label="添加收藏" icon="pi pi-plus" @click="openCreate" />
    </header>

    <section class="toolbar">
      <span class="p-input-icon-left search-box">
        <i class="pi pi-search" />
        <InputText
          v-model="searchQuery"
          placeholder="搜索专辑名、艺人、编号..."
          class="search-input"
        />
      </span>
      <SelectButton
        v-model="filterType"
        :options="filterOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
      />
    </section>

    <p class="result-count">共 {{ displayAlbums.length }} 张专辑</p>

    <DataView :value="displayAlbums" layout="grid">
      <template #grid="slotProps">
        <div class="album-grid">
          <div
            v-for="album in slotProps.items"
            :key="album.id"
            class="album-card"
            @click="openView(album)"
          >
            <AlbumCover :title="album.title" />
            <div class="album-info">
              <h3 class="album-title">{{ album.title }}</h3>
              <p class="album-artist">{{ album.artist }}</p>
              <div class="album-meta">
                <Tag
                  :value="sourceLabel(album.source)"
                  :severity="sourceSeverity(album.source)"
                />
                <span v-if="album.purchasePrice !== undefined" class="price">
                  {{ formatPrice(album.purchasePrice) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox" />
          <p>暂无匹配的专辑</p>
        </div>
      </template>
    </DataView>

    <Dialog
      v-model:visible="dialogVisible"
      :header="dialogHeader"
      modal
      :style="{ width: '32rem' }"
      :breakpoints="{ '640px': '95vw' }"
    >
      <!-- 查看模式 -->
      <template v-if="!isFormMode && selectedAlbum">
        <div class="dialog-content">
          <AlbumCover :title="selectedAlbum.title" class="dialog-cover" />
          <dl class="detail-list">
            <dt>专辑名</dt>
            <dd>{{ selectedAlbum.title }}</dd>
            <dt>艺人</dt>
            <dd>{{ selectedAlbum.artist }}</dd>
            <dt>编号</dt>
            <dd>{{ selectedAlbum.catalogNumber }}</dd>
            <template v-if="selectedAlbum.year">
              <dt>年份</dt>
              <dd>{{ selectedAlbum.year }}</dd>
            </template>
            <template v-if="selectedAlbum.genre">
              <dt>风格</dt>
              <dd>{{ selectedAlbum.genre }}</dd>
            </template>
            <template v-if="selectedAlbum.source === 'personal'">
              <dt>购入价</dt>
              <dd>{{ formatPrice(selectedAlbum.purchasePrice) }}</dd>
            </template>
            <dt>来源</dt>
            <dd>
              <Tag
                :value="sourceLabel(selectedAlbum.source)"
                :severity="sourceSeverity(selectedAlbum.source)"
              />
            </dd>
          </dl>
        </div>
      </template>

      <!-- 表单模式（新建/编辑） -->
      <template v-else>
        <div class="form-grid">
          <div class="field">
            <label for="title">专辑名 <span class="required">*</span></label>
            <InputText id="title" v-model="form.title" class="w-full" />
          </div>
          <div class="field">
            <label for="artist">艺人 <span class="required">*</span></label>
            <InputText id="artist" v-model="form.artist" class="w-full" />
          </div>
          <div class="field">
            <label for="catalog">编号 <span class="required">*</span></label>
            <InputText id="catalog" v-model="form.catalogNumber" class="w-full" />
          </div>
          <div class="field">
            <label for="price">购入价 <span class="required">*</span></label>
            <InputNumber
              id="price"
              v-model="form.purchasePrice"
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
        <template v-if="!isFormMode && selectedAlbum">
          <Button
            v-if="isPersonal"
            label="删除"
            icon="pi pi-trash"
            severity="danger"
            outlined
            @click="confirmDelete"
          />
          <Button
            v-if="isPersonal"
            label="编辑"
            icon="pi pi-pencil"
            @click="openEdit"
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
.home-page {
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

.header-text h1 {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
  font-weight: 700;
}

.header-text p {
  margin: 0;
  color: var(--p-text-muted-color);
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

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.album-card {
  cursor: pointer;
  border-radius: var(--p-border-radius-lg);
  border: 1px solid var(--p-content-border-color);
  background: var(--p-content-background);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}

.album-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.album-info {
  padding: 0.75rem;
}

.album-title {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.price {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-primary-color);
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

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dialog-cover {
  max-width: 200px;
  margin: 0 auto;
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

  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
