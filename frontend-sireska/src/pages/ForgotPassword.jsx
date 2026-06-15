import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoPutih from '../assets/logoPutih.png'
import sideImage from '../assets/Side Image.png'
import authService from '../service/authService'

const ForgotPassword = () => {
    const navigate = useNavigate()

    // Step 1: masukkan email → kirim OTP
    // Step 2: masukkan OTP + password baru
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')
    const [form, setForm] = useState({ otp: '', password: '', confirmPassword: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successPopup, setSuccessPopup] = useState(false)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    // Step 1: Kirim OTP
    const handleSendOtp = async () => {
        setError('')
        if (!email.trim()) { setError('Email wajib diisi'); return }

        setLoading(true)
        try {
            await authService.forgotPasswordSendOtp(email.trim())
            setStep(2)
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim OTP')
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Reset password dengan OTP
const handleReset = async () => {
    setError('')
    if (!form.otp || !form.password || !form.confirmPassword) {
        setError('Semua kolom wajib diisi'); return
    }
    if (form.password !== form.confirmPassword) {
        setError('Password tidak cocok'); return
    }

    setLoading(true)
    try {
        await authService.resetPassword(email, form.otp, form.password)
        setSuccessPopup(true)
    } catch (err) {
        setError(err.response?.data?.message || 'Gagal mereset password')
    } finally {
        setLoading(false)
    }
}

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-white font-sans relative">

            {/* Popup Sukses */}
            {successPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-4">
                    <div className="bg-white rounded-[32px] p-8 md:p-10 w-full max-w-lg flex flex-col items-center text-center shadow-2xl">
                        <div className="w-20 h-20 rounded-full bg-[#1ac07f] flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Password Berhasil Diperbarui!</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-sm">
                            Silakan login menggunakan password baru Anda.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3.5 bg-[#fe6d0d] hover:bg-[#e7600b] text-white font-semibold rounded-lg transition-colors text-lg"
                        >
                            Login Sekarang
                        </button>
                    </div>
                </div>
            )}

            {/* Kiri - Gambar */}
            <div
                className="w-full h-[35vh] md:h-screen md:w-1/2 flex items-center justify-center bg-cover bg-center relative"
                style={{ backgroundImage: `url('${sideImage}')` }}>
                <img src={logoPutih} alt="Logo SiResKa" className="w-52 md:w-80 h-auto relative z-10" />
            </div>

            {/* Kanan - Form */}
            <div className="flex-1 md:w-1/2 bg-white flex flex-col items-center justify-center p-8 -mt-8 md:mt-0 rounded-t-[32px] md:rounded-none relative z-20">
                <Link to="/login" className="hidden md:block absolute top-8 right-8 text-2xl font-bold text-black hover:text-gray-600">
                    &lt;
                </Link>

                <div className="w-full max-w-sm flex flex-col mt-2 md:mt-0">

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#ff6b2c] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-[#ff6b2c]' : 'bg-gray-200'}`} />
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-[#ff6b2c] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    </div>

                    <h2 className="text-[#ff6b2c] text-3xl md:text-4xl font-bold mb-2">
                        {step === 1 ? 'Lupa Password' : 'Reset Password'}
                    </h2>
                    <p className="text-gray-500 text-[10px] md:text-xs font-light mb-8 leading-relaxed">
                        {step === 1
                            ? 'Masukkan email Anda, kami akan mengirimkan kode OTP untuk verifikasi.'
                            : `Kode OTP telah dikirim ke ${email}. Masukkan kode dan password baru Anda.`}
                    </p>

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-gray-800">Email Anda</label>
                                <input
                                    type="email"
                                    placeholder="email@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"
                                />
                            </div>
                            {error && <p className="text-red-500 text-xs">{error}</p>}
                            <button
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="w-full py-3 bg-[#ff6b2c] hover:bg-[#e85a1f] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-500/20 mt-4"
                            >
                                {loading ? 'Mengirim OTP...' : 'Kirim Kode OTP'}
                            </button>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-gray-800">Kode OTP</label>
                                <input
                                    type="text"
                                    name="otp"
                                    placeholder="Masukkan 6 digit kode OTP"
                                    value={form.otp}
                                    onChange={handleChange}
                                    maxLength={6}
                                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm tracking-widest text-center"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-gray-800">Password Baru</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Masukkan Password Baru"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-gray-800">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Ulangi password baru"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"
                                />
                            </div>
                            {error && <p className="text-red-500 text-xs">{error}</p>}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => { setStep(1); setError(''); setForm({ otp: '', password: '', confirmPassword: '' }) }}
                                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Kembali
                                </button>
                                <button
                                    onClick={handleReset}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-[#ff6b2c] hover:bg-[#e85a1f] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-500/20"
                                >
                                    {loading ? 'Memproses...' : 'Reset Password'}
                                </button>
                            </div>
                            <button
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="text-xs text-[#ff6b2c] hover:underline text-center mt-1"
                            >
                                Kirim ulang OTP
                            </button>
                        </div>
                    )}

                    <div className="text-center mt-8 text-xs font-semibold text-gray-500">
                        Ingat password Anda?{' '}
                        <Link to="/login" className="text-[#ff6b2c] hover:underline">Login</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword