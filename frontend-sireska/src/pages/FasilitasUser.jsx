import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fasilitasService from "../service/fasilitasServices"; 

import Navbar from "../components/headerComponent"; 
import Footer from "../components/footerComponent"; 

const FasilitasUser = () => {
  const navigate = useNavigate();
  const [fasilitas, setFasilitas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Filter & Search
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFasilitas = async () => {
    try {
      setLoading(true);
      const res = await fasilitasService.getAllFasilitas();
      setFasilitas(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data fasilitas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFasilitas();
  }, []);

  // ─── LOGIKA FILTER & PENCARIAN ──────────────────────────────
  const filteredFasilitas = fasilitas.filter((item) => {
    let matchFilter = true;
    if (activeFilter === "Tersedia Sekarang") {
      matchFilter = item.status === "aktif";
    } else if (activeFilter === "Indoor") {
      matchFilter = item.tipe?.toLowerCase() === "indoor";
    } else if (activeFilter === "Outdoor") {
      matchFilter = item.tipe?.toLowerCase() === "outdoor";
    }

    const keyword = searchTerm.toLowerCase();
    const matchSearch = 
      item.nama_fasilitas?.toLowerCase().includes(keyword) || 
      item.lokasi?.toLowerCase().includes(keyword);

    return matchFilter && matchSearch;
  });
  // ─────────────────────────────────────────────────────────────

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
          * { font-family: 'Poppins', sans-serif; }
          
          /* Custom Scrollbar tipis HANYA untuk kolom kartu */
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }

          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

      {/* Pembungkus Utama */}
      <div className="min-h-screen bg-gray-50 flex flex-col text-[14px]">
        
        <Navbar />

        <main className="flex-grow w-full max-w-[1200px] mx-auto pt-[100px] pb-10 flex flex-col lg:flex-row gap-6 relative">
          
          {/* =======================================================
              KOLOM KIRI: Filter & Kartu 
          ======================================================= */}
          <div className="w-full lg:w-[55%] flex flex-col gap-5">
            
            {/* 👇 PERBAIKAN: Area Judul & Filter sekarang disusun vertikal (flex-col) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex flex-col gap-4">
                
                {/* Bagian Atas: Judul & Subjudul */}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-800 mb-1">
                    Fasilitas Kampus
                  </h1>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Ditemukan <span className="font-bold text-orange-500">{filteredFasilitas.length}</span> fasilitas olahraga & ruangan.
                  </p>
                </div>

                {/* Bagian Bawah: Tombol Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
                  {["Semua", "Tersedia Sekarang", "Indoor", "Outdoor"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`whitespace-nowrap px-5 py-2 rounded-full text-[11px] lg:text-xs font-bold border transition-colors ${
                        activeFilter === filter
                          ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* Area Kartu (Scroll-able) */}
            <div className="max-h-[65vh] overflow-y-auto custom-scrollbar pr-2 pb-4">
              
              {loading ? (
                <div className="bg-white rounded-2xl py-12 text-center border border-gray-100 shadow-sm">
                  <span className="material-symbols-outlined animate-spin text-orange-500 text-3xl mb-2">autorenew</span>
                  <p className="text-gray-500 text-sm">Memuat data...</p>
                </div>
              ) : filteredFasilitas.length === 0 ? (
                <div className="bg-white rounded-2xl py-12 text-center border border-gray-100 shadow-sm">
                  <span className="material-symbols-outlined text-gray-300 text-4xl mb-2">search_off</span>
                  <p className="text-gray-500 text-xs">Fasilitas tidak ditemukan.</p>
                  <button 
                    onClick={() => { setActiveFilter("Semua"); setSearchTerm(""); }}
                    className="mt-3 text-orange-500 text-[11px] font-bold hover:underline"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredFasilitas.map((item) => (
                    <div key={item.fasilitas_id} className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 group">
                      
                      <div className="relative h-32 bg-gray-100 overflow-hidden shrink-0">
                        <img
                          src={item.gambar_url || item.gambar || "https://placehold.co/400x300/f8f9fa/a1a1aa?text=No+Image"}
                          alt={item.nama_fasilitas}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shadow-sm backdrop-blur-md uppercase tracking-wider
                            ${item.status === 'aktif' ? "bg-white/95 text-green-600" : "bg-white/95 text-red-500"}
                          `}>
                            {item.status === 'aktif' ? "Tersedia" : item.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-800 text-[13px] leading-snug line-clamp-1 mb-1.5 group-hover:text-orange-500 transition-colors">
                          {item.nama_fasilitas}
                        </h3>

                        <div className="space-y-1 mt-auto mb-3">
                          <p className="text-gray-500 text-[11px] font-medium flex items-center gap-1.5 truncate">
                            <span className="material-symbols-outlined text-[14px] text-gray-400">location_on</span>
                            {item.lokasi || "Lokasi belum ditentukan"}
                          </p>
                          <p className="text-gray-500 text-[11px] font-medium flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-gray-400">group</span>
                            Kapasitas: {item.kapasitas ? `${item.kapasitas} Orang` : "-"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-auto">
                          <button 
                            onClick={() => navigate(`/fasilitas/${item.fasilitas_id}`)}
                            className="flex-1 bg-white border border-gray-200 text-gray-600 py-1.5 rounded-lg text-[11px] font-bold hover:bg-orange-50 hover:text-orange-500 hover:border-orange-300 transition-colors"
                          >
                            Detail
                          </button>
                          <button 
                            onClick={() => navigate(`/booking/${item.fasilitas_id}`)}
                            className="flex-1 bg-orange-500 text-white py-1.5 rounded-lg text-[11px] font-bold shadow-sm hover:bg-orange-600 active:scale-95 transition-all"
                          >
                            Pesan
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>

          {/* =======================================================
              KOLOM KANAN: Peta (Sticky Fix)
          ======================================================= */}
          <div className="hidden lg:block lg:w-[45%]">
            
            <div className="sticky top-[100px] h-[calc(100vh-140px)] min-h-[450px] bg-gray-200 rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative">
              
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15841.650630730164!2d107.62534571253434!3d-6.973007021752174!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e9adf177bf8d%3A0x437398556f9fa03!2sTelkom%20University!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid" 
                className="w-full h-full border-0 grayscale-[10%] contrast-[1.05]" 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>

              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-[280px] bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-1.5 flex items-center border border-gray-100">
                <span className="material-symbols-outlined text-gray-400 pl-2 text-[18px]">search</span>
                <input 
                  type="text" 
                  placeholder="Cari fasilitas..." 
                  className="flex-1 bg-transparent outline-none text-[11px] font-medium px-2 text-gray-700 placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="h-4 w-px bg-gray-200 mx-1"></div>
                <button className="bg-orange-500 text-white px-3 py-1 rounded-md text-[11px] font-bold shadow-sm hover:bg-orange-600 transition-colors">
                  Cari
                </button>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
                <div className="relative">
                    <span className="material-symbols-outlined text-orange-500 text-[40px] drop-shadow-md">
                      location_on
                    </span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/20 rounded-full blur-[1px]"></div>
                </div>
              </div>

            </div>
          </div>

        </main>

        <Footer />
        
      </div>
    </>
  );
};

export default FasilitasUser;