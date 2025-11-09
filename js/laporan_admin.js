// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuth()) {
    window.location.href = 'login.html';
    return;
  }
  loadAdminInfo();
  loadLaporan();
});

// Authentication check
function checkAuth() {
  const admin = sessionStorage.getItem('adminNama');
  const otoritas = sessionStorage.getItem('adminOtoritas');
  return admin && otoritas;
}

// Load admin info
function loadAdminInfo() {
  const adminNama = sessionStorage.getItem('adminNama');
  const adminOtoritas = sessionStorage.getItem('adminOtoritas');
  if (adminNama && adminOtoritas) {
    document.getElementById('adminInfo').textContent = `Login sebagai: ${adminNama} (${adminOtoritas})`;
  } else {
    window.location.href = 'login.html';
  }
}

// Logout function
function logout() {
  sessionStorage.clear();
  window.location.href = 'dashboard.html';
}

// Update date and time
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('id-ID', options);
}

// Load laporan data
function loadLaporan() {
  // Robust admin role helpers (normalize casing & trim to avoid spreadsheet mismatch)
  function _getAdminOtoritas() {
    const otoritas = sessionStorage.getItem('adminOtoritas');
    console.log('Raw adminOtoritas from sessionStorage:', otoritas);
    return (otoritas || '').toString().trim().toLowerCase();
  }

  const _OTORITAS = {
    SUPER: 'super admin',
    ADMIN_TOPUP: 'admin top-up',
    ADMIN_PENARIKAN: 'admin penarikan',
    LAPORAN: 'admin laporan',
    PEMBIMBING: 'pembimbing'
  };

  console.log('Configured OTORITAS:', _OTORITAS);

  function _hasAnyRole() {
    const a = _getAdminOtoritas();
    console.log('Current admin role:', a);
    for (let i = 0; i < arguments.length; i++) {
      const requiredRole = arguments[i].toString().trim().toLowerCase();
      console.log('Checking role:', requiredRole, 'matches:', a === requiredRole);
      if (a === requiredRole) return true;
    }
    return false;
  }

  // Check admin access (allow Super Admin, Admin Laporan, Admin Top-Up, Admin Penarikan, and Pembimbing)
  if (!_hasAnyRole(_OTORITAS.SUPER, _OTORITAS.LAPORAN, _OTORITAS.TOPUP, _OTORITAS.PENARIKAN, _OTORITAS.PEMBIMBING)) {
    alert('Anda tidak memiliki akses ke halaman ini');
    window.location.href = 'dashboard.html';
    return;
  }

  google.script.run
    .withSuccessHandler(function(response) {
      console.log('Stats response:', response);
      if (response.success) {
        laporanData = response.data;
        allSantri = response.data.saldo || [];
        processTransactions(response.data);
        displayLaporan(response.data);
        initializeNisSelect();
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
      } else {
        alert('Error loading data: ' + response.message);
      }
    })
    .withFailureHandler(function(error) {
      console.error('Error loading stats:', error);
      // Fallback: tetap tampilkan section stats meski data gagal load
      document.getElementById('loadingState').innerHTML = '<p class="text-red-400">Gagal memuat data</p>';
    })
    .getLaporanAdmin();
}

let laporanData = null;
let transactionsByNis = {};
let allSantri = [];

