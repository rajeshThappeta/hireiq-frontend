import { create } from 'zustand'

const useFilterStore = create((set) => ({
  search: '',
  skills: [],

  setSearch: (search) => set({ search }),
  setSkills: (skills) => set({ skills }),
  reset: () => set({ search: '', skills: [] }),
}))

export default useFilterStore
