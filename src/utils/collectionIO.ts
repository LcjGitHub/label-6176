import type { Album } from '@/types/album'

export const EXPORT_FILE_EXTENSION = '.json'
export const EXPORT_FILE_MIME_TYPE = 'application/json'

export interface CollectionExportData {
  version: string
  exportedAt: number
  data: Album[]
}

export type ImportMode = 'merge' | 'replace'

export interface ImportResult {
  success: boolean
  message: string
  addedCount?: number
  clearedCount?: number
}

const CURRENT_EXPORT_VERSION = '1.0'

function validateAlbum(album: unknown): album is Album {
  if (!album || typeof album !== 'object') return false

  const a = album as Record<string, unknown>

  if (typeof a.id !== 'string' || a.id.trim() === '') return false
  if (typeof a.title !== 'string' || a.title.trim() === '') return false
  if (typeof a.artist !== 'string' || a.artist.trim() === '') return false
  if (typeof a.catalogNumber !== 'string' || a.catalogNumber.trim() === '') return false
  if (a.source !== 'personal') return false

  if (a.year !== undefined && typeof a.year !== 'number') return false
  if (a.genre !== undefined && typeof a.genre !== 'string') return false
  if (a.purchasePrice !== undefined && typeof a.purchasePrice !== 'number') return false

  return true
}

function validateExportData(data: unknown): data is CollectionExportData {
  if (!data || typeof data !== 'object') return false

  const d = data as Record<string, unknown>

  if (d.version !== CURRENT_EXPORT_VERSION) return false
  if (typeof d.exportedAt !== 'number') return false
  if (!Array.isArray(d.data)) return false

  return d.data.every(validateAlbum)
}

function generateFileName(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
  return `vinyl-collection-${dateStr}-${timeStr}${EXPORT_FILE_EXTENSION}`
}

export function exportCollection(albums: Album[]): void {
  const personalAlbums = albums.filter((a) => a.source === 'personal')

  const exportData: CollectionExportData = {
    version: CURRENT_EXPORT_VERSION,
    exportedAt: Date.now(),
    data: personalAlbums,
  }

  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: EXPORT_FILE_MIME_TYPE })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = generateFileName()
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function parseImportFile(file: File): Promise<CollectionExportData> {
  return new Promise((resolve, reject) => {
    if (!file.name.toLowerCase().endsWith(EXPORT_FILE_EXTENSION)) {
      reject(new Error('请选择正确的 JSON 数据文件'))
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        if (!validateExportData(data)) {
          reject(new Error('数据文件格式不正确或已损坏'))
          return
        }

        resolve(data)
      } catch {
        reject(new Error('文件解析失败，请确保文件格式正确'))
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsText(file)
  })
}

export function getAlbumsFromExportData(exportData: CollectionExportData): Album[] {
  return exportData.data
}

export function getExportSummary(exportData: CollectionExportData): {
  count: number
  date: string
} {
  return {
    count: exportData.data.length,
    date: new Date(exportData.exportedAt).toLocaleString('zh-CN'),
  }
}
