# Dokumentasi Sistem Pembayaran Pondok Pesantren

## 📋 Overview
Sistem pembayaran digital untuk pondok pesantren yang dibangun dengan Google Apps Script dan Google Sheets sebagai database.

## 🚀 Instalasi & Setup

### 1. Persiapan Google Sheets
Buat file Google Sheets baru dengan struktur berikut:

**Sheet: DATA SANTRI**
```
| NIS | NAMA | KATEGORI | ACTIVE |
|-----|------|----------|--------|
| 001 | Ahmad | Santri Tahfidz | TRUE |
| 002 | Ibrahim | Santri Non Tahfidz | TRUE |
```

**Sheet: KATEGORI**
```
| ID | NAMA_KATEGORI | SYAHRIYAH | KOS_MAKAN | SPP_TAHFIDZ | LAUNDRY |
|----|---------------|-----------|-----------|-------------|---------|
| 1  | Santri Tahfidz   | 500000    | 300000    | 200000      | 50000   |
| 2  | Santri Non Tahfidz   | 450000    | 300000    | 0      | 50000   |
```

**Sheet: ADMIN USER**
```
| ID | NAMA | EMAIL | PASSWORD |
|----|------|-------|----------|
| 1  | Admin | admin@pondok.com | password123 |
```

**Sheet: TRANSAKSI** (Akan terisi otomatis)
```
| ID_TRANSAKSI | NIS | NAMA | KATEGORI | JENIS_TAGIHAN | JUMLAH_TAGIHAN | POTONGAN | JUMLAH_DIBAYAR | METODE | PENERIMA | TANGGAL | STATUS | CATATAN |
```

### 2. Setup Google Apps Script

1. **Buka Google Apps Script** (script.google.com)
2. **Buat project baru**
3. **Buat file-file berikut**:
   - `Kode.gs` - Kode utama backend
   - `config.gs` - Konfigurasi aplikasi
   - `login.html` - Halaman login
   - `form.html` - Form pembayaran
   - `recap.html` - Rekapitulasi

4. **Salin kode** dari masing-masing file yang telah diberikan

### 3. Konfigurasi Aplikasi

Edit file `config.gs` untuk menyesuaikan dengan identitas institusi:

```javascript
// config.gs
var CONFIG = {
  // 🔧 KONFIGURASI INSTITUSI
  PONDOK_NAME: 'Pondok As-Salam',
  PESANTREN_NAME: 'Pesantren Fathul Ulum', 
  ACADEMIC_YEAR: '1446-1447 H.',
  LOGO_FILE_NAME: 'logo_pondok.png',
  
  // 📞 INFORMASI KONTAK
  CONTACT_INFO: {
    alamat: 'Jl. Pesantren No. 123, Jawa Timur',
    telepon: '(0331) 123456',
    email: 'info@pondokassalam.com'
  }
};
```

### 4. Upload Logo
1. Upload file logo ke Google Drive
2. Ganti `LOGO_FILE_NAME` di config dengan nama file logo Anda
3. Pastikan file logo dapat diakses publik

### 5. Deploy Aplikasi

1. **Klik "Deploy"** > **"New deployment"**
2. **Pilih type**: "Web app"
3. **Execute as**: "Me"
4. **Who has access**: "Anyone"
5. **Klik "Deploy"**
6. **Salin URL** yang dihasilkan

## 👨‍💻 Cara Penggunaan

### 1. Login
- Akses URL aplikasi
- Login dengan email dan password admin
- Setelah login berhasil, akan diarahkan ke form pembayaran

### 2. Input Pembayaran
1. **Pilih Santri** - Dropdown akan menampilkan santri aktif
2. **Data otomatis terisi** - Nama dan kategori santri
3. **Pilih Jenis Tagihan** - Bisa multiple selection
4. **Input Potongan** (jika ada) - Jumlah dibayar otomatis terupdate
5. **Pilih Metode Pembayaran** - Tunai/Transfer/QRIS/Lainnya
6. **Penerima** - Otomatis terisi dengan admin yang login
7. **Tambahkan Catatan** - Bisa menggunakan quick notes
8. **Simpan Pembayaran** - Data tersimpan ke sheet TRANSAKSI

### 3. Cetak Kwitansi
- Setelah simpan, kwitansi otomatis muncul
- Bisa download sebagai PDF
- Format kwitansi sudah optimized untuk thermal printer (80mm)

### 4. Rekapitulasi
- Klik "Lihat Rekapitulasi" dari form pembayaran
- Pilih santri untuk melihat detail pembayaran
- Tampilkan status LUNAS/BELUM LUNAS dengan progress bar
- Buka dan download PDF rekapitulasi

