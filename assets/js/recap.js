// assets/js/recap.js - FIXED VERSION
let currentRecapData = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Recap page loaded');
    
    // CEK AUTH - Redirect jika belum login
    if (!isLoggedIn()) {
        alert('Anda harus login terlebih dahulu!');
        window.location.href = 'index.html';
        return;
    }
    
    initializeRecap();
});

function initializeRecap() {
    console.log('🔧 Initializing recap...');
    
    // Tampilkan nama admin yang login
    const adminData = getAdminData();
    if (adminData && adminData.nama) {
        const adminWelcomeEl = document.getElementById('adminWelcome');
        if (adminWelcomeEl) {
            adminWelcomeEl.textContent = `Selamat datang, ${adminData.nama}`;
        }
    }
    
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

            const pageWidth = doc.internal.pageSize.getWidth();
            const logo = new Image();
            logo.src = 'assets/images/logo_kwitansi.png'; // Menggunakan logo untuk kwitansi

            logo.onload = function() {
                // Header dengan Logo
                doc.addImage(logo, 'PNG', 15, 12, 25, 25);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.text('REKAPITULASI PEMBAYARAN', pageWidth / 2, 20, { align: 'center' });
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);
                doc.text('Pondok As-Salam Pesantren Fathul Ulum', pageWidth / 2, 28, { align: 'center' });
                doc.setLineWidth(0.5);
                doc.line(15, 40, pageWidth - 15, 40);

                // Info Santri
                doc.setFontSize(10);
                let startY = 50;
                doc.text('Nama Santri', 15, startY);
                doc.text(`: ${nama}`, 50, startY);
                doc.text('NIS', 15, startY += 5);
                doc.text(`: ${nis}`, 50, startY);
                doc.text('Kategori', 15, startY += 5);
                doc.text(`: ${kategori}`, 50, startY);
                doc.text('Tanggal Cetak', 15, startY += 5);
                doc.text(`: ${new Date().toLocaleDateString('id-ID')}`, 50, startY);

                // Tabel
                const tableHead = [['Jenis Tagihan', 'Jumlah Tagihan', 'Sudah Dibayar', 'Sisa', 'Status']];
                const tableBody = [];
                let totalTagihan = 0;
                let totalDibayarkan = 0;

                if (tagihan && Array.isArray(tagihan)) {
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
                }

                // Buat tabel hanya jika ada data
                if (tableBody.length > 0) {
                    doc.autoTable({
                        head: tableHead,
                        body: tableBody,
                        startY: startY + 15,
                        theme: 'grid',
                        headStyles: {
                            fillColor: [79, 70, 229], // Warna Indigo
                            textColor: [255, 255, 255]
                        },
                        styles: {
                            fontSize: 9,
                            cellPadding: 2.5
                        },
                        columnStyles: {
                            1: { halign: 'right' },
                            2: { halign:right' },
                            3: { halign: 'right' },
                            4: { halign: 'center' }
                        }
                    });

                    // Summary
                    let finalY = doc.autoTable.previous.finalY + 10;
                    const totalSisa = totalTagihan - totalDibayarkan;

                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Total Tagihan', 15, finalY);
                    doc.text(`: Rp ${totalTagihan.toLocaleString('id-ID')}`, 60, finalY);
                    
                    doc.text('Total Dibayarkan', 15, finalY += 6);
                    doc.text(`: Rp ${totalDibayarkan.toLocaleString('id-ID')}`, 60, finalY);
                    
                    doc.text('Sisa Tagihan', 15, finalY += 6);
                    doc.text(`: Rp ${totalSisa.toLocaleString('id-ID')}`, 60, finalY);

                } else {
                    doc.text('Tidak ada data tagihan untuk santri ini.', 15, startY + 15);
                }

                // Footer
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text(`Dokumen ini dicetak oleh sistem pada ${new Date().toLocaleString('id-ID')}`, 15, doc.internal.pageSize.getHeight() - 10);
                    doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.getWidth() - 35, doc.internal.pageSize.getHeight() - 10);
                }

                doc.save(filename);
            };
            logo.onerror = function() {
                alert('Gagal memuat gambar logo untuk PDF.');
                doc.save(filename); // Simpan tanpa logo jika gagal
            };
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF: ' + error.message);
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = originalHTML;
        }
    });
    
    console.log('✅ Recap initialization complete');
}

