import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Dashboard from './pages/admin/Dashboard'
import TambahFasilitas from './pages/admin/TambahFasilitas'

import './styles/main.css'
import Fasilitas from './pages/admin/Fasilitas'

function App() {

  // ambil auth dari localStorage
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const isAdmin = token && user?.role_id === 1
  const isUser = token && user?.role_id !== 1

  return (
    <Routes>

      {/* default */}
      <Route path="/" element={<Navigate to="/home" />} />

      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* USER ROUTE */}
      <Route
        path="/home"
        element={
          token
            ? (isAdmin
                ? <Navigate to="/admin/dashboard" />
                : <Home />)
            : <Navigate to="/login" />
        }
      />

      {/* ADMIN ROUTE */}
      <Route
        path="/admin/dashboard"
        element={
          token
            ? (isAdmin
                ? <Dashboard />
                : <Navigate to="/home" />)
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/admin/tambahFasilitas"
        element={
          token
            ? (isAdmin
                ? <TambahFasilitas />
                : <Navigate to="/home" />)
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/admin/fasilitas"
        element={
          token
            ? (isAdmin
                ? <Fasilitas />
                : <Navigate to="/home" />)
            : <Navigate to="/login" />
        }
      />
      <Route
      path="/admin/fasilitas/edit/:id"
      element={
        token
          ? (isAdmin
              ? <TambahFasilitas />
              : <Navigate to="/home" />)
          : <Navigate to="/login" />
      }
    />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex h-screen items-center justify-center">
            <h1 className="text-2xl font-bold text-red-500">
              404 - Halaman Tidak Ditemukan
            </h1>
          </div>
        }
      />

    </Routes>
  )
}

export default App