function processTransactions(data) {
  transactionsByNis = {};
  const _norm = v => (v === null || v === undefined) ? '' : String(v).toString().trim();

  // Process topup transactions
  if (data.topup) {
    data.topup.forEach(item => {
      const key = _norm(item.nis);
      if (!key) return; // skip entries without NIS
      if (!transactionsByNis[key]) {
        transactionsByNis[key] = { nama: item.nama, transactions: [] };
      }
      transactionsByNis[key].transactions.push({
        type: 'topup',
        id: item.id,
        jumlah: item.jumlah,
        metode: item.metode,
        penerima: item.penerima,
        tanggal: item.tanggal,
        catatan: item.catatan
      });
    });
  }

  // Process penarikan transactions
  if (data.penarikan) {
    data.penarikan.forEach(item => {
      const key = _norm(item.nis);
      if (!key) return; // skip entries without NIS
      if (!transactionsByNis[key]) {
        transactionsByNis[key] = { nama: item.nama, transactions: [] };
      }
      transactionsByNis[key].transactions.push({
        type: 'penarikan',
        id: item.id,
        jumlah: item.jumlah,
        metode: item.metode,
        penerima: item.penerima,
        tanggal: item.tanggal,
        catatan: item.catatan
      });
    });
  }

  // Sort transactions by date (newest first) and limit to 10
  Object.keys(transactionsByNis).forEach(nis => {
    transactionsByNis[nis].transactions.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    transactionsByNis[nis].transactions = transactionsByNis[nis].transactions.slice(0, 10);
  });
}

