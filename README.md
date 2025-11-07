# Aplikasi Pengelolaan Tabungan Santri

Aplikasi berbasis web untuk mengelola tabungan santri dengan sistem role-based access control (admin, santri/orang tua, dan pembimbing).

## 🎯 Fitur Utama

### Admin
- ✅ Form Top-Up Saldo
- ✅ Form Penarikan dengan validasi limit harian
- ✅ Laporan saldo semua santri
- ✅ Role-based access control (top-up, penarikan, laporan)

### Santri / Orang Tua
- ✅ Lihat saldo terkini
- ✅ Riwayat top-up
- ✅ Riwayat penarikan dengan catatan lengkap
- ✅ Info limit harian dan pembimbing

### Pembimbing
- ✅ Penarikan khusus di atas limit harian
- ✅ Validasi otomatis berdasarkan data pembimbing
- ✅ Form dengan informasi santri real-time

## 📋 Struktur Tabel Google Sheets

### 1. Sheet: DATA SANTRI
| NIS | NAMA | LIMIT HARIAN | PASSWORD | PEMBIMBING | ACTIVE |
|-----|------|--------------|----------|------------|---------|
| 2024001 | Ahmad | 50000 | pass123 | Ustadz Ali | TRUE |

### 2. Sheet: TOP-UP
| ID TOP-UP | NIS | NAMA | Jumlah Dibayar | Metode | Penerima | Tanggal | Catatan |
|-----------|-----|------|----------------|--------|----------|---------|---------|

### 3. Sheet: SALDO (MENGGUNAKAN RUMUS)
| NIS | NAMA | SALDO |
|-----|------|-------|

**⚠️ PENTING: Sheet ini menggunakan rumus, JANGAN input manual!**

**Setup Rumus:**
- Cell A1: `=QUERY('DATA SANTRI'!A:F; "SELECT A, B WHERE F = TRUE ORDER BY A"; 1)`
- Cell C1: Ketik "SALDO" manual
- Cell C2: `=ARRAYFORMULA(IF(A2:A="";""; IFERROR(SUMIF('TOP-UP'!B:B;A2:A;'TOP-UP'!D:D);0) - IFERROR(SUMIF('PENARIKAN'!B:B;A2:A;'PENARIKAN'!D:D);0)))`

Saldo akan otomatis dihitung dari sheet TOP-UP dan PENARIKAN.

### 4. Sheet: PENARIKAN
| ID PENARIKAN | NIS | NAMA | Jumlah Dibayar | Metode | Penerima | Tanggal | Catatan |
|--------------|-----|------|----------------|--------|----------|---------|---------|

### 5. Sheet: ADMIN
| ID | NAMA | EMAIL | PASSWORD | OTORITAS |
|----|------|-------|----------|----------|
| ADM001 | Admin Utama | admin@example.com | admin123 | all |
| ADM002 | Admin Topup | topup@example.com | topup123 | top-up |

**Otoritas yang tersedia:**
- `all` atau `super admin` - Akses penuh
- `top-up` - Hanya top-up
- `penarikan` - Hanya penarikan
- `laporan` - Hanya laporan
- Kombinasi: `top-up,penarikan` - Top-up dan penarikan

## 🚀 Cara Setup

### A. Setup Google Apps Script (Backend)

1. **Buat Google Spreadsheet baru**
   - Buat 5 sheet dengan nama: `DATA SANTRI`, `TOP-UP`, `SALDO`, `PENARIKAN`, `ADMIN`
   - Isi header sesuai struktur tabel di atas

2. **Deploy Apps Script**
   - Buka Tools > Script editor
   - Paste kode dari file `backend.gs`
   - Ganti `YOUR_SPREADSHEET_ID_HERE` dengan ID spreadsheet Anda
   - Klik Deploy > New deployment
   - Pilih type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Copy URL deployment

3. **Izinkan akses**
   - Saat pertama kali deploy, Google akan meminta izin
   - Review permissions dan Allow access

### B. Setup Frontend (GitHub Pages)

1. **Clone atau download repository ini**

2. **Edit file `config.js`**
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
   Ganti dengan URL deployment Apps Script Anda

