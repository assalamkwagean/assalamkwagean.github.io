<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <!-- Hapus duplikasi library html2pdf.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <!-- Pastikan jsPDF dan AutoTable dimuat dengan benar -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>
  <script>
    // Konfigurasi Tailwind untuk palet warna Dark Mode
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            slate: {
              900: '#0f172a',
              800: '#1e293b',
              700: '#334155',
            },
            indigo: {
              600: '#4f46e5',
              500: '#6366f1',
            }
          }
        }
      }
    }
  </script>
  <style>
    /* =============================================
       MOBILE ZOOM PREVENTION - ENHANCED
       ============================================= */
    
    /* Base font size untuk mobile - CRITICAL untuk prevent zoom */
    body {
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }

    /* Minimum 16px font-size untuk SEMUA input elements */
    input, 
    textarea, 
    select:not(.select2) {
      font-size: 16px !important;
      transform: scale(1);
      max-height: 44px !important; /* Minimum touch target size */
      min-height: 44px !important;
      -webkit-appearance: none;
      appearance: none;
      border-radius: 6px !important;
    }

    /* Select2 elements - Enhanced untuk mobile */
    .select2-container--default .select2-selection--single {
      font-size: 16px !important;
      min-height: 44px !important;
      background-color: #334155 !important;
      border-color: #475569 !important;
      height: 44px !important;
      display: flex !important;
      align-items: center !important;
    }

    .select2-container--default .select2-selection--single .select2-selection__rendered {
      line-height: 44px !important;
      font-size: 16px !important;
      color: #f1f5f9 !important;
    }

    /* Tombol juga perlu ukuran touch yang cukup */
    button {
      min-height: 44px;
      touch-action: manipulation;
    }

    /* iOS Specific fixes */
    @supports (-webkit-touch-callout: none) {
      input, 
      textarea, 
      select:not(.select2) {
        font-size: 16px !important;
        transform: scale(1);
      }
      
      .select2-container--default .select2-selection--single {
        font-size: 16px !important;
      }
    }

    /* Untuk desktop - kembalikan ke ukuran normal */
    @media (min-width: 768px) {
      input, 
      textarea, 
      select:not(.select2) {
        font-size: 14px !important;
        max-height: none !important;
        min-height: auto !important;
      }
      
      .select2-container--default .select2-selection--single {
        font-size: 14px !important;
        min-height: auto !important;
        height: auto !important;
      }
      
      .select2-container--default .select2-selection--single .select2-selection__rendered {
        line-height: normal !important;
        font-size: 14px !important;
      }
    }

    /* Additional prevention techniques */
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }

    input, textarea, select {
      -webkit-user-select: text;
      user-select: text;
      -webkit-touch-callout: default;
    }

    /* =============================================
       SELECT2 DARK MODE STYLING
       ============================================= */
    .select2-container--default .select2-results__option[aria-selected="true"] {
      background-color: #4f46e5 !important;
      color: white !important;
    }

    .select2-container--default .select2-selection--single {
      background-color: #334155 !important;
      border-color: #475569 !important;
      color: #f1f5f9 !important;
    }
    
    .select2-container--default .select2-selection--single .select2-selection__rendered {
      color: #f1f5f9 !important;
    }
    
    .select2-dropdown {
      background-color: #334155 !important;
      border-color: #475569 !important;
    }
    
    .select2-container--default .select2-results__option {
      background-color: #334155 !important;
      color: #f1f5f9 !important;
    }
    
    .select2-container--default .select2-results__option--highlighted[aria-selected] {
      background-color: #4f46e5 !important;
    }

    .select2-container--default .select2-search--inline .select2-search__field {
      color: #f1f5f9 !important;
      background: transparent !important;
      border: none !important;
      outline: none !important;
    }

    .select2-container--default .select2-search__field {
      color: #f1f5f9 !important;
      background-color: #334155 !important;
      border: 1px solid #475569 !important;
    }

    /* Untuk search dropdown */
    .select2-container--default .select2-search--dropdown .select2-search__field {
      background-color: #334155 !important;
      border-color: #475569 !important;
      color: #f1f5f9 !important;
      font-size: 16px !important;
      min-height: 38px !important;
    }

    /* =============================================
       TABLE STYLING UNTUK DARK MODE
       ============================================= */
    .recap-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .recap-table th, .recap-table td {
      padding: 12px 10px;
      text-align: left;
      border-bottom: 1px solid #475569;
      font-size: 14px;
    }
    
    .recap-table th {
      background-color: #4f46e5;
      color: white;
      font-weight: bold;
      position: sticky;
      top: 0;
    }
    
    .recap-table tr:nth-child(even) {
      background-color: #334155;
    }
    
    .recap-table tr:hover {
      background-color: #475569;
    }
    
    .progress-bar {
      height: 8px;
      background-color: #475569;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 4px;
    }
    
    .progress-fill {
      height: 100%;
      background-color: #10b981;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    /* =============================================
       PDF STYLING
       ============================================= */
    #pdfContent {
      background: white;
      color: #000;
      padding: 15px;
      font-family: Arial, sans-serif;
      max-width: 100%;
      width: 210mm; /* Lebar A4 */
    }
    
    .pdf-header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px dashed #ccc;
    }
    
    .pdf-info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 10pt;
    }
    
    .pdf-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 9pt;
      table-layout: fixed;
    }
    
    .pdf-table th {
      background-color: #3b82f6;
      color: white;
      padding: 6px 4px;
      text-align: left;
      border: 1px solid #ddd;
    }
    
    .pdf-table td {
      padding: 5px 4px;
      border: 1px solid #ddd;
      word-wrap: break-word;
    }
    
    /* Kolom dengan lebar spesifik */
    .pdf-table th:nth-child(1), .pdf-table td:nth-child(1) { width: 25%; } /* Jenis Tagihan */
    .pdf-table th:nth-child(2), .pdf-table td:nth-child(2) { width: 20%; } /* Jumlah Tagihan */
    .pdf-table th:nth-child(3), .pdf-table td:nth-child(3) { width: 20%; } /* Sudah Dibayar */
    .pdf-table th:nth-child(4), .pdf-table td:nth-child(4) { width: 20%; } /* Sisa */
    .pdf-table th:nth-child(5), .pdf-table td:nth-child(5) { width: 15%; } /* Status */
    
    .pdf-summary {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px dashed #ccc;
    }
    
    .pdf-summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .pdf-footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px dashed #ccc;
      text-align: center;
      font-size: 8pt;
      color: #666;
    }
    
    /* Print styles untuk PDF */
    @media print {
      body * {
        visibility: hidden;
      }
      
      #pdfContent, #pdfContent * {
        visibility: visible;
      }
      
      #pdfContent {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white;
        padding: 15px;
        box-shadow: none;
      }
      
      .no-print {
        display: none !important;
      }
    }
    
    /* =============================================
       MODAL STYLING
       ============================================= */
    /* CSS tambahan untuk modal PDF */
    #pdfModal {
      z-index: 1000;
      backdrop-filter: blur(5px);
    }
    
    #pdfModal > div {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-height: 90vh;
      overflow-y: auto;
    }

    /* =============================================
       MOBILE RESPONSIVE STYLING
       ============================================= */
    @media (max-width: 767px) {
      .container {
        padding-left: 12px;
        padding-right: 12px;
      }
      
      .bg-slate-800.rounded-lg {
        margin: 8px;
        border-radius: 12px;
      }
      
      /* Improve table responsiveness */
      .recap-table {
        font-size: 12px;
      }
      
      .recap-table th, .recap-table td {
        padding: 8px 6px;
      }
      
      /* Stack grid columns on mobile */
      .grid.grid-cols-1.md\:grid-cols-3 {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      /* Improve button sizing */
      .flex.justify-between .flex.items-center {
        min-height: 48px;
        padding: 12px 16px;
      }
      
      /* Adjust modal for mobile */
      #pdfModal > div {
        margin: 20px;
        width: calc(100% - 40px);
      }
      
      #pdfContent {
        padding: 10px;
        width: 100%;
      }
    }

    /* =============================================
       ACCESSIBILITY & INTERACTION
       ============================================= */
    /* Focus indicators for accessibility */
    button:focus-visible,
    select:focus-visible {
      outline: 2px solid #6366f1;
      outline-offset: 2px;
    }

    /* Loading states */
    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Smooth transitions */
    .transition-all {
      transition: all 0.3s ease;
    }

    /* Scrollbar styling for webkit browsers */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #334155;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: #4f46e5;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #6366f1;
    }

    /* =============================================
       HIGH DPI OPTIMIZATIONS
       ============================================= */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .select2-container--default .select2-selection--single,
      .recap-table th {
        border-width: 1.5px !important;
      }
    }

    /* =============================================
       REDUCED MOTION FOR ACCESSIBILITY
       ============================================= */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* =============================================
       PRINT OPTIMIZATIONS
       ============================================= */
    @media print {
      .no-print {
        display: none !important;
      }
      
      .bg-slate-800,
      .bg-slate-900 {
        background: white !important;
        color: black !important;
      }
      
      #pdfModal {
        position: static !important;
        background: transparent !important;
      }
    }

    /* =============================================
       UTILITY CLASSES
       ============================================= */
    .text-overflow-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .break-words {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* =============================================
       DARK MODE ENHANCEMENTS
       ============================================= */
    .bg-slate-800 {
      background-color: #1e293b;
    }

    .bg-slate-700 {
      background-color: #334155;
    }

    .border-slate-700 {
      border-color: #334155;
    }

    .text-gray-300 {
      color: #d1d5db;
    }

    .text-gray-400 {
      color: #9ca3af;
    }

    /* Hover states untuk dark mode */
    button:hover {
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }

    /* Loading animation untuk data fetching */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    /* =============================================
       ERROR AND SUCCESS STATES
       ============================================= */
    .error-message {
      background-color: #dc2626;
      color: white;
      padding: 12px;
      border-radius: 6px;
      margin: 8px 0;
    }

    .success-message {
      background-color: #059669;
      color: white;
      padding: 12px;
      border-radius: 6px;
      margin: 8px 0;
    }

    .warning-message {
      background-color: #d97706;
      color: white;
      padding: 12px;
      border-radius: 6px;
      margin: 8px 0;
    }
  </style>
</head>
<body class="bg-slate-900 min-h-screen text-gray-100">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      <div class="flex flex-col items-center mb-6">
        <img id="logoImage" alt="Logo <?= CONFIG.PONDOK_NAME ?>" class="h-16 mb-3">
        <h1 class="text-2xl font-bold text-indigo-400 text-center">REKAPITULASI PEMBAYARAN</h1>
        <p class="text-gray-400 mt-1"><?= CONFIG.PONDOK_NAME ?> <?= CONFIG.PESANTREN_NAME ?></p>
      </div>
      
      <div class="mb-6 no-print">
        <label for="nisFilter" class="block text-sm font-medium text-gray-300 mb-1">Pilih Santri</label>
        <select id="nisFilter" class="mt-1 block w-full select2">
          <option value="">Pilih Santri</option>
        </select>
      </div>
      
      <div id="recapContent">
        <div class="text-center py-8">
          <i class="fas fa-user text-4xl text-gray-500 mb-4"></i>
          <p class="text-gray-400">Pilih santri untuk melihat rekapitulasi pembayaran</p>
        </div>
      </div>
      
      <!-- Modal PDF -->
      <div id="pdfModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center hidden print:block print:bg-transparent z-50">
        <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto print:shadow-none print:max-w-full print:max-h-none">
          <div id="pdfContent" class="bg-white"></div>
          <div class="mt-4 flex justify-end print:hidden">
            <button id="downloadPDF" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2 flex items-center">
              <i class="fas fa-file-pdf mr-1"></i> Simpan PDF
            </button>
            <button id="closePDF" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center">
              <i class="fas fa-times mr-1"></i> Tutup
            </button>
          </div>
        </div>
      </div>
      
      <div class="mt-6 flex justify-between no-print">
        <button onclick="goBack()" class="px-4 py-2 bg-slate-700 text-gray-100 rounded-md hover:bg-slate-600 flex items-center transition duration-150">
          <i class="fas fa-arrow-left mr-2"></i> Kembali
        </button>
        <button id="showPDF" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 flex items-center transition duration-150">
          <i class="fas fa-file-pdf mr-2"></i> Lihat & Unduh PDF
        </button>
      </div>
    </div>
  </div>

  <script>
    let APP_CONFIG = {
      pondokName: '<?= CONFIG.PONDOK_NAME ?>',
      pesantrenName: '<?= CONFIG.PESANTREN_NAME ?>',
      academicYear: '<?= CONFIG.ACADEMIC_YEAR ?>'
    };

    let currentRecapData = null;

    function loadLogoInRecap() {
      google.script.run
        .withSuccessHandler(function(dataUrl) {
          if (dataUrl) {
            const logoElement = document.getElementById('logoImage');
            if (logoElement) {
              logoElement.src = dataUrl;
            }
          }
        })
        .getAppLogo();
    }    

    $(document).ready(function() {
      // Initialize Select2
      $('#nisFilter').select2({
        placeholder: "Pilih Santri",
        allowClear: true
      });

      // Load students
      loadStudents();
      
      // Handle filter change
      $('#nisFilter').change(function() {
        const nis = $(this).val();
        if (nis) {
          loadRecapData(nis);
        } else {
          resetRecapDisplay();
        }
      });
      
      // PDF handlers
      $('#showPDF').click(function() {
        if (!currentRecapData) {
          alert('Pilih santri terlebih dahulu untuk melihat rekapitulasi');
          return;
        }
        preparePdfContent();
        $('#pdfModal').removeClass('hidden');
      });
      
      $('#closePDF').click(() => {
        $('#pdfModal').addClass('hidden');
      });
      
      // Close modal when clicking outside
      $('#pdfModal').click(function(e) {
        if (e.target === this) {
          $(this).addClass('hidden');
        }
      });
      
      // PDF Download handler
      $('#downloadPDF').click(function() {
        if (!currentRecapData) {
          alert('Pilih santri terlebih dahulu!');
          return;
        }

        const downloadBtn = document.getElementById('downloadPDF');
        const originalHTML = downloadBtn.innerHTML;
        
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Memproses...';

        try {
          // Pastikan jsPDF tersedia
          if (typeof jspdf === 'undefined') {
            alert('Library PDF tidak terload dengan benar');
            return;
          }

          const { jsPDF } = window.jspdf;
          const doc = new jsPDF('p', 'mm', 'a4');

          const { nis, nama, kategori, tagihan } = currentRecapData;
          const studentName = nama || 'Rekapitulasi';
          const studentNis = nis || '';
          const filename = `Rekapitulasi_${studentName.replace(/\s+/g, '_')}_${studentNis}.pdf`;

          // Header
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('REKAPITULASI PEMBAYARAN', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text(`${APP_CONFIG.pondokName} ${APP_CONFIG.pesantrenName} ${APP_CONFIG.academicYear}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

          doc.setLineWidth(0.5);
          doc.line(15, 25, 195, 25);

          // Info Santri
          doc.setFontSize(10);
          doc.text('Nama Santri', 15, 32);
          doc.text(`: ${nama}`, 50, 32);
          doc.text('NIS', 15, 37);
          doc.text(`: ${nis}`, 50, 37);
          doc.text('Kategori', 15, 42);
          doc.text(`: ${kategori}`, 50, 42);
          doc.text('Tanggal Cetak', 15, 47);
          doc.text(`: ${new Date().toLocaleDateString('id-ID')}`, 50, 47);

          // Tabel
          const tableHead = [['Jenis Tagihan', 'Jumlah Tagihan', 'Sudah Dibayar', 'Sisa', 'Status']];
          const tableBody = [];
          let totalTagihan = 0;
          let totalDibayarkan = 0;

          tagihan.forEach(item => {
            if (item.jumlahTagihan > 0) {
              const sisa = item.jumlahTagihan - item.sudahDibayarkan;
              const status = sisa <= 0 ? 'LUNAS' : 'BELUM LUNAS';
              
              tableBody.push([
                item.jenis,
                `Rp ${Number(item.jumlahTagihan).toLocaleString('id-ID')}`,
                `Rp ${Number(item.sudahDibayarkan).toLocaleString('id-ID')}`,
                `Rp ${Number(sisa).toLocaleString('id-ID')}`,
                status
              ]);

              totalTagihan += item.jumlahTagihan;
              totalDibayarkan += item.sudahDibayarkan;
            }
          });

          // Buat tabel hanya jika ada data
          if (tableBody.length > 0) {
            doc.autoTable({
              head: tableHead,
              body: tableBody,
              startY: 55,
              theme: 'grid',
              headStyles: {
                fillColor: [59, 130, 246],
                textColor: [255, 255, 255]
              },
              styles: {
                fontSize: 9,
                cellPadding: 2
              },
              columnStyles: {
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'center' }
              }
            });

            // Summary
            const finalY = doc.autoTable.previous.finalY + 10;
            const totalSisa = totalTagihan - totalDibayarkan;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Total Tagihan', 15, finalY);
            doc.text(`: Rp ${totalTagihan.toLocaleString('id-ID')}`, 60, finalY);
            
            doc.text('Total Dibayarkan', 15, finalY + 5);
            doc.text(`: Rp ${totalDibayarkan.toLocaleString('id-ID')}`, 60, finalY + 5);
            
            doc.text('Sisa Tagihan', 15, finalY + 10);
            doc.text(`: Rp ${totalSisa.toLocaleString('id-ID')}`, 60, finalY + 10);
          } else {
            doc.text('Tidak ada data tagihan', 15, 55);
          }

          doc.save(filename);

        } catch (error) {
          console.error('Error generating PDF:', error);
          alert('Error generating PDF: ' + error.message);
        } finally {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = originalHTML;
        }
      });

      // Load logo
      loadLogoInRecap();      
    });
    
    function loadStudents() {
      google.script.run
        .withSuccessHandler(function(students) {
          students.forEach(student => {
            $('#nisFilter').append(new Option(`${student[1]} (${student[0]})`, student[0]));
          });
        })
        .getActiveStudents();
    }
    
    function loadRecapData(nis) {
      // Tampilkan loading state
      $('#recapContent').html(`
        <div class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-4xl text-indigo-400 mb-4"></i>
          <p class="text-gray-400">Memuat data rekapitulasi...</p>
        </div>
      `);

      google.script.run
        .withSuccessHandler(function(recapData) {
          currentRecapData = recapData;
          displayRecapData(recapData);
        })
        .withFailureHandler(function(error) {
          console.error('Error loading recap data:', error);
          $('#recapContent').html(`
            <div class="text-center py-8">
              <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
              <p class="text-red-400">Gagal memuat data rekapitulasi</p>
              <p class="text-gray-400 text-sm mt-2">${error.message || 'Silakan coba lagi'}</p>
            </div>
          `);
        })
        .getRecapDetail(nis);
    }
    
    function displayRecapData(recapData) {
      let html = `
        <div id="studentInfo" class="mb-4 p-4 bg-slate-700 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span class="font-semibold">NIS:</span>
              <span id="recapNis">${recapData.nis}</span>
            </div>
            <div>
              <span class="font-semibold">Nama:</span>
              <span id="recapNama">${recapData.nama}</span>
            </div>
            <div>
              <span class="font-semibold">Kategori:</span>
              <span id="recapKategori">${recapData.kategori}</span>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="recap-table">
            <thead>
              <tr>
                <th>Jenis Tagihan</th>
                <th>Jumlah Tagihan</th>
                <th>Sudah Dibayarkan</th>
                <th>Sisa Tagihan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      let totalTagihan = 0;
      let totalDibayarkan = 0;
      let totalSisa = 0;
      
      if (recapData.tagihan && recapData.tagihan.length > 0) {
        recapData.tagihan.forEach(tagihan => {
          if (tagihan.jumlahTagihan > 0) {
            const sisa = tagihan.jumlahTagihan - tagihan.sudahDibayarkan;
            const persentase = (tagihan.sudahDibayarkan / tagihan.jumlahTagihan) * 100;
            const status = sisa <= 0 ? 'LUNAS' : 'BELUM LUNAS';
            
            totalTagihan += tagihan.jumlahTagihan;
            totalDibayarkan += tagihan.sudahDibayarkan;
            totalSisa += sisa;
            
            html += `
              <tr>
                <td>${tagihan.jenis}</td>
                <td>Rp${Number(tagihan.jumlahTagihan).toLocaleString('id-ID')}</td>
                <td>Rp${Number(tagihan.sudahDibayarkan).toLocaleString('id-ID')}</td>
                <td>Rp${Number(sisa).toLocaleString('id-ID')}</td>
                <td>
                  <div class="flex items-center">
                    <span class="${status === 'LUNAS' ? 'text-green-400' : 'text-yellow-400'} font-medium">${status}</span>
                    ${sisa > 0 ? `
                    <div class="ml-2 text-xs text-gray-400">${Math.round(persentase)}%</div>
                    <div class="ml-2 progress-bar" style="width: 60px;">
                      <div class="progress-fill" style="width: ${persentase}%"></div>
                    </div>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `;
          }
        });
      }
      
      html += `
            </tbody>
          </table>
        </div>
        
        <div class="mt-6 p-4 bg-slate-700 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span class="font-semibold">Total Tagihan:</span>
              <span id="totalTagihan">Rp ${Number(totalTagihan).toLocaleString('id-ID')}</span>
            </div>
            <div>
              <span class="font-semibold">Total Dibayarkan:</span>
              <span id="totalDibayarkan">Rp ${Number(totalDibayarkan).toLocaleString('id-ID')}</span>
            </div>
            <div>
              <span class="font-semibold">Sisa Tagihan:</span>
              <span id="sisaTagihan">Rp ${Number(totalSisa).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      `;
      
      if (totalTagihan === 0) {
        html = `
          <div class="text-center py-8">
            <i class="fas fa-receipt text-4xl text-gray-500 mb-4"></i>
            <p class="text-gray-400">Tidak ada data tagihan untuk santri ini</p>
          </div>
        `;
      }
      
      $('#recapContent').html(html);
    }
    
    function preparePdfContent() {
      if (!currentRecapData) return;
      
      const { nis, nama, kategori, tagihan } = currentRecapData;
      
      let totalTagihan = 0;
      let totalDibayarkan = 0;
      let totalSisa = 0;
      
      // Hitung total terlebih dahulu
      if (tagihan && tagihan.length > 0) {
        tagihan.forEach(tagihanItem => {
          if (tagihanItem.jumlahTagihan > 0) {
            totalTagihan += tagihanItem.jumlahTagihan;
            totalDibayarkan += tagihanItem.sudahDibayarkan;
            totalSisa += (tagihanItem.jumlahTagihan - tagihanItem.sudahDibayarkan);
          }
        });
      }
      
      let pdfHtml = `
        <div class="pdf-header">
          <h2 style="font-weight: bold; margin: 0; font-size: 14pt;">REKAPITULASI PEMBAYARAN</h2>
          <p style="margin: 5px 0; font-size: 10pt;">${APP_CONFIG.pondokName} ${APP_CONFIG.pesantrenName} ${APP_CONFIG.academicYear}</p>
        </div>
        
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
          <div class="pdf-info-row">
            <span>Nama:</span>
            <span><strong>${nama}</strong></span>
          </div>
          <div class="pdf-info-row">
            <span>NIS:</span>
            <span>${nis}</span>
          </div>
          <div class="pdf-info-row">
            <span>Kategori:</span>
            <span>${kategori}</span>
          </div>
          <div class="pdf-info-row">
            <span>Tanggal Cetak:</span>
            <span>${new Date().toLocaleDateString('id-ID')}</span>
          </div>
        </div>
      `;
      
      if (tagihan && tagihan.length > 0 && totalTagihan > 0) {
        pdfHtml += `
          <table class="pdf-table">
            <thead>
              <tr>
                <th>Jenis Tagihan</th>
                <th>Jumlah Tagihan</th>
                <th>Sudah Dibayar</th>
                <th>Sisa</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        tagihan.forEach(tagihanItem => {
          if (tagihanItem.jumlahTagihan > 0) {
            const sisa = tagihanItem.jumlahTagihan - tagihanItem.sudahDibayarkan;
            const status = sisa <= 0 ? 'LUNAS' : 'BELUM LUNAS';
            
            pdfHtml += `
              <tr>
                <td>${tagihanItem.jenis}</td>
                <td>Rp${Number(tagihanItem.jumlahTagihan).toLocaleString('id-ID')}</td>
                <td>Rp${Number(tagihanItem.sudahDibayarkan).toLocaleString('id-ID')}</td>
                <td>Rp${Number(sisa).toLocaleString('id-ID')}</td>
                <td>${status}</td>
              </tr>
            `;
          }
        });
        
        pdfHtml += `
            </tbody>
          </table>
          
          <div class="pdf-summary">
            <div class="pdf-summary-row">
              <span>Total Tagihan:</span>
              <span>Rp ${totalTagihan.toLocaleString('id-ID')}</span>
            </div>
            <div class="pdf-summary-row">
              <span>Total Dibayarkan:</span>
              <span>Rp ${totalDibayarkan.toLocaleString('id-ID')}</span>
            </div>
            <div class="pdf-summary-row">
              <span>Sisa Tagihan:</span>
              <span>Rp ${totalSisa.toLocaleString('id-ID')}</span>
            </div>
          </div>
        `;
      } else {
        pdfHtml += `
          <div style="text-align: center; padding: 20px; color: #666;">
            <p>Tidak ada data tagihan untuk santri ini</p>
          </div>
        `;
      }
      
      pdfHtml += `
        <div class="pdf-footer">
          <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
          <p>Rekapitulasi ini adalah dokumen resmi ${APP_CONFIG.pondokName}</p>
        </div>
      `;
      
      $('#pdfContent').html(pdfHtml);
    }
    
    function resetRecapDisplay() {
      $('#recapContent').html(`
        <div class="text-center py-8">
          <i class="fas fa-user text-4xl text-gray-500 mb-4"></i>
          <p class="text-gray-400">Pilih santri untuk melihat rekapitulasi pembayaran</p>
        </div>
      `);
      currentRecapData = null;
    }
    
    function goBack() {
      window.location.href = '<?= ScriptApp.getService().getUrl() ?>?page=form';
    }
  </script>
</body>
</html>
