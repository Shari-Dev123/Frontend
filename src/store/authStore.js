import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password, deviceInfo) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
            deviceInfo
          })
          
          const { token, user } = response.data
          
          // Set default auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          return { success: true }
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Login failed',
            isLoading: false 
          })
          return { success: false, error: error.response?.data?.message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post(`${API_URL}/auth/register`, userData)
          set({ isLoading: false })
          return { success: true, data: response.data }
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false 
          })
          return { success: false, error: error.response?.data?.message }
        }
      },

      logout: async () => {
        try {
          await axios.post(`${API_URL}/auth/logout`)
        } catch (error) {
          console.error('Logout error:', error)
        }
        
        delete axios.defaults.headers.common['Authorization']
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null 
        })
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)