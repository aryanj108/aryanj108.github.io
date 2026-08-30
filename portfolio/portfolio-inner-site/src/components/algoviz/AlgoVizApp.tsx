import React, { useEffect, useState } from 'react';
import { Icon } from '../general';
import AboutPanel from './AboutPanel';
import { closeAudio, ensureAudio } from './audio';
import PathfindingPanel from './PathfindingPanel';
import { runSelfTest } from './selftest';
import SortingPanel from './SortingPanel';
import { Row, Tab } from './ui';

type Mode = 'sorting' | 'pathfinding' | 'about';

export interface AlgoVizAppProps {
    /** Content width/height of the host Window, used to resize the canvases. */
    width: number;
    height: number;
}

const AlgoVizApp: React.FC<AlgoVizAppProps> = ({ width, height }) => {
    const [mode, setMode] = useState<Mode>('sorting');
    const [soundOn, setSoundOn] = useState(false);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') runSelfTest();
        // Release the audio hardware when the window is closed.
        return closeAudio;
    }, []);

    const toggleSound = (): void => {
        if (!soundOn) ensureAudio(); // this click is the gesture that starts it
        setSoundOn((s) => !s);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#c3c6ca',
                padding: 8,
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            <Row style={{ marginBottom: 6, flexShrink: 0 }}>
                <Tab active={mode === 'sorting'} onClick={() => setMode('sorting')}>
                    Sorting
                </Tab>
                <Tab active={mode === 'pathfinding'} onClick={() => setMode('pathfinding')}>
                    Pathfinding
                </Tab>
                <Tab active={mode === 'about'} onClick={() => setMode('about')}>
                    About
                </Tab>

                <div style={{ display: 'flex', flex: 1 }} />

                <button
                    type="button"
                    onClick={toggleSound}
                    className="site-button"
                    title={soundOn ? 'Mute' : 'Enable sound'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'MSSerif',
                        fontSize: 11,
                        padding: '4px 10px',
                    }}
                >
                    <Icon icon={soundOn ? 'volumeOn' : 'volumeOff'} size={13} />
                    <span style={{ marginLeft: 6 }}>{soundOn ? 'Sound on' : 'Sound off'}</span>
                </button>
            </Row>

            {mode === 'sorting' ? (
                <SortingPanel width={width} height={height} soundOn={soundOn} />
            ) : mode === 'pathfinding' ? (
                <PathfindingPanel width={width} height={height} soundOn={soundOn} />
            ) : (
                <AboutPanel />
            )}
        </div>
    );
};

export default AlgoVizApp;
