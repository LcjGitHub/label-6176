import Fuse, { type IFuseOptions } from 'fuse.js'
import type { WishlistItem } from '@/types/wishlist'

const fuseOptions: IFuseOptions<WishlistItem> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'artist', weight: 0.35 },
    { name: 'catalogNumber', weight: 0.25 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
}

export function searchWishlist(items: WishlistItem[], query: string): WishlistItem[] {
  const trimmed = query.trim()
  if (!trimmed) return items

  const fuse = new Fuse(items, fuseOptions)
  return fuse.search(trimmed).map((result) => result.item)
}
