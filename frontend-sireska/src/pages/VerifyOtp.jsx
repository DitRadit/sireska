import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import authService from '../service/authService'
import logoPutih from '../assets/logoPutih.png'
import sideImage from '../assets/Side Image.png'

const VerifyOtp = () => {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const navigate = useNavigate()

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [popup, setPopup] = useState({ show: false, type: '', message: '' })

  const handleVerify = async () => {
    if (!otp) {
      alert('Kode OTP wajib diisi terlebih dahulu.')
      return
    }

    setLoading(true)
    try {
      await authService.verifyOtp(email, otp)
      setPopup({ 
        show: true, 
        type: 'success', 
        message: 'Your account has been successfully verified.' 
      })
    } catch (err) {
      setPopup({ 
        show: true, 
        type: 'error', 
        message: err.response?.data?.message || 'Kode OTP salah atau sudah kadaluarsa. Silakan coba lagi.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await authService.resendOtp(email)
      setPopup({ 
        show: true, 
        type: 'success', 
        message: 'Kode OTP berhasil dikirim ulang. Jangan lupa cek kotak masuk atau folder spam email kamu.' 
      })
    } catch (err) {
      setPopup({ 
        show: true, 
        type: 'error', 
        message: err.response?.data?.message || 'Terjadi kesalahan saat mengirim ulang OTP.' 
      })
    }
  }

  const handleClosePopup = () => {
    if (popup.type === 'success') {
      navigate('/login')
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
                Your account has been successfully verified.
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
              <h3 className="text-xl font-bold text-gray-800">Verifikasi Gagal</h3>
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

        <div className="w-full max-w-sm flex flex-col mt-2 md:mt-0">

          <h2 className="text-[#ff6b2c] text-3xl md:text-4xl font-bold mb-2">Verifikasi OTP</h2>
          <p className="text-gray-500 text-xs font-light mb-8 leading-relaxed">
            Kode OTP telah dikirim ke <span className="font-semibold text-gray-700">{email}</span>
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-800">Kode OTP</label>
            <input
              type="text"
              placeholder="Masukkan kode OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm tracking-widest text-center"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="mt-8 w-full py-3 bg-[#ff6b2c] hover:bg-[#e85a1f] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-500/20"
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi'}
          </button>

          <button
            onClick={handleResend}
            className="mt-3 w-full py-3 border border-[#ff6b2c] text-[#ff6b2c] hover:bg-orange-50 font-semibold rounded-lg transition-colors"
          >
            Kirim Ulang OTP
          </button>

        </div>
      </div>

    </div>
  )
}

export default VerifyOtp