<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCollectionStore } from '@/stores/collection'
import { useBorrowStore } from '@/stores/borrow'
import { filterBySource, searchAlbums, sortAlbums } from '@/utils/search'
import {
  exportCollection,
  parseImportFile,
  getAlbumsFromExportData,
  getExportSummary,
  type CollectionExportData,
  type ImportMode,
} from '@/utils/collectionIO'
import type { Album, AlbumSource, FilterType, PersonalAlbumForm, SortOptionValue } from '@/types/album'
import type { BorrowForm, BorrowRecord } from '@/types/borrow'
import DataView from 'primevue/dataview'
import SelectButton from 'primevue/selectbutton'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import RadioButton from 'primevue/radiobutton'
import AlbumCover from '@/components/AlbumCover.vue'

const store = useCollectionStore()
const borrowStore = useBorrowStore()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()

const importModeDialogVisible = ref(false)
const importMode = ref<ImportMode>('merge')
const pendingImportData = ref<CollectionExportData | null>(null)
const pendingImportFile = ref<File | null>(null)
const importSummary = ref<{ count: number; date: string } | null>(null)

const fileInputRef = ref<HTMLInputElement | null>(null)

const searchQuery = ref('')
const filterType = ref<FilterType>('all')
const sortOption = ref<SortOptionValue>('default')

const filterOptions = [
  { label: '全部', value: 'all' as FilterType },
  { label: '示例专辑', value: 'mock' as FilterType },
  { label: '我的收藏', value: 'personal' as FilterType },
]

const sortOptions = [
  { label: '默认排序', value: 'default' as SortOptionValue },
  { label: '专辑名升序', value: 'title-asc' as SortOptionValue },
  { label: '专辑名降序', value: 'title-desc' as SortOptionValue },
  { label: '艺人升序', value: 'artist-asc' as SortOptionValue },
  { label: '艺人降序', value: 'artist-desc' as SortOptionValue },
  { label: '购入价升序', value: 'purchasePrice-asc' as SortOptionValue },
  { label: '购入价降序', value: 'purchasePrice-desc' as SortOptionValue },
  { label: '年份升序', value: 'year-asc' as SortOptionValue },
  { label: '年份降序', value: 'year-desc' as SortOptionValue },
]

/** 筛选、搜索并排序后的专辑列表 */
const displayAlbums = computed(() => {
  let result = filterBySource(store.allAlbums, filterType.value)
  result = searchAlbums(result, searchQuery.value)
  if (sortOption.value !== 'default') {
    const [field, order] = sortOption.value.split('-') as [string, string]
    result = sortAlbums(result, field as any, order as any)
  }
  return result
})

/** Dialog 状态 */
const dialogVisible = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
const selectedAlbum = ref<Album | null>(null)

