import { useCollectionStore } from '@/stores/collection'
import { useWishlistStore } from '@/stores/wishlist'
import type { WishlistItem } from '@/types/wishlist'

export function transferToCollection(item: WishlistItem): boolean {
  const collectionStore = useCollectionStore()
  const wishlistStore = useWishlistStore()

  collectionStore.addAlbum({
    title: item.title,
    artist: item.artist,
    catalogNumber: item.catalogNumber,
    genre: '未分类',
    purchasePrice: item.expectedPrice,
  })

  return wishlistStore.removeItem(item.id)
}
