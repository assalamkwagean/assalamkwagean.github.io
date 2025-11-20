# APLIKASI PEMBAYARAN BERBASIS GOOGLE APPS SCRIPT

## STRUKTUR DATABASE/TABEL GOOGLE SPREADSHEET - KOLOM

1. Sheet 'DATA SANTRI'
NIS, NAMA, KATEGORI, KATEGORI-2, KATEGORI-3, ACTIVE

2. Sheet 'KATEGORI'
NO, NAMA KATEGORI, Tagihan 1, ..

3. Sheet 'KATEGORI-2'
NO, NAMA KATEGORI, Tagihan 1, ..

4. Sheet 'KATEGORI-3'
NO, NAMA KATEGORI, Tagihan 1, ..

5. Sheet 'TRANSAKSI'
ID PEMBAYARAN, NIS, NAMA, KATEGORI, JENIS TAGIHAN, Jumlah Tagihan, Potongan, Jumlah Dibayar, Metode, Penerima, Tanggal, Status, Catatan

6. Sheet 'ADMIN USER'
ID, NAMA, EMAIL, PASSWORD

7. Sheet 'RECAP'
NIS, NAMA, KATEGORI, KATEGORI-2, KATEGORI-3, Tagihan 1, ..

8. Sheet 'POTONGAN'
NIS, NAMA, KATEGORI, KATEGORI-2, KATEGORI-3, Tagihan 1, ..

## CARAKU MENGELOLA SHEET 'RECAP' :
aku mengelola sheet ini dengan rumus -rumus
cell A1 : 
=QUERY('DATA SANTRI'!A:F; "SELECT A, B, C, D, E WHERE F = TRUE ORDER BY A"; 1)

cell F2 seterusnya:
=ARRAYFORMULA(
  IF($A2:$A=""; "";
  BYROW($A2:$A; LAMBDA(row;
    BYCOL(F$1:1; LAMBDA(col;
      IF(col=""; "";
      SUMIFS(
        TRANSAKSI!$H:$H; 
        TRANSAKSI!$B:$B; row;
        TRANSAKSI!$E:$E; col
      ))
    ))
  )))
)


