import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const FasilitasDetailPage = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [fasilitas, setFasilitas] = useState(null);
  const [loading, setLoading]     = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [slots,        setSlots]        = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isGuest = user?.is_guest === true || user?.user?.is_guest === true || user?.role_id === 3;

  const isSlotLewat = (slot) => {
    if (selectedDate !== getTodayString()) return false;
    return timeToMinutes(slot.jam_mulai) < getNowMinutes();
  };

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

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlots([]);
      try {
        const res = await bookingService.getSlotTersedia(id, selectedDate);
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
  }, [selectedDate, id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-orange-500 text-4xl">autorenew</span>
          <p className="text-gray-500 text-sm font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!fasilitas) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-3">search_off</span>
          <p className="text-gray-500 font-medium">Fasilitas tidak ditemukan.</p>
          <button onClick={() => navigate("/fasilitas")} className="mt-4 text-orange-500 font-bold text-sm hover:underline">
            Kembali ke Daftar Fasilitas
          </button>
        </div>
      </div>
    );
  }



const statusConfig = {
    aktif:            { label: "Tersedia",         bg: "bg-green-100",  text: "text-green-700" },
    sedang_digunakan: { label: "Sedang Digunakan", bg: "bg-blue-100",   text: "text-blue-700" },
    maintenance:      { label: "Maintenance",      bg: "bg-yellow-100", text: "text-yellow-700" },
    nonaktif:         { label: "Nonaktif",         bg: "bg-red-100",    text: "text-red-700" },
};
  const status = statusConfig[fasilitas.status] || statusConfig.nonaktif;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

      <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
        <Navbar />

        <main className="flex-grow max-w-[1000px] mx-auto w-full px-6 pt-32 pb-20">

          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-6">
            <button onClick={() => navigate("/fasilitas")} className="hover:text-orange-500 transition-colors">Fasilitas</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-gray-600 font-semibold">{fasilitas.nama_fasilitas}</span>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* ─── KOLOM KIRI ─── */}
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-extrabold text-gray-800 leading-snug">{fasilitas.nama_fasilitas}</h1>
                    {fasilitas.tipe && (
                      <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                        {fasilitas.tipe}
                      </span>
                    )}
                  </div>
                  <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>

                {/* INFO GRID */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-orange-400 text-[18px]">location_on</span>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Lokasi</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{fasilitas.lokasi || "-"}</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-orange-400 text-[18px]">group</span>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Kapasitas</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {fasilitas.kapasitas ? `${fasilitas.kapasitas} Orang` : "-"}
                    </p>
                  </div>

                  {isGuest && fasilitas.harga_per_jam && (
                    <div className="bg-orange-50 rounded-2xl p-4 col-span-2 border border-orange-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-orange-400 text-[18px]">payments</span>
                        <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wide">Harga Sewa</p>
                      </div>
                      <p className="text-lg font-extrabold text-orange-600">
                        {formatRupiah(fasilitas.harga_per_jam)}
                        <span className="text-sm font-semibold text-orange-400">/jam</span>
                      </p>
                      <p className="text-[10px] text-orange-400 mt-1">* Harga berlaku untuk pengguna tamu. Pembayaran via QRIS setelah disetujui admin.</p>
                    </div>
                  )}

                  {fasilitas.alamat && (
                    <div className="bg-gray-50 rounded-2xl p-4 col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-orange-400 text-[18px]">map</span>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Alamat</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{fasilitas.alamat}</p>
                    </div>
                  )}
                </div>

                {/* DESKRIPSI */}
                {fasilitas.deskripsi && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-400 text-[18px]">description</span>
                      Deskripsi
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed bg-gray-50 rounded-2xl p-4">{fasilitas.deskripsi}</p>
                  </div>
                )}


                {/* CEK KETERSEDIAAN SLOT */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-400 text-[18px]">event_available</span>
                    Cek Ketersediaan Slot
                  </h3>

                  {/* Date Picker */}
                  <div className="mb-4">
                    <label className="block text-[12px] font-bold text-gray-500 mb-2">Pilih Tanggal</label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={getTodayString()}
                      className="w-full bg-gray-100 border-none rounded-xl px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-300"
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>

                  {/* Slot Display */}
                  {!selectedDate ? (
                    <p className="text-[12px] text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                      Pilih tanggal untuk melihat slot yang tersedia
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
                          const lewat     = isSlotLewat(slot);
                          const isUnavail = !slot.tersedia || lewat;
                          return (
                            <div
                              key={index}
                              className={`px-2 py-3 text-[11px] font-bold rounded-xl border ${
                                isUnavail
                                  ? "bg-gray-100 text-gray-400 border-gray-200"
                                  : "bg-white text-gray-700 border-gray-200"
                              }`}
                            >
                              <span className="block text-[12px] font-bold">{slot.jam_mulai}</span>
                              <span className={`block text-[9px] font-normal mt-0.5 ${isUnavail ? "text-gray-400" : "text-green-500"}`}>
                                {lewat ? "Lewat" : !slot.tersedia ? "Penuh" : `s/d ${slot.jam_selesai}`}
                              </span>
                              <span className={`block text-[9px] font-bold mt-1 ${isUnavail ? "text-gray-300" : "text-green-600"}`}>
                                {lewat ? "–" : !slot.tersedia ? "–" : "Tersedia"}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm bg-white border border-gray-200" />
                          <span className="text-[10px] text-gray-500">Tersedia</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" />
                          <span className="text-[10px] text-gray-500">Tidak tersedia / Lewat</span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mt-3 bg-gray-50 rounded-xl px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[11px] text-gray-500 font-medium">
                          {slots.filter(s => s.tersedia && !isSlotLewat(s)).length} slot tersedia
                          {" "}dari {slots.length} total
                        </span>
                        {fasilitas.status === "aktif" && (
                          <button
                            onClick={() => navigate(`/booking/${fasilitas.fasilitas_id}`)}
                            className="text-[11px] font-bold text-orange-500 hover:underline"
                          >
                            Pesan →
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ─── KOLOM KANAN ─── */}
              <div className="flex flex-col">
                <h2 className="text-orange-500 font-extrabold text-lg border-b pb-4 mb-6">Pratinjau Fasilitas</h2>

                <img
                  src={fasilitas.gambar_url || "https://placehold.co/600x400/f8f9fa/a1a1aa?text=No+Image"}
                  alt={fasilitas.nama_fasilitas}
                  className="w-full h-[280px] object-cover rounded-2xl border border-gray-200 mb-6"
                />

                {fasilitas.latitude && fasilitas.longitude && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-400 text-[18px]">location_on</span>
                      Lokasi di Peta
                    </h3>
                    <div className="rounded-2xl overflow-hidden border border-gray-200 h-[160px]">
                      <iframe
                        title="map"
                        className="w-full h-full border-0"
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${fasilitas.longitude - 0.002},${fasilitas.latitude - 0.002},${fasilitas.longitude + 0.002},${fasilitas.latitude + 0.002}&layer=mapnik&marker=${fasilitas.latitude},${fasilitas.longitude}`}
                      />
                    </div>
<a
  href={`https://www.google.com/maps?q=${fasilitas.latitude},${fasilitas.longitude}`}
  target="_blank"
  rel="noreferrer"
  className="text-[11px] text-orange-500 font-bold hover:underline mt-1.5 inline-block"
>
  Buka di Google Maps →
</a>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-auto">
                  <button
                    onClick={() => navigate(`/booking/${fasilitas.fasilitas_id}`)}
                    disabled={fasilitas.status !== "aktif"}
                    className={`w-full py-3 rounded-xl font-bold text-[14px] transition-colors ${
                      fasilitas.status === "aktif"
                        ? "bg-[#ff7300] text-white hover:bg-orange-600"
                        : "bg-orange-100 text-orange-300 cursor-not-allowed"
                    }`}
                  >
                    {fasilitas.status === "aktif" ? "Pesan Sekarang" : "Tidak Tersedia"}
                  </button>
                  <button
                    onClick={() => navigate("/fasilitas")}
                    className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-[14px] hover:bg-gray-50 transition-colors"
                  >
                    Kembali
                  </button>
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

export default FasilitasDetailPage;