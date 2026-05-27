import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import fasilitasService from "../service/fasilitasServices";
import bookingService from "../service/bookingService";
import Navbar from "../components/headerComponent";
import Footer from "../components/footerComponent";

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [fasilitas, setFasilitas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBooked, setIsBooked] = useState(false); 
    const [reservasiId, setReservasiId] = useState(null); 

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.nama_lengkap || user.user?.nama_lengkap || "User";
    const username = user.username || user.user?.username || "-";

    const [formData, setFormData] = useState({ tanggal: "", jadwal_id: "", detail: "" });

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fasilitasService.getFasilitasById(id);
                setFasilitas(res.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchDetail();
    }, [id]);

    const handleBooking = async () => {
        if (!formData.tanggal || !formData.detail || !formData.jadwal_id) {
            return Swal.fire({ icon: "warning", title: "Oops!", text: "Mohon isi semua data" });
        }
        try {
            setIsSubmitting(true);
            const payload = { 
                fasilitas_id: parseInt(id), 
                jadwal_id: parseInt(formData.jadwal_id), 
                tanggal: formData.tanggal, 
                keperluan: formData.detail 
            };
            
            const response = await bookingService.createBooking(payload);
            setReservasiId(response.data.reservasi_id);
            setIsBooked(true);

            Swal.fire({ icon: 'success', title: 'Pesanan berhasil', showConfirmButton: false, timer: 1000 });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Gagal", text: "Terjadi kesalahan saat memesan." });
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        Swal.fire({
            title: 'Yakin batalkan?',
            text: "Pesanan akan dibatalkan.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Ya, Batalkan'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (isBooked && reservasiId) {
                        await bookingService.cancelBooking(reservasiId);
                    }
                    // RESET STATE agar tombol jadi "Pesan" lagi
                    setIsBooked(false);
                    setReservasiId(null);
                    setFormData({ tanggal: "", jadwal_id: "", detail: "" });
                    Swal.fire("Berhasil", "Pesanan dibatalkan", "success");
                } catch (err) { 
                    Swal.fire("Gagal", "Gagal membatalkan pesanan", "error"); 
                }
            }
        });
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    const listJadwal = fasilitas?.jadwalFasilitas || fasilitas?.jadwal || [];

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-[Poppins]">
            <Navbar />
            <main className="flex-grow max-w-[1000px] mx-auto w-full px-6 pt-32 pb-20">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h2 className="text-orange-500 font-extrabold text-lg border-b pb-4">Informasi Pesanan</h2>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-600 mb-2">Nama Fasilitas</label>
                                <input type="text" value={fasilitas?.nama_fasilitas} disabled className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-600 mb-2">Nama Pemesan</label>
                                <input type="text" value={userName} disabled className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-600 mb-2">Jadwal Penggunaan</label>
                                <input type="date" value={formData.tanggal} disabled={isBooked} className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium" onChange={(e) => setFormData({...formData, tanggal: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-600 mb-2">Pilih Waktu</label>
                                <select disabled={isBooked} value={formData.jadwal_id} className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium" onChange={(e) => setFormData({...formData, jadwal_id: e.target.value})}>
                                    <option value="">-- Pilih Jadwal --</option>
                                    {listJadwal.map((j) => (
                                        <option key={j.jadwal_id} value={j.jadwal_id}>{j.hari} ({j.jam_buka} - {j.jam_tutup})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-600 mb-2">Detail Pemesanan</label>
                                <textarea rows="3" disabled={isBooked} value={formData.detail} className="w-full bg-gray-100 border-none rounded-xl px-5 py-4 text-sm font-medium" onChange={(e) => setFormData({...formData, detail: e.target.value})}></textarea>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <h2 className="text-orange-500 font-extrabold text-lg border-b pb-4 mb-6">Pratinjau Fasilitas</h2>
                            <img src={fasilitas?.gambar_url} className="w-full h-[320px] object-cover rounded-2xl mb-8 border border-gray-200" />
                            
                            <div className="flex flex-col gap-3 mt-auto">
                                <button onClick={handleBooking} disabled={isBooked} className={`w-full py-3 rounded-md font-bold text-[14px] ${isBooked ? 'bg-[#fed7aa] text-[#ea580c] cursor-not-allowed border border-[#fdba74]' : 'bg-[#ff7300] text-white hover:bg-orange-600'}`}>
                                    {isBooked ? "Menunggu Konfirmasi" : "Pesan"}
                                </button>
                                <button onClick={handleCancel} className="w-full py-3 rounded-md bg-white border border-[#dc2626] text-[#dc2626] font-bold text-[14px] hover:bg-red-50">
                                    Batalkan Pesanan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
export default BookingPage;