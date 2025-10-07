let currentRecapData = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeRecap();
});

function initializeRecap() {
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

            // Header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('REKAPITULASI PEMBAYARAN', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text('Pondok As-Salam Pesantren Fathul Ulum', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

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
}

async function loadStudents() {
    try {
        const students = await ApiService.getActiveStudents();
        students.forEach(student => {
            $('#nisFilter').append(new Option(`${student[1]} (${student[0]})`, student[0]));
        });
    } catch (error) {
        console.error('Error loading students:', error);
        alert('Gagal memuat data santri: ' + error.message);
    }
}

async function loadRecapData(nis) {
    // Tampilkan loading state
    $('#recapContent').html(`
        <div class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-4xl text-indigo-400 mb-4"></i>
          <p class="text-gray-400">Memuat data rekapitulasi...</p>
        </div>
    `);

    try {
        const recapData = await ApiService.getRecapDetail(nis);
        currentRecapData = recapData;
        displayRecapData(recapData);
    } catch (error) {
        console.error('Error loading recap data:', error);
        $('#recapContent').html(`
            <div class="text-center py-8">
              <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
              <p class="text-red-400">Gagal memuat data rekapitulasi</p>
              <p class="text-gray-400 text-sm mt-2">${error.message || 'Silakan coba lagi'}</p>
            </div>
        `);
    }
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
          <p style="margin: 5px 0; font-size: 10pt;">Pondok Pesantren As-Salam</p>
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
}

function goBack() {
    window.location.href = 'form.html';
}