3. **Upload ke GitHub**
   - Buat repository baru di GitHub
   - Upload semua file frontend:
     - index.html
     - admin.html
     - santri.html
     - pembimbing.html
     - styles.css
     - config.js

4. **Aktifkan GitHub Pages**
   - Settings > Pages
   - Source: Deploy from a branch
   - Branch: main / master
   - Save
   - Akses aplikasi di: `https://username.github.io/repo-name/`

## 📂 Struktur File

```
tabungan-santri/
├── backend/
│   └── backend.gs           # Google Apps Script
├── frontend/
│   ├── index.html           # Halaman login
│   ├── admin.html           # Dashboard admin
│   ├── santri.html          # Dashboard santri/orang tua
│   ├── pembimbing.html      # Dashboard pembimbing
│   ├── styles.css           # Styling (m-banking style)
│   └── config.js            # Konfigurasi API
└── README.md
```

## 🔐 Akun Default untuk Testing

### Admin
- Email: `admin@example.com`
- Password: `admin123`

### Santri/Orang Tua
- NIS: (sesuai data di sheet DATA SANTRI)
- Password: (sesuai data di sheet DATA SANTRI)

### Pembimbing
- Nama: (sesuai PEMBIMBING di sheet DATA SANTRI)
- Password: `pembimbing123` (default untuk semua pembimbing)

## 💡 Cara Penggunaan

### Login
1. Akses aplikasi
2. Masukkan NIS/Email dan Password
3. Sistem akan redirect otomatis ke dashboard sesuai role

### Admin - Top-Up
1. Pilih tab "Top-Up"
2. Masukkan NIS santri
3. Isi jumlah, metode, penerima
4. Klik "Proses Top-Up"

### Admin - Penarikan
1. Pilih tab "Penarikan"
2. Masukkan NIS santri
3. Isi jumlah (akan dicek dengan limit harian)
4. Klik "Proses Penarikan"

### Pembimbing - Penarikan Khusus
1. Masukkan NIS santri (hanya santri yang dibimbing)
2. Sistem akan menampilkan info santri otomatis
3. Isi jumlah (boleh melebihi limit)
4. Jelaskan catatan/keperluan
5. Klik "Proses Penarikan Khusus"

### Santri/Orang Tua - Cek Laporan
1. Login dengan NIS dan Password
2. Lihat saldo terkini
3. Cek riwayat top-up dan penarikan

## 🎨 Design

Aplikasi menggunakan design system mirip m-banking dengan:
- Color palette modern (Primary: Indigo)
- Smooth animations & transitions
- Responsive untuk mobile & desktop
- Card-based layout
- Shadow & border-radius untuk depth

## 🛡️ Keamanan

- Password disimpan di Google Sheets (untuk production sebaiknya di-hash)
- Session menggunakan localStorage
- CORS handled oleh Google Apps Script
- Role-based access control
- Validasi di backend dan frontend

## 🔧 Troubleshooting

### Error: "API Berjalan" muncul
- Pastikan Anda menggunakan POST request, bukan GET
- Frontend sudah menggunakan POST dengan benar

### Error: "Action tidak valid"
- Periksa parameter `action` di URL
- Pastikan data JSON valid

### Data tidak muncul
- Periksa nama sheet sudah benar (case-sensitive)
- Cek SPREADSHEET_ID sudah benar
- Buka Apps Script logs untuk error detail

### Akses ditolak
- Pastikan otoritas admin sudah benar di sheet ADMIN
- Cek pembimbing sudah sesuai dengan data santri

## 📝 Pengembangan Lebih Lanjut

Fitur yang bisa ditambahkan:
- Export laporan ke PDF/Excel
- Notifikasi email saat transaksi
- Dashboard analytics dengan chart
- Approval system untuk penarikan besar
- Multi-language support
- Dark mode
- QR Code untuk identifikasi santri
- Integration dengan payment gateway

## 📞 Support

Untuk bantuan lebih lanjut, hubungi administrator sistem.

---

**Dibuat dengan ❤️ untuk Pondok Pesantren**