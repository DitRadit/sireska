import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Swal from "sweetalert2";
import bookingService from "../service/bookingService";
import Navbar from "../components/headerComponent";
import Footer from "../components/footerComponent";

const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

const formatTanggal = (tgl) =>
  new Date(tgl).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

const getStatusColor = (status) => {
  if (status === "menunggu")  return "bg-orange-100 text-orange-600";
  if (status === "disetujui") return "bg-green-100 text-green-600";
  if (status === "ditolak")   return "bg-red-100 text-red-600";
  if (status === "selesai")   return "bg-blue-100 text-blue-600";
  return "bg-gray-100 text-gray-600";
};

const DetailPesananPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isGuest = user?.is_guest === true || user?.user?.is_guest === true || user?.role_id === 3;

  const fetchDetail = async () => {
    try {
      const res = await bookingService.getBookingById(id);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // ─── Polling QRIS setiap 15 detik ─────────────────────────────────────────
  useEffect(() => {
    if (!data || !isGuest) return;
    if (data.status !== "disetujui" || data.midtrans_qris_url) return;

    const interval = setInterval(async () => {
      try {
        const res = await bookingService.getBookingById(id);
        setData(res.data);
        if (res.data?.midtrans_qris_url) clearInterval(interval);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [data, isGuest, id]);

  // ─── Simulasi pembayaran sandbox ──────────────────────────────────────────
 const handleSimulasiPembayaran = async () => {
  try {
    setSimulating(true);

    const res = await bookingService.simulasiPembayaran(id);
    console.log("Simulasi response:", res);

    await Swal.fire({ icon: "success", title: "Simulasi berhasil!", timer: 1500, showConfirmButton: false });
    fetchDetail();
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || err.message });
  } finally {
    setSimulating(false);
  }
};

  if (loading) return <div className="h-screen flex items-center justify-center">Memuat detail...</div>;
  if (!data)   return <div className="h-screen flex items-center justify-center text-red-500">Data tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-[Poppins]">
      <Navbar />
      <main className="flex-grow max-w-[1000px] mx-auto w-full px-6 pt-32 pb-20">

        <button
          onClick={() => navigate("/pesanan")}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-500 mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Pesanan
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* ─── KOLOM KIRI ─── */}
            <div className="space-y-6">
              <h2 className="text-orange-500 font-extrabold text-lg border-b pb-4">Detail Pesanan</h2>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Nama Fasilitas</label>
                <input type="text" value={data.fasilitas?.nama_fasilitas || "-"} disabled
                  className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Lokasi</label>
                <input type="text" value={data.fasilitas?.lokasi || "Sport Center"} disabled
                  className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Tanggal</label>
                <input type="text" value={formatTanggal(data.tanggal)} disabled
                  className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Waktu</label>
                <input type="text" value={`${data.jam_mulai} – ${data.jam_selesai}`} disabled
                  className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Keperluan</label>
                <textarea rows="3" value={data.keperluan || "-"} disabled
                  className="w-full bg-gray-100 border-none rounded-xl px-5 py-4 text-sm font-medium cursor-not-allowed" />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-[13px] font-bold text-gray-600">Status:</label>
                <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>

              {data.catatan_admin && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <p className="text-[12px] font-bold text-gray-500 mb-1">Catatan Admin</p>
                  <p className="text-[13px] text-gray-700">{data.catatan_admin}</p>
                </div>
              )}
            </div>

            {/* ─── KOLOM KANAN ─── */}
            <div className="flex flex-col">
              <h2 className="text-orange-500 font-extrabold text-lg border-b pb-4 mb-6">Pratinjau Fasilitas</h2>

              <img
                src={data.fasilitas?.gambar_url || "https://placehold.co/600x400/f8f9fa/a1a1aa?text=No+Image"}
                className="w-full h-[220px] object-cover rounded-2xl mb-6 border border-gray-200"
                alt={data.fasilitas?.nama_fasilitas}
              />

              {/* QRIS panel */}
              {isGuest && data.status === "disetujui" && (
                <div className="mb-6">
                  {data.midtrans_qris_url ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex flex-col items-center text-center">
                      <span className="material-symbols-outlined text-orange-500 text-3xl mb-2">qr_code_2</span>
                      <p className="text-sm font-bold text-gray-700 mb-1">Reservasi Disetujui!</p>
                      <p className="text-[11px] text-gray-500 mb-3">Scan QRIS di bawah untuk menyelesaikan pembayaran</p>
                      {data.total_harga && (
                        <p className="text-lg font-extrabold text-orange-600 mb-4">{formatRupiah(data.total_harga)}</p>
                      )}
                      <div className="bg-white p-3 rounded-xl border border-gray-200">
                        <QRCodeSVG value={data.midtrans_qris_url} size={180} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-3">QRIS berlaku selama 24 jam setelah diterbitkan</p>

                      {/* Tombol simulasi — hanya sandbox & belum lunas */}
                      {data.status_pembayaran !== "lunas" && (
                        <button
                          onClick={handleSimulasiPembayaran}
                          disabled={simulating}
                          className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 text-white text-[13px] font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          {simulating ? "Memproses..." : "[Sandbox] Simulasi Bayar"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col items-center text-center">
                      <span className="material-symbols-outlined text-gray-400 text-3xl mb-2 animate-pulse">hourglass_top</span>
                      <p className="text-sm font-bold text-gray-600 mb-1">Menunggu QRIS diterbitkan</p>
                      <p className="text-[11px] text-gray-400">QRIS akan otomatis muncul di sini setelah reservasi disetujui</p>
                    </div>
                  )}
                </div>
              )}

              {/* Status lunas */}
              {isGuest && data.status_pembayaran === "lunas" && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                  <p className="text-[12px] text-green-700 font-bold">Pembayaran lunas</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DetailPesananPage;