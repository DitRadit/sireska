import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoPutih from '../assets/logoPutih.png'
import sideImage from '../assets/Side Image.png'
import authService from '../service/authService'

const Login = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async () => {
        setError('')

        if (!form.email || !form.password) {
            setError('Email dan password wajib diisi')
            return
        }

        setLoading(true)
        try {
            const response = await authService.login(form.email, form.password)
            
            // --- LOGIKA PINTAR PENYIMPANAN DATA ---
            console.log("Cek Data dari Backend:", response); // Biar gampang kalau mau ngecek (F12)

            // Mengakali berbagai format response dari backend (kadang ada .data, kadang tidak)
            const token = response?.token || response?.data?.token;
            const userData = response?.user || response?.data?.user || response?.data || {};

            if (token) {
                // Simpan token
                localStorage.setItem('token', token);
                // Simpan seluruh data user agar bisa dibaca Header
                localStorage.setItem('user', JSON.stringify(userData));

                // Paksa pindah halaman dan re-render agar Header membaca localStorage
                window.location.href = '/home';
            } else {
                setError("Token tidak ditemukan dari server.");
            }
            // ----------------------------------------

        } catch (err) {
            const status = err.response?.status
            const message = err.response?.data?.message || 'Login gagal'
            const email = err.response?.data?.email

            if (status === 403 && email) {
                navigate(`/verify-otp?email=${email}`)
                return
            }

            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-white font-sans">
            <div
                className="w-full h-[35vh] md:h-screen md:w-1/2 flex items-center justify-center bg-cover bg-center relative"
                style={{ backgroundImage: `url('${sideImage}')` }}>
                <img
                    src={logoPutih}
                    alt="Logo SiResKa"
                    className="w-52 md:w-80 h-auto relative z-10" />
            </div>

            <div className="flex-1 md:w-1/2 bg-white flex flex-col items-center justify-center p-8 -mt-8 md:mt-0 rounded-t-[32px] md:rounded-none relative z-20">
                <button className="hidden md:block absolute top-8 right-8 text-2xl font-bold text-black hover:text-gray-600">
                    &lt;
                </button>

                <div className="w-full max-w-sm flex flex-col mt-2 md:mt-0">
                    <h2 className="text-[#ff6b2c] text-4xl font-bold mb-3">Hello Again!</h2>
                    <p className="text-gray-500 text-xs font-light mb-8 leading-relaxed pr-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                    </p>

                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-800">Your email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="email@gmail.com"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-800">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm" />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer text-sm">
                                    {showPassword ? '🙈' : '👁️'}
                                </span>
                            </div>
                            <div className="flex justify-end mt-1">
                                <Link to="/forgot-password" className="text-[11px] text-[#ff6b2c] hover:underline font-semibold">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    </div>

                    {error && (<p className="text-red-500 text-xs mt-3">{error}</p>)}

                    <div className="flex items-center gap-3 mt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 bg-[#ff6b2c] hover:bg-[#e85a1f] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-500/20 active:scale-95">
                            {loading ? 'Loading...' : 'Login'}
                        </button>

                        <div className="w-px h-8 bg-gray-300"></div>

                        <button className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm active:scale-95">
                            <span className="text-sm font-bold text-gray-600">G</span>
                        </button>
                    </div>

                    <div className="text-center mt-8 text-xs font-semibold text-gray-500">
                        Doesn't have an account?{' '}
                        <Link to="/register" className="text-[#ff6b2c] hover:underline">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login