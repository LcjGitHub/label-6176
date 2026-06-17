import { defineStore } from 'pinia'
import type { BorrowRecord, BorrowForm, BorrowStatus } from '@/types/borrow'
import type { Album } from '@/types/album'

function createId(): string {
  return `borrow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 检查日期是否逾期（预计归还日期早于今天且状态为借出中）
 */
function isOverdue(expectedReturnDate: string, status: BorrowStatus): boolean {
  if (status !== 'borrowed') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expected = new Date(expectedReturnDate)
  expected.setHours(0, 0, 0, 0)
  return expected.getTime() < today.getTime()
}

/**
 * 更新所有记录的逾期状态
 */
function refreshOverdueStatus(records: BorrowRecord[]): BorrowRecord[] {
  return records.map((r) => {
    if (r.status === 'borrowed' && isOverdue(r.expectedReturnDate, r.status)) {
      return { ...r, status: 'overdue' as BorrowStatus }
    }
    if (r.status === 'overdue' && !isOverdue(r.expectedReturnDate, 'borrowed')) {
      return { ...r, status: 'borrowed' as BorrowStatus }
    }
    return r
  })
}

export const useBorrowStore = defineStore('borrow', {
  state: () => ({
    records: [] as BorrowRecord[],
  }),

  getters: {
    /** 所有在借记录（借出中 + 逾期） */
    activeRecords(): BorrowRecord[] {
      const refreshed = refreshOverdueStatus(this.records)
      return refreshed.filter((r) => r.status === 'borrowed' || r.status === 'overdue')
    },

    /** 已逾期记录 */
    overdueRecords(): BorrowRecord[] {
      const refreshed = refreshOverdueStatus(this.records)
      return refreshed.filter((r) => r.status === 'overdue')
    },

    /** 已归还记录 */
    returnedRecords(): BorrowRecord[] {
      return this.records.filter((r) => r.status === 'returned')
    },

    /** 在借数量 */
    activeCount(): number {
      return this.activeRecords.length
    },

    /** 逾期数量 */
    overdueCount(): number {
      return this.overdueRecords.length
    },

    /**
     * 根据专辑 ID 获取在借记录（如果专辑正在借出）
     */
    getActiveByAlbumId: (state) => {
      return (albumId: string): BorrowRecord | undefined => {
        const refreshed = refreshOverdueStatus(state.records)
        return refreshed.find(
          (r) => r.albumId === albumId && (r.status === 'borrowed' || r.status === 'overdue')
        )
      }
    },

    /**
     * 检查专辑是否可借阅（个人收藏且当前无在借记录）
     */
    isAlbumAvailable: (state) => {
      return (albumId: string): boolean => {
        const refreshed = refreshOverdueStatus(state.records)
        return !refreshed.some(
          (r) => r.albumId === albumId && (r.status === 'borrowed' || r.status === 'overdue')
        )
      }
    },
  },

  actions: {
    /**
     * 刷新所有记录的逾期状态
     */
    refreshStatus() {
      this.records = refreshOverdueStatus(this.records)
    },

    /**
     * 发起借阅
     */
    createBorrow(album: Album, form: BorrowForm): BorrowRecord {
      const record: BorrowRecord = {
        id: createId(),
        albumId: album.id,
        albumTitle: album.title,
        albumArtist: album.artist,
        albumCatalogNumber: album.catalogNumber,
        borrowerName: form.borrowerName.trim(),
        borrowDate: form.borrowDate,
        expectedReturnDate: form.expectedReturnDate,
        status: isOverdue(form.expectedReturnDate, 'borrowed') ? 'overdue' : 'borrowed',
        createdAt: Date.now(),
      }
      this.records.push(record)
      return record
    },

    /**
     * 标记归还
     */
    markReturned(id: string, returnDate?: string): boolean {
      const index = this.records.findIndex((r) => r.id === id)
      if (index === -1) return false

      const today = returnDate || new Date().toISOString().split('T')[0]
      this.records[index] = {
        ...this.records[index],
        status: 'returned',
        actualReturnDate: today,
      }
      return true
    },

    /**
     * 删除借阅记录
     */
    removeRecord(id: string): boolean {
      const index = this.records.findIndex((r) => r.id === id)
      if (index === -1) return false
      this.records.splice(index, 1)
      return true
    },
  },

  persist: {
    pick: ['records'],
  },
})
