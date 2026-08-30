import React, { useCallback, useEffect, useState } from 'react';
import Colors from '../../constants/colors';
import ShowcaseExplorer from '../applications/ShowcaseExplorer';
import Doom from '../applications/Doom';
import OregonTrail from '../applications/OregonTrail';
import ShutdownSequence from './ShutdownSequence';
// import ThisComputer from '../applications/ThisComputer';
import Henordle from '../applications/Henordle';
import Toolbar from './Toolbar';
import DesktopShortcut, { DesktopShortcutProps } from './DesktopShortcut';
import Scrabble from '../applications/Scrabble';
import AlgoViz from '../applications/AlgoViz';
import SkillsApp from '../applications/SkillsApp';
import { requestShowcaseRoute, resetShowcaseRoute } from '../../utils/appBus';
import { IconName } from '../../assets/icons';
// import Credits from '../applications/Credits';

export interface DesktopProps {}

type ExtendedWindowAppProps<T> = T & WindowAppProps;

// An entry either owns a window (`component`) or is an alias that routes an
// existing app to a path (`opens`) — Contact reuses the Showcase window rather
// than standing up a second copy of the form.
const APPLICATIONS: {
    [key in string]: {
        key: string;
        name: string;
        shortcutIcon: IconName;
        component?: React.FC<ExtendedWindowAppProps<any>>;
        opens?: { app: string; path: string };
    };
} = {
    // computer: {
    //     key: 'computer',
    //     name: 'This Computer',
    //     shortcutIcon: 'computerBig',
    //     component: ThisComputer,
    // },
    showcase: {
        key: 'showcase',
        name: 'My Showcase',
        shortcutIcon: 'showcaseIcon',
        component: ShowcaseExplorer,
    },
    trail: {
        key: 'trail',
        name: 'The Oregon Trail',
        shortcutIcon: 'trailIcon',
        component: OregonTrail,
    },
    doom: {
        key: 'doom',
        name: 'Doom',
        shortcutIcon: 'doomIcon',
        component: Doom,
    },
    scrabble: {
        key: 'scrabble',
        name: 'Scrabble',
        shortcutIcon: 'scrabbleIcon',
        component: Scrabble,
    },
    henordle: {
        key: 'henordle',
        name: 'Aryordle',
        shortcutIcon: 'henordleIcon',
        component: Henordle,
    },
    algoviz: {
        key: 'algoviz',
        name: 'AlgoViz',
        shortcutIcon: 'algovizIcon',
        component: AlgoViz,
    },
    skills: {
        key: 'skills',
        name: 'Skills',
        shortcutIcon: 'skillsIcon',
        component: SkillsApp,
    },
    contact: {
        key: 'contact',
        name: 'Contact',
        shortcutIcon: 'contactIcon',
        opens: { app: 'showcase', path: '/contact' },
    },
    // credits: {
    //     key: 'credits',
    //     name: 'Credits',
    //     shortcutIcon: 'credits',
    //     component: Credits,
    // },
};

/**
 * Highest z-index currently in use.
 *
 * Takes the window map as an argument rather than closing over state: the
 * desktop shortcut handlers are built once in a mount-only effect, so anything
 * that captured `windows` would keep seeing the empty map from first render and
 * every newly opened app would land at z-index 1, behind the others.
 */
const highestZ = (ws: DesktopWindows): number => {
    let top = 0;
    Object.keys(ws).forEach((key) => {
        const w = ws[key];
        if (w && w.zIndex > top) top = w.zIndex;
    });
    return top;
};