## 🔧 Konfigurasi Lanjutan

### Menambah Admin Baru
Edit sheet **ADMIN USER**:
```javascript
// Format: ID, NAMA, EMAIL, PASSWORD
| 2 | Bendahara | bendahara@pondok.com | password456 |
```

### Menambah Kategori Tagihan
Edit sheet **KATEGORI**:
1. Tambah kolom baru untuk jenis tagihan
2. Tambah baris untuk kategori baru
3. Sesuaikan jumlah tagihan per kategori

### Menambah Santri Baru
Edit sheet **DATA SANTRI**:
```javascript
// Format: NIS, NAMA, KATEGORI, ACTIVE
| 003 | Budi | Santri Baru | TRUE |
```

## 🛠 Troubleshooting

### Masalah Umum dan Solusi

1. **Logo tidak muncul**
   - Pastikan file logo ada di Google Drive
   - Pastikan nama file sesuai dengan `LOGO_FILE_NAME`
   - Pastikan file logo berupa gambar (PNG/JPG)

2. **Dropdown santri kosong**
   - Periksa sheet DATA SANTRI
   - Pastikan kolom ACTIVE berisi `TRUE`
   - Pastikan tidak ada baris kosong

3. **Error saat simpan pembayaran**
   - Periksa koneksi internet
   - Pastikan semua field wajib diisi
   - Periksa format angka (gunakan titik untuk ribuan)

4. **PDF tidak bisa didownload**
   - Pastikan browser mengizinkan popup
   - Coba browser yang berbeda
   - Periksa console log untuk error detail

### Debug Mode
Untuk debugging, buka browser console (F12) untuk melihat log error.

## 📊 Struktur Database

### DATA SANTRI
- `NIS` - Nomor Induk Santri (Primary Key)
- `NAMA` - Nama lengkap santri
- `KATEGORI` - Kategori santri (harus match dengan sheet KATEGORI)
- `ACTIVE` - Status aktif (TRUE/FALSE)

### KATEGORI
- `ID` - ID Kategori
- `NAMA_KATEGORI` - Nama kategori
- Kolom selanjutnya: Jenis tagihan dengan jumlah nominal

### ADMIN USER
- `ID` - ID Admin
- `NAMA` - Nama admin
- `EMAIL` - Email untuk login
- `PASSWORD` - Password (plain text - untuk development)

### TRANSAKSI
- `ID_TRANSAKSI` - Auto generated (PAY-YYMMDD-RANDOM)
- `NIS` - NIS Santri
- `NAMA` - Nama Santri
- `KATEGORI` - Kategori Santri
- `JENIS_TAGIHAN` - Jenis tagihan yang dibayar
- `JUMLAH_TAGIHAN` - Nominal tagihan
- `POTONGAN` - Jumlah potongan
- `JUMLAH_DIBAYAR` - Jumlah yang dibayar
- `METODE` - Metode pembayaran
- `PENERIMA` - Nama admin penerima
- `TANGGAL` - Timestamp transaksi
- `STATUS` - Status (Lunas/Diangsur)
- `CATATAN` - Catatan tambahan

## 🔒 Keamanan

### Yang Sudah Diimplementasi:
- ✅ Login system dengan email & password
- ✅ Session management sederhana
- ✅ Input validation
- ✅ XSS protection

### Rekomendasi untuk Production:
- 🔒 Enkripsi password (saat ini plain text)
- 🔒 Google OAuth integration
- 🔒 Rate limiting
- 🔒 Backup database regular

## 📱 Fitur Mobile
Aplikasi sudah responsive dan dapat diakses dari:
- ✅ Smartphone
- ✅ Tablet  
- ✅ Desktop
- ✅ Thermal printer (kwitansi)

## 🔄 Update & Maintenance

### Cara Update:
1. Edit kode di Google Apps Script
2. Deploy sebagai new version
3. Update URL akses jika perlu

### Backup:
- Export Google Sheets regularly
- Simpan backup kode di GitHub/local

## 📞 Support

Jika mengalami kendala:
1. Periksa dokumentasi ini terlebih dahulu
2. Check console log di browser
3. Pastikan semua sheet tersedia dan format benar
4. Hubungi developer untuk bantuan teknis

---

**Sistem siap digunakan!** 🎉

Setelah konfigurasi awal, sistem dapat langsung digunakan untuk mencatat pembayaran, mencetak kwitansi, dan melihat rekapitulasi.

