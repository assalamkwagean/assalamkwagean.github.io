var ss = SpreadsheetApp.getActiveSpreadsheet();

// Fungsi baru untuk verifikasi login
function verifyLogin(email, password) {
  var sheet = ss.getSheetByName('ADMIN USER');
  var data = sheet.getRange(2, 1, sheet.getLastRow()-1, 4).getValues();
  
  var user = data.find(row => row[2] === email);
  
  if (!user) {
    return { success: false, message: 'Email tidak terdaftar' };
  }
  
  if (user[3] !== password) {
    return { success: false, message: 'Password salah' };
  }
  
  return { 
    success: true, 
    redirectUrl: ScriptApp.getService().getUrl() + '?page=form',
    user: user[1] // Nama admin
  };
}

// Fungsi verifikasi session
function verifySession() {
  // Implementasi session sederhana
  // Di production, gunakan Session Service atau Cache Service
  return true;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getActiveStudents() {
  var sheet = ss.getSheetByName('DATA SANTRI');
  var data = sheet.getRange(2, 1, sheet.getLastRow()-1, 4).getValues(); 
  return data.filter(row => row[3] === true); // Kolom ACTIVE sekarang di indeks 3
}

function getCategories() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('KATEGORI');
  const data = sheet.getRange(2, 1, sheet.getLastRow()-1, sheet.getLastColumn()).getValues();
  const headers = sheet.getRange(1, 3, 1, sheet.getLastColumn()-2).getValues()[0]; // Ambil header dari kolom C dst

  return data.map(row => {
    const tagihan = headers
      .map((header, index) => ({
        nama: header,
        jumlah: row[index + 2] // Data mulai dari kolom C
      }))
      .filter(t => 
        t.nama && // Filter header kosong
        t.jumlah > 0 && // Hambil yang jumlahnya > 0
        !isNaN(t.jumlah) // Pastikan numeric
      );

    return {
      nama: row[1], // Nama kategori di kolom B
      tagihan: tagihan
    };
  }).filter(c => c.tagihan.length > 0); // Hapus kategori tanpa tagihan valid
}

/**
 * Fungsi baru untuk mendapatkan tagihan dengan pengurangan dari RECAP
 * Menghitung sisa tagihan = Tagihan KATEGORI - Sudah Dibayar di RECAP
 * Hanya menampilkan tagihan yang sisanya > 0
 * 
 * @param {string} categoryName - Nama kategori
 * @param {string} nis - NIS santri
 * @return {Array} Array tagihan dengan sisa yang belum dibayar
 */
function getCategoriesWithBalance(categoryName, nis) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Ambil data dari sheet KATEGORI
  const kategoriSheet = ss.getSheetByName('KATEGORI');
  const kategoriData = kategoriSheet.getDataRange().getValues();
  const kategoriHeaders = kategoriData[0];
  
  // Cari baris kategori yang sesuai
  const kategoriRow = kategoriData.find(row => row[1] === categoryName);
  
  if (!kategoriRow) {
    return [];
  }
  
  // Ambil data dari sheet RECAP
  const recapSheet = ss.getSheetByName('RECAP');
  let recapRow = null;
  
  if (recapSheet && recapSheet.getLastRow() > 1) {
    const recapData = recapSheet.getDataRange().getValues();
    const recapHeaders = recapData[0];
    
    // Cari data santri di RECAP
    recapRow = recapData.find(row => row[0] == nis);
    
    // Siapkan hasil tagihan
    const tagihanList = [];
    
    // Loop melalui header kategori (mulai dari kolom 2 / index 2)
    for (let i = 2; i < kategoriHeaders.length; i++) {
      const jenisTagihan = kategoriHeaders[i];
      const jumlahTagihan = kategoriRow[i] || 0;
      
      // Hanya proses jika jumlah tagihan > 0
      if (jumlahTagihan > 0 && jenisTagihan) {
        let sudahDibayarkan = 0;
        
        // Cari di recap jika data santri ada
        if (recapRow) {
          const recapColIndex = recapHeaders.indexOf(jenisTagihan);
          if (recapColIndex !== -1) {
            sudahDibayarkan = recapRow[recapColIndex] || 0;
          }
        }
        
        // HITUNG SISA: Tagihan - Sudah Dibayar
        const sisaTagihan = jumlahTagihan - sudahDibayarkan;
        
        // FILTER: Hanya tambahkan jika masih ada sisa (> 0)
        if (sisaTagihan > 0) {
          tagihanList.push({
            nama: jenisTagihan,
            jumlah: sisaTagihan,              // Jumlah yang akan muncul di form (SISA)
            jumlahAsli: jumlahTagihan,        // Jumlah tagihan asli dari KATEGORI
            sudahDibayar: sudahDibayarkan     // Jumlah yang sudah dibayar dari RECAP
          });
        }
      }
    }
    
    return tagihanList;
  }
  
  // Jika sheet RECAP tidak ada atau tidak ada data santri, kembalikan semua tagihan
  const tagihanList = [];
  
  for (let i = 2; i < kategoriHeaders.length; i++) {
    const jenisTagihan = kategoriHeaders[i];
    const jumlahTagihan = kategoriRow[i] || 0;
    
    if (jumlahTagihan > 0 && jenisTagihan) {
      tagihanList.push({
        nama: jenisTagihan,
        jumlah: jumlahTagihan,
        jumlahAsli: jumlahTagihan,
        sudahDibayar: 0
      });
    }
  }
  
  return tagihanList;
}