async function loadStudents() {
    try {
        console.log('📥 Loading students for recap...');
        const response = await ApiService.getActiveStudents();
        
        console.log('📊 Students response:', response);
        
        // PERBAIKAN: Handle response structure
        if (response && response.success) {
            let studentsData = response.data;
            
            // Jika data adalah string, coba parse
            if (typeof studentsData === 'string') {
                try {
                    studentsData = JSON.parse(studentsData);
                    console.log('🔄 Parsed students data from string:', studentsData);
                } catch (parseError) {
                    console.error('❌ Failed to parse students data:', parseError);
                }
            }
            
            // Pastikan data adalah array sebelum menggunakan forEach
            if (Array.isArray(studentsData)) {
                studentsData.forEach(student => {
                    console.log('🎓 Student data:', student);
                    
                    // Handle berbagai format student data
                    if (Array.isArray(student) && student.length >= 2) {
                        // Format: [nis, nama, kategori, active]
                        $('#nisFilter').append(new Option(`${student[1]} (${student[0]})`, student[0]));
                    } else if (student && typeof student === 'object') {
                        // Format: {nis: '', nama: '', kategori: ''}
                        const nis = student.nis || student.NIS || student[0];
                        const nama = student.nama || student.NAMA || student[1];
                        if (nis && nama) {
                            $('#nisFilter').append(new Option(`${nama} (${nis})`, nis));
                        }
                    }
                });
                console.log(`✅ Loaded ${studentsData.length} students`);
            } else {
                console.error('❌ Students data is not an array:', studentsData);
                throw new Error('Data santri tidak dalam format yang diharapkan');
            }
        } else {
            console.error('❌ API response not successful:', response);
            throw new Error(response?.message || 'Gagal memuat data santri');
        }
    } catch (error) {
        console.error('❌ Error loading students:', error);
        alert('Gagal memuat data santri: ' + error.message);
    }
}

// Di fungsi loadRecapData di recap.js - tambahkan debugging
async function loadRecapData(nis) {
    console.log(`📥 Loading recap data for NIS: ${nis}`);
    
    // Tampilkan loading state
    $('#recapContent').html(`
        <div class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-4xl text-indigo-400 mb-4"></i>
          <p class="text-gray-400">Memuat data rekapitulasi...</p>
        </div>
    `);
    // Sembunyikan kartu saat loading
    $('#recapSummaryCards').addClass('hidden');

    try {
        const response = await ApiService.getRecapDetail(nis);
        console.log('📊 Recap detail API response:', response);
        
        // PERBAIKAN: Handle berbagai format response
        if (response && (response.success !== false)) {
            // Beberapa endpoint mungkin tidak menggunakan success flag
            currentRecapData = response;
            
            // Debug: Tampilkan data yang diterima
            console.log('📈 Recap data received:', {
                nis: response.nis,
                nama: response.nama,
                kategori: response.kategori,
                jumlahTagihan: response.tagihan ? response.tagihan.length : 0,
                tagihan: response.tagihan
            });
            
            displayRecapData(response);
        } else {
            console.error('❌ Invalid recap data response:', response);
            throw new Error(response?.message || 'Data rekapitulasi tidak valid');
        }
    } catch (error) {
        console.error('❌ Error loading recap data:', error);
        $('#recapContent').html(`
            <div class="text-center py-8">
              <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
              <p class="text-red-400">Gagal memuat data rekapitulasi</p>
              <p class="text-gray-400 text-sm mt-2">${error.message || 'Silakan coba lagi'}</p>
              <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500">
                <i class="fas fa-refresh mr-2"></i> Muat Ulang
              </button>
            </div>
        `);
    }
}

