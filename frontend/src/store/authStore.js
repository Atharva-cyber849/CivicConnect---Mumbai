import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/authApi'
import { toast } from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Login
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login(credentials)
          const { access, refresh, user } = response.data

          localStorage.setItem('accessToken', access)
          localStorage.setItem('refreshToken', refresh)

          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success(`Welcome back${user.role !== 'CITIZEN' ? ', Officer' : ''}!`)
          return true
        } catch (error) {
          set({ isLoading: false })
          toast.error(error.response?.data?.detail || 'Login failed')
          return false
        }
      },

      // Register Citizen
      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register({ ...userData, role: 'CITIZEN' })
          const { access, refresh, user } = response.data

          localStorage.setItem('accessToken', access)
          localStorage.setItem('refreshToken', refresh)

          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success('Registration successful!')
          return true
        } catch (error) {
          set({ isLoading: false })
          const errorMsg = error.response?.data?.email?.[0] || 
                          error.response?.data?.detail || 
                          'Registration failed'
          toast.error(errorMsg)
          return false
        }
      },
      
      // Register Admin/Officer (Super Admin only)
      registerAdmin: async (adminData) => {
        set({ isLoading: true })
        try {
          // Check if user is super admin
          const { user } = get()
          if (!user || user.role !== 'ADMIN' || !user.is_superuser) {
            throw new Error('Unauthorized - Super Admin access required')
          }

          const response = await authApi.registerAdmin(adminData)
          set({ isLoading: false })
          
          toast.success(`${adminData.role === 'ADMIN' ? 'Admin' : 'Officer'} account created successfully!`)
          return true
        } catch (error) {
          set({ isLoading: false })
          const errorMsg = error.response?.data?.detail || error.message
          toast.error(errorMsg)
          return false
        }
      },

      // Logout
      logout: async () => {
        const { refreshToken } = get()
        try {
          if (refreshToken) {
            await authApi.logout(refreshToken)
          }
        } catch (error) {
          // Logout error handled
        } finally {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })

          toast.success('Logged out successfully')
        }
      },

      // Update user profile
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      // Update profile (with API call)
      updateProfile: async (profileData) => {
        set({ isLoading: true })
        try {
          // This would normally call an API to update profile
          // For now, just update local state
          const updatedUser = { ...get().user, ...profileData }
          
          set({ 
            user: updatedUser,
            isLoading: false 
          })
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser))
          
          toast.success('Profile updated successfully!')
          return true
        } catch (error) {
          set({ isLoading: false })
          toast.error('Failed to update profile')
          return false
        }
      },

      // Initialize from localStorage
      initialize: () => {
        const token = localStorage.getItem('accessToken')
        const user = localStorage.getItem('user')

        if (token && user) {
          set({
            accessToken: token,
            user: JSON.parse(user),
            isAuthenticated: true,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
