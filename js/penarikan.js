let withdrawalData = {
  santri: null,
  jumlah: 0,
  metode: '',
  catatan: '',
  adminNama: ''
};

let selectedSantri = null;

$(document).ready(function() {
  // Inisialisasi Select2 untuk santri
  $('#santriSelect').select2({
    theme: 'default',
    placeholder: 'Pilih santri...',
    allowClear: true,
    width: '100%'
  });

  // Inisialisasi Select2 untuk metode penarikan
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
    withdrawalData.adminNama = adminNama;
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

  // Handle santri selection change
  $('#santriSelect').on('change', function() {
    const santriJson = $(this).val();
    if (santriJson) {
      selectedSantri = JSON.parse(santriJson);
      loadSantriInfo(selectedSantri.nis);
    } else {
      selectedSantri = null;
      hideSantriInfo();
    }
  });

  // Load daftar santri
  loadSantriList();

  // Load metode penarikan
  loadMetodePenarikan();

  // Handle form submission
  $('#wdForm').on('submit', function(e) {
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

function loadMetodePenarikan() {
  const loadingOption = new Option('Loading...', '', true, true);
  $('#metode').append(loadingOption).trigger('change');

  google.script.run
    .withSuccessHandler(function(metodePenarikan) {
      $('#metode').empty();
      $('#metode').append(new Option('', '', true, true));
      
      metodePenarikan.forEach(metode => {
        const option = new Option(metode, metode);
        $('#metode').append(option);
      });
    })
    .withFailureHandler(function(error) {
      showError('Gagal memuat metode penarikan: ' + error.message);
    })
    .getMetodePembayaran();
}

function loadSantriInfo(nis) {
  google.script.run
    .withSuccessHandler(function(info) {
      if (info.success) {
        $('#saldoSaatIni').text('Rp ' + info.saldo.toLocaleString('id-ID'));
        $('#limitHarian').text('Rp ' + info.limitHarian.toLocaleString('id-ID'));
        $('#sisaLimit').text('Rp ' + info.sisaLimitHarian.toLocaleString('id-ID'));
        $('#santriInfo').removeClass('hidden');
      } else {
        showError(info.message || 'Gagal memuat info santri');
        hideSantriInfo();
      }
    })
    .withFailureHandler(function(error) {
      showError('Gagal memuat info santri: ' + error.message);
      hideSantriInfo();
    })
    .getSantriDashboardData(nis);
}

function hideSantriInfo() {
  $('#santriInfo').addClass('hidden');
  $('#saldoSaatIni').text('Rp 0');
  $('#limitHarian').text('Rp 0');
  $('#sisaLimit').text('Rp 0');
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
    showError('Jumlah penarikan harus lebih dari 0');
    return;
  }

  if (!metode) {
    showError('Pilih metode penarikan');
    return;
  }

  // Update withdrawalData
  withdrawalData = {
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
      <div>${withdrawalData.nis}</div>
      <div class="text-gray-400">Nama:</div>
      <div>${withdrawalData.nama}</div>
      <div class="text-gray-400">Jumlah:</div>
      <div>Rp ${jumlah.toLocaleString('id-ID')}</div>
      <div class="text-gray-400">Metode:</div>
      <div>${withdrawalData.metode}</div>
      ${catatan ? `
        <div class="text-gray-400">Catatan:</div>
        <div>${withdrawalData.catatan}</div>
      ` : ''}
    </div>
  `;
  
  $('#confirmDetails').html(details);
  $('#confirmModal').removeClass('hidden').addClass('flex');
}

function hideConfirmModal() {
  $('#confirmModal').removeClass('flex').addClass('hidden');
}

function processWithdrawal() {
  hideConfirmModal();
  
  const submitBtn = $('#wdForm button[type="submit"]')
    .prop('disabled', true)
    .html('<i class="fas fa-spinner fa-spin mr-2"></i>Memproses...');

  google.script.run
    .withSuccessHandler(function(response) {
      submitBtn.prop('disabled', false)
        .html('<i class="fas fa-money-bill-wave mr-2"></i>Proses Penarikan');

      if (response.success) {
        showSuccess('Penarikan berhasil diproses');
        // Reload santri info
        if (selectedSantri) {
          loadSantriInfo(selectedSantri.nis);
        }
        // Reset form tapi jangan reset santri
        $('#jumlah').val('');
        $('#metode').val(null).trigger('change');
        $('#catatan').val('');
      } else {
        showError(response.message || 'Gagal memproses penarikan');
      }
    })
    .withFailureHandler(function(error) {
      submitBtn.prop('disabled', false)
        .html('<i class="fas fa-money-bill-wave mr-2"></i>Proses Penarikan');
      showError('Gagal memproses penarikan: ' + error.message);
    })
    .processPenarikan(withdrawalData);
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