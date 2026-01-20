// Global variables
let currentNode = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    updateTime();
    updateLastUpdateTime();
    generateCharts();
    initEventListeners();
    
    // Start live updates
    startLiveUpdates();
});

// Update current time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    document.getElementById('current-time').textContent = `${dateString} ${timeString}`;
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('last-update-time').textContent = timeString;
}

// Generate charts
function generateCharts() {
    generateMoistureChart();
    generateNutrientChart();
}

// Generate moisture chart
function generateMoistureChart() {
    const chart = document.getElementById('moisture-chart');
    if (!chart) return;
    
    chart.innerHTML = '';
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const moistureLevels = [42, 45, 38, 40, 43, 41, 39];
    
    const maxMoisture = Math.max(...moistureLevels);
    
    days.forEach((day, index) => {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        
        // Calculate height as percentage of max
        const heightPercent = (moistureLevels[index] / maxMoisture) * 100;
        bar.style.height = `${heightPercent}%`;
        bar.style.backgroundColor = getMoistureColor(moistureLevels[index]);
        
        // Add label
        const label = document.createElement('div');
        label.className = 'chart-bar-label';
        label.textContent = day;
        
        // Add value tooltip
        bar.title = `${moistureLevels[index]}%`;
        
        chart.appendChild(bar);
        bar.appendChild(label);
    });
}

// Get color based on moisture level
function getMoistureColor(level) {
    if (level < 30) return '#ef4444'; // Red for dry
    if (level < 45) return '#f59e0b'; // Yellow for moderate
    return '#10b981'; // Green for good
}

// Generate nutrient chart
function generateNutrientChart() {
    const chart = document.getElementById('nutrient-chart');
    if (!chart) return;
    
    chart.innerHTML = '';
    
    const nutrients = ['N', 'P', 'K'];
    const nutrientLevels = [20, 70, 65]; // Nitrogen, Phosphorus, Potassium percentages
    
    nutrients.forEach((nutrient, index) => {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        
        // Set height based on nutrient level
        bar.style.height = `${nutrientLevels[index]}%`;
        
        // Set color based on nutrient
        const colors = ['#ef4444', '#10b981', '#10b981']; // Red for low N, green for others
        bar.style.backgroundColor = colors[index];
        
        // Add label
        const label = document.createElement('div');
        label.className = 'chart-bar-label';
        label.textContent = nutrient;
        
        // Add value tooltip
        const nutrientNames = ['Nitrogen', 'Phosphorus', 'Potassium'];
        const statuses = ['Low', 'Adequate', 'Adequate'];
        bar.title = `${nutrientNames[index]}: ${statuses[index]} (${nutrientLevels[index]}%)`;
        
        chart.appendChild(bar);
        bar.appendChild(label);
    });
}

// Initialize event listeners
function initEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
    }
    
    // Time range filter
    const timeRange = document.getElementById('time-range');
    if (timeRange) {
        timeRange.addEventListener('change', function() {
            updateCharts(this.value);
        });
    }
    
    // Node items click
    document.querySelectorAll('.node-item').forEach((item, index) => {
        item.addEventListener('click', function() {
            selectNode(index);
        });
    });
    
    // Close modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    });
}

// Select node
function selectNode(index) {
    document.querySelectorAll('.node-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll('.node-status').forEach(status => {
        status.classList.remove('active');
    });
    
    const selectedNode = document.querySelectorAll('.node-item')[index];
    const selectedStatus = selectedNode.querySelector('.node-status');
    
    selectedNode.classList.add('active');
    selectedStatus.classList.add('active');
    
    // Update current node
    currentNode = index + 1;
    
    // Update data based on selected node
    updateParametersForNode(currentNode);
    showNotification(`Viewing data from Node ${currentNode}`);
}

// Update parameters for selected node
function updateParametersForNode(nodeNumber) {
    // Sample data for each node
    const nodeData = {
        1: {
            pH: 6.4,
            temperature: 30,
            moisture: 42,
            nitrogen: 'Low'
        },
        2: {
            pH: 6.8,
            temperature: 28,
            moisture: 38,
            nitrogen: 'Medium'
        },
        3: {
            pH: 6.2,
            temperature: 32,
            moisture: 45,
            nitrogen: 'Low'
        }
    };
    
    const data = nodeData[nodeNumber];
    
    // Update displayed values with animation
    animateValueUpdate('.param-value', {
        'pH Level': data.pH,
        'Temperature': `${data.temperature}°C`,
        'Moisture': `${data.moisture}%`,
        'Nitrogen': data.nitrogen
    });
    
    // Update progress bars
    updateProgressBars(nodeNumber);
}

// Animate value updates
function animateValueUpdate(selector, values) {
    document.querySelectorAll(selector).forEach(element => {
        const card = element.closest('.parameter-card');
        const title = card.querySelector('h3').textContent;
        
        if (values[title]) {
            // Add animation class
            element.classList.add('updating');
            
            // Update value
            setTimeout(() => {
                element.textContent = values[title];
                element.classList.remove('updating');
            }, 300);
        }
    });
}