const emptyForm = (): PersonalAlbumForm => ({
  title: '',
  artist: '',
  catalogNumber: '',
  genre: '',
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

const activeBorrowRecord = computed((): BorrowRecord | undefined => {
  if (!selectedAlbum.value) return undefined
  return borrowStore.getActiveByAlbumId(selectedAlbum.value.id)
})

const canBorrow = computed(() => {
  if (!selectedAlbum.value) return false
  return isPersonal.value && borrowStore.isAlbumAvailable(selectedAlbum.value.id)
})

const borrowDialogVisible = ref(false)

const borrowDateRef = ref<Date>(new Date())
const expectedReturnDateRef = ref<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

const emptyBorrowForm = (): BorrowForm => {
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  return {
    borrowerName: '',
    borrowDate: today.toISOString().split('T')[0],
    expectedReturnDate: nextWeek.toISOString().split('T')[0],
  }
}

const borrowForm = ref<BorrowForm>(emptyBorrowForm())

function dateToStr(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isBorrowFormValid = computed(() => {
  return (
    borrowForm.value.borrowerName.trim() !== '' &&
    borrowForm.value.borrowDate !== '' &&
    borrowForm.value.expectedReturnDate !== '' &&
    new Date(borrowForm.value.expectedReturnDate) >= new Date(borrowForm.value.borrowDate)
  )
})

function openBorrowDialog() {
  if (!selectedAlbum.value || !isPersonal.value) return
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  borrowDateRef.value = today
  expectedReturnDateRef.value = nextWeek
  borrowForm.value = {
    borrowerName: '',
    borrowDate: dateToStr(today),
    expectedReturnDate: dateToStr(nextWeek),
  }
  borrowDialogVisible.value = true
}

function onBorrowDateChange(e: any) {
  if (e.value) {
    borrowForm.value.borrowDate = dateToStr(e.value)
  }
}

function onReturnDateChange(e: any) {
  if (e.value) {
    borrowForm.value.expectedReturnDate = dateToStr(e.value)
  }
}

function submitBorrow() {
  if (!isBorrowFormValid.value || !selectedAlbum.value) return
  borrowStore.createBorrow(selectedAlbum.value, borrowForm.value)
  borrowDialogVisible.value = false
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function borrowStatusSeverity(status: string) {
  if (status === 'overdue') return 'danger'
  if (status === 'borrowed') return 'warning'
  return 'success'
}

function borrowStatusLabel(status: string) {
  if (status === 'overdue') return '已逾期'
  if (status === 'borrowed') return '借出中'
  return '已归还'
}

const isFormValid = computed(() => {
  return (
    form.value.title.trim() !== '' &&
    form.value.artist.trim() !== '' &&
    form.value.catalogNumber.trim() !== '' &&
    form.value.genre.trim() !== '' &&
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
    genre: selectedAlbum.value.genre ?? '',
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

function handleExport() {
  const personalAlbums = store.personalAlbums
  if (personalAlbums.length === 0) {
    toast.add({
      severity: 'warn',
      summary: '暂无数据',
      detail: '你还没有收藏任何专辑，无法导出',
      life: 3000,
    })
    return
  }

  confirm.require({
    message: `确定要导出全部 ${personalAlbums.length} 条个人收藏数据吗？`,
    header: '导出确认',
    icon: 'pi pi-download',
    rejectLabel: '取消',
    acceptLabel: '导出',
    rejectProps: { label: '取消', severity: 'secondary', outlined: true },
    acceptProps: { label: '导出', severity: 'primary' },
    accept: () => {
      exportCollection(personalAlbums)
      toast.add({
        severity: 'success',
        summary: '导出成功',
        detail: `已导出 ${personalAlbums.length} 条收藏数据`,
        life: 3000,
      })
    },
  })
}

function triggerImportFileSelect() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const data = await parseImportFile(file)
    pendingImportData.value = data
    pendingImportFile.value = file
    importSummary.value = getExportSummary(data)
    importMode.value = 'merge'
    importModeDialogVisible.value = true
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '导入失败',
      detail: error instanceof Error ? error.message : '文件解析失败',
      life: 4000,
    })
  } finally {
    target.value = ''
  }
}

function confirmImport() {
  if (!pendingImportData.value) return

  const albums = getAlbumsFromExportData(pendingImportData.value)
  const mode = importMode.value
  const importCount = albums.length
  const currentCount = store.personalAlbums.length

  const executeImport = () => {
    if (mode === 'merge') {
      const addedCount = store.batchAddAlbums(albums)
      toast.add({
        severity: 'success',
        summary: '导入成功',
        detail: `合并模式：新增 ${addedCount} 条，跳过 ${importCount - addedCount} 条重复数据`,
        life: 4000,
      })
    } else {
      const result = store.batchReplaceAlbums(albums)
      toast.add({
        severity: 'success',
        summary: '导入成功',
        detail: `覆盖模式：清空 ${result.cleared} 条，导入 ${result.added} 条`,
        life: 4000,
      })
    }
  }

  if (mode === 'replace' && currentCount > 0) {
    closeImportDialog()
    setTimeout(() => {
      confirm.require({
        message: `覆盖模式将清空当前 ${currentCount} 条收藏，然后导入 ${importCount} 条数据。此操作不可恢复，确定继续吗？`,
        header: '覆盖确认',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: '取消',
        acceptLabel: '确认覆盖',
        rejectProps: { label: '取消', severity: 'secondary', outlined: true },
        acceptProps: { label: '确认覆盖', severity: 'danger' },
        accept: executeImport,
      })
    }, 100)
  } else {
    executeImport()
    closeImportDialog()
  }
}

function closeImportDialog() {
  importModeDialogVisible.value = false
  pendingImportData.value = null
  pendingImportFile.value = null
  importSummary.value = null
}
</script>

<template>
  <div class="home-page">
    <header class="page-header">
      <div class="header-text">
        <h1>黑胶收藏管理</h1>
        <p>浏览示例专辑，管理你的个人黑胶收藏</p>
      </div>
      <div class="header-actions">
        <Button label="心愿单" icon="pi pi-heart" severity="help" outlined @click="router.push('/wishlist')" />
        <Button label="统计" icon="pi pi-chart-bar" severity="secondary" outlined @click="router.push('/stats')" />
        <Button label="目击时间线" icon="pi pi-eye" severity="success" outlined @click="router.push('/timeline')" />
        <div class="borrow-btn-wrapper">
          <Button
            label="在借列表"
            icon="pi pi-book"
            severity="warning"
            @click="router.push('/borrow')"
          />
          <span v-if="borrowStore.activeCount > 0" class="borrow-badge">{{ borrowStore.activeCount }}</span>
        </div>
        <Button label="添加收藏" icon="pi pi-plus" @click="openCreate" />
      </div>
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
      <div class="sort-controls">
        <span class="sort-label">排序：</span>
        <Dropdown
          v-model="sortOption"
          :options="sortOptions"
          option-label="label"
          option-value="value"
          class="sort-dropdown"
        />
      </div>
      <div class="toolbar-actions">
        <Button
          label="导出收藏"
          icon="pi pi-download"
          severity="secondary"
          outlined
          @click="handleExport"
        />
        <Button
          label="导入收藏"
          icon="pi pi-upload"
          severity="secondary"
          outlined
          @click="triggerImportFileSelect"
        />
      </div>
      <SelectButton
        v-model="filterType"
        :options="filterOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
      />
      <input
        ref="fileInputRef"
        type="file"
        accept=".json"
        style="display: none"
        @change="handleFileSelect"
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

          <div
            v-if="isPersonal && activeBorrowRecord"
            class="borrow-info-card"
            :class="activeBorrowRecord.status === 'overdue' ? 'overdue' : ''"
          >
            <div class="borrow-info-header">
              <i class="pi pi-book borrow-info-icon" />
              <span class="borrow-info-title">借阅信息</span>
              <Tag
                :value="borrowStatusLabel(activeBorrowRecord.status)"
                :severity="borrowStatusSeverity(activeBorrowRecord.status)"
              />
            </div>
            <div class="borrow-info-grid">
              <div>
                <span class="borrow-info-label">借阅人</span>
                <p class="borrow-info-value">{{ activeBorrowRecord.borrowerName }}</p>
              </div>
              <div>
                <span class="borrow-info-label">借出日期</span>
                <p class="borrow-info-value">{{ formatDate(activeBorrowRecord.borrowDate) }}</p>
              </div>
              <div class="borrow-info-return">
                <span class="borrow-info-label">预计归还</span>
                <p class="borrow-info-value">
                  {{ formatDate(activeBorrowRecord.expectedReturnDate) }}
                  <span
                    v-if="activeBorrowRecord.status === 'overdue'"
                    class="overdue-days-tip"
                  >
                    (已逾期)
                  </span>
                </p>
              </div>
            </div>
          </div>

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
            <label for="genre">风格 <span class="required">*</span></label>
            <InputText id="genre" v-model="form.genre" placeholder="如：Jazz、Rock、Classical" class="w-full" />
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
            severity="secondary"
            outlined
            @click="openEdit"
          />
          <Button
            v-if="canBorrow"
            label="发起借阅"
            icon="pi pi-book"
            severity="warning"
            @click="openBorrowDialog"
          />
          <Button label="关闭" @click="dialogVisible = false" />
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

    <Dialog
      v-model:visible="borrowDialogVisible"
      header="发起借阅"
      modal
      :style="{ width: '28rem' }"
      :breakpoints="{ '640px': '95vw' }"
    >
      <div class="borrow-form">
        <div v-if="selectedAlbum" class="borrow-album-info">
          <AlbumCover :title="selectedAlbum.title" class="borrow-cover" />
          <div class="borrow-album-text">
            <p class="borrow-album-title">{{ selectedAlbum.title }}</p>
            <p class="borrow-album-artist">{{ selectedAlbum.artist }}</p>
          </div>
        </div>

        <div class="field">
          <label for="borrower-name">借阅人姓名 <span class="required">*</span></label>
          <InputText
            id="borrower-name"
            v-model="borrowForm.borrowerName"
            placeholder="请输入借阅人姓名"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="borrow-date">借出日期 <span class="required">*</span></label>
          <Calendar
            id="borrow-date"
            v-model="borrowDateRef"
            dateFormat="yy-mm-dd"
            :showIcon="true"
            class="w-full"
            @change="onBorrowDateChange"
          />
        </div>

        <div class="field">
          <label for="return-date">预计归还日期 <span class="required">*</span></label>
          <Calendar
            id="return-date"
            v-model="expectedReturnDateRef"
            dateFormat="yy-mm-dd"
            :showIcon="true"
            :minDate="borrowDateRef"
            class="w-full"
            @change="onReturnDateChange"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="取消"
          severity="secondary"
          outlined
          @click="borrowDialogVisible = false"
        />
        <Button
          label="确认借阅"
          icon="pi pi-check"
          :disabled="!isBorrowFormValid"
          @click="submitBorrow"
        />
      </template>
    </Dialog>

    <ConfirmDialog />

    <Dialog
      v-model:visible="importModeDialogVisible"
      header="导入收藏"
      modal
      :style="{ width: '28rem' }"
      :breakpoints="{ '640px': '95vw' }"
      @close="closeImportDialog"
    >
      <div class="import-dialog-content">
        <div class="import-info-card">
          <i class="pi pi-info-circle import-info-icon" />
          <div class="import-info-text">
            <p class="import-info-title">文件信息</p>
            <p class="import-info-detail" v-if="importSummary">
              包含 {{ importSummary.count }} 条收藏数据<br />
              导出时间：{{ importSummary.date }}
            </p>
          </div>
        </div>

        <div class="import-mode-section">
          <p class="import-mode-title">请选择导入方式</p>

          <div class="import-mode-option" @click="importMode = 'merge'">
            <RadioButton
              id="merge-mode"
              v-model="importMode"
              value="merge"
              name="importMode"
            />
            <label for="merge-mode" class="import-mode-label">
              <span class="import-mode-name">合并追加</span>
              <span class="import-mode-desc">保留现有收藏，将新数据追加到列表中，重复数据将被跳过</span>
            </label>
          </div>

          <div class="import-mode-option" @click="importMode = 'replace'">
            <RadioButton
              id="replace-mode"
              v-model="importMode"
              value="replace"
              name="importMode"
            />
            <label for="replace-mode" class="import-mode-label">
              <span class="import-mode-name">覆盖现有</span>
              <span class="import-mode-desc">清空全部现有收藏，然后导入新数据（此操作不可恢复）</span>
            </label>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="取消"
          severity="secondary"
          outlined
          @click="closeImportDialog"
        />
        <Button
          label="确认导入"
          icon="pi pi-check"
          @click="confirmImport"
        />
      </template>
    </Dialog>
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

.borrow-info-card {
  border-radius: var(--p-border-radius);
  border: 1px solid var(--p-orange-200);
  background: var(--p-orange-50);
  padding: 0.875rem 1rem;
}

.borrow-info-card.overdue {
  border-color: var(--p-red-200);
  background: var(--p-red-50);
}

.borrow-info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.borrow-info-icon {
  color: var(--p-orange-500);
  font-size: 1rem;
}

.borrow-info-card.overdue .borrow-info-icon {
  color: var(--p-red-500);
}

.borrow-info-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--p-text-color);
  flex: 1;
}

.borrow-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
}

