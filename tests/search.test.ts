import { describe, it, expect } from 'vitest'
import { filterBySource, filterByGenre, sortAlbums } from '@/utils/search'
import type { Album } from '@/types/album'

const mockAlbums: Album[] = [
  {
    id: '1',
    title: '专辑A',
    artist: '艺人A',
    catalogNumber: 'CAT-001',
    year: 2020,
    genre: 'Pop',
    purchasePrice: 100,
    source: 'mock',
  },
  {
    id: '2',
    title: '专辑B',
    artist: '艺人B',
    catalogNumber: 'CAT-002',
    year: 2021,
    genre: 'Rock',
    purchasePrice: 150,
    source: 'personal',
  },
  {
    id: '3',
    title: '专辑C',
    artist: '艺人C',
    catalogNumber: 'CAT-003',
    year: 2019,
    genre: 'Jazz',
    source: 'personal',
  },
  {
    id: '4',
    title: '专辑D',
    artist: '艺人D',
    catalogNumber: 'CAT-004',
    year: 2022,
    genre: 'Pop',
    purchasePrice: 80,
    source: 'mock',
  },
  {
    id: '5',
    title: '专辑E',
    artist: '艺人E',
    catalogNumber: 'CAT-005',
    year: 2018,
    genre: 'Rock',
    source: 'personal',
  },
]

describe('filterBySource', () => {
  it('正常情况：筛选 mock 来源的专辑', () => {
    const result = filterBySource(mockAlbums, 'mock')
    expect(result.length).toBe(2)
    expect(result.every((a) => a.source === 'mock')).toBe(true)
    expect(result.map((a) => a.id)).toEqual(['1', '4'])
  })

  it('正常情况：筛选 personal 来源的专辑', () => {
    const result = filterBySource(mockAlbums, 'personal')
    expect(result.length).toBe(3)
    expect(result.every((a) => a.source === 'personal')).toBe(true)
    expect(result.map((a) => a.id)).toEqual(['2', '3', '5'])
  })

  it('边界情况：筛选 all 时返回全部专辑', () => {
    const result = filterBySource(mockAlbums, 'all')
    expect(result.length).toBe(5)
    expect(result).toEqual(mockAlbums)
  })

  it('边界情况：空数组输入返回空数组', () => {
    const result = filterBySource([], 'mock')
    expect(result).toEqual([])
  })

  it('边界情况：无匹配来源时返回空数组', () => {
    const personalAlbums = mockAlbums.filter((a) => a.source === 'personal')
    const result = filterBySource(personalAlbums, 'mock')
    expect(result).toEqual([])
  })
})

describe('filterByGenre', () => {
  it('正常情况：筛选 Pop 风格的专辑', () => {
    const result = filterByGenre(mockAlbums, 'Pop')
    expect(result.length).toBe(2)
    expect(result.every((a) => a.genre === 'Pop')).toBe(true)
    expect(result.map((a) => a.id)).toEqual(['1', '4'])
  })

  it('正常情况：筛选 Rock 风格的专辑', () => {
    const result = filterByGenre(mockAlbums, 'Rock')
    expect(result.length).toBe(2)
    expect(result.every((a) => a.genre === 'Rock')).toBe(true)
  })

  it('边界情况：筛选 all 时返回全部专辑', () => {
    const result = filterByGenre(mockAlbums, 'all')
    expect(result.length).toBe(5)
    expect(result).toEqual(mockAlbums)
  })

  it('边界情况：空数组输入返回空数组', () => {
    const result = filterByGenre([], 'Pop')
    expect(result).toEqual([])
  })

  it('边界情况：无匹配风格时返回空数组', () => {
    const result = filterByGenre(mockAlbums, 'Classical')
    expect(result).toEqual([])
  })
})

describe('sortAlbums - 按购入价排序', () => {
  it('正常情况：升序排列，有购入价的按价格升序，无购入价的排在后面', () => {
    const result = sortAlbums(mockAlbums, 'purchasePrice', 'asc')
    const ids = result.map((a) => a.id)
    expect(ids.indexOf('4')).toBeLessThan(ids.indexOf('1'))
    expect(ids.indexOf('1')).toBeLessThan(ids.indexOf('2'))
    const noPriceIds = ['3', '5']
    const hasPriceIds = ['4', '1', '2']
    hasPriceIds.forEach((id) => {
      noPriceIds.forEach((noPriceId) => {
        expect(ids.indexOf(id)).toBeLessThan(ids.indexOf(noPriceId))
      })
    })
  })

  it('正常情况：降序排列，有购入价的按价格降序，无购入价的排在后面', () => {
    const result = sortAlbums(mockAlbums, 'purchasePrice', 'desc')
    const ids = result.map((a) => a.id)
    expect(ids.indexOf('2')).toBeLessThan(ids.indexOf('1'))
    expect(ids.indexOf('1')).toBeLessThan(ids.indexOf('4'))
    const noPriceIds = ['3', '5']
    const hasPriceIds = ['2', '1', '4']
    hasPriceIds.forEach((id) => {
      noPriceIds.forEach((noPriceId) => {
        expect(ids.indexOf(id)).toBeLessThan(ids.indexOf(noPriceId))
      })
    })
  })

  it('边界情况：全部都有购入价，按价格排序', () => {
    const albumsWithPrice = mockAlbums.filter(
      (a) => a.purchasePrice !== undefined && a.purchasePrice !== null,
    )
    const result = sortAlbums(albumsWithPrice, 'purchasePrice', 'asc')
    expect(result.map((a) => a.id)).toEqual(['4', '1', '2'])
    const resultDesc = sortAlbums(albumsWithPrice, 'purchasePrice', 'desc')
    expect(resultDesc.map((a) => a.id)).toEqual(['2', '1', '4'])
  })

  it('边界情况：全部都无购入价，顺序保持不变（稳定排序）', () => {
    const albumsWithoutPrice = mockAlbums.filter(
      (a) => a.purchasePrice === undefined || a.purchasePrice === null,
    )
    const result = sortAlbums(albumsWithoutPrice, 'purchasePrice', 'asc')
    expect(result.map((a) => a.id)).toEqual(['3', '5'])
  })

  it('边界情况：空数组输入返回空数组', () => {
    const result = sortAlbums([], 'purchasePrice', 'asc')
    expect(result).toEqual([])
  })

  it('边界情况：购入价为 0 的情况', () => {
    const albums: Album[] = [
      { id: 'a', title: 'A', artist: 'A', catalogNumber: 'A', purchasePrice: 0, source: 'mock' },
      { id: 'b', title: 'B', artist: 'B', catalogNumber: 'B', source: 'mock' },
      { id: 'c', title: 'C', artist: 'C', catalogNumber: 'C', purchasePrice: 100, source: 'mock' },
    ]
    const result = sortAlbums(albums, 'purchasePrice', 'asc')
    expect(result.map((a) => a.id)).toEqual(['a', 'c', 'b'])
  })
})
