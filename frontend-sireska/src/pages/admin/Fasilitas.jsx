// src/pages/admin/ManajemenFasilitas.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SidebarComponent from "../../components/sidebarComponent";
import fasilitasService from "../../service/fasilitasServics";

const Fasilitas = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [fasilitas, setFasilitas] = useState([]);

  // ─── FETCH DATA ─────────────────────────────────────
  const fetchFasilitas = async () => {

    try {

      setLoading(true);

      const res =
        await fasilitasService.getAllFasilitas();

      setFasilitas(res.data || []);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

  // ─── DELETE ─────────────────────────────────────────
  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Yakin ingin menghapus fasilitas ini?"
      );

    if (!confirmDelete) return;

    try {

      await fasilitasService.deleteFasilitas(id);

      alert("Fasilitas berhasil dihapus");

      fetchFasilitas();

    } catch (err) {

      console.error(err);

      alert(
        err?.response?.data?.message ||
        "Gagal menghapus fasilitas"
      );
    }
  };

  useEffect(() => {

    fetchFasilitas();

  }, []);

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

      {/* GOOGLE ICON */}
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
          <div className="px-4 sm:px-6 lg:px-10 py-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div>
                <h1 className="text-3xl lg:text-5xl font-semibold text-[#2D2D2D]">
                  Manajemen Fasilitas
                </h1>

                <p className="text-gray-500 mt-2 text-base lg:text-xl">
                  Pantau dan kelola semua fasilitas olahraga.
                </p>
              </div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    navigate("/admin/tambahFasilitas")
                  }
                  className="bg-orange-500 hover:bg-orange-600 transition text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    add
                  </span>

                  Tambah Fasilitas
                </button>

              </div>

            </div>

            {/* CARD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-10">

              {/* CARD 1 */}
              <div className="bg-white rounded-3xl shadow-md overflow-hidden">

                <div className="h-2 bg-lime-500"></div>

                <div className="p-6">

                  <div className="flex items-center justify-between">

                    <h3 className="text-xl font-semibold text-[#2D2D2D]">
                      Fasilitas
                    </h3>

                    <div className="bg-lime-100 w-10 h-10 rounded-xl flex items-center justify-center">

                      <span className="material-symbols-outlined text-lime-600">
                        sports_soccer
                      </span>

                    </div>
                  </div>

                  <h1 className="text-5xl font-bold text-[#2D2D2D] mt-6">
                    {fasilitas.length}
                  </h1>

                  <p className="text-gray-500 mt-3">
                    Total Fasilitas
                  </p>

                </div>
              </div>

              {/* CARD 2 */}
              <div className="bg-white rounded-3xl shadow-md overflow-hidden">

                <div className="h-2 bg-purple-500"></div>

                <div className="p-6">

                  <div className="flex items-center justify-between">

                    <h3 className="text-xl font-semibold text-[#2D2D2D]">
                      Fasilitas Aktif
                    </h3>

                    <div className="bg-purple-100 w-10 h-10 rounded-xl flex items-center justify-center">

                      <span className="material-symbols-outlined text-purple-600">
                        check_circle
                      </span>

                    </div>
                  </div>

                  <h1 className="text-5xl font-bold text-[#2D2D2D] mt-6">
                    {
                      fasilitas.filter(
                        (item) =>
                          item.status === "aktif"
                      ).length
                    }
                  </h1>

                  <p className="text-gray-500 mt-3">
                    Sedang Digunakan
                  </p>

                </div>
              </div>

              {/* CARD 3 */}
              <div className="bg-white rounded-3xl shadow-md overflow-hidden">

                <div className="h-2 bg-yellow-400"></div>

                <div className="p-6">

                  <div className="flex items-center justify-between">

                    <h3 className="text-xl font-semibold text-[#2D2D2D]">
                      Maintenance
                    </h3>

                    <div className="bg-yellow-100 w-10 h-10 rounded-xl flex items-center justify-center">

                      <span className="material-symbols-outlined text-yellow-600">
                        construction
                      </span>

                    </div>
                  </div>

                  <h1 className="text-5xl font-bold text-[#2D2D2D] mt-6">
                    {
                      fasilitas.filter(
                        (item) =>
                          item.status === "maintenance"
                      ).length
                    }
                  </h1>

                  <p className="text-gray-500 mt-3">
                    Sedang Perbaikan
                  </p>

                </div>
              </div>

              {/* CARD 4 */}
              <div className="bg-white rounded-3xl shadow-md overflow-hidden">

                <div className="h-2 bg-red-500"></div>

                <div className="p-6">

                  <div className="flex items-center justify-between">

                    <h3 className="text-xl font-semibold text-[#2D2D2D]">
                      Nonaktif
                    </h3>

                    <div className="bg-red-100 w-10 h-10 rounded-xl flex items-center justify-center">

                      <span className="material-symbols-outlined text-red-600">
                        cancel
                      </span>

                    </div>
                  </div>

                  <h1 className="text-5xl font-bold text-[#2D2D2D] mt-6">
                    {
                      fasilitas.filter(
                        (item) =>
                          item.status === "nonaktif"
                      ).length
                    }
                  </h1>

                  <p className="text-gray-500 mt-3">
                    Tidak Digunakan
                  </p>

                </div>
              </div>

            </div>

            {/* TABLE */}
            <div className="bg-white rounded-[35px] shadow-sm border border-gray-100 p-5 lg:p-8 mt-10 overflow-x-auto">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

                <h2 className="text-2xl lg:text-4xl font-semibold text-[#2D2D2D]">
                  Daftar Fasilitas
                </h2>

              </div>

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-gray-300">

                    <th className="text-left py-5 px-4 text-gray-700 text-lg font-semibold">
                      Nama
                    </th>

                    <th className="text-left py-5 px-4 text-gray-700 text-lg font-semibold">
                      Lokasi
                    </th>

                    <th className="text-left py-5 px-4 text-gray-700 text-lg font-semibold">
                      Kapasitas
                    </th>

                    <th className="text-left py-5 px-4 text-gray-700 text-lg font-semibold">
                      Status
                    </th>

                    <th className="text-center py-5 px-4 text-gray-700 text-lg font-semibold">
                      Aksi
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {loading ? (

                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10 text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>

                  ) : fasilitas.length === 0 ? (

                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10 text-gray-500"
                      >
                        Belum ada fasilitas
                      </td>
                    </tr>

                  ) : (

                    fasilitas.map((item) => (

                      <tr
                        key={item.fasilitas_id}
                        className="border-b border-gray-200"
                      >

                        <td className="py-5 px-4 font-medium text-lg text-[#2D2D2D]">
                          {item.nama_fasilitas}
                        </td>

                        <td className="py-5 px-4 text-lg text-gray-600">
                          {item.lokasi || "-"}
                        </td>

                        <td className="py-5 px-4 text-lg text-gray-600">
                          {item.kapasitas || "-"}
                        </td>

                        <td className="py-5 px-4">

                          <span
                            className={`
                              px-4 py-2 rounded-xl text-sm font-medium capitalize
                              ${
                                item.status === "aktif"
                                  ? "bg-green-100 text-green-700"
                                  : item.status === "maintenance"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }
                            `}
                          >
                            {item.status}
                          </span>

                        </td>

                        <td className="py-5 px-4">

                          <div className="flex items-center justify-center gap-3">

                            {/* EDIT */}
                            <button
                            onClick={() =>
                                navigate(`/admin/fasilitas/edit/${item.fasilitas_id}`)
                            }
                            className="bg-orange-500 text-white px-5 py-2 rounded-xl"
                            >
                            Edit
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={() =>
                                handleDelete(item.fasilitas_id)
                              }
                              className="border border-orange-500 hover:bg-orange-50 transition text-orange-500 w-12 h-12 rounded-xl flex items-center justify-center"
                            >

                              <span className="material-symbols-outlined">
                                delete
                              </span>

                            </button>

                          </div>

                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default Fasilitas;