.borrow-info-return {
  grid-column: span 2;
}

.borrow-info-label {
  display: block;
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  font-weight: 500;
  margin-bottom: 0.125rem;
}

.borrow-info-value {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.overdue-days-tip {
  color: var(--p-red-500);
  font-size: 0.8rem;
  font-weight: 700;
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

.borrow-btn-wrapper {
  position: relative;
  display: inline-flex;
}

.borrow-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  background: var(--p-red-500);
  border-radius: 999px;
  z-index: 1;
}

.borrow-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.borrow-album-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--p-surface-50);
  border-radius: var(--p-border-radius);
}

.borrow-cover {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.borrow-album-text {
  min-width: 0;
  flex: 1;
}

.borrow-album-title {
  margin: 0 0 0.25rem;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.borrow-album-artist {
  margin: 0;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-label {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.sort-dropdown {
  min-width: 140px;
}

.import-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.import-info-card {
  display: flex;
  gap: 0.875rem;
  padding: 1rem;
  background: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  border: 1px solid var(--p-content-border-color);
}

.import-info-icon {
  font-size: 1.25rem;
  color: var(--p-primary-color);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.import-info-text {
  flex: 1;
  min-width: 0;
}

.import-info-title {
  margin: 0 0 0.25rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.import-info-detail {
  margin: 0;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  line-height: 1.6;
}

.import-mode-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.import-mode-title {
  margin: 0;
  font-weight: 600;
  color: var(--p-text-color);
}

.import-mode-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.import-mode-option:hover {
  border-color: var(--p-primary-color);
  background: var(--p-surface-50);
}

.import-mode-option :deep(.p-radiobutton) {
  margin-top: 0.125rem;
}

.import-mode-label {
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.import-mode-name {
  font-weight: 600;
  color: var(--p-text-color);
}

.import-mode-desc {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  line-height: 1.5;
}
</style>
