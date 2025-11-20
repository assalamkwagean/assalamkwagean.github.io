var ss = SpreadsheetApp.getActiveSpreadsheet();

// ==========================================
// AUTHENTICATION & SESSION
// ==========================================

function doGet(e) {
  var page = e.parameter.page || 'login';
  var session = e.parameter.session;
  
  // Redirect santri-login ke login page
  if (page === 'santri-login') {
    return renderTemplate('login')
      .setTitle('Login - Aplikasi Tabungan ' + CONFIG.PONDOK_NAME);
  }
  
  if (page === 'login') {
    return renderTemplate('login')
      .setTitle('Login - Aplikasi Tabungan ' + CONFIG.PONDOK_NAME);
  }
  
  
  if (page === 'dashboard') {
    return renderTemplate('dashboard')
      .setTitle('Dashboard Admin - Tabungan Santri');
  }
  
  if (page === 'topup') {
    return renderTemplate('topup')
      .setTitle('Top-Up Saldo - Tabungan Santri');
  }
  
  if (page === 'penarikan') {
    return renderTemplate('penarikan')
      .setTitle('Penarikan Saldo - Tabungan Santri');
  }
  
  if (page === 'penarikan-pembimbing') {
    return renderTemplate('penarikan_pembimbing')
      .setTitle('Penarikan Khusus - Tabungan Santri');
  }
  
  if (page === 'laporan') {
    return renderTemplate('laporan_admin')
      .setTitle('Laporan - Tabungan Santri');
  }
  
  if (page === 'santri-dashboard') {
    return renderTemplate('santri_dashboard')
      .setTitle('Dashboard Santri - Tabungan');
  }
  
  return renderTemplate('login');
}

function renderTemplate(filename) {
  var template = HtmlService.createTemplateFromFile(filename);
  template.CONFIG = CONFIG;
  return template.evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==========================================
// ADMIN AUTHENTICATION - MODIFIED
// ==========================================

function verifyAdminLogin(email, password) {
  try {
    var sheet = ss.getSheetByName('ADMIN');
    if (!sheet) throw new Error('Sheet ADMIN tidak ditemukan');

    var data = sheet.getRange(2, 1, Math.max(1, sheet.getLastRow()-1), 5).getValues();
    var admin = data.find(row => row[2] === email);

    if (!admin) {
      return { success: false, message: 'Email tidak terdaftar' };
    }

    if (admin[3] !== password) {
      return { success: false, message: 'Password salah' };
    }

    var otoritas = admin[4];
    // Normalisasi nilai otoritas dari sheet untuk menghindari perbedaan spasi/case
    otoritas = (otoritas || '').toString().trim();
    
    // SUPER ADMIN SELALU DIARAHKAN KE DASHBOARD UTAMA
    var redirectPage = 'dashboard';

    return {
      success: true,
      redirectUrl: ScriptApp.getService().getUrl() + '?page=' + redirectPage,
      admin: {
        id: admin[0],
        nama: admin[1],
        email: admin[2],
        otoritas: otoritas
      }
    };
  } catch (error) {
    Logger.log('Error verifyAdminLogin: ' + error.message);
    return { success: false, message: 'Terjadi kesalahan sistem' };
  }
}

// ==========================================
// SANTRI AUTHENTICATION
// ==========================================

function verifySantriLogin(nis, password) {
  try {
    var sheet = ss.getSheetByName('DATA SANTRI');
    if (!sheet) throw new Error('Sheet DATA SANTRI tidak ditemukan');

    var data = sheet.getRange(2, 1, Math.max(1, sheet.getLastRow()-1), 6).getValues();
    var santri = data.find(row => row[0] == nis);

    if (!santri) {
      return { success: false, message: 'NIS tidak terdaftar' };
    }

    if (!santri[5]) {
      return { success: false, message: 'Akun tidak aktif' };
    }

    if (santri[3] !== password) {
      return { success: false, message: 'Password salah' };
    }

    return {
      success: true,
      redirectUrl: ScriptApp.getService().getUrl() + '?page=santri-dashboard',
      santri: {
        nis: santri[0],
        nama: santri[1],
        limitHarian: santri[2],
        pembimbing: santri[4]
      }
    };
  } catch (error) {
    Logger.log('Error verifySantriLogin: ' + error.message);
    return { success: false, message: 'Terjadi kesalahan sistem' };
  }
}

// ==========================================
// UPDATE PASSWORD SANTRI
// ==========================================

function updatePasswordSantri(nis, oldPassword, newPassword) {
  try {
    var sheet = ss.getSheetByName('DATA SANTRI');
    if (!sheet) throw new Error('Sheet DATA SANTRI tidak ditemukan');

    var data = sheet.getRange(2, 1, Math.max(1, sheet.getLastRow()-1), 6).getValues();
    var rowIndex = -1;
    var santri = null;

    // Find the santri row
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] == nis) {
        santri = data[i];
        rowIndex = i + 2; // +2 because data starts from row 2
        break;
      }
    }

    if (!santri) {
      return { success: false, message: 'NIS tidak terdaftar' };
    }

    if (!santri[5]) {
      return { success: false, message: 'Akun tidak aktif' };
    }

    // Verify old password
    if (santri[3] !== oldPassword) {
      return { success: false, message: 'Password lama salah' };
    }

    // Update password in sheet
    sheet.getRange(rowIndex, 4).setValue(newPassword); // Column D (index 3) is password

    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Password berhasil diupdate'
    };
  } catch (error) {
    Logger.log('Error updatePasswordSantri: ' + error.message);
    return { success: false, message: 'Terjadi kesalahan sistem' };
  }
}

