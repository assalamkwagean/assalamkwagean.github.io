// assets/js/form.js - FIXED VERSION WITH CHECKBOX
// Global variables
let currentReceiptData = null;
let isLoadingBills = false;
let availableBillTypes = []; // Menyimpan jenis tagihan yang tersedia

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Form page loaded');
    
    // CEK AUTH - Redirect jika belum login
    if (!isLoggedIn()) {
        alert('Anda harus login terlebih dahulu!');
        window.location.href = 'index.html';
        return;
    }
    
    initializeForm();
});

async function initializeForm() {
    console.log('🔧 Initializing form...');
    
    // Tampilkan nama admin yang login
    const adminData = getAdminData();
    if (adminData && adminData.nama) {
        const adminWelcomeEl = document.getElementById('adminWelcome');
        if (adminWelcomeEl) {
            adminWelcomeEl.textContent = `Selamat datang, ${adminData.nama}`;
        }
    }
    
    // Load initial data
    await loadInitialData();
    
    // Initialize Select2 dengan konfigurasi mobile-friendly
    $('#nis').select2({ 
        placeholder: "Pilih Santri", 
        allowClear: true,
        dropdownParent: $('body') // Untuk mobile compatibility
    });
    
    // Event handlers
    setupEventHandlers();
    console.log('✅ Form initialization complete');
}

async function loadInitialData() {
    try {
        console.log('📥 Loading initial data...');
        
        const [studentsResponse, methodsResponse, adminsResponse] = await Promise.all([
            ApiService.getActiveStudents(),
            ApiService.getPaymentMethods(),
            ApiService.getAdminUsers()
        ]);

        console.log('📊 API Responses:', {
            students: studentsResponse,
            methods: methodsResponse,
            admins: adminsResponse
        });

        // Handle students data
        if (studentsResponse.success && studentsResponse.data && Array.isArray(studentsResponse.data)) {
            studentsResponse.data.forEach(student => {
                if (student && student.length >= 2) {
                    $('#nis').append(new Option(`${student[1]} (${student[0]})`, student[0]));
                }
            });
            console.log('Students loaded:', studentsResponse.data.length);
        } else {
            console.error('Invalid students data:', studentsResponse);
            throw new Error('Data santri tidak valid: ' + (studentsResponse.message || 'Format tidak dikenali'));
        }

        // Handle payment methods
        if (methodsResponse.success && methodsResponse.data && Array.isArray(methodsResponse.data)) {
            methodsResponse.data.forEach(method => {
                $('#metode').append(new Option(method, method));
            });
            console.log('Payment methods loaded:', methodsResponse.data.length);
        } else {
            console.error('Invalid methods data:', methodsResponse);
            throw new Error('Data metode pembayaran tidak valid');
        }

        // Handle admin users
        if (adminsResponse.success && adminsResponse.data && Array.isArray(adminsResponse.data)) {
            adminsResponse.data.forEach(admin => {
                if (admin && admin.length >= 2) {
                    $('#penerima').append(new Option(admin[1], admin[1]));
                }
            });
            $('#penerima').prop('disabled', false);
            console.log('Admin users loaded:', adminsResponse.data.length);
        } else {
            console.error('Invalid admins data:', adminsResponse);
            throw new Error('Data admin tidak valid');
        }

    } catch (error) {
        console.error('Error loading initial data:', error);
        alert('Gagal memuat data awal: ' + error.message);
    }
}

