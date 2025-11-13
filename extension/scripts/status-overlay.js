/**
 * FlixPlus Status Overlay
 * Shows real-time video/audio quality information
 * RESTRICTED TO: netflix.com only
 */

(function () {
    'use strict';

    // Security check - only run on Netflix
    if (!window.location.hostname.endsWith('netflix.com')) {
        console.warn('[FlixPlus Overlay] Blocked: Not running on Netflix domain');
        return;
    }

    console.log('[FlixPlus Overlay] Initializing status overlay...');

    let overlayVisible = false;
    let updateInterval = null;

    // Create overlay UI
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'flixplus-overlay';
        overlay.innerHTML = `
            <div class="flixplus-header">
                <span class="flixplus-title">FlixPlus Status</span>
                <button class="flixplus-close" id="flixplus-close">×</button>
            </div>
            <div class="flixplus-content">
                <div class="flixplus-section">
                    <div class="flixplus-label">Video Resolution</div>
                    <div class="flixplus-value" id="fp-resolution">Detecting...</div>
                </div>
                <div class="flixplus-section">
                    <div class="flixplus-label">Video Bitrate</div>
                    <div class="flixplus-value" id="fp-video-bitrate">Detecting...</div>
                </div>
                <div class="flixplus-section">
                    <div class="flixplus-label">Video Codec</div>
                    <div class="flixplus-value" id="fp-video-codec">Detecting...</div>
                </div>
                <div class="flixplus-section">
                    <div class="flixplus-label">Audio Bitrate</div>
                    <div class="flixplus-value" id="fp-audio-bitrate">Detecting...</div>
                </div>
                <div class="flixplus-section">
                    <div class="flixplus-label">Audio Codec</div>
                    <div class="flixplus-value" id="fp-audio-codec">Detecting...</div>
                </div>
                <div class="flixplus-section">
                    <div class="flixplus-label">DRM System</div>
                    <div class="flixplus-value" id="fp-drm">Detecting...</div>
                </div>
                <div class="flixplus-section">
                    <div class="flixplus-label">HDR/Dolby Vision</div>
                    <div class="flixplus-value" id="fp-hdr">Detecting...</div>
                </div>
                <div class="flixplus-section">
                    <div class="flixplus-label">Framerate</div>
                    <div class="flixplus-value" id="fp-framerate">Detecting...</div>
                </div>
            </div>
            <div class="flixplus-footer">
                <div class="flixplus-hint">Press Ctrl+Alt+Shift+D for Netflix debug info</div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close button handler
        document.getElementById('flixplus-close').addEventListener('click', hideOverlay);

        // Drag functionality
        makeElementDraggable(overlay);

        return overlay;
    }

    // Make overlay draggable
    function makeElementDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = element.querySelector('.flixplus-header');

        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Get video element
    function getVideoElement() {
        const videoElement = document.querySelector('video');
        return videoElement;
    }

    // Update overlay with current stats
    function updateStats() {
        const video = getVideoElement();

        if (!video) {
            document.getElementById('fp-resolution').textContent = 'No video playing';
            return;
        }

        // Resolution
        const width = video.videoWidth;
        const height = video.videoHeight;
        let resolutionText = `${width}x${height}`;
        if (height >= 2160) resolutionText += ' (4K UHD)';
        else if (height >= 1440) resolutionText += ' (2K QHD)';
        else if (height >= 1080) resolutionText += ' (1080p FHD)';
        else if (height >= 720) resolutionText += ' (720p HD)';
        document.getElementById('fp-resolution').textContent = resolutionText;

        // Framerate
        const fps = video.getVideoPlaybackQuality ?
            Math.round(video.getVideoPlaybackQuality().totalVideoFrames / video.currentTime) : 'N/A';
        document.getElementById('fp-framerate').textContent = fps !== 'N/A' ? `${fps} fps` : 'N/A';

        // Try to get Netflix debug info if available
        try {
            // Access Netflix's internal player API if available
            if (window.netflix && window.netflix.appContext) {
                const playerSessionId = window.netflix.appContext.state.playerApp?.getState()?.videoPlayer?.playbackStateBySessionId;
                if (playerSessionId) {
                    const sessionId = Object.keys(playerSessionId)[0];
                    const playbackState = playerSessionId[sessionId];

                    // Video bitrate
                    const videoBitrate = playbackState?.currentVideoBitrate;
                    if (videoBitrate) {
                        const mbps = (videoBitrate / 1000000).toFixed(2);
                        document.getElementById('fp-video-bitrate').textContent = `${mbps} Mbps`;
                    }

                    // Audio bitrate
                    const audioBitrate = playbackState?.currentAudioBitrate;
                    if (audioBitrate) {
                        const kbps = (audioBitrate / 1000).toFixed(0);
                        document.getElementById('fp-audio-bitrate').textContent = `${kbps} kbps`;
                    }
                }
            }
        } catch (e) {
            // Netflix API not accessible, use estimates
            const estimatedBitrate = estimateVideoBitrate(width, height);
            document.getElementById('fp-video-bitrate').textContent = estimatedBitrate;
        }

        // Codec detection from video element
        try {
            const videoTracks = video.videoTracks;
            if (videoTracks && videoTracks.length > 0) {
                document.getElementById('fp-video-codec').textContent = 'Available via debug';
            } else {
                document.getElementById('fp-video-codec').textContent = detectCodecFromResolution(width, height);
            }
        } catch (e) {
            document.getElementById('fp-video-codec').textContent = detectCodecFromResolution(width, height);
        }

        // Audio codec estimation
        document.getElementById('fp-audio-codec').textContent = detectAudioCodec(height);

        // DRM detection
        detectDRM();

        // HDR detection
        detectHDR(video);
    }

    // Estimate video bitrate based on resolution
    function estimateVideoBitrate(width, height) {
        if (height >= 2160) return '~15-25 Mbps';
        if (height >= 1440) return '~10-15 Mbps';
        if (height >= 1080) return '~5-8 Mbps';
        if (height >= 720) return '~3-5 Mbps';
        return '~1-3 Mbps';
    }

    // Detect likely codec based on resolution
    function detectCodecFromResolution(width, height) {
        if (height >= 2160) return 'Likely HEVC/VP9/AV1';
        if (height >= 1080) return 'Likely H.264/VP9';
        return 'Likely H.264';
    }

    // Detect likely audio codec
    function detectAudioCodec(videoHeight) {
        if (videoHeight >= 2160) return 'Likely DD+/Atmos';
        if (videoHeight >= 1080) return 'Likely DD+/AAC';
        return 'Likely AAC';
    }

    // Detect DRM system
    function detectDRM() {
        const video = getVideoElement();
        if (!video) return;

        try {
            const mediaKeys = video.mediaKeys;
            if (mediaKeys) {
                const keySystem = mediaKeys.keySystem;
                if (keySystem.includes('widevine')) {
                    document.getElementById('fp-drm').textContent = 'Widevine';
                } else if (keySystem.includes('playready')) {
                    document.getElementById('fp-drm').textContent = 'PlayReady';
                } else if (keySystem.includes('fairplay')) {
                    document.getElementById('fp-drm').textContent = 'FairPlay';
                } else {
                    document.getElementById('fp-drm').textContent = 'Unknown DRM';
                }
            } else {
                document.getElementById('fp-drm').textContent = 'None detected';
            }
        } catch (e) {
            document.getElementById('fp-drm').textContent = 'Detection failed';
        }
    }

    // Detect HDR
    function detectHDR(video) {
        try {
            // Check if video element has HDR metadata
            const videoTracks = video.videoTracks;
            let hdrText = 'SDR';

            // Try to detect from video capabilities
            if (window.matchMedia('(dynamic-range: high)').matches) {
                hdrText = 'HDR Capable';
            }

            // Check for Dolby Vision or HDR10 in the stream
            if (video.videoHeight >= 2160) {
                hdrText += ' (Possible DV/HDR10)';
            }

            document.getElementById('fp-hdr').textContent = hdrText;
        } catch (e) {
            document.getElementById('fp-hdr').textContent = 'Unknown';
        }
    }

    // Show overlay
    function showOverlay() {
        let overlay = document.getElementById('flixplus-overlay');
        if (!overlay) {
            overlay = createOverlay();
        }
        overlay.style.display = 'block';
        overlayVisible = true;

        // Start updating stats
        updateStats();
        updateInterval = setInterval(updateStats, 2000);
    }

    // Hide overlay
    function hideOverlay() {
        const overlay = document.getElementById('flixplus-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        overlayVisible = false;

        // Stop updating
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    }

    // Toggle overlay
    function toggleOverlay() {
        if (overlayVisible) {
            hideOverlay();
        } else {
            showOverlay();
        }
    }

    // Keyboard shortcut: Ctrl+Alt+Shift+F
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.shiftKey && e.keyCode === 70) {
            e.preventDefault();
            toggleOverlay();
        }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'toggleOverlay') {
            toggleOverlay();
            sendResponse({ success: true });
        } else if (message.type === 'updateSettings') {
            if (window.flixPlus) {
                window.flixPlus.updateSettings(message.settings);
            }
        }
    });

    // Expose API
    window.flixPlusOverlay = {
        show: showOverlay,
        hide: hideOverlay,
        toggle: toggleOverlay
    };

    console.log('[FlixPlus Overlay] Ready! Press Ctrl+Alt+Shift+F to toggle');
})();
