const BASE_URL = "https://script.google.com/macros/s/AKfycbzZbDV_3fXNzPjuMXeuQWit80YRVETn_JQgDZYGRRF0goQ_IZz-hOFr-bD3k8KJs5hY/exec"; // Ganti dengan URL Web App Anda

async function request(path, options = {}) {
  const url = `${BASE_URL}?path=${encodeURIComponent(path)}`;
  const fetchOptions = {
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    ...options
  };
  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function login(email, password) {
  return request('login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function getStudents() {
  return request('students', { method: 'GET' });
}

export async function getCategories() {
  return request('categories', { method: 'GET' });
}

export async function processPayment(formData) {
  return request('payments', { method: 'POST', body: JSON.stringify(formData) });
}

export async function getRecap(nis) {
  return request(`recap&nis=${encodeURIComponent(nis)}`, { method: 'GET' });
}

export async function getAppLogo() {
  const res = await request('appLogo', { method: 'GET' });
  return res.dataUrl || '';
}
