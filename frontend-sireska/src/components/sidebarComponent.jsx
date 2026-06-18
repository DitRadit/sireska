import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2

import logoIconOnly from "../assets/SiResKa Light Background.png";

const SidebarComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const link = document.createElement("link");
        link.href =
            "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        const font = document.createElement("link");
        font.href =
            "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
        font.rel = "stylesheet";
        document.head.appendChild(font);
    }, []);

    const menus = [
        { name: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
        { name: "Fasilitas", icon: "apartment", path: "/admin/fasilitas" },
        { name: "Pesanan", icon: "receipt_long", path: "/admin/reservasi" },
        { name: "Pengguna", icon: "group", path: "/admin/user" },
        { name: "Laporan", icon: "bar_chart", path: "/admin/laporan" }
    ];

    const handleLogout = () => {
        // Tampilkan konfirmasi SweetAlert2 sebelum logout
        Swal.fire({
            title: 'Yakin mau logout?',
            text: "Sesi admin kamu akan berakhir.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f97316', // Warna orange-500
            cancelButtonColor: '#9ca3af', // Warna abu-abu
            confirmButtonText: 'Ya, Logout!',
            cancelButtonText: 'Batal',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Logika hapus storage dan redirect
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                navigate("/login");
                
                // Opsional: Pesan sukses keluar
                Swal.fire({
                    title: 'Berhasil Logout!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    return (
        <aside
            className="fixed left-0 top-0 w-[260px] h-screen bg-white border-r flex flex-col justify-between z-50"
            style={{ fontFamily: "Poppins, sans-serif" }}
        >
            {/* Top */}
            <div>
                <div className="px-6 py-6">
                    <img
                        src={logoIconOnly}
                        alt="SIRESKA"
                        className="w-36 object-contain"
                    />
                </div>

                <div className="px-3 mt-2">
                    <ul className="space-y-2">
                        {menus.map((menu, index) => {
                            const isActive = location.pathname === menu.path;

                            return (
                                <li key={index}>
                                    <Link
                                        to={menu.path}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition duration-200
                                        ${
                                            isActive
                                                ? "bg-orange-500 text-white"
                                                : "text-orange-500 hover:bg-orange-50"
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {menu.icon}
                                        </span>
                                        <span>{menu.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Bottom User + Logout */}
            <div className="border-t px-5 py-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold">
                        {user?.nama_lengkap
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "US"}
                    </div>

                    <div>
                        <h1 className="text-sm font-semibold text-gray-800">
                            {user?.nama_lengkap || "User"}
                        </h1>
                        <p className="text-xs text-gray-500">
                            {user?.role_id === 1 ? "Admin Pusat" : "Pengguna"}
                        </p>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
                >
                    <span className="material-symbols-outlined text-[18px]">
                        logout
                    </span>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default SidebarComponent;