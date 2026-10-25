import React, { useCallback, useEffect, useRef, useState } from 'react';
import eventBus from '../EventBus';
import { W, H, TICK_MS, drawScene } from './BeachVolleyball';

type LoadingProps = {};

const FONT_URL =
    'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';

// Pixel-art beach volleyball scene (see BeachVolleyball.ts), drawn on a small
// pixel grid and scaled up with sharp edges.
const PixelScene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scale] = useState(() =>
        Math.max(2, Math.min(5, Math.floor(Math.min(window.innerWidth - 48, 640) / W)))
    );

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        let tick = 0;
        drawScene(ctx, tick);
        const timer = setInterval(() => {
            tick++;
            drawScene(ctx, tick);
        }, TICK_MS);
        return () => clearInterval(timer);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={W}
            height={H}
            style={Object.assign({}, styles.scene, {
                width: W * scale,
                height: H * scale,
            })}
        />
    );
};

const LoadingScreen: React.FC<LoadingProps> = () => {
    const [progress, setProgress] = useState(0);
    const [overlayOpacity, setLoadingOverlayOpacity] = useState(1);
    const [webGLErrorOpacity, setWebGLErrorOpacity] = useState(0);
    const [webGLError, setWebGLError] = useState(false);
    const readyRef = useRef(false);

    useEffect(() => {
        // Pixel font (falls back to monospace if it can't be fetched).
        if (!document.getElementById('pixel-font')) {
            const link = document.createElement('link');
            link.id = 'pixel-font';
            link.rel = 'stylesheet';
            link.href = FONT_URL;
            document.head.appendChild(link);
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('debug')) {
            ready();
        } else if (!detectWebGLContext()) {
            setWebGLError(true);
        }
    }, []);

    useEffect(() => {
        eventBus.on('loadedSource', (data) => {
            setProgress(data.progress);
        });
    }, []);

    useEffect(() => {
        if (progress >= 1 && !webGLError) {
            ready();
        }
    }, [progress]);

    useEffect(() => {
        if (webGLError) {
            setTimeout(() => {
                setWebGLErrorOpacity(1);
            }, 500);
        }
    }, [webGLError]);

    // Everything is loaded: fade out the overlay and reveal the scene.
    const ready = useCallback(() => {
        if (readyRef.current) return;
        readyRef.current = true;

        setLoadingOverlayOpacity(0);
        eventBus.dispatch('sceneReady', {});
        const ui = document.getElementById('ui');
        if (ui) {
            ui.style.pointerEvents = 'none';
        }

        // The first user gesture starts the ambience and the interactive UI
        // (browsers block audio until the user interacts with the page).
        const events = ['mousedown', 'touchstart', 'keydown'];
        const onFirstGesture = () => {
            events.forEach((e) =>
                document.removeEventListener(e, onFirstGesture)
            );
            beginExperience();
        };
        events.forEach((e) => document.addEventListener(e, onFirstGesture));
    }, []);

    const beginExperience = useCallback(() => {
        eventBus.dispatch('loadingScreenDone', {});
    }, []);

    const detectWebGLContext = () => {
        var canvas = document.createElement('canvas');

        // Get WebGLRenderingContext from canvas element.
        var gl =
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl');
        // Report the result.
        if (gl && gl instanceof WebGLRenderingContext) {
            return true;
        }
        return false;
    };

    return (
        <div
            style={Object.assign({}, styles.overlay, {
                opacity: overlayOpacity,
            })}
        >
            {!webGLError && (
                <div style={styles.center}>
                    <PixelScene />
                    <div style={styles.percent}>
                        LOADING {Math.round(progress * 100)}%
                    </div>
                </div>
            )}
            {webGLError && (
                <div
                    style={Object.assign({}, styles.popupContainer, {
                        opacity: webGLErrorOpacity,
                    })}
                >
                    <div style={styles.errorPopup}>
                        <p>
                            <b style={{ color: 'red' }}>CRITICAL ERROR:</b> No
                            WebGL Detected
                        </p>
                        <div style={styles.spacer} />
                        <div style={styles.spacer} />

                        <p>WebGL is required to run this site.</p>
                        <p>
                            Please enable it or switch to a browser which
                            supports WebGL
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles: StyleSheetCSS = {
    overlay: {
        position: 'relative',
        backgroundColor: '#000',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        // slow, smooth fade into the 3D scene
        transition: 'opacity 1.4s ease-in-out',
        boxSizing: 'border-box',
    },
    center: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(16px, 3vh, 28px)',
    },
    scene: {
        imageRendering: 'pixelated',
        border: '3px solid #777',
        boxSizing: 'content-box',
    },
    percent: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 'clamp(9px, 1.2vw, 13px)',
        color: '#d0d0d0',
        letterSpacing: 1,
        // keep the width steady while the number changes
        minWidth: '16ch',
        textAlign: 'center',
    },
    spacer: {
        height: 16,
    },
    popupContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorPopup: {
        backgroundColor: '#000',
        padding: 24,
        border: '7px solid #fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: 500,
    },
};

export default LoadingScreen;
