// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuth()) {
    window.location.href = 'login.html';
    return;
  }
  loadAdminInfo();
  refresh();
});

// Load admin info
function loadAdminInfo() {
  const admin = JSON.parse(localStorage.getItem('admin'));
  if (admin && admin.name) {
    document.getElementById('adminName').textContent = admin.name;
  }
}

// Logout function
function logout() {
  localStorage.removeItem('admin');
  window.location.href = 'login.html';
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

// Format currency
function formatCurrency(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

// Format date
function formatDate(date) {
  return moment(date).format('DD MMM YYYY HH:mm');
}

// Charts initialization
let transaksiChart = null;
let saldoChart = null;

function initCharts(data) {
  // Destroy existing charts if they exist
  if (transaksiChart) transaksiChart.destroy();
  if (saldoChart) saldoChart.destroy();

  // Prepare data for transaction trend chart
  const transaksiCtx = document.getElementById('transaksiChart').getContext('2d');
  transaksiChart = new Chart(transaksiCtx, {
    type: 'line',
    data: {
      labels: data.chart.labels,
      datasets: [
        {
          label: 'Top-Up',
          data: data.chart.topup,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: 'Penarikan',
          data: data.chart.penarikan,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#94A3B8'
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(148, 163, 184, 0.1)'
          },
          ticks: {
            color: '#94A3B8'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(148, 163, 184, 0.1)'
          },
          ticks: {
            color: '#94A3B8',
            callback: function(value) {
              return 'Rp ' + value.toLocaleString('id-ID');
            }
          }
        }
      }
    }
  });

  // Prepare data for balance distribution chart
  const saldoCtx = document.getElementById('saldoChart').getContext('2d');
  saldoChart = new Chart(saldoCtx, {
    type: 'pie',
    data: {
      labels: ['0-100rb', '100rb-500rb', '500rb-1jt', '1jt-5jt', '>5jt'],
      datasets: [{
        data: data.saldoDistribution,
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#6366F1',
          '#EC4899'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#94A3B8'
          }
        }
      }
    }
  });
}

// Refresh data
function refresh() {
  document.getElementById('transaksiTable').innerHTML = `
    <tr>
      <td colspan="7" class="px-4 py-8 text-center text-gray-500">
        <i class="fas fa-spinner fa-spin mr-2"></i>Memuat data...
      </td>
    </tr>
  `;

  google.script.run
    .withSuccessHandler(handleResponse)
    .withFailureHandler(handleError)
    .getLaporanAdmin({});
}

// Handle API response
function handleResponse(res) {
  if (!res || !res.success) {
    handleError(res && res.message || 'Unknown error');
    return;
  }

  const data = res.data;
  
  // Update summary cards
  document.getElementById('jumlahSantri').textContent = data.summary.jumlahSantri;
  document.getElementById('totalTopUp').textContent = formatCurrency(data.summary.totalTopUp || 0);
  document.getElementById('totalPenarikan').textContent = formatCurrency(data.summary.totalPenarikan || 0);
  document.getElementById('totalSaldo').textContent = formatCurrency(data.summary.totalSaldo || 0);
  
  // Update last update time
  document.getElementById('lastUpdate').textContent = 'Terakhir diperbarui: ' + moment().format('HH:mm:ss');

  // Initialize charts
  initCharts(data);

  // Update transaction table
  updateTransactionTable(data.transactions);
}

// Update transaction table
function updateTransactionTable(transactions) {
  if (!transactions || transactions.length === 0) {
    document.getElementById('transaksiTable').innerHTML = `
      <tr>
        <td colspan="7" class="px-4 py-8 text-center text-gray-500">
          Tidak ada data transaksi
        </td>
      </tr>
    `;
    return;
  }

  const html = transactions.map(t => `
    <tr class="border-b border-slate-700 hover:bg-slate-700/50">
      <td class="px-4 py-2">${formatDate(t.timestamp)}</td>
      <td class="px-4 py-2">${t.nis}</td>
      <td class="px-4 py-2">${t.nama}</td>
      <td class="px-4 py-2">
        <span class="px-2 py-1 rounded text-xs ${t.jenis === 'topup' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}">
          ${t.jenis === 'topup' ? 'Top-up' : 'Penarikan'}
        </span>
      </td>
      <td class="px-4 py-2">${formatCurrency(t.jumlah)}</td>
      <td class="px-4 py-2">${t.metode || '-'}</td>
      <td class="px-4 py-2">${t.admin}</td>
    </tr>
  `).join('');

  document.getElementById('transaksiTable').innerHTML = html;
}

// Handle API error
function handleError(error) {
  showAlert('Error', error);
  document.getElementById('transaksiTable').innerHTML = `
    <tr>
      <td colspan="7" class="px-4 py-8 text-center text-red-500">
        <i class="fas fa-exclamation-circle mr-2"></i>Error: ${error}
      </td>
    </tr>
  `;
}

// Export data to Excel
function exportData() {
  google.script.run
    .withSuccessHandler(function(url) {
      if (url) {
        window.open(url, '_blank');
      } else {
        showAlert('Error', 'Gagal membuat file Excel');
      }
    })
    .withFailureHandler(handleError)
    .exportLaporanToExcel();
}

// Print report
function printReport() {
  window.print();
}