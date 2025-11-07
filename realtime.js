// Update config.js to include WebSocket integration
const WS_URL = 'wss://your-websocket-server.com'; // Replace with your WebSocket server URL

// Establish WebSocket connection
let ws;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function connectWebSocket() {
  ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWebSocketMessage(data);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        reconnectAttempts++;
        connectWebSocket();
      }, 5000); // Try to reconnect after 5 seconds
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

function handleWebSocketMessage(data) {
  switch (data.type) {
    case 'balance_update':
      updateBalanceDisplay(data.nis, data.newBalance);
      break;
    case 'new_transaction':
      addTransactionToList(data.transaction);
      break;
  }
}

function updateBalanceDisplay(nis, newBalance) {
  const balanceElement = document.getElementById('saldo');
  if (balanceElement && getUserData()?.nis === nis) {
    balanceElement.textContent = formatCurrency(newBalance);
    
    // Add animation
    balanceElement.classList.add('balance-update');
    setTimeout(() => {
      balanceElement.classList.remove('balance-update');
    }, 1000);
  }
}

function addTransactionToList(transaction) {
  const transactionList = document.getElementById('transaction-list');
  if (!transactionList) return;
  
  const transactionElement = createTransactionElement(transaction);
  transactionList.insertBefore(transactionElement, transactionList.firstChild);
  
  // Animate new transaction
  transactionElement.classList.add('new-transaction');
  setTimeout(() => {
    transactionElement.classList.remove('new-transaction');
  }, 1000);
}

function createTransactionElement(transaction) {
  const element = document.createElement('div');
  element.className = 'transaction-item';
  element.innerHTML = `
    <div class="transaction-header">
      <span class="transaction-type ${transaction.type}">${transaction.type === 'topup' ? 'Top Up' : 'Penarikan'}</span>
      <span class="transaction-date">${formatDate(transaction.tanggal)}</span>
    </div>
    <div class="transaction-amount">${formatCurrency(transaction.jumlah)}</div>
    <div class="transaction-details">
      <span class="transaction-method">${transaction.metode}</span>
      <span class="transaction-recipient">${transaction.penerima}</span>
    </div>
    ${transaction.catatan ? `<div class="transaction-note">${transaction.catatan}</div>` : ''}
  `;
  return element;
}

// Add these styles to styles.css
const newStyles = `
.balance-update {
  animation: balanceUpdate 1s ease;
}

.new-transaction {
  animation: newTransaction 1s ease;
}

@keyframes balanceUpdate {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes newTransaction {
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.transaction-item {
  background: #fff;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.transaction-type {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}

.transaction-type.topup {
  background: #e6f7e6;
  color: #28a745;
}

.transaction-type.penarikan {
  background: #fbe7e7;
  color: #dc3545;
}

.transaction-amount {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
}

.transaction-details {
  display: flex;
  gap: 10px;
  color: #666;
  font-size: 0.9em;
}

.transaction-note {
  margin-top: 8px;
  color: #666;
  font-size: 0.9em;
  font-style: italic;
}
`;