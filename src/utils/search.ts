import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Album, FilterType, GenreFilterType, SortField, SortOrder } from '@/types/album'

const fuseOptions: IFuseOptions<Album> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'artist', weight: 0.35 },
    { name: 'catalogNumber', weight: 0.25 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
}

/**
 * 按来源筛选专辑
 */
export function filterBySource(albums: Album[], filter: FilterType): Album[] {
  if (filter === 'mock') return albums.filter((a) => a.source === 'mock')
  if (filter === 'personal') return albums.filter((a) => a.source === 'personal')
  return albums
}

/**
 * 按风格筛选专辑
 */
export function filterByGenre(albums: Album[], genre: GenreFilterType): Album[] {
  if (genre === 'all') return albums
  return albums.filter((a) => a.genre === genre)
}

/**
 * 从专辑列表中提取去重后的风格列表（按字母排序）
 */
export function extractUniqueGenres(albums: Album[]): string[] {
  const genreSet = new Set<string>()
  for (const album of albums) {
    if (album.genre && album.genre.trim() !== '') {
      genreSet.add(album.genre)
    }
  }
  return [...genreSet].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
}

/**
 * 使用 fuse.js 模糊搜索专辑
 */
export function searchAlbums(albums: Album[], query: string): Album[] {
  const trimmed = query.trim()
  if (!trimmed) return albums

  const fuse = new Fuse(albums, fuseOptions)
  return fuse.search(trimmed).map((result) => result.item)
}

/**
 * 按指定字段和方向排序专辑
 */
export function sortAlbums(albums: Album[], field: SortField, order: SortOrder): Album[] {
  const sorted = [...albums].sort((a, b) => {
    let comparison = 0

    switch (field) {
      case 'title':
      case 'artist':
        comparison = a[field].localeCompare(b[field], 'zh-CN', { sensitivity: 'base' })
        break
      case 'purchasePrice': {
        const aHas = a.purchasePrice !== undefined && a.purchasePrice !== null
        const bHas = b.purchasePrice !== undefined && b.purchasePrice !== null
        if (aHas !== bHas) {
          comparison = aHas ? -1 : 1
        } else if (aHas && bHas) {
          comparison = a.purchasePrice! - b.purchasePrice!
        }
        break
      }
      case 'year': {
        const aVal = a.year ?? -Infinity
        const bVal = b.year ?? -Infinity
        comparison = aVal - bVal
        break
      }
    }

    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}
