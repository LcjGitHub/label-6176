export interface Species {
  id: string
  name: string
  scientificName: string
  imageUrl: string
}

export interface SightingRecord {
  id: string
  speciesId: string
  date: string
  location: string
  count: number
  notes: string
}
