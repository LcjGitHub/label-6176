import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Album, FilterType } from '@/types/album'

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
 * 使用 fuse.js 模糊搜索专辑
 */
export function searchAlbums(albums: Album[], query: string): Album[] {
  const trimmed = query.trim()
  if (!trimmed) return albums

  const fuse = new Fuse(albums, fuseOptions)
  return fuse.search(trimmed).map((result) => result.item)
}