function setupEventHandlers() {
    // Handle student selection
    $('#nis').change(async function() {
        const nis = $(this).val();
        
        // Reset semua bagian form yang terkait dengan tagihan
        $('#jenisTagihanContainer').empty();
        $('#jenisTagihanSection').addClass('hidden');
        $('#tagihanSection').addClass('hidden');
        $('#tagihanList').empty();
        
        if (!nis) {
            $('#nama').val('');
            $('#kategori').val('');
            return;
        }
        
        const selectedData = $('#nis').select2('data')[0];
        if (selectedData && selectedData.text) {
            const studentName = selectedData.text.split(' (')[0];
            $('#nama').val(studentName);
        }
        
        try {
            const studentsResponse = await ApiService.getActiveStudents();
            if (studentsResponse.success && studentsResponse.data) {
                const student = studentsResponse.data.find(s => s[0] == nis);
                if (student) {
                    $('#kategori').val(student[2]);
                    await loadAvailableBillTypes(student[2]);
                }
            }
        } catch (error) {
            console.error('Error loading student data:', error);
        }
    });

    // PERBAIKAN: Handle tombol muat rincian tagihan
    $('#loadTagihanBtn').click(async function() {
        await loadSelectedBills();
    });

    // Auto calculate payment
    $(document).on('input', '.potongan', function() {
        const row = $(this).closest('tr');
        const tagihan = parseFloat(row.find('.jumlah-tagihan').val()) || 0;
        let potongan = parseFloat($(this).val()) || 0;

        if (potongan > tagihan) {
            potongan = tagihan;
            $(this).val(potongan);
        }
        
        row.find('.jumlah-dibayar').val(tagihan - potongan);
        calculateTotals();
    });

    // Form submission
    $('#paymentForm').submit(async function(e) {
        e.preventDefault();
        
        const tagihanData = [];
        $('#tagihanList tr').each(function() {
            const row = $(this);
            const jenisTagihan = row.find('td:eq(0)').text().trim();
            const jumlahTagihan = row.find('.jumlah-tagihan').val();
            const potongan = row.find('.potongan').val() || 0;
            const jumlahDibayar = row.find('.jumlah-dibayar').val();
            
            if (jenisTagihan) {
                tagihanData.push({
                    jenisTagihan: jenisTagihan,
                    jumlahTagihan: jumlahTagihan,
                    potongan: potongan,
                    jumlahDibayar: jumlahDibayar
                });
            }
        });

        if (tagihanData.length === 0) {
            alert('Pilih minimal satu jenis tagihan!');
            return;
        }

        const formData = {
            nis: $('#nis').val(),
            nama: $('#nama').val(),
            kategori: $('#kategori').val(),
            metode: $('#metode').val(),
            penerima: $('#penerima').val(),
            catatan: $('#catatan').val(),
            tagihan: tagihanData
        };

        console.log('Submitting payment:', formData);

        const submitBtn = $('#submitBtn');
        submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-2"></i> Memproses...');

        try {
            const response = await ApiService.processPayment(formData);
            handlePaymentResponse(response);
        } catch (error) {
            handlePaymentError(error);
        } finally {
            submitBtn.prop('disabled', false).html('<i class="fas fa-save mr-2"></i> Simpan Pembayaran');
        }
    });

    // Reset form
    $('#paymentForm').on('reset', function() {
        $('#nis').val(null).trigger('change');
        $('#jenisTagihanContainer').empty();
        $('#jenisTagihanSection').addClass('hidden');
        $('#tagihanList').empty();
        $('#tagihanSection').addClass('hidden');
        calculateTotals();
    });

    // Modal handlers
    $('#closeReceipt').click(() => $('#receiptModal').addClass('hidden'));
    
    // PDF Download
    document.getElementById('downloadPDF')?.addEventListener('click', () => {
        if (!currentReceiptData) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 140] // Ukuran kertas thermal standar
        });

        const data = currentReceiptData;
        const receiptWidth = doc.internal.pageSize.getWidth();

        // Tambahkan logo
        const logo = new Image();
        logo.src = 'assets/images/logo_kwitansi.png';
        logo.onload = function() {
            doc.addImage(logo, 'PNG', receiptWidth / 2 - 10, 5, 20, 20);

            // Header
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('KWITANSI PEMBAYARAN', receiptWidth / 2, 32, { align: 'center' });
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(data.id, receiptWidth / 2, 36, { align: 'center' });

            // Info Santri
            doc.setFontSize(9);
            doc.text(`Nama: ${data.nama}`, 5, 45);
            doc.text(`NIS: ${data.nis}`, 5, 50);
            doc.text(`Kategori: ${data.kategori}`, 5, 55);

            // Tabel Tagihan
            const tableHead = [['Jenis Tagihan', 'Jumlah Dibayar']];
            const tableBody = data.tagihan.map(t => [t.jenisTagihan, `Rp${Number(t.jumlahDibayar).toLocaleString('id-ID')}`]);
            
            doc.autoTable({
                head: tableHead,
                body: tableBody,
                startY: 60,
                theme: 'plain',
                styles: {
                    fontSize: 8,
                    cellPadding: 1
                },
                headStyles: {
                    fontStyle: 'bold'
                },
                columnStyles: {
                    1: { halign: 'right' }
                }
            });

            const finalY = doc.autoTable.previous.finalY;

            // Total
            const total = data.tagihan.reduce((acc, curr) => acc + Number(curr.jumlahDibayar), 0);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('TOTAL', 5, finalY + 8);
            doc.text(`Rp${total.toLocaleString('id-ID')}`, receiptWidth - 5, finalY + 8, { align: 'right' });

            // Footer
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(`Metode: ${data.metode}`, 5, finalY + 15);
            doc.text(`Penerima: ${data.penerima}`, 5, finalY + 20);
            doc.text(data.tanggal, receiptWidth - 5, finalY + 20, { align: 'right' });

            // Catatan
            if (data.catatan) {
                doc.setFontSize(8);
                doc.text(`Catatan: ${data.catatan}`, 5, finalY + 25);
            }

            // Simpan PDF
            doc.save(`Kwitansi_${data.nama}_${data.id}.pdf`);
        };
    });
}

