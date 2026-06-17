import { defineStore } from 'pinia'
import type { Species, SightingRecord } from '@/types/species'
import mockData from '@/mock/sightings.json'

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
  },
})
