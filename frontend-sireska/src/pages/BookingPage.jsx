import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { QRCodeSVG } from "qrcode.react";
import fasilitasService from "../service/fasilitasServices";
import bookingService from "../service/bookingService";
import Navbar from "../components/headerComponent";
import Footer from "../components/footerComponent";

const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const getNowMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const getTodayString = () => new Date().toISOString().split("T")[0];

// Key per user per fasilitas — user berbeda tidak saling tumpang tindih
const storageKey = (fasilitasId) => {
  const user   = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.user_id || user.user?.user_id || "guest";
  return `sireska_booking_${fasilitasId}_${userId}`;
};

const BookingPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [fasilitas,    setFasilitas]    = useState(null);
  const [slots,        setSlots]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeBooking, setActiveBooking] = useState(null);
  const [qrisString,    setQrisString]    = useState(null);
  const [totalHarga,    setTotalHarga]    = useState(null);

  const [selectedSlots, setSelectedSlots] = useState([]);
  const [formData,      setFormData]      = useState({ tanggal: "", detail: "", dokumen: null, });

  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.nama_lengkap || user.user?.nama_lengkap || "User";
  const isGuest  = user?.is_guest === true || user?.user?.is_guest === true || user?.role_id === 3;

  // ─── Load fasilitas ────────────────────────────────────────────────────────
  useEffect(() => {
    fasilitasService.getFasilitasById(id)
      .then((res) => setFasilitas(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // ─── Restore booking aktif dari localStorage ───────────────────────────────
useEffect(() => {
  const key   = storageKey(id);
  const saved = localStorage.getItem(key);
  if (!saved) return;

  try {
    const booking = JSON.parse(saved);

    bookingService.getBookingById(booking.reservasiId).then((res) => {
      const status            = res.data?.status;
      const status_pembayaran = res.data?.status_pembayaran;

      // Hapus jika ditolak ATAU sudah lunas
      if (!status || status === "ditolak" || status_pembayaran === "lunas") {
        localStorage.removeItem(key);
        return;
      }

      setActiveBooking(booking);

      if (res.data?.midtrans_qris_url) {
        setQrisString(res.data.midtrans_qris_url);
        setTotalHarga(res.data.total_harga);
      }
    }).catch(() => {
      localStorage.removeItem(key);
    });
  } catch {
    localStorage.removeItem(key);
  }
}, [id]);

  // ─── Polling QRIS setiap 10 detik ─────────────────────────────────────────
useEffect(() => {
  if (!activeBooking) return;
  if (isGuest && qrisString) return;

  const interval = setInterval(async () => {
    try {
      const res = await bookingService.getBookingById(activeBooking.reservasiId);
      const data = res.data;

      if (!data || data.status === "ditolak") {
        localStorage.removeItem(storageKey(id));
        setActiveBooking(null);
        setQrisString(null);
        setTotalHarga(null);
        clearInterval(interval);
        Swal.fire({
          icon: "info",
          title: "Pesanan Ditolak",
          text: data?.catatan_admin || "Pesanan kamu ditolak oleh admin.",
          confirmButtonColor: "#f97316",
        });
        return;
      }

      // Clear localStorage setelah lunas
      if (data.status_pembayaran === "lunas") {
        localStorage.removeItem(storageKey(id));
        setActiveBooking(null);
        setQrisString(null);
        setTotalHarga(null);
        clearInterval(interval);
        Swal.fire({
          icon: "success",
          title: "Pembayaran Lunas!",
          text: "Terima kasih, pembayaran kamu sudah dikonfirmasi.",
          confirmButtonColor: "#f97316",
        });
        return;
      }

      if (isGuest && data.midtrans_qris_url) {
        setQrisString(data.midtrans_qris_url);
        setTotalHarga(data.total_harga);
        clearInterval(interval);
        return;
      }

      if (!isGuest && data.status === "disetujui") {
        const updated = { ...activeBooking, status: "disetujui" };
        localStorage.setItem(storageKey(id), JSON.stringify(updated));
        setActiveBooking(updated);
        clearInterval(interval);
      }

    } catch { /* abaikan */ }
  }, 10000);

  return () => clearInterval(interval);
}, [activeBooking, isGuest, qrisString, id]);

  // ─── Fetch slot saat tanggal berubah ──────────────────────────────────────
  useEffect(() => {
    if (!formData.tanggal || activeBooking) return;

    let cancelled = false;

    const fetchSlots = async () => {
      setSelectedSlots([]);
      setLoadingSlots(true);
      try {
        const res = await bookingService.getSlotTersedia(id, formData.tanggal);
        if (!cancelled) setSlots(res.slots || []);
      } catch (err) {
        console.error("Error fetch slot:", err);
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    fetchSlots();
    return () => { cancelled = true; };
  }, [formData.tanggal, id, activeBooking]);

  // ─── Cek apakah slot sudah lewat ──────────────────────────────────────────
  const isSlotLewat = useCallback((slot) => {
    if (formData.tanggal !== getTodayString()) return false;
    return timeToMinutes(slot.jam_mulai) < getNowMinutes();
  }, [formData.tanggal]);

  // ─── Toggle slot ──────────────────────────────────────────────────────────
  const toggleSlot = useCallback((index) => {
    const slot = slots[index];
    if (!slot?.tersedia || isSlotLewat(slot)) return;

    setSelectedSlots((prev) => {
      if (prev.includes(index)) {
        const next = prev.filter((i) => i !== index);
        if (next.length === 0) return next;
        const min = Math.min(...next), max = Math.max(...next);
        return next.length === max - min + 1 ? next : [];
      }

      const next = [...prev, index].sort((a, b) => a - b);
      const min  = Math.min(...next);
      const max  = Math.max(...next);

      for (let i = min; i <= max; i++) {
        if (!slots[i]?.tersedia || isSlotLewat(slots[i])) {
          Swal.fire({
            icon: "warning", title: "Slot tidak bisa dipilih",
            text: "Ada slot yang tidak tersedia atau sudah lewat di antara pilihanmu.",
            timer: 1500, showConfirmButton: false,
          });
          return prev;
        }
      }

      return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    });
  }, [slots, isSlotLewat]);

  // ─── Hitung jam range ─────────────────────────────────────────────────────
  const jamRange = (() => {
    if (selectedSlots.length === 0) return null;
    const sorted = [...selectedSlots].sort((a, b) => a - b);
    return {
      jam_mulai:   slots[sorted[0]]?.jam_mulai,
      jam_selesai: slots[sorted[sorted.length - 1]]?.jam_selesai,
      durasi:      selectedSlots.length,
    };
  })();

  const estimasiHarga = isGuest && fasilitas?.harga_per_jam && jamRange
    ? parseFloat(fasilitas.harga_per_jam) * jamRange.durasi
    : null;

  // ─── Submit booking ────────────────────────────────────────────────────────
  const handleBooking = async () => {
    if (!formData.tanggal || !jamRange || !formData.detail.trim()) {
      return Swal.fire({ icon: "warning", title: "Oops!", text: "Lengkapi semua data dan pilih jam!" });
    }
    try {
      setIsSubmitting(true);
const res = await bookingService.createBooking({
    fasilitas_id: parseInt(id),
    tanggal:      formData.tanggal,
    jam_mulai:    jamRange.jam_mulai,
    jam_selesai:  jamRange.jam_selesai,
    keperluan:    formData.detail,
    dokumen:      formData.dokumen || null, // ← tambah
});

      const booking = {
        reservasiId: res.data.reservasi_id,
        tanggal:     formData.tanggal,
        jam_mulai:   jamRange.jam_mulai,
        jam_selesai: jamRange.jam_selesai,
      };

      setActiveBooking(booking);
      localStorage.setItem(storageKey(id), JSON.stringify(booking));

      await Swal.fire({
        icon: "success", title: "Berhasil!",
        text: isGuest
          ? "Reservasi menunggu persetujuan admin. QRIS akan muncul setelah disetujui."
          : "Reservasi menunggu persetujuan admin.",
        confirmButtonColor: "#f97316",
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Terjadi kesalahan." });
      setIsSubmitting(false);
    }
  };

  // ─── Cancel booking ────────────────────────────────────────────────────────
  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "Yakin batalkan?", text: "Pesanan akan dibatalkan.",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#dc2626", confirmButtonText: "Ya, Batalkan",
      cancelButtonText: "Tidak",
    });
    if (!result.isConfirmed) return;
    try {
      if (activeBooking) await bookingService.cancelBooking(activeBooking.reservasiId);
      setActiveBooking(null);
      setQrisString(null);
      setTotalHarga(null);
      setSelectedSlots([]);
      setFormData({ tanggal: "", detail: "" });
      localStorage.removeItem(storageKey(id));
      Swal.fire({ icon: "success", title: "Dibatalkan", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal membatalkan pesanan." });
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-gray-500 font-medium animate-pulse">Memuat...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col" style={{ fontFamily: "Poppins, sans-serif" }}>
      <Navbar />
      <main className="flex-grow max-w-[1000px] mx-auto w-full px-6 pt-32 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* KOLOM KIRI */}
            <div className="space-y-6">
              <h2 className="text-orange-500 font-extrabold text-lg border-b pb-4">Informasi Pesanan</h2>

              {isGuest && (
                <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-orange-400 text-[18px] mt-0.5">info</span>
                  <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                    Sebagai tamu, reservasi dikenakan biaya. QRIS pembayaran muncul otomatis setelah admin menyetujui.
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
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Tanggal</label>
                {activeBooking ? (
                  <input type="text" value={activeBooking.tanggal} disabled
                    className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium cursor-not-allowed" />
                ) : (
                  <input
                    type="date"
                    value={formData.tanggal}
                    min={getTodayString()}
                    className="w-full bg-gray-100 border-none rounded-xl px-5 py-3.5 text-sm font-medium"
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  />
                )}
              </div>

              {/* Slot Picker */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[13px] font-bold text-gray-600">Pilih Jam</label>
                  {fasilitas && (
                    <span className="text-[11px] text-gray-400">
                      {fasilitas.jam_buka} – {fasilitas.jam_tutup} WIB
                    </span>
                  )}
                </div>

                {activeBooking ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                    <p className="text-[13px] font-bold text-orange-700">
                      {activeBooking.jam_mulai} – {activeBooking.jam_selesai}
                    </p>
                  </div>
                ) : !formData.tanggal ? (
                  <p className="text-[12px] text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                    Pilih tanggal terlebih dahulu
                  </p>
                ) : loadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-[12px] text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                    Tidak ada slot tersedia untuk tanggal ini
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((slot, index) => {
                        const lewat      = isSlotLewat(slot);
                        const isUnavail  = !slot.tersedia || lewat;
                        const isSelected = selectedSlots.includes(index);
                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={isUnavail}
                            onClick={() => toggleSlot(index)}
                            className={`relative px-2 py-3 text-[11px] font-bold rounded-xl border transition-all duration-150 ${
                              isUnavail
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : isSelected
                                ? "bg-orange-500 text-white border-orange-500 shadow-md scale-[1.02]"
                                : "bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-500"
                            }`}
                          >
                            <span className="block text-[12px] font-bold">{slot.jam_mulai}</span>
                            <span className={`block text-[9px] font-normal mt-0.5 ${isSelected ? "text-orange-100" : "text-gray-400"}`}>
                              {lewat ? "Lewat" : !slot.tersedia ? "Penuh" : `s/d ${slot.jam_selesai}`}
                            </span>
                            {isSelected && (
                              <span className="absolute top-1 right-1.5 text-[8px] font-black text-orange-200">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-orange-500" />
                        <span className="text-[10px] text-gray-500">Dipilih</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-white border border-gray-200" />
                        <span className="text-[10px] text-gray-500">Tersedia</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" />
                        <span className="text-[10px] text-gray-500">Tidak tersedia / Lewat</span>
                      </div>
                    </div>

                    {jamRange && (
                      <div className="mt-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 space-y-1">
                        <p className="text-[12px] font-bold text-orange-700 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {jamRange.jam_mulai} – {jamRange.jam_selesai}
                          <span className="text-orange-400 font-normal">({jamRange.durasi} jam)</span>
                        </p>
                        {isGuest && estimasiHarga && (
                          <p className="text-[12px] font-bold text-orange-700 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">payments</span>
                            Estimasi: <strong>{formatRupiah(estimasiHarga)}</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-2">Keperluan</label>
                <textarea
                  rows="3"
                  disabled={!!activeBooking}
                  value={formData.detail}
                  placeholder="Masukkan detail keperluan..."
                  className="w-full bg-gray-100 border-none rounded-xl px-5 py-4 text-sm font-medium resize-none"
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                />
              </div>
            </div>


            {/* KOLOM KANAN */}
            <div className="flex flex-col">
              <h2 className="text-orange-500 font-extrabold text-lg border-b pb-4 mb-6">Pratinjau Fasilitas</h2>

              <img
                src={fasilitas?.gambar_url || "https://placehold.co/600x400/f8f9fa/a1a1aa?text=No+Image"}
                className="w-full h-[200px] object-cover rounded-2xl mb-4 border border-gray-200"
                alt={fasilitas?.nama_fasilitas}
              />

              {fasilitas && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 mb-4">
                  <span className="material-symbols-outlined text-gray-400 text-[16px]">schedule</span>
                  <p className="text-[12px] font-semibold text-gray-600">
                    Jam Operasional: <span className="text-gray-800">{fasilitas.jam_buka} – {fasilitas.jam_tutup} WIB</span>
                  </p>
                </div>
              )}
                          {/* UPLOAD DOKUMEN */}
<div>
    <label className="block text-[13px] font-bold text-gray-600 mb-1">
        Upload Dokumen
        <span className="text-gray-400 font-normal ml-1">(opsional)</span>
    </label>
    <p className="text-[11px] text-gray-400 mb-2">
        KTM, surat izin, atau dokumen pendukung lainnya
    </p>

    {activeBooking ? (
        // Tampilkan dokumen yang sudah diupload (jika ada)
        formData.dokumen ? (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-gray-400 text-[18px]">description</span>
                <span className="text-[12px] font-medium text-gray-600 truncate">{formData.dokumen.name}</span>
            </div>
        ) : (
            <p className="text-[12px] text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                Tidak ada dokumen diupload
            </p>
        )
    ) : (
        <label className="flex items-center gap-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors group">
            <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setFormData({ ...formData, dokumen: e.target.files[0] || null })}
            />
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-orange-300 transition-colors">
                <span className="material-symbols-outlined text-gray-400 group-hover:text-orange-500 text-[20px] transition-colors">
                    upload_file
                </span>
            </div>
            <div className="flex-1 min-w-0">
                {formData.dokumen ? (
                    <div>
                        <p className="text-[12px] font-bold text-orange-600 truncate">{formData.dokumen.name}</p>
                        <p className="text-[10px] text-gray-400">
                            {(formData.dokumen.size / 1024 / 1024).toFixed(2)} MB · Klik untuk ganti
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-[12px] font-bold text-gray-600 group-hover:text-orange-600 transition-colors">
                            Klik untuk upload
                        </p>
                        <p className="text-[10px] text-gray-400">PDF, JPG, PNG (max 5MB)</p>
                    </div>
                )}
            </div>
            {formData.dokumen && (
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setFormData({ ...formData, dokumen: null }); }}
                    className="shrink-0 w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
                >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
            )}
        </label>
    )}
</div>

              {isGuest && fasilitas?.harga_per_jam && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 mb-4">
                  <span className="material-symbols-outlined text-orange-400 text-[16px]">payments</span>
                  <p className="text-[12px] font-semibold text-orange-700">
                    Harga: <span className="font-extrabold">{formatRupiah(fasilitas.harga_per_jam)}</span>/jam
                  </p>
                </div>
              )}

              {activeBooking && isGuest && (
                <div className="mb-6 flex-1">
                  {qrisString ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex flex-col items-center text-center">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                      </div>
                      <p className="text-sm font-bold text-gray-800 mb-0.5">Reservasi Disetujui!</p>
                      <p className="text-[11px] text-gray-500 mb-3">Scan QRIS untuk menyelesaikan pembayaran</p>
                      {totalHarga && (
                        <p className="text-xl font-extrabold text-orange-600 mb-4">{formatRupiah(totalHarga)}</p>
                      )}
                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <QRCodeSVG value={qrisString} size={190} level="M" />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-3">Berlaku 24 jam · Bisa dibayar via app apapun</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col items-center text-center">
                      <span className="material-symbols-outlined text-gray-300 text-4xl mb-2 animate-pulse">hourglass_top</span>
                      <p className="text-sm font-bold text-gray-600 mb-1">Menunggu Persetujuan Admin</p>
                      <p className="text-[11px] text-gray-400 mb-3">QRIS muncul otomatis setelah disetujui</p>
                      <div className="flex items-center gap-1.5">
                        {[0, 150, 300].map((delay) => (
                          <span key={delay} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                            style={{ animationDelay: `${delay}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
{activeBooking && !isGuest && (
  <div className={`border rounded-2xl p-5 flex flex-col items-center text-center mb-6 ${
    activeBooking.status === "disetujui"
      ? "bg-green-50 border-green-200"
      : "bg-blue-50 border-blue-200"
  }`}>
    <span className={`material-symbols-outlined text-3xl mb-2 ${
      activeBooking.status === "disetujui"
        ? "text-green-500"
        : "text-blue-400 animate-pulse"
    }`}>
      {activeBooking.status === "disetujui" ? "check_circle" : "hourglass_top"}
    </span>
    <p className="text-sm font-bold text-gray-700 mb-1">
      {activeBooking.status === "disetujui"
        ? "Reservasi Disetujui!"
        : "Menunggu Persetujuan Admin"}
    </p>
    <p className="text-[11px] text-gray-400">
      {activeBooking.status === "disetujui"
        ? "Silakan datang sesuai jadwal yang telah dipesan."
        : "Kamu akan diberitahu jika ada update"}
    </p>
  </div>
)}
  
              <div className="flex flex-col gap-3 mt-auto">
                {!activeBooking ? (
                  <button
                    onClick={handleBooking}
                    disabled={isSubmitting || !jamRange}
                    className={`w-full py-3 rounded-xl font-bold text-[14px] transition-all ${
                      isSubmitting || !jamRange
                        ? "bg-orange-200 text-orange-400 cursor-not-allowed"
                        : "bg-[#ff7300] text-white hover:bg-orange-600 shadow-sm"
                    }`}
                  >
                    {isSubmitting ? "Memproses..." : "Pesan Sekarang"}
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="w-full py-3 rounded-xl bg-white border border-red-500 text-red-500 font-bold text-[14px] hover:bg-red-50 transition-colors"
                  >
                    Batalkan Pesanan
                  </button>
                )}
                <button
                  onClick={() => navigate("/fasilitas")}
                  className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-[14px] hover:bg-gray-50 transition-colors"
                >
                  Kembali ke Fasilitas
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