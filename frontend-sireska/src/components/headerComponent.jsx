import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; 
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
  <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center overflow-hidden border border-white/40">
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
  
  const navigate = useNavigate();
  const location = useLocation(); // Untuk mendeteksi halaman aktif secara otomatis

  // Fungsi pengecekan Auth yang bisa dipanggil berulang kali
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
      try {
        const userProfile = JSON.parse(userString);
        setIsLoggedIn(true);
        // Sesuaikan 'nama_lengkap' dengan key di database/localStorage kamu
        setUserData({ name: userProfile.nama_lengkap || "User" });
      } catch (error) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    // Cek saat pertama kali load
    checkAuth();

    // Event listener untuk mendeteksi perubahan localStorage di tab/window lain
    window.addEventListener('storage', checkAuth);
    
    // Sinkronisasi manual: cek setiap kali lokasi URL berubah (saat navigasi)
    checkAuth();

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [location]); // Re-run setiap kali pindah halaman

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData({ name: "" });
    navigate('/login');
  };

  return (
    <>
      <link href={FONT_URL} rel="stylesheet" />
      <header className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100" style={STYLE.fontFamily}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* LOGO */}
            <Link to="/home" className="flex items-center shrink-0">
              <img src={logo} alt="SiResKa Logo" className="h-10 w-auto" />
            </Link>
            
            {/* NAV MENU (Desktop) */}
            <nav className="hidden md:flex items-center gap-2">
              {NAV_ITEMS.map((item) => (
                <Link 
                  key={item.label} 
                  to={item.href} 
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200",
                    location.pathname === item.href 
                      ? "text-orange-500 bg-orange-50" 
                      : "text-gray-600 hover:text-orange-400 hover:bg-gray-50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* AUTH SECTION (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold shadow-md" style={STYLE.userButtonBg}>
                    <AvatarIcon />
                    <span>{userData.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-orange-500 px-4 py-2 transition-colors">
                    Masuk
                  </Link>
                  <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md active:scale-95">
                    Daftar
                  </Link>
                </div>
              )}
            </div>
            
            {/* MOBILE HAMBURGER BUTTON */}
            <button 
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <HamburgerIcon isOpen={isMenuOpen} />
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-50 px-4 py-6 shadow-xl animate-in slide-in-from-top duration-300">
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
                  <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white font-bold shadow-lg" style={STYLE.userButtonBg}>
                    <AvatarIcon />
                    <span>{userData.name}</span>
                  </div>
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                    className="w-full py-3 text-center text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Keluar dari Akun
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="w-full text-center py-3 border-2 border-orange-500 text-orange-500 rounded-xl font-bold"
                  >
                    Masuk
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="w-full text-center py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200"
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