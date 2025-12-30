import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on initial load
    const token = localStorage.getItem('adminToken')
    if (token) {
      // In a real app, you would verify the token with the backend
      // For now, we'll just set the user as authenticated if token exists
      setIsAuthenticated(true)
      // You might want to fetch user details here
      setUser({ id: 1, name: 'Admin', email: 'admin@bunaifromhills.com' })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // In a real app, you would make an API call to authenticate
    // For now, we'll simulate authentication
    if (email === 'admin@bunaifromhills.com' && password === 'admin123') {
      const token = 'fake-jwt-token' // This would come from your backend
      localStorage.setItem('adminToken', token)
      setIsAuthenticated(true)
      setUser({ id: 1, name: 'Admin', email })
      return { success: true, user: { id: 1, name: 'Admin', email } }
    } else {
      return { success: false, message: 'Invalid credentials' }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}