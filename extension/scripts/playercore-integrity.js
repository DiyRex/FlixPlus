/**
 * FlixPlus Playercore Integrity Checker
 * Verifies the integrity of cadmium-playercore.js before loading
 * RESTRICTED TO: netflix.com only
 */

(function() {
    'use strict';

    // Security check - only run on Netflix
    if (!window.location.hostname.endsWith('netflix.com')) {
        console.warn('[FlixPlus Integrity] Blocked: Not running on Netflix domain');
        return;
    }

    console.log('[FlixPlus Integrity] Initializing playercore integrity checker...');

    // Calculate SHA-256 hash of the playercore file
    async function calculateFileHash(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (error) {
            console.error('[FlixPlus Integrity] Error calculating hash:', error);
            return null;
        }
    }

    // Get the expected hash from storage (set on first load)
    async function getExpectedHash() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['playercoreHash'], (result) => {
                resolve(result.playercoreHash || null);
            });
        });
    }

    // Store the hash for future verification
    async function storeHash(hash) {
        return new Promise((resolve) => {
            chrome.storage.local.set({
                playercoreHash: hash,
                playercoreHashTimestamp: Date.now()
            }, resolve);
        });
    }

    // Verify playercore integrity
    async function verifyPlayercoreIntegrity() {
        const playercoreUrl = chrome.runtime.getURL('scripts/cadmium-playercore.js');

        console.log('[FlixPlus Integrity] Calculating playercore hash...');
        const currentHash = await calculateFileHash(playercoreUrl);

        if (!currentHash) {
            console.error('[FlixPlus Integrity] Failed to calculate hash');
            return { verified: false, reason: 'hash_calculation_failed' };
        }

        const expectedHash = await getExpectedHash();

        if (!expectedHash) {
            // First time loading - store the hash
            console.log('[FlixPlus Integrity] First load - storing hash for future verification');
            await storeHash(currentHash);
            await chrome.storage.local.set({
                playercoreFirstLoadDate: new Date().toISOString(),
                playercoreSize: await getFileSize(playercoreUrl)
            });

            return {
                verified: true,
                reason: 'first_load',
                hash: currentHash
            };
        }

        // Compare hashes
        if (currentHash === expectedHash) {
            console.log('[FlixPlus Integrity] ✓ Playercore integrity verified');
            return {
                verified: true,
                reason: 'hash_match',
                hash: currentHash
            };
        } else {
            console.error('[FlixPlus Integrity] ✗ Playercore integrity check FAILED!');
            console.error('[FlixPlus Integrity] Expected:', expectedHash);
            console.error('[FlixPlus Integrity] Got:', currentHash);

            // Store warning
            await chrome.storage.local.set({
                integrityWarning: {
                    timestamp: Date.now(),
                    expectedHash: expectedHash,
                    actualHash: currentHash,
                    message: 'Playercore file has been modified!'
                }
            });

            return {
                verified: false,
                reason: 'hash_mismatch',
                expectedHash: expectedHash,
                actualHash: currentHash
            };
        }
    }

    // Get file size
    async function getFileSize(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.headers.get('content-length') || 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    // Check file metadata
    async function getPlayercoreMetadata() {
        const playercoreUrl = chrome.runtime.getURL('scripts/cadmium-playercore.js');

        try {
            const response = await fetch(playercoreUrl);
            const text = await response.text();

            return {
                size: text.length,
                lineCount: text.split('\n').length,
                containsFlixPlus: text.includes('FlixPlus') || text.includes('videoElementNetflixPlus'),
                lastModified: response.headers.get('last-modified') || 'unknown'
            };
        } catch (error) {
            console.error('[FlixPlus Integrity] Error getting metadata:', error);
            return null;
        }
    }

    // Perform integrity check on load
    (async () => {
        const result = await verifyPlayercoreIntegrity();
        const metadata = await getPlayercoreMetadata();

        console.log('[FlixPlus Integrity] Verification result:', result);
        console.log('[FlixPlus Integrity] Metadata:', metadata);

        // Store the verification result
        await chrome.storage.local.set({
            lastIntegrityCheck: {
                timestamp: Date.now(),
                result: result,
                metadata: metadata
            }
        });

        // If verification failed, warn the user
        if (!result.verified && result.reason === 'hash_mismatch') {
            console.error('═══════════════════════════════════════════');
            console.error('⚠️  SECURITY WARNING');
            console.error('═══════════════════════════════════════════');
            console.error('The playercore file has been modified!');
            console.error('This could indicate tampering or corruption.');
            console.error('Please reinstall the extension from a trusted source.');
            console.error('═══════════════════════════════════════════');

            // Show notification to user
            if (document.body) {
                const warning = document.createElement('div');
                warning.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #ff4444;
                    color: white;
                    padding: 15px 25px;
                    border-radius: 8px;
                    z-index: 999999;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                `;
                warning.textContent = '⚠️ FlixPlus: Playercore integrity check failed! Check console for details.';
                document.body.appendChild(warning);

                setTimeout(() => warning.remove(), 10000);
            }
        }

        // Expose verification API
        window.flixPlusIntegrity = {
            verify: verifyPlayercoreIntegrity,
            getMetadata: getPlayercoreMetadata,
            getStoredHash: getExpectedHash,
            resetHash: async () => {
                await chrome.storage.local.remove(['playercoreHash', 'playercoreHashTimestamp']);
                console.log('[FlixPlus Integrity] Hash reset. Will be recalculated on next check.');
            },
            lastCheck: result
        };
    })();

    console.log('[FlixPlus Integrity] Integrity checker initialized');
})();
