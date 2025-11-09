// Format currency
function formatCurrency(amount) {
  return 'Rp ' + (amount || 0).toLocaleString('id-ID');
}

// Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Alert handling
function showAlert(type, message) {
  const alert = document.getElementById('alert' + type);
  const messageEl = document.getElementById(type.toLowerCase() + 'Message');
  messageEl.textContent = message;
  alert.classList.remove('hidden');
}

function hideAlert(alertId) {
  document.getElementById(alertId).classList.add('hidden');
}

// Display data container
function showDataContainer(show = true) {
  const container = document.getElementById('dataContainer');
  if (show) {
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
  }
}

// Update transaction history tables
function updateTransactionHistory(topupData, withdrawalData) {
  // Update top-up history
  const topupHtml = topupData.length ? topupData.map(t => `
    <tr class="border-b border-slate-700 hover:bg-slate-700/50">
      <td class="px-4 py-2">${formatDate(t.tanggal)}</td>
      <td class="px-4 py-2 text-emerald-400">${formatCurrency(t.jumlah)}</td>
      <td class="px-4 py-2">${t.metode || '-'}</td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="3" class="px-4 py-8 text-center text-gray-500">
        Tidak ada riwayat top-up
      </td>
    </tr>
  `;
  document.getElementById('topupHistory').innerHTML = topupHtml;

  // Update withdrawal history
  const withdrawalHtml = withdrawalData.length ? withdrawalData.map(t => `
    <tr class="border-b border-slate-700 hover:bg-slate-700/50">
      <td class="px-4 py-2">${formatDate(t.tanggal)}</td>
      <td class="px-4 py-2 text-red-400">${formatCurrency(t.jumlah)}</td>
      <td class="px-4 py-2">${t.metode || '-'}</td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="3" class="px-4 py-8 text-center text-gray-500">
        Tidak ada riwayat penarikan
      </td>
    </tr>
  `;
  document.getElementById('withdrawalHistory').innerHTML = withdrawalHtml;
}

// Load data
function loadData() {
  const nis = document.getElementById('nis').value.trim();
  if (!nis) {
    showAlert('Error', 'Masukkan NIS terlebih dahulu');
    return;
  }

  // Show loading state
  showDataContainer(false);
  document.getElementById('load').innerHTML = `
    <i class="fas fa-spinner fa-spin mr-2"></i>Memuat...
  `;
  document.getElementById('load').disabled = true;

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.success) {
        showAlert('Error', res?.message || 'Terjadi kesalahan saat memuat data');
        return;
      }

      // Update info cards
      document.getElementById('namaSantri').textContent = res.santri.nama;
      document.getElementById('saldoSantri').textContent = formatCurrency(res.saldo);
      document.getElementById('limitHarian').textContent = formatCurrency(res.limitHarian);
      document.getElementById('sisaLimit').textContent = formatCurrency(res.sisaLimitHarian);

      // Update transaction history
      updateTransactionHistory(res.riwayatTopUp, res.riwayatPenarikan);

      // Show data container
      showDataContainer(true);
    })
    .withFailureHandler(function(error) {
      showAlert('Error', error.toString());
      showDataContainer(false);
    })
    .finally(function() {
      // Reset loading state
      document.getElementById('load').innerHTML = `
        <i class="fas fa-search mr-2"></i>Cari Data
      `;
      document.getElementById('load').disabled = false;
    })
    .getSantriDashboardData(nis);
}

// Logout function
function logout() {
  if (confirm('Yakin ingin keluar?')) {
    window.location.href = 'login.html';
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Setup search button
  document.getElementById('load').addEventListener('click', loadData);

  // Setup enter key on NIS input
  document.getElementById('nis').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      loadData();
    }
  });

  // Auto-focus NIS input
  document.getElementById('nis').focus();
});