// ==========================================
// DATA RETRIEVAL - MODIFIED FOR PEMBIMBING
// ==========================================

function getActiveSantri() {
  try {
    var sheet = ss.getSheetByName('DATA SANTRI');
    if (!sheet || sheet.getLastRow() < 2) return [];
    
    var data = sheet.getRange(2, 1, sheet.getLastRow()-1, 6).getValues();
    return data.filter(row => row[5] === true);
  } catch (error) {
    Logger.log('Error getActiveSantri: ' + error.message);
    return [];
  }
}

// FUNGSI BARU: Get santri by pembimbing
function getSantriByPembimbing(pembimbingName) {
  try {
    var sheet = ss.getSheetByName('DATA SANTRI');
    if (!sheet || sheet.getLastRow() < 2) return [];
    
    var data = sheet.getRange(2, 1, sheet.getLastRow()-1, 6).getValues();
    return data.filter(row => row[5] === true && row[4] === pembimbingName);
  } catch (error) {
    Logger.log('Error getSantriByPembimbing: ' + error.message);
    return [];
  }
}

function getSantriInfo(nis) {
  try {
    var sheet = ss.getSheetByName('DATA SANTRI');
    if (!sheet) return null;
    
    var data = sheet.getRange(2, 1, Math.max(1, sheet.getLastRow()-1), 6).getValues();
    var santri = data.find(row => row[0] == nis);
    
    if (!santri) return null;
    
    return {
      nis: santri[0],
      nama: santri[1],
      limitHarian: santri[2],
      pembimbing: santri[4],
      active: santri[5]
    };
  } catch (error) {
    Logger.log('Error getSantriInfo: ' + error.message);
    return null;
  }
}

function getSaldo(nis) {
  try {
    var sheet = ss.getSheetByName('SALDO');
    if (!sheet) return 0;
    
    var data = sheet.getDataRange().getValues();
    var row = data.find(r => r[0] == nis);
    
    return row ? (row[2] || 0) : 0;
  } catch (error) {
    Logger.log('Error getSaldo: ' + error.message);
    return 0;
  }
}

function getTotalPenarikanHariIni(nis) {
  try {
    var sheet = ss.getSheetByName('PENARIKAN');
    if (!sheet || sheet.getLastRow() < 2) return 0;
    
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    
    var data = sheet.getRange(2, 1, sheet.getLastRow()-1, 7).getValues();
    
    var total = 0;
    data.forEach(row => {
      if (row[1] == nis) {
        var tanggal = new Date(row[6]);
        tanggal.setHours(0, 0, 0, 0);
        
        if (tanggal.getTime() === today.getTime()) {
          total += Number(row[3]) || 0;
        }
      }
    });
    
    return total;
  } catch (error) {
    Logger.log('Error getTotalPenarikanHariIni: ' + error.message);
    return 0;
  }
}

