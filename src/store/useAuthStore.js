import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  authChecked: false,

  setUser: (user) => set({ user }),

  logout: () => set({ user: null }),

  setAuthChecked: () => set({ authChecked: true }),
}))

export default useAuthStore
