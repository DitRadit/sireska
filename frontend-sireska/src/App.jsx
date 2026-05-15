import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import ForgotPassword from './pages/ForgotPassword' 
import Home from './pages/Home'
// PENTING: Pastikan path CSS ini benar. Kalau file App.jsx ada di dalam folder src,
// biasanya cukup import './styles/main.css'
import './styles/main.css' 

function App() {
  return (
    <Routes>
      {/* Ubah "/Home" menjadi "/home" huruf kecil semua */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Fallback jika URL tidak ditemukan */}
      <Route path="*" element={
        <div className="flex h-screen items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">404 - Halaman Tidak Ditemukan</h1>
        </div>
      } />
    </Routes>
  )
}

export default App