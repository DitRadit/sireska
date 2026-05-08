// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap";

const STYLE = {
  fontFamily: { fontFamily: "'Montserrat', sans-serif" },
};

const SIRESKA_LINKS = [
  { label: "About Us", href: "#" },
];

const FEATURE_LINKS = [
  { label: "Booking", href: "#" },
  { label: "Lihat Jadwal", href: "#" },
  { label: "Fasilitas", href: "#" },
  { label: "Lihat Pesanan", href: "#" },
];

const CONTACT_INFO = [
  { icon: "phone", text: "+62 895-0123-6789" },
  { icon: "email", text: "sireska@gmail.com" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const LogoIcon = () => (
  <div className="w-14 h-14">
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2" fill="transparent" />
      <path
        d="M12 26 L20 10 L28 26"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 20 L25 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="10" r="2" fill="white" />
    </svg>
  </div>
);

const BrandSection = () => (
  <div className="flex flex-col gap-3 max-w-xs">
    <div className="flex items-center gap-2">
      <LogoIcon />
      <div className="flex flex-col leading-tight">
        <span
          className="font-extrabold text-lg text-white uppercase"
          style={{ letterSpacing: "0.18em" }}
        >
          SIRESKA
        </span>
        <span className="text-[9px] text-white/70 tracking-wider uppercase">
          Sport Facility Booking
        </span>
      </div>
    </div>
    <p className="text-white/80 text-xs leading-relaxed">
      SIRESKA adalah sistem reservasi fasilitas kampus yang memudahkan pesanan secara digital
    </p>
  </div>
);

const FooterLinkGroup = ({ title, links }) => (
  <div className="flex flex-col gap-3">
    <h4 className="text-white font-bold text-sm">{title}</h4>
    <ul className="flex flex-col gap-2">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            className="text-white/70 text-xs hover:text-white transition-colors duration-150"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const ContactItem = ({ icon, text }) => (
  <li className="flex items-center gap-2">
    {icon === "phone" ? <PhoneIcon /> : <EmailIcon />}
    <span className="text-white/80 text-xs">{text}</span>
  </li>
);

const ContactSection = () => (
  <div className="flex flex-col gap-3">
    <h4 className="text-white font-bold text-sm">Contact Us</h4>
    <ul className="flex flex-col gap-2">
      {CONTACT_INFO.map((item) => (
        <ContactItem key={item.text} icon={item.icon} text={item.text} />
      ))}
    </ul>
  </div>
);

const LogoWatermark = () => (
  <div className="hidden lg:flex items-center justify-center opacity-20 pl-8 border-l border-white/20">
    <div className="w-24 h-24">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2" fill="transparent" />
        <path
          d="M12 26 L20 10 L28 26"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M15 20 L25 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="10" r="2" fill="white" />
      </svg>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FooterComponent() {
  return (
    <>
      <link href={FONT_URL} rel="stylesheet" />

      <footer
        className="w-full bg-[#f97316] py-10 px-6"
        style={STYLE.fontFamily}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 md:gap-6 lg:gap-12 items-start justify-between">

            <BrandSection />

            <div className="flex flex-wrap gap-10 md:gap-8 lg:gap-16">
              <FooterLinkGroup title="SiResKa" links={SIRESKA_LINKS} />
              <FooterLinkGroup title="Features" links={FEATURE_LINKS} />
              <ContactSection />
            </div>

            <LogoWatermark />

          </div>
        </div>
      </footer>
    </>
  );
}