function displayRecapData(recapData) {
    console.log('📊 Displaying recap data:', recapData);
    
    const tableHtml = `
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
    let tableBodyHtml = '';
    
    if (recapData.tagihan && Array.isArray(recapData.tagihan) && recapData.tagihan.length > 0) {
        recapData.tagihan.forEach(tagihan => {
            if (tagihan.jumlahTagihan > 0) {
                const sisa = tagihan.jumlahTagihan - tagihan.sudahDibayarkan;
                const persentase = tagihan.jumlahTagihan > 0 ? (tagihan.sudahDibayarkan / tagihan.jumlahTagihan) * 100 : 0;
                const status = sisa <= 0 ? 'LUNAS' : 'BELUM LUNAS';
                
                totalTagihan += tagihan.jumlahTagihan;
                totalDibayarkan += tagihan.sudahDibayarkan;
                totalSisa += sisa;
                
                tableBodyHtml += `
                  <tr>
                    <td>${tagihan.jenis}</td>
                    <td>Rp${Number(tagihan.jumlahTagihan).toLocaleString('id-ID')}</td>
                    <td>Rp${Number(tagihan.sudahDibayarkan).toLocaleString('id-ID')}</td>
                    <td>Rp${Number(sisa).toLocaleString('id-ID')}</td>
                    <td>
                      <div class="flex items-center justify-center">
                        <span class="${status === 'LUNAS' ? 'text-green-400' : 'text-yellow-400'} font-medium">${status}</span>
                      </div>
                    </td>
                  </tr>
                `;
            }
        });
    } 
    
    if (!tableBodyHtml) {
        tableBodyHtml = `
            <tr>
                <td colspan="5" class="text-center py-4 text-gray-400">
                    <i class="fas fa-info-circle mr-2"></i>
                    Tidak ada data tagihan yang valid untuk ditampilkan.
                </td>
            </tr>
        `;
    }
    
    const finalHtml = tableHtml + tableBodyHtml + `</tbody></table></div>`;
    
    if (totalTagihan === 0 && !tableBodyHtml.includes('valid')) {
         $('#recapContent').html(`
          <div class="text-center py-8">
            <i class="fas fa-receipt text-4xl text-gray-500 mb-4"></i>
            <p class="text-gray-400">Tidak ada data tagihan untuk santri ini.</p>
          </div>
        `);
        $('#recapSummaryCards').addClass('hidden');
    } else {
        $('#summaryTotalTagihan').text('Rp ' + Number(totalTagihan).toLocaleString('id-ID'));
        $('#summaryTotalDibayar').text('Rp ' + Number(totalDibayarkan).toLocaleString('id-ID'));
        $('#summarySisaTagihan').text('Rp ' + Number(totalSisa).toLocaleString('id-ID'));
        $('#recapSummaryCards').removeClass('hidden');
        $('#recapContent').html(finalHtml);
    }
    
    console.log('✅ Recap data displayed successfully');
}


function preparePdfContent() {
    if (!currentRecapData) return;
    
    const { nis, nama, kategori, tagihan } = currentRecapData;
    
    let totalTagihan = 0;
    let totalDibayarkan = 0;
    let totalSisa = 0;
    
    // Hitung total terlebih dahulu
    if (tagihan && Array.isArray(tagihan)) {
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
          <p style="margin: 5px 0; font-size: 10pt;">Pondok Pesantren As-Salam</p>
        </div>
        
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
          <div class="pdf-info-row">
            <span>Nama:</span>
            <span><strong>${nama || 'Tidak tersedia'}</strong></span>
          </div>
          <div class="pdf-info-row">
            <span>NIS:</span>
            <span>${nis || 'Tidak tersedia'}</span>
          </div>
          <div class="pdf-info-row">
            <span>Kategori:</span>
            <span>${kategori || 'Tidak tersedia'}</span>
          </div>
          <div class="pdf-info-row">
            <span>Tanggal Cetak:</span>
            <span>${new Date().toLocaleDateString('id-ID')}</span>
          </div>
        </div>
    `;
    
    if (tagihan && Array.isArray(tagihan) && totalTagihan > 0) {
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
          <p>Rekapitulasi ini adalah dokumen resmi Pondok As-Salam</p>
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
    // Sembunyikan kartu saat reset
    $('#recapSummaryCards').addClass('hidden');
}

function goBack() {
    window.location.href = 'form.html';
}