function getPaymentMethods() {
  return ['Tunai', 'Transfer Bank', 'QRIS', 'Lainnya'];
}

function getAdminUsers() {
  var sheet = ss.getSheetByName('ADMIN USER');
  return sheet.getRange(2, 1, sheet.getLastRow()-1, 4).getValues();
}

function processPayment(paymentData) {
  const transactionSheet = ss.getSheetByName('TRANSAKSI');
  const paymentId = generatePaymentId();
  const now = new Date();

  // Process regular bills
  paymentData.tagihan.forEach((tagihan) => {
    // Hitung status per tagihan
    const totalDibayar = getTotalPaid(paymentData.nis, tagihan.jenisTagihan) + Number(tagihan.jumlahDibayar);
    const totalTagihan = Number(tagihan.jumlahTagihan) - Number(tagihan.potongan);
    const status = totalDibayar >= totalTagihan ? 'Lunas' : 'Diangsur';

    transactionSheet.appendRow([
      paymentId,
      paymentData.nis,
      paymentData.nama,
      paymentData.kategori,
      tagihan.jenisTagihan,
      tagihan.jumlahTagihan,
      tagihan.potongan,
      tagihan.jumlahDibayar,
      paymentData.metode,
      paymentData.penerima,
      now,
      status,
      paymentData.catatan || ''
    ]);
  });

  // 🔥 BARU: Process biaya admin jika ada
  if (paymentData.biayaAdmin && paymentData.biayaAdmin.jumlah > 0) {
    const biayaAdmin = paymentData.biayaAdmin;
    
    transactionSheet.appendRow([
      paymentId,
      paymentData.nis,
      paymentData.nama,
      paymentData.kategori,
      biayaAdmin.keterangan,           // Jenis Tagihan = Keterangan biaya admin
      0,                               // Jumlah Tagihan = 0 (bukan tagihan pokok)
      0,                               // Potongan = 0
      biayaAdmin.jumlah,               // Jumlah Dibayar = jumlah biaya admin
      paymentData.metode,
      paymentData.penerima,
      now,
      'Lunas',                         // Status selalu Lunas untuk biaya admin
      'Biaya Administratif'            // Catatan khusus
    ]);
  }

  return {
    success: true,
    paymentId: paymentId,
    data: {
      id: paymentId,
      nis: paymentData.nis,
      nama: paymentData.nama,
      kategori: paymentData.kategori,
      metode: paymentData.metode,
      penerima: paymentData.penerima,
      catatan: paymentData.catatan || '',
      tanggal: Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
      tagihan: paymentData.tagihan,
      totalTagihan: paymentData.tagihan.reduce((sum, t) => sum + Number(t.jumlahTagihan), 0),
      totalPotongan: paymentData.tagihan.reduce((sum, t) => sum + Number(t.potongan), 0),
      totalDibayar: paymentData.tagihan.reduce((sum, t) => sum + Number(t.jumlahDibayar), 0),
      // 🔥 BARU: Tambahkan data biaya admin ke response
      biayaAdmin: paymentData.biayaAdmin || null
    }
  };
}

function getTotalPaid(nis, jenisTagihan) {
  var sheet = ss.getSheetByName('TRANSAKSI');
  var data = sheet.getRange(2, 1, sheet.getLastRow()-1, sheet.getLastColumn()).getValues();
  
  var total = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i][1] === nis && data[i][4] === jenisTagihan) {
      total += Number(data[i][7]); // Jumlah Dibayar di kolom 7
    }
  }
  return total;
}

