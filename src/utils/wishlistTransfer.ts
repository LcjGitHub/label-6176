import { useCollectionStore } from '@/stores/collection'
import { useWishlistStore } from '@/stores/wishlist'
import type { WishlistItem } from '@/types/wishlist'

export function transferToCollection(item: WishlistItem): boolean {
  const collectionStore = useCollectionStore()
  const wishlistStore = useWishlistStore()

  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  collectionStore.addAlbum({
    title: item.title,
    artist: item.artist,
    catalogNumber: item.catalogNumber,
    genre: '未分类',
    purchasePrice: item.expectedPrice,
    purchaseDate: dateStr,
  })

  return wishlistStore.removeItem(item.id)
}
