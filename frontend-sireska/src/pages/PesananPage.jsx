import { useState, useEffect } from "react";
import pesananService from "../service/pesananService";
import Navbar from "../components/headerComponent";
import Footer from "../components/footerComponent";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const PesananPage = () => {
    const [pesanan, setPesanan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Semua");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPesanan = async () => {
            try {
                const res = await pesananService.getMyReservasi();
                setPesanan(res.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchPesanan();
    }, []);

    // Logika Filter
    const filteredPesanan = pesanan.filter(item => {
        if (activeTab === "Semua") return true;
        if (activeTab === "Berlangsung") return item.status === "menunggu" || item.status === "disetujui";
        if (activeTab === "Selesai") return item.status === "selesai";
        if (activeTab === "Dibatalkan") return item.status === "ditolak";
        return true;
    });

    // Fungsi Detail dengan SweetAlert
    const handleDetail = (id) => navigate(`/pesanan/${id}`);

    const getStatusColor = (status) => {
        if (status === "menunggu") return "bg-orange-100 text-orange-600";
        if (status === "disetujui") return "bg-green-100 text-green-600";
        if (status === "ditolak") return "bg-red-100 text-red-600";
        return "bg-gray-100 text-gray-600";
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Memuat data...</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-[Poppins]">
            <Navbar />
            
            {/* Lebar container disamakan (max-w-[1000px] dengan px-6) */}
            <main className="flex-grow w-full max-w-[1000px] mx-auto px-6 pt-32 pb-20">
                <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Fasilitas Kampus</h1>
                <p className="text-gray-500 mb-8">Pantau status dan riwayat pemesanan fasilitas Anda.</p>

                {/* Filter */}
                <div className="flex gap-3 mb-8">
                    {["Semua", "Berlangsung", "Selesai", "Dibatalkan"].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full border text-sm font-bold transition-all ${activeTab === tab ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200 hover:border-orange-500"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-6">
                    {filteredPesanan.length > 0 ? filteredPesanan.map((item) => (
                        <div key={item.reservasi_id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                            <img src={item.fasilitas?.gambar_url} className="w-40 h-28 object-cover rounded-2xl" alt="Fasilitas" />
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg text-gray-800">{item.fasilitas?.nama_fasilitas}</h3>
                                <p className="text-sm text-gray-500 mb-3">📍 {item.fasilitas?.lokasi || "Sport Center"}</p>
                                <div className="flex gap-3 text-[11px] font-bold text-gray-600">
                                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg">📅 {new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg">🕒 {item.jadwal?.jam_buka} - {item.jadwal?.jam_tutup}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                                <button
                                    onClick={() => handleDetail(item.reservasi_id)}
                                    className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    Lihat Detail
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-400 py-10 font-medium">Tidak ada pesanan untuk kategori ini.</p>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};
export default PesananPage;