function generatePaymentId() {
  var now = new Date();
  var year = now.getFullYear().toString().substr(-2);
  var month = ('0' + (now.getMonth() + 1)).slice(-2);
  var day = ('0' + now.getDate()).slice(-2);
  var random = Math.floor(Math.random() * 900) + 100;
  
  return 'PAY-' + year + month + day + '-' + random;
}

function getReceiptData(paymentId) {
  var sheet = ss.getSheetByName('TRANSAKSI');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === paymentId) {
      return {
        id: data[i][0],
        nis: data[i][1],
        nama: data[i][2],
        kategori: data[i][3],
        jenisTagihan: data[i][4],
        jumlahTagihan: data[i][5],
        potongan: data[i][6],
        jumlahDibayar: data[i][7],
        metode: data[i][8],
        penerima: data[i][9],
        tanggal: Utilities.formatDate(data[i][10], Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
        status: data[i][11]
      };
    }
  }
  
  return null;
}
// Fungsi untuk mendapatkan semua data rekapitulasi
function getAllRecapData() {
  const sheet = ss.getSheetByName('RECAP');
  if (!sheet) {
    return {
      totalSantri: 0,
      totalDibayarkan: 0,
      lastUpdated: new Date().toLocaleString('id-ID'),
      tagihan: []
    };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Hitung total santri (baris data dikurangi header)
  const totalSantri = data.length - 1;
  
  // Hitung total dibayarkan (jumlah semua nilai di kolom tagihan)
  let totalDibayarkan = 0;
  for (let i = 1; i < data.length; i++) {
    for (let j = 3; j < headers.length; j++) {
      totalDibayarkan += Number(data[i][j]) || 0;
    }
  }
  
  // Jika tidak ada data spesifik santri, kembalikan data agregat
  return {
    totalSantri: totalSantri,
    totalDibayarkan: totalDibayarkan,
    lastUpdated: new Date().toLocaleString('id-ID'),
    tagihan: [] // Kosong karena menampilkan semua data
  };
}

// Fungsi untuk mendapatkan data rekapitulasi berdasarkan NIS
function getRecapDataByNis(nis) {
  const sheet = ss.getSheetByName('RECAP');
  if (!sheet) {
    return {
      nis: nis,
      nama: '',
      kategori: '',
      tagihan: []
    };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Cari data santri berdasarkan NIS
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == nis) {
      const result = {
        nis: data[i][0],
        nama: data[i][1],
        kategori: data[i][2],
        tagihan: []
      };
      
      // Ambil data tagihan (mulai dari kolom 3)
      for (let j = 3; j < headers.length; j++) {
        if (headers[j]) {
          result.tagihan.push({
            jenis: headers[j],
            dibayarkan: data[i][j] || 0
          });
        }
      }
      
      return result;
    }
  }
  
  return {
    nis: nis,
    nama: '',
    kategori: '',
    tagihan: []
  };
}

