let currentSaldo = 0;

$(document).ready(function() {
  // Robust admin role helpers (normalize casing & trim to avoid spreadsheet mismatch)
  function _getAdminOtoritas() {
    return (sessionStorage.getItem('adminOtoritas') || '').toString().trim().toLowerCase();
  }
  const _OTORITAS = {
    SUPER: 'super admin',
    TOPUP: 'admin top-up'
  };
  function _hasAnyRole() {
    const a = _getAdminOtoritas();
    for (let i = 0; i < arguments.length; i++) {
      if (a === arguments[i].toString().trim().toLowerCase()) return true;
    }
    return false;
  }

  // Check admin access (allow Super Admin or Admin Top-Up)
  if (!_hasAnyRole(_OTORITAS.SUPER, _OTORITAS.TOPUP)) {
    alert('Anda tidak memiliki akses ke halaman ini');
    window.location.href = 'dashboard.html';
    return;
  }

  // Initialize Select2
  $('#santriSelect').select2({
    placeholder: "Pilih Santri",
    allowClear: true,
    width: '100%'
  });

  $('#metode').select2({
    placeholder: "Pilih Metode",
    allowClear: true,
    width: '100%'
  });

  // Set admin name
  function loadAdminName() {
    const adminNama = sessionStorage.getItem('adminNama') || 'Admin';
    $('#penerima').val(adminNama);
  }
  // Load admin name pertama kali
  loadAdminName();

  // Load data
  loadSantriList();
  loadMetodePembayaran();

  // Handle santri selection
  $('#santriSelect').change(function() {
    const selectedData = $(this).select2('data')[0];
    if (!selectedData) {
      $('#nama').val('');
      $('#saldoSekarang').text('Rp 0');
      currentSaldo = 0;
      updateSaldoSetelah();
      return;
    }

    const santri = JSON.parse(selectedData.id);
    $('#nama').val(santri.nama);

    // Get saldo
    google.script.run.withSuccessHandler(function(saldo) {
      currentSaldo = saldo;
      $('#saldoSekarang').text('Rp ' + saldo.toLocaleString('id-ID'));
      updateSaldoSetelah();
    }).getSaldo(santri.nis);
  });

  // Handle jumlah input
  $('#jumlah').on('input', updateSaldoSetelah);

  // Handle form submit
  $('#topupForm').submit(function(e) {
    e.preventDefault();

    const selectedData = $('#santriSelect').select2('data')[0];
    if (!selectedData) {
      showError('Pilih santri terlebih dahulu');
      return;
    }

    const santri = JSON.parse(selectedData.id);
    const jumlah = parseInt($('#jumlah').val());
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

    const formData = {
      nis: santri.nis,
      nama: santri.nama,
      jumlah: jumlah,
      metode: metode,
      penerima: $('#penerima').val(),
      catatan: catatan
    };

    $('#submitBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-2"></i> Memproses...');

    google.script.run
      .withSuccessHandler(handleSuccess)
      .withFailureHandler(handleError)
      .processTopUp(formData);
  });

  // Reset form
  $('#topupForm').on('reset', function() {
    setTimeout(() => {
      $('#santriSelect').val(null).trigger('change');
      $('#metode').val(null).trigger('change');
      $('#saldoSekarang, #saldoSetelah').text('Rp 0');
      currentSaldo = 0;

      // Reload admin name setelah reset
      loadAdminName();
    }, 10);
  });
});

function loadSantriList() {
  google.script.run
    .withSuccessHandler(function(santriList) {
      $('#santriSelect').empty();
      $('#santriSelect').append(new Option('Pilih Santri', '', true, true));

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
  google.script.run
    .withSuccessHandler(function(metodePembayaran) {
      $('#metode').empty();
      $('#metode').append(new Option('Pilih Metode', '', true, true));

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

function updateSaldoSetelah() {
  const jumlah = parseInt($('#jumlah').val()) || 0;
  const saldoSetelah = currentSaldo + jumlah;
  $('#saldoSetelah').text('Rp ' + saldoSetelah.toLocaleString('id-ID'));
}

function handleSuccess(response) {
  if (response.success) {
    $('#modalId').text(response.data.id);
    $('#modalNama').text(response.data.nama);
    $('#modalJumlah').text('Rp ' + response.data.jumlah.toLocaleString('id-ID'));
    $('#modalSaldo').text('Rp ' + response.data.saldoBaru.toLocaleString('id-ID'));
    $('#successModal').removeClass('hidden');
    $('#topupForm')[0].reset();
    $('#santriSelect').val(null).trigger('change');
    $('#metode').val(null).trigger('change');
  } else {
    showError(response.message || 'Gagal memproses top-up');
  }
  $('#submitBtn').prop('disabled', false).html('<i class="fas fa-save mr-2"></i> Proses Top-Up');
}

function handleError(error) {
  showError('Gagal memproses top-up: ' + error.message);
  $('#submitBtn').prop('disabled', false).html('<i class="fas fa-save mr-2"></i> Proses Top-Up');
}

function closeModal() {
  $('#successModal').addClass('hidden');
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
  window.location.href = 'dashboard.html';
}