// PERBAIKAN: Fungsi untuk memuat jenis tagihan yang tersedia sebagai checkbox
async function loadAvailableBillTypes(categoryName) {
    try {
        const categoriesResponse = await ApiService.getCategories();
        
        if (categoriesResponse.success && categoriesResponse.data) {
            const matchedCategory = categoriesResponse.data.find(c => c.nama === categoryName);
            
            if (matchedCategory && matchedCategory.tagihan.length > 0) {
                availableBillTypes = matchedCategory.tagihan;
                
                // Kosongkan container
                $('#jenisTagihanContainer').empty();
                
                // Tambahkan checkbox untuk setiap jenis tagihan
                matchedCategory.tagihan.forEach(tagihan => {
                    const checkboxId = `tagihan-${tagihan.nama.replace(/\s+/g, '-')}`;
                    $('#jenisTagihanContainer').append(`
                        <label class="custom-checkbox" for="${checkboxId}">
                            ${tagihan.nama} 
                            <span class="text-indigo-400 ml-1">(Rp${Number(tagihan.jumlah).toLocaleString('id-ID')})</span>
                            <input type="checkbox" id="${checkboxId}" name="jenisTagihan" value="${tagihan.nama}">
                            <span class="checkmark"></span>
                        </label>
                    `);
                });
                
                // Tampilkan section jenis tagihan
                $('#jenisTagihanSection').removeClass('hidden');
                
                console.log('✅ Available bill types loaded:', matchedCategory.tagihan.length);
            } else {
                console.log('⚠️ No bill types found for category:', categoryName);
                $('#jenisTagihanSection').addClass('hidden');
            }
        } else {
            throw new Error(categoriesResponse.message || 'Data kategori tidak valid');
        }
    } catch (error) {
        console.error('Error loading bill types:', error);
        $('#jenisTagihanSection').addClass('hidden');
    }
}

// PERBAIKAN: Fungsi untuk memuat rincian tagihan berdasarkan checkbox yang dipilih
async function loadSelectedBills() {
    if (isLoadingBills) return;

    // Ambil checkbox yang dicentang
    const selectedBills = [];
    $('input[name="jenisTagihan"]:checked').each(function() {
        selectedBills.push($(this).val());
    });
    
    if (selectedBills.length === 0) {
        alert('Pilih minimal satu jenis tagihan!');
        return;
    }

    isLoadingBills = true;
    const loadBtn = $('#loadTagihanBtn');
    loadBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-2"></i> Memuat...');
    
    $('#tagihanSection').removeClass('hidden');
    $('#tagihanList').html('<tr><td colspan="4" class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i> Memuat rincian tagihan...</td></tr>');

    try {
        // Kosongkan dan buat tabel baru
        $('#tagihanList').empty();
        
        selectedBills.forEach(billName => {
            const billData = availableBillTypes.find(t => t.nama === billName);
            if (billData) {
                $('#tagihanList').append(`
                    <tr class="border-b border-slate-600">
                        <td class="py-2 px-2 text-sm">${billData.nama}</td>
                        <td class="py-2 px-2">
                            <input type="number" class="w-full jumlah-tagihan bg-slate-600 text-white border border-slate-500 rounded p-1 text-sm" 
                                   value="${billData.jumlah}" readonly>
                        </td>
                        <td class="py-2 px-2">
                            <input type="number" class="w-full potongan bg-slate-800 text-white border border-slate-500 rounded p-1 text-sm" 
                                   value="0" min="0" max="${billData.jumlah}" placeholder="0">
                        </td>
                        <td class="py-2 px-2">
                            <input type="number" class="w-full jumlah-dibayar bg-slate-600 text-white border border-slate-500 rounded p-1 text-sm" 
                                   value="${billData.jumlah}" readonly>
                        </td>
                    </tr>
                `);
            }
        });
        
        calculateTotals();
        
    } catch (error) {
        console.error('Error loading bill details:', error);
        $('#tagihanList').html(`<tr><td colspan="4" class="text-center py-4 text-red-600 text-sm">${error.message || 'Gagal memuat data. Silakan coba lagi.'}</td></tr>`);
    } finally {
        isLoadingBills = false;
        loadBtn.prop('disabled', false).html('<i class="fas fa-list mr-2"></i> Muat Rincian Tagihan');
    }
}

