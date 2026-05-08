import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import ChatBot from './components/ChatBot'
import Toast from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Login'
import Register from './components/Register'
import Jobs from './components/Jobs'
import JobDetail from './components/JobDetail'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import Unauthorized from './components/Unauthorized'
import useAuthStore from './store/useAuthStore'
import api from './api/axios'

function Layout() {
  const { setUser, setAuthChecked } = useAuthStore()

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUser(data.data))
      .catch(() => {})
      .finally(() => setAuthChecked())
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ChatBot />
      <Toast />
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/',              element: <Navigate to="/jobs" replace /> },
      { path: '/login',         element: <Login /> },
      { path: '/register',      element: <Register /> },
      { path: '/jobs',          element: <Jobs /> },
      { path: '/jobs/:id',      element: <JobDetail /> },
      { path: '/unauthorized',  element: <Unauthorized /> },
      {
        path: '/dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: '/profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      { path: '*', element: <Navigate to="/jobs" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
