/**
 * 借阅记录状态
 */
export type BorrowStatus = 'borrowed' | 'returned' | 'overdue'

/**
 * 借阅记录
 */
export interface BorrowRecord {
  id: string
  albumId: string
  albumTitle: string
  albumArtist: string
  albumCatalogNumber: string
  borrowerName: string
  borrowDate: string
  expectedReturnDate: string
  actualReturnDate?: string
  status: BorrowStatus
  createdAt: number
}

/**
 * 发起借阅表单
 */
export interface BorrowForm {
  borrowerName: string
  borrowDate: string
  expectedReturnDate: string
}
