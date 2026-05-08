import { useState } from "react";

const NAV_ITEMS = [
  { label: "Home", href: "#" },
  { label: "Booking", href: "#" },
  { label: "Fasilitas", href: "#" },
  { label: "Lihat Jadwal", href: "#" },
  { label: "Lihat Pesanan", href: "#" },
];

const USER = { name: "Budi Santoso" };

const FONT_URL = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap";

const STYLE = {
  fontFamily: { fontFamily: "'Montserrat', sans-serif" },
  userButtonBg: { background: "linear-gradient(90deg, #f97316 0%, #e85d26 100%)" },
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const LogoIcon = () => (
  <div className="relative w-10 h-10">
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="20" cy="20" r="18" stroke="#e85d26" strokeWidth="2" fill="white" />
      <path d="M12 26 L20 10 L28 26" stroke="#e85d26" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 20 L25 20" stroke="#e85d26" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="10" r="2" fill="#e85d26" />
    </svg>
  </div>
);

const Logo = () => (
  <div className="flex items-center gap-2">
    <LogoIcon />
    <div className="flex flex-col leading-tight">
      <span className="font-extrabold text-base text-gray-800 uppercase" style={{ ...STYLE.fontFamily, letterSpacing: "0.18em" }}>
        SIRESKA
      </span>
      <span className="text-[9px] text-gray-500 tracking-wider uppercase" style={STYLE.fontFamily}>
        Sport Facility Booking
      </span>
    </div>
  </div>
);

const AvatarIcon = () => (
  <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center overflow-hidden border border-white/40">
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  </div>
);

const UserButton = ({ name }) => (
  <button className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-md transition-all duration-150 hover:brightness-110 active:scale-95" style={STYLE.userButtonBg}>
    <AvatarIcon />
    <span>{name}</span>
  </button>
);

const NavLink = ({ label, href, isActive, onClick }) => (
  <a href={href} onClick={onClick} className={cn("px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-150", isActive ? "text-orange-500" : "text-gray-700 hover:text-orange-400")}>
    {label}
  </a>
);

const MobileNavLink = ({ label, href, isActive, onClick }) => (
  <a href={href} onClick={onClick} className={cn("px-4 py-2 rounded-md text-sm font-semibold transition-colors", isActive ? "text-orange-500 bg-orange-50" : "text-gray-700 hover:text-orange-400 hover:bg-orange-50")}>
    {label}
  </a>
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
  const [activeNav, setActiveNav] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (label) => {
    setActiveNav(label);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <>
      <link href={FONT_URL} rel="stylesheet" />
      <header className="w-full bg-white shadow-sm" style={STYLE.fontFamily}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.label} label={item.label} href={item.href} isActive={activeNav === item.label} onClick={() => handleNavClick(item.label)} />
              ))}
            </nav>
            <div className="hidden md:flex items-center">
              <UserButton name={USER.name} />
            </div>
            <button className="md:hidden p-2 rounded-md text-gray-700 hover:text-orange-500 transition-colors" onClick={toggleMenu} aria-label="Toggle menu">
              <HamburgerIcon isOpen={isMenuOpen} />
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2">
            <nav className="flex flex-col gap-1 mb-3">
              {NAV_ITEMS.map((item) => (
                <MobileNavLink key={item.label} label={item.label} href={item.href} isActive={activeNav === item.label} onClick={() => handleNavClick(item.label)} />
              ))}
            </nav>
            <div className="w-full flex justify-center">
              <UserButton name={USER.name} />
            </div>
          </div>
        )}
      </header>
    </>
  );
}