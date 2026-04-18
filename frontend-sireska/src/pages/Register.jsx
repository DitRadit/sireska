import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoPutih from '../assets/logoPutih.png'
import sideImage from '../assets/Side Image.png' 
import authService from '../service/authService'

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nama_lengkap: '',
    nim_nip: '',
    email: '',
    password: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [popup, setPopup] = useState({ show: false, type: '', message: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.nama_lengkap || !form.email || !form.password) {
      alert('Nama, email, dan password wajib diisi')
      return
    }

    setLoading(true)
    try {
      await authService.register(
        form.nim_nip,
        form.nama_lengkap,
        form.email,
        form.password
      )
      setPopup({ 
        show: true, 
        type: 'success', 
        message: 'Your account has been successfully created. Please check your email for the OTP code.' 
      })
    } catch (err) {
      setPopup({ 
        show: true, 
        type: 'error', 
        message: err.response?.data?.message || 'Register gagal. Silakan coba lagi.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClosePopup = () => {
    if (popup.type === 'success') {
      navigate(`/verify-otp?email=${form.email}`)
    } else {
      setPopup({ show: false, type: '', message: '' })
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white font-sans relative">
      
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-4">
          
          {popup.type === 'success' && (
            <div className="bg-white rounded-[32px] p-8 md:p-10 w-full max-w-lg flex flex-col items-center text-center shadow-2xl animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-[#1ac07f] flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h3>
              
              <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-sm">
                {popup.message}
              </p>
              
              <button
                onClick={handleClosePopup}
                className="w-full py-3.5 bg-[#fe6d0d] hover:bg-[#e7600b] text-white font-semibold rounded-lg transition-colors text-lg"
              >
                Continue
              </button>
            </div>
          )}

          {popup.type === 'error' && (
             <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Registrasi Gagal</h3>
              <p className="text-gray-500 text-sm mt-2 mb-6 leading-relaxed">{popup.message}</p>
              <button
                onClick={handleClosePopup}
                className="w-full py-3 rounded-lg font-semibold text-white bg-[#ff6b2c] hover:bg-[#e85a1f]"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      )}

      <div 
        className="w-full h-[35vh] md:h-screen md:w-1/2 flex items-center justify-center bg-cover bg-center relative"
        style={{ backgroundImage: `url('${sideImage}')` }}
      >
        <img src={logoPutih} alt="Logo SiResKa" className="w-52 md:w-80 h-auto relative z-10" />
      </div>

      <div className="flex-1 md:w-1/2 bg-white flex flex-col items-center justify-center p-8 -mt-8 md:mt-0 rounded-t-[32px] md:rounded-none relative z-20">
        
        <button className="hidden md:block absolute top-8 right-8 text-2xl font-bold text-black hover:text-gray-600">
          &lt;
        </button>

        <div className="w-full max-w-sm flex flex-col mt-2 md:mt-0">
          
          <h2 className="text-[#ff6b2c] text-3xl md:text-4xl font-bold mb-2 md:mb-3">Create an account</h2>
          <p className="text-gray-500 text-[10px] md:text-xs font-light mb-6 md:mb-8 leading-relaxed pr-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          </p>

          <div className="flex flex-col gap-3.5">

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] md:text-[11px] font-bold text-gray-800">Your name</label>
              <input
                type="text"
                name="nama_lengkap"
                placeholder="your name"
                value={form.nama_lengkap}
                onChange={handleChange}
                className="w-full px-4 py-2 md:py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] md:text-[11px] font-bold text-gray-800">Student id (optional)</label>
              <input
                type="text"
                name="nim_nip"
                placeholder="103012400000"
                value={form.nim_nip}
                onChange={handleChange}
                className="w-full px-4 py-2 md:py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] md:text-[11px] font-bold text-gray-800">Your email</label>
              <input
                type="email"
                name="email"
                placeholder="email@gmail.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 md:py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] md:text-[11px] font-bold text-gray-800">Create password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 md:py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-[#ff6b2c] hover:bg-[#e85a1f] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-500/20"
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
            
            <div className="w-px h-8 bg-gray-300"></div>

            <button className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <span className="text-sm font-bold text-gray-600">G</span>
            </button>
          </div>

          <div className="text-center mt-8 text-xs font-semibold text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#ff6b2c] hover:underline">Login</Link>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Register