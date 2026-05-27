import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/sidebarComponent'

const stats = [
  {
    title: 'Lapangan Tersedia',
    value: 100,
    icon: 'sports_soccer',
  },
  {
    title: 'Antrian Pesanan',
    value: 24,
    icon: 'groups',
  },
  {
    title: 'Lapangan Digunakan',
    value: 76,
    icon: 'check_circle',
  },
]

const menuCards = [
  {
    title: 'Kelola Pengguna',
    icon: 'group',
    color: 'bg-orange-500',
    path: '/admin/pengguna'
  },
  {
    title: 'Lihat Laporan',
    icon: 'description',
    color: 'bg-orange-400 hover:bg-orange-500',
    path: '/admin/laporan'
  },
  {
    title: 'Cek Pesanan',
    icon: 'list_alt',
    color: 'bg-orange-400 hover:bg-orange-500',
    path: '/admin/pesanan'
  },
  {
    title: 'Tambah Fasilitas',
    icon: 'sports_volleyball',
    color: 'bg-orange-400 hover:bg-orange-500',
    path: '/admin/fasilitas/tambah'
  },
]

const activities = [
  {
    time: '12.30',
    text: 'Booking baru Lapangan A',
  },
  {
    time: '13.00',
    text: 'Booking baru Lapangan B',
  },
  {
    time: '14.15',
    text: 'Booking baru Lapangan C',
  },
  {
    time: '15.20',
    text: 'Booking baru Lapangan D',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()

  const [user] = useState(() => {
    try {
      const userString = localStorage.getItem('user')

      if (!userString) {
        return { name: 'Admin' }
      }

      const parsed = JSON.parse(userString)

      return {
        name:
          parsed?.nama_lengkap ||
          parsed?.user?.nama_lengkap ||
          'Admin',
      }
    } catch (err) {
      console.error(err)
      return {
        name: 'Admin',
      }
    }
  })

  return (
    <>
      {/* google font + icons */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />

      {/* Background diganti sedikit lebih bersih (gray-50) */}
      <div className="min-h-screen bg-gray-50 flex font-[Poppins]">
        {/* sidebar */}
        <AdminSidebar />

        {/* content */}
        <main className="flex-1 flex flex-col overflow-hidden ml-[260px]">
          {/* header */}
          <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            {/* search */}
            <div className="relative w-full max-w-sm">
              <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Cari data..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:border-orange-400 focus:bg-white transition-all"
              />
            </div>

            {/* actions */}
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition text-gray-500">
                <span className="material-icons text-[20px]">
                  notifications
                </span>
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition text-gray-500"
              >
                <span className="material-icons text-[20px]">
                  person
                </span>
              </button>
            </div>
          </header>

          {/* dashboard body */}
          <div className="flex-1 p-8 grid grid-cols-12 gap-6 overflow-y-auto">
            
            {/* LEFT COLUMN (Disesuaikan proporsinya jadi col-span-8) */}
            <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
              
              {/* hero */}
              <div className="bg-white rounded-[1.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-orange-50 rounded-full blur-3xl opacity-60"></div>
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold text-gray-800 capitalize">
                    Halo, <span className="text-orange-500">{user.name}!</span>
                  </h1>
                  <p className="text-gray-500 mt-2 max-w-xl text-sm leading-relaxed">
                    Selamat datang di dashboard admin SiResKa. Kelola fasilitas olahraga, pantau pesanan, dan lihat laporan sistem secara realtime.
                  </p>
                  <button onClick={() => navigate('/admin/pesanan')} className="mt-6 bg-orange-500 hover:bg-orange-600 transition text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-orange-200/50 flex items-center gap-2 w-max">
                    <span className="material-icons text-[18px]">add_circle</span>
                    Pesanan Baru
                  </button>
                </div>
              </div>

              {/* menu cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {menuCards.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => item.path && navigate(item.path)}
                    className={`${item.color} rounded-[1.5rem] p-6 text-white hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-md flex flex-col justify-between min-h-[140px] group`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="material-icons text-[36px] bg-white/20 p-2.5 rounded-xl">
                        {item.icon}
                      </span>
                      <span className="material-icons opacity-0 group-hover:opacity-100 transition-opacity">
                        arrow_forward
                      </span>
                    </div>
                    <h2 className="text-lg font-bold mt-4 tracking-wide">
                      {item.title}
                    </h2>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN (Disesuaikan proporsinya jadi col-span-4) */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
              
              {/* stats */}
              <div className="grid grid-cols-1 gap-4">
                {stats.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                      <span className="material-icons text-[24px]">
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 leading-none">
                        {item.value}
                      </h2>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mt-1">
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* activity */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-800">
                    Aktivitas Hari Ini
                  </h2>
                </div>

                <div className="divide-y divide-gray-50 p-2">
                  {activities.map((item, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 flex items-start gap-4 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold shrink-0 mt-0.5">
                        {item.time}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </main>
      </div>
    </>
  )
}