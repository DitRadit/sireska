import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderComponent from '../components/headerComponent'
import FooterComponent from '../components/footerComponent'
import authService from '../service/authService'

const ROLE_MAP = { 1: 'Admin', 2: 'Mahasiswa / Dosen', 3: 'Tamu' }

const UserProfilePage = () => {
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Tab: 'profil' | 'password'
    const [activeTab, setActiveTab] = useState('profil')

    // Form edit profil
    const [editForm, setEditForm] = useState({ nama_lengkap: '', nim_nip: '', no_hp: '' })
    const [editLoading, setEditLoading] = useState(false)
    const [editError, setEditError] = useState('')
    const [editSuccess, setEditSuccess] = useState('')

    // Form ganti password
    const [passForm, setPassForm] = useState({ password_lama: '', password_baru: '', confirm: '' })
    const [passLoading, setPassLoading] = useState(false)
    const [passError, setPassError] = useState('')
    const [passSuccess, setPassSuccess] = useState('')

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }

        authService.getProfile()
            .then(res => {
                setProfile(res.user)
                setEditForm({
                    nama_lengkap: res.user.nama_lengkap || '',
                    nim_nip: res.user.nim_nip || '',
                    no_hp: res.user.no_hp || '',
                })
            })
            .catch(() => navigate('/login'))
            .finally(() => setLoading(false))
    }, [navigate])

    const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value })
    const handlePassChange = (e) => setPassForm({ ...passForm, [e.target.name]: e.target.value })

    const handleSaveProfil = async () => {
        setEditError(''); setEditSuccess('')
        if (!editForm.nama_lengkap.trim()) { setEditError('Nama lengkap wajib diisi'); return }

        setEditLoading(true)
        try {
            const res = await authService.updateProfile(editForm)
            setProfile(prev => ({ ...prev, ...res.user }))
            // Perbarui localStorage juga
            const stored = JSON.parse(localStorage.getItem('user') || '{}')
            localStorage.setItem('user', JSON.stringify({ ...stored, nama_lengkap: res.user.nama_lengkap }))
            setEditSuccess('Profil berhasil diperbarui!')
        } catch (err) {
            setEditError(err.response?.data?.message || 'Gagal memperbarui profil')
        } finally {
            setEditLoading(false)
        }
    }

    const handleGantiPassword = async () => {
        setPassError(''); setPassSuccess('')
        if (!passForm.password_lama || !passForm.password_baru || !passForm.confirm) {
            setPassError('Semua kolom wajib diisi'); return
        }
        if (passForm.password_baru !== passForm.confirm) {
            setPassError('Password baru tidak cocok'); return
        }
        if (passForm.password_baru.length < 8) {
            setPassError('Password baru minimal 8 karakter'); return
        }

        setPassLoading(true)
        try {
            await authService.changePassword(passForm.password_lama, passForm.password_baru)
            setPassSuccess('Password berhasil diubah!')
            setPassForm({ password_lama: '', password_baru: '', confirm: '' })
        } catch (err) {
            setPassError(err.response?.data?.message || 'Gagal mengganti password')
        } finally {
            setPassLoading(false)
        }
    }

    const getInitial = (nama) => nama ? nama.charAt(0).toUpperCase() : '?'

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-[#f7f5f4] flex flex-col" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <HeaderComponent />

            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 mt-16">

                {/* Avatar & Info Singkat */}
                <div className="bg-white rounded-2xl p-6 flex items-center gap-5 shadow-sm mb-6">
                    <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {getInitial(profile?.nama_lengkap)}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">{profile?.nama_lengkap}</h1>
                        <p className="text-sm text-gray-500">{profile?.email}</p>
                        <span className="inline-block mt-1 px-3 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                            {ROLE_MAP[profile?.role_id] || 'Pengguna'}
                        </span>
                    </div>
                </div>

                {/* Tab */}
                <div className="flex gap-2 mb-5">
                    {[
                        { key: 'profil', label: 'Edit Profil', icon: 'person' },
                        { key: 'password', label: 'Ganti Password', icon: 'lock' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setEditError(''); setEditSuccess(''); setPassError(''); setPassSuccess('') }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                activeTab === tab.key
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                    : 'bg-white text-gray-500 hover:bg-orange-50 hover:text-orange-500 border border-gray-100'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Panel Edit Profil */}
                {activeTab === 'profil' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-bold text-gray-800 mb-5">Informasi Akun</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600">Nama Lengkap *</label>
                                <input
                                    name="nama_lengkap"
                                    value={editForm.nama_lengkap}
                                    onChange={handleEditChange}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 text-sm bg-gray-50 focus:bg-white transition-all"
                                    placeholder="Nama lengkap Anda"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600">Email</label>
                                <input
                                    value={profile?.email || ''}
                                    disabled
                                    className="px-4 py-2.5 rounded-xl border border-gray-100 text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600">NIM / NIP</label>
                                <input
                                    name="nim_nip"
                                    value={editForm.nim_nip}
                                    onChange={handleEditChange}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 text-sm bg-gray-50 focus:bg-white transition-all"
                                    placeholder="NIM atau NIP Anda"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600">Nomor HP</label>
                                <input
                                    name="no_hp"
                                    value={editForm.no_hp}
                                    onChange={handleEditChange}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 text-sm bg-gray-50 focus:bg-white transition-all"
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>

                        </div>

                        {editError && (
                            <div className="mt-4 px-4 py-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">{editError}</div>
                        )}
                        {editSuccess && (
                            <div className="mt-4 px-4 py-3 bg-green-50 text-green-600 text-xs rounded-xl border border-green-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                {editSuccess}
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleSaveProfil}
                                disabled={editLoading}
                                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-orange-500/20 flex items-center gap-2"
                            >
                                {editLoading
                                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
                                    : <><span className="material-symbols-outlined text-[18px]">save</span> Simpan Perubahan</>
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* Panel Ganti Password */}
                {activeTab === 'password' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-bold text-gray-800 mb-1">Ganti Password</h2>
                        <p className="text-xs text-gray-400 mb-5">Password minimal 8 karakter.</p>

                        <div className="flex flex-col gap-4 max-w-sm">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600">Password Saat Ini *</label>
                                <input
                                    type="password"
                                    name="password_lama"
                                    value={passForm.password_lama}
                                    onChange={handlePassChange}
                                    placeholder="Password lama"
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 text-sm bg-gray-50 focus:bg-white transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600">Password Baru *</label>
                                <input
                                    type="password"
                                    name="password_baru"
                                    value={passForm.password_baru}
                                    onChange={handlePassChange}
                                    placeholder="Minimal 8 karakter"
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 text-sm bg-gray-50 focus:bg-white transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600">Konfirmasi Password Baru *</label>
                                <input
                                    type="password"
                                    name="confirm"
                                    value={passForm.confirm}
                                    onChange={handlePassChange}
                                    placeholder="Ulangi password baru"
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 text-sm bg-gray-50 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {passError && (
                            <div className="mt-4 px-4 py-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 max-w-sm">{passError}</div>
                        )}
                        {passSuccess && (
                            <div className="mt-4 px-4 py-3 bg-green-50 text-green-600 text-xs rounded-xl border border-green-100 flex items-center gap-2 max-w-sm">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                {passSuccess}
                            </div>
                        )}

                        <div className="flex mt-6">
                            <button
                                onClick={handleGantiPassword}
                                disabled={passLoading}
                                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-orange-500/20 flex items-center gap-2"
                            >
                                {passLoading
                                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
                                    : <><span className="material-symbols-outlined text-[18px]">lock_reset</span> Ganti Password</>
                                }
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <FooterComponent />
        </div>
    )
}

export default UserProfilePage