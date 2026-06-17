import { defineStore } from 'pinia'
import type { WishlistItem, WishlistItemForm } from '@/types/wishlist'

function createId(): string {
  return `wishlist-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [] as WishlistItem[],
  }),

  getters: {
    totalCount(): number {
      return this.items.length
    },

    totalExpectedAmount(): number {
      return this.items.reduce((sum, item) => sum + item.expectedPrice, 0)
    },
  },

  actions: {
    addItem(form: WishlistItemForm): WishlistItem {
      const item: WishlistItem = {
        id: createId(),
        title: form.title.trim(),
        artist: form.artist.trim(),
        catalogNumber: form.catalogNumber.trim(),
        expectedPrice: form.expectedPrice ?? 0,
        createdAt: Date.now(),
      }
      this.items.push(item)
      return item
    },

    removeItem(id: string): boolean {
      const index = this.items.findIndex((i) => i.id === id)
      if (index === -1) return false
      this.items.splice(index, 1)
      return true
    },

    getItemById(id: string): WishlistItem | undefined {
      return this.items.find((i) => i.id === id)
    },
  },

  persist: {
    pick: ['items'],
  },
})
