import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: false,
})

// Attach token automatically from Zustand persisted storage
API.interceptors.request.use((config) => {
  try {
    const persisted = localStorage.getItem('auth-storage')
    if (persisted) {
      const { state } = JSON.parse(persisted)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    }
  } catch {
    // Malformed storage — proceed without token
  }
  return config
})

export default API