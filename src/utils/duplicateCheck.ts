import type { DuplicateCheckResult, PersonalAlbumForm } from '@/types/album'

export interface DuplicateCheckOptions {
  artist: string
  catalogNumber: string
  excludeId?: string
}

export function checkDuplicateAlbum(
  form: PersonalAlbumForm,
  existsFn: (artist: string, catalogNumber: string, excludeId?: string) => DuplicateCheckResult,
  excludeId?: string,
): DuplicateCheckResult {
  return existsFn(form.artist, form.catalogNumber, excludeId)
}

export function buildDuplicateMessage(result: DuplicateCheckResult): string {
  if (!result.isDuplicate) return ''
  const existing = result.existingTitle ? `（已存在专辑「${result.existingTitle}」）` : ''
  return `艺人「${result.artist}」下已存在编号为「${result.catalogNumber}」的专辑${existing}，请确认是否重复录入。`
}
