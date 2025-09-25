export function createGraph(canvas) {
  if (!canvas) return null;
  canvas.width = 400; canvas.height = 400;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  const pxPerUnit = center / 5;

  function drawAxesAndGrid() {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff00'; ctx.fillRect(0,0,size,size);
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const pos = i * size / 10;
      ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(size, pos); ctx.stroke();
    }
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(center, 0); ctx.lineTo(center, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, center); ctx.lineTo(size, center); ctx.stroke();
  }

  function drawArea(R) {
    if (!(R > 0)) return;
    const Rpx = pxPerUnit * R;
    ctx.fillStyle = 'rgba(0,123,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center - Rpx, center);
    ctx.lineTo(center, center + Rpx);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.rect(center - Rpx, center - Rpx, Rpx, Rpx);
    ctx.fill();
    ctx.beginPath();
    const rQuarter = Rpx / 2;
    ctx.moveTo(center, center);
    ctx.arc(center, center, rQuarter, Math.PI / 2, 0, true);
    ctx.closePath(); ctx.fill();
  }

  function drawPoint(x, y, isHit) {
    const px = center + x * pxPerUnit;
    const py = center - y * pxPerUnit;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = isHit ? 'green' : 'red';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
  }

  function render(R){
    drawAxesAndGrid();
    if (Number.isFinite(R) && R > 0) drawArea(R);
  }

  return { render, drawPoint };
}
