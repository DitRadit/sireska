import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'

// Import Halaman User
import FasilitasUser from './pages/FasilitasUser' 
import BookingPage from './pages/BookingPage'  // <--- PASTIKAN SUDAH IMPORT INI
import PesananPage from './pages/PesananPage'  // <--- IMPORT HALAMAN PESANAN BARU

// Import Halaman Admin
import Dashboard from './pages/admin/Dashboard'
import TambahFasilitas from './pages/admin/TambahFasilitas'
import Fasilitas from './pages/admin/Fasilitas'

import './styles/main.css'
import FasilitasDetailPage from './pages/FasilitasDetailPage'
import DetailPesananPage from './pages/DetailPesananPage'
import AdminPemesananPage from './pages/admin/AdminPemesananPage'

function App() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const isAdmin = token && user?.role_id === 1

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />

      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* USER ROUTE */}
      <Route path="/home" element={token ? (isAdmin ? <Navigate to="/admin/dashboard" /> : <Home />) : <Navigate to="/login" />} />
      <Route path="/fasilitas" element={token ? (isAdmin ? <Navigate to="/admin/fasilitas" /> : <FasilitasUser />) : <Navigate to="/login" />} />
<Route
  path="/fasilitas/:id"
  element={
    token
      ? <FasilitasDetailPage />
      : <Navigate to="/login" />
  }
/>
<Route path="/pesanan/:id"   element={
    token
      ? <DetailPesananPage />
      : <Navigate to="/login" />
  } />
      
      {/* RUTE BOOKING (Mengarah ke komponen BookingPage) */}
      <Route path="/booking/:id" element={token ? (isAdmin ? <Navigate to="/admin/dashboard" /> : <BookingPage />) : <Navigate to="/login" />} />
      
      {/* RUTE PESANAN (Mengarah ke komponen PesananPage) */}
      <Route path="/pesanan" element={token ? (isAdmin ? <Navigate to="/admin/dashboard" /> : <PesananPage />) : <Navigate to="/login" />} />

      {/* ADMIN ROUTE */}
      <Route path="/admin/dashboard" element={token && isAdmin ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/admin/tambahFasilitas" element={token && isAdmin ? <TambahFasilitas /> : <Navigate to="/login" />} />
      <Route path="/admin/fasilitas" element={token && isAdmin ? <Fasilitas /> : <Navigate to="/login" />} />
      <Route path="/admin/reservasi" element={token && isAdmin ? <AdminPemesananPage /> : <Navigate to="/login" />} />
      <Route path="/admin/fasilitas/edit/:id" element={token && isAdmin ? <TambahFasilitas /> : <Navigate to="/login" />} />

      {/* 404 */}
      <Route path="*" element={<div className="flex h-screen items-center justify-center"><h1 className="text-2xl font-bold text-red-500">404 - Halaman Tidak Ditemukan</h1></div>} />
    </Routes>
  )
}

export default App