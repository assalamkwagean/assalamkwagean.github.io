Panduan singkat untuk Versi GitHub Pages (frontend) dan Google Apps Script (backend)

1) Frontend (GitHub Pages)
- Folder: `frontend`
- Edit `frontend/config.js` dan ganti `window.__BACKEND_URL__` dengan URL Web App Google Apps Script Anda (yang akan di-deploy dari folder `backend`).
- Frontend berisi salinan file HTML asli dan shim `frontend/js/gas-shim.js` yang menerjemahkan `google.script.run` ke panggilan JSONP ke Web App.

2) Backend (Google Apps Script)
- Folder: `backend`
- Deploy sebagai Google Apps Script Project (bisa dibuat baru, lalu copy isi `backend` sebagai file-file `.gs` dan `appsscript.json`).
- Setelah deploy sebagai Web App (Access: Anyone, Execute as: User deploying), salin URL Web App dan masukkan ke `frontend/config.js`.

Catatan teknis
- Shim menggunakan JSONP (script tag) untuk melewati batasan CORS antara GitHub Pages dan script.google.com.
- Pastikan Web App di-deploy dengan akses publik (Anyone, even anonymous) agar frontend dapat memanggilnya.
- Jika Anda ingin meningkatkan keamanan, pertimbangkan menambahkan token sederhana dan memeriksanya di backend sebelum menjalankan fungsi.
