// Modal Win95 dialog, used by Help > About and Help > How to play.
//
// Borrows the title bar and bevel treatment from Window.tsx so it reads as the
// same operating system, but stays deliberately small: no dragging, no
// resizing, no minimise. A dialog you can drag around is a window, and this is
// a dialog.

import React, { useEffect } from 'react';

export interface DialogProps {
    title: string;
    onClose: () => void;
    width?: number;
}

const Dialog: React.FC<DialogProps> = ({ title, onClose, width, children }) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey, false);
        return () => window.removeEventListener('keydown', onKey, false);
    }, [onClose]);

    return (
        <div style={styles.backdrop}>
            <div style={{ ...styles.frame, width: width || 340 }}>
                <div style={styles.outerBevel}>
                    <div style={styles.innerBevel}>
                        <div style={styles.titleBar}>
                            <span className="showcase-header" style={styles.titleText}>
                                {title}
                            </span>
                            <button
                                type="button"
                                onClick={onClose}
                                title="Close"
                                style={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={styles.body}>{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    backdrop: {
        display: 'flex',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        // No dimming: Win95 dialogs sat directly on top of their parent.
        backgroundColor: 'transparent',
    },
    frame: {
        display: 'flex',
        backgroundColor: '#c3c6ca',
    },
    outerBevel: {
        display: 'flex',
        flex: 1,
        border: '1px solid #000000',
        borderTopColor: '#c3c6ca',
        borderLeftColor: '#c3c6ca',
    },
    innerBevel: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        border: '1px solid #86898d',
        borderTopColor: '#ffffff',
        borderLeftColor: '#ffffff',
        padding: 3,
    },
    titleBar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 20,
        paddingLeft: 4,
        paddingRight: 2,
        backgroundColor: '#0000a3',
        flexShrink: 0,
    },
    titleText: {
        fontSize: 13,
    },
    closeButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 16,
        height: 14,
        padding: 0,
        border: 'none',
        borderRadius: 0,
        fontSize: 9,
        lineHeight: 1,
        cursor: 'pointer',
        color: '#000',
        backgroundColor: '#c3c6ca',
        boxShadow: 'var(--border-raised-outer), var(--border-raised-inner)',
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        padding: 14,
    },
};

export default Dialog;
