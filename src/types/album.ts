/**
 * 专辑来源：Mock 示例或个人收藏
 */
export type AlbumSource = 'mock' | 'personal'

/**
 * 统一展示的专辑数据
 */
export interface Album {
  id: string
  title: string
  artist: string
  catalogNumber: string
  year?: number
  genre?: string
  purchasePrice?: number
  source: AlbumSource
}

/**
 * 个人收藏表单数据
 */
export interface PersonalAlbumForm {
  title: string
  artist: string
  catalogNumber: string
  purchasePrice: number | null
}

/**
 * Mock 专辑 JSON 结构
 */
export interface MockAlbum {
  id: string
  title: string
  artist: string
  catalogNumber: string
  year: number
  genre: string
}

/**
 * 列表筛选类型
 */
export type FilterType = 'all' | 'mock' | 'personal'

/**
 * 按风格分组的统计项
 */
export interface GenreStat {
  genre: string
  count: number
}

/**
 * 收藏统计结果
 */
export interface CollectionStats {
  totalCount: number
  totalAmount: number
  genreStats: GenreStat[]
}
