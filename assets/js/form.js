// assets/js/form.js - FIXED VERSION
// Global variables
let currentReceiptData = null;
let isLoadingBills = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
});

async function initializeForm() {
    console.log('Initializing form...');
    
    // Load initial data
    await loadInitialData();
    
    // Initialize Select2
    $('#nis').select2({ placeholder: "Pilih Santri", allowClear: true });
    $('#jenisTagihan').select2({
        placeholder: "Pilih Jenis Tagihan",
        multiple: true,
        allowClear: true,
        width: '100%'
    });

    // Set penerima dari session
    const adminNama = sessionStorage.getItem('adminNama');
    if (adminNama) {
        $('#penerima').append(new Option(adminNama, adminNama, true, true)).trigger('change');
        $('#penerima').prop('disabled', false);
    }

    // Event handlers
    setupEventHandlers();
}

async function loadInitialData() {
    try {
        console.log('Loading initial data...');
        
        const [studentsResponse, methodsResponse, adminsResponse] = await Promise.all([
            ApiService.getActiveStudents(),
            ApiService.getPaymentMethods(),
            ApiService.getAdminUsers()
        ]);

        console.log('API Responses:', {
            students: studentsResponse,
            methods: methodsResponse,
            admins: adminsResponse
        });

        // PERBAIKAN: Handle students data dengan pengecekan response
        if (studentsResponse.success && studentsResponse.data && Array.isArray(studentsResponse.data)) {
            studentsResponse.data.forEach(student => {
                // Pastikan student adalah array dengan minimal 2 element [nis, nama, ...]
                if (student && student.length >= 2) {
                    $('#nis').append(new Option(`${student[1]} (${student[0]})`, student[0]));
                }
            });
            console.log('Students loaded:', studentsResponse.data.length);
        } else {
            console.error('Invalid students data:', studentsResponse);
            throw new Error('Data santri tidak valid: ' + (studentsResponse.message || 'Format tidak dikenali'));
        }

        // PERBAIKAN: Handle payment methods
        if (methodsResponse.success && methodsResponse.data && Array.isArray(methodsResponse.data)) {
            methodsResponse.data.forEach(method => {
                $('#metode').append(new Option(method, method));
            });
            console.log('Payment methods loaded:', methodsResponse.data.length);
        } else {
            console.error('Invalid methods data:', methodsResponse);
            throw new Error('Data metode pembayaran tidak valid');
        }

        // PERBAIKAN: Handle admin users
        if (adminsResponse.success && adminsResponse.data && Array.isArray(adminsResponse.data)) {
            adminsResponse.data.forEach(admin => {
                // Pastikan admin adalah array dengan minimal 2 element [id, nama, ...]
                if (admin && admin.length >= 2) {
                    $('#penerima').append(new Option(admin[1], admin[1]));
                }
            });
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
        $('#jenisTagihan').val(null).trigger('change');
        
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
                    await loadBillTypes(student[2]);
                }
            }
        } catch (error) {
            console.error('Error loading student data:', error);
        }
    });

    // Handle bill type selection
    $('#jenisTagihan').change(async function() {
        if (isLoadingBills) return;

        const selectedBills = $(this).val();
        $('#tagihanList').empty();
        
        if (!selectedBills || selectedBills.length === 0) {
            $('#tagihanSection').addClass('hidden');
            calculateTotals();
            return;
        }
        
        isLoadingBills = true;
        $('#jenisTagihan').prop('disabled', true);
        $('#tagihanSection').removeClass('hidden');
        $('#tagihanList').html('<tr><td colspan="4" class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i> Memuat rincian tagihan...</td></tr>');
        
        const category = $('#kategori').val();

        try {
            const categoriesResponse = await ApiService.getCategories();
            
            // PERBAIKAN: Handle categories response
            if (categoriesResponse.success && categoriesResponse.data) {
                $('#tagihanList').empty();
                
                const categoryData = categoriesResponse.data.find(c => c.nama === category);
                
                if (categoryData && categoryData.tagihan) {
                    selectedBills.forEach(bill => {
                        const billData = categoryData.tagihan.find(t => t.nama === bill);
                        if (billData) {
                            $('#tagihanList').append(`
                                <tr class="border-b">
                                    <td class="py-2 px-4">${bill}</td>
                                    <td class="py-2 px-4">
                                        <input type="number" class="w-full jumlah-tagihan bg-gray-100" value="${billData.jumlah}" readonly>
                                    </td>
                                    <td class="py-2 px-4">
                                        <input type="number" class="w-full potongan" value="0" min="0">
                                    </td>
                                    <td class="py-2 px-4">
                                        <input type="number" class="w-full jumlah-dibayar bg-gray-100" value="${billData.jumlah}" readonly>
                                    </td>
                                </tr>
                            `);
                        }
                    });
                }
                calculateTotals();
            } else {
                throw new Error(categoriesResponse.message || 'Data kategori tidak valid');
            }
        } catch (error) {
            console.error('Error loading bill details:', error);
            $('#tagihanList').html(`<tr><td colspan="4" class="text-center py-4 text-red-600">${error.message || 'Gagal memuat data. Silakan coba lagi.'}</td></tr>`);
        } finally {
            isLoadingBills = false;
            $('#jenisTagihan').prop('disabled', false);
        }
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
        $('#nis, #jenisTagihan').val(null).trigger('change');
        $('#tagihanList').empty();
        $('#tagihanSection').addClass('hidden');
        calculateTotals();
    });

    // Modal handlers
    $('#closeReceipt').click(() => $('#receiptModal').addClass('hidden'));
    
    // PDF Download
    document.getElementById('downloadPDF')?.addEventListener('click', () => {
        if (!currentReceiptData) return;
        
        const element = document.getElementById('receiptContent');
        const options = {
            margin: 0,
            filename: `Kwitansi_${currentReceiptData.nama}_${Date.now()}.pdf`,
            html2canvas: { 
                scale: 2, 
                logging: true, 
                useCORS: true,
                width: element.scrollWidth,
                height: element.scrollHeight
            },
            jsPDF: { 
                unit: 'mm', 
                format: [80, element.scrollHeight * 0.2645], 
                orientation: 'portrait' 
            }
        };

        html2pdf().set(options).from(element).save();
    });
}

