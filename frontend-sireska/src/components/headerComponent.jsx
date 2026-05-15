import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; 
import { ChevronDown, LogOut } from "lucide-react"; // Import tambahan icon
import logo from '../assets/Container.png'; 

const NAV_ITEMS = [
  { label: "Home", href: "/home" },
  { label: "Booking", href: "/booking" },
  { label: "Fasilitas", href: "/fasilitas" },
  { label: "Lihat Jadwal", href: "/jadwal" },
  { label: "Lihat Pesanan", href: "/pesanan" },
];

const FONT_URL = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap";

const STYLE = {
  fontFamily: { fontFamily: "'Montserrat', sans-serif" },
  userButtonBg: { background: "linear-gradient(90deg, #f97316 0%, #e85d26 100%)" },
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const AvatarIcon = () => (
  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/40 shadow-sm shrink-0">
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({ name: "" });
  
  // STATE BARU UNTUK DROPDOWN
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
      try {
        const parsedData = JSON.parse(userString);
        const displayName = 
          parsedData?.nama_lengkap || 
          parsedData?.user?.nama_lengkap || 
          parsedData?.data?.nama_lengkap || 
          parsedData?.name || 
          "User";
          
        setIsLoggedIn(true);
        setUserData({ name: displayName });
      } catch (error) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [location]); 

  // FUNGSI UNTUK MENUTUP DROPDOWN JIKA KLIK DI LUAR AREA
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData({ name: "" });
    setIsProfileOpen(false); // Tutup dropdown saat logout
    navigate('/Home');
  };

  return (
    <>
      <link href={FONT_URL} rel="stylesheet" />
      <header className="w-full fixed top-0 left-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300" style={STYLE.fontFamily}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            <Link to="/home" className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
              <img src={logo} alt="SiResKa Logo" className="h-10 w-auto" />
            </Link>
            
            <nav className="hidden md:flex items-center gap-2">
              {NAV_ITEMS.map((item) => (
                <Link 
                  key={item.label} 
                  to={item.href} 
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200",
                    location.pathname === item.href 
                      ? "text-orange-500 bg-orange-50" 
                      : "text-gray-600 hover:text-orange-500 hover:bg-gray-50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                // --- BAGIAN PROFILE DROPDOWN ---
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 border border-gray-100 p-1.5 pr-3 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
                  >
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full text-white text-sm font-bold shadow-sm" style={STYLE.userButtonBg}>
                      <AvatarIcon />
                      <span className="pr-1 tracking-wide truncate max-w-[120px]">{userData.name}</span>
                    </div>
                    {/* Icon Panah yang berputar */}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Isi Dropdown Melayang */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Akun Saya</p>
                      </div>
                      <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar Akun
                      </button>
                    </div>
                  )}
                </div>
                // -------------------------------
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-orange-500 px-4 py-2 transition-colors">
                    Masuk
                  </Link>
                  <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 active:scale-95">
                    Daftar
                  </Link>
                </div>
              )}
            </div>
            
            <button 
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <HamburgerIcon isOpen={isMenuOpen} />
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN TETAP SAMA */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-50 px-4 py-6 shadow-2xl absolute w-full left-0 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col gap-2 mb-6">
              {NAV_ITEMS.map((item) => (
                <Link 
                  key={item.label} 
                  to={item.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-base font-bold transition-colors",
                    location.pathname === item.href 
                      ? "text-orange-500 bg-orange-50" 
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="border-t border-gray-100 pt-6">
              {isLoggedIn ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center gap-3 px-4 py-4 rounded-xl text-white font-bold shadow-lg" style={STYLE.userButtonBg}>
                    <AvatarIcon />
                    <span>{userData.name}</span>
                  </div>
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                    className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-bold hover:bg-red-50 border border-red-100 rounded-xl transition-colors active:scale-95"
                  >
                    <LogOut className="w-5 h-5" />
                    Keluar dari Akun
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="w-full text-center py-3 border-2 border-orange-500 text-orange-500 rounded-xl font-bold active:scale-95"
                  >
                    Masuk
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="w-full text-center py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 active:scale-95"
                  >
                    Daftar Akun Baru
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}