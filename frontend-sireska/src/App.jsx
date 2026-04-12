import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Routes>
      {/* redirect default ke login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* halaman */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* fallback kalau route nggak ada */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  )
}

export default App