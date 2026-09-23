# DENKEN MOTORS - Premium Showroom

Denken Motors adalah platform aplikasi web showroom mobil premium yang modern, dinamis, dan terintegrasi penuh. Aplikasi ini dibangun dengan sistem **Multi-Cabang**, memadukan antarmuka (UI) mewah khusus pengunjung dengan Dashboard Admin canggih untuk mengelola operasional setiap cabang secara independen dan *real-time*.

## 🚀 Fitur Utama

### 1. Sistem Multi-Cabang (Multi-Branch System)
- **URL Dinamis per Cabang**: Menggunakan arsitektur `/[cabang]` (misal: `/jakarta`, `/bogor`). Pengunjung secara otomatis diarahkan ke cabang terdekat atau default, dan seluruh inventaris mobil disesuaikan dengan stok cabang tersebut.
- **Pemisahan Data**: Pemilik cabang (Owner) hanya mengelola stok mobil, leads, dan ulasan yang masuk khusus di cabangnya, mencegah data tercampur antarcabang.

### 2. Website Pengunjung (Front-End)
- **Katalog Kendaraan Premium**: Tampilan daftar mobil per cabang dengan filter canggih serta label khusus (*SOLD OUT*, *NEW*, *BEST SELLER*).
- **Detail Mobil Komprehensif**: Halaman spesifik untuk setiap unit yang menampilkan galeri foto, spesifikasi mesin, harga Cash, dan estimasi cicilan (DP & Tenor).
- **Pengajuan Interaktif**:
  - **Simulasi & Pengajuan Kredit**: Pengguna dapat menyimulasikan cicilan dan langsung mengirim form prospek ke admin cabang terkait.
  - **Trade-In (Tukar Tambah)** & **Beli Cash**: Form khusus untuk prioritas pelanggan.
- **Ulasan & Rating Dinamis**: Pengunjung dapat memberikan ulasan, yang akan dikaitkan khusus ke cabang tempat mereka bertransaksi.
- **Responsif & Animasi Mulus**: Dibangun dengan Tailwind CSS dan desain adaptif, menjamin pengalaman *browsing* premium.

### 3. Dashboard Admin & Manajemen Cabang (`/admin`)
- **Portal Manajemen Cabang**: Admin Pusat dapat membuat akun *Owner* baru dan mendaftarkan cabang baru lengkap dengan jadwal operasional dan integrasi peta (Gmaps).
- **Manajemen Inventaris & Prospek**: Pemilik cabang dapat melakukan *Tambah, Edit, Hapus* unit mobil, serta mengelola prospek pelanggan (Leads). Perubahan langsung tersinkronisasi ke *Front-End* cabang bersangkutan.
- **Otomatisasi Sistem**: Jika admin mengubah status prospek menjadi **"Disetujui"**, sistem secara otomatis akan mengunci mobil terkait menjadi **SOLD OUT**.
- **Live Edit Mode (CMS)**: Kemampuan untuk mengedit tampilan visual (Header, Testimoni, Info Kontak cabang) langsung dari tampilan visual website (*Pratinjau*).

---

## 🛠 Teknologi yang Digunakan (Tech Stack)

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Dengan dukungan Optimistic Updates)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Ikon**: [Lucide React](https://lucide.dev/)

---

## ⚙️ Cara Menjalankan Proyek secara Lokal

### Prasyarat
Pastikan komputer Anda telah terinstal:
- Node.js (v18 atau lebih baru)
- Git
- Akun Supabase (untuk database PostgreSQL)

### Langkah Instalasi

1. **Clone Repositori**
   ```bash
   git clone https://github.com/ZainulRhmt24/Showroom.git
   cd Showroom
   ```

2. **Instal Dependensi**
   Anda bisa menggunakan `npm`, `yarn`, `pnpm`, atau `bun`.
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file bernama `.env` di root direktori proyek Anda dan masukkan URL koneksi database (Prisma & Supabase):
   ```env
   DATABASE_URL="postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
   ```

4. **Sinkronisasi Database (Prisma)**
   Jalankan perintah ini untuk membangun tabel-tabel di Supabase sesuai dengan skema Anda dan mengisinya dengan data *mock* (termasuk pembuatan cabang default):
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Aplikasi Anda kini bisa diakses melalui browser di `http://localhost:3000`. Halaman utama (root) otomatis akan mengarahkan Anda ke URL cabang default (contoh: `http://localhost:3000/jakarta`).

---

## 📁 Struktur Direktori Penting

- `app/(user)/[cabang]/`: Struktur rute dinamis (Dynamic Routing) untuk menangani halaman pengunjung per cabang (Home, Detail Mobil, dll).
- `app/admin/`: Area eksklusif Dashboard Admin lengkap dengan integrasi pendaftaran *Owner* baru.
- `app/actions/`: Kumpulan *Server Actions* Next.js (Fungsi back-end) untuk interaksi langsung dengan Prisma. Mengelola *Cars, Leads, Testimonials*, dan *Branches*.
- `components/`: Komponen React modular yang dapat digunakan ulang (Navbar, CarCard, Footer, dll).
- `store/useStore.ts`: Jantung pengelolaan memori (Zustand) yang memfasilitasi *optimistic UI updates* agar website terasa *blazing fast*.
- `prisma/schema.prisma`: Skema Relasional Database (memetakan relasi `User`, `Branch`, `Car`, `Lead`, `Testimonial`).

---

## 🔑 Autentikasi & Pemilik Cabang (Owner)
Sistem memiliki mekanisme keamanan berbasis email untuk akses Admin.
1. Kunjungi `http://localhost:3000/admin`.
2. Daftar pertama kali (atau gunakan akun bawaan `namaanda@denkenmotors.id`).
3. Akun ini akan berfungsi sebagai "Admin Induk" yang bisa membuat *Cabang Baru* serta membagikan akun turunan kepada kepala-kepala cabang lain. Kepala cabang hanya memiliki wewenang untuk mengatur mobil dan prospek di cabang miliknya sendiri.

*(Dikembangkan khusus untuk pengalaman Showroom Mobil Premium Tersentralisasi namun Independen)*
