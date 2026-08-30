// A Win95 menu bar.
//
// Follows the close-on-outside-click idiom already used by Toolbar.tsx:61-75
// and Window.tsx:170-184 - a `lastClickInside` ref plus one window-level
// mousedown listener - rather than inventing a third approach.
//
// Menus are flat: sections are headings with radio-checked items underneath,
// the way Minesweeper put Beginner / Intermediate / Expert directly in its Game
// menu. No flyouts, which is both period-correct and a lot less code.

import React, { useCallback, useEffect, useRef, useState } from 'react';

export type MenuItem =
    | { kind: 'action'; label: string; onSelect: () => void; disabled?: boolean }
    | { kind: 'check'; label: string; checked: boolean; onSelect: () => void }
    | { kind: 'radio'; label: string; checked: boolean; onSelect: () => void }
    | { kind: 'heading'; label: string }
    | { kind: 'separator' };

export interface Menu {
    label: string;
    items: MenuItem[];
}

export interface MenuBarProps {
    menus: Menu[];
}

const MenuBar: React.FC<MenuBarProps> = ({ menus }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const lastClickInside = useRef(false);

    const onCheckClick = useCallback(() => {
        if (!lastClickInside.current) setOpenIndex(null);
        lastClickInside.current = false;
    }, []);

    useEffect(() => {
        window.addEventListener('mousedown', onCheckClick, false);
        return () => window.removeEventListener('mousedown', onCheckClick, false);
    }, [onCheckClick]);

    // Escape closes the menu, as it did in every Win95 app.
    useEffect(() => {
        if (openIndex === null) return;
        const onKey = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') setOpenIndex(null);
        };
        window.addEventListener('keydown', onKey, false);
        return () => window.removeEventListener('keydown', onKey, false);
    }, [openIndex]);

    const openMenu = (i: number): void => {
        lastClickInside.current = true;
        setOpenIndex((cur) => (cur === i ? null : i));
    };

    // Once a menu is open, sliding across the bar switches menus without a
    // second click - standard menu behaviour.
    const hoverMenu = (i: number): void => {
        if (openIndex !== null && openIndex !== i) setOpenIndex(i);
    };

    const choose = (item: MenuItem): void => {
        if (item.kind === 'heading' || item.kind === 'separator') return;
        if (item.kind === 'action' && item.disabled) return;
        setOpenIndex(null);
        item.onSelect();
    };

    return (
        <div style={styles.bar}>
            {menus.map((menu, i) => (
                <div key={menu.label} style={styles.menuAnchor}>
                    <div
                        style={{
                            ...styles.title,
                            ...(openIndex === i ? styles.titleOpen : null),
                        }}
                        onMouseDown={() => openMenu(i)}
                        onMouseEnter={() => hoverMenu(i)}
                    >
                        {menu.label}
                    </div>

                    {openIndex === i ? (
                        <div
                            style={styles.dropdown}
                            onMouseDown={() => {
                                lastClickInside.current = true;
                            }}
                        >
                            {menu.items.map((item, j) => {
                                if (item.kind === 'separator') {
                                    return <div key={j} style={styles.separator} />;
                                }
                                if (item.kind === 'heading') {
                                    return (
                                        <div key={j} style={styles.heading}>
                                            {item.label}
                                        </div>
                                    );
                                }
                                const marked =
                                    (item.kind === 'check' || item.kind === 'radio') &&
                                    item.checked;
                                const isDisabled = item.kind === 'action' && !!item.disabled;
                                return (
                                    <div
                                        key={j}
                                        className={isDisabled ? '' : 'start-menu-option'}
                                        style={{
                                            ...styles.item,
                                            ...(isDisabled ? styles.itemDisabled : null),
                                        }}
                                        onMouseDown={() => choose(item)}
                                    >
                                        <span style={styles.mark}>
                                            {marked ? (item.kind === 'radio' ? '•' : '✓') : ''}
                                        </span>
                                        <span>{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
};

const styles: StyleSheetCSS = {
    bar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        flexShrink: 0,
        height: 20,
        marginBottom: 4,
    },
    menuAnchor: {
        display: 'flex',
        position: 'relative',
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontFamily: 'MSSerif',
        fontSize: 11,
        color: '#000',
        cursor: 'pointer',
        userSelect: 'none',
    },
    titleOpen: {
        backgroundColor: '#0000aa',
        color: '#fff',
    },
    dropdown: {
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        top: 20,
        left: 0,
        minWidth: 168,
        zIndex: 500,
        padding: '2px 0',
        backgroundColor: '#c3c6ca',
        boxShadow: 'var(--border-raised-outer), var(--border-raised-inner)',
    },
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '3px 12px 3px 0',
        fontFamily: 'MSSerif',
        fontSize: 11,
        color: '#000',
        whiteSpace: 'nowrap',
        userSelect: 'none',
    },
    itemDisabled: {
        color: '#86898d',
        cursor: 'default',
    },
    mark: {
        display: 'inline-block',
        width: 18,
        textAlign: 'center',
        fontSize: 11,
    },
    heading: {
        display: 'flex',
        padding: '4px 12px 2px 8px',
        fontFamily: 'MSSerif',
        fontSize: 10,
        color: '#4c5257',
        whiteSpace: 'nowrap',
        userSelect: 'none',
    },
    separator: {
        display: 'flex',
        height: 1,
        margin: '3px 3px',
        borderTop: '1px solid #86898d',
        borderBottom: '1px solid #ffffff',
        flexShrink: 0,
    },
};

export default MenuBar;