const Desktop: React.FC<DesktopProps> = (props) => {
    const [windows, setWindows] = useState<DesktopWindows>({});

    const [shortcuts, setShortcuts] = useState<DesktopShortcutProps[]>([]);

    const [shutdown, setShutdown] = useState(false);
    const [numShutdowns, setNumShutdowns] = useState(1);

    useEffect(() => {
        if (shutdown === true) {
            rebootDesktop();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shutdown]);

    useEffect(() => {
        const newShortcuts: DesktopShortcutProps[] = [];
        Object.keys(APPLICATIONS).forEach((key) => {
            const app = APPLICATIONS[key];
            newShortcuts.push({
                shortcutName: app.name,
                icon: app.shortcutIcon,
                onOpen: () => {
                    if (app.opens) {
                        requestShowcaseRoute(app.opens.path);
                        openOrFocus(app.opens.app);
                        return;
                    }
                    if (!app.component) return;
                    // Raise the app if it's already open (instead of
                    // remounting it) so an in-progress game or the Showcase's
                    // current page survives clicking its icon again — the
                    // same "raise, don't restart" behaviour a real desktop
                    // OS has. Showcase additionally resets to Home, but only
                    // in the fresh-open branch inside openOrFocus.
                    openOrFocus(
                        app.key,
                        app.key === 'showcase' ? resetShowcaseRoute : undefined
                    );
                },
            });
        });

        // Respects whatever URL the page loaded with (deep-link support for a
        // shared /os/<page> link) — unlike the shortcut's own onOpen above,
        // this intentionally does NOT reset the route.
        openOrFocus('showcase');

        setShortcuts(newShortcuts);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rebootDesktop = useCallback(() => {
        setWindows({});
    }, []);

    const removeWindow = useCallback((key: string) => {
        // Absolute hack and a half
        setTimeout(() => {
            setWindows((prevWindows) => {
                const newWindows = { ...prevWindows };
                delete newWindows[key];
                return newWindows;
            });
        }, 100);
    }, []);

    const minimizeWindow = useCallback((key: string) => {
        setWindows((prevWindows) => {
            const newWindows = { ...prevWindows };
            newWindows[key].minimized = true;
            return newWindows;
        });
    }, []);

    const toggleMinimize = useCallback((key: string) => {
        setWindows((prevWindows) => {
            const target = prevWindows[key];
            if (!target) return prevWindows;
            const top = highestZ(prevWindows);
            const minimized =
                target.minimized || target.zIndex === top
                    ? !target.minimized
                    : target.minimized;
            return {
                ...prevWindows,
                [key]: { ...target, minimized, zIndex: top + 1 },
            };
        });
    }, []);

    const onWindowInteract = useCallback(
        (key: string) => {
            setWindows((prevWindows) => {
                if (!prevWindows[key]) return prevWindows;
                return {
                    ...prevWindows,
                    [key]: {
                        ...prevWindows[key],
                        zIndex: highestZ(prevWindows) + 1,
                    },
                };
            });
        },
        []
    );

    const startShutdown = useCallback(() => {
        setTimeout(() => {
            setShutdown(true);
            setNumShutdowns(numShutdowns + 1);
        }, 600);
    }, [numShutdowns]);


    /**
     * Raise an app without remounting it. Reads window state through the
     * functional setState form because the shortcut closures are built in a
     * mount-only effect and would otherwise capture stale `windows`.
     */
    const openOrFocus = useCallback(
        (key: string, onFreshOpen?: () => void) => {
            setWindows((prevState) => {
                const highest = highestZ(prevState);

                // Already open: un-minimize and bring forward, keeping its route
                // and position. Re-adding it here would remount the router.
                if (prevState[key]) {
                    return {
                        ...prevState,
                        [key]: {
                            ...prevState[key],
                            minimized: false,
                            zIndex: highest + 1,
                        },
                    };
                }

                onFreshOpen?.();

                const target = APPLICATIONS[key];
                const Component = target?.component;
                if (!Component) return prevState;

                return {
                    ...prevState,
                    [key]: {
                        zIndex: highest + 1,
                        minimized: false,
                        component: (
                            <Component
                                onInteract={() => onWindowInteract(key)}
                                onMinimize={() => minimizeWindow(key)}
                                onClose={() => removeWindow(key)}
                                key={key}
                            />
                        ),
                        name: target.name,
                        icon: target.shortcutIcon,
                    },
                };
            });
        },
        [onWindowInteract, minimizeWindow, removeWindow]
    );

    return !shutdown ? (
        <div style={styles.desktop}>
            {/* For each window in windows, loop over and render  */}
            {Object.keys(windows).map((key) => {
                const element = windows[key].component;
                if (!element) return <div key={`win-${key}`}></div>;
                return (
                    <div
                        key={`win-${key}`}
                        style={Object.assign(
                            {},
                            { zIndex: windows[key].zIndex },
                            windows[key].minimized && styles.minimized
                        )}
                    >
                        {React.cloneElement(element, {
                            key,
                            onInteract: () => onWindowInteract(key),
                            onClose: () => removeWindow(key),
                        })}
                    </div>
                );
            })}
            <div style={styles.shortcuts}>
                {shortcuts.map((shortcut, i) => {
                    return (
                        <div
                            style={Object.assign({}, styles.shortcutContainer, {
                                top: i * 104,
                            })}
                            key={shortcut.shortcutName}
                        >
                            <DesktopShortcut
                                icon={shortcut.icon}
                                shortcutName={shortcut.shortcutName}
                                onOpen={shortcut.onOpen}
                            />
                        </div>
                    );
                })}
            </div>
            <Toolbar
                windows={windows}
                toggleMinimize={toggleMinimize}
                shutdown={startShutdown}
            />
        </div>
    ) : (
        <ShutdownSequence
            setShutdown={setShutdown}
            numShutdowns={numShutdowns}
        />
    );
};

const styles: StyleSheetCSS = {
    desktop: {
        minHeight: '100%',
        flex: 1,
        backgroundColor: Colors.turquoise,
    },
    shutdown: {
        minHeight: '100%',
        flex: 1,
        backgroundColor: '#1d2e2f',
    },
    shortcutContainer: {
        position: 'absolute',
    },
    shortcuts: {
        position: 'absolute',
        top: 16,
        left: 6,
    },
    minimized: {
        pointerEvents: 'none',
        opacity: 0,
    },
};

export default Desktop;
