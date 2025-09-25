import { validateState, renderErrors } from './validation.js';
import { createGraph } from './graph.js';
import { setupResultsTable, sendSingleRequest } from './send.js';

document.addEventListener('DOMContentLoaded', async () => {
  const state = { x: null, y: [], r: null };
  const allResults = [];

  const errorEl = document.getElementById('error-message');
  const tableEl = document.querySelector('.results-table');
  const tableBody = setupResultsTable(tableEl);
  const submitBtn = document.querySelector('.submit');

  const canvas = document.getElementById('graph-canvas') || document.getElementById('graph');
  const graph = createGraph(canvas);
  const currentR = () => {
    const r = parseFloat(state.r);
    return Number.isFinite(r) ? r : 3;
  };
  const redraw = () => {
    graph?.render(currentR());
    allResults.forEach(r => graph?.drawPoint(Number(r.x), Number(r.y), !!r.result));
  };
  redraw();

  const xInput = document.getElementById('x-input');
  if (xInput) xInput.addEventListener('input', ev => { state.x = ev.target.value; });

  const yCheckboxes = document.querySelectorAll('input[name="options"]');
  yCheckboxes.forEach(cb => cb.addEventListener('change', function () {
    const optionNumber = parseInt(this.value.replace('option',''), 10);
    const yMap = { 1:'-3', 2:'-2', 3:'-1', 4:'0', 5:'1', 6:'2', 7:'3', 8:'4', 9:'5' };
    const yVal = yMap[optionNumber];
    if (this.checked) {
      if (!state.y.includes(yVal)) state.y.push(yVal);
    } else {
      state.y = state.y.filter(v => v !== yVal);
    }
  }));

  let selectedR = null;
  const rButtons = document.querySelectorAll('.Button-group .btn');
  rButtons.forEach(btn => btn.addEventListener('click', function () {
    if (selectedR) { selectedR.classList.remove('active'); selectedR.style.background=''; selectedR.style.color=''; }
    this.classList.add('active'); this.style.background='#c8d419'; this.style.color='white';
    selectedR = this;
    state.r = this.getAttribute('data-value');
    redraw();
  }));

  if (submitBtn) {
    submitBtn.addEventListener('click', async (ev) => {
      ev.preventDefault();
      if (!validateState(state, errorEl)) return;

      submitBtn.disabled = true;
      const prev = submitBtn.textContent;
      submitBtn.textContent = 'Отправка...';
      try {
        for (const y of state.y) {
          await sendSingleRequest(state.x, y, state.r, tableBody, allResults, errorEl);
        }
        redraw();
      } catch (e) {
        renderErrors(errorEl, [String(e?.message ?? e)]);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = prev;
      }
    });
  }
});