// Fungsi untuk mendapatkan URL gambar dari Google Drive
function getDriveImageUrl(fileId) {
  try {
    // Cek apakah file ada
    const file = DriveApp.getFileById(fileId);
    
    // Pastikan file adalah gambar
    const mimeType = file.getMimeType();
    if (!mimeType.startsWith('image/')) {
      throw new Error('File bukan gambar');
    }
    
    // Buat URL yang dapat diakses publik
    // Metode 1: Menggunakan thumbnail (lebih cepat)
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`;
    
    // Metode 2: Menggunakan URL langsung (mungkin perlu izin)
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    return {
      success: true,
      thumbnailUrl: thumbnailUrl,
      directUrl: directUrl,
      fileName: file.getName()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Fungsi untuk mendapatkan logo sebagai blob (alternatif)
function getLogoBlob() {
  try {
    // Ganti dengan ID file logo Anda
    const LOGO_FILE_ID = '1PaPmnfIlY8y_tIien4W_W-JvdLROExcr';
    const file = DriveApp.getFileById(LOGO_FILE_ID);
    return file.getBlob();
  } catch (error) {
    // Fallback ke placeholder jika gagal
    return null;
  }
}

// Modifikasi doGet untuk menangani request gambar
function doGet(e) {
  var page = e.parameter.page || 'login';
  var action = e.parameter.action;
  
  // Handle request untuk gambar logo
  if (action === 'getLogo') {
    const blob = getLogoBlob();
    if (blob) {
      return HtmlService.createHtmlOutput(blob.getBytes())
        .setMimeType(blob.getMimeType())
        .setTitle('Logo');
    } else {
      return HtmlService.createHtmlOutput('')
        .setMimeType('image/png')
        .setTitle('Logo Placeholder');
    }
  }
  
  if (page === 'login') {
    return renderTemplate('login')
           .setTitle('APP PEMBAYARAN ' + CONFIG.PONDOK_NAME.toUpperCase());
  }
  
  if (page === 'form') {
    var template = HtmlService.createTemplateFromFile('form');
    // Inject config
    template.CONFIG = CONFIG;
    template.action = ScriptApp.getService().getUrl();
    return template.evaluate()
           .setTitle('Form Pembayaran ' + CONFIG.PONDOK_NAME)
           .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  if (page === 'recap') {
    var template = HtmlService.createTemplateFromFile('recap');
    // Inject config
    template.CONFIG = CONFIG;
    return template.evaluate()
           .setTitle('Rekapitulasi Pembayaran ' + CONFIG.PONDOK_NAME)
           .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

// Fungsi untuk mendapatkan detail rekapitulasi per santri
function getRecapDetail(nis) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Ambil data santri
  const dataSantriSheet = ss.getSheetByName('DATA SANTRI');
  const dataSantri = dataSantriSheet.getDataRange().getValues();
  const santri = dataSantri.find(row => row[0] == nis);
  
  if (!santri) {
    return {
      nis: nis,
      nama: 'Tidak ditemukan',
      kategori: '-',
      tagihan: []
    };
  }
  
  const nama = santri[1];
  const kategori = santri[2];
  
  // Ambil data kategori
  const kategoriSheet = ss.getSheetByName('KATEGORI');
  const kategoriData = kategoriSheet.getDataRange().getValues();
  const kategoriHeader = kategoriData[0];
  
  // Cari baris kategori yang sesuai
  const kategoriRow = kategoriData.find(row => row[1] === kategori);
  
  if (!kategoriRow) {
    return {
      nis: nis,
      nama: nama,
      kategori: kategori,
      tagihan: []
    };
  }
  
  // Ambil data rekapitulasi
  const recapSheet = ss.getSheetByName('RECAP');
  let recapData = [];
  let recapHeader = [];
  
  if (recapSheet) {
    recapData = recapSheet.getDataRange().getValues();
    recapHeader = recapData[0];
    
    // Cari data santri di recap
    const recapRow = recapData.find(row => row[0] == nis);
    
    if (recapRow) {
      // Siapkan array tagihan
      const tagihanList = [];
      
      // Loop melalui header kategori (mulai dari kolom 2)
      for (let i = 2; i < kategoriHeader.length; i++) {
        const jenisTagihan = kategoriHeader[i];
        const jumlahTagihan = kategoriRow[i] || 0;
        
        // Hanya proses jika jumlah tagihan > 0
        if (jumlahTagihan > 0) {
          // Cari di recap
          let sudahDibayarkan = 0;
          const recapColIndex = recapHeader.indexOf(jenisTagihan);
          
          if (recapColIndex !== -1) {
            sudahDibayarkan = recapRow[recapColIndex] || 0;
          }
          
          tagihanList.push({
            jenis: jenisTagihan,
            jumlahTagihan: jumlahTagihan,
            sudahDibayarkan: sudahDibayarkan
          });
        }
      }
      
      return {
        nis: nis,
        nama: nama,
        kategori: kategori,
        tagihan: tagihanList
      };
    }
  }
  
  // Jika tidak ada data di recap, buat dari kategori saja
  const tagihanList = [];
  
  for (let i = 2; i < kategoriHeader.length; i++) {
    const jenisTagihan = kategoriHeader[i];
    const jumlahTagihan = kategoriRow[i] || 0;
    
    if (jumlahTagihan > 0) {
      tagihanList.push({
        jenis: jenisTagihan,
        jumlahTagihan: jumlahTagihan,
        sudahDibayarkan: 0
      });
    }
  }
  
  return {
    nis: nis,
    nama: nama,
    kategori: kategori,
    tagihan: tagihanList
  };
}

/**
 * Mencari file berdasarkan nama dan mendapatkan URL data thumbnail.
 * @param {string} fileName Nama file yang akan dicari.
 * @return {string} URL data base64 dari thumbnail gambar.
 */
function getDriveImageURL(fileName) {
  try {
    // Cari file dengan nama yang spesifik.
    var files = DriveApp.getFilesByName(fileName);
    
    // Pastikan file ditemukan.
    if (files.hasNext()) {
      var file = files.next();
      
      // Dapatkan thumbnail file sebagai blob.
      var blob = file.getThumbnail();
      
      // Encode blob menjadi string base64.
      var base64Data = Utilities.base64Encode(blob.getBytes());
      
      // Buat URL data untuk menampilkan gambar di HTML.
      var dataUrl = "data:" + blob.getContentType() + ";base64," + base64Data;
      
      return dataUrl;
    } else {
      // Jika file tidak ditemukan, kembalikan string kosong.
      return "";
    }
  } catch (e) {
    Logger.log("Error: " + e.message);
    return "";
  }
}

/**
 * Fungsi untuk mendapatkan logo aplikasi
 * @return {string} URL data base64 dari logo
 */
function getAppLogo() {
  return getDriveImageURL(CONFIG.LOGO_FILE_NAME);
}

function getInstitutionData() {
  return {
    pondokName: CONFIG.PONDOK_NAME,
    pesantrenName: CONFIG.PESANTREN_NAME,
    academicYear: CONFIG.ACADEMIC_YEAR,
    fullName: CONFIG.PONDOK_NAME + ' ' + CONFIG.PESANTREN_NAME,
    logoFileName: CONFIG.LOGO_FILE_NAME
  };
}

function renderTemplate(filename) {
  var template = HtmlService.createTemplateFromFile(filename);
  
  // Inject config ke template
  template.CONFIG = CONFIG;
  template.pondokName = CONFIG.PONDOK_NAME;
  template.pesantrenName = CONFIG.PESANTREN_NAME;
  template.academicYear = CONFIG.ACADEMIC_YEAR;
  template.logoFileName = CONFIG.LOGO_FILE_NAME;
  
  return template.evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


function getAdminFeeOptions() {
  return [
    { nama: 'Biaya Admin Transfer', jumlah: 2500 },
    { nama: 'Biaya Admin QRIS', jumlah: 1000 },
    { nama: 'Biaya Lain-lain', jumlah: 0 }
  ];
}

function getAdminFee(metode) {
  const adminFees = {
    'Tunai': 0,
    'Transfer Bank': 2500,
    'QRIS': 1000,
    'Lainnya': 0
  };
  return adminFees[metode] || 0;
}

/**
 * Fungsi khusus untuk mendapatkan logo kwitansi sebagai data URL base64
 * @return {string} Data URL base64 dari logo kwitansi
 */
function getKwitansiLogoDataUrl() {
  try {
    const fileName = CONFIG.LOGO_KWITANSI_FILE_NAME;
    const files = DriveApp.getFilesByName(fileName);
    
    if (files.hasNext()) {
      const file = files.next();
      const blob = file.getBlob();
      const base64Data = Utilities.base64Encode(blob.getBytes());
      const dataUrl = "data:" + blob.getContentType() + ";base64," + base64Data;
      
      return dataUrl;
    } else {
      Logger.log("Logo kwitansi tidak ditemukan: " + fileName);
      return "";
    }
  } catch (e) {
    Logger.log("Error loading receipt logo: " + e.message);
    return "";
  }
}

/**
 * Fungsi alternatif: Mendapatkan logo kwitansi dengan ukuran thumbnail tertentu
 * @param {number} size - Ukuran maksimal dalam pixel (default 200)
 * @return {string} Data URL base64 dari logo kwitansi
 */
function getKwitansiLogoDataUrlResized(size) {
  size = size || 200;
  
  try {
    const fileName = CONFIG.LOGO_KWITANSI_FILE_NAME;
    const files = DriveApp.getFilesByName(fileName);
    
    if (files.hasNext()) {
      const file = files.next();
      
      // Untuk thumbnail yang lebih kecil, gunakan getThumbnail()
      const blob = file.getThumbnail();
      const base64Data = Utilities.base64Encode(blob.getBytes());
      const dataUrl = "data:" + blob.getContentType() + ";base64," + base64Data;
      
      return dataUrl;
    } else {
      Logger.log("Logo kwitansi tidak ditemukan: " + fileName);
      return "";
    }
  } catch (e) {
    Logger.log("Error loading receipt logo: " + e.message);
    return "";
  }
}
