import type { DuplicateCheckResult, PersonalAlbumForm, Album } from '@/types/album'

export function checkDuplicateAlbum(
  form: PersonalAlbumForm,
  findFn: (artist: string, catalogNumber: string, excludeId?: string) => Album | undefined,
  excludeId?: string,
): DuplicateCheckResult {
  const artist = form.artist.trim()
  const catalogNumber = form.catalogNumber.trim()
  const found = findFn(artist, catalogNumber, excludeId)
  return {
    isDuplicate: !!found,
    artist,
    catalogNumber,
    existingTitle: found?.title,
  }
}

export function isDuplicateAlbum(
  album: Album,
  existingAlbums: Album[],
  excludeId?: string,
): boolean {
  const artist = album.artist.trim().toLowerCase()
  const catalogNumber = album.catalogNumber.trim().toLowerCase()
  return existingAlbums.some((a) => {
    if (excludeId && a.id === excludeId) return false
    return a.artist.trim().toLowerCase() === artist && a.catalogNumber.trim().toLowerCase() === catalogNumber
  })
}

export function buildDuplicateMessage(result: DuplicateCheckResult): string {
  if (!result.isDuplicate) return ''
  const existing = result.existingTitle ? `（已存在专辑「${result.existingTitle}」）` : ''
  return `艺人「${result.artist}」下已存在编号为「${result.catalogNumber}」的专辑${existing}，请确认是否重复录入。`
}
