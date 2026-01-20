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
    
    // Update sidebar active state
    updateNavigation();
    
    // Initialize values
    updateValue('farm-size', '25.3 ha');
    updateValue('last-ndvi-scan', 'Today');
    updateValue('last-soil-check', '2h ago');
    updateValue('system-uptime', '99.8%');
    updateValue('overall-health', '78%');
    
    // Update last update time
    updateLastUpdateTime();
    
    showNotification('Dashboard loaded successfully', 'success');
}

function setupEventListeners() {
    // Refresh all button
    document.getElementById('refresh-all').addEventListener('click', refreshAllData);
    
    // Dashboard view change
    document.getElementById('dashboard-view').addEventListener('change', function() {
        changeDashboardView(this.value);
    });
    
    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Action clicked:', this.querySelector('span').textContent);
        });
    });
    
    // Alert action buttons
    document.querySelectorAll('.alert-action').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Alert action clicked');
        });
    });
}

function updateNavigation() {
    // Set active state for current page
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
    
    // Simulate data refresh
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
        case 'today':
            message = 'Showing today\'s data';
            break;
        case 'week':
            message = 'Showing weekly overview';
            break;
        case 'month':
            message = 'Showing monthly trends';
            break;
    }
    
    showNotification(message, 'info');
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
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
    
    document.getElementById('current-time').textContent = timeString + ' | ' + dateString;
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('last-update-time').textContent = timeString;
}

function updateValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
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
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f59e0b';
            break;
        case 'info':
            notification.style.backgroundColor = '#0f766e';
            break;
    }
    
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
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
    
    /* Quick Actions Grid */
    .quick-actions-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        padding: 10px;
    }
    
    .quick-actions-grid .action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 20px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        color: #4a5568;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .quick-actions-grid .action-btn:hover {
        background: #0f766e;
        color: white;
        transform: translateY(-2px);
    }
    
    .quick-actions-grid .action-btn i {
        font-size: 24px;
    }
    
    .quick-actions-grid .action-btn span {
        font-size: 0.9rem;
        text-align: center;
    }
    
    /* Alerts List */
    .alerts-list {
        padding: 10px;
    }
    
    .alert-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px 16px;
        background: #f8fafc;
        border-radius: 8px;
        margin-bottom: 10px;
        border-left: 4px solid #e2e8f0;
    }
    
    .alert-item.warning {
        border-left-color: #f59e0b;
    }
    
    .alert-item.info {
        border-left-color: #0f766e;
    }
    
    .alert-item.success {
        border-left-color: #10b981;
    }
    
    .alert-item i {
        font-size: 18px;
    }
    
    .alert-item.warning i {
        color: #f59e0b;
    }
    
    .alert-item.info i {
        color: #0f766e;
    }
    
    .alert-item.success i {
        color: #10b981;
    }
    
    .alert-content {
        flex: 1;
    }
    
    .alert-title {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 4px;
    }
    
    .alert-time {
        font-size: 0.8rem;
        color: #718096;
    }
    
    .alert-action {
        background: none;
        border: 1px solid #e2e8f0;
        padding: 6px 12px;
        border-radius: 6px;
        color: #4a5568;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .alert-action:hover {
        background: #0f766e;
        color: white;
        border-color: #0f766e;
    }
    
    /* Chart Placeholder */
    .chart-placeholder {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #718096;
        text-align: center;
        padding: 20px;
    }
    
    .placeholder-sub {
        font-size: 0.85rem;
        color: #a0aec0;
        margin-top: 8px;
    }
`;
document.head.appendChild(style);

console.log('Main Dashboard JavaScript loaded');