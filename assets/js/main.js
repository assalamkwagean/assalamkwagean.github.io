// Main frontend API wrapper and helpers

async function callApiGet(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.append('apiKey', API_KEY);
  url.searchParams.append('action', action);
  for (const key in params) {
    url.searchParams.append(key, params[key]);
  }

  const res = await fetch(url.toString(), { cache: 'no-store' });
  return res.json();
}

async function callApiPost(action, bodyData = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ apiKey: API_KEY, action, ...bodyData })
  });
  return res.json();
}

// Small helper to load logo from backend or repo fallback
async function loadLogo(imgEl, repoPath) {
  // Try backend-provided data URL first
  try {
    const r = await callApiGet('getAppLogo');
    if (r && r.success && r.data) {
      imgEl.src = r.data;
      return;
    }
  } catch (e) {
    console.warn('Logo from API failed:', e);
  }

  // Fallback to repo path
  if (repoPath) imgEl.src = repoPath;
}
