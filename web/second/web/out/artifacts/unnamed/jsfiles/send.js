import { renderErrors } from './validation.js';

export function setupResultsTable(tableElement) {
  let tbody = tableElement?.querySelector('tbody');
  if (!tbody && tableElement) {
    tbody = document.createElement('tbody');
    tableElement.appendChild(tbody);
  }
  return tbody || null;
}

export function addResultRowFromServerResponse(tableBody, rd) {
  if (!tableBody) return;
  const tr = document.createElement('tr');
  const ok = !!(rd.serverResponse && (rd.serverResponse.hit ?? rd.serverResponse.result));
  const resultText = ok ? 'Попадание' : 'Промах';
  const execTime = rd.serverResponse.executionTime || rd.serverResponse.time || 'Н/Д';
  tr.innerHTML =
    `<td>${rd.time}</td><td>${rd.x}</td><td>${rd.y}</td><td>${rd.r}</td>` +
    `<td>${resultText}</td><td>${execTime}</td>`;
  tr.classList.add(ok ? 'hit' : 'miss');
  tableBody.appendChild(tr);
}

export async function sendSingleRequest(xStr, yStr, rStr, tableBody, allResults, errEl) {
  const params = new URLSearchParams();
  params.append('x', xStr);
  params.append('y', yStr);
  params.append('r', rStr);

  const endpoint = (window.APP?.CONTROLLER_URL) || '/controller';
  const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, application/problem+json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams({ x: xStr, y: yStr, r: rStr }).toString()
    });
  let payload = null;
  const ct = response.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { payload = await response.json(); } catch {}
  } else {
    const txt = await response.text();
    if (!response.ok) renderErrors(errEl, [`HTTP ${response.status}: ${txt.slice(0,200)}`]);
  }

  if (!response.ok) {
    if (payload) {
      const list = [];
      if (payload.detail) list.push(payload.detail);
      if (Array.isArray(payload.warnings)) {
        for (const w of payload.warnings) {
          const f = w && w.field ? `${w.field}: ` : '';
          if (w && w.message) list.push(f + w.message);
        }
      }
      renderErrors(errEl, list.length ? list : [`HTTP ${response.status}`]);
    }
    return null;
  }

  const rd = {
    x: xStr, y: yStr, r: rStr,
    time: new Date().toLocaleString(),
    serverResponse: payload || {}
  };
  addResultRowFromServerResponse(tableBody, rd);

  const isHit = !!(payload?.hit ?? payload?.result);
  allResults.push({
    createdAt: rd.time,
    x: xStr, y: yStr, r: rStr,
    result: isHit,
    execMs: payload?.executionTime || payload?.time || null
  });

  renderErrors(errEl, []);
  return rd;
}
