document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('area-form');
    const xInput = document.getElementById('x-input');
    const yBoxes = Array.from(document.querySelectorAll('input[name="y"]'));
    const rRadios = Array.from(document.querySelectorAll('input[name="r"]'));
    const errBox = document.getElementById('error-message');
    const canvas = document.getElementById('graph') || document.getElementById('graph-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    if (canvas) { canvas.width = 400; canvas.height = 400; }
    const W = canvas ? canvas.width : 400;
    const H = canvas ? canvas.height : 400;
    const CX = W / 2;
    const CY = H / 2;
    const UNIT = W / 6;

    const state = { x: xInput?.value ?? '', y: [], r: null };
    const possibleY = ['-3','-2','-1','0','1','2','3','4','5'];
    const possibleR = ['1','1.5','2','2.5','3'];

    function isDec(s) {
        if (typeof s !== 'string') return false;
        const t = s.trim().replace(',', '.');
        return /^[-+]?\d+(\.\d+)?$/.test(t);
    }
    function cmpDec(a, b) {
        const norm = (s) => {
            let t = (s ?? '').toString().trim().replace(',', '.');
            if (t === '') return null;
            if (t[0] === '+') t = t.slice(1);
            if (!/^[-+]?\d+(\.\d+)?$/.test(t)) return null;
            let sign = 1;
            if (t[0] === '-') { sign = -1; t = t.slice(1); }
            let [I, F = ''] = t.split('.');
            I = I.replace(/^0+(?=\d)/, '');
            F = F.replace(/0+$/, '');
            if (I === '') I = '0';
            const isZero = I === '0' && F === '';
            return { sign: isZero ? 0 : sign, I, F };
        };
        const A = norm(a), B = norm(b);
        if (!A || !B) return NaN;
        if (A.sign !== B.sign) return A.sign > B.sign ? 1 : -1;
        if (A.sign === 0 && B.sign === 0) return 0;
        const sgn = A.sign || 1;
        if (A.I.length !== B.I.length) return (A.I.length > B.I.length ? 1 : -1) * sgn;
        if (A.I !== B.I) return (A.I > B.I ? 1 : -1) * sgn;
        const m = Math.max(A.F.length, B.F.length);
        const aF = A.F.padEnd(m, '0'), bF = B.F.padEnd(m, '0');
        if (aF === bF) return 0;
        return (aF > bF ? 1 : -1) * sgn;
    }

    function renderErrors(list) {
        if (!errBox) return;
        if (!list || list.length === 0) {
            errBox.textContent = '';
            errBox.style.display = 'none';
            errBox.classList.remove('show');
            return;
        }
        errBox.innerHTML = `<ul style="margin:0;padding-left:18px;">${list.map(e=>`<li>${e}</li>`).join('')}</ul>`;
        errBox.style.display = 'block';
        errBox.classList.add('show');
    }

    function validate() {
        const errs = [];
        const xStr = (state.x ?? '').toString().trim();

        if (!isDec(xStr)) {
            errs.push('X должен быть числом');
        } else {
            if (cmpDec(xStr, '-3') < 0 || cmpDec(xStr, '3') > 0) {
                errs.push('X должен быть в диапазоне от -3 до 3');
            }
        }

        if (state.y.length === 0) {
            errs.push('Выберите хотя бы одно значение Y');
        } else {
            state.y.forEach(y => {
                if (!possibleY.includes(y)) {
                    errs.push('Y должен быть одним из значений: -3, -2, -1, 0, 1, 2, 3, 4, 5');
                }
            });
        }

        if (!state.r || !possibleR.includes(state.r)) {
            errs.push('R должен быть одним из значений: 1, 1.5, 2, 2.5, 3');
        }

        renderErrors(errs);
        return errs.length === 0;
    }

    if (xInput) {
        xInput.addEventListener('input', e => { state.x = e.target.value; validate(); drawGraph(); });
    }
    yBoxes.forEach(cb => {
        if (cb.checked) state.y.push(cb.value);
        cb.addEventListener('change', () => {
            const v = cb.value;
            if (cb.checked) { if (!state.y.includes(v)) state.y.push(v); }
            else { state.y = state.y.filter(x => x !== v); }
            validate(); drawGraph();
        });
    });
    rRadios.forEach(r => {
        if (r.checked) state.r = r.value;
        r.addEventListener('change', () => { if (r.checked) state.r = r.value; validate(); });
    });

    function drawGraph() {
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);

        ctx.strokeStyle = '#e6e6e6';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath(); ctx.moveTo(CX + i*UNIT, 0); ctx.lineTo(CX + i*UNIT, H); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(CX - i*UNIT, 0); ctx.lineTo(CX - i*UNIT, H); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, CY + i*UNIT); ctx.lineTo(W, CY + i*UNIT); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, CY - i*UNIT); ctx.lineTo(W, CY - i*UNIT); ctx.stroke();
        }

        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(CX, 0); ctx.lineTo(CX, H);
        ctx.moveTo(0, CY); ctx.lineTo(W, CY);
        ctx.stroke();

        const R_DRAW = 2;
        const Rpx = R_DRAW * UNIT;

        ctx.fillStyle = 'rgba(0,123,255,0.35)';
        ctx.strokeStyle = 'rgba(0,123,255,0.8)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.rect(CX, CY - Rpx, Rpx / 2, Rpx);
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, Rpx / 2, 0, Math.PI / 2, false);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(CX - Rpx, CY);
        ctx.lineTo(CX, CY + Rpx);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        if (state.x && state.y.length > 0) {
            const x = parseFloat(state.x.toString().replace(',', '.'));
            state.y.forEach(yStr => {
                const y = parseFloat(yStr);
                const px = CX + x * UNIT;
                const py = CY - y * UNIT;

                let fill = '#000', stroke = '#000';
                try {
                    if (typeof AreaChecker !== 'undefined' && state.r) {
                        const hit = AreaChecker.calculate(x, y, parseFloat(state.r));
                        fill = hit ? '#28a745' : '#dc3545';
                        stroke = hit ? '#155724' : '#721c24';
                    }
                } catch (_) {}

                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fillStyle = fill; ctx.fill();
                ctx.lineWidth = 1; ctx.strokeStyle = stroke; ctx.stroke();
            });
        }
    }

    if (canvas) {
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const mathX = ((x - CX) / UNIT).toFixed(3);
            const rawY = ( (CY - y) / UNIT );
            const nearestY = possibleY
                .map(Number)
                .reduce((best, cur) => Math.abs(cur - rawY) < Math.abs(best - rawY) ? cur : best,
                    Number(possibleY[0]));

            if (xInput) { xInput.value = mathX; state.x = mathX; }

            yBoxes.forEach(cb => cb.checked = false);
            state.y = [String(nearestY)];
            const cb = yBoxes.find(c => Number(c.value) === nearestY);
            if (cb) cb.checked = true;

            drawGraph();
            if (validate()) form.submit();
        });
    }

    drawGraph();

    if (form) {
        form.addEventListener('submit', (e) => { if (!validate()) e.preventDefault(); });
    }
});
