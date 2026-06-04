import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import fasilitasService from "../service/fasilitasServices";
import bookingService from "../service/bookingService";
import Navbar from "../components/headerComponent";
import Footer from "../components/footerComponent";

const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

const hitungDurasi = (jam_buka, jam_tutup) => {
  if (!jam_buka || !jam_tutup) return 0;
  const [h1, m1] = jam_buka.split(":").map(Number);
  const [h2, m2] = jam_tutup.split(":").map(Number);
  return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
};

const BookingPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [fasilitas,    setFasilitas]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked,     setIsBooked]     = useState(false);
  const [reservasiId,  setReservasiId]  = useState(null);
  const [formData,     setFormData]     = useState({ tanggal: "", jadwal_id: "", detail: "" });

  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.nama_lengkap || user.user?.nama_lengkap || "User";
  const isGuest  = user?.is_guest === true || user?.user?.is_guest === true || user?.role_id === 3;

  const selectedJadwal = fasilitas?.jadwal?.find(
    (j) => j.jadwal_id === parseInt(formData.jadwal_id)
  );

  const estimasiHarga = selectedJadwal && fasilitas?.harga_per_jam
    ? fasilitas.harga_per_jam * hitungDurasi(selectedJadwal.jam_buka, selectedJadwal.jam_tutup)
    : null;

  // ─── Cek active booking dari localStorage ─────────────────────────────────
  useEffect(() => {
    const savedId = localStorage.getItem(`active_reservasi_id_${id}`);
    if (!savedId) return;

    const checkBooking = async () => {
      try {
        const res  = await bookingService.getBookingById(savedId);
        const data = res.data;

        if (data && data.status !== "dibatalkan" && data.status !== "ditolak") {
          setReservasiId(data.reservasi_id);
          setIsBooked(true);
        } else {
          localStorage.removeItem(`active_reservasi_id_${id}`);
        }
      } catch {
        localStorage.removeItem(`active_reservasi_id_${id}`);
      }
    };

    checkBooking();
  }, [id]);

  // ─── Fetch detail fasilitas ────────────────────────────────────────────────
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fasilitasService.getFasilitasById(id);
        setFasilitas(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // ─── Submit booking ────────────────────────────────────────────────────────
  const handleBooking = async () => {
    if (!formData.tanggal || !formData.detail || !formData.jadwal_id) {
      return Swal.fire({ icon: "warning", title: "Oops!", text: "Mohon isi semua data" });
    }
    try {
      setIsSubmitting(true);
      const payload = {
        fasilitas_id: parseInt(id),
        jadwal_id:    parseInt(formData.jadwal_id),
        tanggal:      formData.tanggal,
        keperluan:    formData.detail,
      };

      const response = await bookingService.createBooking(payload);
      const rid      = response.data.reservasi_id;

      setReservasiId(rid);
      setIsBooked(true);
      localStorage.setItem(`active_reservasi_id_${id}`, rid);

      await Swal.fire({ icon: "success", title: "Pesanan berhasil!", showConfirmButton: false, timer: 1200 });
      navigate("/pesanan");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Terjadi kesalahan saat memesan." });
      setIsSubmitting(false);
    }
  };

  // ─── Batalkan booking ──────────────────────────────────────────────────────
  const handleCancel = async () => {
    Swal.fire({
      title:              "Yakin batalkan?",
      text:               "Pesanan akan dibatalkan.",
      icon:               "warning",
      showCancelButton:   true,
      confirmButtonColor: "#dc2626",
      confirmButtonText:  "Ya, Batalkan",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (isBooked && reservasiId) await bookingService.cancelBooking(reservasiId);

          setIsBooked(false);
          setReservasiId(null);
          setFormData({ tanggal: "", jadwal_id: "", detail: "" });
          localStorage.removeItem(`active_reservasi_id_${id}`);

          Swal.fire("Berhasil", "Pesanan dibatalkan", "success");
        } catch {
          Swal.fire("Gagal", "Gagal membatalkan pesanan", "error");
        }
      }
    });
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  const listJadwal = fasilitas?.jadwal || [];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-[Poppins]">
      <Navbar />
      <main className="flex-grow max-w-[1000px] mx-auto w-full px-6 pt-32 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* ─── KOLOM KIRI: Form ─── */}
            <div className="space-y-6">
              <h2 className="text-orange-500 font-extrabold text-lg border-b pb-4">Informasi Pesanan</h2>

              {isGuest && (
                <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-orange-400 text-[18px] mt-0.5">info</span>
                  <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                    Sebagai tamu, reservasi ini akan dikenakan biaya. Setelah admin menyetujui, kamu akan mendapatkan <strong>QRIS</strong> untuk pembayaran.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Nama Fasilitas</label>
                <input type="text" value={fasilitas?.nama_fasilitas || ""} disabled
                  className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Nama Pemesan</label>
                <input type="text" value={userName} disabled
                  className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Jadwal Penggunaan</label>
                <input
                  type="date"
                  value={formData.tanggal}
                  disabled={isBooked}
                  className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium"
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Pilih Waktu</label>
                <select
                  disabled={isBooked}
                  value={formData.jadwal_id}
                  className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium"
                  onChange={(e) => setFormData({ ...formData, jadwal_id: e.target.value })}
                >
                  <option value="">-- Pilih Jadwal --</option>
                  {listJadwal.map((j) => {
                    const durasi = hitungDurasi(j.jam_buka, j.jam_tutup);
                    const harga  = isGuest && fasilitas?.harga_per_jam ? fasilitas.harga_per_jam * durasi : null;
                    return (
                      <option key={j.jadwal_id} value={j.jadwal_id}>
                        {j.hari} ({j.jam_buka} - {j.jam_tutup}){harga ? ` — ${formatRupiah(harga)}` : ""}
                      </option>
                    );
                  })}
                </select>

                {isGuest && estimasiHarga && !isBooked && (
                  <div className="mt-2 flex items-center gap-2 bg-orange-50 rounded-xl px-4 py-2.5">
                    <span className="material-symbols-outlined text-orange-400 text-[16px]">payments</span>
                    <p className="text-[12px] text-orange-700 font-semibold">
                      Estimasi biaya: <strong>{formatRupiah(estimasiHarga)}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Detail Pemesanan</label>
                <textarea
                  rows="3"
                  disabled={isBooked}
                  value={formData.detail}
                  className="w-full bg-gray-100 border-none rounded-xl px-5 py-4 text-sm font-medium"
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                />
              </div>
            </div>

            {/* ─── KOLOM KANAN: Preview ─── */}
            <div className="flex flex-col">
              <h2 className="text-orange-500 font-extrabold text-lg border-b pb-4 mb-6">Pratinjau Fasilitas</h2>

              <img
                src={fasilitas?.gambar_url || "https://placehold.co/600x400/f8f9fa/a1a1aa?text=No+Image"}
                className="w-full h-[220px] object-cover rounded-2xl mb-6 border border-gray-200"
                alt={fasilitas?.nama_fasilitas}
              />

              {isGuest && (
                <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6">
                  <span className="material-symbols-outlined text-orange-400 text-[18px] mt-0.5">info</span>
                  <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                    Setelah admin menyetujui, buka <strong>detail pesanan</strong> untuk melihat QRIS pembayaran.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-auto">
                <button
                  onClick={handleBooking}
                  disabled={isBooked || isSubmitting}
                  className={`w-full py-3 rounded-md font-bold text-[14px] ${
                    isBooked
                      ? "bg-[#fed7aa] text-[#ea580c] cursor-not-allowed border border-[#fdba74]"
                      : "bg-[#ff7300] text-white hover:bg-orange-600"
                  }`}
                >
                  {isSubmitting ? "Memproses..." : isBooked ? "Menunggu Konfirmasi" : "Pesan"}
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full py-3 rounded-md bg-white border border-[#dc2626] text-[#dc2626] font-bold text-[14px] hover:bg-red-50"
                >
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