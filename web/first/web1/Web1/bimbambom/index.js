document.addEventListener('DOMContentLoaded', async function () {
    const videoBackground = document.getElementById('camera-background');
    if (videoBackground && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => { videoBackground.srcObject = stream; })
            .catch(() => { if (videoBackground) videoBackground.style.background = '#fff'; });
    } else if (videoBackground) {
        videoBackground.style.background = '#fff';
    }

    const canvas = document.getElementById('graph-canvas') || document.getElementById('graph');
    if (canvas) { canvas.width = 400; canvas.height = 400; }
    const ctx = canvas ? canvas.getContext('2d') : null;
    const graphSize = canvas ? canvas.width : 400;
    const axisCenter = graphSize / 2;
    const pxPerR = axisCenter / 5;
    const DRAW_R = 3;

    const state = { x: null, y: [], r: null };
    const allResults = [];

    const tableElement = document.querySelector('.results-table');
    let tableBody = document.querySelector('.results-table tbody');
    if (!tableBody && tableElement) {
        tableBody = document.createElement('tbody');
        tableElement.appendChild(tableBody);
    }
    const table = tableBody;
    const errorElement = document.getElementById('error-message');
    const submitButton = document.querySelector('.submit');
    const possibleRValues = ['1','2','3','4','5'];
    const possibleYValues = ['-3','-2','-1','0','1','2','3','4','5'];

    function renderErrors(list) {
        if (!errorElement) return;
        if (!list || list.length === 0) {
            errorElement.innerHTML = '';
            errorElement.style.display = 'none';
            return;
        }
        const items = list.map(e => `<li>${e}</li>`).join('');
        errorElement.innerHTML = `<ul style="margin:0;padding-left:18px;">${items}</ul>`;
        errorElement.style.display = 'block';
    }
    function clearError() { renderErrors([]); }

    function cmpDec(a, b) {
        const norm = (s) => {
            let str = (s ?? '').trim();
            if (str === '') return null;
            if (str[0] === '+') str = str.slice(1);
            if (!/^[-+]?\d+(\.\d+)?$/.test(str)) return null;
            let sign = 1;
            if (str[0] === '-') { sign = -1; str = str.slice(1); }
            let [intPart, fracPart = ''] = str.split('.');
            intPart = intPart.replace(/^0+(?=\d)/, '');
            fracPart = fracPart.replace(/0+$/, '');
            if (intPart === '') intPart = '0';
            const isZero = intPart === '0' && fracPart === '';
            if (isZero) return { sign: 0, intPart: '0', fracPart: '' };
            return { sign, intPart, fracPart };
        };
        const A = norm(a), B = norm(b);
        if (!A || !B) return NaN;
        if (A.sign === 0 && B.sign === 0) return 0;
        if (A.sign === 0) return -B.sign;
        if (B.sign === 0) return A.sign;
        if (A.sign !== B.sign) return A.sign > B.sign ? 1 : -1;
        const sgn = A.sign;
        if (A.intPart.length !== B.intPart.length) {
            return (A.intPart.length > B.intPart.length ? 1 : -1) * sgn;
        }
        if (A.intPart !== B.intPart) {
            return (A.intPart > B.intPart ? 1 : -1) * sgn;
        }
        const maxF = Math.max(A.fracPart.length, B.fracPart.length);
        const af = A.fracPart.padEnd(maxF, '0');
        const bf = B.fracPart.padEnd(maxF, '0');
        if (af === bf) return 0;
        return (af > bf ? 1 : -1) * sgn;
    }
    function isDecimalString(s) { return typeof s === 'string' && /^[-+]?\d+(\.\d+)?$/.test(s.trim()); }
    function isIntegerStringFromSet(s, set) {
        return typeof s === 'string' && /^[-+]?\d+$/.test(s.trim()) && set.includes(String(Number(s.trim())));
    }
    function collectClientErrors(st) {
        const errors = [];
        const xRaw = st.x != null ? String(st.x).trim() : '';
        if (xRaw === '' || !isDecimalString(xRaw)) errors.push('X должен быть числом');
        else if (cmpDec(xRaw, '-5') < 0 || cmpDec(xRaw, '3') > 0) errors.push('X должен быть в диапазоне от -5 до 3');

        if (!Array.isArray(st.y) || st.y.length === 0) errors.push('Выберите хотя бы одно значение Y');
        else {
            const invalidYs = st.y.filter(ys => !isIntegerStringFromSet(ys, possibleYValues));
            if (invalidYs.length > 0) errors.push('Y должен быть одним из значений: -3, -2, -1, 0, 1, 2, 3, 4, 5');
        }

        const rStr = st.r != null ? String(st.r).trim() : '';
        if (rStr === '' || !isIntegerStringFromSet(rStr, possibleRValues)) {
            errors.push('R должен быть одним из значений: 1, 2, 3, 4, 5');
        }
        return errors;
    }
    function validateState(st) {
        const errs = collectClientErrors(st);
        if (errs.length) { renderErrors(errs); return false; }
        clearError(); return true;
    }

    const xInput = document.getElementById('x-input');
    if (xInput) xInput.addEventListener('input', ev => { state.x = ev.target.value; });

    const yCheckboxes = document.querySelectorAll('input[name="options"]');
    yCheckboxes.forEach(cb => cb.addEventListener('change', function () {
        const optionNumber = parseInt(this.value.replace('option', ''), 10);
        const yMap = { 1: '-3', 2: '-2', 3: '-1', 4: '0', 5: '1', 6: '2', 7: '3', 8: '4', 9: '5' };
        const yVal = yMap[optionNumber];
        if (this.checked) {
            if (!state.y.includes(yVal)) state.y.push(yVal);
        } else {
            state.y = state.y.filter(v => v !== yVal);
        }
    }));

    let selectedRButton = null;
    const rButtons = document.querySelectorAll('.Button-group .btn');
    rButtons.forEach(btn => btn.addEventListener('click', function () {
        if (selectedRButton) {
            selectedRButton.classList.remove('active');
            selectedRButton.style.background = '';
            selectedRButton.style.color = '';
        }
        this.classList.add('active');
        this.style.background = '#007bff';
        this.style.color = 'white';
        selectedRButton = this;
        state.r = this.getAttribute('data-value');
    }));

    function addResultRowFromResultObj(res) {
        if (!table) return;
        const tr = document.createElement('tr');
        const resultText = res.result ? 'Попадание' : 'Промах';
        tr.innerHTML =
            `<td>${res.createdAt || ''}</td>` +
            `<td>${res.x}</td><td>${res.y}</td><td>${res.r}</td>` +
            `<td>${resultText}</td><td>${res.execMs ?? 'Н/Д'}</td>`;
        tr.classList.add(res.result ? 'hit' : 'miss');
        table.appendChild(tr);
    }
    function addResultRowFromServerResponse(rd) {
        if (!table) return;
        const tr = document.createElement('tr');
        let resultText = 'Ошибка';
        let isHit = false;
        let execTime = 'Н/Д';
        if (rd.serverResponse && rd.serverResponse.hit !== undefined) {
            resultText = rd.serverResponse.hit ? 'Попадание' : 'Промах';
            isHit = !!rd.serverResponse.hit;
            execTime = rd.serverResponse.executionTime || 'Н/Д';
        } else if (rd.serverResponse && rd.serverResponse.result !== undefined) {
            resultText = rd.serverResponse.result ? 'Попадание' : 'Промах';
            isHit = !!rd.serverResponse.result;
            execTime = rd.serverResponse.time || 'Н/Д';
        } else if (rd.serverResponse && rd.serverResponse.error) {
            resultText = `Ошибка: ${rd.serverResponse.error}`;
        }
        tr.innerHTML =
            `<td>${rd.time}</td><td>${rd.x}</td><td>${rd.y}</td><td>${rd.r}</td>` +
            `<td>${resultText}</td><td>${execTime}</td>`;
        if (isHit) tr.classList.add('hit');
        else if (resultText.startsWith('Ошибка')) tr.classList.add('error');
        else tr.classList.add('miss');
        table.appendChild(tr);
    }

    function drawGraph() {
        if (!ctx) return;
        ctx.clearRect(0, 0, graphSize, graphSize);
        ctx.fillStyle = '#ffffff00';
        ctx.fillRect(0, 0, graphSize, graphSize);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const pos = i * graphSize / 10;
            ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, graphSize); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(graphSize, pos); ctx.stroke();
        }
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(axisCenter, 0); ctx.lineTo(axisCenter, graphSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, axisCenter); ctx.lineTo(graphSize, axisCenter); ctx.stroke();
        const Rpx = (pxPerR * DRAW_R);
        ctx.fillStyle = 'rgba(0,123,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(axisCenter, axisCenter);
        ctx.lineTo(axisCenter - Rpx, axisCenter);
        ctx.lineTo(axisCenter, axisCenter - Rpx);
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.rect(axisCenter - Rpx, axisCenter, Rpx, Rpx / 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(axisCenter, axisCenter);
        ctx.arc(axisCenter, axisCenter, Rpx, Math.PI / 2, 0, true);
        ctx.closePath(); ctx.fill();
    }
    function drawPoint(x, y, isHit) {
        if (!ctx) return;
        const px = axisCenter + x * pxPerR;
        const py = axisCenter - y * pxPerR;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? 'green' : 'red';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    }
    function redrawAllPoints() {
        drawGraph();
        allResults.forEach(r => drawPoint(Number(r.x), Number(r.y), !!r.result));
    }

    function parsePossiblyPrefixedJson(text) {
        if (typeof text !== 'string') throw new Error('empty response');
        let s = text.replace(/^\uFEFF/, '').trimStart();
        try { return JSON.parse(s); } catch {}
        const iArr = s.indexOf('[');
        const iObj = s.indexOf('{');
        let i = -1;
        if (iArr !== -1 && iObj !== -1) i = Math.min(iArr, iObj);
        else i = (iArr !== -1 ? iArr : iObj);
        if (i < 0) {
            const nl = s.indexOf('\n');
            if (nl !== -1) {
                s = s.slice(nl + 1).trimStart();
                try { return JSON.parse(s); } catch {}
            }
            throw new Error('response is not JSON-like:\n' + text.slice(0, 200));
        }
        s = s.slice(i);
        return JSON.parse(s);
    }

    async function loadInitialDump() {
        try {
            const resp = await fetch('/calculate?init=1', { headers: { 'Accept': 'application/json' } });

            const raw = await resp.text();
            if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${raw.slice(0,200)}`);
            const list = parsePossiblyPrefixedJson(raw);
            if (!Array.isArray(list)) throw new Error('Ожидался JSON-массив результатов');

            for (const item of list) {
                allResults.push({
                    createdAt: item.createdAt || '',
                    x: item.x,
                    y: item.y,
                    r: item.r,
                    result: !!item.result,
                    execMs: item.execMs ?? null
                });
                addResultRowFromResultObj(item);
            }
        } catch (e) {
            renderErrors([String(e.message || e)]);
        } finally {
            redrawAllPoints();
        }
    }

    if (submitButton) {
        submitButton.addEventListener('click', async function (ev) {
            ev.preventDefault();
            if (!validateState(state)) return;
            submitButton.disabled = true;
            const prevText = submitButton.textContent;
            submitButton.textContent = 'Отправка...';
            try {
                const batchId = Date.now();
                const batchPoints = [];
                for (const yValue of state.y) {
                    const rd = await sendSingleRequest(state.x, yValue, state.r, batchId);
                    if (rd) batchPoints.push(rd);
                }
                drawGraph();
                batchPoints.forEach(p => {
                    const isHit = (p.serverResponse && p.serverResponse.hit !== undefined)
                        ? !!p.serverResponse.hit
                        : (p.serverResponse && p.serverResponse.result !== undefined ? !!p.serverResponse.result : false);
                    drawPoint(Number(p.x), Number(p.y), isHit);
                });
            } catch (e) {
                renderErrors([String(e && e.message ? e.message : e)]);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = prevText;
            }
        });
    }

    async function sendSingleRequest(xStr, yStr, rStr, batchId) {
        const params = new URLSearchParams();
        params.append('x', xStr);
        params.append('y', yStr);
        params.append('r', rStr);
        const url = '/calculate?' +params.toString();
        const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json, application/problem+json' } });
        const raw = await response.text();

        if (!response.ok) {
            try {
                const problem = parsePossiblyPrefixedJson(raw);
                const list = [];
                if (problem.detail) list.push(problem.detail);
                if (Array.isArray(problem.warnings)) {
                    for (const w of problem.warnings) {
                        const f = w && w.field ? `${w.field}: ` : '';
                        if (w && w.message) list.push(f + w.message);
                    }
                }
                renderErrors(list.length ? list : [`HTTP ${response.status}`]);
            } catch {
                renderErrors([`HTTP ${response.status}: ${raw.slice(0,200) || 'Ошибка запроса'}`]);
            }
            return null;
        }

        let result;
        try { result = parsePossiblyPrefixedJson(raw); }
        catch { renderErrors(['Некорректный JSON ответа сервера']); return null; }

        const rd = {
            x: xStr, y: yStr, r: rStr,
            time: new Date().toLocaleString(),
            serverResponse: result,
            batchId
        };
        addResultRowFromServerResponse(rd);

        const isHit = (result && result.hit !== undefined) ? !!result.hit
                     : (result && result.result !== undefined) ? !!result.result
                     : false;
        allResults.push({
            createdAt: rd.time,
            x: xStr, y: yStr, r: rStr,
            result: isHit,
            execMs: result.executionTime || result.time || null
        });

        clearError();
        return rd;
    }

    const moveThreshold = 80;
    const moveStep = 120;
    if (submitButton) {
        submitButton.style.position = submitButton.style.position || 'fixed';
        if (!submitButton.style.left) submitButton.style.left = '20px';
        if (!submitButton.style.top) submitButton.style.top = '20px';
    }
    document.addEventListener('mousemove', (e) => {
        if (!submitButton) return;
        const rect = submitButton.getBoundingClientRect();
        const style = getComputedStyle(submitButton);
        const curLeft = parseFloat(style.left) || rect.left;
        const curTop = parseFloat(style.top) || rect.top;
        const centerX = curLeft + rect.width / 2;
        const centerY = curTop + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.hypot(dx, dy);
        if (dist < moveThreshold) {
            let newLeft = curLeft + (dx > 0 ? -moveStep : moveStep);
            let newTop = curTop + (dy > 0 ? -moveStep : moveStep);
            const maxLeft = window.innerWidth - rect.width;
            const maxTop = window.innerHeight - rect.height;
            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            if (newLeft > maxLeft) newLeft = maxLeft;
            if (newTop > maxTop) newTop = maxTop;
            submitButton.style.left = `${Math.round(newLeft)}px`;
            submitButton.style.top = `${Math.round(newTop)}px`;
        }
    });

    await loadInitialDump();
});