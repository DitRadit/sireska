# SiResKa — Sistem Informasi Reservasi Kampus

Aplikasi web fullstack untuk manajemen reservasi fasilitas kampus secara online. Mahasiswa, dosen, dan tamu (guest) dapat memesan fasilitas kampus, melacak status pesanan, dan melakukan pembayaran via QRIS (Midtrans). Admin dapat mengelola fasilitas, menyetujui/menolak pesanan, dan memantau seluruh aktivitas reservasi.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router v7 |
| Backend | Node.js, Express.js, Prisma ORM |
| Database | MySQL |
| Auth | JWT, OTP via Email (Nodemailer) |
| Payment | Midtrans (QRIS — khusus guest) |
| Storage | Cloudinary (gambar fasilitas & dokumen) |
| Maps | React Leaflet (pin koordinat fasilitas) |

---

## Fitur Utama

- Register & login dengan verifikasi OTP via email
- Reset password via OTP
- Role-based access: **Mahasiswa/Dosen** (role 2), **Guest** (role 3), **Admin** (role 1)
- Lihat daftar & detail fasilitas dengan peta lokasi
- Pemesanan fasilitas dengan upload dokumen pendukung
- Pengecekan slot waktu real-time
- Admin approval workflow (setujui / tolak + catatan)
- Pembayaran QRIS otomatis untuk guest via Midtrans (polling status 15 detik)
- Manajemen fasilitas: CRUD, status, jadwal operasional, upload gambar ke Cloudinary
- Manajemen user: tambah, edit, ubah role, nonaktifkan akun
- Dashboard admin dengan statistik dan rekap reservasi

---

## Struktur Proyek

```
sireska-main/
├── backend-sireska/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── src/
│   │   ├── controller/
│   │   │   ├── authController.js
│   │   │   ├── fasilitasController.js
│   │   │   ├── reservasiController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── fasilitasRoutes.js
│   │   │   ├── reservasiRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── utils/
│   │   │   └── otp.js
│   │   └── app.js
│   ├── .env
│   └── package.json
│
└── frontend-sireska/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── headerComponent.jsx
    │   │   ├── footerComponent.jsx
    │   │   ├── sidebarComponent.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── VerifyOtp.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── Home.jsx
    │   │   ├── FasilitasUser.jsx
    │   │   ├── FasilitasDetailPage.jsx
    │   │   ├── BookingPage.jsx
    │   │   ├── PesananPage.jsx
    │   │   ├── DetailPesananPage.jsx
    │   │   ├── AkunNonaktifPage.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx
    │   │       ├── Fasilitas.jsx
    │   │       ├── TambahFasilitas.jsx
    │   │       ├── AdminPemesananPage.jsx
    │   │       └── AdminUserPage.jsx
    │   ├── service/
    │   │   ├── authService.js
    │   │   ├── bookingService.js
    │   │   ├── fasilitasServices.js
    │   │   └── userService.js
    │   └── App.jsx
    ├── .env
    └── package.json
```

---

## Instalasi & Menjalankan

### Prasyarat

- Node.js >= 18
- MySQL >= 8
- Akun Cloudinary
- Akun Midtrans (Sandbox untuk development)

### 1. Clone Repository

```bash
git clone https://github.com/username/sireska.git
cd sireska-main
```

### 2. Setup Backend

```bash
cd backend-sireska
npm install
```

Buat file `.env`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/sireska"

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxx
MIDTRANS_IS_PRODUCTION=false

FRONTEND_URL=http://localhost:5173
```

Jalankan migrasi dan seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

Jalankan server:

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`.

### 3. Setup Frontend

```bash
cd ../frontend-sireska
npm install
```

Buat file `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Jalankan dev server:

```bash
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`.

---

## Akun Default (Seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@sireska.ac.id | admin123 |
| Mahasiswa | mahasiswa@sireska.ac.id | user123 |
| Guest | guest@example.com | guest123 |

---

## API Endpoints

### Auth
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | /auth/register | Register akun baru |
| POST | /auth/login | Login |
| POST | /auth/verify-otp | Verifikasi OTP |
| POST | /auth/resend-otp | Kirim ulang OTP |
| POST | /auth/reset-password | Reset password via OTP |
| GET | /auth/profile | Profil user (protected) |

### Fasilitas
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /fasilitas | Daftar semua fasilitas |
| GET | /fasilitas/:id | Detail fasilitas |
| POST | /fasilitas | Tambah fasilitas (Admin) |
| PUT | /fasilitas/:id | Edit fasilitas (Admin) |
| PATCH | /fasilitas/:id/status | Ubah status fasilitas (Admin) |
| DELETE | /fasilitas/:id | Hapus fasilitas (Admin) |

### Reservasi
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /reservasi/slot-tersedia | Cek slot tersedia |
| POST | /reservasi | Buat reservasi baru |
| GET | /reservasi/my | Daftar reservasi milik user |
| GET | /reservasi/my/:id | Detail reservasi user |
| PATCH | /reservasi/:id/cancel | Batalkan reservasi |
| GET | /reservasi/admin | Semua reservasi (Admin) |
| GET | /reservasi/admin/:id | Detail reservasi (Admin) |
| PATCH | /reservasi/admin/:id/approve | Setujui reservasi (Admin) |
| PATCH | /reservasi/admin/:id/reject | Tolak reservasi (Admin) |
| DELETE | /reservasi/admin/:id | Hapus reservasi (Admin) |
| POST | /reservasi/payment/notification | Webhook Midtrans |
| POST | /reservasi/dev/simulasi/:id | Simulasi bayar (Sandbox) |

### User
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /users | Daftar semua user (Admin) |
| GET | /users/:id | Detail user (Admin) |
| POST | /users | Tambah user (Admin) |
| PUT | /users/:id | Edit user (Admin) |
| PATCH | /users/:id/role | Ubah role user (Admin) |
| PATCH | /users/:id/toggle | Toggle aktif/nonaktif (Admin) |
| PATCH | /users/:id/deactivate | Nonaktifkan akun (Admin) |

---

## Alur Pembayaran QRIS (Guest)

```
Guest buat reservasi
       ↓
Admin setujui → Backend generate transaksi Midtrans QRIS
       ↓
midtrans_qris_url tersimpan di tabel Reservasi
       ↓
DetailPesananPage polling setiap 15 detik
       ↓
Guest scan QRIS → Midtrans kirim webhook ke /payment/notification
       ↓
Backend update status_pembayaran = "lunas"
       ↓
UI tampilkan badge "Pembayaran lunas"
```

---

## Lisensi

Proyek ini dibuat untuk keperluan akademik.