function calculateTotals() {
    let totalTagihan = 0;
    let totalPotongan = 0;
    let totalDibayar = 0;

    $('#tagihanList tr').each(function() {
        const $row = $(this);
        totalTagihan += parseFloat($row.find('.jumlah-tagihan').val()) || 0;
        totalPotongan += parseFloat($row.find('.potongan').val()) || 0;
        totalDibayar += parseFloat($row.find('.jumlah-dibayar').val()) || 0;
    });

    $('#totalTagihan').text('Rp ' + totalTagihan.toLocaleString('id-ID'));
    $('#totalPotongan').text('Rp ' + totalPotongan.toLocaleString('id-ID'));
    $('#totalDibayar').text('Rp ' + totalDibayar.toLocaleString('id-ID'));
}

function handlePaymentResponse(response) {
    if (response.success) {
        currentReceiptData = response.data;
        showReceipt(response.data);
        // Reset form setelah sukses
        $('#paymentForm')[0].reset();
        $('#nis').val(null).trigger('change');
        $('#jenisTagihanContainer').empty();
        $('#jenisTagihanSection').addClass('hidden');
        $('#tagihanSection').addClass('hidden');
        $('#tagihanList').empty();
        calculateTotals();
    } else {
        alert('Error: ' + response.message);
    }
}

function handlePaymentError(error) {
    alert('Error: ' + error.message);
}

function showReceipt(data) {
    const receiptHtml = `
        <div style="font-family: 'Arial', sans-serif; color: #000; font-size: 12px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 8px;">
            <img src="assets/images/logo_kwitansi.png" alt="Logo Pesantren" class="h-12 mx-auto mb-2">          
            <h2 style="font-weight: bold; margin: 0; font-size: 13px;">KWITANSI PEMBAYARAN</h2>
            <span style="font-size: 10px;">${data.id}</span>            
          </div>

          <!-- Info Santri -->
          <div style="border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 9px;">
              <span>Nama:</span>
              <span>${data.nama}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 9px;">
              <span>NIS:</span>
              <span>${data.nis}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 9px;">
              <span>Kategori:</span>
              <span>${data.kategori}</span>
            </div>
          </div>

          <!-- Detail Tagihan -->
          ${data.tagihan.map(tagihan => `
            <div style="margin-bottom: 4px; font-size: 9px;">
              <div style="display: flex; justify-content: space-between;">
                <span>${tagihan.jenisTagihan}:</span>
                <span>Rp${Number(tagihan.jumlahDibayar).toLocaleString('id-ID')}</span>
              </div>
            </div>
          `).join('')}

          <!-- Total -->
          <div style="border-top: 1px solid #000; padding-top: 6px; margin-top: 6px; font-size: 10px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>TOTAL:</span>
              <span>Rp${data.tagihan.reduce((a,b) => a + Number(b.jumlahDibayar), 0).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <!-- Footer -->
          <div style="margin-top: 8px; font-size: 8px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Metode:</span>
              <span>${data.metode}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Penerima:</span>
              <span>${data.penerima}</span>
            </div>
            <div style="text-align: center; margin-top: 6px;">
              <p style="margin: 2px 0;">${data.tanggal}</p>
              <p style="margin: 2px 0; font-style: italic;">${data.catatan || ''}</p>
            </div>
            <div style="margin-top: 12px; padding-top: 6px; border-top: 1px dashed #ccc; text-align: center;">
              <p style="margin: 2px 0; font-style: italic; font-size: 7px;">Kwitansi pembayaran ini adalah bukti resmi yang sah. Harap disimpan dengan baik.</p>
              <p style="margin: 2px 0; font-style: italic; font-size: 7px;">Terima kasih telah melakukan pembayaran.</p>
            </div>
          </div>
        </div>
    `;

    $('#receiptContent').html(receiptHtml);
    $('#receiptModal').removeClass('hidden');
}

function addNote(note) {
    const catatan = $('#catatan');
    const currentValue = catatan.val();
    const notes = currentValue ? currentValue.split(', ').filter(n => n) : [];
    
    if (notes.includes(note)) {
        catatan.val(notes.filter(n => n !== note).join(', '));
    } else {
        catatan.val([...notes, note].join(', '));
    }
}