async function loadBillTypes(categoryName) {
    try {
        const categoriesResponse = await ApiService.getCategories();
        
        // PERBAIKAN: Handle categories response
        if (categoriesResponse.success && categoriesResponse.data) {
            $('#jenisTagihan').empty();
            
            const matchedCategory = categoriesResponse.data.find(c => c.nama === categoryName);
            
            if (matchedCategory && matchedCategory.tagihan.length > 0) {
                matchedCategory.tagihan.forEach(tagihan => {
                    $('#jenisTagihan').append(new Option(tagihan.nama, tagihan.nama));
                });
                
                $('#jenisTagihan').select2('destroy');
                $('#jenisTagihan').select2({
                    placeholder: "Pilih Jenis Tagihan",
                    multiple: true,
                    allowClear: true,
                    width: '100%'
                });
            }
        } else {
            throw new Error(categoriesResponse.message || 'Data kategori tidak valid');
        }
    } catch (error) {
        console.error('Error loading bill types:', error);
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
        $('#paymentForm')[0].reset();
        $('#paymentForm').trigger('reset');
    } else {
        alert('Error: ' + response.message);
    }
}

function handlePaymentError(error) {
    alert('Error: ' + error.message);
}

function showReceipt(data) {
    const receiptHtml = `
        <div style="font-family: 'Arial', sans-serif; color: #000;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 8px;">
            <img src="assets/images/logo.png" alt="Logo Pesantren" class="h-16 mx-auto mb-2">          
            <h2 style="font-weight: bold; margin: 0; font-size: 14pt;">KWITANSI PEMBAYARAN</h2>
            <span>${data.id}</span>            
          </div>

          <!-- Info Santri -->
          <div style="border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 9pt;">
              <span>Nama:</span>
              <span>${data.nama}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 9pt;">
              <span>NIS:</span>
              <span>${data.nis}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 9pt;">
              <span>Kategori:</span>
              <span>${data.kategori}</span>
            </div>
          </div>

          <!-- Detail Tagihan -->
          ${data.tagihan.map(tagihan => `
            <div style="margin-bottom: 6px; font-size: 9pt;">
              <div style="display: flex; justify-content: space-between;">
                <span>${tagihan.jenisTagihan}:</span>
                <span>Rp${Number(tagihan.jumlahDibayar).toLocaleString('id-ID')}</span>
              </div>
            </div>
          `).join('')}

          <!-- Total -->
          <div style="border-top: 1px solid #000; padding-top: 6px; margin-top: 6px; font-size: 10pt;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>TOTAL:</span>
              <span>Rp${data.tagihan.reduce((a,b) => a + Number(b.jumlahDibayar), 0).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <!-- Footer -->
          <div style="margin-top: 8px; font-size: 8pt;">
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
            <div class="mt-6 pt-4 border-t border-gray-200 text-center text-sm">
              <p style="margin: 2px 0; font-style: italic;">Kwitansi pembayaran ini adalah bukti resmi yang sah. Harap disimpan dengan baik.</p>
              <p style="margin: 2px 0; font-style: italic;">Terima kasih telah melakukan pembayaran.</p>
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
