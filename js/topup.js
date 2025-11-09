let topupData = {
  santri: null,
  jumlah: 0,
  metode: '',
  catatan: '',
  adminNama: ''
};

$(document).ready(function() {
  // Inisialisasi Select2 untuk santri
  $('#santriSelect').select2({
    theme: 'default',
    placeholder: 'Pilih santri...',
    allowClear: true,
    width: '100%'
  });

  // Inisialisasi Select2 untuk metode pembayaran
  $('#metode').select2({
    theme: 'default',
    placeholder: 'Pilih metode...',
    allowClear: true,
    width: '100%'
  });

  // Load data admin dari session storage
  const adminNama = sessionStorage.getItem('adminNama');
  if (adminNama) {
    $('#adminName').text(adminNama);
    topupData.adminNama = adminNama;
  } else {
    window.location.href = 'login.html';
  }

  // Format input jumlah uang
  $('#jumlah').on('input', function() {
    let value = $(this).val().replace(/[^0-9]/g, '');
    if (value) {
      value = parseInt(value, 10).toLocaleString('id-ID');
      $(this).val(value);
    }
  });

  // Load daftar santri
  loadSantriList();

  // Load metode pembayaran
  loadMetodePembayaran();

  // Handle form submission
  $('#topupForm').on('submit', function(e) {
    e.preventDefault();
    showConfirmModal();
  });
});

function loadSantriList() {
  const loadingOption = new Option('Loading...', '', true, true);
  $('#santriSelect').append(loadingOption).trigger('change');

  google.script.run
    .withSuccessHandler(function(santriList) {
      $('#santriSelect').empty();
      $('#santriSelect').append(new Option('', '', true, true));
      
      santriList.forEach(santri => {
        const option = new Option(
          `${santri[0]} - ${santri[1]}`, // text (NIS - Nama)
          JSON.stringify({   // value
            nis: santri[0],
            nama: santri[1]
          })
        );
        $('#santriSelect').append(option);
      });
    })
    .withFailureHandler(function(error) {
      showError('Gagal memuat daftar santri: ' + error.message);
    })
    .getActiveSantri();
}

function loadMetodePembayaran() {
  const loadingOption = new Option('Loading...', '', true, true);
  $('#metode').append(loadingOption).trigger('change');

  google.script.run
    .withSuccessHandler(function(metodePembayaran) {
      $('#metode').empty();
      $('#metode').append(new Option('', '', true, true));
      
      metodePembayaran.forEach(metode => {
        const option = new Option(metode, metode);
        $('#metode').append(option);
      });
    })
    .withFailureHandler(function(error) {
      showError('Gagal memuat metode pembayaran: ' + error.message);
    })
    .getMetodePembayaran();
}

function showConfirmModal() {
  // Get form values
  const santriJson = $('#santriSelect').val();
  if (!santriJson) {
    showError('Pilih santri terlebih dahulu');
    return;
  }
  
  const santri = JSON.parse(santriJson);
  const jumlah = parseInt($('#jumlah').val().replace(/[^0-9]/g, ''), 10);
  const metode = $('#metode').val();
  const catatan = $('#catatan').val();

  // Validate
  if (!jumlah || jumlah <= 0) {
    showError('Jumlah top-up harus lebih dari 0');
    return;
  }

  if (!metode) {
    showError('Pilih metode pembayaran');
    return;
  }

  // Update topupData
  topupData = {
    nis: santri.nis,
    nama: santri.nama,
    jumlah: jumlah,
    metode: metode,
    catatan: catatan,
    adminNama: sessionStorage.getItem('adminNama')
  };

  // Show confirmation details
  const details = `
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div class="text-gray-400">NIS:</div>
      <div>${topupData.nis}</div>
      <div class="text-gray-400">Nama:</div>
      <div>${topupData.nama}</div>
      <div class="text-gray-400">Jumlah:</div>
      <div>Rp ${jumlah.toLocaleString('id-ID')}</div>
      <div class="text-gray-400">Metode:</div>
      <div>${topupData.metode}</div>
      ${catatan ? `
        <div class="text-gray-400">Catatan:</div>
        <div>${topupData.catatan}</div>
      ` : ''}
    </div>
  `;
  
  $('#confirmDetails').html(details);
  $('#confirmModal').removeClass('hidden').addClass('flex');
}

function hideConfirmModal() {
  $('#confirmModal').removeClass('flex').addClass('hidden');
}

function processTopUp() {
  hideConfirmModal();
  
  const submitBtn = $('#topupForm button[type="submit"]')
    .prop('disabled', true)
    .html('<i class="fas fa-spinner fa-spin mr-2"></i>Memproses...');

  google.script.run
    .withSuccessHandler(function(response) {
      submitBtn.prop('disabled', false)
        .html('<i class="fas fa-save mr-2"></i>Proses Top-Up');

      if (response.success) {
        showSuccess('Top-up berhasil diproses');
        // Reset form
        $('#topupForm')[0].reset();
        $('#santriSelect').val(null).trigger('change');
        $('#metode').val(null).trigger('change');
      } else {
        showError(response.message || 'Gagal memproses top-up');
      }
    })
    .withFailureHandler(function(error) {
      submitBtn.prop('disabled', false)
        .html('<i class="fas fa-save mr-2"></i>Proses Top-Up');
      showError('Gagal memproses top-up: ' + error.message);
    })
    .processTopUp(topupData);
}

function showSuccess(message) {
  $('#successMessage').text(message);
  $('#alertSuccess').removeClass('hidden');
  setTimeout(() => {
    $('#alertSuccess').addClass('hidden');
  }, 5000);
}

function showError(message) {
  $('#errorMessage').text(message);
  $('#alertError').removeClass('hidden');
  setTimeout(() => {
    $('#alertError').addClass('hidden');
  }, 5000);
}

function hideAlert(id) {
  $(`#${id}`).addClass('hidden');
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}