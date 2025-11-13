(function () {

    function $(sel) { return document.querySelector(sel); }


    function parseY() {
        const y = $('#mainForm\\:yInput');
        if (!y) return null;
        const v = (y.value || '').trim().replace(',', '.');
        const n = Number(v);
        return isFinite(n) ? n : null;
    }

    function currentXR() {
        const xSel = $('#mainForm\\:xSelect');
        const rSel = $('#mainForm\\:rSelect');
        const x = xSel ? Number(xSel.value) : null;
        const r = rSel ? Number(rSel.value) : null;
        return { x, r };
    }

    function isHit(x, y, r) {
        if (!isFinite(x) || !isFinite(y) || !isFinite(r) || r <= 0) {
            return false;
        }

        const inRect =
            x <= 0 && x >= -r / 2 &&
            y >= 0 && y <= r;

        const inTriangle =
            x <= 0 && x >= -r &&
            y <= 0 && y >= -r / 2 &&
            y >= -0.5 * (x + r);


        const inCircle =
            x >= 0 && y <= 0 &&
            (x * x + y * y <= (r * r) / 4);

        return inRect || inTriangle || inCircle;
    }

    function drawArea() {
        const c = $('#area');
        if (!c) return;
        const ctx = c.getContext('2d');
        const W = c.width, H = c.height, cx = W / 2, cy = H / 2;

        const { x, r } = currentXR();
        const R = isFinite(r) && r > 0 ? r : 1;

        const scale = (W / 2) / (R * 1.25);


        ctx.clearRect(0, 0, W, H);


        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, cy); ctx.lineTo(W, cy);
        ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
        ctx.stroke();


        ctx.font = '12px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const marks = [-R, -R / 2, R / 2, R];
        marks.forEach(m => {
            const px = cx + m * scale;
            const py = cy - m * scale;

            ctx.beginPath();
            ctx.moveTo(px, cy - 5);
            ctx.lineTo(px, cy + 5);
            ctx.stroke();
            ctx.fillText(m.toString(), px, cy + 15);

            ctx.beginPath();
            ctx.moveTo(cx - 5, py);
            ctx.lineTo(cx + 5, py);
            ctx.stroke();
            if (m !== 0) {
                ctx.fillText(m.toString(), cx - 15, py);
            }
        });

        ctx.fillStyle = 'rgba(100,150,255,0.6)';
        ctx.strokeStyle = '#0066cc';
        ctx.beginPath();
        ctx.rect(cx - (R / 2) * scale, cy - R * scale, (R / 2) * scale, R * scale);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - R * scale, cy);
        ctx.lineTo(cx, cy + (R / 2) * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, (R / 2) * scale, 0, Math.PI / 2, false);
        ctx.lineTo(cx, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        const yVal = parseY();
        if (isFinite(x) && isFinite(yVal)) {
            const px = cx + x * scale;
            const py = cy - yVal * scale;
            const hit = isHit(x, yVal, R);

            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fillStyle = hit ? '#00aa00' : '#ff0000';
            ctx.fill();

            ctx.strokeStyle = '#333';
            ctx.stroke();
        }
    }

    function setupCanvasClick() {
        const c = $('#area'); if (!c) return;
        c.style.cursor = 'crosshair';

        c.addEventListener('click', function (e) {
            const rect = c.getBoundingClientRect();
            const xPix = e.clientX - rect.left;
            const yPix = e.clientY - rect.top;

            const rSel = $('#mainForm\\:rSelect');
            const xSel = $('#mainForm\\:xSelect');
            const yInp = $('#mainForm\\:yInput');

            const r = rSel ? Number(rSel.value) : 1;
            if (!isFinite(r) || r <= 0) return;

            const cx = c.width / 2, cy = c.height / 2;
            const scale = (c.width / 2) / (r * 1.25);

            const xVal = (xPix - cx) / scale;
            const yVal = (cy - yPix) / scale;
            if (xSel) {
                const xs = [-5, -4, -3, -2, -1, 0, 1, 2, 3];
                let best = xs[0], bestD = Math.abs(xs[0] - xVal);
                xs.forEach(v => {
                    const d = Math.abs(v - xVal);
                    if (d < bestD) { best = v; bestD = d; }
                });
                xSel.value = String(best);
                xSel.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (yInp) {
                yInp.value = yVal.toFixed(2).replace('.', ',');
                yInp.dispatchEvent(new Event('keyup', { bubbles: true }));
            }

            drawArea();
        });
    }

    window.addEventListener('load', function () {
        drawArea();
        setupCanvasClick();

        const xSel = $('#mainForm\\:xSelect');
        const yInp = $('#mainForm\\:yInput');
        const rSel = $('#mainForm\\:rSelect');
        if (xSel) xSel.addEventListener('change', drawArea);
        if (yInp) yInp.addEventListener('input', drawArea);
        if (rSel) rSel.addEventListener('change', drawArea);
    });

    if (window.jsf && jsf.ajax) {
        jsf.ajax.addOnEvent(function (e) {
            if (e.status === 'success') drawArea();
        });
    }

    window.drawArea = drawArea;
})();
