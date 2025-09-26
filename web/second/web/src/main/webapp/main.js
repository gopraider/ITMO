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
    const UNIT = CX / 5;
    const DRAW_R = 3;
    const state = { x: null, y: [], r: null };
    const possibleY = ['-3','-2','-1','0','1','2','3','4','5'];
    const possibleR = ['1','1.5','2','2.5','3'];
    function renderErrors(list) {
        if (!errBox) return;
        if (!list || list.length === 0) {
            errBox.textContent = '';
            errBox.style.display = 'none';
            errBox.classList.remove('show');
            return;
        }
        errBox.innerHTML = `<ul style="margin:0;padding-left:18px;">${list.map(e => `<li>${e}</li>`).join('')}</ul>`;
        errBox.style.display = 'block';
        errBox.classList.add('show');
    }
    function isDec(s) {
        if (typeof s !== 'string') return false;
        const t = s.trim().replace(',', '.');
        return /^[-+]?\d+(\.\d+)?$/.test(t);
    }
    function cmpDec(a, b) {
        const norm = (s) => {
            let t = (s ?? '').trim().replace(',', '.');
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
        if (A.sign === 0 && B.sign == 0) return 0;
        const sgn = A.sign || 1;
        if (A.I.length !== B.I.length) return (A.I.length > B.I.length ? 1 : -1) * sgn;
        if (A.I !== B.I) return (A.I > B.I ? 1 : -1) * sgn;
        const m = Math.max(A.F.length, B.F.length);
        const aF = A.F.padEnd(m, '0'), bF = B.F.padEnd(m, '0');
        if (aF === bF) return 0;
        return (aF > bF ? 1 : -1) * sgn;
    }

    function validate() {
        const errs = [];
        const xStr = (state.x ?? '').toString().trim();
        if (!isDec(xStr)) errs.push('X должен быть числом');
        else {
            if (cmpDec(xStr, '-3') < 0 || cmpDec(xStr, '3') > 0)
                errs.push('X должен быть в диапазоне от -3 до 3');
            // опционально проверка шага 0.5:
            const v = parseFloat(xStr.replace(',', '.'));
            if (!Number.isNaN(v) && Math.abs(v * 2 - Math.round(v * 2)) > 1e-9)
                errs.push('X должен быть кратен 0.5');
        }

        if (!Array.isArray(state.y) || state.y.length === 0) {
            errs.push('Выберите хотя бы одно значение Y');
        } else if (state.y.some(y => !possibleY.includes(String(Number(y))))) {
            errs.push('Y должен быть одним из значений: -3, -2, -1, 0, 1, 2, 3, 4, 5');
        }

        const rStr = (state.r ?? '').toString().trim();
        if (!possibleR.includes(rStr)) {
            errs.push('R должен быть одним из значений: 1, 1.5, 2, 2.5, 3');
        }

        renderErrors(errs);
        return errs.length === 0;
    }


    if (xInput) {
        state.x = xInput.value;
        xInput.addEventListener('input', e => { state.x = e.target.value; });
    }
    yBoxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const val = cb.value;
            if (cb.checked) {
                if (!state.y.includes(val)) state.y.push(val);
            } else {
                state.y = state.y.filter(v => v !== val);
            }
        });
        if (cb.checked) { if (!state.y.includes(cb.value)) state.y.push(cb.value); }
    });
    rRadios.forEach(r => {
        r.addEventListener('change', () => { if (r.checked) state.r = r.value; });
        if (r.checked) state.r = r.value;
    });


    function drawGraph() {
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);


        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const pos = (i * W) / 10;
            ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, H); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(W, pos); ctx.stroke();
        }


        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(CX, 0); ctx.lineTo(CX, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, CY); ctx.lineTo(W, CY); ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (let i = -5; i <= 5; i++) {
            if (i === 0) continue;
            const x = CX + i * UNIT;
            ctx.fillText(String(i), x, CY + 4);
        }
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (let j = -5; j <= 5; j++) {
            if (j === 0) continue;
            const y = CY - j * UNIT;
            ctx.fillText(String(j), CX - 4, y);
        }


        const Rpx = UNIT * DRAW_R;

        ctx.fillStyle = 'rgba(0,123,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(CX + Rpx, CY);
        ctx.lineTo(CX, CY - Rpx);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.rect(CX - Rpx, CY, Rpx, Rpx / 2);
        ctx.fill();


        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, Rpx / 2, Math.PI, Math.PI / 2, true); // дуга в Q3
        ctx.closePath();
        ctx.fill();
    }


    drawGraph();

    if (form) {
        form.addEventListener('submit', function (e) {

            state.x = xInput ? xInput.value : state.x;
            state.y = yBoxes.filter(cb => cb.checked).map(cb => cb.value);
            const rSel = rRadios.find(r => r.checked);
            state.r = rSel ? rSel.value : state.r;

            if (!validate()) {
                e.preventDefault();
            } else {
                renderErrors([]);
            }
        });
    }
});
