/**
 * FlixPlus - Netflix UHD Enabler
 * Enables UHD/4K playback on any screen resolution
 * RESTRICTED TO: netflix.com only
 */

(function () {
    'use strict';

    // Security check - only run on Netflix
    if (!window.location.hostname.endsWith('netflix.com')) {
        console.warn('[FlixPlus UHD] Blocked: Not running on Netflix domain');
        return;
    }

    console.log('[FlixPlus UHD] Initializing...');

    const useWindowCtx = window;

    // Spoof screen resolution to 8K to unlock UHD content
    delete useWindowCtx.screen;
    useWindowCtx.__defineGetter__('screen', function () {
        let s = {};
        s.width = 7680;
        s.height = 4320;
        s.availWidth = 7680;
        s.availHeight = 4320;
        s.availLeft = 0;
        s.availTop = 0;
        s.colorDepth = 32;
        s.isExtended = false;
        s.pixelDepth = 32;
        return s;
    });

    // Spoof device pixel ratio for high-DPI displays
    delete useWindowCtx.devicePixelRatio;
    useWindowCtx.__defineGetter__('devicePixelRatio', function () {
        return 4;
    });

    // Hook MSMediaKeys for PlayReady DRM (Edge/IE)
    if (useWindowCtx.MSMediaKeys) {
        useWindowCtx.MSMediaKeys.isTypeSupportedWithFeaturesOriginal = useWindowCtx.MSMediaKeys.isTypeSupportedWithFeatures;
        useWindowCtx.MSMediaKeys.isTypeSupportedWithFeatures = function (keySystem, targetMediaCodec) {
            const reg = /,display-res-[x|y]=\d+,display-res-[x|y]=\d+/;
            targetMediaCodec = targetMediaCodec.replace(reg, "");

            let r = this.isTypeSupportedWithFeaturesOriginal(keySystem, targetMediaCodec);
            return r;
        };

        useWindowCtx.MSMediaKeys.isTypeSupportedOriginal = useWindowCtx.MSMediaKeys.isTypeSupported;
        useWindowCtx.MSMediaKeys.isTypeSupported = function (keySystem) {
            keySystem = keySystem.replace("com.microsoft.playready.hardware", "com.microsoft.playready");
            let r = this.isTypeSupportedOriginal(keySystem);
            return r;
        };

        useWindowCtx.MSMediaKeys.prototype.createSessionOriginal = useWindowCtx.MSMediaKeys.prototype.createSession;
        useWindowCtx.MSMediaKeys.prototype.createSession = function (targetMediaCodec, emptyArrayofInitData, int8ArrayCDMdata) {
            const reg = /,display-res-[x|y]=\d+,display-res-[x|y]=\d+/;
            targetMediaCodec = targetMediaCodec.replace(reg, "");
            return this.createSessionOriginal(targetMediaCodec, emptyArrayofInitData, int8ArrayCDMdata);
        };
    }

    // Hook WebKitMediaKeys (Safari)
    if (useWindowCtx.WebKitMediaKeys) {
        useWindowCtx.WebKitMediaKeys.isTypeSupportedOriginal = useWindowCtx.WebKitMediaKeys.isTypeSupported;
        useWindowCtx.WebKitMediaKeys.isTypeSupported = function (keySystem, type) {
            let r = this.isTypeSupportedOriginal(keySystem, type);
            return r;
        };
    }

    // Hook Widevine (Chrome/Firefox)
    if (useWindowCtx.navigator.requestMediaKeySystemAccess) {
        useWindowCtx.navigator.requestMediaKeySystemAccessOriginal = useWindowCtx.navigator.requestMediaKeySystemAccess;
        useWindowCtx.navigator.requestMediaKeySystemAccess = async function (keySystem, options) {
            let newKeySystem = keySystem;

            if (keySystem.indexOf("playready") !== -1) {
                try {
                    let r = await useWindowCtx.navigator.requestMediaKeySystemAccessOriginal(newKeySystem, options);
                    return r;
                } catch(e) {
                    console.warn("[FlixPlus UHD] Fallback PlayReady to SL");
                    newKeySystem = "com.microsoft.playready";
                }
            }

            let r = await useWindowCtx.navigator.requestMediaKeySystemAccessOriginal(newKeySystem, options);
            return r;
        };
    }

    // Hook MediaCapabilities API to report all formats as smooth and power efficient
    if (useWindowCtx.MediaCapabilities && useWindowCtx.MediaCapabilities.prototype) {
        useWindowCtx.MediaCapabilities.prototype.decodingInfoOriginal = useWindowCtx.MediaCapabilities.prototype.decodingInfo;
        useWindowCtx.MediaCapabilities.prototype.decodingInfo = function (mediaDecodingConfiguration) {
            let r = this.decodingInfoOriginal(mediaDecodingConfiguration);

            let p = new Promise((res, rej) => {
                r.then(orir => {
                    orir.powerEfficient = orir.supported;
                    orir.smooth = orir.supported;
                    res(orir);
                }).catch(ex => {
                    rej(ex);
                });
            });

            return p;
        };
    }

    // Expose utility functions for debug panel
    window.flixPlusUHD = {
        enabled: true,
        version: '1.0.0',
        switchPlayerInfo: function () {
            window.dispatchEvent(new KeyboardEvent('keydown', {
                keyCode: 68,
                ctrlKey: true,
                altKey: true,
                shiftKey: true,
            }));
        },
        switchStreamSelector: function () {
            window.dispatchEvent(new KeyboardEvent('keydown', {
                keyCode: 83,
                ctrlKey: true,
                altKey: true,
                shiftKey: true,
            }));
            window.dispatchEvent(new KeyboardEvent('keydown', {
                keyCode: 66,
                ctrlKey: true,
                altKey: true,
                shiftKey: true,
            }));
        }
    };

    console.log('[FlixPlus UHD] Initialized successfully');
})();
