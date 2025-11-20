/**
 * KONFIGURASI APLIKASI PEMBAYARAN PONDOK PESANTREN
 * 
 * File ini berisi semua konfigurasi yang dapat disesuaikan
 * untuk mengubah identitas institusi tanpa mengubah kode utama.
 */

var CONFIG = {
  // ========================
  // IDENTITAS INSTITUSI
  // ========================
  PONDOK_NAME: 'Pondok As-Salam',
  PESANTREN_NAME: 'Pesantren Fathul Ulum Kwagean',
  ACADEMIC_YEAR: '1446-1447 H.',
  INSTITUTION_TYPE: 'Pesantren',
  
  // ========================
  // FILE ASSETS
  // ========================
  LOGO_FILE_NAME: 'logo_pondok.webp',
  LOGO_KWITANSI_FILE_NAME: 'logo_kwitansi.png', // gunakan Logo hitam putih khusus untuk kwitansi
  
  // ========================
  // INFORMASI KONTAK
  // ========================
  CONTACT_INFO: {
    alamat: 'Jl. Pesantren No. 123, Jawa Timur',
    telepon: '(0331) 123456',
    email: 'info@pondokassalam.com',
    website: 'www.pondokassalam.com'
  },
  
  // ========================
  // SETTING APLIKASI
  // ========================
  APP_SETTINGS: {
    currency: 'IDR',
    currencySymbol: 'Rp',
    timezone: 'Asia/Jakarta',
    dateFormat: 'dd/MM/yyyy',
    receiptWidth: '80mm'
  },
  
  // ========================
  // TEXT & LABEL CUSTOM
  // ========================
  TEXT_CONTENT: {
    paymentTitle: 'PEMBAYARAN',
    receiptTitle: 'KWITANSI PEMBAYARAN',
    recapTitle: 'REKAPITULASI PEMBAYARAN',
    loginTitle: 'Login Admin',
    systemName: 'Sistem Pembayaran Digital'
  }
};

/**
 * Fungsi untuk mendapatkan seluruh konfigurasi
 * @return {Object} Object konfigurasi lengkap
 */
function getAppConfig() {
  return CONFIG;
}

/**
 * Fungsi untuk mendapatkan nama pondok
 * @return {string} Nama pondok
 */
function getPondokName() {
  return CONFIG.PONDOK_NAME;
}

/**
 * Fungsi untuk mendapatkan nama pesantren
 * @return {string} Nama pesantren
 */
function getPesantrenName() {
  return CONFIG.PESANTREN_NAME;
}

/**
 * Fungsi untuk mendapatkan tahun ajaran
 * @return {string} Tahun ajaran
 */
function getAcademicYear() {
  return CONFIG.ACADEMIC_YEAR;
}

/**
 * Fungsi untuk mendapatkan nama file logo
 * @return {string} Nama file logo
 */
function getLogoFileName() {
  return CONFIG.LOGO_FILE_NAME;
}

/**
 * Fungsi untuk mendapatkan nama file logo kwitansi
 * @return {string} Nama file logo kwitansi
 */
function getLogoKwitansiFileName() {
  return CONFIG.LOGO_KWITANSI_FILE_NAME;
}

/**
 * Fungsi untuk mendapatkan nama institusi lengkap
 * @return {string} Nama pondok + pesantren
 */
function getFullInstitutionName() {
  return CONFIG.PONDOK_NAME + ' ' + CONFIG.PESANTREN_NAME;
}

/**
 * Fungsi untuk mendapatkan data institusi
 * @return {Object} Data institusi untuk template
 */
function getInstitutionData() {
  return {
    pondokName: CONFIG.PONDOK_NAME,
    pesantrenName: CONFIG.PESANTREN_NAME,
    academicYear: CONFIG.ACADEMIC_YEAR,
    fullName: CONFIG.PONDOK_NAME + ' ' + CONFIG.PESANTREN_NAME,
    logoFileName: CONFIG.LOGO_FILE_NAME,
    logoKwitansiFileName: CONFIG.LOGO_KWITANSI_FILE_NAME,
    contactInfo: CONFIG.CONTACT_INFO,
    textContent: CONFIG.TEXT_CONTENT
  };
}