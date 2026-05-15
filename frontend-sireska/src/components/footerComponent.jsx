import React from 'react';
import { Phone, Mail } from 'lucide-react';

// Pastikan kamu menyesuaikan path import gambar ini dengan struktur folder kamu
import logoPutih from '../assets/logoPutih.png'; 
import logoIconOnly from '../assets/SiReska Logo Only.png'; // Ganti dengan file icon logo yang besar jika ada

const FooterComponent = () => {
  return (
    <footer className="w-full bg-[#ff6b2c] text-white py-12 px-10 font-sans mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-10">
        
        {/* BAGIAN KIRI: Kumpulan Kolom Menu & Info */}
        <div className="flex flex-col md:flex-row justify-between w-full gap-10 lg:gap-16">
          
          {/* Kolom 1: Logo & Deskripsi */}
          <div className="max-w-xs">
            <img 
              src={logoPutih} 
              alt="SiResKa Logo" 
              className="h-12 object-contain mb-4" 
            />
            <p className="text-white/90 text-sm leading-relaxed font-medium pr-4">
              SIRESKA adalah sistem reservasi fasilitas kampus yang memudahkan pesanan secara digital
            </p>
          </div>

          {/* Kolom 2: SiResKa */}
          <div className="flex flex-col">
            <h4 className="font-bold text-lg mb-4">SiResKa</h4>
            <ul className="space-y-3 text-sm text-white/90 font-medium">
              <li><a href="#" className="hover:text-white hover:underline transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Kolom 3: Features */}
          <div className="flex flex-col">
            <h4 className="font-bold text-lg mb-4">Features</h4>
            <ul className="space-y-3 text-sm text-white/90 font-medium">
              <li><a href="/booking" className="hover:text-white hover:underline transition-colors">Booking</a></li>
              <li><a href="/jadwal" className="hover:text-white hover:underline transition-colors">Lihat Jadwal</a></li>
              <li><a href="/fasilitas" className="hover:text-white hover:underline transition-colors">Fasilitas</a></li>
              <li><a href="/pesanan" className="hover:text-white hover:underline transition-colors">Lihat Pesanan</a></li>
            </ul>
          </div>

          {/* Kolom 4: Contact Us */}
          <div className="flex flex-col">
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4 text-sm text-white/90 font-medium">
              <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                <Phone className="w-5 h-5 fill-white" /> 
                <span>+62 895-0123-6789</span>
              </li>
              <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                <Mail className="w-5 h-5" /> 
                <span>sireska@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* BAGIAN TENGAH: Garis Vertikal Pembatas (Hanya muncul di Desktop) */}
        <div className="hidden lg:block w-1 bg-white h-32 rounded-full opacity-100 shrink-0 mx-4 xl:mx-10"></div>

        {/* BAGIAN KANAN: Logo Icon Besar */}
        <div className="hidden md:flex shrink-0 items-center justify-center">
          <img 
            src={logoIconOnly} 
            alt="SiResKa Icon Large" 
            className="h-32 w-auto object-contain" 
          />
        </div>

      </div>
    </footer>
  );
};

export default FooterComponent;