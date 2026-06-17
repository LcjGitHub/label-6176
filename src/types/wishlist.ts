export interface WishlistItem {
  id: string
  title: string
  artist: string
  catalogNumber: string
  expectedPrice: number
  createdAt: number
}

export interface WishlistItemForm {
  title: string
  artist: string
  catalogNumber: string
  expectedPrice: number | null
}
