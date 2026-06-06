import { useEffect, useState } from "react";
import SidebarComponent from "../../components/sidebarComponent";
import bookingService from "../../service/bookingService";

// ─── Helper ────────────────────────────────────────────────────────────────────
const formatRupiah = (angka) =>
  angka
    ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka)
    : "-";

const formatTanggal = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

const STATUS_CONFIG = {
  menunggu:  { label: "Menunggu Verifikasi", bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-200" },
  disetujui: { label: "Disetujui",           bg: "bg-orange-500",text: "text-white",       border: "border-orange-500" },
  ditolak:   { label: "Ditolak",             bg: "bg-red-50",    text: "text-red-400",     border: "border-red-200" },
};

const BAYAR_CONFIG = {
  belum_bayar:          { label: "Belum Bayar",          bg: "bg-red-50",    text: "text-red-400" },
  menunggu_pembayaran:  { label: "Menunggu Pembayaran",  bg: "bg-yellow-50", text: "text-yellow-600" },
  lunas:                { label: "Lunas",                bg: "bg-green-50",  text: "text-green-600" },
  expired:              { label: "Expired",              bg: "bg-gray-100",  text: "text-gray-400" },
};

// ─── Modal Konfirmasi ──────────────────────────────────────────────────────────
const ConfirmModal = ({ type, onConfirm, onCancel, loading }) => {
  const [catatan, setCatatan] = useState("");
  const isReject = type === "reject";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-7 w-full max-w-sm mx-4 animate-fade-in">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isReject ? "bg-red-50" : "bg-orange-50"}`}>
          <span className={`material-symbols-outlined text-[24px] ${isReject ? "text-red-500" : "text-orange-500"}`}>
            {isReject ? "cancel" : "check_circle"}
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">
          {isReject ? "Tolak Pesanan?" : "Setujui Pesanan?"}
        </h3>
        <p className="text-xs text-gray-400 font-medium mb-4">
          {isReject
            ? "Pesanan akan ditolak dan pengguna akan diberitahu."
            : "Pesanan akan disetujui dan pengguna akan diberitahu."}
        </p>

        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-600 mb-1.5">
            Catatan Admin {!isReject && <span className="text-gray-400 font-normal">(opsional)</span>}
          </label>
          <textarea
            rows="3"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder={isReject ? "Tuliskan alasan penolakan..." : "Tambahkan catatan (opsional)..."}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-400 focus:bg-white transition-all resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(catatan)}
            disabled={loading || (isReject && !catatan.trim())}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-50 ${
              isReject ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading ? "Memproses..." : isReject ? "Tolak" : "Setujui"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Row Accordion ─────────────────────────────────────────────────────────────
const BookingRow = ({ item, onRefresh }) => {
  const [open, setOpen]           = useState(false);
  const [modal, setModal]         = useState(null); // "approve" | "reject" | null
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]         = useState(null);

  const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.menunggu;
  const bayarCfg  = BAYAR_CONFIG[item.status_pembayaran] || BAYAR_CONFIG.belum_bayar;

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAction = async (catatan) => {
    setActionLoading(true);
    try {
      if (modal === "approve") {
        await bookingService.approveBooking(item.reservasi_id, catatan);
        showToast("Pesanan berhasil disetujui!");
      } else {
        await bookingService.rejectBooking(item.reservasi_id, catatan);
        showToast("Pesanan berhasil ditolak.");
      }
      setModal(null);
      setOpen(false);
      onRefresh();
    } catch (err) {
      showToast(err?.response?.data?.message || "Terjadi kesalahan", false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {/* Toast per-row */}
      {toast && (
        <tr>
          <td colSpan="4">
            <div className={`mx-4 my-1 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${toast.ok ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
              <span className="material-symbols-outlined text-[16px]">{toast.ok ? "check_circle" : "error"}</span>
              {toast.msg}
            </div>
          </td>
        </tr>
      )}

      {/* ROW UTAMA */}
      <tr
        className={`border-b border-gray-100 transition-colors cursor-pointer ${open ? "bg-orange-50/40" : "hover:bg-gray-50/60"}`}
        onClick={() => setOpen((p) => !p)}
      >
        <td className="py-4 px-5 text-sm font-bold text-gray-700">
          #{item.midtrans_order_id || `RES-${item.reservasi_id}`}
        </td>
        <td className="py-4 px-5 text-sm font-medium text-gray-600">
          {item.fasilitas?.nama_fasilitas || "-"}
        </td>
        <td className="py-4 px-5">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
            {statusCfg.label}
          </span>
        </td>
        <td className="py-4 px-5 text-right">
          <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 text-[20px] ${open ? "rotate-45" : ""}`}>
            {open ? "close" : "expand_more"}
          </span>
        </td>
      </tr>

      {/* ROW DETAIL (accordion) */}
      {open && (
        <tr className="border-b border-gray-100 bg-white">
          <td colSpan="4" className="px-5 py-5">
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 mb-5">
              {/* Nama Pengguna */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Nama Pengguna</p>
                <p className="text-sm font-semibold text-gray-700">{item.user?.nama_lengkap || "-"}</p>
              </div>
              {/* Tanggal */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Tanggal</p>
                <p className="text-sm font-semibold text-gray-700">{formatTanggal(item.tanggal)}</p>
              </div>
              {/* Jam Pemakaian */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Jam Pemakaian</p>
                <p className="text-sm font-semibold text-gray-700">
                  {item.jam_mulai && item.jam_selesai ? `${item.jam_mulai} - ${item.jam_selesai}` : "-"}
                </p>
              </div>
              {/* Status Pembayaran */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Status Pembayaran</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${bayarCfg.bg} ${bayarCfg.text}`}>
                  {bayarCfg.label}
                </span>
              </div>
              {/* Status Fasilitas */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Status Fasilitas</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  item.fasilitas?.status === "aktif" ? "bg-blue-50 text-blue-500" : "bg-gray-100 text-gray-400"
                }`}>
                  {item.fasilitas?.status === "aktif" ? "Tersedia" : item.fasilitas?.status || "-"}
                </span>
              </div>
              {/* Total Harga */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Total Harga</p>
                <p className="text-sm font-bold text-gray-700">{formatRupiah(item.total_harga)}</p>
              </div>
            </div>

            {/* Catatan admin jika ada */}
            {item.catatan_admin && (
              <div className="mb-4 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Catatan Admin</p>
                <p className="text-sm text-gray-600 font-medium">{item.catatan_admin}</p>
              </div>
            )}

            {/* Keperluan */}
            {item.keperluan && (
              <div className="mb-4 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Keperluan</p>
                <p className="text-sm text-gray-600 font-medium">{item.keperluan}</p>
              </div>
            )}

            {/* ACTION ROW */}
            <div className="flex items-center justify-between mt-2">
              {/* Lihat Dokumen */}
<div>
  {item.dokumen_url ? (
    <a
      href={item.dokumen_url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
    >
      <span className="material-symbols-outlined text-[16px]">description</span>
      Lihat Dokumen
    </a>
  ) : (
    <span className="text-xs text-gray-300 font-medium">Tidak ada dokumen</span>
  )}
</div>

              {/* Tombol Aksi — hanya tampil jika status masih menunggu */}
              {item.status === "menunggu" && (
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setModal("reject")}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                    Tolak
                  </button>
                  <button
                    onClick={() => setModal("approve")}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[15px]">check</span>
                    Setujui
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {/* Modal konfirmasi */}
      {modal && (
        <ConfirmModal
          type={modal}
          loading={actionLoading}
          onConfirm={handleAction}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
const AdminPemesananPage = () => {
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getAllBookings({ status: filterStatus || undefined });
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filterStatus]);

  const counts = {
    semua:    bookings.length,
    menunggu: bookings.filter((b) => b.status === "menunggu").length,
    disetujui:bookings.filter((b) => b.status === "disetujui").length,
    ditolak:  bookings.filter((b) => b.status === "ditolak").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        @keyframes fade-in { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }
        .animate-fade-in { animation: fade-in .18s ease; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

      <div className="bg-[#f7f5f4] min-h-screen flex">
        <SidebarComponent />

        <div className="flex-1 lg:ml-[260px] w-full overflow-x-hidden flex flex-col">

          {/* HEADER */}
          <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-10 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800">Verifikasi Pesanan</h1>
            <p className="text-gray-500 mt-0.5 text-sm font-medium">Verifikasi pemesanan fasilitas pengguna</p>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {[
                { key: "",          label: "Semua Pesanan",       icon: "list_alt",     color: "lime" },
                { key: "menunggu",  label: "Menunggu Verifikasi", icon: "hourglass_top",color: "blue" },
                { key: "disetujui", label: "Disetujui",           icon: "check_circle", color: "orange" },
                { key: "ditolak",   label: "Ditolak",             icon: "cancel",       color: "red" },
              ].map(({ key, label, icon, color }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col text-left transition-all hover:shadow-md ${
                    filterStatus === key ? "border-orange-400 ring-2 ring-orange-200" : "border-gray-100"
                  }`}
                >
                  <div className={`h-1.5 w-full bg-${color}-500`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                      <div className={`bg-${color}-50 w-9 h-9 rounded-xl flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-${color}-500 text-[18px]`}>{icon}</span>
                      </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-800">
                      {key === "" ? counts.semua : counts[key]}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-800">
                  {filterStatus
                    ? `Pesanan ${STATUS_CONFIG[filterStatus]?.label || filterStatus}`
                    : "Semua Pesanan"}
                </h2>
                <button
                  onClick={fetchBookings}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">ID Pemesanan</th>
                      <th className="text-left py-3 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Fasilitas</th>
                      <th className="text-left py-3 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-5" />
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center py-16">
                          <span className="material-symbols-outlined animate-spin text-orange-400 text-3xl block mx-auto mb-2">autorenew</span>
                          <p className="text-sm text-gray-400 font-medium">Memuat data...</p>
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-16">
                          <span className="material-symbols-outlined text-gray-200 text-4xl block mx-auto mb-2">inbox</span>
                          <p className="text-sm text-gray-400 font-medium">Tidak ada pesanan.</p>
                        </td>
                      </tr>
                    ) : (
                      bookings.map((item) => (
                        <BookingRow key={item.reservasi_id} item={item} onRefresh={fetchBookings} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPemesananPage;