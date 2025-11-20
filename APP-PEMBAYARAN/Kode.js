var ss = SpreadsheetApp.getActiveSpreadsheet();

// ==========================================
// AUTHENTICATION & SESSION
// ==========================================

function verifyLogin(email, password) {
  try {
    var sheet = ss.getSheetByName('ADMIN USER');
    if (!sheet) throw new Error('Sheet ADMIN USER tidak ditemukan');
    
    var data = sheet.getRange(2, 1, Math.max(1, sheet.getLastRow()-1), 4).getValues();
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
      user: user[1]
    };
  } catch (error) {
    Logger.log('Error verifyLogin: ' + error.message);
    return { success: false, message: 'Terjadi kesalahan sistem' };
  }
}

function verifySession() {
  return true;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==========================================
// DATA RETRIEVAL - OPTIMIZED
// ==========================================

function getActiveStudents() {
  try {
    var sheet = ss.getSheetByName('DATA SANTRI');
    if (!sheet || sheet.getLastRow() < 2) return [];
    
    var data = sheet.getRange(2, 1, sheet.getLastRow()-1, 6).getValues();
    return data.filter(row => row[5] === true);
  } catch (error) {
    Logger.log('Error getActiveStudents: ' + error.message);
    return [];
  }
}

// ==========================================
// KATEGORI FUNCTIONS - WITH POTONGAN
// ==========================================

function getCategoriesFromSheet(sheetName) {
  try {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) return [];
    
    const data = sheet.getRange(2, 1, sheet.getLastRow()-1, sheet.getLastColumn()).getValues();
    const headers = sheet.getRange(1, 3, 1, sheet.getLastColumn()-2).getValues()[0];

    return data.map(row => {
      const tagihan = headers
        .map((header, index) => ({
          nama: header,
          jumlah: row[index + 2]
        }))
        .filter(t => t.nama && t.jumlah > 0 && !isNaN(t.jumlah));

      return {
        nama: row[1],
        tagihan: tagihan
      };
    }).filter(c => c.tagihan.length > 0);
  } catch (error) {
    Logger.log('Error getCategoriesFromSheet: ' + error.message);
    return [];
  }
}

function getCategories() {
  return getCategoriesFromSheet('KATEGORI');
}

function getCategories2() {
  return getCategoriesFromSheet('KATEGORI-2');
}

function getCategories3() {
  return getCategoriesFromSheet('KATEGORI-3');
}

// ==========================================
// TAGIHAN WITH BALANCE & POTONGAN - ENHANCED
// ==========================================

function getCategoriesWithBalanceFromSheet(categoryName, nis, sheetName, recapColOffset) {
  try {
    const kategoriSheet = ss.getSheetByName(sheetName);
    if (!kategoriSheet) return [];
    
    const kategoriData = kategoriSheet.getDataRange().getValues();
    const kategoriHeaders = kategoriData[0];
    const kategoriRow = kategoriData.find(row => row[1] === categoryName);
    
    if (!kategoriRow) return [];
    
    // Get RECAP data
    const recapSheet = ss.getSheetByName('RECAP');
    const potonganSheet = ss.getSheetByName('POTONGAN');
    
    let recapRow = null;
    let potonganRow = null;
    
    if (recapSheet && recapSheet.getLastRow() > 1) {
      const recapData = recapSheet.getDataRange().getValues();
      const recapHeaders = recapData[0];
      recapRow = recapData.find(row => row[0] == nis);
      
      // Get potongan data
      if (potonganSheet && potonganSheet.getLastRow() > 1) {
        const potonganData = potonganSheet.getDataRange().getValues();
        potonganRow = potonganData.find(row => row[0] == nis);
      }
      
      const tagihanList = [];
      
      for (let i = 2; i < kategoriHeaders.length; i++) {
        const jenisTagihan = kategoriHeaders[i];
        const jumlahTagihan = kategoriRow[i] || 0;
        
        if (jumlahTagihan > 0 && jenisTagihan) {
          let sudahDibayarkan = 0;
          let totalPotongan = 0;
          
          if (recapRow) {
            const recapColIndex = recapHeaders.indexOf(jenisTagihan, recapColOffset);
            if (recapColIndex !== -1) {
              sudahDibayarkan = recapRow[recapColIndex] || 0;
            }
          }
          
          if (potonganRow) {
            const potonganColIndex = recapHeaders.indexOf(jenisTagihan, recapColOffset);
            if (potonganColIndex !== -1) {
              totalPotongan = potonganRow[potonganColIndex] || 0;
            }
          }
          
          // Hitung sisa = tagihan - dibayar - potongan
          const sisaTagihan = jumlahTagihan - sudahDibayarkan - totalPotongan;
          
          // Hanya tampilkan jika masih ada sisa
          if (sisaTagihan > 0) {
            tagihanList.push({
              nama: jenisTagihan,
              jumlah: sisaTagihan,
              jumlahAsli: jumlahTagihan,
              sudahDibayar: sudahDibayarkan,
              totalPotongan: totalPotongan
            });
          }
        }
      }
      
      return tagihanList;
    }
    
    // Jika tidak ada recap, return semua tagihan
    const tagihanList = [];
    
    for (let i = 2; i < kategoriHeaders.length; i++) {
      const jenisTagihan = kategoriHeaders[i];
      const jumlahTagihan = kategoriRow[i] || 0;
      
      if (jumlahTagihan > 0 && jenisTagihan) {
        tagihanList.push({
          nama: jenisTagihan,
          jumlah: jumlahTagihan,
          jumlahAsli: jumlahTagihan,
          sudahDibayar: 0,
          totalPotongan: 0
        });
      }
    }
    
    return tagihanList;
  } catch (error) {
    Logger.log('Error getCategoriesWithBalanceFromSheet: ' + error.message);
    return [];
  }
}

function getCategoriesWithBalance(categoryName, nis) {
  return getCategoriesWithBalanceFromSheet(categoryName, nis, 'KATEGORI', 3);
}

function getCategories2WithBalance(categoryName, nis) {
  return getCategoriesWithBalanceFromSheet(categoryName, nis, 'KATEGORI-2', 4);
}

function getCategories3WithBalance(categoryName, nis) {
  return getCategoriesWithBalanceFromSheet(categoryName, nis, 'KATEGORI-3', 5);
}

// ==========================================
// PAYMENT PROCESSING - ENHANCED
// ==========================================

function getPaymentMethods() {
  return ['Tunai', 'Transfer Bank', 'QRIS', 'Lainnya'];
}

function getAdminUsers() {
  try {
    var sheet = ss.getSheetByName('ADMIN USER');
    if (!sheet || sheet.getLastRow() < 2) return [];
    return sheet.getRange(2, 1, sheet.getLastRow()-1, 4).getValues();
  } catch (error) {
    Logger.log('Error getAdminUsers: ' + error.message);
    return [];
  }
}

function processPayment(paymentData) {
  try {
    // Validasi input
    if (!paymentData.nis || !paymentData.nama) {
      throw new Error('Data santri tidak lengkap');
    }
    
    if (!paymentData.metode || !paymentData.penerima) {
      throw new Error('Metode pembayaran atau penerima tidak valid');
    }
    
    const transactionSheet = ss.getSheetByName('TRANSAKSI');
    if (!transactionSheet) {
      throw new Error('Sheet TRANSAKSI tidak ditemukan');
    }
    
    const paymentId = generatePaymentId();
    const now = new Date();
    let processedCount = 0;

    // Process tagihan kategori 1
    if (paymentData.tagihan && paymentData.tagihan.length > 0) {
      paymentData.tagihan.forEach((tagihan) => {
        // Validasi jumlah
        const jumlahDibayar = Number(tagihan.jumlahDibayar) || 0;
        const potongan = Number(tagihan.potongan) || 0;
        
        if (jumlahDibayar < 0 || potongan < 0) {
          throw new Error('Jumlah pembayaran atau potongan tidak valid');
        }
        
        if (jumlahDibayar === 0 && potongan === 0) {
          return; // Skip jika tidak ada pembayaran
        }
        
        const totalDibayar = getTotalPaid(paymentData.nis, tagihan.jenisTagihan) + jumlahDibayar;
        const totalPotongan = getTotalDiscount(paymentData.nis, tagihan.jenisTagihan) + potongan;
        const totalTagihan = Number(tagihan.jumlahTagihan);
        const status = (totalDibayar + totalPotongan) >= totalTagihan ? 'Lunas' : 'Diangsur';

        transactionSheet.appendRow([
          paymentId,
          paymentData.nis,
          paymentData.nama,
          paymentData.kategori,
          tagihan.jenisTagihan,
          tagihan.jumlahTagihan,
          potongan,
          jumlahDibayar,
          paymentData.metode,
          paymentData.penerima,
          now,
          status,
          paymentData.catatan || ''
        ]);
        processedCount++;
      });
    }

    // Process tagihan kategori 2
    if (paymentData.tagihan2 && paymentData.tagihan2.length > 0) {
      paymentData.tagihan2.forEach((tagihan) => {
        const jumlahDibayar = Number(tagihan.jumlahDibayar) || 0;
        const potongan = Number(tagihan.potongan) || 0;
        
        if (jumlahDibayar < 0 || potongan < 0) {
          throw new Error('Jumlah pembayaran atau potongan tidak valid');
        }
        
        if (jumlahDibayar === 0 && potongan === 0) {
          return;
        }
        
        const totalDibayar = getTotalPaid(paymentData.nis, tagihan.jenisTagihan) + jumlahDibayar;
        const totalPotongan = getTotalDiscount(paymentData.nis, tagihan.jenisTagihan) + potongan;
        const totalTagihan = Number(tagihan.jumlahTagihan);
        const status = (totalDibayar + totalPotongan) >= totalTagihan ? 'Lunas' : 'Diangsur';

        transactionSheet.appendRow([
          paymentId,
          paymentData.nis,
          paymentData.nama,
          paymentData.kategori2,
          tagihan.jenisTagihan,
          tagihan.jumlahTagihan,
          potongan,
          jumlahDibayar,
          paymentData.metode,
          paymentData.penerima,
          now,
          status,
          paymentData.catatan || ''
        ]);
        processedCount++;
      });
    }

    // Process tagihan kategori 3
    if (paymentData.tagihan3 && paymentData.tagihan3.length > 0) {
      paymentData.tagihan3.forEach((tagihan) => {
        const jumlahDibayar = Number(tagihan.jumlahDibayar) || 0;
        const potongan = Number(tagihan.potongan) || 0;
        
        if (jumlahDibayar < 0 || potongan < 0) {
          throw new Error('Jumlah pembayaran atau potongan tidak valid');
        }
        
        if (jumlahDibayar === 0 && potongan === 0) {
          return;
        }
        
        const totalDibayar = getTotalPaid(paymentData.nis, tagihan.jenisTagihan) + jumlahDibayar;
        const totalPotongan = getTotalDiscount(paymentData.nis, tagihan.jenisTagihan) + potongan;
        const totalTagihan = Number(tagihan.jumlahTagihan);
        const status = (totalDibayar + totalPotongan) >= totalTagihan ? 'Lunas' : 'Diangsur';

        transactionSheet.appendRow([
          paymentId,
          paymentData.nis,
          paymentData.nama,
          paymentData.kategori3,
          tagihan.jenisTagihan,
          tagihan.jumlahTagihan,
          potongan,
          jumlahDibayar,
          paymentData.metode,
          paymentData.penerima,
          now,
          status,
          paymentData.catatan || ''
        ]);
        processedCount++;
      });
    }

    // Process biaya admin
    if (paymentData.biayaAdmin && paymentData.biayaAdmin.jumlah > 0) {
      const biayaAdmin = paymentData.biayaAdmin;
      
      transactionSheet.appendRow([
        paymentId,
        paymentData.nis,
        paymentData.nama,
        paymentData.kategori,
        biayaAdmin.keterangan,
        0,
        0,
        biayaAdmin.jumlah,
        paymentData.metode,
        paymentData.penerima,
        now,
        'Lunas',
        'Biaya Administratif'
      ]);
      processedCount++;
    }
    
    if (processedCount === 0) {
      throw new Error('Tidak ada transaksi yang diproses');
    }

    // Flush changes
    SpreadsheetApp.flush();

    return {
      success: true,
      paymentId: paymentId,
      data: {
        id: paymentId,
        nis: paymentData.nis,
        nama: paymentData.nama,
        kategori: paymentData.kategori,
        kategori2: paymentData.kategori2,
        kategori3: paymentData.kategori3,
        metode: paymentData.metode,
        penerima: paymentData.penerima,
        catatan: paymentData.catatan || '',
        tanggal: Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
        tagihan: paymentData.tagihan || [],
        tagihan2: paymentData.tagihan2 || [],
        tagihan3: paymentData.tagihan3 || [],
        totalTagihan: (paymentData.tagihan || []).reduce((sum, t) => sum + Number(t.jumlahTagihan), 0),
        totalTagihan2: (paymentData.tagihan2 || []).reduce((sum, t) => sum + Number(t.jumlahTagihan), 0),
        totalTagihan3: (paymentData.tagihan3 || []).reduce((sum, t) => sum + Number(t.jumlahTagihan), 0),
        totalPotongan: (paymentData.tagihan || []).reduce((sum, t) => sum + Number(t.potongan), 0) + 
                       (paymentData.tagihan2 || []).reduce((sum, t) => sum + Number(t.potongan), 0) +
                       (paymentData.tagihan3 || []).reduce((sum, t) => sum + Number(t.potongan), 0),
        totalDibayar: (paymentData.tagihan || []).reduce((sum, t) => sum + Number(t.jumlahDibayar), 0) + 
                      (paymentData.tagihan2 || []).reduce((sum, t) => sum + Number(t.jumlahDibayar), 0) +
                      (paymentData.tagihan3 || []).reduce((sum, t) => sum + Number(t.jumlahDibayar), 0),
        biayaAdmin: paymentData.biayaAdmin || null
      }
    };
  } catch (error) {
    Logger.log('Error processPayment: ' + error.message);
    return {
      success: false,
      message: error.message
    };
  }
}

