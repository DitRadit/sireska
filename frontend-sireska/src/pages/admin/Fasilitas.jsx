import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SidebarComponent from "../../components/sidebarComponent";
import fasilitasService from "../../service/fasilitasServices";

const Fasilitas = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fasilitas, setFasilitas] = useState([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false); // State untuk alert hapus

  // ─── FETCH DATA ─────────────────────────────────────
  const fetchFasilitas = async () => {
    try {
      setLoading(true);
      const res = await fasilitasService.getAllFasilitas();
      setFasilitas(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── DELETE ─────────────────────────────────────────
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus fasilitas ini? Data yang dihapus tidak dapat dikembalikan."
    );

    if (!confirmDelete) return;

    try {
      await fasilitasService.deleteFasilitas(id);
      
      // Munculkan Alert Hapus
      setShowDeleteAlert(true);
      
      // Refresh tabel agar data yang dihapus langsung hilang
      fetchFasilitas();

      // Hilangkan alert setelah 2 detik
      setTimeout(() => {
        setShowDeleteAlert(false);
      }, 2000);

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal menghapus fasilitas");
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
          * { font-family: 'Poppins', sans-serif; }
        `}
      </style>

      {/* GOOGLE ICON */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
      />

      {/* ALERT CUSTOM HAPUS (Warna Merah) */}
      {showDeleteAlert && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[9999] bg-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(239,68,68,0.3)] border-2 border-red-500 flex items-center gap-4 transition-all duration-300 animate-bounce">
          <span className="material-symbols-outlined text-red-500 text-[36px]">
            delete_forever
          </span>
          <div>
            <h4 className="font-bold text-lg text-gray-800">Dihapus!</h4>
            <p className="text-sm font-medium text-gray-500">
              Data fasilitas berhasil dihapus dari sistem.
            </p>
          </div>
        </div>
      )}

      {/* MAIN WRAPPER */}
      <div className="bg-[#f7f5f4] min-h-screen flex">
        
        {/* SIDEBAR */}
        <SidebarComponent />

        {/* CONTENT */}
        <div className="flex-1 lg:ml-[260px] w-full overflow-x-hidden flex flex-col">
          
          {/* HEADER (Sticky) */}
          <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Manajemen Fasilitas
              </h1>
              <p className="text-gray-500 mt-1 text-sm font-medium">
                Pantau dan kelola semua fasilitas olahraga.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/tambahFasilitas")}
                className="bg-orange-500 hover:bg-orange-600 transition-all active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Tambah Fasilitas
              </button>
            </div>
          </div>

          {/* MAIN BODY */}
          <div className="flex-1 p-8 overflow-y-auto w-full">
            
            {/* CARD SUMMARY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              
              {/* CARD 1 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="h-1.5 bg-lime-500 w-full"></div>
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Fasilitas</h3>
                    <div className="bg-lime-50 w-10 h-10 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-lime-600 text-[20px]">sports_soccer</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-800">
                    {fasilitas.length}
                  </h1>
                </div>
              </div>

              {/* CARD 2 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="h-1.5 bg-purple-500 w-full"></div>
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Aktif</h3>
                    <div className="bg-purple-50 w-10 h-10 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-purple-600 text-[20px]">check_circle</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-800">
                    {fasilitas.filter((item) => item.status === "aktif").length}
                  </h1>
                </div>
              </div>

              {/* CARD 3 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="h-1.5 bg-yellow-400 w-full"></div>
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Maintenance</h3>
                    <div className="bg-yellow-50 w-10 h-10 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-yellow-600 text-[20px]">construction</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-800">
                    {fasilitas.filter((item) => item.status === "maintenance").length}
                  </h1>
                </div>
              </div>

              {/* CARD 4 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="h-1.5 bg-red-500 w-full"></div>
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Nonaktif</h3>
                    <div className="bg-red-50 w-10 h-10 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-600 text-[20px]">cancel</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-800">
                    {fasilitas.filter((item) => item.status === "nonaktif").length}
                  </h1>
                </div>
              </div>

            </div>

            {/* TABLE SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6 overflow-x-auto">
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Daftar Fasilitas
                </h2>
              </div>

              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      Info Fasilitas
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      Kapasitas
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500 text-sm font-medium">
                        Loading data fasilitas...
                      </td>
                    </tr>
                  ) : fasilitas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500 text-sm font-medium">
                        Belum ada fasilitas yang ditambahkan.
                      </td>
                    </tr>
                  ) : (
                    fasilitas.map((item) => (
                      <tr key={item.fasilitas_id} className="hover:bg-gray-50/50 transition-colors">
                        
                        {/* INFO FASILITAS DENGAN GAMBAR */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-sm">
                              <img 
                                src={item.gambar || "https://placehold.co/150x150/f8f9fa/a1a1aa?text=No+Image"} 
                                alt={item.nama_fasilitas}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 text-sm">
                                {item.nama_fasilitas}
                              </span>
                              <span className="text-xs text-gray-400 font-medium mt-0.5">
                                ID: #{item.fasilitas_id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-sm text-gray-600 font-medium align-middle">
                          {item.lokasi || "-"}
                        </td>

                        <td className="py-3 px-4 text-sm text-gray-600 font-medium align-middle">
                          {item.kapasitas ? `${item.kapasitas} Orang` : "-"}
                        </td>

                        <td className="py-3 px-4 align-middle">
                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize inline-block
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

                        <td className="py-3 px-4 align-middle">
                          <div className="flex items-center justify-center gap-2">
                            {/* EDIT */}
                            <button
                              onClick={() => navigate(`/admin/fasilitas/edit/${item.fasilitas_id}`)}
                              className="bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                            >
                              Edit
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={() => handleDelete(item.fasilitas_id)}
                              className="bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[18px]">
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