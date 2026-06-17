import { defineStore } from 'pinia'
import type { Album, PersonalAlbumForm } from '@/types/album'
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
        purchasePrice: form.purchasePrice ?? 0,
        source: 'personal',
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
        purchasePrice: form.purchasePrice ?? 0,
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

    /**
     * 根据 ID 获取专辑
     */
    getAlbumById(id: string): Album | undefined {
      return this.allAlbums.find((a) => a.id === id)
    },
  },

  persist: {
    pick: ['personalAlbums'],
  },
})