function getMetodePembayaran() {
  return ['Tunai', 'Transfer Bank', 'QRIS', 'Lainnya'];
}

// ==========================================
// TOP-UP PROCESSING
// ==========================================

function processTopUp(topupData) {
  try {
    if (!topupData.nis || !topupData.nama) {
      throw new Error('Data santri tidak lengkap');
    }
    
    if (!topupData.jumlah || topupData.jumlah <= 0) {
      throw new Error('Jumlah top-up harus lebih dari 0');
    }
    
    var sheet = ss.getSheetByName('TOP-UP');
    if (!sheet) {
      throw new Error('Sheet TOP-UP tidak ditemukan');
    }
    
    var topupId = generateId('TOP');
    var now = new Date();
    
    sheet.appendRow([
      topupId,
      topupData.nis,
      topupData.nama,
      topupData.jumlah,
      topupData.metode,
      topupData.penerima,
      now,
      topupData.catatan || ''
    ]);
    
    SpreadsheetApp.flush();
    
    var saldoBaru = getSaldo(topupData.nis);
    
    return {
      success: true,
      data: {
        id: topupId,
        nis: topupData.nis,
        nama: topupData.nama,
        jumlah: topupData.jumlah,
        metode: topupData.metode,
        penerima: topupData.penerima,
        tanggal: Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
        catatan: topupData.catatan || '',
        saldoBaru: saldoBaru
      }
    };
  } catch (error) {
    Logger.log('Error processTopUp: ' + error.message);
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// PENARIKAN PROCESSING - MODIFIED FOR PEMBIMBING VALIDATION
// ==========================================

function processPenarikan(penarikanData) {
  try {
    if (!penarikanData.nis || !penarikanData.nama) {
      throw new Error('Data santri tidak lengkap');
    }
    
    if (!penarikanData.jumlah || penarikanData.jumlah <= 0) {
      throw new Error('Jumlah penarikan harus lebih dari 0');
    }
    
    var santriInfo = getSantriInfo(penarikanData.nis);
    if (!santriInfo) {
      throw new Error('Data santri tidak ditemukan');
    }
    
    var saldo = getSaldo(penarikanData.nis);
    if (saldo < penarikanData.jumlah) {
      throw new Error('Saldo tidak mencukupi. Saldo saat ini: Rp ' + saldo.toLocaleString('id-ID'));
    }
    
    // VALIDASI KHUSUS UNTUK PEMBIMBING
    if (penarikanData.isPembimbing) {
      // Cek apakah santri benar-benar dibimbing oleh pembimbing yang login
      var adminNama = penarikanData.adminNama || '';
      if (santriInfo.pembimbing !== adminNama) {
        throw new Error('Anda hanya dapat melakukan penarikan khusus untuk santri yang Anda bimbing. Pembimbing santri: ' + santriInfo.pembimbing);
      }
    } else {
      // Cek limit harian untuk penarikan normal
      var totalPenarikanHariIni = getTotalPenarikanHariIni(penarikanData.nis);
      var limitHarian = santriInfo.limitHarian || 0;
      
      if ((totalPenarikanHariIni + penarikanData.jumlah) > limitHarian) {
        throw new Error('Melebihi limit harian. Limit: Rp ' + limitHarian.toLocaleString('id-ID') + ', Sudah ditarik hari ini: Rp ' + totalPenarikanHariIni.toLocaleString('id-ID'));
      }
    }
    
    var sheet = ss.getSheetByName('PENARIKAN');
    if (!sheet) {
      throw new Error('Sheet PENARIKAN tidak ditemukan');
    }
    
    var penarikanId = generateId('WD');
    var now = new Date();
    
    var catatan = penarikanData.catatan || '';
    if (penarikanData.isPembimbing) {
      catatan = '[PENARIKAN KHUSUS] ' + catatan;
    }
    
    sheet.appendRow([
      penarikanId,
      penarikanData.nis,
      penarikanData.nama,
      penarikanData.jumlah,
      penarikanData.metode,
      penarikanData.penerima,
      now,
      catatan
    ]);
    
    SpreadsheetApp.flush();
    
    var saldoBaru = getSaldo(penarikanData.nis);
    
    return {
      success: true,
      data: {
        id: penarikanId,
        nis: penarikanData.nis,
        nama: penarikanData.nama,
        jumlah: penarikanData.jumlah,
        metode: penarikanData.metode,
        penerima: penarikanData.penerima,
        tanggal: Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
        catatan: catatan,
        saldoBaru: saldoBaru,
        isPembimbing: penarikanData.isPembimbing || false
      }
    };
  } catch (error) {
    Logger.log('Error processPenarikan: ' + error.message);
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// LAPORAN & HISTORY
// ==========================================

function getRiwayatTransaksi(nis, tipe, limit) {
  try {
    limit = limit || 50;
    var sheetName = tipe === 'topup' ? 'TOP-UP' : 'PENARIKAN';
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet || sheet.getLastRow() < 2) return [];
    
    var data = sheet.getRange(2, 1, sheet.getLastRow()-1, 8).getValues();
    
    // Filter by NIS
    var filtered = data.filter(row => row[1] == nis);
    
    // Sort by date descending
    filtered.sort((a, b) => new Date(b[6]) - new Date(a[6]));
    
    // Limit results
    filtered = filtered.slice(0, limit);
    
    return filtered.map(row => ({
      id: row[0],
      nis: row[1],
      nama: row[2],
      jumlah: row[3],
      metode: row[4],
      penerima: row[5],
      tanggal: Utilities.formatDate(new Date(row[6]), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
      catatan: row[7] || ''
    }));
  } catch (error) {
    Logger.log('Error getRiwayatTransaksi: ' + error.message);
    return [];
  }
}

function getSantriDashboardData(nis) {
  try {
    var santriInfo = getSantriInfo(nis);
    if (!santriInfo) {
      throw new Error('Data santri tidak ditemukan');
    }
    
    var saldo = getSaldo(nis);
    var totalPenarikanHariIni = getTotalPenarikanHariIni(nis);
    var sisaLimitHarian = Math.max(0, santriInfo.limitHarian - totalPenarikanHariIni);
    
    var riwayatTopUp = getRiwayatTransaksi(nis, 'topup', 10);
    var riwayatPenarikan = getRiwayatTransaksi(nis, 'penarikan', 10);
    
    return {
      success: true,
      santri: santriInfo,
      saldo: saldo,
      limitHarian: santriInfo.limitHarian,
      totalPenarikanHariIni: totalPenarikanHariIni,
      sisaLimitHarian: sisaLimitHarian,
      riwayatTopUp: riwayatTopUp,
      riwayatPenarikan: riwayatPenarikan
    };
  } catch (error) {
    Logger.log('Error getSantriDashboardData: ' + error.message);
    return {
      success: false,
      message: error.message
    };
  }
}

function getLaporanAdmin(filter) {
  try {
    var result = {
      topup: [],
      penarikan: [],
      saldo: [],
      transactionsByNis: {},
      summary: {
        totalTopUp: 0,
        totalPenarikan: 0,
        totalSaldo: 0,
        jumlahSantri: 0
      }
    };
    
    // PERBAIKAN: Hitung jumlah santri aktif dari DATA SANTRI
    var dataSantriSheet = ss.getSheetByName('DATA SANTRI');
    if (dataSantriSheet && dataSantriSheet.getLastRow() > 1) {
      var dataSantri = dataSantriSheet.getRange(2, 1, dataSantriSheet.getLastRow()-1, 6).getValues();
      var santriAktif = dataSantri.filter(function(row) {
        return row[5] === true; // Kolom 6 (index 5) adalah ACTIVE
      });
      result.summary.jumlahSantri = santriAktif.length;
      Logger.log('Jumlah santri aktif: ' + result.summary.jumlahSantri);
    }
    
    // Get TOP-UP data
    var topUpSheet = ss.getSheetByName('TOP-UP');
    if (topUpSheet && topUpSheet.getLastRow() > 1) {
      var topUpData = topUpSheet.getRange(2, 1, topUpSheet.getLastRow()-1, 8).getValues();
      result.topup = topUpData.map(row => ({
        id: row[0],
        nis: row[1],
        nama: row[2],
        jumlah: row[3],
        metode: row[4],
        penerima: row[5],
        tanggal: Utilities.formatDate(new Date(row[6]), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
        catatan: row[7] || ''
      }));
      
      result.summary.totalTopUp = topUpData.reduce((sum, row) => sum + (Number(row[3]) || 0), 0);
    }
    
    // Get PENARIKAN data
    var penarikanSheet = ss.getSheetByName('PENARIKAN');
    if (penarikanSheet && penarikanSheet.getLastRow() > 1) {
      var penarikanData = penarikanSheet.getRange(2, 1, penarikanSheet.getLastRow()-1, 8).getValues();
      result.penarikan = penarikanData.map(row => ({
        id: row[0],
        nis: row[1],
        nama: row[2],
        jumlah: row[3],
        metode: row[4],
        penerima: row[5],
        tanggal: Utilities.formatDate(new Date(row[6]), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
        catatan: row[7] || ''
      }));
      
      result.summary.totalPenarikan = penarikanData.reduce((sum, row) => sum + (Number(row[3]) || 0), 0);
    }
    
    // Get SALDO data
    var saldoSheet = ss.getSheetByName('SALDO');
    if (saldoSheet && saldoSheet.getLastRow() > 1) {
      var saldoData = saldoSheet.getRange(2, 1, saldoSheet.getLastRow()-1, 3).getValues();
      result.saldo = saldoData.map(row => ({
        nis: row[0],
        nama: row[1],
        saldo: row[2] || 0
      }));

      result.summary.totalSaldo = saldoData.reduce((sum, row) => sum + (Number(row[2]) || 0), 0);
      // Jumlah santri sudah dihitung dari DATA SANTRI, tidak perlu dari SALDO
    }

    // Process transactions by NIS for modal display
    result.topup.forEach(item => {
      if (!result.transactionsByNis[item.nis]) {
        result.transactionsByNis[item.nis] = { nama: item.nama, transactions: [] };
      }
      result.transactionsByNis[item.nis].transactions.push({
        type: 'topup',
        id: item.id,
        jumlah: item.jumlah,
        metode: item.metode,
        penerima: item.penerima,
        tanggal: item.tanggal,
        catatan: item.catatan
      });
    });

    result.penarikan.forEach(item => {
      if (!result.transactionsByNis[item.nis]) {
        result.transactionsByNis[item.nis] = { nama: item.nama, transactions: [] };
      }
      result.transactionsByNis[item.nis].transactions.push({
        type: 'penarikan',
        id: item.id,
        jumlah: item.jumlah,
        metode: item.metode,
        penerima: item.penerima,
        tanggal: item.tanggal,
        catatan: item.catatan
      });
    });

    // Sort transactions by date (newest first) and limit to 10 for each student
    Object.keys(result.transactionsByNis).forEach(nis => {
      result.transactionsByNis[nis].transactions.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      result.transactionsByNis[nis].transactions = result.transactionsByNis[nis].transactions.slice(0, 10);
    });

    return {
      success: true,
      data: result
    };
  } catch (error) {
    Logger.log('Error getLaporanAdmin: ' + error.message);
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// UTILITIES
// ==========================================

function generateId(prefix) {
  var now = new Date();
  var year = now.getFullYear().toString().substr(-2);
  var month = ('0' + (now.getMonth() + 1)).slice(-2);
  var day = ('0' + now.getDate()).slice(-2);
  var random = Math.floor(Math.random() * 9000) + 1000;
  
  return prefix + '-' + year + month + day + '-' + random;
}

function getDriveImageURL(fileName) {
  try {
    var files = DriveApp.getFilesByName(fileName);
    
    if (files.hasNext()) {
      var file = files.next();
      var blob = file.getThumbnail();
      var base64Data = Utilities.base64Encode(blob.getBytes());
      var dataUrl = "data:" + blob.getContentType() + ";base64," + base64Data;
      
      return dataUrl;
    } else {
      Logger.log('File not found: ' + fileName);
      return "";
    }
  } catch (e) {
    Logger.log("Error getDriveImageURL: " + e.message);
    return "";
  }
}

function getAppLogo() {
  return getDriveImageURL(CONFIG.LOGO_FILE_NAME);
}