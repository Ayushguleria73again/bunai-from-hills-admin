import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHome, 
  faShoppingBag, 
  faBox, 
  faUsers, 
  faImages,
  faFile,
  faSignOutAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'

const Navigation = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: faHome },
    { path: '/products', label: 'Products', icon: faShoppingBag },
    { path: '/gallery', label: 'Gallery', icon: faImages },
    { path: '/blog', label: 'Blog', icon: faFile },
    { path: '/orders', label: 'Orders', icon: faBox },
    { path: '/customers', label: 'Customers', icon: faUsers },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-white shadow-md"
        >
          <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:shadow-none md:w-64`}
      >
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-green-800">Bunai Admin</h1>
          <p className="text-sm text-gray-500">Management Panel</p>
        </div>
        
        <div className="flex flex-col justify-between h-[calc(100%-120px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-green-100 text-green-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main content padding for mobile */}
      <div className="md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-6">
          {/* This will be filled with the page content */}
        </div>
      </div>
    </>
  )
}

export default Navigation