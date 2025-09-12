document.addEventListener('DOMContentLoaded', function() {
    const state = {
        x: null,
        y: [],
        r: null
    };

    const table = document.querySelector('.results-table tbody');
    const errorElement = document.getElementById('error-message');
    const submitButton = document.querySelector('.submit');
    const possibleRValues = [1, 2, 3, 4, 5];

    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function clearError() {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }

    function validateState(state) {
        clearError();

        const x = Number(state.x ? state.x.trim() : '');
        if (!state.x || state.x.trim() === '' || isNaN(x) || !isFinite(x)) {
            showError('X должен быть числом');
            return false;
        }
        if (x < -5 || x > 3) {
            showError('X должен быть в диапазоне от -5 до 3');
            return false;
        }

        if (state.y.length === 0) {
            showError('Выберите хотя бы одно значение Y');
            return false;
        }

        for (const y of state.y) {
            if (y < -3 || y > 5) {
                showError('Y должен быть в диапазоне от -3 до 5');
                return false;
            }
        }

        if (state.r === null || isNaN(state.r)) {
            showError('Выберите значение R');
            return false;
        }

        if (!possibleRValues.includes(state.r)) {
            showError('R должен быть одним из значений: 1, 2, 3, 4, 5');
            return false;
        }

        return true;
    }

    const xInput = document.getElementById('x-input');
    xInput.addEventListener('input', function(ev) {
        state.x = ev.target.value;
    });

    const yCheckboxes = document.querySelectorAll('input[name="options"]');
    yCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const optionNumber = parseInt(this.value.replace('option', ''));
            const yMap = {1: -3, 2: -2, 3: -1, 4: 0, 5: 1, 6: 2, 7: 3, 8: 4, 9: 5};
            const yValue = yMap[optionNumber];

            if (this.checked) {
                state.y.push(yValue);
            } else {
                state.y = state.y.filter(val => val !== yValue);
            }
        });
    });

    let selectedRButton = null;
    const rButtons = document.querySelectorAll('.Button-group .btn');
    rButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (selectedRButton) {
                selectedRButton.classList.remove('active');
                selectedRButton.style.backgroundColor = '';
                selectedRButton.style.color = '';
            }

            this.classList.add('active');
            this.style.backgroundColor = '#007bff';
            this.style.color = 'white';
            selectedRButton = this;

            state.r = parseFloat(this.getAttribute('data-value'));
        });
    });

    document.querySelector('.submit').addEventListener('click', async function(ev) {
        ev.preventDefault();

        if (!validateState(state)) {
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';

        try {
            for (const yValue of state.y) {
                await sendSingleRequest(state.x, yValue, state.r);
            }
        } catch (error) {
            console.error('Request failed:', error);
            showError('Ошибка при отправке: ' + error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Отправить';
        }
    });

    async function sendSingleRequest(x, y, r) {
        try {
            const params = new URLSearchParams();
            params.append('x', x);
            params.append('y', y.toString());
            params.append('r', r.toString());
            const url = `/calculate?${params.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error ${response.status}: ${errorText}`);
            }
            const result = await response.json();
            const resultData = {
                x: x,
                y: y,
                r: r,
                time: new Date().toLocaleString(),
                serverResponse: result
            };
            const prevResults = JSON.parse(localStorage.getItem('results') || '[]');
            localStorage.setItem('results', JSON.stringify([...prevResults, resultData]));
            addResultToTable(resultData);
        } catch (error) {
            console.error(`Error for Y=${y}:`, error);
            throw error;
        }
    }

    function addResultToTable(resultData) {
        const newRow = document.createElement('tr');
        let resultText = 'Ошибка';
        let isHit = false;
        let executionTime = 'N/A';
        if (resultData.serverResponse && resultData.serverResponse.hit !== undefined) {
            resultText = resultData.serverResponse.hit ? 'Попадание' : 'Промах';
            isHit = resultData.serverResponse.hit;
            executionTime = resultData.serverResponse.executionTime || 'N/A';
        } else if (resultData.serverResponse && resultData.serverResponse.error) {
            resultText = `Ошибка: ${resultData.serverResponse.error}`;
        } else if (resultData.serverResponse && resultData.serverResponse.result !== undefined) {
            resultText = resultData.serverResponse.result ? 'Попадание' : 'Промах';
            isHit = resultData.serverResponse.result;
            executionTime = resultData.serverResponse.time || 'N/A';
        }
        newRow.innerHTML = `
            <td>${resultData.time}</td>
            <td>${resultData.x}</td>
            <td>${resultData.y}</td>
            <td>${resultData.r}</td>
            <td>${resultText}</td>
            <td>${executionTime}</td>
        `;

        if (isHit) {
            newRow.classList.add('hit');
        } else if (resultText.includes('Ошибка')) {
            newRow.classList.add('error');
        } else {
            newRow.classList.add('miss');
        }

        table.appendChild(newRow);
    }

    function loadPreviousResults() {
        const prevResults = JSON.parse(localStorage.getItem('results') || '[]');
        prevResults.forEach(resultData => {
            addResultToTable(resultData);
        });
    }

    function initTable() {
        if (!table) {
            const tableElement = document.querySelector('.results-table');
            if (tableElement) {
                const tbody = document.createElement('tbody');
                tableElement.appendChild(tbody);
            }
        }
    }

    initTable();
    loadPreviousResults();
});
