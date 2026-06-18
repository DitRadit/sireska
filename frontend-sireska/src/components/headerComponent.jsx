import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

import logoIconOnly from "../assets/SiResKa Light Background.png";

// 👇 HANYA 3 MENU INI YANG AKAN MUNCUL DI NAVBAR
const NAV_ITEMS = [
  { label: "Home", href: "/home" },
  { label: "Fasilitas", href: "/fasilitas" },
  { label: "Lihat Pesanan", href: "/pesanan" },
];

const cn = (...classes) => classes.filter(Boolean).join(" ");

const AvatarIcon = () => (
  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30 shrink-0">
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  </div>
);

const HamburgerIcon = ({ isOpen }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {isOpen ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    )}
  </svg>
);

export default function HeaderComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [user, setUser] = useState({
    isLoggedIn: false,
    name: "",
    role: "",
  });

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");

        // belum login
        if (!token || !userString) {
          setUser({ isLoggedIn: false, name: "", role: "" });
          return;
        }

        // parse user
        const parsed = JSON.parse(userString);

        // decode token
        const decoded = jwtDecode(token);

        // cek expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser({ isLoggedIn: false, name: "", role: "" });
          return;
        }

        // ambil nama dan role
        const name = parsed.nama_lengkap || "User";
        const role = parsed.role_name || (parsed.role_id === 1 ? "Admin" : "User");

        // set state
        setUser({ isLoggedIn: true, name, role });

      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser({ isLoggedIn: false, name: "", role: "" });
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("authChange", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("authChange", loadUser);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    closeMenus();
    
    Swal.fire({
      title: 'Yakin mau keluar?',
      text: "Sesi kamu akan berakhir setelah ini.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316', // Warna orange-500 Tailwind
      cancelButtonColor: '#9ca3af', // Warna abu-abu Tailwind
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("authChange"));
        navigate("/home");
        
        Swal.fire({
          title: 'Berhasil Keluar!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/home" onClick={closeMenus} className="flex items-center shrink-0">
            <img src={logoIconOnly} alt="SiResKa Icon Large" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={closeMenus}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                  location.pathname === item.href
                    ? "bg-orange-50 text-orange-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-orange-500"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center">
            {user.isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 bg-white border border-gray-100 rounded-full p-1.5 pr-3 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full">
                    <AvatarIcon />
                    <div className="text-left">
                      <p className="text-sm font-bold leading-tight truncate max-w-[120px]">{user.name}</p>
                      <p className="text-[10px] text-orange-100 font-medium">{user.role}</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", isProfileOpen && "rotate-180")} />
                </button>

                {/* Dropdown */}
                <div
                  className={cn(
                    "absolute right-0 mt-3 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 origin-top-right",
                    isProfileOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                  )}
                >
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Akun Saya
                    </p>
                  </div>

                  <Link
                    to="/profil"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profil Saya
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar Akun
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" onClick={closeMenus} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors">
                  Masuk
                </Link>
                <Link to="/register" onClick={closeMenus} className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-orange-200">
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <HamburgerIcon isOpen={isMenuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100", isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0")}>
        <div className="px-4 py-6">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={closeMenus}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                  location.pathname === item.href ? "bg-orange-50 text-orange-500" : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-100 mt-6 pt-6">
            {user.isLoggedIn ? (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
                  <div className="flex items-center gap-3">
                    <AvatarIcon />
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-sm text-orange-100">{user.role}</p>
                    </div>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 border border-red-100 text-red-500 py-3 rounded-2xl font-semibold hover:bg-red-50 transition-colors">
                  <LogOut className="w-5 h-5" /> Keluar Akun
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={closeMenus} className="w-full py-3 rounded-2xl border border-orange-500 text-orange-500 text-center font-semibold">Masuk</Link>
                <Link to="/register" onClick={closeMenus} className="w-full py-3 rounded-2xl bg-orange-500 text-white text-center font-semibold">Daftar Akun Baru</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}