import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AdminProvider } from './context/AdminContext'
import { ToastProvider } from './context/ToastContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Gallery from './pages/Gallery'
import Blog from './pages/Blog'
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/products" 
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <Products />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customers" 
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <Customers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gallery" 
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <Gallery />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/blog" 
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <Blog />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </AdminProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App