function getTotalPaid(nis, jenisTagihan) {
  try {
    var sheet = ss.getSheetByName('TRANSAKSI');
    if (!sheet || sheet.getLastRow() < 2) return 0;
    
    var data = sheet.getRange(2, 1, sheet.getLastRow()-1, sheet.getLastColumn()).getValues();
    
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i][1] == nis && data[i][4] === jenisTagihan) {
        total += Number(data[i][7]) || 0;
      }
    }
    return total;
  } catch (error) {
    Logger.log('Error getTotalPaid: ' + error.message);
    return 0;
  }
}

function getTotalDiscount(nis, jenisTagihan) {
  try {
    var sheet = ss.getSheetByName('TRANSAKSI');
    if (!sheet || sheet.getLastRow() < 2) return 0;
    
    var data = sheet.getRange(2, 1, sheet.getLastRow()-1, sheet.getLastColumn()).getValues();
    
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i][1] == nis && data[i][4] === jenisTagihan) {
        total += Number(data[i][6]) || 0;
      }
    }
    return total;
  } catch (error) {
    Logger.log('Error getTotalDiscount: ' + error.message);
    return 0;
  }
}

function generatePaymentId() {
  var now = new Date();
  var year = now.getFullYear().toString().substr(-2);
  var month = ('0' + (now.getMonth() + 1)).slice(-2);
  var day = ('0' + now.getDate()).slice(-2);
  var random = Math.floor(Math.random() * 9000) + 1000;
  
  return 'PAY-' + year + month + day + '-' + random;
}

