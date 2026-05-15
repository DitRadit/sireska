import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/sidebarComponent'

const stats = [
  {
    title: 'lapangan tersedia',
    value: 100,
    icon: 'sports_soccer',
  },
  {
    title: 'antrian pesanan',
    value: 24,
    icon: 'groups',
  },
  {
    title: 'lapangan digunakan',
    value: 76,
    icon: 'check_circle',
  },
]

const menuCards = [
  {
    title: 'kelola pengguna',
    icon: 'group',
    color: 'bg-orange-500',
  },
  {
    title: 'lihat laporan',
    icon: 'description',
    color: 'bg-orange-400',
  },
  {
    title: 'cek pesanan',
    icon: 'list_alt',
    color: 'bg-orange-400',
  },
  {
    title: 'tambah fasilitas',
    icon: 'sports_volleyball',
    color: 'bg-orange-400',
  },
]

const activities = [
  {
    time: '12.30',
    text: 'booking baru lapangan a',
  },
  {
    time: '13.00',
    text: 'booking baru lapangan b',
  },
  {
    time: '14.15',
    text: 'booking baru lapangan c',
  },
  {
    time: '15.20',
    text: 'booking baru lapangan d',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()

const [user] = useState(() => {
  try {
    const userString = localStorage.getItem('user')

    if (!userString) {
      return { name: 'admin' }
    }

    const parsed = JSON.parse(userString)

    return {
      name:
        parsed?.nama_lengkap ||
        parsed?.user?.nama_lengkap ||
        'admin',
    }
  } catch (err) {
    console.error(err)

    return {
      name: 'admin',
    }
  }
})

  return (
    <>
      {/* google font + icons */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=poppins:wght@300;400;500;600;700;800&display=swap"
      />

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />

      <div className="min-h-screen bg-[#f7f5f4] flex font-[Poppins]">
        {/* sidebar */}
        <AdminSidebar />

        {/* content */}
        <main className="flex-1 flex flex-col overflow-hidden ml-[260px]">
          {/* header */}
          <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
            {/* search */}
            <div className="relative w-full max-w-sm">
              <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                search
              </span>

              <input
                type="text"
                placeholder="search"
                className="w-full bg-[#f5f3f2] border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-orange-400"
              />
            </div>

            {/* actions */}
            <div className="flex items-center gap-4">
              <button className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                <span className="material-icons text-gray-600">
                  notifications
                </span>
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
              >
                <span className="material-icons text-gray-600">
                  person
                </span>
              </button>
            </div>
          </header>

          {/* dashboard body */}
          <div className="flex-1 p-8 grid grid-cols-12 gap-6 overflow-y-auto">
            {/* left */}
            <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
              {/* hero */}
              <div className="bg-[#f3f0ef] rounded-[32px] p-10">
                <h1 className="text-5xl font-bold text-orange-500 capitalize">
                  hello {user.name}!
                </h1>

                <p className="text-gray-500 mt-4 max-w-2xl leading-relaxed">
                  selamat datang di dashboard admin sireska.
                  kelola fasilitas olahraga, pantau pesanan,
                  dan lihat laporan sistem secara realtime.
                </p>

                <button className="mt-7 bg-orange-500 hover:bg-orange-600 transition text-white px-8 py-3 rounded-2xl text-lg font-semibold shadow-lg shadow-orange-200">
                  pesanan baru
                </button>
              </div>

              {/* menu cards */}
              <div className="bg-[#f3f0ef] rounded-[32px] p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuCards.map((item, index) => (
                  <div
                    key={index}
                    className={`${item.color} rounded-[28px] p-8 text-white hover:scale-[1.02] transition duration-300 cursor-pointer shadow-lg`}
                  >
                    <span className="material-icons text-[52px]">
                      {item.icon}
                    </span>

                    <h2 className="text-3xl font-semibold mt-8 capitalize">
                      {item.title}
                    </h2>
                  </div>
                ))}
              </div>
            </div>

            {/* right */}
            <div className="col-span-12 xl:col-span-3 flex flex-col gap-5">
              {/* stats */}
              {stats.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#f3f0ef] rounded-[28px] p-6 flex items-center gap-5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    <span className="material-icons text-gray-700 text-[30px]">
                      {item.icon}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-4xl font-bold text-gray-700">
                      {item.value}
                    </h2>

                    <p className="text-gray-500 text-sm capitalize">
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}

              {/* activity */}
              <div className="bg-white rounded-[28px] overflow-hidden border border-gray-200">
                <div className="bg-orange-500 text-white px-6 py-5">
                  <h2 className="text-2xl font-semibold">
                    today activity
                  </h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {activities.map((item, index) => (
                    <div
                      key={index}
                      className="px-5 py-4 flex items-center justify-between gap-4"
                    >
                      <span className="text-sm font-bold text-gray-700">
                        {item.time}
                      </span>

                      <span className="text-sm text-gray-500 text-right capitalize">
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