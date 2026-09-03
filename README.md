# DENKEN MOTORS - Premium Showroom

Denken Motors adalah platform aplikasi web showroom mobil premium yang modern, dinamis, dan terintegrasi penuh. Aplikasi ini dibangun dengan memadukan antarmuka (UI) mewah khusus pengunjung dan Dashboard Admin canggih untuk mengelola operasional showroom secara *real-time*.

## 🚀 Fitur Utama

### 1. Website Pengunjung (Front-End)
- **Katalog Kendaraan Premium**: Tampilan daftar mobil dengan filter canggih (Brand, Tipe, Transmisi) serta label khusus (*SOLD OUT*, *NEW*, *BEST SELLER*).
- **Detail Mobil Komprehensif**: Halaman spesifik untuk setiap unit yang menampilkan galeri foto, spesifikasi mesin, harga Cash, dan estimasi cicilan (DP & Tenor).
- **Pengajuan Interaktif**:
  - **Simulasi & Pengajuan Kredit**: Pengguna dapat menyimulasikan cicilan dan langsung mengirim form prospek ke admin.
  - **Trade-In (Tukar Tambah)**: Form khusus untuk pelanggan yang ingin menukar mobil lamanya dengan unit di showroom.
  - **Beli Cash**: Form prioritas untuk pembelian tunai.
- **Responsif & Animasi Mulus**: Dibangun dengan Tailwind CSS dan desain adaptif, menjamin pengalaman *browsing* yang setara kualitas aplikasi *native*.

### 2. Dashboard Admin & CMS (`/admin`)
- **Manajemen Inventaris (Cars)**: Tambah, edit, dan hapus unit mobil. Perubahan akan langsung tercermin secara instan di website utama.
- **Manajemen Prospek (Leads)**: Memonitor prospek pelanggan yang masuk dari website (Kredit, Cash, Trade-In). 
- **Otomatisasi Sistem**: Jika admin mengubah status prospek menjadi **"Disetujui"**, sistem secara otomatis akan mengunci mobil terkait menjadi **SOLD OUT**.
- **Live Edit Mode (CMS)**: Kemampuan luar biasa bagi admin untuk mengedit teks (Header, Slogan, Testimoni, Info Kontak) langsung dari tampilan visual website (*Pratinjau*) tanpa harus menyentuh kode pemrograman.

---

## 🛠 Teknologi yang Digunakan (Tech Stack)

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Dengan dukungan Optimistic Updates & Local Storage Persist)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Ikon**: [Lucide React](https://lucide.dev/)

---

## ⚙️ Cara Menjalankan Proyek secara Lokal

### Prasyarat
Pastikan komputer Anda telah terinstal:
- Node.js (v18 atau lebih baru)
- Git
- Akun Supabase (untuk database)

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
   Jalankan perintah ini untuk membangun tabel-tabel di Supabase sesuai dengan skema Anda dan mengisinya dengan data mobil bawaan (*seeding*):
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Aplikasi Anda kini bisa diakses melalui browser di `http://localhost:3000`.

---

## 📁 Struktur Direktori Penting

- `app/(user)/`: Halaman-halaman front-end untuk pengunjung (Home, Katalog, Kontak, dll).
- `app/admin/`: Area eksklusif Dashboard Admin.
- `app/actions/`: *Server Actions* Next.js (Fungsi back-end) untuk berinteraksi langsung dengan Prisma/Database dengan sangat cepat.
- `components/`: Komponen React modular yang dapat digunakan ulang (Navbar, CarCard, Footer, dll).
- `store/useStore.ts`: Jantung pengelolaan memori (Zustand) yang menghubungkan aksi dari Admin secara langsung (*real-time*) ke UI dan Database.
- `prisma/schema.prisma`: Desain tabel/skema Database Anda.

---

## 🔑 Autentikasi Admin
Aplikasi ini sudah diprogram dengan sistem keamanan. Untuk masuk ke dashboard Admin, navigasikan browser Anda ke `http://localhost:3000/admin` dan gunakan detail bawaan atau daftarkan admin baru.

*(Dikembangkan dan diarsiteki khusus untuk pengalaman Showroom Mobil Premium Terbaik)*