// ==========================================
// RECAP FUNCTIONS - ENHANCED WITH POTONGAN
// ==========================================

function getRecapDetail(nis) {
   try {
     const dataSantriSheet = ss.getSheetByName('DATA SANTRI');
     if (!dataSantriSheet) throw new Error('Sheet DATA SANTRI tidak ditemukan');

     const dataSantri = dataSantriSheet.getDataRange().getValues();
     const santri = dataSantri.find(row => row[0] == nis);

     if (!santri) {
       return {
         nis: nis,
         nama: 'Tidak ditemukan',
         kategori: '-',
         kategori2: '-',
         kategori3: '-',
         tagihanGroups: []
       };
     }

     const nama = santri[1];
     const kategori = santri[2];
     const kategori2 = santri[3];
     const kategori3 = santri[4];

     const tagihanList = [];

     // Proses KATEGORI
     const kategoriSheet = ss.getSheetByName('KATEGORI');
     if (kategoriSheet) {
       const kategoriData = kategoriSheet.getDataRange().getValues();
       const kategoriHeader = kategoriData[0];
       const kategoriRow = kategoriData.find(row => row[1] === kategori);

       if (kategoriRow) {
         tagihanList.push(...processKategoriTagihanWithPotongan(kategoriRow, kategoriHeader, nis));
       }
     }

     // Proses KATEGORI-2
     const kategori2Sheet = ss.getSheetByName('KATEGORI-2');
     if (kategori2Sheet) {
       const kategori2Data = kategori2Sheet.getDataRange().getValues();
       const kategori2Header = kategori2Data[0];
       const kategori2Row = kategori2Data.find(row => row[1] === kategori2);

       if (kategori2Row) {
         tagihanList.push(...processKategoriTagihanWithPotongan(kategori2Row, kategori2Header, nis));
       }
     }

     // Proses KATEGORI-3
     const kategori3Sheet = ss.getSheetByName('KATEGORI-3');
     if (kategori3Sheet) {
       const kategori3Data = kategori3Sheet.getDataRange().getValues();
       const kategori3Header = kategori3Data[0];
       const kategori3Row = kategori3Data.find(row => row[1] === kategori3);

       if (kategori3Row) {
         tagihanList.push(...processKategoriTagihanWithPotongan(kategori3Row, kategori3Header, nis));
       }
     }

     // Fungsi untuk mendapatkan nama kelompok dari jenis tagihan
     function getGroupName(jenisTagihan) {
       const match = jenisTagihan.match(/\[([^\]]+)\]/);
       return match ? match[1] : 'Umum';
     }

     // Kelompokkan tagihan berdasarkan tanda []
     const groupedTagihan = {};
     tagihanList.forEach(tagihan => {
       const group = getGroupName(tagihan.jenis);
       if (!groupedTagihan[group]) {
         groupedTagihan[group] = [];
       }
       groupedTagihan[group].push(tagihan);
     });

     // Konversi ke array groups
     const tagihanGroups = Object.keys(groupedTagihan).map(groupName => ({
       name: groupName,
       tagihan: groupedTagihan[groupName]
     }));

     return {
       nis: nis,
       nama: nama,
       kategori: kategori,
       kategori2: kategori2,
       kategori3: kategori3,
       tagihanGroups: tagihanGroups
     };
   } catch (error) {
     Logger.log('Error getRecapDetail: ' + error.message);
     return {
       nis: nis,
       nama: 'Error',
       kategori: '-',
       kategori2: '-',
       kategori3: '-',
       tagihanGroups: []
     };
   }
 }

