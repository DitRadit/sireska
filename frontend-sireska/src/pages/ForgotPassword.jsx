import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoPutih from '../assets/logoPutih.png'
import sideImage from '../assets/Side Image.png'
import authService from '../service/authService'

const ForgotPassword = () => {
    const navigate = useNavigate()
    
    // State form sekarang mencakup email juga
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [popup, setPopup] = useState({ show: false, type: '', message: '' })

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async () => {
        setError('');

        // Validasi form kosong
        if (!form.email || !form.password || !form.confirmPassword) {
            setError('Semua kolom wajib diisi');
            return;
        }

        // Validasi kecocokan password
        if (form.password !== form.confirmPassword) {
            setError('Password tidak cocok');
            return;
        }

        setLoading(true);
        try {
            // Panggil API reset password menggunakan email dari input form
            await authService.resetPassword(form.email, form.password);

            // Munculkan popup sukses
            setPopup({
                show: true, 
                type: 'success', 
                message: 'Password berhasil diperbarui!'
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mereset password');
        } finally {
            setLoading(false);
        }
    };

    const handleClosePopup = () => {
        if (popup.type === 'success') {
            navigate('/login')
        } else {
            setPopup({ show: false, type: '', message: '' })
        }
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-white font-sans relative">
            
            {/* TAMPILAN POPUP BERHASIL */}
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
                                Continue to Login
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div
                className="w-full h-[35vh] md:h-screen md:w-1/2 flex items-center justify-center bg-cover bg-center relative"
                style={{ backgroundImage: `url('${sideImage}')` }}>
                <img
                    src={logoPutih}
                    alt="Logo SiResKa"
                    className="w-52 md:w-80 h-auto relative z-10"/>
            </div>

            <div className="flex-1 md:w-1/2 bg-white flex flex-col items-center justify-center p-8 -mt-8 md:mt-0 rounded-t-[32px] md:rounded-none relative z-20">
                <Link
                    to="/login"
                    className="hidden md:block absolute top-8 right-8 text-2xl font-bold text-black hover:text-gray-600">
                    &lt;
                </Link>

                <div className="w-full max-w-sm flex flex-col mt-2 md:mt-0">
                    <h2 className="text-[#ff6b2c] text-3xl md:text-4xl font-bold mb-3">Reset Password</h2>
                    <p className="text-gray-500 text-[10px] md:text-xs font-light mb-8 leading-relaxed pr-4">
                        Please enter your email and new password below.
                    </p>

                    <div className="flex flex-col gap-4">
                        {/* Input Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-800">Your email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="email@gmail.com"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"/>
                        </div>

                        {/* Input Password Baru */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-800">Enter new password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="At least 8 digit"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"/>
                        </div>

                        {/* Input Konfirmasi Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-800">Confirm password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="********"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"/>
                        </div>
                    </div>

                    {error && (<p className="text-red-500 text-xs mt-3">{error}</p>)}

                    <div className="flex flex-col mt-8 gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3 bg-[#ff6b2c] hover:bg-[#e85a1f] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-500/20">
                            {loading ? 'Processing...' : 'Reset Password'}
                        </button>
                    </div>

                    <div className="text-center mt-8 text-xs font-semibold text-gray-500">
                        Remember your password?{' '}
                        <Link to="/login" className="text-[#ff6b2c] hover:underline">Login</Link>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ForgotPassword