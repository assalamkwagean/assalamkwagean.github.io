/**
 * KONFIGURASI APLIKASI TABUNGAN SANTRI
 * 
 * File ini berisi semua konfigurasi yang dapat disesuaikan
 */

var CONFIG = {
  // ========================
  // IDENTITAS INSTITUSI
  // ========================
  PONDOK_NAME: 'Pondok As-Salam',
  PESANTREN_NAME: 'Pesantren Fathul Ulum Kwagean',
  ACADEMIC_YEAR: '1446-1447 H.',
  
  // ========================
  // FILE ASSETS
  // ========================
  LOGO_FILE_NAME: 'logo_pondok.webp',
  
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
    dateFormat: 'dd/MM/yyyy'
  },
  
  // ========================
  // OTORITAS ADMIN
  // ========================
  OTORITAS: {
    SUPER_ADMIN: 'Super Admin',
    ADMIN_TOPUP: 'Admin Top-Up',
    ADMIN_PENARIKAN: 'Admin Penarikan',
    ADMIN_LAPORAN: 'Admin Laporan',
    PEMBIMBING: 'Pembimbing'
  }
};

/**
 * Fungsi untuk mendapatkan seluruh konfigurasi
 */
function getAppConfig() {
  return CONFIG;
}

function getPondokName() {
  return CONFIG.PONDOK_NAME;
}

function getPesantrenName() {
  return CONFIG.PESANTREN_NAME;
}

function getAcademicYear() {
  return CONFIG.ACADEMIC_YEAR;
}

function getLogoFileName() {
  return CONFIG.LOGO_FILE_NAME;
}

function getFullInstitutionName() {
  return CONFIG.PONDOK_NAME + ' ' + CONFIG.PESANTREN_NAME;
}