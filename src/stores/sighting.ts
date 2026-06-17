import { defineStore } from 'pinia'
import type { Species, SightingRecord } from '@/types/species'
import mockData from '@/mock/sightings.json'

export interface SightingRecordWithSpecies {
  id: string
  speciesId: string
  speciesName: string
  scientificName: string
  date: string
  location: string
  count: number
  notes: string
}

export const useSightingStore = defineStore('sighting', {
  state: () => ({
    speciesList: mockData.species as Species[],
    sightings: mockData.sightings as SightingRecord[],
  }),

  getters: {
    allSpecies(): Species[] {
      return this.speciesList
    },

    totalSightingCount(): number {
      return this.sightings.length
    },

    speciesSightingCounts(): { speciesId: string; speciesName: string; count: number }[] {
      return this.speciesList.map((sp) => ({
        speciesId: sp.id,
        speciesName: sp.name,
        count: this.sightings.filter((s) => s.speciesId === sp.id).length,
      }))
    },
  },

  actions: {
    getSpeciesById(id: string): Species | undefined {
      return this.speciesList.find((sp) => sp.id === id)
    },

    getSightingsBySpeciesId(speciesId: string): SightingRecord[] {
      return this.sightings
        .filter((s) => s.speciesId === speciesId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },

    getTotalCountBySpeciesId(speciesId: string): number {
      return this.sightings
        .filter((s) => s.speciesId === speciesId)
        .reduce((sum, s) => sum + s.count, 0)
    },

    getAllSightingsSorted(): SightingRecordWithSpecies[] {
      const speciesMap = new Map(this.speciesList.map((sp) => [sp.id, sp]))
      return this.sightings
        .map((s) => {
          const sp = speciesMap.get(s.speciesId)
          return {
            ...s,
            speciesName: sp?.name ?? '未知',
            scientificName: sp?.scientificName ?? '',
          }
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
  },
})