function displayLaporan(data) {
  // Update summary
  document.getElementById('totalSantri').textContent = data.summary.jumlahSantri || 0;
  document.getElementById('totalSaldo').textContent = 'Rp ' + (data.summary.totalSaldo || 0).toLocaleString('id-ID');
  document.getElementById('totalTopUp').textContent = 'Rp ' + (data.summary.totalTopUp || 0).toLocaleString('id-ID');
  document.getElementById('totalPenarikan').textContent = 'Rp ' + (data.summary.totalPenarikan || 0).toLocaleString('id-ID');

  // Sort and Display Top-Up (newest first)
  const topupBody = document.getElementById('topupTableBody');
  if (data.topup && data.topup.length > 0) {
    const sortedTopup = data.topup.sort((a, b) => new Date(b.tanggal.split(' ').reverse().join(' ')) - new Date(a.tanggal.split(' ').reverse().join(' ')));
    topupBody.innerHTML = sortedTopup.map(item => `
      <tr class="hover:bg-slate-700 transition">
        <td class="px-4 py-3 text-xs text-gray-300 font-mono">${item.id}</td>
        <td class="px-4 py-3 text-xs text-gray-300">${item.nis}</td>
        <td class="px-4 py-3 text-xs text-gray-200">${item.nama}</td>
        <td class="px-4 py-3 text-xs text-right text-emerald-400 font-semibold">Rp ${item.jumlah.toLocaleString('id-ID')}</td>
        <td class="px-4 py-3 text-xs text-gray-300">${item.metode}</td>
        <td class="px-4 py-3 text-xs text-gray-300">${item.penerima}</td>
        <td class="px-4 py-3 text-xs text-gray-400">${item.tanggal}</td>
        <td class="px-4 py-3 text-xs text-gray-400">${item.catatan || '-'}</td>
      </tr>
    `).join('');
  } else {
    topupBody.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>';
  }

  // Sort and Display Penarikan (newest first)
  const penarikanBody = document.getElementById('penarikanTableBody');
  if (data.penarikan && data.penarikan.length > 0) {
    const sortedPenarikan = data.penarikan.sort((a, b) => new Date(b.tanggal.split(' ').reverse().join(' ')) - new Date(a.tanggal.split(' ').reverse().join(' ')));
    penarikanBody.innerHTML = sortedPenarikan.map(item => {
      const isKhusus = item.catatan.includes('[PENARIKAN KHUSUS');
      return `
        <tr class="hover:bg-slate-700 transition">
          <td class="px-4 py-3 text-xs text-gray-300 font-mono">${item.id}</td>
          <td class="px-4 py-3 text-xs text-gray-300">${item.nis}</td>
          <td class="px-4 py-3 text-xs text-gray-200">${item.nama}</td>
          <td class="px-4 py-3 text-xs text-right text-yellow-400 font-semibold">Rp ${item.jumlah.toLocaleString('id-ID')}</td>
          <td class="px-4 py-3 text-xs text-gray-300">${item.metode}</td>
          <td class="px-4 py-3 text-xs text-gray-300">${item.penerima}</td>
          <td class="px-4 py-3 text-xs text-gray-400">${item.tanggal}</td>
          <td class="px-4 py-3 text-xs ${isKhusus ? 'text-purple-400' : 'text-gray-400'}">
            ${isKhusus ? '<span class="px-2 py-1 bg-purple-900 rounded text-xs mr-1">KHUSUS</span>' : ''}
            ${item.catatan || '-'}
          </td>
        </tr>
      `;
    }).join('');
  } else {
    penarikanBody.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>';
  }

  // Display Saldo with clickable rows (only show entries that have a valid NIS)
  const saldoBody = document.getElementById('saldoTableBody');
  const _norm = v => (v === null || v === undefined) ? '' : String(v).toString().trim();
  const saldoList = (data.saldo || []).filter(item => _norm(item.nis));
  if (saldoList.length > 0) {
    saldoBody.innerHTML = saldoList.map(item => {
      const saldo = item.saldo || 0;
      const statusColor = saldo > 0 ? 'text-emerald-400' : 'text-gray-400';
      const statusText = saldo > 0 ? 'Ada Saldo' : 'Kosong';
      const nisSafe = _norm(item.nis);
      return `
        <tr class="hover:bg-slate-700 transition cursor-pointer" onclick="showTransactions('${nisSafe}')">
          <td class="px-4 py-3 text-xs text-gray-300">${nisSafe}</td>
          <td class="px-4 py-3 text-xs text-gray-200">${item.nama}</td>
          <td class="px-4 py-3 text-xs text-right ${statusColor} font-semibold">Rp ${saldo.toLocaleString('id-ID')}</td>
          <td class="px-4 py-3 text-xs text-center">
            <span class="px-2 py-1 ${saldo > 0 ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-700 text-gray-400'} rounded text-xs">
              ${statusText}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  } else {
    saldoBody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>';
  }
}

function showTab(tab) {
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('border-blue-500', 'text-blue-400');
    btn.classList.add('border-transparent', 'text-gray-400');
  });

  const activeBtn = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
  activeBtn.classList.add('border-blue-500', 'text-blue-400');
  activeBtn.classList.remove('border-transparent', 'text-gray-400');

  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById('content' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
}

function exportData(type) {
  if (!laporanData) {
    alert('Data belum dimuat');
    return;
  }

  let csvContent = '';
  let filename = '';

  if (type === 'topup') {
    csvContent = 'ID,NIS,Nama,Jumlah,Metode,Petugas,Tanggal,Catatan\n';
    laporanData.topup.forEach(item => {
      csvContent += `${item.id},${item.nis},${item.nama},${item.jumlah},${item.metode},${item.penerima},${item.tanggal},"${item.catatan}"\n`;
    });
    filename = 'Laporan_TopUp_' + new Date().toISOString().split('T')[0] + '.csv';
  } else if (type === 'penarikan') {
    csvContent = 'ID,NIS,Nama,Jumlah,Metode,Petugas,Tanggal,Catatan\n';
    laporanData.penarikan.forEach(item => {
      csvContent += `${item.id},${item.nis},${item.nama},${item.jumlah},${item.metode},${item.penerima},${item.tanggal},"${item.catatan}"\n`;
    });
    filename = 'Laporan_Penarikan_' + new Date().toISOString().split('T')[0] + '.csv';
  } else if (type === 'saldo') {
    csvContent = 'NIS,Nama,Saldo\n';
    laporanData.saldo.forEach(item => {
      csvContent += `${item.nis},${item.nama},${item.saldo}\n`;
    });
    filename = 'Laporan_Saldo_' + new Date().toISOString().split('T')[0] + '.csv';
  }

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function showTransactions(nis) {
  const _norm = v => (v === null || v === undefined) ? '' : String(v).toString().trim();
  const key = _norm(nis);
  const student = transactionsByNis[key];
  if (!student) {
    alert('Data transaksi tidak ditemukan');
    return;
  }

  document.getElementById('modalTitle').textContent = `Riwayat Transaksi - ${student.nama || ''} (${key})`;

  const transactionList = document.getElementById('transactionList');
  if (student.transactions && student.transactions.length > 0) {
    transactionList.innerHTML = student.transactions.map(trans => {
      const isTopup = trans.type === 'topup';
      const amountColor = isTopup ? 'text-emerald-400' : 'text-yellow-400';
      const amountSign = isTopup ? '+' : '-';
      const typeText = isTopup ? 'Top-Up' : 'Penarikan';
      const typeIcon = isTopup ? 'fa-arrow-up' : 'fa-arrow-down';
      const isKhusus = trans.catatan && trans.catatan.includes('[PENARIKAN KHUSUS');

      return `
        <div class="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center">
              <i class="fas ${typeIcon} ${isTopup ? 'text-emerald-400' : 'text-yellow-400'} mr-2"></i>
              <span class="text-sm font-medium text-gray-200">${typeText}</span>
              ${isKhusus ? '<span class="ml-2 text-xs bg-purple-600 px-2 py-1 rounded">KHUSUS</span>' : ''}
            </div>
            <span class="text-xs text-gray-400">${trans.tanggal}</span>
          </div>
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-300">
              <div>ID: <span class="font-mono">${trans.id}</span></div>
              <div>Metode: ${trans.metode}</div>
              <div>Petugas: ${trans.penerima}</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-semibold ${amountColor}">${amountSign}Rp ${trans.jumlah.toLocaleString('id-ID')}</div>
            </div>
          </div>
          ${trans.catatan ? `<div class="mt-2 text-xs text-gray-400">Catatan: ${trans.catatan}</div>` : ''}
        </div>
      `;
    }).join('');
  } else {
    transactionList.innerHTML = '<p class="text-gray-400 text-center py-8">Tidak ada transaksi</p>';
  }

  document.getElementById('transactionModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('transactionModal').classList.add('hidden');
}

function initializeNisSelect() {
  const select = $('#nisSelect');
  select.empty();
  select.append('<option value="">Pilih NIS...</option>');
  const _norm = v => (v === null || v === undefined) ? '' : String(v).toString().trim();
  const seen = new Set();

  allSantri.forEach(santri => {
    const nis = _norm(santri.nis);
    if (!nis || seen.has(nis)) return;
    seen.add(nis);
    select.append(`<option value="${nis}">${nis} - ${santri.nama || ''}</option>`);
  });

  select.select2({
    placeholder: "Cari NIS atau nama santri...",
    allowClear: true,
    width: '100%'
  });

  select.on('change', function() {
    const selectedNis = $(this).val();
    if (selectedNis) {
      filterReportsByNis(selectedNis);
    } else {
      showAllReports();
    }
  });
}

function filterReportsByNis(nis) {
  if (!laporanData) return;
  const _norm = v => (v === null || v === undefined) ? '' : String(v).toString().trim();
  const key = _norm(nis);

  if (!key) {
    displayLaporan(laporanData);
    return;
  }

  // Filter topup data
  const filteredTopup = laporanData.topup ? laporanData.topup.filter(item => _norm(item.nis) === key) : [];
  displayFilteredTopup(filteredTopup);

  // Filter penarikan data
  const filteredPenarikan = laporanData.penarikan ? laporanData.penarikan.filter(item => _norm(item.nis) === key) : [];
  displayFilteredPenarikan(filteredPenarikan);

  // Filter saldo data (only entries with valid NIS)
  const filteredSaldo = laporanData.saldo ? laporanData.saldo.filter(item => _norm(item.nis) === key) : [];
  displayFilteredSaldo(filteredSaldo);
}

function displayFilteredTopup(data) {
  const body = document.getElementById('topupTableBody');
  if (data && data.length > 0) {
    const sortedData = data.sort((a, b) => new Date(b.tanggal.split(' ').reverse().join(' ')) - new Date(a.tanggal.split(' ').reverse().join(' ')));
    body.innerHTML = sortedData.map(item => `
      <tr class="hover:bg-slate-700 transition">
        <td class="px-4 py-3 text-xs text-gray-300 font-mono">${item.id}</td>
        <td class="px-4 py-3 text-xs text-gray-300">${item.nis}</td>
        <td class="px-4 py-3 text-xs text-gray-200">${item.nama}</td>
        <td class="px-4 py-3 text-xs text-right text-emerald-400 font-semibold">Rp ${item.jumlah.toLocaleString('id-ID')}</td>
        <td class="px-4 py-3 text-xs text-gray-300">${item.metode}</td>
        <td class="px-4 py-3 text-xs text-gray-300">${item.penerima}</td>
        <td class="px-4 py-3 text-xs text-gray-400">${item.tanggal}</td>
        <td class="px-4 py-3 text-xs text-gray-400">${item.catatan || '-'}</td>
      </tr>
    `).join('');
  } else {
    body.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">Tidak ada data top-up untuk NIS ini</td></tr>';
  }
}

function displayFilteredPenarikan(data) {
  const body = document.getElementById('penarikanTableBody');
  if (data && data.length > 0) {
    const sortedData = data.sort((a, b) => new Date(b.tanggal.split(' ').reverse().join(' ')) - new Date(a.tanggal.split(' ').reverse().join(' ')));
    body.innerHTML = sortedData.map(item => {
      const isKhusus = item.catatan.includes('[PENARIKAN KHUSUS');
      return `
        <tr class="hover:bg-slate-700 transition">
          <td class="px-4 py-3 text-xs text-gray-300 font-mono">${item.id}</td>
          <td class="px-4 py-3 text-xs text-gray-300">${item.nis}</td>
          <td class="px-4 py-3 text-xs text-gray-200">${item.nama}</td>
          <td class="px-4 py-3 text-xs text-right text-yellow-400 font-semibold">Rp ${item.jumlah.toLocaleString('id-ID')}</td>
          <td class="px-4 py-3 text-xs text-gray-300">${item.metode}</td>
          <td class="px-4 py-3 text-xs text-gray-300">${item.penerima}</td>
          <td class="px-4 py-3 text-xs text-gray-400">${item.tanggal}</td>
          <td class="px-4 py-3 text-xs ${isKhusus ? 'text-purple-400' : 'text-gray-400'}">
            ${isKhusus ? '<span class="px-2 py-1 bg-purple-900 rounded text-xs mr-1">KHUSUS</span>' : ''}
            ${item.catatan || '-'}
          </td>
        </tr>
      `;
    }).join('');
  } else {
    penarikanBody.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">Tidak ada data penarikan untuk NIS ini</td></tr>';
  }
}

function displayFilteredSaldo(data) {
  const body = document.getElementById('saldoTableBody');
  if (data && data.length > 0) {
    body.innerHTML = data.map(item => {
      const saldo = item.saldo || 0;
      const statusColor = saldo > 0 ? 'text-emerald-400' : 'text-gray-400';
      const statusText = saldo > 0 ? 'Ada Saldo' : 'Kosong';
      return `
        <tr class="hover:bg-slate-700 transition cursor-pointer" onclick="showTransactions('${item.nis}')">
          <td class="px-4 py-3 text-xs text-gray-300">${item.nis}</td>
          <td class="px-4 py-3 text-xs text-gray-200">${item.nama}</td>
          <td class="px-4 py-3 text-xs text-right ${statusColor} font-semibold">Rp ${saldo.toLocaleString('id-ID')}</td>
          <td class="px-4 py-3 text-xs text-center">
            <span class="px-2 py-1 ${saldo > 0 ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-700 text-gray-400'} rounded text-xs">
              ${statusText}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  } else {
    body.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-400">Tidak ada data saldo untuk NIS ini</td></tr>';
  }
}

function showAllReports() {
  if (laporanData) {
    displayLaporan(laporanData);
  }
}

function generateReport() {
  alert('Fitur generate laporan akan diimplementasikan');
}

// Initialize on page load
window.onload = function() {
  updateDateTime();
  loadAdminInfo();
  loadLaporan();
};