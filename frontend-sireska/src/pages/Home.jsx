import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  CheckCircle, 
  MapPin, 
  Clock, 
  ChevronRight,
  Monitor
} from 'lucide-react';

// Import komponen pendukung
import HeaderComponent from '../components/headerComponent';
import FooterComponent from '../components/FooterComponent';
import Gambar from '../assets/3d Art.png'; 

const Home = () => {
  const [fasilitas, setFasilitas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE BARU UNTUK KALENDER INTERAKTIF ---
  const [selectedDate, setSelectedDate] = useState(1); // Default terpilih tanggal 1
  const calendarDates = [26, 27, 28, 29, 30, 1, 2];
  
  // Data dummy jadwal berdasarkan tanggal
  const scheduleData = {
    26: [{ time: "08:00 - 12:00", title: "Maintenance Lapangan", color: "border-gray-400" }],
    27: [{ time: "10:00 - 12:00", title: "Kuliah Pengganti", color: "border-blue-500" }],
    28: [{ time: "08:00 - 15:00", title: "Persiapan Wisuda GKU", color: "border-orange-500" }],
    29: [], // Kosong
    30: [{ time: "15:00 - 17:00", title: "Latihan Paduan Suara", color: "border-green-500" }],
    1: [
      { time: "09:00 - 11:00", title: "Latihan Basket UKM", color: "border-orange-500" },
      { time: "13:00 - 15:30", title: "Seminar Teknologi", color: "border-blue-500" }
    ],
    2: [{ time: "07:00 - 09:00", title: "Senam Pagi Mahasiswa", color: "border-green-500" }]
  };
  // ---------------------------------------------

  // Mengambil data dari Backend
  useEffect(() => {
    const fetchFasilitas = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/fasilitas');
        const result = await response.json();
        
        if (result && Array.isArray(result.data)) {
          setFasilitas(result.data.slice(0, 4));
        } else if (Array.isArray(result)) {
          setFasilitas(result.slice(0, 4));
        }
      } catch (error) {
        console.error("Gagal mengambil data fasilitas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFasilitas();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col overflow-x-hidden">
      
      {/* HEADER / NAVBAR */}
      <HeaderComponent />

      <main className="flex-grow pt-20">
        {/* HERO SECTION */}
        <section className="px-10 py-16 flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
          <div className="lg:w-1/2">
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block">
              #1 Kampus Resource Manager
            </span>
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Pesan fasilitas kampus <span className="text-orange-500">kapan saja</span>, di mana saja.
            </h1>
            <p className="text-gray-500 mb-8 max-w-md text-lg">
              Sistem reservasi fasilitas kampus yang memudahkan pesanan secara digital. Efisien, cepat, dan transparan untuk seluruh civitas akademika.
            </p>
            <div className="flex space-x-4">
              {/* BUTTON HERO DI-UPGRADE */}
              <button className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold flex items-center transition-all duration-300 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-200 hover:-translate-y-1 active:scale-95 group">
                Pesan Sekarang <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md hover:-translate-y-1 active:scale-95">
                Lihat Fasilitas
              </button>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="rounded-3xl w-full h-[450px] flex items-center justify-center overflow-hidden p-8 group">
               <img src={Gambar} alt="3D Illustration" className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
            </div>
          </div>
        </section>

        {/* FASILITAS TERPOPULER */}
        <section className="px-10 py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Fasilitas Terpopuler</h2>
                <p className="text-gray-500">Pilih fasilitas terbaik untuk kegiatan organisasimu.</p>
              </div>
              <a href="/fasilitas" className="text-orange-500 font-bold hover:text-orange-600 flex items-center transition group">
                Lihat Semua <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {isLoading ? (
                <p className="text-gray-500 col-span-4 text-center py-20 font-medium">Sedang memuat data fasilitas...</p>
              ) : Array.isArray(fasilitas) && fasilitas.length > 0 ? (
                fasilitas.map((item) => (
                  <div key={item.fasilitas_id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full">
                    <div className="aspect-video w-full rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-6 overflow-hidden">
                      {item.gambar_url ? (
                        <img src={item.gambar_url} alt={item.nama_fasilitas} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      ) : (
                        <MapPin className="w-10 h-10 opacity-30" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-extrabold text-xl mb-2 text-gray-800 line-clamp-1">{item.nama_fasilitas}</h3>
                      <p className="text-gray-400 text-sm mb-6 flex items-center line-clamp-2">
                         <MapPin className="w-4 h-4 mr-2 text-orange-400 shrink-0" />
                         {item.lokasi || "Lokasi belum diatur"}
                      </p>
                    </div>
                    {/* BUTTON CARD DI-UPGRADE */}
                    <button className="w-full py-3 mt-auto bg-gray-50 text-gray-700 font-bold rounded-xl transition-all duration-300 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-200 active:scale-95">
                      Pesan
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-4 py-20 text-center">
                   <p className="text-gray-400 font-medium italic">Belum ada data fasilitas yang tersedia saat ini.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CARA KERJA */}
        <section className="px-10 py-24 text-center max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-16">Cara Kerja</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-white border border-gray-100 shadow-lg rounded-[2rem] flex items-center justify-center text-orange-500 mb-8 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-orange-100">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-xl mb-3">1. Pilih fasilitas</h3>
              <p className="text-gray-500 leading-relaxed">Cari dan pilih fasilitas yang sesuai dengan kebutuhan acaramu.</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-white border border-gray-100 shadow-lg rounded-[2rem] flex items-center justify-center text-orange-500 mb-8 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-orange-100">
                <Calendar className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-xl mb-3">2. Tentukan Jadwal</h3>
              <p className="text-gray-500 leading-relaxed">Pilih tanggal dan jam yang masih tersedia pada kalender sistem.</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-orange-500 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-xl shadow-orange-200 transition-transform duration-300 group-hover:-translate-y-2">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-orange-600">3. Konfirmasi booking</h3>
              <p className="text-gray-500 leading-relaxed">Selesaikan proses dan tunggu konfirmasi melalui sistem.</p>
            </div>
          </div>
        </section>

        {/* BENTO GRID PREVIEW (INTERAKTIF) */}
        <section className="px-10 py-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-[2.5rem] row-span-2">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-extrabold text-xl">Jadwal Hari Ini</h3>
                <span className="text-orange-500 text-sm font-bold bg-orange-50 px-3 py-1 rounded-full">Mei 2026</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-6 px-2">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              
              {/* KALENDER INTERAKTIF */}
              <div className="flex justify-between text-sm font-bold mb-10 relative">
                {calendarDates.map((date) => (
                  <span 
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 ${
                      selectedDate === date 
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110" 
                        : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
                    }`}
                  >
                    {date}
                  </span>
                ))}
              </div>

              {/* LIST JADWAL DINAMIS */}
              <div className="space-y-6 min-h-[160px]">
                {scheduleData[selectedDate]?.length > 0 ? (
                  scheduleData[selectedDate].map((sched, index) => (
                    <div 
                      key={`${selectedDate}-${index}`} 
                      className={`flex items-start gap-4 border-l-4 ${sched.color} pl-4 py-1 animate-[fadeIn_0.3s_ease-in-out]`}
                    >
                      <div>
                        <p className="text-xs text-gray-400 flex items-center font-bold mb-1">
                          <Clock className="w-3 h-3 mr-1"/> {sched.time}
                        </p>
                        <p className="font-extrabold text-gray-800">{sched.title}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-6 animate-[fadeIn_0.3s_ease-in-out]">
                    <p className="font-medium text-sm">Tidak ada jadwal pada tanggal ini.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-orange-500 text-white p-10 rounded-[2.5rem] col-span-1 flex flex-col justify-end min-h-[250px] shadow-xl shadow-orange-200 transition-transform duration-300 hover:-translate-y-2">
              <h3 className="font-extrabold text-2xl mb-3">Real-time booking</h3>
              <p className="text-orange-50 leading-relaxed font-medium">Cek ketersediaan fasilitas secara instan tanpa perlu menunggu lama.</p>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm p-10 rounded-[2.5rem] flex flex-col justify-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
               <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-6 h-6" />
               </div>
               <h3 className="font-extrabold text-xl mb-3">Mudah digunakan</h3>
               <p className="text-gray-500 text-sm leading-relaxed font-medium">Antarmuka intuitif memudahkan reservasi dalam hitungan detik.</p>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm p-10 rounded-[2.5rem] col-span-1 md:col-span-2 flex items-center gap-8 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
               <div className="w-16 h-16 bg-green-50 text-green-500 rounded-[1.5rem] flex items-center justify-center shrink-0">
                  <Monitor className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="font-extrabold text-xl mb-2">Banyak pilihan fasilitas</h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium">Mulai dari GKU, Student Center, Aula, hingga Sarana Olahraga lengkap tersedia.</p>
               </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-10 py-24">
          <div className="bg-orange-500 rounded-[3rem] py-16 px-12 text-center text-white shadow-2xl shadow-orange-200 max-w-5xl mx-auto relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold mb-8">Mulai pesan fasilitas kampus sekarang!</h2>
              {/* BUTTON CTA DI-UPGRADE */}
              <button className="bg-white text-orange-500 font-extrabold px-10 py-4 rounded-2xl transition-all duration-300 hover:bg-gray-50 hover:scale-105 hover:shadow-xl active:scale-95">
                Pesan Sekarang
              </button>
            </div>
            {/* Dekorasi Abstract (Berputar saat hover) */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-black/5 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"></div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <FooterComponent />
      
    </div>
  );
};

export default Home;