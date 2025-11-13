/**
 * FlixPlus Security Monitor
 * Monitors and restricts potentially malicious behavior from injected scripts
 * RESTRICTED TO: netflix.com only
 */

(function() {
    'use strict';

    // Security check - only run on Netflix
    if (!window.location.hostname.endsWith('netflix.com')) {
        console.warn('[FlixPlus Security] Blocked: Not running on Netflix domain');
        return;
    }

    console.log('[FlixPlus Security] Initializing security monitor...');

    // Store original functions before they can be overridden
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest;
    const originalWebSocket = window.WebSocket;
    const originalLocalStorage = window.localStorage;
    const originalSessionStorage = window.sessionStorage;
    const originalIndexedDB = window.indexedDB;

    // Whitelist of allowed domains for network requests
    const ALLOWED_DOMAINS = [
        'netflix.com',
        'nflxext.com',
        'nflximg.net',
        'nflxvideo.net',
        'nflxso.net'
    ];

    // Check if a URL is allowed
    function isAllowedURL(url) {
        try {
            // Allow chrome-extension:// URLs (for our own extension files)
            if (url.startsWith('chrome-extension://')) {
                return true;
            }

            const urlObj = new URL(url, window.location.origin);
            const hostname = urlObj.hostname;

            // Allow same-origin requests
            if (hostname === window.location.hostname) {
                return true;
            }

            // Check against whitelist
            return ALLOWED_DOMAINS.some(domain =>
                hostname === domain || hostname.endsWith('.' + domain)
            );
        } catch (e) {
            console.error('[FlixPlus Security] Invalid URL:', url, e);
            return false;
        }
    }

    // Monitor and log suspicious network activity
    let suspiciousActivityCount = 0;
    const MAX_SUSPICIOUS_ACTIVITY = 10;

    function logSuspiciousActivity(type, url) {
        suspiciousActivityCount++;
        console.warn(`[FlixPlus Security] Suspicious ${type} to: ${url}`);

        if (suspiciousActivityCount > MAX_SUSPICIOUS_ACTIVITY) {
            console.error('[FlixPlus Security] Too many suspicious activities detected!');
            console.error('[FlixPlus Security] Please check the console and report this.');

            // Store warning in chrome storage
            chrome.storage.local.set({
                securityWarning: {
                    timestamp: Date.now(),
                    count: suspiciousActivityCount,
                    message: 'Suspicious network activity detected'
                }
            });
        }
    }

    // Wrap fetch to monitor network requests
    window.fetch = function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;

        if (url && !isAllowedURL(url)) {
            logSuspiciousActivity('fetch', url);
            console.warn('[FlixPlus Security] Blocked fetch to:', url);
            return Promise.reject(new Error('FlixPlus Security: Unauthorized network request blocked'));
        }

        return originalFetch.apply(this, args);
    };

    // Wrap XMLHttpRequest to monitor requests
    const OriginalXHROpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url, ...args) {
        if (url && !isAllowedURL(url)) {
            logSuspiciousActivity('XHR', url);
            console.warn('[FlixPlus Security] Blocked XHR to:', url);
            throw new Error('FlixPlus Security: Unauthorized network request blocked');
        }

        return OriginalXHROpen.apply(this, [method, url, ...args]);
    };

    // Monitor WebSocket connections
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(url, ...args) {
        if (!isAllowedURL(url)) {
            logSuspiciousActivity('WebSocket', url);
            console.warn('[FlixPlus Security] Blocked WebSocket to:', url);
            throw new Error('FlixPlus Security: Unauthorized WebSocket connection blocked');
        }

        return new OriginalWebSocket(url, ...args);
    };

    // Monitor localStorage access (prevent data exfiltration)
    const localStorageAccessCount = {};
    const LOCALSTORAGE_ACCESS_LIMIT = 100;

    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
        // Track access frequency
        localStorageAccessCount[key] = (localStorageAccessCount[key] || 0) + 1;

        if (localStorageAccessCount[key] > LOCALSTORAGE_ACCESS_LIMIT) {
            console.warn(`[FlixPlus Security] Excessive localStorage writes to key: ${key}`);
            logSuspiciousActivity('localStorage write', key);
        }

        // Log large data writes (potential exfiltration)
        if (value && value.length > 50000) {
            console.warn(`[FlixPlus Security] Large localStorage write (${value.length} bytes) to key: ${key}`);
        }

        return originalSetItem.call(this, key, value);
    };

    // Monitor document.cookie access
    const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    Object.defineProperty(document, 'cookie', {
        get: function() {
            return originalCookieDescriptor.get.call(this);
        },
        set: function(value) {
            // Log cookie modifications
            if (!value.includes('netflix.com') && !value.includes('nflx')) {
                console.warn('[FlixPlus Security] Suspicious cookie modification:', value);
                logSuspiciousActivity('cookie', value.substring(0, 50));
            }
            return originalCookieDescriptor.set.call(this, value);
        }
    });

    // Monitor eval() usage (potential code injection)
    const originalEval = window.eval;
    window.eval = function(code) {
        console.warn('[FlixPlus Security] eval() called, code length:', code.length);

        // Check for suspicious patterns
        const suspiciousPatterns = [
            /fetch\s*\(/,
            /XMLHttpRequest/,
            /WebSocket/,
            /document\.cookie/,
            /localStorage/,
            /sessionStorage/,
            /indexedDB/
        ];

        if (suspiciousPatterns.some(pattern => pattern.test(code))) {
            console.warn('[FlixPlus Security] Suspicious eval() detected!');
            logSuspiciousActivity('eval', code.substring(0, 100));
        }

        return originalEval.call(this, code);
    };

    // Monitor Function constructor (another way to inject code)
    const OriginalFunction = window.Function;
    window.Function = function(...args) {
        const code = args[args.length - 1];
        if (typeof code === 'string' && code.length > 1000) {
            console.warn('[FlixPlus Security] Large Function constructor call:', code.length);
        }
        return new OriginalFunction(...args);
    };

    // Prevent modification of security-critical functions
    Object.freeze(window.fetch);
    Object.freeze(XMLHttpRequest.prototype.open);
    Object.freeze(Storage.prototype.setItem);

    // Monitor for iframe creation (potential clickjacking/phishing)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'IFRAME') {
                    const src = node.src || node.getAttribute('src');
                    if (src && !isAllowedURL(src)) {
                        console.error('[FlixPlus Security] Suspicious iframe detected:', src);
                        logSuspiciousActivity('iframe', src);
                        node.remove();
                    }
                }
            });
        });
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // Periodic security health check
    setInterval(() => {
        // Check if our security hooks are still in place
        if (window.fetch !== originalFetch && typeof window.fetch === 'function') {
            // Our wrapper is still active
        } else {
            console.error('[FlixPlus Security] Security hooks may have been tampered with!');
        }

        // Report security status
        if (suspiciousActivityCount > 0) {
            chrome.storage.local.set({
                securityStatus: {
                    timestamp: Date.now(),
                    suspiciousActivities: suspiciousActivityCount,
                    status: suspiciousActivityCount > MAX_SUSPICIOUS_ACTIVITY ? 'warning' : 'monitoring'
                }
            });
        }
    }, 60000); // Every minute

    // Expose security API
    window.flixPlusSecurity = {
        enabled: true,
        version: '1.0.0',
        suspiciousActivityCount: () => suspiciousActivityCount,
        getAllowedDomains: () => [...ALLOWED_DOMAINS],
        getSecurityStatus: async () => {
            const status = await chrome.storage.local.get(['securityWarning', 'securityStatus']);
            return {
                monitoring: true,
                suspiciousActivities: suspiciousActivityCount,
                lastWarning: status.securityWarning,
                lastStatus: status.securityStatus
            };
        }
    };

    console.log('[FlixPlus Security] Security monitor active - protecting against unauthorized network requests');
    console.log('[FlixPlus Security] Allowed domains:', ALLOWED_DOMAINS);
})();
