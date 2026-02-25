let currentNode = 1;

document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);

    updateLastUpdateTime();
    initEventListeners();
    startLiveUpdates();
});

function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const date = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    document.getElementById('current-time').textContent = `${time} | ${date}`;
}

function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('last-update-time').textContent =
        now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

function initEventListeners() {
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) refreshBtn.addEventListener('click', refreshData);

    const timeRange = document.getElementById('time-range');
    if (timeRange) timeRange.addEventListener('change', handleTimeRangeChange);

    document.querySelectorAll('.node-item').forEach((item, index) => {
        item.addEventListener('click', () => selectNode(index));
    });

    document.querySelectorAll('.close-modal').forEach(btn =>
        btn.addEventListener('click', closeModal)
    );
}

function selectNode(index) {
    document.querySelectorAll('.node-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.node-status').forEach(s => s.classList.remove('active'));

    const node = document.querySelectorAll('.node-item')[index];
    node.classList.add('active');
    node.querySelector('.node-status').classList.add('active');

    currentNode = index + 1;
    updateParametersForNode(currentNode);

    showNotification(`Viewing data from Node ${currentNode}`);
}

function updateParametersForNode(node) {
    fetch(`http://localhost:3000/soil-data`)
        .then(res => res.json())
        .then(dataArray => {
            const data = dataArray.find(n => n.node_id === node);
            
            if (!data) return;

            // Update values
            animateValueUpdate('.param-value', {
                'pH Level': data.ph,
                'Temperature': `${data.temperature}°C`,
                'Electrical Conductivity': `${data.ec} dS/m`,
                'Humidity': `${data.humidity}%`
            });

            // Update progress bars
            updateProgressBars(data);

            // Update status (good/moderate/bad)
            document.querySelectorAll('.parameter-card').forEach(card => {
                const title = card.querySelector('h3').textContent;
                const statusEl = card.querySelector('.param-status');

                if (!statusEl) return;

                // Remove old classes
                statusEl.classList.remove('good', 'moderate', 'bad');

                let statusText = '--';

                if (title === 'pH Level') {
                    if (data.ph >= 6 && data.ph <= 7) { statusText = 'Good'; statusEl.classList.add('good'); }
                    else if (data.ph >= 5 && data.ph < 6 || data.ph > 7 && data.ph <= 8) { statusText = 'Moderate'; statusEl.classList.add('moderate'); }
                    else { statusText = 'Bad'; statusEl.classList.add('bad'); }
                }

                if (title === 'Temperature') {
                    if (data.temperature >= 25 && data.temperature <= 35) { statusText = 'Good'; statusEl.classList.add('good'); }
                    else if (data.temperature >= 20 && data.temperature < 25 || data.temperature > 35 && data.temperature <= 40) { statusText = 'Moderate'; statusEl.classList.add('moderate'); }
                    else { statusText = 'Bad'; statusEl.classList.add('bad'); }
                }

                if (title === 'Electrical Conductivity') {
                    if (data.ec <= 2) { statusText = 'Good'; statusEl.classList.add('good'); }
                    else if (data.ec <= 3) { statusText = 'Moderate'; statusEl.classList.add('moderate'); }
                    else { statusText = 'Bad'; statusEl.classList.add('bad'); }
                }

                if (title === 'Humidity') {
                    if (data.humidity >= 40 && data.humidity <= 70) { statusText = 'Good'; statusEl.classList.add('good'); }
                    else if (data.humidity >= 30 && data.humidity < 40 || data.humidity > 70 && data.humidity <= 80) { statusText = 'Moderate'; statusEl.classList.add('moderate'); }
                    else { statusText = 'Bad'; statusEl.classList.add('bad'); }
                }

                statusEl.textContent = statusText;
            });

            // Update recommendation
            updateRecommendation(data);
        })
        .catch(err => console.error('Error fetching soil data:', err));
}


// Reset cards and rec when no data
function handleTimeRangeChange() {
    const range = document.getElementById('time-range').value;

    if (range !== 'realtime' && range !== 'day') {
        document.querySelectorAll('.parameter-card').forEach(card => {
            const valueEl = card.querySelector('.param-value');
            if (valueEl) valueEl.textContent = '--';

            const statusEl = card.querySelector('.param-status');
            if (statusEl) {
                statusEl.textContent = '--';
                statusEl.classList.remove('good', 'moderate', 'bad');
            }

            const fill = card.querySelector('.range-fill');
            if (fill) fill.style.width = '0%';
        });

        const rec = document.getElementById('recommendation-section');
        if (rec) rec.remove();

        showNotification('No data available for the selected time range', 'info');
    } else {
        // Load today's data for the current node
        updateParametersForNode(currentNode);
    }
}

