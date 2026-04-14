import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
// import Profile from './pages/Profile'
import PrivateRoute from './components/privateRoutes'
import '../src/styles/main.css'

function App() {
  return (
    <Routes>
      {/* Redirect default ke login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* Protected routes */}
      {/* <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } /> */}

      {/* 404 */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  )
}

export default App