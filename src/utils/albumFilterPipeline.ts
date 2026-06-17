import { computed, type Ref, watch, type ComputedRef } from 'vue'
import type { Album, FilterType, GenreFilterType, SortOptionValue } from '@/types/album'
import {
  filterBySource,
  filterByGenre,
  filterByStarred,
  searchAlbums,
  sortAlbums,
  extractUniqueGenres,
} from '@/utils/search'

export interface AlbumFilterPipelineState {
  searchQuery: Ref<string>
  filterType: Ref<FilterType>
  genreFilter: Ref<GenreFilterType>
  sortOption: Ref<SortOptionValue>
  starredOnly: Ref<boolean>
}

export interface GenreOption {
  label: string
  value: GenreFilterType
}

export interface AlbumFilterPipelineResult {
  preGenreAlbums: ComputedRef<Album[]>
  genreOptions: ComputedRef<GenreOption[]>
  displayAlbums: ComputedRef<Album[]>
}

export function useAlbumFilterPipeline(
  allAlbums: Ref<Album[]> | ComputedRef<Album[]>,
  state: AlbumFilterPipelineState,
): AlbumFilterPipelineResult {
  const preGenreAlbums = computed(() => {
    let result = filterBySource(allAlbums.value, state.filterType.value)
    result = searchAlbums(result, state.searchQuery.value)
    return result
  })

  const genreOptions = computed<GenreOption[]>(() => {
    const uniqueGenres = extractUniqueGenres(preGenreAlbums.value)
    const options: GenreOption[] = [{ label: '全部风格', value: 'all' as GenreFilterType }]
    for (const genre of uniqueGenres) {
      options.push({ label: genre, value: genre as GenreFilterType })
    }
    return options
  })

  const displayAlbums = computed(() => {
    let result = preGenreAlbums.value
    result = filterByGenre(result, state.genreFilter.value)
    result = filterByStarred(result, state.starredOnly.value)
    if (state.sortOption.value !== 'default') {
      const [field, order] = state.sortOption.value.split('-') as [string, string]
      result = sortAlbums(result, field as any, order as any)
    }
    return result
  })

  watch(genreOptions, (options) => {
    const availableValues = options.map((o) => o.value)
    if (!availableValues.includes(state.genreFilter.value)) {
      state.genreFilter.value = 'all'
    }
  })

  return {
    preGenreAlbums,
    genreOptions,
    displayAlbums,
  }
}

export function createDefaultFilterState(): {
  label: string
  value: FilterType
}[] {
  return [
    { label: '全部', value: 'all' as FilterType },
    { label: '示例专辑', value: 'mock' as FilterType },
    { label: '我的收藏', value: 'personal' as FilterType },
  ]
}

export function createDefaultSortOptions(): {
  label: string
  value: SortOptionValue
}[] {
  return [
    { label: '默认排序', value: 'default' as SortOptionValue },
    { label: '专辑名升序', value: 'title-asc' as SortOptionValue },
    { label: '专辑名降序', value: 'title-desc' as SortOptionValue },
    { label: '艺人升序', value: 'artist-asc' as SortOptionValue },
    { label: '艺人降序', value: 'artist-desc' as SortOptionValue },
    { label: '购入价升序', value: 'purchasePrice-asc' as SortOptionValue },
    { label: '购入价降序', value: 'purchasePrice-desc' as SortOptionValue },
    { label: '年份升序', value: 'year-asc' as SortOptionValue },
    { label: '年份降序', value: 'year-desc' as SortOptionValue },
  ]
}
