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

interface ValidationResult {
  valid: boolean
  error?: string
}

function validateAlbum(album: unknown, index: number): ValidationResult {
  if (!album || typeof album !== 'object') {
    return { valid: false, error: `第 ${index + 1} 条数据格式不正确` }
  }

  const a = album as Record<string, unknown>

  if (typeof a.id !== 'string' || a.id.trim() === '') {
    return { valid: false, error: `第 ${index + 1} 条数据缺少有效的 id 字段` }
  }
  if (typeof a.title !== 'string' || a.title.trim() === '') {
    return { valid: false, error: `第 ${index + 1} 条数据缺少专辑名（title）` }
  }
  if (typeof a.artist !== 'string' || a.artist.trim() === '') {
    return { valid: false, error: `第 ${index + 1} 条数据缺少艺人（artist）` }
  }
  if (typeof a.catalogNumber !== 'string' || a.catalogNumber.trim() === '') {
    return { valid: false, error: `第 ${index + 1} 条数据缺少编号（catalogNumber）` }
  }
  if (typeof a.genre !== 'string' || a.genre.trim() === '') {
    return { valid: false, error: `第 ${index + 1} 条数据缺少风格（genre）` }
  }
  if (typeof a.purchasePrice !== 'number' || a.purchasePrice < 0) {
    return { valid: false, error: `第 ${index + 1} 条数据缺少有效的购入价（purchasePrice，需为非负数）` }
  }
  if (a.source !== 'personal') {
    return { valid: false, error: `第 ${index + 1} 条数据来源（source）必须为 personal` }
  }

  if (a.year !== undefined && typeof a.year !== 'number') {
    return { valid: false, error: `第 ${index + 1} 条数据年份（year）格式不正确` }
  }

  return { valid: true }
}

function validateExportData(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: '数据文件格式不正确' }
  }

  const d = data as Record<string, unknown>

  if (d.version !== CURRENT_EXPORT_VERSION) {
    return { valid: false, error: `数据版本不兼容，当前支持版本 ${CURRENT_EXPORT_VERSION}` }
  }
  if (typeof d.exportedAt !== 'number') {
    return { valid: false, error: '数据缺少导出时间戳' }
  }
  if (!Array.isArray(d.data)) {
    return { valid: false, error: '数据格式不正确，缺少 data 数组' }
  }

  for (let i = 0; i < d.data.length; i++) {
    const result = validateAlbum(d.data[i], i)
    if (!result.valid) {
      return result
    }
  }

  return { valid: true }
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

        const validation = validateExportData(data)
        if (!validation.valid) {
          reject(new Error(`导入失败：${validation.error}`))
          return
        }

        resolve(data as CollectionExportData)
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
