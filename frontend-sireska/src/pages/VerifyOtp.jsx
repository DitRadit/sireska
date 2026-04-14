// src/pages/VerifyOtp.jsx
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
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    setError('')
    if (!otp) {
      setError('OTP wajib diisi')
      return
    }

    setLoading(true)
    try {
      await authService.verifyOtp(email, otp)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'OTP salah atau expired')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setInfo('')
    try {
      await authService.resendOtp(email)
      setInfo('OTP berhasil dikirim ulang, cek email kamu')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal kirim ulang OTP')
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white font-sans">

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

          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          {info && <p className="text-green-500 text-xs mt-3">{info}</p>}

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