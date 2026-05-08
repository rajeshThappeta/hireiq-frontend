import { create } from 'zustand'

const useToastStore = create((set) => ({
  message: '',
  type: 'info',
  show: (message, type = 'info') => set({ message, type }),
  hide: () => set({ message: '' }),
}))

export default useToastStore
