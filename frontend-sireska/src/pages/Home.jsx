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

// IMPORT YANG BENAR:
import HeaderComponent from '../components/HeaderComponent';
import FooterComponent from '../components/FooterComponent';
import Gambar from '../assets/3d Art.png'; 

const Home = () => {
  const [fasilitas, setFasilitas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mengambil data dari Backend
  useEffect(() => {
    const fetchFasilitas = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/fasilitas');
        const result = await response.json();
        
        if (result.data) {
          // Hanya ambil 4 fasilitas teratas untuk ditampilkan di Home
          setFasilitas(result.data.slice(0, 4));
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
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      
      {/* PANGGIL HEADER DI SINI */}
      <HeaderComponent />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="px-10 py-16 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block">
              #1 Kampus Resource Manager
            </span>
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Pesan fasilitas kampus <span className="text-orange-500">kapan saja</span>, di mana saja.
            </h1>
            <p className="text-gray-500 mb-8 max-w-md">
              Sistem reservasi fasilitas kampus yang memudahkan pesanan secara digital. Efisien, cepat, dan transparan untuk seluruh civitas akademika.
            </p>
            <div className="flex space-x-4">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center transition">
                Pesan Sekarang <ChevronRight className="ml-2 w-4 h-4" />
              </button>
              <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition">
                Lihat Fasilitas
              </button>
            </div>
          </div>
          <div className="lg:w-1/2">
            {/* Placeholder untuk gambar mockup aplikasi di Hero */}
            <div className="bg-gray-100 rounded-2xl w-full h-[400px] shadow-xl border border-gray-200 flex items-center justify-center overflow-hidden">
               <img src={Gambar} alt="Mockup SiResKa" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* FASILITAS TERPOPULER */}
        <section className="px-10 py-16 bg-gray-50">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold mb-2">Fasilitas Terpopuler</h2>
              <p className="text-gray-500 text-sm">Pilih fasilitas terbaik untuk kegiatan organisasimu.</p>
            </div>
            <a href="#" className="text-orange-500 text-sm font-medium hover:underline flex items-center">
              Lihat Semua <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <p className="text-gray-500 col-span-4 text-center py-10">Memuat data fasilitas...</p>
            ) : fasilitas.length > 0 ? (
              fasilitas.map((item) => (
                <div key={item.fasilitas_id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mb-6 overflow-hidden">
                    {item.gambar_url ? (
                      <img src={item.gambar_url} alt={item.nama_fasilitas} className="w-full h-full object-cover" />
                    ) : (
                      <MapPin className="w-8 h-8" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{item.nama_fasilitas}</h3>
                  <p className="text-gray-400 text-sm mb-6 flex items-center">
                     {item.lokasi || "Lokasi belum diatur"}
                  </p>
                  <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition text-sm">
                    Pesan
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-4 text-center py-10">Belum ada data fasilitas.</p>
            )}
          </div>
        </section>

        {/* CARA KERJA */}
        <section className="px-10 py-20 text-center">
          <h2 className="text-2xl font-bold mb-12">Cara Kerja</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white border shadow-sm rounded-2xl flex items-center justify-center text-orange-500 mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2">1. Pilih fasilitas</h3>
              <p className="text-sm text-gray-500 max-w-xs">Cari dan pilih fasilitas yang sesuai dengan kebutuhan acaramu.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white border shadow-sm rounded-2xl flex items-center justify-center text-orange-500 mb-6">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2">2. Tentukan Jadwal</h3>
              <p className="text-sm text-gray-500 max-w-xs">Pilih tanggal dan jam yang masih tersedia pada kalender sistem.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-md shadow-orange-200">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2">3. Konfirmasi booking</h3>
              <p className="text-sm text-gray-500 max-w-xs">Selesaikan proses dan tunggu konfirmasi melalui sistem.</p>
            </div>
          </div>
        </section>

        {/* BENTO GRID DASHBOARD PREVIEW */}
        <section className="px-10 py-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Jadwal Hari Ini (Statis) */}
            <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl row-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold">Jadwal Hari Ini</h3>
                <span className="text-orange-500 text-sm font-medium">Mei 2026</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-4 px-2">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              <div className="flex justify-between text-sm font-medium mb-8">
                <span className="w-8 h-8 flex items-center justify-center text-gray-300">26</span>
                <span className="w-8 h-8 flex items-center justify-center text-gray-300">27</span>
                <span className="w-8 h-8 flex items-center justify-center text-gray-300">28</span>
                <span className="w-8 h-8 flex items-center justify-center text-gray-300">29</span>
                <span className="w-8 h-8 flex items-center justify-center text-gray-300">30</span>
                <span className="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full">1</span>
                <span className="w-8 h-8 flex items-center justify-center">2</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 border-l-4 border-orange-500 pl-3">
                  <div>
                    <p className="text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1"/> 09:00 - 11:00</p>
                    <p className="font-bold text-sm">Latihan Basket UKM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-l-4 border-blue-500 pl-3">
                  <div>
                    <p className="text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1"/> 13:00 - 15:30</p>
                    <p className="font-bold text-sm">Seminar Teknologi</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-500 text-white p-8 rounded-3xl col-span-1 flex flex-col justify-end min-h-[200px]">
              <h3 className="font-bold text-xl mb-2">Real-time booking</h3>
              <p className="text-sm text-orange-100">Cek ketersediaan fasilitas secara instan tanpa perlu menunggu lama konfirmasi manual.</p>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-3xl flex flex-col justify-center">
               <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-5 h-5" />
               </div>
               <h3 className="font-bold mb-2">Mudah digunakan</h3>
               <p className="text-sm text-gray-500">Antarmuka yang intuitif memudahkan siapa saja untuk melakukan reservasi dalam hitungan detik.</p>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-3xl col-span-1 md:col-span-2 flex items-center gap-6">
               <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Monitor className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="font-bold mb-1">Banyak pilihan fasilitas</h3>
                  <p className="text-sm text-gray-500">Mulai dari ruang kelas, aula, hingga sarana olahraga lengkap tersedia dalam satu platform SiResKa.</p>
               </div>
            </div>

          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-10 py-20">
          <div className="bg-orange-500 rounded-3xl p-12 text-center text-white shadow-xl shadow-orange-200">
            <h2 className="text-3xl font-bold mb-8">Mulai pesan fasilitas kampus sekarang!</h2>
            <button className="bg-white text-orange-500 font-bold px-8 py-3 rounded-full hover:bg-gray-50 transition">
              Pesan Sekarang
            </button>
          </div>
        </section>

      </main>

      {/* PANGGIL FOOTER DI SINI */}
      <FooterComponent />
      
    </div>
  );
};

export default Home;