function processKategoriTagihanWithPotongan(kategoriRow, kategoriHeader, nis) {
  const tagihanList = [];
  const recapSheet = ss.getSheetByName('RECAP');
  const potonganSheet = ss.getSheetByName('POTONGAN');
  
  if (!recapSheet) {
    // Jika tidak ada RECAP, return tagihan dasar
    for (let i = 2; i < kategoriHeader.length; i++) {
      const jenisTagihan = kategoriHeader[i];
      const jumlahTagihan = kategoriRow[i] || 0;
      
      if (jumlahTagihan > 0) {
        tagihanList.push({
          jenis: jenisTagihan,
          jumlahTagihan: jumlahTagihan,
          sudahDibayarkan: 0,
          totalPotongan: 0
        });
      }
    }
    return tagihanList;
  }
  
  const recapData = recapSheet.getDataRange().getValues();
  const recapHeader = recapData[0];
  const recapRow = recapData.find(row => row[0] == nis);
  
  let potonganRow = null;
  if (potonganSheet) {
    const potonganData = potonganSheet.getDataRange().getValues();
    potonganRow = potonganData.find(row => row[0] == nis);
  }
  
  for (let i = 2; i < kategoriHeader.length; i++) {
    const jenisTagihan = kategoriHeader[i];
    const jumlahTagihan = kategoriRow[i] || 0;
    
    if (jumlahTagihan > 0) {
      let sudahDibayarkan = 0;
      let totalPotongan = 0;
      
      if (recapRow) {
        const recapColIndex = recapHeader.indexOf(jenisTagihan);
        if (recapColIndex !== -1) {
          sudahDibayarkan = recapRow[recapColIndex] || 0;
        }
      }
      
      if (potonganRow) {
        const potonganColIndex = recapHeader.indexOf(jenisTagihan);
        if (potonganColIndex !== -1) {
          totalPotongan = potonganRow[potonganColIndex] || 0;
        }
      }
      
      tagihanList.push({
        jenis: jenisTagihan,
        jumlahTagihan: jumlahTagihan,
        sudahDibayarkan: sudahDibayarkan,
        totalPotongan: totalPotongan
      });
    }
  }
  
  return tagihanList;
}

// ==========================================
// ASSETS & UTILITIES
// ==========================================

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

function getInstitutionData() {
  return {
    pondokName: CONFIG.PONDOK_NAME,
    pesantrenName: CONFIG.PESANTREN_NAME,
    academicYear: CONFIG.ACADEMIC_YEAR,
    fullName: CONFIG.PONDOK_NAME + ' ' + CONFIG.PESANTREN_NAME,
    logoFileName: CONFIG.LOGO_FILE_NAME
  };
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

// ==========================================
// WEB APP HANDLER
// ==========================================

function doGet(e) {
  var page = e.parameter.page || 'login';
  
  if (page === 'login') {
    return renderTemplate('login')
           .setTitle('APP PEMBAYARAN ' + CONFIG.PONDOK_NAME.toUpperCase());
  }
  
  if (page === 'form') {
    var template = HtmlService.createTemplateFromFile('form');
    template.CONFIG = CONFIG;
    template.action = ScriptApp.getService().getUrl();
    return template.evaluate()
           .setTitle('Form Pembayaran ' + CONFIG.PONDOK_NAME)
           .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  if (page === 'recap') {
    var template = HtmlService.createTemplateFromFile('recap');
    template.CONFIG = CONFIG;
    return template.evaluate()
           .setTitle('Rekapitulasi Pembayaran ' + CONFIG.PONDOK_NAME)
           .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

function renderTemplate(filename) {
  var template = HtmlService.createTemplateFromFile(filename);
  
  template.CONFIG = CONFIG;
  template.pondokName = CONFIG.PONDOK_NAME;
  template.pesantrenName = CONFIG.PESANTREN_NAME;
  template.academicYear = CONFIG.ACADEMIC_YEAR;
  template.logoFileName = CONFIG.LOGO_FILE_NAME;
  
  return template.evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}