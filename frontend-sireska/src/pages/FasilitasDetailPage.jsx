import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import fasilitasService from "../service/fasilitasServices";
import Navbar from "../components/headerComponent";
import Footer from "../components/footerComponent";

const FasilitasDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fasilitas, setFasilitas] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-orange-500 text-4xl">
            autorenew
          </span>
          <p className="text-gray-500 text-sm font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!fasilitas) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-3">
            search_off
          </span>
          <p className="text-gray-500 font-medium">Fasilitas tidak ditemukan.</p>
          <button
            onClick={() => navigate("/fasilitas")}
            className="mt-4 text-orange-500 font-bold text-sm hover:underline"
          >
            Kembali ke Daftar Fasilitas
          </button>
        </div>
      </div>
    );
  }

  const listJadwal = fasilitas?.jadwal || [];

  const hariOrder = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];
  const jadwalSorted = [...listJadwal].sort(
    (a, b) => hariOrder.indexOf(a.hari) - hariOrder.indexOf(b.hari)
  );

  const statusConfig = {
    aktif: { label: "Tersedia", bg: "bg-green-100", text: "text-green-700" },
    maintenance: { label: "Maintenance", bg: "bg-yellow-100", text: "text-yellow-700" },
    nonaktif: { label: "Nonaktif", bg: "bg-red-100", text: "text-red-700" },
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
            <button onClick={() => navigate("/fasilitas")} className="hover:text-orange-500 transition-colors">
              Fasilitas
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-gray-600 font-semibold">{fasilitas.nama_fasilitas}</span>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* ─── KOLOM KIRI ─── */}
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-extrabold text-gray-800 leading-snug">
                      {fasilitas.nama_fasilitas}
                    </h1>
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
                    <p className="text-sm text-gray-500 leading-relaxed bg-gray-50 rounded-2xl p-4">
                      {fasilitas.deskripsi}
                    </p>
                  </div>
                )}

                {/* JADWAL */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-400 text-[18px]">schedule</span>
                    Jadwal Operasional
                  </h3>

                  {jadwalSorted.length === 0 ? (
                    <p className="text-sm text-gray-400 bg-gray-50 rounded-2xl p-4">
                      Belum ada jadwal operasional.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {jadwalSorted.map((j) => (
                        <div
                          key={j.jadwal_id}
                          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5"
                        >
                          <span className="text-sm font-semibold text-gray-700 capitalize w-20">
                            {j.hari}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">
                            {j.jam_buka} – {j.jam_tutup}
                          </span>
                          <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-md">
                            Buka
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ─── KOLOM KANAN ─── */}
              <div className="flex flex-col">
                <h2 className="text-orange-500 font-extrabold text-lg border-b pb-4 mb-6">
                  Pratinjau Fasilitas
                </h2>

                <img
                  src={fasilitas.gambar_url || "https://placehold.co/600x400/f8f9fa/a1a1aa?text=No+Image"}
                  alt={fasilitas.nama_fasilitas}
                  className="w-full h-[280px] object-cover rounded-2xl border border-gray-200 mb-6"
                />

                {/* MINI MAP jika ada koordinat */}
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

                {/* TOMBOL */}
                <div className="flex flex-col gap-3 mt-auto">
                  <button
                    onClick={() => navigate(`/booking/${fasilitas.fasilitas_id}`)}
                    disabled={fasilitas.status !== "aktif"}
                    className={`w-full py-3 rounded-xl font-bold text-[14px] transition-colors
                      ${fasilitas.status === "aktif"
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