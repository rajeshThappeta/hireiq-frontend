import { Link, NavLink, useNavigate } from 'react-router'
import { useState } from 'react'
import useAuthStore from '../store/useAuthStore'
import api from '../api/axios'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await api.post('/auth/logout')
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'
    }`

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-brand-600">HireIQ</span>
            <span className="hidden sm:inline text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
              AI-Powered
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/jobs" className={linkClass}>Find Jobs</NavLink>
            {user && <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>}
            {user && <NavLink to="/profile" className={linkClass}>Profile</NavLink>}
          </nav>

          {/* Auth actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Hi, <span className="font-semibold text-gray-800">{user.name}</span>
                </span>
                <span className="text-xs bg-navy-700 text-white px-2 py-0.5 rounded-full capitalize">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
            <NavLink to="/jobs" className="block px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 rounded-md" onClick={() => setMenuOpen(false)}>
              Find Jobs
            </NavLink>
            {user && (
              <>
                <NavLink to="/dashboard" className="block px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 rounded-md" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink to="/profile" className="block px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 rounded-md" onClick={() => setMenuOpen(false)}>
                  Profile
                </NavLink>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                  Logout
                </button>
              </>
            )}
            {!user && (
              <div className="flex gap-2 px-3 pt-2">
                <Link to="/login" className="flex-1 text-center text-sm font-medium border border-brand-600 text-brand-600 py-2 rounded-lg" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="flex-1 text-center text-sm font-semibold bg-brand-600 text-white py-2 rounded-lg" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
