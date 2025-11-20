# APLIKASI TABUNGAN SANTRI
## Sistem Manajemen Tabungan Digital untuk Pondok Pesantren

---

## 📋 DAFTAR ISI
1. [Fitur Utama](#fitur-utama)
2. [Struktur Database](#struktur-database)
3. [Cara Setup](#cara-setup)
4. [Hak Akses Admin](#hak-akses-admin)
5. [Panduan Penggunaan](#panduan-penggunaan)
6. [Pemecahan Masalah](#pemecahan-masalah)
7. [Perubahan Terbaru](#perubahan-terbaru)

---

## ✨ FITUR UTAMA

### 🔐 Multi-Level Access System
- **Super Admin**: Akses penuh ke semua fitur tanpa batasan
- **Admin Top-Up**: Hanya akses form top-up saldo
- **Admin Penarikan**: Hanya akses form penarikan normal dengan limit harian
- **Pembimbing**: Akses penarikan khusus untuk santri bimbingannya (bypass limit)
- **Admin Laporan**: Hanya akses laporan dan rekap statistik
- **Santri/Wali**: Akses dashboard pribadi untuk cek saldo & riwayat transaksi

### 💰 Manajemen Transaksi Real-time
- Form top-up saldo santri dengan validasi real-time
- Form penarikan dengan sistem limit harian otomatis
- Penarikan khusus pembimbing dengan bypass limit
- Validasi saldo dan limit secara otomatis
- Tracking penarikan harian per santri
- Riwayat transaksi lengkap

### 📊 Dashboard & Laporan Lengkap
- Dashboard admin dengan statistik real-time
- Dashboard santri dengan informasi saldo dan limit
- Laporan transaksi (top-up & penarikan)
- Export data ke format CSV
- Monitoring saldo semua santri
- Riwayat transaksi terperinci

---

## 🗄️ STRUKTUR DATABASE

### 1. Sheet 'DATA SANTRI'
```
| NIS | NAMA | LIMIT HARIAN | PASSWORD | PEMBIMBING | ACTIVE |
|-----|------|--------------|----------|------------|--------|
```
- **NIS**: Nomor Induk Santri (unique identifier)
- **NAMA**: Nama lengkap santri
- **LIMIT HARIAN**: Maksimal penarikan per hari (dalam Rupiah)
- **PASSWORD**: Password untuk login santri/wali
- **PEMBIMBING**: Nama pembimbing/wali kelas santri
- **ACTIVE**: TRUE/FALSE untuk status aktif santri

**Contoh Data:**
```
12001 | Ahmad Fauzi     | 50000 | 123456 | Ust. Ali | TRUE
12002 | Fatimah Zahra   | 50000 | 654321 | Ust. Budi | TRUE
12003 | Muhammad Ridwan | 75000 | 111222 | Ust. Ali | TRUE
```

### 2. Sheet 'TOP-UP'
```
| ID TOP-UP | NIS | NAMA | JUMLAH | METODE | PENERIMA | TANGGAL | CATATAN |
|-----------|-----|------|--------|--------|----------|---------|---------|
```
- Menyimpan semua transaksi penambahan saldo

**Contoh Data:**
```
TOP-250108-1234 | 12001 | Ahmad Fauzi | 100000 | Tunai | Admin Ali | 08/01/2025 10:00 | Top-up awal
```

### 3. Sheet 'SALDO' (Auto-calculated)
```
| NIS | NAMA | SALDO |
|-----|------|-------|
```

**⚠️ PENTING - RUMUS OTOMATIS SHEET SALDO:**

**Cell A1:**
```
=QUERY('DATA SANTRI'!A:F; "SELECT A, B WHERE F = TRUE ORDER BY A"; 1)
```

**Cell C2 (dan drag ke bawah):**
```
=ARRAYFORMULA(IF(A2:A="";"";
  IFERROR(SUMIF('TOP-UP'!B:B;A2:A;'TOP-UP'!D:D);0) - 
  IFERROR(SUMIF('PENARIKAN'!B:B;A2:A;'PENARIKAN'!D:D);0)
))
```

### 4. Sheet 'PENARIKAN'
```
| ID PENARIKAN | NIS | NAMA | JUMLAH | METODE | PENERIMA | TANGGAL | CATATAN |
|--------------|-----|------|--------|--------|----------|---------|---------|
```
- Menyimpan semua transaksi penarikan
- Penarikan khusus ditandai dengan `[PENARIKAN KHUSUS - PEMBIMBING: Nama]`

**Contoh Data:**
```
WD-250108-5678 | 12001 | Ahmad Fauzi | 20000 | Tunai | Admin Budi | 08/01/2025 11:00 | Jajan
WD-250108-9012 | 12001 | Ahmad Fauzi | 80000 | Tunai | Ust. Ali | 08/01/2025 14:00 | [PENARIKAN KHUSUS - PEMBIMBING: Ust. Ali] Beli buku
```

### 5. Sheet 'ADMIN'
```
| ID | NAMA | EMAIL | PASSWORD | OTORITAS |
|----|------|-------|----------|----------|
```

**Contoh Data:**
```
1 | Admin Ali   | admin@pondok.com     | admin123 | Super Admin
2 | Admin Budi  | topup@pondok.com     | topup123 | Admin Top-Up
3 | Admin Citra | penarikan@pondok.com | tarik123 | Admin Penarikan
4 | Ust. Ali    | pembimbing@pondok.com | ust123  | Pembimbing
5 | Admin Dedi  | laporan@pondok.com   | lap123   | Admin Laporan
```

---

## 🚀 CARA SETUP

### 1. Persiapan Google Spreadsheet
1. Buat Google Spreadsheet baru
2. Buat 5 sheet dengan nama: `DATA SANTRI`, `TOP-UP`, `SALDO`, `PENARIKAN`, `ADMIN`
3. Isi header sesuai struktur di atas
4. **PENTING**: Masukkan rumus di Sheet SALDO seperti di atas
5. Isi data sample untuk testing

### 2. Setup Google Apps Script
1. Di Spreadsheet, klik **Extensions > Apps Script**
2. Delete semua kode default
3. Buat file-file berikut dengan **File > New > Script file**:
   - `config.gs`
   - `kode.gs`
4. Buat file-file HTML dengan **File > New > HTML file**:
   - `login.html`
   - `santri_login.html`
   - `santri_dashboard.html`
   - `topup.html`
   - `penarikan.html`
   - `penarikan_pembimbing.html`
   - `laporan_admin.html`
   - `dashboard.html`
5. Copy paste kode dari setiap file yang sudah diperbaiki

### 3. Deploy Web App
1. Klik **Deploy > New deployment**
2. Pilih **Web app**
3. **Execute as**: Your email
4. **Who has access**: Anyone (atau sesuai kebutuhan)
5. Klik **Deploy**
6. Copy URL web app yang diberikan

---

## 🔑 HAK AKSES ADMIN TERBARU

### 🎯 Super Admin
- ✅ **Akses semua halaman** tanpa batasan
- ✅ Top-up saldo santri manapun
- ✅ Penarikan normal semua santri
- ✅ Penarikan khusus semua santri
- ✅ Lihat laporan lengkap
- ✅ Monitoring statistik real-time

### 💰 Admin Top-Up
- ✅ Form top-up saldo semua santri
- ❌ Tidak bisa penarikan
- ❌ Tidak bisa lihat laporan
- ❌ Tidak bisa penarikan khusus

### 💳 Admin Penarikan
- ✅ Form penarikan normal (dengan limit harian)
- ❌ Tidak bisa top-up
- ❌ Tidak bisa penarikan khusus
- ❌ Tidak bisa lihat laporan

### 🛡️ Pembimbing
- ✅ Form penarikan khusus HANYA untuk santri bimbingannya
- ❌ Tidak bisa top-up
- ❌ Tidak bisa penarikan normal
- ❌ Tidak bisa lihat laporan
- ❌ Tidak bisa akses santri lain

### 📊 Admin Laporan
- ✅ Lihat semua laporan dan statistik
- ✅ Export data ke CSV
- ❌ Tidak bisa transaksi apapun

---

## 📖 PANDUAN PENGGUNAAN

### Login Admin
1. Buka URL web app
2. Pilih "Login Admin"
3. Masukkan email dan password dari sheet ADMIN
4. Sistem akan redirect ke dashboard sesuai otoritas

### Login Santri/Wali
1. Buka URL web app
2. Pilih "Login sebagai Santri/Wali"
3. Masukkan NIS dan Password dari sheet DATA SANTRI
4. Dashboard santri akan menampilkan:
   - Saldo terkini
   - Limit harian
   - Sisa limit hari ini
   - Riwayat top-up (10 transaksi terakhir)
   - Riwayat penarikan (10 transaksi terakhir)

### Top-Up Saldo
1. Login sebagai Super Admin atau Admin Top-Up
2. Pilih santri dari dropdown
3. Sistem otomatis menampilkan saldo saat ini
4. Masukkan jumlah top-up (minimal Rp 1.000)
5. Pilih metode pembayaran
6. Isi catatan (opsional)
7. Klik "Proses Top-Up"
8. Saldo akan otomatis bertambah di sheet SALDO

### Penarikan Normal
1. Login sebagai Super Admin atau Admin Penarikan
2. Pilih santri dari dropdown
3. Sistem menampilkan:
   - Saldo saat ini
   - Limit harian santri
   - Total penarikan hari ini
   - Sisa limit hari ini
4. Masukkan jumlah (maksimal sesuai sisa limit)
5. Sistem validasi otomatis
6. Isi keperluan/catatan (WAJIB)
7. Klik "Proses Penarikan"

### Penarikan Khusus (Pembimbing)
1. Login sebagai Super Admin atau Pembimbing
2. **Pembimbing hanya bisa pilih santri bimbingannya**
3. Form sama dengan penarikan normal TANPA validasi limit
4. Bisa tarik di atas limit harian untuk keperluan khusus
5. Catatan otomatis ditambahi tag `[PENARIKAN KHUSUS - PEMBIMBING: Nama]`
6. Validasi: Pembimbing hanya bisa akses santri yang tercatat sebagai bimbingannya

### Monitoring Laporan
1. Login sebagai Super Admin atau Admin Laporan
2. Dashboard menampilkan:
   - Total santri aktif
   - Total saldo semua santri
   - Total top-up semua waktu
   - Total penarikan semua waktu
3. Tab Riwayat Top-Up: semua transaksi top-up
4. Tab Riwayat Penarikan: semua transaksi penarikan (normal & khusus)
5. Tab Saldo Santri: saldo terkini per santri
6. Export data ke CSV untuk backup

---

## 🐛 PEMECAHAN MASALAH

### Masalah Umum & Solusi

**❌ Dashboard tidak bisa mengakses fitur**
- ✅ Pastikan login sebagai role yang tepat
- ✅ Check console browser (F12) untuk error
- ✅ Pastikan session storage terisi dengan benar

**❌ Jumlah santri aktif tidak akurat**
- ✅ Pastikan rumus di sheet SALDO sudah benar
- ✅ Check kolom ACTIVE di sheet DATA SANTRI = TRUE
- ✅ Refresh halaman dashboard

**❌ Pembimbing tidak bisa akses santri**
- ✅ Pastikan nama pembimbing di sheet DATA SANTRI sesuai dengan nama login
- ✅ Check kolom PEMBIMBING di sheet DATA SANTRI
- ✅ Pastikan santri status ACTIVE = TRUE

**❌ Saldo tidak update setelah transaksi**
- ✅ Pastikan rumus ARRAYFORMULA di sheet SALDO masih aktif
- ✅ Check tidak ada error di sheet (kotak merah)
- ✅ Refresh halaman browser

**❌ Login gagal terus**
- ✅ Pastikan email/password sesuai sheet ADMIN
- ✅ Check case sensitivity
- ✅ Pastikan tidak ada spasi di password

### Debugging Tools

1. **Browser Console (F12)**: Lihat log untuk troubleshooting
2. **Session Storage Check**: 
   ```javascript
   // Di browser console, ketik:
   console.log('Admin:', sessionStorage.getItem('adminNama'));
   console.log('Role:', sessionStorage.getItem('adminOtoritas'));
   ```
3. **Sheet Validation**: Pastikan semua rumus berfungsi
4. **Role Testing**: Login dengan role berbeda untuk testing

---

## 🔄 PERUBAHAN TERBARU

### Versi 2.0 (Current)
- ✅ **Super Admin** sekarang memiliki akses penuh tanpa batasan
- ✅ **Pembimbing** hanya bisa akses santri bimbingannya
- ✅ **Validasi real-time** untuk semua transaksi
- ✅ **Penghitungan santri aktif** yang akurat dari DATA SANTRI
- ✅ **Improved error handling** dan debugging
- ✅ **Enhanced security** dengan validasi backend
- ✅ **Better UI/UX** dengan feedback yang jelas

### Fitur Baru yang Ditambahkan:
1. **Role-based access control** yang lebih ketat
2. **Validasi pembimbing** untuk penarikan khusus
3. **Debug mode** di dashboard untuk troubleshooting
4. **Export data** ke format CSV
5. **Real-time validation** saldo dan limit
6. **Enhanced logging** untuk audit trail

### Perbaikan Performance:
- ⚡ Load time lebih cepat
- ⚡ Validasi client-side + server-side
- ⚡ Optimized database queries
- ⚡ Better error messages

---

## 🎨 KUSTOMISASI

### Mengubah Identitas Pondok
Edit file `config.gs`:
```javascript
PONDOK_NAME: 'Nama Pondok Anda',
PESANTREN_NAME: 'Nama Pesantren Anda', 
ACADEMIC_YEAR: '1446-1447 H.',
```

### Menambah Metode Pembayaran
Edit fungsi `getMetodePembayaran()` di `kode.gs`:
```javascript
function getMetodePembayaran() {
  return ['Tunai', 'Transfer Bank', 'QRIS', 'E-Wallet', 'Lainnya'];
}
```

### Custom Styling
Edit CSS di masing-masing file HTML untuk:
- Warna tema
- Font family  
- Layout components
- Responsive design

---

## 🔒 KEAMANAN

### Fitur Keamanan yang Diimplementasi:
1. **Role-based Access Control** - Akses berdasarkan otoritas
2. **Session Management** - Menggunakan sessionStorage browser
3. **Backend Validation** - Validasi di server untuk semua transaksi
4. **Input Sanitization** - Pembersihan input data
5. **Audit Trail** - Semua transaksi tercatat permanen
6. **Limit Protection** - Sistem limit harian otomatis

### Best Practices:
- ✅ Gunakan password yang kuat untuk admin
- ✅ Regular backup data spreadsheet
- ✅ Monitor log transaksi secara berkala
- ✅ Update aplikasi secara teratur

---

## 📱 MOBILE COMPATIBILITY

- ✅ **Responsive Design** - Optimal di semua device
- ✅ **Touch Friendly** - Button yang mudah di-tap
- ✅ **Fast Loading** - Optimized untuk mobile network
- ✅ **Offline Fallback** - Error handling yang baik

---

## 🔄 UPDATE & MAINTENANCE

### Cara Update:
1. Backup spreadsheet terlebih dahulu
2. Copy kode baru ke Apps Script
3. Test semua fungsi
4. Deploy versi baru

### Maintenance Tips:
- 🗓️ Backup data mingguan
- 🗓️ Review log transaksi bulanan
- 🗓️ Update password admin triwulan
- 🗓️ Audit akses user semesteran

---

## 📞 SUPPORT & TROUBLESHOOTING

### Untuk Bantuan Teknis:
1. **Check Console Error**: Buka F12 di browser
2. **Verify Sheet Structure**: Pastikan struktur sesuai dokumentasi
3. **Test dengan Data Sample**: Gunakan data testing terlebih dahulu
4. **Document Error**: Screenshoot error message

### Contact Developer:
- 📧 Email: [developer email]
- 📱 WhatsApp: [contact number]
- 🐛 Issue Tracker: [link jika ada]

---

## 📄 LISENSI

**© 2025 Aplikasi Tabungan Santri - Pondok Pesantren**

**Versi 2.0** - *Enhanced Role Management & Security*