// Update progress bars
function updateProgressBars(nodeNumber) {
    // Update based on node
    const percentages = {
        1: { pH: 64, temperature: 50, moisture: 42, nitrogen: 20 },
        2: { pH: 68, temperature: 45, moisture: 38, nitrogen: 50 },
        3: { pH: 62, temperature: 55, moisture: 45, nitrogen: 20 }
    };
    
    const data = percentages[nodeNumber];
    
    document.querySelectorAll('.range-fill').forEach(fill => {
        const card = fill.closest('.parameter-card');
        const title = card.querySelector('h3').textContent;
        
        if (title === 'pH Level' && data.pH) {
            fill.style.width = `${data.pH}%`;
        } else if (title === 'Temperature' && data.temperature) {
            fill.style.width = `${data.temperature}%`;
        } else if (title === 'Moisture' && data.moisture) {
            fill.style.width = `${data.moisture}%`;
        } else if (title === 'Nitrogen' && data.nitrogen) {
            fill.style.width = `${data.nitrogen}%`;
        }
    });
}

// Refresh data
function refreshData() {
    const btn = document.getElementById('refresh-data');
    
    // Add loading state
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        btn.disabled = true;
    }
    
    setTimeout(() => {
        // Update last update time
        updateLastUpdateTime();
        
        // Update charts with new data
        generateCharts();
        
        // Update random parameters
        updateRandomParameters();
        
        // Update weather data
        updateWeatherData();
        
        // Reset button
        if (btn) {
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            btn.disabled = false;
        }
        
        // Show success message
        showNotification('Soil data refreshed successfully');
    }, 1500);
}

// Update random parameters
function updateRandomParameters() {
    // Randomly select a parameter card to update
    const cards = document.querySelectorAll('.parameter-card');
    const randomIndex = Math.floor(Math.random() * cards.length);
    const card = cards[randomIndex];
    
    if (!card.classList.contains('updating')) {
        card.classList.add('updating');
        
        // Simulate value change
        const valueElement = card.querySelector('.param-value');
        const rangeFill = card.querySelector('.range-fill');
        
        if (valueElement && rangeFill) {
            const currentValue = parseFloat(valueElement.textContent) || 0;
            const currentWidth = parseFloat(rangeFill.style.width) || 0;
            
            // Add small random changes
            const valueChange = (Math.random() - 0.5) * 0.5;
            const widthChange = (Math.random() - 0.5) * 10;
            
            const newValue = Math.max(0, Math.min(100, currentValue + valueChange));
            const newWidth = Math.max(0, Math.min(100, currentWidth + widthChange));
            
            // Update with animation
            setTimeout(() => {
                if (valueElement.classList.contains('good') || 
                    valueElement.classList.contains('moderate') || 
                    valueElement.classList.contains('poor')) {
                    valueElement.textContent = newValue.toFixed(1);
                }
                rangeFill.style.width = `${newWidth}%`;
                card.classList.remove('updating');
            }, 300);
        }
    }
}

// Update weather data
function updateWeatherData() {
    const weatherIcons = ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain'];
    const weatherDesc = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
    
    const randomIcon = weatherIcons[Math.floor(Math.random() * weatherIcons.length)];
    const randomDesc = weatherDesc[Math.floor(Math.random() * weatherDesc.length)];
    const randomTemp = Math.floor(Math.random() * 10) + 22; // 22-32°C
    const randomHumidity = Math.floor(Math.random() * 30) + 50; // 50-80%
    
    const weatherCard = document.querySelector('.weather-card');
    if (weatherCard) {
        const icon = weatherCard.querySelector('.weather-icon i');
        const temp = weatherCard.querySelector('.weather-temp');
        const desc = weatherCard.querySelector('.weather-desc');
        const humidity = weatherCard.querySelector('.weather-humidity');
        
        if (icon) icon.className = `fas ${randomIcon}`;
        if (temp) temp.textContent = `${randomTemp}°C`;
        if (desc) desc.textContent = randomDesc;
        if (humidity) humidity.textContent = `Humidity: ${randomHumidity}%`;
    }
    
    // Update forecast
    document.querySelectorAll('.forecast-day').forEach((day, index) => {
        const forecastIcon = day.querySelector('i');
        const forecastTemp = day.querySelector('span:last-child');
        
        if (forecastIcon && forecastTemp) {
            const forecastRandomIcon = weatherIcons[Math.floor(Math.random() * weatherIcons.length)];
            const forecastRandomTemp = Math.floor(Math.random() * 8) + 22;
            
            forecastIcon.className = `fas ${forecastRandomIcon}`;
            forecastTemp.textContent = `${forecastRandomTemp}°C`;
        }
    });
}

// Update charts based on time range
function updateCharts(timeRange) {
    generateCharts();
    showNotification(`Showing data for ${getTimeRangeText(timeRange)}`);
}

// Get time range text
function getTimeRangeText(range) {
    const texts = {
        'realtime': 'real-time',
        'day': 'last 24 hours',
        'week': 'last week',
        'month': 'last month'
    };
    return texts[range] || 'real-time';
}

// Start live updates
function startLiveUpdates() {
    // Update time every second
    setInterval(updateTime, 1000);
    
    // Update random parameters every 30 seconds
    setInterval(() => {
        updateRandomParameters();
    }, 30000);
    
    // Update weather every 5 minutes
    setInterval(() => {
        updateWeatherData();
    }, 300000);
}

// Show notification
function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #0f766e;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-size: 14px;
        font-weight: 500;
    `;
    
    // Add animation
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
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
            document.head.removeChild(style);
        }, 300);
    }, 3000);
}