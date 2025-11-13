// FlixPlus Popup Controller

document.addEventListener('DOMContentLoaded', async () => {
    // Default settings
    const defaultSettings = {
        disableHouseholdCheck: true,
        useDDPandHA: true,
        alwaysUseHDR: false,
        onlyMaxBitrate: true,
        useallSub: true,
        closeimsc: true,
        forceUHD: false
    };

    // Load current settings
    const settings = await chrome.storage.sync.get(defaultSettings);

    // Set toggle states
    Object.keys(settings).forEach(key => {
        const toggle = document.getElementById(key);
        if (toggle) {
            toggle.checked = settings[key];
        }
    });

    // Add event listeners to all toggles
    document.querySelectorAll('.toggle input').forEach(toggle => {
        toggle.addEventListener('change', async (e) => {
            const settingKey = e.target.id;
            const settingValue = e.target.checked;

            // Save to storage
            await chrome.storage.sync.set({ [settingKey]: settingValue });

            // Try to update active tab if it's Netflix
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab && tab.url && tab.url.includes('netflix.com')) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'updateSettings',
                        settings: { [settingKey]: settingValue }
                    }).catch(() => {
                        // Tab might not have content script loaded yet
                        console.log('Content script not ready, settings saved for next page load');
                    });
                }
            } catch (err) {
                console.log('Could not update active tab:', err);
            }

            // Show visual feedback
            showFeedback();
        });
    });

    // Debug buttons
    document.getElementById('showPlayerInfo').addEventListener('click', async () => {
        executeInNetflix('switchPlayerInfo');
    });

    document.getElementById('showStreamSelector').addEventListener('click', async () => {
        executeInNetflix('switchStreamSelector');
    });

    // Check if current tab is Netflix
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const statusCard = document.getElementById('statusCard');

        if (tab && tab.url && tab.url.includes('netflix.com')) {
            statusCard.querySelector('.status-indicator span').textContent = 'Active on Netflix';
            statusCard.querySelector('.status-msg').textContent = 'Extension is running on this page';
        } else {
            statusCard.querySelector('.status-dot').classList.remove('active');
            statusCard.querySelector('.status-indicator span').textContent = 'Not on Netflix';
            statusCard.querySelector('.status-msg').textContent = 'Navigate to netflix.com to use FlixPlus';
        }
    } catch (err) {
        console.log('Could not check current tab:', err);
    }

    // Load security status
    loadSecurityStatus();

    // Refresh security status every 5 seconds
    setInterval(loadSecurityStatus, 5000);
});

// Load and display security status
async function loadSecurityStatus() {
    try {
        // Get security data from storage
        const data = await chrome.storage.local.get([
            'securityStatus',
            'securityWarning',
            'lastIntegrityCheck',
            'integrityWarning'
        ]);

        // Update network protection status
        const networkStatus = document.getElementById('networkStatus');
        if (networkStatus) {
            networkStatus.textContent = 'Active';
            networkStatus.className = 'security-value';
        }

        // Update file integrity status
        const integrityStatus = document.getElementById('integrityStatus');
        if (integrityStatus && data.lastIntegrityCheck) {
            const check = data.lastIntegrityCheck;
            if (check.result && check.result.verified) {
                integrityStatus.textContent = '✓ Verified';
                integrityStatus.className = 'security-value';
            } else if (check.result && !check.result.verified) {
                integrityStatus.textContent = '✗ Failed';
                integrityStatus.className = 'security-value error';
            } else {
                integrityStatus.textContent = 'Unknown';
                integrityStatus.className = 'security-value warning';
            }
        } else if (integrityStatus) {
            integrityStatus.textContent = 'Pending';
            integrityStatus.className = 'security-value warning';
        }

        // Update suspicious activity count
        const suspiciousCount = document.getElementById('suspiciousCount');
        if (suspiciousCount && data.securityStatus) {
            const count = data.securityStatus.suspiciousActivities || 0;
            suspiciousCount.textContent = count;
            if (count > 0) {
                suspiciousCount.className = 'security-value warning';
            } else {
                suspiciousCount.className = 'security-value';
            }
        }

        // Show warning if integrity check failed
        if (data.integrityWarning) {
            const securityCard = document.getElementById('securityCard');
            if (securityCard && !document.getElementById('integrityWarningMsg')) {
                const warning = document.createElement('div');
                warning.id = 'integrityWarningMsg';
                warning.style.cssText = 'color: #ff4444; font-size: 11px; margin-top: 8px; font-weight: 600;';
                warning.textContent = '⚠️ File integrity warning! Check console.';
                securityCard.appendChild(warning);
            }
        }

        // Show warning if suspicious activity detected
        if (data.securityWarning) {
            const securityCard = document.getElementById('securityCard');
            if (securityCard && !document.getElementById('securityWarningMsg')) {
                const warning = document.createElement('div');
                warning.id = 'securityWarningMsg';
                warning.style.cssText = 'color: #f59f00; font-size: 11px; margin-top: 8px; font-weight: 600;';
                warning.textContent = '⚠️ Suspicious activity detected!';
                securityCard.appendChild(warning);
            }
        }
    } catch (err) {
        console.log('Could not load security status:', err);
    }
}

// Execute code in Netflix tab
async function executeInNetflix(functionName) {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.includes('netflix.com')) {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (fnName) => {
                    try {
                        // Call function without eval
                        if (fnName === 'switchPlayerInfo' && window.flixPlusUHD) {
                            window.flixPlusUHD.switchPlayerInfo();
                        } else if (fnName === 'switchStreamSelector' && window.flixPlusUHD) {
                            window.flixPlusUHD.switchStreamSelector();
                        }
                    } catch (e) {
                        console.error('FlixPlus: Failed to execute command', e);
                    }
                },
                args: [functionName]
            });
        } else {
            alert('Please navigate to Netflix first');
        }
    } catch (err) {
        console.error('Failed to execute in Netflix:', err);
        alert('Please refresh the Netflix page and try again');
    }
}

// Show feedback when settings change
function showFeedback() {
    const statusMsg = document.querySelector('.status-msg');
    const originalText = statusMsg.textContent;

    statusMsg.textContent = 'Settings saved! Refresh Netflix page.';
    statusMsg.style.color = '#46d369';

    setTimeout(() => {
        statusMsg.textContent = originalText;
        statusMsg.style.color = '';
    }, 2000);
}
