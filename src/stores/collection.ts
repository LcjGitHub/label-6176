import { defineStore } from 'pinia'
import type { Album, PersonalAlbumForm, CollectionStats, GenreStat } from '@/types/album'
import { isDuplicateAlbum } from '@/utils/duplicateCheck'
import mockAlbums from '@/mock/albums.json'
import type { MockAlbum } from '@/types/album'

/**
 * 将 Mock 数据转为统一 Album 结构
 */
function toMockAlbum(item: MockAlbum): Album {
  return {
    id: item.id,
    title: item.title,
    artist: item.artist,
    catalogNumber: item.catalogNumber,
    year: item.year,
    genre: item.genre,
    source: 'mock',
  }
}

/**
 * 生成唯一 ID
 */
function createId(): string {
  return `personal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useCollectionStore = defineStore('collection', {
  state: () => ({
    personalAlbums: [] as Album[],
  }),

  getters: {
    /** Mock 示例专辑列表 */
    mockAlbums(): Album[] {
      return (mockAlbums as MockAlbum[]).map(toMockAlbum)
    },

    /** 全部专辑（Mock + 个人收藏） */
    allAlbums(): Album[] {
      return [...this.mockAlbums, ...this.personalAlbums]
    },

    /** 个人收藏总张数 */
    personalTotalCount(): number {
      return this.personalAlbums.length
    },

    /** 个人收藏购入总金额 */
    personalTotalAmount(): number {
      return this.personalAlbums.reduce((sum, album) => sum + (album.purchasePrice ?? 0), 0)
    },

    /** 按音乐风格分组的数量列表（仅个人收藏） */
    genreStats(): GenreStat[] {
      const map = new Map<string, number>()
      for (const album of this.personalAlbums) {
        if (album.genre) {
          map.set(album.genre, (map.get(album.genre) ?? 0) + 1)
        }
      }
      return Array.from(map.entries())
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
    },

    /** 收藏统计汇总 */
    collectionStats(): CollectionStats {
      return {
        totalCount: this.personalTotalCount,
        totalAmount: this.personalTotalAmount,
        genreStats: this.genreStats,
      }
    },
  },

  actions: {
    /**
     * 添加个人收藏
     */
    addAlbum(form: PersonalAlbumForm): Album {
      const album: Album = {
        id: createId(),
        title: form.title.trim(),
        artist: form.artist.trim(),
        catalogNumber: form.catalogNumber.trim(),
        genre: form.genre.trim(),
        purchasePrice: form.purchasePrice ?? 0,
        purchaseDate: form.purchaseDate,
        source: 'personal',
        starred: false,
      }
      this.personalAlbums.push(album)
      return album
    },

    /**
     * 更新个人收藏
     */
    updateAlbum(id: string, form: PersonalAlbumForm): boolean {
      const index = this.personalAlbums.findIndex((a) => a.id === id)
      if (index === -1) return false

      this.personalAlbums[index] = {
        ...this.personalAlbums[index],
        title: form.title.trim(),
        artist: form.artist.trim(),
        catalogNumber: form.catalogNumber.trim(),
        genre: form.genre.trim(),
        purchasePrice: form.purchasePrice ?? 0,
        purchaseDate: form.purchaseDate,
      }
      return true
    },

    /**
     * 删除个人收藏
     */
    removeAlbum(id: string): boolean {
      const index = this.personalAlbums.findIndex((a) => a.id === id)
      if (index === -1) return false
      this.personalAlbums.splice(index, 1)
      return true
    },

    toggleStar(id: string): boolean {
      const album = this.personalAlbums.find((a) => a.id === id)
      if (!album) return false
      album.starred = !album.starred
      return true
    },

    /**
     * 根据 ID 获取专辑
     */
    getAlbumById(id: string): Album | undefined {
      return this.allAlbums.find((a) => a.id === id)
    },

    /**
     * 根据艺人+编号查找个人收藏中的匹配专辑
     * excludeId 用于编辑场景排除自身
     */
    findAlbumByArtistAndCatalogNumber(artist: string, catalogNumber: string, excludeId?: string): Album | undefined {
      const trimmedArtist = artist.trim().toLowerCase()
      const trimmedCatalog = catalogNumber.trim().toLowerCase()
      return this.personalAlbums.find((a) => {
        if (excludeId && a.id === excludeId) return false
        return a.artist.trim().toLowerCase() === trimmedArtist && a.catalogNumber.trim().toLowerCase() === trimmedCatalog
      })
    },

    /**
     * 批量写入个人收藏（追加模式）
     */
    batchAddAlbums(albums: Album[]): number {
      const existingIds = new Set(this.personalAlbums.map((a) => a.id))
      let addedCount = 0
      for (const album of albums) {
        if (album.source === 'personal' && !existingIds.has(album.id) && !isDuplicateAlbum(album, this.personalAlbums)) {
          this.personalAlbums.push(album)
          existingIds.add(album.id)
          addedCount++
        }
      }
      return addedCount
    },

    /**
     * 清空全部个人收藏
     */
    clearAllAlbums(): number {
      const count = this.personalAlbums.length
      this.personalAlbums = []
      return count
    },

    /**
     * 批量覆盖个人收藏（先清空再写入）
     */
    batchReplaceAlbums(albums: Album[]): { cleared: number; added: number } {
      const personalAlbums = albums.filter((a) => a.source === 'personal')
      const cleared = this.clearAllAlbums()
      const added = this.batchAddAlbums(personalAlbums)
      return { cleared, added }
    },
  },

  persist: {
    pick: ['personalAlbums'],
  },
})
