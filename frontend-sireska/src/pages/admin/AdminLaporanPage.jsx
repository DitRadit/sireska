import { useState, useEffect } from 'react'
import SidebarComponent from '../../components/sidebarComponent'
import api from '../../api/axios'

const formatRupiah = (n) =>
    n ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n) : 'Rp 0'

const formatTanggal = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'

const STATUS_COLOR = {
    menunggu:  'bg-blue-50 text-blue-600',
    disetujui: 'bg-orange-100 text-orange-600',
    ditolak:   'bg-red-50 text-red-500',
    belum_bayar: 'bg-red-50 text-red-400',
    menunggu_pembayaran: 'bg-yellow-50 text-yellow-600',
    lunas: 'bg-green-50 text-green-600',
    expired: 'bg-gray-100 text-gray-400',
    aktif: 'bg-green-50 text-green-600',
    maintenance: 'bg-yellow-50 text-yellow-600',
    nonaktif: 'bg-gray-100 text-gray-400',
}

const AdminLaporanPage = () => {
    const [activeTab, setActiveTab] = useState('reservasi')

    // Filter reservasi
    const [filterRes, setFilterRes] = useState({ status: '', status_pembayaran: '', dari: '', sampai: '' })
    const [dataRes, setDataRes] = useState([])
    const [loadingRes, setLoadingRes] = useState(false)
    const [totalRes, setTotalRes] = useState(0)

    // Filter fasilitas
    const [filterFas, setFilterFas] = useState({ status: '' })
    const [dataFas, setDataFas] = useState([])
    const [loadingFas, setLoadingFas] = useState(false)

    // Summary cards
    const [summary, setSummary] = useState({ totalReservasi: 0, totalPendapatan: 0, disetujui: 0, menunggu: 0 })

    const fetchReservasi = async () => {
        setLoadingRes(true)
        try {
            const params = new URLSearchParams()
            if (filterRes.status) params.append('status', filterRes.status)
            if (filterRes.status_pembayaran) params.append('status_pembayaran', filterRes.status_pembayaran)
            if (filterRes.dari) params.append('dari', filterRes.dari)
            if (filterRes.sampai) params.append('sampai', filterRes.sampai)

            const { data } = await api.get(`/reservasi/admin/laporan/reservasi?${params}`)
            setDataRes(data.data || [])
            setTotalRes(data.total || 0)

            // Hitung summary
            const items = data.data || []
            const pendapatan = items.filter(r => r.status_pembayaran === 'lunas')
                .reduce((acc, r) => acc + Number(r.total_harga || 0), 0)
            setSummary({
                totalReservasi: items.length,
                totalPendapatan: pendapatan,
                disetujui: items.filter(r => r.status === 'disetujui').length,
                menunggu: items.filter(r => r.status === 'menunggu').length,
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingRes(false)
        }
    }

    const fetchFasilitas = async () => {
        setLoadingFas(true)
        try {
            const params = new URLSearchParams()
            if (filterFas.status) params.append('status', filterFas.status)
            const { data } = await api.get(`/reservasi/admin/laporan/fasilitas?${params}`)
            setDataFas(data.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingFas(false)
        }
    }

    useEffect(() => { fetchReservasi() }, [])
    useEffect(() => {
        if (activeTab === 'fasilitas') fetchFasilitas()
    }, [activeTab])

const downloadCSV = async (type) => {
    try {
        const params = new URLSearchParams({ format: 'csv' })
        if (type === 'reservasi') {
            if (filterRes.status) params.append('status', filterRes.status)
            if (filterRes.status_pembayaran) params.append('status_pembayaran', filterRes.status_pembayaran)
            if (filterRes.dari) params.append('dari', filterRes.dari)
            if (filterRes.sampai) params.append('sampai', filterRes.sampai)
        } else {
            if (filterFas.status) params.append('status', filterFas.status)
        }

        const endpoint = type === 'reservasi'
            ? `/reservasi/admin/laporan/reservasi`
            : `/reservasi/admin/laporan/fasilitas`

        const response = await api.get(endpoint, {
            params: Object.fromEntries(params),  // kirim sebagai params axios
            responseType: 'blob',                // ← kunci utama untuk file download
        })

        const url = URL.createObjectURL(new Blob([response.data]))
        const a = document.createElement('a')
        a.href = url
        a.download = `laporan-${type}-${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    } catch (err) {
        console.error(err)
        alert('Gagal mendownload laporan: ' + (err.response?.data?.message || err.message))
    }
}

    return (
        <div className="flex min-h-screen bg-[#f7f5f4]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <SidebarComponent />

            <main className="ml-[260px] flex-1 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Unduh dan pantau data reservasi & kondisi fasilitas</p>
                    </div>
                </div>

                {/* Summary Cards (Reservasi) */}
                {activeTab === 'reservasi' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Reservasi', value: summary.totalReservasi, icon: 'receipt_long', color: 'text-orange-500', bg: 'bg-orange-50' },
                            { label: 'Disetujui', value: summary.disetujui, icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50' },
                            { label: 'Menunggu', value: summary.menunggu, icon: 'pending', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Total Pendapatan', value: formatRupiah(summary.totalPendapatan), icon: 'payments', color: 'text-purple-600', bg: 'bg-purple-50', big: true },
                        ].map((s, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                                <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                    <span className={`material-symbols-outlined ${s.color} text-[22px]`}>{s.icon}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                                    <p className={`font-bold text-gray-800 ${s.big ? 'text-sm' : 'text-xl'}`}>{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-5">
                    {[
                        { key: 'reservasi', label: 'Laporan Reservasi', icon: 'receipt_long' },
                        { key: 'fasilitas', label: 'Kondisi Fasilitas', icon: 'apartment' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
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

                {/* ── TAB RESERVASI ── */}
                {activeTab === 'reservasi' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {/* Filter Bar */}
                        <div className="p-5 border-b flex flex-wrap items-end gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-bold text-gray-500">Status Reservasi</label>
                                <select
                                    value={filterRes.status}
                                    onChange={e => setFilterRes({ ...filterRes, status: e.target.value })}
                                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-orange-400 bg-gray-50"
                                >
                                    <option value="">Semua</option>
                                    <option value="menunggu">Menunggu</option>
                                    <option value="disetujui">Disetujui</option>
                                    <option value="ditolak">Ditolak</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-bold text-gray-500">Status Pembayaran</label>
                                <select
                                    value={filterRes.status_pembayaran}
                                    onChange={e => setFilterRes({ ...filterRes, status_pembayaran: e.target.value })}
                                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-orange-400 bg-gray-50"
                                >
                                    <option value="">Semua</option>
                                    <option value="belum_bayar">Belum Bayar</option>
                                    <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                                    <option value="lunas">Lunas</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-bold text-gray-500">Dari Tanggal</label>
                                <input
                                    type="date" value={filterRes.dari}
                                    onChange={e => setFilterRes({ ...filterRes, dari: e.target.value })}
                                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-orange-400 bg-gray-50"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-bold text-gray-500">Sampai Tanggal</label>
                                <input
                                    type="date" value={filterRes.sampai}
                                    onChange={e => setFilterRes({ ...filterRes, sampai: e.target.value })}
                                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-orange-400 bg-gray-50"
                                />
                            </div>
                            <button
                                onClick={fetchReservasi}
                                disabled={loadingRes}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                                Filter
                            </button>
                            <button
                                onClick={() => downloadCSV('reservasi')}
                                className="ml-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                            >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                                Unduh CSV
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 px-5 pt-3 font-medium">{totalRes} data ditemukan</p>

                        {/* Tabel */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-gray-400 border-b font-semibold">
                                        <th className="px-5 py-3">No</th>
                                        <th className="px-5 py-3">Pemesan</th>
                                        <th className="px-5 py-3">Fasilitas</th>
                                        <th className="px-5 py-3">Tanggal</th>
                                        <th className="px-5 py-3">Jam</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Pembayaran</th>
                                        <th className="px-5 py-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingRes ? (
                                        <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Memuat data...</td></tr>
                                    ) : dataRes.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Tidak ada data</td></tr>
                                    ) : dataRes.map((r, i) => (
                                        <tr key={r.reservasi_id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5 text-gray-400 text-xs">{i + 1}</td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-semibold text-gray-800 text-xs">{r.user?.nama_lengkap}</p>
                                                <p className="text-gray-400 text-[11px]">{r.user?.email}</p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-gray-700 text-xs">{r.fasilitas?.nama_fasilitas}</p>
                                                <p className="text-gray-400 text-[11px]">{r.fasilitas?.lokasi}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-gray-600">{formatTanggal(r.tanggal)}</td>
                                            <td className="px-5 py-3.5 text-xs text-gray-600">{r.jam_mulai} – {r.jam_selesai}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-500'}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${STATUS_COLOR[r.status_pembayaran] || 'bg-gray-100 text-gray-500'}`}>
                                                    {r.status_pembayaran || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs font-semibold text-gray-700">{formatRupiah(r.total_harga)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── TAB FASILITAS ── */}
                {activeTab === 'fasilitas' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b flex flex-wrap items-end gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-bold text-gray-500">Status Fasilitas</label>
                                <select
                                    value={filterFas.status}
                                    onChange={e => setFilterFas({ status: e.target.value })}
                                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-orange-400 bg-gray-50"
                                >
                                    <option value="">Semua</option>
                                    <option value="aktif">Aktif</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="nonaktif">Nonaktif</option>
                                </select>
                            </div>
                            <button
                                onClick={fetchFasilitas}
                                disabled={loadingFas}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                                Filter
                            </button>
                            <button
                                onClick={() => downloadCSV('fasilitas')}
                                className="ml-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                            >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                                Unduh CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-gray-400 border-b font-semibold">
                                        <th className="px-5 py-3">No</th>
                                        <th className="px-5 py-3">Nama Fasilitas</th>
                                        <th className="px-5 py-3">Lokasi</th>
                                        <th className="px-5 py-3">Kapasitas</th>
                                        <th className="px-5 py-3">Harga/Jam</th>
                                        <th className="px-5 py-3">Jam Operasional</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Total Reservasi</th>
                                        <th className="px-5 py-3">Total Pendapatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingFas ? (
                                        <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">Memuat data...</td></tr>
                                    ) : dataFas.length === 0 ? (
                                        <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">Tidak ada data</td></tr>
                                    ) : dataFas.map((f, i) => (
                                        <tr key={f.fasilitas_id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5 text-gray-400 text-xs">{i + 1}</td>
                                            <td className="px-5 py-3.5 font-semibold text-gray-800 text-xs">{f.nama_fasilitas}</td>
                                            <td className="px-5 py-3.5 text-xs text-gray-600">{f.lokasi || '-'}</td>
                                            <td className="px-5 py-3.5 text-xs text-gray-600">{f.kapasitas ? `${f.kapasitas} orang` : '-'}</td>
                                            <td className="px-5 py-3.5 text-xs text-gray-600">{formatRupiah(f.harga_per_jam)}</td>
                                            <td className="px-5 py-3.5 text-xs text-gray-600">{f.jam_buka} – {f.jam_tutup}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${STATUS_COLOR[f.status] || 'bg-gray-100 text-gray-500'}`}>
                                                    {f.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs font-bold text-gray-700">{f.total_reservasi}</td>
                                            <td className="px-5 py-3.5 text-xs font-bold text-green-600">{formatRupiah(f.total_pendapatan)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default AdminLaporanPage