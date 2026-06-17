import { describe, it, expect } from 'vitest'
import { isDuplicateAlbum } from '@/utils/duplicateCheck'
import type { Album } from '@/types/album'

const existingAlbums: Album[] = [
  {
    id: '1',
    title: '专辑A',
    artist: '艺人A',
    catalogNumber: 'CAT-001',
    year: 2020,
    genre: 'Pop',
    source: 'personal',
  },
  {
    id: '2',
    title: '专辑B',
    artist: '艺人B',
    catalogNumber: 'CAT-002',
    year: 2021,
    genre: 'Rock',
    source: 'personal',
  },
  {
    id: '3',
    title: '专辑C',
    artist: '  艺人C  ',
    catalogNumber: '  CAT-003  ',
    year: 2019,
    genre: 'Jazz',
    source: 'personal',
  },
]

describe('isDuplicateAlbum', () => {
  it('正常情况：存在重复专辑（同艺人同编号），返回 true', () => {
    const album: Album = {
      id: 'new',
      title: '新专辑',
      artist: '艺人A',
      catalogNumber: 'CAT-001',
      source: 'personal',
    }
    const result = isDuplicateAlbum(album, existingAlbums)
    expect(result).toBe(true)
  })

  it('正常情况：不存在重复专辑，返回 false', () => {
    const album: Album = {
      id: 'new',
      title: '新专辑',
      artist: '新艺人',
      catalogNumber: 'NEW-001',
      source: 'personal',
    }
    const result = isDuplicateAlbum(album, existingAlbums)
    expect(result).toBe(false)
  })

  it('边界情况：忽略大小写匹配', () => {
    const album: Album = {
      id: 'new',
      title: '新专辑',
      artist: '艺人a',
      catalogNumber: 'cat-001',
      source: 'personal',
    }
    const result = isDuplicateAlbum(album, existingAlbums)
    expect(result).toBe(true)
  })

  it('边界情况：忽略前后空格匹配', () => {
    const album: Album = {
      id: 'new',
      title: '新专辑',
      artist: '  艺人C  ',
      catalogNumber: 'CAT-003',
      source: 'personal',
    }
    const result = isDuplicateAlbum(album, existingAlbums)
    expect(result).toBe(true)
  })

  it('边界情况：指定 excludeId 时排除自身', () => {
    const album: Album = {
      id: '1',
      title: '专辑A（修改版）',
      artist: '艺人A',
      catalogNumber: 'CAT-001',
      source: 'personal',
    }
    const resultWithExclude = isDuplicateAlbum(album, existingAlbums, '1')
    expect(resultWithExclude).toBe(false)
    const resultWithoutExclude = isDuplicateAlbum(album, existingAlbums)
    expect(resultWithoutExclude).toBe(true)
  })

  it('边界情况：空数组输入返回 false', () => {
    const album: Album = {
      id: 'new',
      title: '新专辑',
      artist: '艺人A',
      catalogNumber: 'CAT-001',
      source: 'personal',
    }
    const result = isDuplicateAlbum(album, [])
    expect(result).toBe(false)
  })

  it('边界情况：同艺人不同编号，返回 false', () => {
    const album: Album = {
      id: 'new',
      title: '新专辑',
      artist: '艺人A',
      catalogNumber: 'CAT-002',
      source: 'personal',
    }
    const result = isDuplicateAlbum(album, existingAlbums)
    expect(result).toBe(false)
  })

  it('边界情况：同编号不同艺人，返回 false', () => {
    const album: Album = {
      id: 'new',
      title: '新专辑',
      artist: '艺人B',
      catalogNumber: 'CAT-001',
      source: 'personal',
    }
    const result = isDuplicateAlbum(album, existingAlbums)
    expect(result).toBe(false)
  })
})
