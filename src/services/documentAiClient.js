// Lightweight browser-only Google Document AI client using Google Identity Services (GIS)
// Requires OAuth client ID: VITE_GIS_CLIENT_ID
// Scopes: https://www.googleapis.com/auth/cloud-platform

const GIS_SRC = 'https://accounts.google.com/gsi/client';

function loadGisScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

async function getAccessToken() {
  await loadGisScript();
  const clientId = import.meta.env.VITE_GIS_CLIENT_ID;
  if (!clientId) {
    throw new Error('VITE_GIS_CLIENT_ID is not configured');
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        callback: (response) => {
          if (response && response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('Failed to acquire access token'));
          }
        },
        error_callback: (err) => {
          reject(err);
        },
      });
      tokenClient.requestAccessToken();
    } catch (e) {
      reject(e);
    }
  });
}

async function processWithDocumentAI({ file, projectId, location, processorId }) {
  if (!projectId || !location || !processorId) {
    throw new Error('Document AI is not configured');
  }

  const accessToken = await getAccessToken();

  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result || '').toString().split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const endpoint = `https://${location}-documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      rawDocument: {
        content: base64,
        mimeType: file.type || 'application/octet-stream',
      },
    }),
  });

  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(msg || 'Document AI request failed');
  }

  return resp.json();
}

const documentAiClient = {
  processWithDocumentAI,
};

export default documentAiClient;


