// /admin/TambahFasilitas.jsx

import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import SidebarComponent from "../../components/sidebarComponent";
import fasilitasService from "../../service/fasilitasServics";

const TambahFasilitas = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama_fasilitas: "",
    lokasi: "",
    tipe: "Outdoor",
    kapasitas: "",
    deskripsi: "",
    gambar: null,
    status: "aktif",
  });

  const [jadwal, setJadwal] = useState([
    {
      hari: "Senin",
      jam_buka: "08:00",
      jam_tutup: "17:00",
    },
  ]);

  // ─── FETCH DETAIL ───────────────────────────────────
  useEffect(() => {

    if (isEdit) {
      fetchDetail();
    }

  }, [id]);

  const fetchDetail = async () => {

    try {

      setLoading(true);

      const res =
        await fasilitasService.getFasilitasById(id);

      const data = res.data;

      setFormData({
        nama_fasilitas:
          data.nama_fasilitas || "",

        lokasi:
          data.lokasi || "",

        tipe:
          data.tipe || "Outdoor",

        kapasitas:
          data.kapasitas || "",

        deskripsi:
          data.deskripsi || "",

        gambar: null,

        status:
          data.status || "aktif",
      });

      if (data.jadwal?.length) {

        setJadwal(data.jadwal);

      }

    } catch (err) {

      console.error(err);

      alert("Gagal mengambil detail fasilitas");

    } finally {

      setLoading(false);
    }
  };

  // ─── HANDLE INPUT ───────────────────────────────────
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ─── HANDLE IMAGE ───────────────────────────────────
  const handleImage = (e) => {

    setFormData((prev) => ({
      ...prev,
      gambar: e.target.files[0],
    }));
  };

  // ─── HANDLE JADWAL ──────────────────────────────────
  const handleJadwalChange = (
    index,
    field,
    value
  ) => {

    const updated = [...jadwal];

    updated[index][field] = value;

    setJadwal(updated);
  };

  const tambahJadwal = () => {

    setJadwal([
      ...jadwal,
      {
        hari: "Senin",
        jam_buka: "08:00",
        jam_tutup: "17:00",
      },
    ]);
  };

  const hapusJadwal = (index) => {

    const updated = [...jadwal];

    updated.splice(index, 1);

    setJadwal(updated);
  };

  // ─── SUBMIT ─────────────────────────────────────────
  const handleSubmit = async () => {

    try {

      setLoading(true);

      const payload = {
        nama_fasilitas:
          formData.nama_fasilitas,

        lokasi:
          formData.lokasi,

        kapasitas:
          formData.kapasitas,

        deskripsi:
          formData.deskripsi,

        gambar:
          formData.gambar,

        status:
          formData.status,

        jadwal,
      };

      let res;

      if (isEdit) {

        res =
          await fasilitasService.updateFasilitas(
            id,
            payload
          );

      } else {

        res =
          await fasilitasService.createFasilitas(
            payload
          );
      }

      alert(
        res.message ||
        (isEdit
          ? "Fasilitas berhasil diupdate"
          : "Fasilitas berhasil ditambahkan")
      );

      navigate("/admin/fasilitas");

    } catch (err) {

      console.error(err);

      alert(
        err?.response?.data?.message ||
        "Terjadi kesalahan"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <>
      {/* GOOGLE FONT */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

          * {
            font-family: 'Poppins', sans-serif;
          }
        `}
      </style>

      {/* GOOGLE ICONS */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
      />

      <div className="bg-[#F7F7F7] min-h-screen flex">

        {/* SIDEBAR */}
        <SidebarComponent />

        {/* CONTENT */}
        <div className="flex-1 lg:ml-[280px] w-full overflow-x-hidden">

          {/* HEADER */}
          <div className="bg-white border-b border-gray-200 px-5 md:px-10 py-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div>

                <h1 className="text-2xl md:text-4xl font-semibold text-[#2D2D2D]">

                  {isEdit
                    ? "Edit Fasilitas"
                    : "Tambah Fasilitas Baru"}

                </h1>

                <p className="text-gray-400 mt-2 text-sm md:text-lg">
                  Isi detail fasilitas
                </p>

              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                <button
                  onClick={() => navigate(-1)}
                  className="border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-2xl font-medium hover:bg-orange-50 transition"
                >
                  Batal
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-medium hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {loading
                    ? "Menyimpan..."
                    : isEdit
                      ? "Update Fasilitas"
                      : "Simpan Fasilitas"}
                </button>

              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="p-4 md:p-8">

            <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-5 md:p-8">

              {/* TITLE */}
              <div className="flex items-center gap-3 mb-8">

                <span className="material-symbols-outlined text-orange-500">
                  edit_square
                </span>

                <h2 className="text-xl md:text-2xl font-semibold text-orange-500">
                  Informasi Fasilitas
                </h2>

              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* LEFT */}
                <div className="xl:col-span-2">

                  {/* NAMA */}
                  <div className="mb-6">

                    <label className="block font-semibold text-gray-700 mb-3">
                      Nama Fasilitas
                    </label>

                    <input
                      type="text"
                      name="nama_fasilitas"
                      value={formData.nama_fasilitas}
                      onChange={handleChange}
                      placeholder="Lapangan Tenis"
                      className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-300"
                    />

                  </div>

                  {/* LOKASI */}
                  <div className="mb-6">

                    <label className="block font-semibold text-gray-700 mb-3">
                      Lokasi / Gedung
                    </label>

                    <div className="relative">

                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        search
                      </span>

                      <input
                        type="text"
                        name="lokasi"
                        value={formData.lokasi}
                        onChange={handleChange}
                        placeholder="Cari gedung atau lokasi"
                        className="w-full border border-gray-300 rounded-2xl pl-14 pr-5 py-4 outline-none focus:ring-2 focus:ring-orange-300"
                      />

                    </div>
                  </div>

                  {/* TIPE & KAPASITAS */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">

                    {/* TIPE */}
                    <div>

                      <label className="block font-semibold text-gray-700 mb-3">
                        Tipe Fasilitas
                      </label>

                      <select
                        name="tipe"
                        value={formData.tipe}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        <option>Outdoor</option>
                        <option>Indoor</option>
                      </select>

                    </div>

                    {/* KAPASITAS */}
                    <div>

                      <label className="block font-semibold text-gray-700 mb-3">
                        Kapasitas
                      </label>

                      <div className="flex items-center gap-4">

                        <input
                          type="number"
                          name="kapasitas"
                          value={formData.kapasitas}
                          onChange={handleChange}
                          placeholder="40"
                          className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-300"
                        />

                        <span className="text-gray-600 font-medium">
                          Orang
                        </span>

                      </div>
                    </div>
                  </div>
                </div>

                {/* UPLOAD */}
                <div>

                  <label className="border-2 border-dashed border-orange-300 rounded-3xl bg-orange-50 min-h-[320px] flex flex-col items-center justify-center text-center px-8 cursor-pointer hover:bg-orange-100 transition">

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      className="hidden"
                    />

                    <span className="material-symbols-outlined text-orange-500 text-6xl md:text-7xl mb-4">
                      cloud_upload
                    </span>

                    <h3 className="text-orange-500 font-semibold text-xl md:text-2xl mb-3">
                      Unggah Foto Fasilitas
                    </h3>

                    <p className="text-gray-500 leading-relaxed text-sm">
                      Klik untuk memilih file
                    </p>

                    <p className="text-gray-400 mt-5 text-sm">
                      JPG, PNG - Max 5MB
                    </p>

                    {formData.gambar && (
                      <p className="mt-4 text-sm text-orange-600 font-medium break-all">
                        {formData.gambar.name}
                      </p>
                    )}

                  </label>
                </div>
              </div>

              {/* JADWAL */}
              <div className="border border-gray-200 rounded-3xl p-4 md:p-6 mt-10">

                {jadwal.map((item, index) => (

                  <div
                    key={index}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5 items-end"
                  >

                    {/* HARI */}
                    <div className="lg:col-span-3">

                      <label className="block font-semibold text-gray-700 mb-3">
                        Hari
                      </label>

                      <select
                        value={item.hari}
                        onChange={(e) =>
                          handleJadwalChange(
                            index,
                            "hari",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none"
                      >
                        <option value="senin">Senin</option>
                        <option value="selasa">Selasa</option>
                        <option value="rabu">Rabu</option>
                        <option value="kamis">Kamis</option>
                        <option value="jumat">Jumat</option>
                        <option value="sabtu">Sabtu</option>
                        <option value="minggu">Minggu</option>
                      </select>

                    </div>

                    {/* BUKA */}
                    <div className="lg:col-span-3">

                      <label className="block font-semibold text-gray-700 mb-3">
                        Jam Buka
                      </label>

                      <input
                        type="time"
                        value={item.jam_buka}
                        onChange={(e) =>
                          handleJadwalChange(
                            index,
                            "jam_buka",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none"
                      />

                    </div>

                    {/* SD */}
                    <div className="hidden lg:flex lg:col-span-1 justify-center items-center pb-4">

                      <span className="font-semibold text-gray-600">
                        s/d
                      </span>

                    </div>

                    {/* TUTUP */}
                    <div className="lg:col-span-3">

                      <label className="block font-semibold text-gray-700 mb-3 lg:opacity-0">
                        Jam Tutup
                      </label>

                      <input
                        type="time"
                        value={item.jam_tutup}
                        onChange={(e) =>
                          handleJadwalChange(
                            index,
                            "jam_tutup",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none"
                      />

                    </div>

                    {/* DELETE */}
                    <div className="lg:col-span-2">

                      <button
                        onClick={() => hapusJadwal(index)}
                        className="w-full border-2 border-orange-500 rounded-2xl py-4 flex items-center justify-center text-orange-500 hover:bg-orange-50 transition"
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>

                    </div>
                  </div>
                ))}

                {/* BUTTON */}
                <div className="flex justify-end">

                  <button
                    onClick={tambahJadwal}
                    className="bg-orange-500 hover:bg-orange-600 transition text-white px-8 py-4 rounded-2xl font-semibold"
                  >
                    + Tambah
                  </button>

                </div>
              </div>

              {/* DESKRIPSI */}
              <div className="mt-10">

                <label className="block font-semibold text-gray-700 mb-3">
                  Deskripsi Fasilitas
                </label>

                <textarea
                  rows="6"
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  placeholder="Jelaskan keunggulan, peraturan, dan kondisi fasilitas"
                  className="w-full border border-gray-300 rounded-3xl px-5 py-5 outline-none resize-none focus:ring-2 focus:ring-orange-300"
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