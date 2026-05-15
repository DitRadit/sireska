import React from 'react';

const FooterComponent = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-10 py-12 border-t border-gray-100 bg-white text-sm">
      <div className="flex flex-col md:flex-row justify-between mb-12">
        
        {/* Brand Info */}
        <div className="mb-8 md:mb-0 max-w-xs">
          <h3 className="text-xl font-bold text-orange-500 mb-4">SiResKa</h3>
          <p className="text-gray-500 mb-6">
            Solusi digital untuk manajemen fasilitas kampus yang modern, efisien, dan terintegrasi.
          </p>
          <div className="flex space-x-4 text-gray-400">
            <span className="cursor-pointer hover:text-orange-500 transition-colors">✉️</span>
            <span className="cursor-pointer hover:text-orange-500 transition-colors">📞</span>
            <span className="cursor-pointer hover:text-orange-500 transition-colors">📍</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex space-x-20">
          <div>
            <h4 className="font-bold text-gray-800 mb-4">Menu</h4>
            <ul className="space-y-3 text-gray-500">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Pusat Bantuan</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4">Legal</h4>
            <ul className="space-y-3 text-gray-500">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Syarat dan Ketentuan</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="w-full text-center text-gray-400 pt-8 border-t border-gray-50">
        <p>© {currentYear} SiResKa Campus Facility. Energetic & Community-Driven.</p>
      </div>
    </footer>
  );
};

export default FooterComponent;