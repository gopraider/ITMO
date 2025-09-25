export const possibleRValues = ['1','1.5','2','2.5','3'];
export const possibleYValues = ['-3','-2','-1','0','1','2','3','4','5'];

export function renderErrors(el, list) {
  if (!el) return;
  if (!list || list.length === 0) {
    el.innerHTML = '';
    el.style.display = 'none';
    return;
  }
  const items = list.map(e => `<li>${e}</li>`).join('');
  el.innerHTML = `<ul style="margin:0;padding-left:18px;">${items}</ul>`;
  el.style.display = 'block';
}
export function clearError(el){ renderErrors(el, []); }

export function cmpDec(a, b) {
  const norm = (s) => {
    let str = (s ?? '').trim();
    if (str === '') return null;
    if (str[0] === '+') str = str.slice(1);
    if (!/^[-+]?\d+(\.\d+)?$/.test(str)) return null;
    let sign = 1;
    if (str[0] === '-') { sign = -1; str = str.slice(1); }
    let [intPart, fracPart=''] = str.split('.');
    intPart = intPart.replace(/^0+(?=\d)/, '');
    fracPart = fracPart.replace(/0+$/, '');
    if (intPart === '') intPart = '0';
    const isZero = intPart === '0' && fracPart === '';
    if (isZero) return { sign: 0, intPart:'0', fracPart:'' };
    return { sign, intPart, fracPart };
  };
  const A = norm(a), B = norm(b);
  if (!A || !B) return NaN;
  if (A.sign === 0 && B.sign === 0) return 0;
  if (A.sign === 0) return -B.sign;
  if (B.sign === 0) return A.sign;
  if (A.sign !== B.sign) return A.sign > B.sign ? 1 : -1;
  const sgn = A.sign;
  if (A.intPart.length !== B.intPart.length) return (A.intPart.length > B.intPart.length ? 1 : -1) * sgn;
  if (A.intPart !== B.intPart) return (A.intPart > B.intPart ? 1 : -1) * sgn;
  const maxF = Math.max(A.fracPart.length, B.fracPart.length);
  const af = A.fracPart.padEnd(maxF, '0');
  const bf = B.fracPart.padEnd(maxF, '0');
  if (af === bf) return 0;
  return (af > bf ? 1 : -1) * sgn;
}

export function isDecimalString(s){ return typeof s === 'string' && /^[-+]?\d+(\.\d+)?$/.test(s.trim()); }
export function isIntegerStringFromSet(s, set){
  return typeof s === 'string' && /^[-+]?\d+$/.test(s.trim()) && set.includes(String(Number(s.trim())));
}

export function collectClientErrors(st) {
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
  if (rStr === '' || !possibleRValues.includes(rStr)) {
    errors.push('R должен быть одним из значений: 1, 1.5, 2, 2.5, 3');
  }
  return errors;
}

export function validateState(st, errorEl){
  const errs = collectClientErrors(st);
  if (errs.length){ renderErrors(errorEl, errs); return false; }
  clearError(errorEl); return true;
}
