import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarComponent from "../../components/sidebarComponent";
import fasilitasService from "../../service/fasilitasServices";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ← DI LUAR KOMPONEN (bukan state, hanya komponen helper)
const PinPointPicker = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const TambahFasilitas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [markerPos, setMarkerPos] = useState(null); // ← PINDAH KE DALAM KOMPONEN

  const [formData, setFormData] = useState({
    nama_fasilitas: "",
    lokasi: "",
    alamat: "",
    latitude: "",
    longitude: "",
    tipe: "Outdoor",
    kapasitas: "",
    deskripsi: "",
    gambar: null,
    status: "aktif",
  });

  const [jadwal, setJadwal] = useState([
    { hari: "senin", jam_buka: "08:00", jam_tutup: "17:00" },
  ]);

  // ← PINDAH KE DALAM KOMPONEN
  const handleMapPick = (lat, lng) => {
    const latStr = lat.toFixed(7);
    const lngStr = lng.toFixed(7);
    setMarkerPos([lat, lng]);
    setFormData((prev) => ({
      ...prev,
      latitude: latStr,
      longitude: lngStr,
    }));
  };

  useEffect(() => {
    if (isEdit) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fasilitasService.getFasilitasById(id);
      const data = res.data;

      setFormData({
        nama_fasilitas: data.nama_fasilitas || "",
        lokasi: data.lokasi || "",
        alamat: data.alamat || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        tipe: data.tipe || "Outdoor",
        kapasitas: data.kapasitas || "",
        deskripsi: data.deskripsi || "",
        gambar: null,
        status: data.status || "aktif",
      });

      if (data.jadwal?.length) setJadwal(data.jadwal);

      if (data.latitude && data.longitude) {
        setMarkerPos([parseFloat(data.latitude), parseFloat(data.longitude)]);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil detail fasilitas");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Sync marker jika latitude/longitude diketik manual
    if (name === "latitude" || name === "longitude") {
      const lat = name === "latitude" ? parseFloat(value) : parseFloat(formData.latitude);
      const lng = name === "longitude" ? parseFloat(value) : parseFloat(formData.longitude);
      if (!isNaN(lat) && !isNaN(lng)) setMarkerPos([lat, lng]);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    setFormData((prev) => ({ ...prev, gambar: e.target.files[0] }));
  };

  const handleJadwalChange = (index, field, value) => {
    const updated = [...jadwal];
    updated[index][field] = value;
    setJadwal(updated);
  };

  const tambahJadwal = () => {
    setJadwal([...jadwal, { hari: "senin", jam_buka: "08:00", jam_tutup: "17:00" }]);
  };

  const hapusJadwal = (index) => {
    const updated = [...jadwal];
    updated.splice(index, 1);
    setJadwal(updated);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        nama_fasilitas: formData.nama_fasilitas,
        lokasi: formData.lokasi,
        alamat: formData.alamat,
        latitude: formData.latitude,
        longitude: formData.longitude,
        kapasitas: formData.kapasitas,
        deskripsi: formData.deskripsi,
        gambar: formData.gambar,
        status: formData.status,
        jadwal,
      };

      if (isEdit) {
        await fasilitasService.updateFasilitas(id, payload);
      } else {
        await fasilitasService.createFasilitas(payload);
      }

      setShowSuccessAlert(true);
      setTimeout(() => navigate("/admin/fasilitas"), 2000);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Terjadi kesalahan saat menyimpan");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

      {showSuccessAlert && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[9999] bg-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(34,197,94,0.3)] border-2 border-green-500 flex items-center gap-4 transition-all duration-300 animate-bounce">
          <span className="material-symbols-outlined text-green-500 text-[36px]">check_circle</span>
          <div>
            <h4 className="font-bold text-lg text-gray-800">Berhasil!</h4>
            <p className="text-sm font-medium text-gray-500">
              {isEdit ? "Data fasilitas diperbarui." : "Fasilitas baru ditambahkan."} Mengalihkan...
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#f7f5f4] min-h-screen flex">
        <SidebarComponent />

        <div className="flex-1 lg:ml-[260px] w-full overflow-x-hidden flex flex-col">

          {/* HEADER */}
          <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {isEdit ? "Edit Fasilitas" : "Tambah Fasilitas"}
              </h1>
              <p className="text-gray-500 mt-1 text-sm font-medium">
                Isi detail informasi fasilitas olahraga di bawah ini.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || showSuccessAlert}
                className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50 text-sm shadow-sm"
              >
                {loading ? "Menyimpan..." : isEdit ? "Update Fasilitas" : "Simpan Fasilitas"}
              </button>
            </div>
          </div>

          {/* FORM AREA */}
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-6xl mx-auto relative">

              {showSuccessAlert && (
                <div className="absolute inset-0 bg-white/50 z-50 rounded-3xl backdrop-blur-[1px]"></div>
              )}

              {/* ── SECTION: INFORMASI DASAR ── */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <span className="material-symbols-outlined text-orange-500 bg-orange-50 p-2 rounded-lg">edit_square</span>
                <h2 className="text-lg font-bold text-gray-800">Informasi Dasar</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                  {/* NAMA */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Fasilitas</label>
                    <input
                      type="text" name="nama_fasilitas" value={formData.nama_fasilitas}
                      onChange={handleChange} placeholder="Contoh: Lapangan Futsal A"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>

                  {/* LOKASI */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Lokasi / Gedung</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">location_on</span>
                      <input
                        type="text" name="lokasi" value={formData.lokasi}
                        onChange={handleChange} placeholder="Cari gedung atau lokasi..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-400 focus:bg-white transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* ALAMAT */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Lengkap</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">map</span>
                      <input
                        type="text" name="alamat" value={formData.alamat}
                        onChange={handleChange} placeholder="Contoh: Jl. Raya Kampus No. 1, Bandung"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-400 focus:bg-white transition-all text-sm font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                      Alamat digunakan untuk informasi lokasi fasilitas.
                    </p>
                  </div>

                  {/* TIPE & KAPASITAS */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Fasilitas</label>
                      <select name="tipe" value={formData.tipe} onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 focus:bg-white transition-all text-sm font-medium cursor-pointer"
                      >
                        <option value="Outdoor">Outdoor</option>
                        <option value="Indoor">Indoor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Kapasitas (Orang)</label>
                      <input
                        type="number" name="kapasitas" value={formData.kapasitas}
                        onChange={handleChange} placeholder="Contoh: 40"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 focus:bg-white transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: UPLOAD FOTO */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Foto Fasilitas</label>
                  <label className="border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 min-h-[220px] flex flex-col items-center justify-center text-center px-6 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors group">
                    <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-gray-400 group-hover:text-orange-500 text-[32px] transition-colors">cloud_upload</span>
                    </div>
                    <h3 className="text-gray-700 font-bold text-sm mb-1 group-hover:text-orange-600 transition-colors">
                      Klik untuk unggah foto
                    </h3>
                    <p className="text-gray-400 text-xs font-medium">Format: JPG, PNG (Max 5MB)</p>
                    {formData.gambar && (
                      <div className="mt-4 px-3 py-1.5 bg-orange-100 rounded-lg max-w-full">
                        <p className="text-[11px] text-orange-700 font-bold truncate">{formData.gambar.name}</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* ── SECTION: TITIK LOKASI PETA ── */}
              <div className="mt-10">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                  <span className="material-symbols-outlined text-orange-500 bg-orange-50 p-2 rounded-lg">pin_drop</span>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Titik Lokasi di Peta</h2>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      Klik pada peta untuk menentukan koordinat, atau isi manual di bawah.
                    </p>
                  </div>
                </div>

                {/* MAP */}
                <div className="rounded-2xl overflow-hidden border border-gray-200 h-[300px] mb-4">
                  <MapContainer
                    center={markerPos || [-6.973007, 107.630985]}
                    zoom={16}
                    className="w-full h-full"
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <PinPointPicker onPick={handleMapPick} />
                    {markerPos && <Marker position={markerPos} />}
                  </MapContainer>
                </div>

                {/* INPUT KOORDINAT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Latitude</label>
                    <input
                      type="text" name="latitude" value={formData.latitude}
                      onChange={handleChange} placeholder="-6.9730070"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Longitude</label>
                    <input
                      type="text" name="longitude" value={formData.longitude}
                      onChange={handleChange} placeholder="107.6309850"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  Koordinat juga bisa dicari di{" "}
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">
                    Google Maps
                  </a>{" "}
                  → klik kanan lokasi → salin koordinat.
                </p>
              </div>

              {/* ── SECTION: JADWAL OPERASIONAL ── */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-orange-500 bg-orange-50 p-2 rounded-lg">schedule</span>
                    <h2 className="text-lg font-bold text-gray-800">Jadwal Operasional</h2>
                  </div>
                  <button onClick={tambahJadwal} className="text-orange-500 hover:text-orange-600 font-bold text-sm flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span> Tambah Hari
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
                  {jadwal.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <select
                        value={item.hari}
                        onChange={(e) => handleJadwalChange(index, "hari", e.target.value)}
                        className="w-full sm:w-[150px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none text-sm font-medium cursor-pointer focus:border-orange-400 capitalize"
                      >
                        {["senin","selasa","rabu","kamis","jumat","sabtu","minggu"].map((h) => (
                          <option key={h} value={h} className="capitalize">{h.charAt(0).toUpperCase() + h.slice(1)}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <input type="time" value={item.jam_buka}
                          onChange={(e) => handleJadwalChange(index, "jam_buka", e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none text-sm font-medium focus:border-orange-400"
                        />
                        <span className="text-gray-400 text-sm font-bold">-</span>
                        <input type="time" value={item.jam_tutup}
                          onChange={(e) => handleJadwalChange(index, "jam_tutup", e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none text-sm font-medium focus:border-orange-400"
                        />
                      </div>

                      <button onClick={() => hapusJadwal(index)}
                        className="ml-auto w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SECTION: DESKRIPSI ── */}
              <div className="mt-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-orange-500 bg-orange-50 p-2 rounded-lg">description</span>
                  <h2 className="text-lg font-bold text-gray-800">Deskripsi Lengkap</h2>
                </div>
                <textarea
                  rows="4" name="deskripsi" value={formData.deskripsi}
                  onChange={handleChange}
                  placeholder="Tuliskan keunggulan, fasilitas pendukung, atau peraturan khusus..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none resize-none focus:border-orange-400 focus:bg-white transition-all text-sm font-medium"
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TambahFasilitas;