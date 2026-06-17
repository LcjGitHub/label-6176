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
  purchaseDate?: string
  source: AlbumSource
  starred?: boolean
}

/**
 * 个人收藏表单数据
 */
export interface PersonalAlbumForm {
  title: string
  artist: string
  catalogNumber: string
  genre: string
  purchasePrice: number | null
  purchaseDate: string
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
 * 风格筛选类型，'all' 表示不筛选，其他值为具体风格名称
 */
export type GenreFilterType = 'all' | string

/**
 * 排序字段
 */
export type SortField = 'title' | 'artist' | 'purchasePrice' | 'year'

/**
 * 排序方向
 */
export type SortOrder = 'asc' | 'desc'

/**
 * 合并排序选项值（字段+方向）
 */
export type SortOptionValue = 'default' | `${SortField}-${SortOrder}`

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

/**
 * 重复校验结果
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean
  artist: string
  catalogNumber: string
  existingTitle?: string
}