function animateValueUpdate(selector, values) {
    document.querySelectorAll(selector).forEach(el => {
        const title = el.closest('.parameter-card').querySelector('h3').textContent;
        if (values[title]) {
            el.classList.add('updating');
            setTimeout(() => {
                el.textContent = values[title];
                el.classList.remove('updating');
            }, 300);
        }
    });
}

function updateProgressBars(data) {
    document.querySelectorAll('.range-fill').forEach(fill => {
        const title = fill.closest('.parameter-card').querySelector('h3').textContent;
        if (title === 'pH Level') fill.style.width = `${data.ph * 10}%`;
        if (title === 'Temperature') fill.style.width = `${(data.temperature / 40) * 100}%`;
        if (title === 'Electrical Conductivity') fill.style.width = `${data.ec * 20}%`;
        if (title === 'Humidity') fill.style.width = `${data.humidity}%`;
    });
}

function updateRecommendation(data) {
    let overall = "Soil conditions are optimal.";
    let phRec = "pH level is within ideal range.";
    let tempRec = "Temperature is suitable.";
    let humRec = "Humidity level is acceptable.";
    let ecRec = "Salinity level is safe.";

    if (data.ph < 6) { phRec = "Soil is acidic. Apply lime."; overall = "Soil needs attention."; }
    else if (data.ph > 7) { phRec = "Soil is alkaline. Reduce pH."; overall = "Soil needs attention."; }

    if (data.temperature < 20) { tempRec = "Temperature is low."; overall = "Soil needs monitoring."; }
    else if (data.temperature > 35) { tempRec = "Temperature is high."; overall = "Soil needs monitoring."; }

    if (data.humidity < 40) { humRec = "Soil is dry. Irrigation recommended."; overall = "Soil needs attention."; }
    else if (data.humidity > 70) { humRec = "Soil too wet. Improve drainage."; overall = "Soil needs attention."; }

    if (data.ec > 2) { ecRec = "High salinity detected."; overall = "Soil needs attention."; }

    let recDiv = document.getElementById("recommendation-section");

    if (!recDiv) {
        recDiv = document.createElement("div");
        recDiv.id = "recommendation-section";
        recDiv.innerHTML = `
            <div class="rec-box"><h3>Overall</h3><p id="rec-overall"></p></div>
            <div class="rec-box"><h3>pH</h3><p id="rec-ph"></p></div>
            <div class="rec-box"><h3>Temperature</h3><p id="rec-temp"></p></div>
            <div class="rec-box"><h3>Humidity</h3><p id="rec-hum"></p></div>
            <div class="rec-box"><h3>EC</h3><p id="rec-ec"></p></div>
        `;
        document.querySelector(".parameters-section").appendChild(recDiv);
    }

    document.getElementById("rec-overall").textContent = overall;
    document.getElementById("rec-ph").textContent = phRec;
    document.getElementById("rec-temp").textContent = tempRec;
    document.getElementById("rec-hum").textContent = humRec;
    document.getElementById("rec-ec").textContent = ecRec;
}

function refreshData() {
    const btn = document.getElementById('refresh-data');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        btn.disabled = true;
    }

    setTimeout(() => {
        updateLastUpdateTime();
        if (btn) {
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            btn.disabled = false;
        }
        updateParametersForNode(currentNode);
        showNotification('Soil data refreshed successfully');
    }, 1500);
}

function startLiveUpdates() {
    setInterval(() => {
        // Only update if real-time/day is selected
        const range = document.getElementById('time-range').value;
        if (range === 'realtime' || range === 'day') updateParametersForNode(currentNode);
    }, 5000); // every 5s
}

function showNotification(message, type = 'info') {
    const old = document.querySelector('.notification');
    if (old) old.remove();

    const note = document.createElement('div');
    note.className = 'notification';
    
    // Use the same styling as main dashboard
    note.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            note.style.backgroundColor = '#10b981';
            break;
        case 'error':
            note.style.backgroundColor = '#ef4444';
            break;
        case 'warning':
            note.style.backgroundColor = '#f59e0b';
            break;
        case 'info':
            note.style.backgroundColor = '#0f766e';
            break;
    }
    
    note.textContent = message;
    document.body.appendChild(note);
    
    setTimeout(() => {
        if (note.parentNode) {
            note.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => note.remove(), 300);
        }
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);

function closeModal() {
    document.getElementById('node-modal').style.display = 'none';
}
