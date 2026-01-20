// Main Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    setupEventListeners();
    updateTime();
    
    // Update time every second
    setInterval(updateTime, 1000);
    updateLastUpdateTime();
});

function initDashboard() {
    console.log('Initializing Main Dashboard...');
    
    updateNavigation();
    
    // Initialize dashboard values
    updateValue('farm-size', '25.3 ha');
    updateValue('last-ndvi-scan', 'Today');
    updateValue('last-soil-check', '2h ago');
    updateValue('system-uptime', '99.8%');
    updateValue('overall-health', '78%');
    
    updateLastUpdateTime();
    showNotification('Dashboard loaded successfully', 'success');
}

function setupEventListeners() {
    document.getElementById('refresh-all').addEventListener('click', refreshAllData);
    document.getElementById('dashboard-view').addEventListener('change', function() {
        changeDashboardView(this.value);
    });
    
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Action clicked:', this.querySelector('span').textContent);
        });
    });
    
    document.querySelectorAll('.alert-action').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Alert action clicked');
        });
    });
}

function updateNavigation() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });
}

function refreshAllData() {
    showNotification('Refreshing all farm data...', 'info');
    setTimeout(() => {
        updateValue('last-ndvi-scan', 'Just now');
        updateValue('last-soil-check', 'Just now');
        updateValue('overall-health', (75 + Math.random() * 5).toFixed(0) + '%');
        updateLastUpdateTime();
        showNotification('All data refreshed successfully', 'success');
    }, 1500);
}

function changeDashboardView(view) {
    console.log('Changing dashboard view to:', view);
    let message = '';
    switch(view) {
        case 'today': message = 'Showing today\'s data'; break;
        case 'week':  message = 'Showing weekly overview'; break;
        case 'month': message = 'Showing monthly trends'; break;
    }
    showNotification(message, 'info');
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateString = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    document.getElementById('current-time').textContent = timeString + ' | ' + dateString;
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    document.getElementById('last-update-time').textContent = timeString;
}

function updateValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = value;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    switch(type) {
        case 'success': notification.style.backgroundColor = '#10b981'; break;
        case 'error':   notification.style.backgroundColor = '#ef4444'; break;
        case 'warning': notification.style.backgroundColor = '#f59e0b'; break;
        case 'info':    notification.style.backgroundColor = '#0f766e'; break;
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

console.log('Main Dashboard JavaScript loaded');
